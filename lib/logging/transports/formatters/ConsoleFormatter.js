const sprintf = require('sprintf-js').sprintf;

class ConsoleFormatter
{
    constructor()
    {
        this.colors = require('colors/safe');
        this.colors.setTheme(require('../../LogTheme.js'));

        this.format = (opt) => `${opt.timestamp()} ${this.formatLevel(opt.level)} :: ${opt.message}`;
        this.formatLevel = (level) => this.colors[level](sprintf("%-7s", level.toUpperCase()));
    }
}

module.exports = ConsoleFormatter;