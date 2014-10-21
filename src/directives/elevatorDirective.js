/**
 * Elevator Controller
 *
 * @author niko
 * @date
 */
define(function (require, exports, module) {

    var EDire = angular.module('elevatorDirective', []);

    //the building
    EDire.directive('building', function () {
        return {
            restrict: 'E',
            transclude: true,
            scope: {
                floors: '=floors'
            },
            controller: function($scope) {

            },
            templateUrl: 'src/tpl/buildingTpl.html'
        };
    });

    //the elevator
    EDire.directive('elevator', function() {
        return {
            restrict: 'E',
            transclude: true,
            scope: {
            },
            controller: function($scope) {

            },
            templateUrl: 'src/tpl/elevatorTpl.html'
        };
    });

    module.exports = EDire;
});