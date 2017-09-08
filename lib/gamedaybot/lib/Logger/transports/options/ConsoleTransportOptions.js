const TransportOptions = require('./TransportOptions.js');
const ConsoleFormatter = require('../formatters/ConsoleFormatter.js');

const moment = require('moment');

class ConsoleTransportOptions extends TransportOptions
{
    constructor(name)
    {
        super(new ConsoleFormatter(name));
    }
}

module.exports = ConsoleTransportOptions;