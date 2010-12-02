/*
   onvalid.js 0.1.0
   Copyright (c) 2010 Mark Doffman, Codethink Ltd
   
   Permission is hereby granted, free of charge, to any person obtaining a copy
   of this software and associated documentation files (the "Software"), to deal
   in the Software without restriction, including without limitation the rights
   to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
   copies of the Software, and to permit persons to whom the Software is
   furnished to do so, subject to the following conditions:

   The above copyright notice and this permission notice shall be included in
   all copies or substantial portions of the Software.

   THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
   IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
   FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
   AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
   LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
   OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
   THE SOFTWARE.
*/

(function () {
    /*
      When in the browser export to the global object, otherwise export to a
      CommonJs module.
    */
    if (typeof exports !== 'undefined') {
        onvalid = exports
    } else {
        onvalid = this.onvalid = {}
    }
    
    onvalid.VERSION = '0.1.0'
    
    /*
      This module depends on Underscore.js. Get underscore from the global
      object or import from a CommonJs module.
    */
    var _ = this._;
    if (!_ && (typeof require !== 'undefined')) _ = require ('underscore' )._;
    
    /*
      Validates a JSON object against the given schema object.
    */
    var validateJSON = onvalid.validateJSON = function (object, schema) {
        return _.all (_.keys (schema), function (object, key) {
                return validate (object.key, schema.key);
            }, object);
    }
    
    /*
      Validate a single property of the object. If the validator is a value then
      assume we are checking for equality. Otherwise call the validator function.
    */
    var validate = function (property, validator) {
        if (_.isFunction (validator))
            return validator (property);
        else
            return _.isEqual (property, validator);
    }

    /*
      Validates the object contained in the property against the
      schema object provided.
    */
    onvalid.sub = function (v) {return function (p) {return isValid (p, v);}}
    
    /*
      A boolean expression. The property can match any of the provided
      validator funcitons or values.
    */
    onvalid.or = function (vs) {return function (p) {
        return _.any (vs, function (p, v) {
                return validateSingle (p, v);
            }, p);
    }}

    /*
      A boolean expression. Validates only if the property does not match
      the given validator.
    */
    onvalid.not = funciton (v) {return function (p) {
        return !validateSingle (p, v);
    }}
    
    /*
      If the object does not contain a property or the property value is 'undefined'
      then it validates. Otherwise check the value.
     */
    onvalid.opt = function (v) {return function (p) {
        if (_.isUndefined (p))
            return true;
        else
            return validateSingle (p, v);
    }}
     
    /*
      Ensure that the property does not exist.
    */
    onvalid.notExists = function () {return false;}
    
    /*
      Ensure that the property exists.
    */
    onvalid.exists = function () {return true;}
    
    /*
      If the property of the object is an array, ensure that all items inside
      that array are present in the collection provided.
    */
    onvalid.all = function (vs) {return function (ps) {
        return _.all (ps, function (vs, p) {_.contains(p, vs)}, vs);
    }}
    
    /*
      Ensure that the property is contained in the collection provided.
    */
    onvalid.in = function (vs) {return function (p) {_.contains(p, vs);}}
    
    /*
      Ensure that the property is not contained in the colleciton provided.
    */
    onvalid.nin = function (vs) {return function (p) {
        return _.all (vs, function (p, v) {return !_.isEqual (p, v);}, p);
    }}
    
    /*
      Ensure that the property is equal to the value provided.
    */
    onvalid.eq = function (v) {return function (p) {return _.isEqual(p, v);}}
    
    /*
      Ensure that the property is not equal to the value provided.
    */
    onvalid.ne = function (v) {return function (p) {return !_.isEqual(p, v);}}
    
    onvalid.mod = function (v) {return function (p) {return p % v;}}
    
    onvalid.gt = function (v) {return function (p) {return p > v;}}
    
    onvalid.lt = function (v) {return function (p) {return p < v;}}
    
    onvalid.gte = function (v) {return function (p) {return p >= v;}}
    
    onvalid.lte = function (v) {return function (p) {return p <= v;}}
})