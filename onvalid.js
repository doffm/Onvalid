//      onvalid.js 0.1.0
//      Copyright (c) 2010 Mark Doffman, Codethink Ltd
//      Onvalid may be freely distributed under the MIT license.

(function () {
    // When in the browser export to the global object, otherwise export to a
    // CommonJs module.
    
    if (typeof exports !== 'undefined') {
        Onvalid = exports;
    } else {
        Onvalid = this.Onvalid = {};
    }
    
    var Onvalid = exports;
    
    Onvalid.VERSION = '0.1.0';
    

    // This module depends on Underscore.js. Get underscore from the global
    // object or import from a CommonJs module.
    var _ = this._;
    if (!_ && (typeof require !== 'undefined')) _ = require ('underscore' )._;
    

    // ## Schemas
    //  
    // A schema is a standard javascript object. To validate a JSON object
    // against the schema, properties of the Schema object are matched
    // against the equivalent property in the JSON object.
    
    
    // Validates a JSON object against the given schema object.
    Onvalid.validate = function (object, schema) {
        return match (schema)(object);
    };
    
    // ## Validators
    //  
    // A validator is either a JSON value, Regexp or a function of type
    // (Any) -> Boolean.
    //
    // If the validator is a value it is assumed that we are matching for equality.
    // If the validator is a regexp it is assumed that we are matching a string
    // against it.
    
    // Validate a single property of the object. If the validator is a value then
    // assume we are checking for equality. Otherwise call the validator function.
    var validator = function (property, validator) {
        if (_.isFunction (validator)) {
            return validator (property);            
        } else if (_.isRegExp (validator)) {
            return validator.test (property);
        } else {
            return _.isEqual (property, validator);            
        }
    };

    // Turns a schema object in to a validator function. Validates that the
    // child object contained in the JSON proeprty is validatord by the schema.
    var match = Onvalid.match = function (vd) {return function (pd) {
        if (_.isUndefined(pd)) return false;
        return _.every (_.keys (vd), function (key) {
                return validator (pd[key], vd[key]);
            });        
    };};
    
    // A boolean expression. The property can match any of the provided
    // validator funcitons or values.
    Onvalid.or = function (vs) {return function (p) {
        return _.any (vs, function (v) {
                return validator (p, v);
            });
    };};

    // A boolean expression. Validates only if the property does not match
    // the given validator.
    Onvalid.nor = function (vs) {return function (p) {
        // Explaining the negation and use of every:
        //     De Morgan's theorem - !p && !q <==> !(p || q)
        
        // This means we can possibly use the native 'every' function.
        return _.every (vs, function (v) {
                return !(validator (p, v));
            });
    };};
    
    // If the object does not contain a property or the property value is 'undefined'
    // then it validators. Otherwise check the value.
    Onvalid.opt = function (v) {return function (p) {
        if (_.isUndefined (p))
            return true;
        else
            return validator (p, v);
    };};
     
    // Ensure that the property does not exist.
    Onvalid.notExists = function (p) {return _.isUndefined(p);};
    
    // Ensure that the property exists.
    Onvalid.exists = function (p) {return !_.isUndefined(p);};
    
    // If the property of the object is an array, ensure that all items inside
    // that array are present in the collection provided.
    Onvalid.all = function (vs) {return function (ps) {
        if (!_.isArray(ps)) return false;
        return _.every (ps, function (p) {return _.contains(p, vs);});
    };};
    
    // Ensure that the property is contained in the collection provided.
    Onvalid._in = function (vs) {return function (p) {return _.contains(p, vs);};};
    
    // Ensure that the property is not contained in the colleciton provided.
    Onvalid.nin = function (vs) {return function (p) {
        return _.every (vs, function (v) {return !_.isEqual (p, v);});
    };};
    
    // Ensure that the property is equal to the value provided.
    Onvalid.eq = function (v) {return function (p) {return _.isEqual(p, v);};};
    
    // Ensure that the property is not equal to the value provided.
    Onvalid.ne = function (v) {return function (p) {return !_.isEqual(p, v);};};
    
    // Ensure that the property wholely divisible by the value provided.
    Onvalid.mod = function (v) {return function (p) {return (p % v) == 0;};};

    // Ensure that the property is greater than the value provided.
    Onvalid.gt = function (v) {return function (p) {return p > v;};};
    
    // Ensure that the property is less than the value provided.
    Onvalid.lt = function (v) {return function (p) {return p < v;};};
    
    // Ensure that the property is greater than or equal to the value provided.
    Onvalid.gte = function (v) {return function (p) {return p >= v;};};
    
    // Ensure that the property is less than or equal to the value provided.
    Onvalid.lte = function (v) {return function (p) {return p <= v;};};

})();
