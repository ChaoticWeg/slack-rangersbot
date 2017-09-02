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

    announce(str)
    {
        return new Promise((resolve, reject) => {
            self.logger.debug(`Sending message: ${str}`);
            
            self.slack.send(str).then(res => {
                self.logger.verbose('Message sent');
                resolve(res);
            }).catch(err => reject(err));
        });
    }

    announcePlay(play)
    {
        self.logger.debug("Formatting play");
        var message = self.formatter.formatPlay(play);

        if (!message)
        {
            self.logger.warn("Unable to format play. Rejecting.");
            return;
        }

        return self.announce(message);
    }

    announceInningChange(data)
    {
        self.logger.debug("Formatting inning change");
        var message = self.formatter.formatInningChange(data);

        if (!message)
        {
            self.logger.warn("Unable to format inning change. Rejecting.");
            return null;
        }

        return self.announce(message);
    }

    format(message)
    {
        return message.replace(/\\s+/, ' ').trim();
    }
}

module.exports = SlackHandler;