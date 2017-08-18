const Slack     = require('./lib/slack/SlackHandler.js');
const Watcher   = require('./lib/watcher/Watcher.js');
const Logger    = require('./lib/logging/Logger.js');
const Input     = require('./lib/logging/Input.js');
const Timestamp = require('./lib/Timestamp.js');
const Constants = require('./lib/Constants.js');

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


if (Constants.Debug)
    begin(Constants.DebugTeamID);
else
    Input.getInt(`Team ID (default: ${Constants.TeamID}) > `).then(begin).catch(logger.error);


function begin(teamID)
{
    watcher.gameday.getGameByTeamId(teamID).then(
        
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
};