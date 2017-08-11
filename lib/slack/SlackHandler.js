const Secrets      = require('./secret/SlackSecrets.js');
const Logger       = require('../logging/Logger.js');
const Constants    = require('../Constants.js');
const SlackWebhook = require('slack-webhook');

var self = null;

class SlackHandler
{
    constructor()
    {
        self = this;

        self.logger = new Logger("Slack", Constants.Slack.LogLevel);
        self.slack  = new SlackWebhook(Secrets.WebhookUrl);
    }

    announce(message)
    {
        return new Promise((resolve, reject) => {
            self.logger.verbose(`Sending message to Slack: ${message}`);
            self.slack.send(message).then(res => resolve(res)).catch(err => reject(err));
        });
    }
}

module.exports = SlackHandler;