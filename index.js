require('dotenv').config();

const Slack     = require('./lib/slack/SlackHandler.js');
const Watcher   = require('./lib/watcher/Watcher.js');
const Logger    = require('./lib/logging/Logger.js');
const Input     = require('./lib/logging/Input.js');
const Timestamp = require('./lib/Timestamp.js');
const Constants = require('./lib/Constants.js');
const CmdServer = require('./lib/commands/CommandServer.js');

const moment    = require('moment-timezone');
const _         = require('lodash');
const fs        = require('fs');


var logger  = new Logger("MAIN");
var watcher = new Watcher();
var slack   = new Slack();

var MediaUrl = (calId, mediaId) => `http://m.mlb.com/tv/e${calId}/v${mediaId}`;


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

        if (data.gameData.status.statusCode === "I")
        {
            message += `${data.liveData.linescore.inningState} ${data.liveData.linescore.currentInningOrdinal}: `;
            message += `${data.gameData.teams.away.name.abbrev} ${data.liveData.linescore.away.runs}, `;
            message += `${data.gameData.teams.home.name.abbrev} ${data.liveData.linescore.home.runs}.`;

            slack.announce(message);
        }

        else if (data.gameData.status.statusCode === "P" || data.gameData.status.statusCode === "S")
        {
            watcher.gameday.getGameContent(data.gameData.game.pk).then(contentData => {
                var startMoment = moment.tz(contentData.gameDate, "America/Chicago");

                var mediaTv = contentData.content.media.epg.filter(e => e.title === "MLBTV")[0].items;
                var mediaRadio = contentData.content.media.epg.filter(e => e.title === "Audio")[0].items;

                var homeMedia = {
                    tv: mediaTv.filter(i => i.mediaFeedType === "HOME" && i.language.toUpperCase() === "EN")[0],
                    radio: mediaRadio.filter(i => i.type === "HOME" && i.language.toUpperCase() === "EN")[0]
                };

                var awayMedia = {
                    tv: mediaTv.filter(i => i.mediaFeedType === "AWAY" && i.language.toUpperCase() === "EN")[0],
                    radio: mediaRadio.filter(i => i.type === "AWAY" && i.language.toUpperCase() === "EN")[0]
                };

                let attachments = [{
                    author_name: "MLB Gameday",
                    fallback: "Bot online.",

                    pretext: [`${contentData.teams.away.team.abbreviation} @ ${contentData.teams.home.team.abbreviation}`,
                        `from ${data.gameData.venue.name} is set to begin at ${startMoment.format("h:mm A z")}.`].join(' '),

                    title: `${contentData.teams.away.team.name} @ ${contentData.teams.home.team.name}`,
                    title_link: `https://www.mlb.com/gameday/${data.gameData.game.pk}`,

                    fields: [
                        {
                            short: true,
                            title: "Away",
                            value: [`${contentData.teams.away.team.name} (${data.gameData.teams.away.record.wins}-`,
                                `${data.gameData.teams.away.record.losses})\nMLB: `,
                                `<${MediaUrl(contentData.calendarEventID, awayMedia.tv.id)}|*Watch*> or `,
                                `<${MediaUrl(contentData.calendarEventID, awayMedia.radio.id)}|*Listen*>`].join('')
                        },
                        {
                            short: true,
                            title: "Home",
                            value: [`${contentData.teams.home.team.name} (${data.gameData.teams.home.record.wins}-`,
                                `${data.gameData.teams.home.record.losses})\nMLB: `,
                                `<${MediaUrl(contentData.calendarEventID, homeMedia.tv.id)}|*Watch*> or `,
                                `<${MediaUrl(contentData.calendarEventID, homeMedia.radio.id)}|*Listen*>`].join('')
                        },
                        {
                            short: true,
                            title: "Venue",
                            value: [`${data.gameData.venue.name}`, (typeof data.gameData.venue.location == 'string' ? data.gameData.venue.location :
                                `${data.gameData.venue.location.city}, ${data.gameData.venue.location.stateAbbrev}`)].join('\n')
                        },
                        {
                            short: true,
                            title: "Conditions",
                            value: Object.keys(data.gameData.weather).length === 0 ? "TBD\n" : [`${data.gameData.weather.condition},`,
                                `${data.gameData.weather.temp}°F\n${data.gameData.weather.wind}`].join(' ')
                        }
                    ],

                    mrkdwn_in: [ "fields" ],
                    footer: `${contentData.teams.away.team.abbreviation} @ ${contentData.teams.home.team.abbreviation}`,
                    ts: startMoment.unix()
                }];

                return slack.announce(null, attachments);
            }).catch(err => {
                if (err) console.error(err);
            }).done(() => {
                logger.verbose("Sent pre-game greeting");
            });
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
});


// COMMAND SERVER

var cmdServer = new CmdServer(watcher);

cmdServer.on('unknown', (req) => logger.warn('unknown command!'));


// START 

logger.info("Starting bot");
cmdServer.listen(process.env.CmdServerPort);
