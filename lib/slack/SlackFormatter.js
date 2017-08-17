const _  = require('lodash');

var self = null;

class SlackFormatter
{
    constructor(players)
    {
        self = this;
        self._players = players;
    }

    get players() { return self._players; }

    cleanupString(str)
    {
        return str.replace(/\\s+/g, ' ').trim();
    }

    setPlayers(players)
    {
        if (!players)
            return;

        self._players = players;
    }

    getPlayer(id)
    {
        // pick only players with matching ID, then get just the values
        var matches = _.values(_.pickBy(self.players, p => p.id === id));

        if (!matches || !Array.isArray(matches) || matches.length < 1)
            return null;

        return matches[0];
    }

    getBagNameByID(bagID)
    {
        switch(bagID.toUpper())
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

        if (runner && runner.movement && runner.movement.start && runner.movement.start !== "")
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
        if (!play || !players) return null;

        var result = "";
        var needsRunners = true;
        var isDefault = false;

        switch (play.result.event.toUpper())
        {
            case "WALK":
                var batter  = self.getPlayer(play.matchup.batter);
                var pitcher = self.getPlayer(play.matchup.pitcher);

                result += `${pitcher.name.first} ${pitcher.name.last} walks ${batter.name.first} ${batter.name.last} `;
                result += `on ${play.pitches.length} pitches.`;

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