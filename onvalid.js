//      onvalid.js 0.1.0
//      Copyright (c) 2010 Mark Doffman, Codethink Ltd
//      Onvalid may be freely distributed under the MIT license.

(function () {
    // Onvalid is a tool for creating JSON schemas directly in Javascript.
    // Schemas are standard Javascript objects and are built using properties,
    // JSON values and functions that check whether a given JSON value
    // is valid at a particular property.
    //
    //      var __ = Onvalid = require ('onvalid');
    //      
    //      var schema = {
    //          username: __.exists,
    //          status: __.exists,
    //          latitude: __.opt (__.and (__.gte(-90), __.lte(90))),
    //          longitude: __.opt (__.and (__.gte(-180), __.lte(180))),
    //          type: __in (['Registered', 'Unregistered'])    
    //      };
    //      
    //      var obj = JSON.parse ('{       \
    //          "username": "Frank",       \
    //          "status": "Out on patrol", \
    //          "latitude"": "57",         \
    //          "type": "Registered"       \
    //      }');
    //      
    //      if (Onvalid.validate (obj, schema)) {
    //          console.log ('Success');
    //      }

    // When in the browser, export to the global object, otherwise export to a
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
    // A JSON schema is defined by a standard Javascript object. Properties
    // of this object can be one of the following.
    //
    //- *Values*, The value in the schema must match that of the JSON object.
    //- *Regexp object*, The property in the JSON object will be matched against it.
    //- *Validator functions*, These take the value of the JSON object property
    //  and return a boolean argument indicating the match.
    //- *Child Schema*, The property in the JSON object will be matched against it.
    //
    // Properties of the JSON object not present in the schema are ignored.      

    // Check if the provided value matches the schema.
    var validate = Onvalid.validate = function (property, validator) {
        if (_.isFunction (validator))
            return validator (property);            
        
        if (_.isRegExp (validator))
            return validator.test (property);
        
        if (_.isArray (validator) || _.isString (validator) || _.isNumber (validator))
            return _.isEqual (property, validator);
        
        // Assume a JSON object
        if (_.isUndefined (property))
            return false;
            
        return _.every (_.keys (validator), function (key) {
            return validate (property[key], validator[key]);
        });
    };

    // ## Validators
    //  
    // The following functions create validator functions which are of type
    // `(JSON Value) -> Bool`.

    // ### Boolean operators
    
    // The property can match any of the provided validator functions or values.
    Onvalid.or = function (vs) {return function (p) {
        return _.any (vs, function (v) {
                return validate (p, v);
            });
    };};
    
    // Validates only if the property matches all of the given validators functions
    // or values.
    Onvalid.and = function (vs) {return function (p) {
        return _.every (vs, function (v) {
                return (validate (p, v));
            });
    };};

    // Validates only if the property does not match any of the given validator
    // functions or values.
    Onvalid.nor = function (vs) {return function (p) {
        return _.every (vs, function (v) {
                return !(validate (p, v));
            });
    };};
    
    // ### Existential operators
    
    // The property is optional. It must match the provided validator function
    // or value only if it exists.
    Onvalid.opt = function (v) {return function (p) {
        if (_.isUndefined (p))
            return true;
        else
            return validate (p, v);
    };};
     
    // Ensure that the property does not exist.
    Onvalid.notExists = function (p) {return _.isUndefined(p);};
    
    // Ensure that the property exists.
    Onvalid.exists = function (p) {return !_.isUndefined(p);};
    
    // ### Array operators
    
    // Ensure that all items in the property array are present in the schema
    // array.
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
    
    // ### Comparison operators
    
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