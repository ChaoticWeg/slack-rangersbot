var config = require('config');

exports.route = function (app, emitter)
{
    if (!app.emit)
        throw "App must be an EventEmitter";

    if (!config.has('CommandServer.postPath'))
        throw "No postPath entry found in config";

    app.post(config.get('CommandServer.postPath'), (req, res) => {

        // verify slack token from request
        if (config.has("CommandServer.incomingSlackToken"))
        {
            if (config.get("CommandServer.incomingSlackToken") !== req.body.token)
            {
                res.status(401).end('Invalid token');
                return;
            }
        }

        // message is now verified to contain the token specified in config/<env>.json

        var args = req.body.text ? req.body.text.split(' ') : [];

        if (!args[0] || args[0].toUpperCase() === "HELP")
        {
            res.status(200).end('Commands: start, stop, help');
            return;
        }

        // TODO permission system, verify that user has permission
        switch (args[0].toUpperCase())
        {
            case "START":
                emitter.emit('start', req, args);
                break;
            
            case "STOP":
                emitter.emit('stop', req, args);
                break;

            default:
                res.status(200).send('Unknown command: ' + args[0] + '\nUse "/bot help" for help.');
                return;
        }

        res.status(200).end();
        
    });

    return app;
}
