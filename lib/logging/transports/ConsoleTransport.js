const Winston = require('winston');
const Options = require('./options/ConsoleTransportOptions.js');

module.exports = (() => new Winston.transports.Console(new Options()))();