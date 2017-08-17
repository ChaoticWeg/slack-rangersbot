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

        self.logger.verbose("Updating players");
        self._players = players;
    }

    getPlayer(id)
    {
        if (!self.players) return null;

        // pick only players with matching ID, then get just the values
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
        }
    }

    formatRunners(runners)
    {
        var result = "";

        // display runners
        if (runners && Array.isArray(runners) && runners.length > 0)
        {
            // need a standard for-loop here, to ensure proper order
            for (var i = 0; i < runners.length; i++)
                result += self.formatRunner(runners[i]);
        }

        return result;
    }

    formatRunner(runner)
    {
        var result = "";

        if (self.players && runner && runner.movement && runner.movement.start && runner.movement.start !== "")
        {
            var player = self.getPlayer(runner.details.runner);
            result += `${player.name.first} ${player.name.last} `;

            // these conditions may seem redundant, but let me learn you a thing...
            if (runner.details.isScoringEvent || runner.movement.end === "score")
                result += "scores.";

            else
                result += `moves to ${self.getBagNameByID()}.`;
        }

        return result;
    }

    formatPlay(play)
    {
        if (!self.players || !play || !play.result || !play.result.event || play.result.event === "")
            return null;

        var result = "";
        var needsRunners = true;
        var isDefault = false;

        if (!play.matchup || !play.matchup.batter || !play.matchup.pitcher)
            return null;

        var batter  = self.getPlayer(play.matchup.batter);
        var pitcher = self.getPlayer(play.matchup.pitcher);

        switch (play.result.event.toUpperCase())
        {
            case "WALK":
                result += `${pitcher.name.first} ${pitcher.name.last} walks ${batter.name.first} ${batter.name.last} `;
                result += `on ${play.pitches.length} pitches.`;
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

                result += ".";
                break;
            
            case "SAC FLY":
                result += `${batter.name.first} ${batter.name.last} hits a sac fly to `;
                break;

            // TODO - more plays

            // default to the MLB-provided description
            default:
                isDefault = true;
                needsRunners = false;
                result += play.result.description;
                break;
        }

        if (needsRunners) result += self.formatRunners(play.runners);
        
        // clean up, just to be safe
        return self.cleanupString(result);
    }

};

module.exports = SlackFormatter;