const Logger        = require('./lib/Logger');
var   logger        = new Logger("CommandServer", "debug");

const CommandServer = require('./lib/CommandServer');
var   commandServer = new CommandServer();

exports.start = function() {
    commandServer.on('base',  () => logger.debug('base'));
    commandServer.on('start', () => logger.debug('start'));
    commandServer.on('stop',  () => logger.debug('stop'));

    commandServer.start();
};