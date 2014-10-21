/**
 * Elevator Module
 *
 * @author niko
 * @date
 */
define(function (require, exports, module) {

    //get the module of controller
    require('../controllers/elevatorController');

    //get the module of directive
    require('../directives/elevatorDirective');

    var Elevator = angular.module('elevator', [
        'elevatorController',
        'elevatorDirective'
    ]);

    angular.bootstrap(document, ['elevator']);

    exports.module = Elevator;

});
