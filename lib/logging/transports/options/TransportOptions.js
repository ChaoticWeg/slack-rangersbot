const moment = require('moment');

var _defaultTimestamp = () => moment().format("YYYY-MM-DD HH:mm:ss");

class TransportOptions
{
    constructor(formatter, timestamp = _defaultTimestamp)
    {
        if (formatter)
        {
            this.formatterObj = formatter;
            this.formatter = this.formatterObj.format;
        }
        this.timestamp = timestamp;
    }
}

module.exports = TransportOptions;