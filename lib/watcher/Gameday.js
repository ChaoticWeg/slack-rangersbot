const Logger    = require('../logging/Logger.js');
const Constants = require('../Constants.js');
const Timestamp = require('../Timestamp.js');

const Request   = require('request');
const Promise   = require('promise');

var GameUrl = (gameId) => `https://statsapi.mlb.com/api/v1/game/${gameId}/feed/live?language=en`;
var TeamScheduleUrl = (teamId) => `https://statsapi.mlb.com/api/v1/schedule?sportId=1&date=${Timestamp.schedule()}&teamId=${teamId}&language=en`;
var ContentUrl = (gameId) => `https://statsapi.mlb.com/api/v1/schedule?sportId=1&gamePk=${gameId}&hydrate=team,linescore,person,stats,game(content(media(epg)))&language=en`;

// if we do not receive useful data, return this instead
var DefaultData = () => {
    return {
        default: true,
        metaData: {
            timeStamp: moment().utc().format("YYYYMMDD_HHmmss"),
            wait: 60
        }
    };
};

var self = null;

/**
 * Makes calls to the MLB Gameday API
 */
class Gameday
{
    constructor()
    {
        self = this;

        self.logger  = new Logger("Gameday", Constants.Gameday.LogLevel);
    }

    getGameByTeamId(id)
    {
        return new Promise((resolve, reject) => {
            self.logger.debug(`Requesting today's schedule for team with ID: ${id}`);

            Request.get(TeamScheduleUrl(id), (err, res, raw) => {

                if (err)
                {
                    self.logger.error('Schedule request from MLB returned an error');
                    return reject(err);
                }

                if (!raw)
                {
                    self.logger.error('Schedule request from MLB returned no data');
                    return reject('no data');
                }

                var data = JSON.parse(raw);

                self.logger.verbose(`${data.totalGames} game(s) today`);

                if (data.totalGames === 0)
                {
                    self.logger.verbose(`Team #${id} does not play today`);
                    return resolve({});
                }

                return resolve(data.dates[0].games[0]);

            }); // end request callback
        }); // end promise executor
    }

    getGameData(gameId)
    {
        return new Promise((resolve, reject) => {
            self.logger.debug(`Requesting data for game ${gameId}`);

            Request.get(GameUrl(gameId), (err, res, raw) => {

                if (err)
                {
                    self.logger.error('Schedule request from MLB returned an error');
                    return reject(err);
                }

                if (!raw)
                {
                    self.logger.error('Schedule request from MLB returned no data');
                    return reject('no data');
                }

                var data = JSON.parse(raw);

                if (!data)
                {
                    self.logger.warn('Null data received from MLB');
                    return reject('no data');
                }

                return resolve(data);

            });
        });
    }

    getGameContent(gameId)
    {
        return new Promise((resolve, reject) => {
            self.logger.debug(`Requesting content related to game ${gameId}`);

            Request.get(ContentUrl(gameId), (err, res, raw) => {
                if (err)
                {
                    self.logger.error('Content request from MLB returned an error');
                    return reject(err);
                }

                if (!raw)
                {
                    self.logger.error('Content request from MLB returned no date');
                    return reject('no data');
                }

                var data = JSON.parse(raw);

                if (!data || !data.dates || !Array.isArray(data.dates) ||
                    !data.dates[0] || !data.dates[0].games ||
                    !Array.isArray(data.dates[0].games) || !data.dates[0].games[0])
                {
                    self.logger.warn('Null data received from MLB, or no such game');
                    return reject('no data');
                }

                return resolve(data.dates[0].games[0]);
            });
        })
    }
}

module.exports = Gameday;