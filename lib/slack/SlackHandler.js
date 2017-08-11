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
        self.logger.verbose(`Sending message to Slack: ${message}`);
        self.slack.send(message).then(self.onMessageSent).catch(self.onMessageFailed);
    }

    onMessageSent(res)
    {
        self.logger.debug('Message sent');
    }

    onMessageFailed(err)
    {
        self.logger.error(err);
    }
}

module.exports = SlackHandler;