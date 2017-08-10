const Winston = require('winston');
const Colors  = require('colors/safe');

class Logger
{
    constructor(name, level = 'debug')
    {
        this.inner = new Winston.Logger({
            level: level,
            transports: [
                require('./transports/ConsoleTransport.js')
            ]
        });
    }

    error(message)   { this.inner.error(message);   }
    warn(message)    { this.inner.warn(message);    }
    info(message)    { this.inner.info(message);    }
    verbose(message) { this.inner.verbose(message); }
    debug(message)   { this.inner.debug(message);   }
    silly(message)   { this.inner.silly(message);   }
}

module.exports = Logger;