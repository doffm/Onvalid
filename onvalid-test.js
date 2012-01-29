
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

    exports['test sub'] = function () {
        var schema = {
            foo: "a",
            bar: {
                foo: "b"
            }
        };

        assert.ok (ov.validate ({foo:"a", bar:{foo:"b", bar:""}}, schema));
        assert.ok (ov.validate ({foo:"a", bar:{foo:"b"}}, schema)); 
        assert.ok (!ov.validate ({foo:"a", bar:""}, schema));
        assert.ok (!ov.validate ({foo:"a", bar:{}}, schema));
        assert.ok (!ov.validate ({foo:"a"}, schema));

        var error = "";
        var efunc = function (e) {error = e;};
        assert.ok (!ov.validate ({foo:"a", bar:""}, schema, efunc));
        assert.equal (error,
            "Property at bar is not valid: Property at foo is not valid: must be equal to b");
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

        var error = "";
        var efunc = function (e) {error = e;};
        assert.ok (!ov.validate ({foo:"1234567"}, schema, efunc));
        assert.equal (error, "Property at bar is not valid: must match regex /foo\\s*bar/");
    };

    exports['test email'] = function () {
        var schema = {
            foo: __.email
        };
        assert.ok (ov.validate ({foo:"foo@bar.baz.com"}, schema));
        assert.ok (ov.validate ({foo:"foo.bar@baz.com"}, schema));
        assert.ok (ov.validate ({foo:"foo_bar@baz.com"}, schema));
        assert.ok (!ov.validate ({foo:"foo.bar.com"}, schema));
        assert.ok (!ov.validate ({foo:"foo_bar@"}, schema));
        assert.ok (!ov.validate ({foo:"foo_bar@foo.bar@foobar"}, schema));
        assert.ok (!ov.validate ({foo:""}, schema));
        assert.ok (!ov.validate ({}, schema));
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

        var error = "";
        var efunc = function (e) {error = e;};
        assert.ok (!ov.validate ({foo:0}, schema, efunc));
        assert.equal (error, "Property at foo is not valid: must match at-least one of the constraints");
    };

    exports['test and'] = function () {
        var schema = {
            foo: __.and([__.lt(20), __.gt(10)])
        };
        assert.ok (ov.validate ({foo:11}, schema));
        assert.ok (ov.validate ({foo:15}, schema));
        assert.ok (ov.validate ({foo:19}, schema));
        assert.ok (!ov.validate ({foo:20}, schema));
        assert.ok (!ov.validate ({foo:10}, schema));
        assert.ok (!ov.validate ({foo:0}, schema));

        var error = "";
        var efunc = function (e) {error = e;};
        assert.ok (!ov.validate ({foo:0}, schema, efunc));
        assert.equal (error,
            "Property at foo is not valid: constraint at position 2 is not met: must be greater than 10");
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

        var error = "";
        var efunc = function (e) {error = e;};
        assert.ok (!ov.validate ({foo:12}, schema, efunc));
        assert.equal (error,
            "Property at foo is not valid: constraint at position 3 must not be met");
    };

    exports['test opt'] = function () {
        var schema = {
            foo: "",
            bar: __.opt ({
                foo: ""
            })
        };
        assert.ok (ov.validate ({foo:"", bar:{foo:"", bar:""}}, schema));
        assert.ok (ov.validate ({foo:"", bar:{foo:""}}, schema));
        assert.ok (!ov.validate ({foo:"", bar:""}, schema));
        assert.ok (!ov.validate ({foo:"", bar:{}}, schema));
        assert.ok (ov.validate ({foo:""}, schema));

        var error = "";
        var efunc = function (e) {error = e;};
        assert.ok (!ov.validate ({foo:"", bar:{}}, schema, efunc));
        assert.equal (error,
            "Property at bar is not valid: Property at foo is not valid: must be equal to ");
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

        var error = "";
        var efunc = function (e) {error = e;};
        assert.ok (!ov.validate ({}, schema, efunc));
        assert.equal (error, "Property at foo is not valid: must exist");
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

        var error = "";
        var efunc = function (e) {error = e;};
        assert.ok (!ov.validate ({foo:""}, schema, efunc));
        assert.equal (error, "Property at foo is not valid: must not exist");
    };

    exports['test eq'] = function () {
        var schema = {
            foo: __.eq (5)
        };
        assert.ok (ov.validate ({foo:5}, schema));
        assert.ok (!ov.validate ({foo:7}, schema));

        var error = "";
        var efunc = function (e) {error = e;};
        assert.ok (!ov.validate ({foo:7}, schema, efunc));
        assert.equal (error, "Property at foo is not valid: must be equal to 5");
    };

    exports['test ne'] = function () {
        var schema = {
            foo: __.ne (5)
        };
        assert.ok (!ov.validate ({foo:5}, schema));
        assert.ok (ov.validate ({foo:7}, schema));

        var error = "";
        var efunc = function (e) {error = e;};
        assert.ok (!ov.validate ({foo:5}, schema, efunc));
        assert.equal (error, "Property at foo is not valid: must not be equal to 5");
    };

    exports['test lte'] = function () {
        var schema = {
            foo: __.lte (5)
        };
        assert.ok (ov.validate ({foo:3}, schema));
        assert.ok (ov.validate ({foo:5}, schema));
        assert.ok (!ov.validate ({foo:7}, schema));

        var error = "";
        var efunc = function (e) {error = e;};
        assert.ok (!ov.validate ({foo:7}, schema, efunc));
        assert.equal (error, "Property at foo is not valid: must be less than or equal to 5");
    };

    exports['test gte'] = function () {
        var schema = {
            foo: __.gte (5)
        };
        assert.ok (ov.validate ({foo:7}, schema));
        assert.ok (ov.validate ({foo:5}, schema));
        assert.ok (!ov.validate ({foo:3}, schema));

        var error = "";
        var efunc = function (e) {error = e;};
        assert.ok (!ov.validate ({foo:3}, schema, efunc));
        assert.equal (error, "Property at foo is not valid: must be greater than or equal to 5");
    };

    exports['test lt'] = function () {
        var schema = {
            foo: __.lt (5)
        };
        assert.ok (ov.validate ({foo:3}, schema));
        assert.ok (!ov.validate ({foo:5}, schema));

        var error = "";
        var efunc = function (e) {error = e;};
        assert.ok (!ov.validate ({foo:5}, schema, efunc));
        assert.equal (error, "Property at foo is not valid: must be less than 5");
    };


    exports['test gt'] = function () {
        var schema = {
            foo: __.gt (5)
        };
        assert.ok (ov.validate ({foo:7}, schema));
        assert.ok (!ov.validate ({foo:5}, schema));

        var error = "";
        var efunc = function (e) {error = e;};
        assert.ok (!ov.validate ({foo:5}, schema, efunc));
        assert.equal (error, "Property at foo is not valid: must be greater than 5");
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

        var error = "";
        var efunc = function (e) {error = e;};
        assert.ok (!ov.validate ({foo:5}, schema, efunc));
        assert.equal (error, "Property at foo is not valid: must be wholely divisible by 3");
    };
})();
