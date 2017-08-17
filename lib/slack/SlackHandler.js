const Secrets         = require('./secret/SlackSecrets.js');
const Logger          = require('../logging/Logger.js');
const SlackFormatter  = require('./SlackFormatter.js');
const Constants       = require('../Constants.js');
const SlackWebhook    = require('slack-webhook');

var self = null;

class SlackHandler
{
    constructor()
    {
        self = this;
        self.formatter = new SlackFormatter();

        self.logger = new Logger("Slack", Constants.Slack.LogLevel);
        self.slack  = new SlackWebhook(Secrets.DebugWebhookUrl, Secrets.Defaults);
    }

    announce(play)
    {
        return new Promise((resolve, reject) => {
            var message = self.formatter.formatPlay(play);

            if (!message)
            {
                self.logger.warn(`Unable to format play. Rejecting.`);
                return reject("Unable to format play");
            }

            self.logger.verbose(`Sending: ${message}`);

            self.slack.send(message).then(res => {
                self.logger.verbose('Message sent');
                resolve(res);
            }).catch(err => reject(err));
        });
    }

    format(message)
    {
        return message.replace(/\\s+/, ' ').trim();
    }
}

module.exports = SlackHandler;