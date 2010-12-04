
(function () {
    var ov = __ = require ('onvalid');
    var assert = require ('assert');
    
    exports['test validate'] = function () {
        var schema = {
            foo: "",
            bar: ""
        };
        assert.ok (ov.validate ({foo:"", bar:"", baz:""}, schema));
        assert.ok (ov.validate ({foo:"", bar:""}, schema));
        assert.ok (!ov.validate ({foo:""}, schema));
        assert.ok (!ov.validate ({}, schema));
    };

    exports['test regexp'] = function () {
        var schema = {
            foo: /\d{7}/,
            bar: /foo\s*bar/
        };
        assert.ok (ov.validate ({foo:"1234567", bar:"foobar", baz:""}, schema));
        assert.ok (ov.validate ({foo:"1234567", bar:"foo bar"}, schema));
        assert.ok (!ov.validate ({foo:"123456", bar:"foo bar"}, schema));
        assert.ok (!ov.validate ({foo:"123456", bar:"fooar"}, schema));
        assert.ok (!ov.validate ({foo:123456, bar:"foo bar"}, schema));
        assert.ok (!ov.validate ({foo:"1234567"}, schema));
        assert.ok (!ov.validate ({}, schema));
    };    

    exports['test match'] = function () {
        var schema = {
            foo: "",
            bar: __.match ({
                foo: ""
            })
        };
        assert.ok (ov.validate ({foo:"", bar:{foo:"", bar:""}}, schema));
        assert.ok (ov.validate ({foo:"", bar:{foo:""}}, schema));  
        assert.ok (!ov.validate ({foo:"", bar:""}, schema));   
        assert.ok (!ov.validate ({foo:"", bar:{}}, schema));
        assert.ok (!ov.validate ({foo:""}, schema));
    };

    exports['test or'] = function () {
        var schema = {
            foo: __.or([1, 2, __.gt(10)])
        };
        assert.ok (ov.validate ({foo:1}, schema));
        assert.ok (ov.validate ({foo:2}, schema));
        assert.ok (ov.validate ({foo:11}, schema));
        assert.ok (ov.validate ({foo:12}, schema));
        assert.ok (!ov.validate ({foo:0}, schema));
        assert.ok (!ov.validate ({foo:10}, schema));
    };

    exports['test nor'] = function () {
        var schema = {
            foo: __.nor([1, 2, __.gt(10)])
        };
        assert.ok (!ov.validate ({foo:1}, schema));
        assert.ok (!ov.validate ({foo:2}, schema));
        assert.ok (!ov.validate ({foo:11}, schema));
        assert.ok (!ov.validate ({foo:12}, schema));
        assert.ok (ov.validate ({foo:10}, schema));
        assert.ok (ov.validate ({foo:0}, schema));
    };

    exports['test opt'] = function () {
        var schema = {
            foo: "",
            bar: __.opt (__.match ({
                foo: ""
            }))
        };
        assert.ok (ov.validate ({foo:"", bar:{foo:"", bar:""}}, schema));
        assert.ok (ov.validate ({foo:"", bar:{foo:""}}, schema));  
        assert.ok (!ov.validate ({foo:"", bar:""}, schema));   
        assert.ok (!ov.validate ({foo:"", bar:{}}, schema));
        assert.ok (ov.validate ({foo:""}, schema));
    };

    exports['test exists'] = function () {
        var schema = {
            foo: __.exists,
            bar: __.exists
        };
        assert.ok (ov.validate ({foo:"", bar:"", baz:""}, schema));
        assert.ok (ov.validate ({foo:"", bar:""}, schema));
        assert.ok (!ov.validate ({foo:""}, schema));
        assert.ok (!ov.validate ({}, schema));
    };

    exports['test notExists'] = function () {
        var schema = {
            foo: __.notExists,
            bar: __.notExists
        };
        assert.ok (!ov.validate ({foo:"", bar:"", baz:""}, schema));
        assert.ok (!ov.validate ({foo:"", bar:""}, schema));
        assert.ok (!ov.validate ({foo:""}, schema));
        assert.ok (ov.validate ({baz:""}, schema));
        assert.ok (ov.validate ({}, schema));
    };
    
    exports['test eq'] = function () {
        var schema = {
            foo: __.eq (5)
        };
        assert.ok (ov.validate ({foo:5}, schema));
        assert.ok (!ov.validate ({foo:7}, schema));
    };

    exports['test ne'] = function () {
        var schema = {
            foo: __.ne (5)
        };
        assert.ok (!ov.validate ({foo:5}, schema));
        assert.ok (ov.validate ({foo:7}, schema));
    };
    
    exports['test lte'] = function () {
        var schema = {
            foo: __.lte (5)
        };
        assert.ok (ov.validate ({foo:3}, schema));
        assert.ok (ov.validate ({foo:5}, schema));
        assert.ok (!ov.validate ({foo:7}, schema));
    };
    
    exports['test gte'] = function () {
        var schema = {
            foo: __.gte (5)
        };
        assert.ok (ov.validate ({foo:7}, schema));
        assert.ok (ov.validate ({foo:5}, schema));
        assert.ok (!ov.validate ({foo:3}, schema));
    };

    exports['test lt'] = function () {
        var schema = {
            foo: __.lt (5)
        };
        assert.ok (ov.validate ({foo:3}, schema));
        assert.ok (!ov.validate ({foo:5}, schema));
    };


    exports['test gt'] = function () {
        var schema = {
            foo: __.gt (5)
        };
        assert.ok (ov.validate ({foo:7}, schema));
        assert.ok (!ov.validate ({foo:5}, schema));
    };
    
    exports['test mod'] = function () {
        var schema = {
            foo: __.mod (3)
        };
        assert.ok (ov.validate ({foo:0}, schema));
        assert.ok (ov.validate ({foo:3}, schema));
        assert.ok (ov.validate ({foo:9}, schema));
        assert.ok (ov.validate ({foo:12}, schema));
        assert.ok (ov.validate ({foo:15}, schema));
        assert.ok (!ov.validate ({foo:1}, schema));
        assert.ok (!ov.validate ({foo:5}, schema));
    };
})();