/**
 * Elevator Control Center
 *
 * @author niko
 * @date
 */

define(function (require, exports, module) {

    var Util = require('./util'),
        Elevator = require('./Elevator');

    //constructor
    function ElevatorControlCenter() {
        this.floors = 33;
        this.elevatorsNum = 3;
        this.elevators = [];

        this._initElevator();
    }

    //private method
    Util.method(ElevatorControlCenter, {
        _initElevator: function () {
            console.log(' * Init Elevator ! * ');

            for (var i = this.elevatorsNum; i--;) {
                this.elevators.push(new Elevator(this.floors));
            }

            this._bootstrap();
        },
        _bootstrap: function () {
            console.log(' * Elevator is running ! * ');

        },
        _access: function () {

        },
        _disboard: function () {

        }
    });

    //public method
    Util.method(ElevatorControlCenter, {
        render: function () {

        }
    });


    module.exports = ElevatorControlCenter;

});
