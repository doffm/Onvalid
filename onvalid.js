//      onvalid.js 0.2.0
//      Copyright (c) 2010 Mark Doffman, Codethink Ltd
//      Onvalid may be freely distributed under the MIT license.

(function () {
    // Onvalid is a tool for validating JSON objects. Schemas are written
    // directly in Javascript. Schemas are built using properties,
    // JSON values and functions that check whether a given JSON value
    // is valid.
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
    //          "latitude": "57",          \
    //          "type": "Registered"       \
    //      }');
    //      
    //      if (Onvalid.validate (obj, schema)) {
    //          console.log ('Success');
    //      }
    //
    // Onvalid also produces error messages that indicate why a JSON object
    // has failed to validate. The `validate` function optionally takes
    // a function parameter that reports the error.
    //
    //      var obj = JSON.parse ('{       \
    //          "username": "Frank",       \
    //          /* Status is missing */    \
    //          "latitude": "57",          \
    //          "type": "Registered"       \
    //      }');
    //      
    //      var err = "";
    //      if (Onvalid.validate (obj, schema, function (e){err=e;})) {
    //          console.log ('Success');
    //      } else {
    //          console.log (err);
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
    // A schema is defined using standard Javascript object. Properties
    // of this object can be one of the following.
    //
    //- *Value* Checks for equality between the value in the schema and th JSON object.
    //- *Regex* Checks that the value in the JSON object matches the regex.
    //- *Object* Assumed to be a child schema. The property of the JSON object
    //  is validated against it.
    //- *Function* A validator function takes the value of the JSON object and decides
    //  whether it is valid.
    //
    // Properties of the JSON object not present in the schema are ignored.
    
    // Checks if the given object matches the given schema.
    Onvalid.validate = function (object, schema, errorReturn) {
        return Onvalid.schema (schema)(object, errorReturn);
    };

    // Returns a validator function based on type of the schema property
    var wrapper = function (validator) {
        if (_.isFunction (validator)) 
            return validator;           
     
        if (_.isRegExp (validator))
            return Onvalid.regex (validator);         
      
        if (_.isArray (validator) || _.isString (validator) || _.isNumber (validator))
            return Onvalid.eq (validator);
        
        // Assume a JSON object
        return Onvalid.schema (validator);
    };

    // ## Validators
    //  
    // Validator functions take the property and return a Boolean depending on
    // whether the property is valid. Validator functions also optionally take
    // a function used to return any validator erorrs.

    // Takes a function with just one argument, the property to validate
    // as well as a message to return if validation fails.
    //
    // Generates a validator function that uses the message for error reporting.
    var ew = Onvalid.errWrapper = function (validator, message) {
        return function (property, errorReturn) {
            var result = validator (property);
            if (!result && errorReturn && message)
                errorReturn (message);
            return result;
        };
    };
    
    // The following functions generate validator functions.

    // ### Base
    
    // Validates if the property matches the given schema
    Onvalid.schema = function (v) {return function (property, errorReturn) {
        if (_.isUndefined (property)) return false;
        return _.every (_.keys(v), function (key) {
            var error = "";
            var result = wrapper (v[key]) (property[key], function (e) {error = e;});
            
            if (!result && errorReturn)
                errorReturn ('Property at ' + key + ' is not valid: ' + error);
            return result;
        });
    };};
    
    // ### Regex
    
    // The property must match the given regex
    Onvalid.regex = function (v) {return ew (function (property) {
        return v.test (property);
    }, 'must match regex ' + v);};
    
    // ### Boolean operators
    
    // The property can match any of the provided validator functions or values
    Onvalid.or = function (vs) {return ew (function (p) {
            return _.any (vs, function (v) {
                    return wrapper (v)(p);
                });

    }, 'must match at-least one of the constraints');};
    
    // Validates only if the property matches all of the given validators functions
    // or values.
    Onvalid.and = function (vs) {return function (property, errorReturn) {
        return _.every (vs, function (v, i) {
                var error = "";
                var result = wrapper (v)(property, function (e){error = e;});

                if (!result && errorReturn)
                    errorReturn ('constraint at position ' + (i+1) + ' is not met: ' + error);

                return result;
            });
    };};

    // Validates only if the property does not match any of the given validator
    // functions or values.
    Onvalid.nor = function (vs) {return function (property, errorReturn) {
        return _.every (vs, function (v, i) {
                var result = wrapper (v)(property);
                
                if (result && errorReturn)
                    errorReturn ('constraint at position ' + (i+1) + ' must not be met');
                
                return !result;
            });
    };};
    
    // ### Existential operators
    
    // The property is optional. It must match the provided validator function
    // or value only if it exists.
    Onvalid.opt = function (v) {return function (property, errorReturn) {
        if (_.isUndefined (property))
            return true;
        else
            return wrapper (v) (property, errorReturn);
    };};
     
    // Ensure that the property does not exist.
    Onvalid.notExists = ew (function (p) {
        return _.isUndefined(p);
    }, 'must not exist');
    
    // Ensure that the property exists.
    Onvalid.exists = ew (function (p) {
        return !_.isUndefined(p);
    }, 'must exist');
    
    // ### Array operators
    
    // Ensure that all items in the property array are present in the schema
    // array.
    Onvalid.all = function (vs) {return ew (function (ps) {
        if (!_.isArray(ps)) return false;
        return _.every (ps, function (p) {return _.contains(p, vs);});
    }, 'must match all of ' + vs);};
    
    // Ensure that the property is contained in the collection provided.
    Onvalid._in = function (vs) {return ew (function (p) {
        return _.contains(p, vs);
    }, 'must be contained in ' + vs);};
    
    // Ensure that the property is not contained in the colleciton provided.
    Onvalid.nin = function (vs) {return ew (function (p) {
        return _.every (vs, function (v) {return !_.isEqual (p, v);});
    }, 'must not be contained in' + vs);};
    
    // ### Comparison operators
    
    // Ensure that the property is equal to the value provided.
    Onvalid.eq = function (v) {return ew (function (p) {
        return _.isEqual(p, v);
    }, 'must be equal to ' + v);};
    
    // Ensure that the property is not equal to the value provided.
    Onvalid.ne = function (v) {return ew (function (p) {
        return !_.isEqual(p, v);
    }, 'must not be equal to ' + v);};
    
    // Ensure that the property wholely divisible by the value provided.
    Onvalid.mod = function (v) {return ew (function (p) {
        return (p % v) === 0;
    }, 'must be wholely divisible by ' + v);};

    // Ensure that the property is greater than the value provided.
    Onvalid.gt = function (v) {return ew (function (p) {
        return p > v;
    }, 'must be greater than ' + v);};
    
    // Ensure that the property is less than the value provided.
    Onvalid.lt = function (v) {return ew (function (p) {
        return p < v;
    }, 'must be less than ' + v);};
    
    // Ensure that the property is greater than or equal to the value provided.
    Onvalid.gte = function (v) {return ew (function (p) {
        return p >= v;
    }, 'must be greater than or equal to ' + v);};
    
    // Ensure that the property is less than or equal to the value provided.
    Onvalid.lte = function (v) {return ew(function (p) {
        return p <= v;
    }, 'must be less than or equal to ' + v);};

})();