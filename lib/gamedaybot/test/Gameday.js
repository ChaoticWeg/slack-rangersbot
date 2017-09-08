const chai           = require('chai');
const chaiAsPromised = require('chai-as-promised');

const Gameday = require('../lib/Gameday');

describe('Gameday', function () {

    var gameday = null;

    beforeEach(function () {
        gameday = new Gameday();
    });

    describe('#getGamesByTeamId()', function () {
        
        // it("receives data");

    });

});
