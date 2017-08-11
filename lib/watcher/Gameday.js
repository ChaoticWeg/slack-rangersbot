const Timestamp = require('../Timestamp.js');
const Logger    = require('../logging/Logger.js');

const Request   = require('request');
const Promise   = require('promise');

var GameUrl = (gameId) => `https://statsapi.mlb.com/api/v1/game/${gameId}/feed/live?language=en`;
var TeamScheduleUrl = (teamId) => `https://statsapi.mlb.com/api/v1/schedule?sportId=1&date=${Timestamp.schedule()}&teamId=${teamId}&language=en`

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
    constructor(watcher)
    {
        self = this;

        self.watcher = watcher;
        self.logger  = new Logger("Gameday");
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
}

module.exports = Gameday;