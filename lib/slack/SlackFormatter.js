const Logger = require('../logging/Logger.js');
const _      = require('lodash');

var self = null;

class SlackFormatter
{
    constructor(players)
    {
        self = this;
        self.logger = new Logger("SlackFormatter");
        self._players = players;
    }

    get players() { return self._players; }

    cleanupString(str)
    {
        return str.replace(/\s+/g, ' ').trim();
    }

    setPlayers(players)
    {
        if (!players)
            return;

        self.logger.debug("Updating players");
        self._players = players;
    }

    getPlayer(id)
    {
        if (!self.players)
        {
            self.logger.warn("Tried to lookup a player, but we have none");
            return null;
        }

        // pick only players with matching ID (should only be one), then get just the values
        var matches = _.values(_.pickBy(self.players, p => p.id === id));

        if (!matches || !Array.isArray(matches) || matches.length < 1)
            return null;

        return matches[0];
    }

    getBagNameByID(bagID)
    {
        switch(bagID.toUpperCase())
        {
            case "1B": return "first";
            case "2B": return "second";
            case "3B": return "third";
            case "score": return "home plate";
            default: return null;
        }
    }

    formatRunners(runners)
    {
        var result = "";

        // display runners
        if (runners && Array.isArray(runners) && runners.length > 0)
        {
            var scorersObj = _.pickBy(runners, r => r.details && r.details.isScoringEvent);
            var scorers    = _.values(scorersObj);

            if (scorers && Array.isArray(scorers) && scorers.length > 1)
            {
                result += `${scorers.length} score.`;
                runners = _.omit(runners, scorers);
            }

            // need a standard for-loop here, to ensure proper order
            for (var i = 0; i < runners.length; i++)
                result += self.formatRunner(runners[i]);
        }

        return result;
    }

    formatRunner(runner)
    {
        var result = "";

        if (self.players && runner && runner.movement &&
            runner.movement.start && runner.movement.start !== "" &&
            runner.movement.end && runner.movement.end !== "")
        {
            var player = self.getPlayer(runner.details.runner);
            result += ` ${player.name.first} ${player.name.last} `;

            // intentionally redundant
            if (runner.details.isScoringEvent || runner.movement.end === "score")
                result += "scores.";

            else
                result += `to ${self.getBagNameByID(runner.movement.end) || "advance"}.`;
        }

        return result;
    }

    formatPlay(play)
    {
        if (!self.players || !play || !play.result || !play.result.event || play.result.event === "")
            return null;

        var result = "";
        var needsRunners = true;
        var needsScorers = true;
        var isDefault = false;

        if (!play.matchup || !play.matchup.batter || !play.matchup.pitcher)
            return null;

        var batter  = self.getPlayer(play.matchup.batter);
        var pitcher = self.getPlayer(play.matchup.pitcher);

        var hit = null;

        var hitEvents = _.pickBy(play.playEvents, e => e.hitData !== null);
        if (hitEvents && Array.isArray(hitEvents) && hitEvents.length > 0)
            hit = hitEvents[0];

        switch (play.result.event.toUpperCase())
        {
            case "WALK":
                result += `${pitcher.name.first} ${pitcher.name.last} walks ${batter.name.first} ${batter.name.last} `;
                result += `on ${play.pitches.length} pitches`;
                break;
            
            case "HOME RUN":
                // all runners score. no need.
                needsRunners = false;

                result += `${batter.name.first} ${batter.name.last} hits a `;
                
                switch (play.result.rbi)
                {
                    case 1:
                        result += "solo HR";
                        break;
                    case 2:
                    case 3:
                        result += `${play.result.rbi}-run HR`;
                        break;
                    case 4:
                        result += "grand slam";
                        break;
                    default:
                        result += "HR";
                        break;
                }

                break;
            
            case "SAC FLY":
                result += `${batter.name.first} ${batter.name.last} hits a `;

                if (Number.parseInt(hit.totalDistance) > 300)
                    result += "long ";

                result += "sac fly";
                break;
            
            case "FLYOUT":
                result += `${batter.name.first} ${batter.name.last} flies out`;
                break;
            
            case "SINGLE":
                result += `${batter.name.first} ${batter.name.last} singles`;
                break;
            
            case "DOUBLE":
                result += `${batter.name.first} ${batter.name.last} doubles`;
                break;
            
            case "GROUNDOUT":
                result += `${batter.name.first} ${batter.name.last} grounds out`;
                break;
            
            case "POP OUT":
                result += `${batter.name.first} ${batter.name.last} pops out`;
                break;

            // TODO - more plays

            // default to the MLB-provided description
            default:
                isDefault = true;
                needsRunners = false;
                result += play.result.description;
                break;
        }

        if (!isDefault) result += ". ";

        if (needsRunners) result += self.formatRunners(play.runners);
        
        // clean up, just to be safe
        return self.cleanupString(result);
    }

    formatInningChange(data)
    {
        var result = `${data.liveData.linescore.inningState} ${data.liveData.linescore.currentInningOrdinal}: `;
        result += `${data.gameData.teams.away.name.abbrev} ${data.liveData.linescore.away.runs}, `;
        result += `${data.gameData.teams.home.name.abbrev} ${data.liveData.linescore.home.runs}.`;

        return result;
    }

};

module.exports = SlackFormatter;