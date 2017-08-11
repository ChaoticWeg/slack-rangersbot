const Winston = require('winston');
const Options = require('./options/ConsoleTransportOptions.js');

exports.new = name => new Winston.transports.Console(new Options(name));