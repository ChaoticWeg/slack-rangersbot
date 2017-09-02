const Slack     = require('./lib/slack/SlackHandler.js');
const Watcher   = require('./lib/watcher/Watcher.js');
const Logger    = require('./lib/logging/Logger.js');
const Input     = require('./lib/logging/Input.js');
const Timestamp = require('./lib/Timestamp.js');
const Constants = require('./lib/Constants.js');

const fs        = require('fs');
const _         = require('lodash');

var logger  = new Logger("MAIN");
var watcher = new Watcher();
var slack   = new Slack();

watcher.on('data', data => {
    if (!data)
    {
        logger.warn("Data event fired, but there is no data");
        return;
    }

    logger.silly('Received data');
    fs.writeFileSync('./tmp/last-data.json', JSON.stringify(data, null, 4));

    if (data.liveData && data.liveData.players &&
        data.liveData.players.allPlayers &&
        Object.keys(data.liveData.players.allPlayers).length > 0)
    {
        slack.formatter.setPlayers(data.liveData.players.allPlayers);
    }

    if (!watcher.announcedOnline)
    {
        logger.verbose("Bot online, announcing it");
        watcher.announcedOnline = true;

        var message = "Bot online. ";
        var attachments = [];

        if (data.gameData.status.statusCode === "I")
        {
            message += `${data.liveData.linescore.inningState} ${data.liveData.linescore.currentInningOrdinal}: `;
            message += `${data.gameData.teams.away.name.abbrev} ${data.liveData.linescore.away.runs}, `;
            message += `${data.gameData.teams.home.name.abbrev} ${data.liveData.linescore.home.runs}.`;

            slack.announce(message);
        }

        else if (data.gameData.status.statusCode === "P")
        {
            message += `${data.gameData.media.title} from ${data.gameData.venue.name} in ${data.gameData.venue.location} `;
            message += `is set to begin at ${data.gameData.datetime.home.time} ${data.gameData.datetime.home.ampm} `;
            message += `${data.gameData.datetime.home.timeZone}.`;

            attachments.push({
                fallback: "Bot online",
                pretext: message,
                title: `${data.gameData.teams.away.name.abbrev} @ ${data.gameData.teams.home.name.abbrev}`,
                title_link: `mlb.com${data.gameData.links.preview}`
            });

            slack.announce(null, attachments);
        }
    }
});

watcher.on('play', play => {
    logger.info(`New play! ${slack.format(play.result.description)}`);
    slack.announcePlay(play);
});

watcher.on('inning', data => {
    if (!watcher.announcedOnline)
        return;

    logger.info(`Inning change! Now: ${data.liveData.linescore.inningState} ${data.liveData.linescore.currentInningOrdinal}`);
    slack.announceInningChange(data);
})


// START 

logger.info("Starting bot");
watcher.gameday.getGameByTeamId(Constants.TeamID).then(
    
    data => {
        if (!data.gamePk)
        {
            console.error("The requested team does not play today.");
            return;
        }

        watcher.start(data.gamePk);
    },

    err => {
        console.error(err);
    }

);