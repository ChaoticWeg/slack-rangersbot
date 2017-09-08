const express = require('express');
const bParser = require('body-parser');

function create(parent)
{
    var result = express();
    result.use(bParser.urlencoded({ extended: true }));

    require('./routing.js').route(result, parent);

    return result;
};

module.exports = parent => create(parent);