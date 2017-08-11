const sprintf = require('sprintf-js').sprintf;

class ConsoleFormatter
{
    constructor(name)
    {
        this.name = name;

        this.colors = require('colors/safe');
        this.colors.setTheme(require('../../LogTheme.js'));

        this.format = (opt) => `${opt.timestamp()} ${this.formatLevel(opt.level)} :: [${this.name || "Logger"}] ${opt.message}`;
        this.formatLevel = (level) => this.colors[level](sprintf("%-7s", level.toUpperCase()));
    }
}

module.exports = ConsoleFormatter;