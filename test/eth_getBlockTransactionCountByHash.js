var config = require('../lib/config'),
    Helpers = require('../lib/helpers'),
    assert = require('chai').assert,
    _ = require('underscore');

// METHOD
var method = 'eth_getBlockTransactionCountByHash';


// TEST
var asyncTest = function(host, done, params, expectedResult){
    Helpers.send(host, {
        id: config.rpcMessageId++, jsonrpc: "2.0", method: method,
        
        // PARAMETERS
        params: params

    }, function(result, status) {

        
        assert.equal(status, 200, 'has status code');
        assert.property(result, 'result', (result.error) ? result.error.message : 'error');
        assert.isString(result.result, 'is string');
        assert.match(result.result, /^0x/, 'is hex');
        assert.isNumber(+result.result, 'can be converted to a number');

        assert.equal(+result.result, expectedResult, 'should be '+ expectedResult);

        done();
    });
};


var asyncErrorTest = function(host, done){
    Helpers.send(host, {
        id: config.rpcMessageId++, jsonrpc: "2.0", method: method,
        
        // PARAMETERS
        params: []

    }, function(result, status) {

        assert.equal(status, 200, 'has status code');
        assert.property(result, 'error');
        assert.equal(result.error.code, -32602);

        done();
    });
};


describe(method, function(){

    Helpers.eachHost(function(key, host){
        describe(key, function(){
            _.each(config.testBlocks.blocks, function(block){
                it('should return '+block.transactions.length+' as a hexstring', function(done){
                    asyncTest(host, done, ['0x'+ block.blockHeader.hash], block.transactions.length);
                });
            });

            it('should return null if the block doesnt exist', function(done){
                asyncTest(host, done, ['0x534583587638756834765876348756348563487658374587346587'], null);
            });

            it('should return an error when no parameter is passed', function(done){
                asyncErrorTest(host, done);
            });
        });
    });
});
