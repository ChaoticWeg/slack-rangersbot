const Request = require('request');
const _       = require('lodash');

const Logger  = require('../Logger');
const Urls    = require('./urls.js');
const Codes   = require('./statusCodes.js');

class Gameday
{
    constructor()
    {
        this.logger = new Logger("Gameday", "debug");
    }

    getGamesByTeamId(id)
    {
        var self = this;

        return new Promise((resolve, reject) => {
            self.logger.verbose(`about to request schedule for team ${id}`);

            Request.get(Urls.getScheduleUrl(id), (err, res, raw) => {
                if (err)
                {
                    self.logger.error(err);
                    reject(err);
                }

                if (!raw)
                {
                    self.logger.warn(`received no schedule data for team ${id}`);
                    reject('no data');
                }

                var data = JSON.parse(raw);
                self.logger.debug(`received schedule data for team ${id}`);

                if (!data.totalGames)
                    return resolve([]);

                if (!data.dates || !Array.isArray(data.dates) || data.dates.length < 1)
                    return resolve([]);

                return resolve(data.dates[0].games || []);
            }); // end request
        }); // end promise
    }

    getCurrentGameForTeam(id)
    {
        return new Promise((resolve, reject) => {
            this
                .getGamesByTeamId(id).catch(reject)
                .then(games => {
                    if (games.length === 0) return resolve(null);
                    
                    var inProgress = _.filter(games, g => g.status.statusCode === Codes.InProgress);

                    if (inProgress.length === 0) return resolve(null);
                    if (inProgress.length  >  1) return reject('multiple games'); // TODO handle split squad

                    return resolve(inProgress[0]);
                });
        });
    }

    getNextGameForTeam(id)
    {
        return new Promise((resolve, reject) => {
            this
                .getGamesByTeamId(id).catch(reject)
                .then(games => {
                    // don't bother with an empty array
                    if (games.length === 0) return resolve(null);

                    var relevant = _.filter(games, g => g.status.statusCode === Codes.Scheduled);

                    if (relevant.length === 0) return resolve(null);
                    if (relevant.length === 1) return resolve(relevant[0]);

                    // if multiple games, look for the next one chronologically
                    // XXX does this work? compare gamePk values. lower ones (usually?) happen first.
                    var sorted = _.sortBy(games, g => g.gamePk);
                    return resolve(sorted[0]);
                });
        });
    }



}

module.exports = Gameday;