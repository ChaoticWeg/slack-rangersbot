const TransportOptions = require('./TransportOptions.js');
const ConsoleFormatter = require('../formatters/ConsoleFormatter.js');

const moment = require('moment');

class ConsoleTransportOptions extends TransportOptions
{
    constructor()
    {
        super(new ConsoleFormatter());
    }
}

module.exports = ConsoleTransportOptions;