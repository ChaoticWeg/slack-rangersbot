const Slack     = require('./lib/slack/SlackHandler.js');
const Watcher   = require('./lib/watcher/Watcher.js');
const Logger    = require('./lib/logging/Logger.js');
const Timestamp = require('./lib/Timestamp.js');
const Constants = require('./lib/Constants.js');
const Readline  = require('readline');
const fs        = require('fs');

var logger  = new Logger("MAIN");
var watcher = new Watcher();
var slack   = new Slack();

watcher.on('start', () => {
    slack.announce('Bot online');
});

watcher.on('data', data => {
    logger.silly('Received data');
    fs.writeFileSync('./tmp/last-data.json', JSON.stringify(data, null, 4));

    if (data && data.liveData && data.liveData.players &&
        data.liveData.players.allPlayers &&
        Object.keys(data.liveData.players.allPlayers).length > 0)
    {
        slack.formatter.setPlayers(data.liveData.players.allPlayers);
    }
});

watcher.on('play', play => {
    logger.info(`New play! ${slack.format(play.result.description)}`);
    slack.announcePlay(play);
});

var teamID = Constants.TeamID; // default to provided
const rl   = Readline.createInterface({ input: process.stdin, output: process.stdout });

rl.question(`Team ID (default: ${teamID}) > `, raw => {
    var parsed = Number.parseInt(raw, 10);

    if (parsed)
        teamID = parsed;

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
});