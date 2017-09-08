const Readline = require('readline');
const Promise  = require('promise');

const rl = Readline.createInterface({ input: process.stdin });

exports.getInt = function (str)
{
    return new Promise((resolve, reject) => {
        rl.question(str, raw => {
            var parsed = Number.parseInt(raw);

            if (parsed)
                return resolve(parsed);
            else
                return reject(parsed);
        });
    });
};