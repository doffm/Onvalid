
(function () {
    var ov = __ = require ('onvalid');
    var assert = require ('assert');
    
    exports['test lte'] = function () {
        var schema = {
            foo: __.lte (5)
        };
        assert.ok (ov.validate ({foo:3}, schema));
        assert.ok (ov.validate ({foo:5}, schema));
    };
    
    exports['test gte'] = function () {
        var schema = {
            foo: __.gte (5)
        };
        assert.ok (ov.validate ({foo:7}, schema));
        assert.ok (ov.validate ({foo:5}, schema));
    };
})();