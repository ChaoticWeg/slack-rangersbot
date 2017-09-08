const CommandServer = require('./lib/CommandServer');
var commandServer = new CommandServer();

commandServer.on('base',  () => console.log('base'));
commandServer.on('start', () => console.log('start'));
commandServer.on('stop',  () => console.log('stop'));

commandServer.start();