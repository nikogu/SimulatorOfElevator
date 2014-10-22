/**
 * overview
 *
 * @author niko
 * @date
 */

define(function (require, exports, module) {

    var Util = {
        isNumber: function(val) {
            return Object.prototype.toString.call(val) === '[object Number]';
        },
        proxy: function(fn, context) {
            return function() {
                fn.apply(context, arguments);
            }
        },
        method: function (o, fns) {
            var p = o.prototype;
            for (var fn in fns) {
                if (fns.hasOwnProperty(fn)) {
                    o.prototype[fn] = fns[fn];
                }
            }
        },
        arrayGetIndex: function(arr, item) {
            if ( !arr || !arr.length ) {
                return undefined;
            }
            for ( var i = arr.length; i--; ) {
                if ( arr[i] == item ) {
                    return i;
                }
            }
            return undefined;
        },
        arrayRemove: function(arr, item) {
            var index = Util.arrayGetIndex(arr, item);
            if ( index != undefined ) {
                arr.splice(index, 1);
            }
        },
        arrayGetNext: function(arr, item) {
            if ( arr.length < 1 ) {
                return undefined;
            }
            var index = Util.arrayGetIndex(arr, item);
            if ( index !=undefined && arr[index+1] ) {
                return arr[index+1];
            } else {
                for (var i = 0; i< arr.length; i++) {
                    if ( arr[i] > item ) {
                        return arr[i];
                    }
                }
                return undefined;
            }
        },
        arrayGetPrev: function(arr, item) {
            if ( arr.length < 1 ) {
                return undefined;
            }
            var index = Util.arrayGetIndex(arr, item);
            if ( index !=undefined && arr[index-1] ) {
                return arr[index-1];
            } else {
                for (var i = arr.length; i--;) {
                    if ( arr[i] < item ) {
                        return arr[i];
                    }
                }
                return undefined;
            }
        }
    };

    module.exports= Util;
});
