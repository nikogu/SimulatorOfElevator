/**
 * Elevator Control Center
 *
 * @author niko
 * @date
 */

define(function (require, exports, module) {

    var Util = require('./util'),
        Elevator = require('./Elevator');

    //the elevator control center class
    //constructor
    function ElevatorControlCenter() {
        this.floors = 10;
        this.elevatorsNum = 3;

        this.elevators = [];

        this.elevatorWidth = 36;
        this.elevatorheight = 40;

        this.calllist = [];

        this.id = Math.floor(Math.random() * 4000) + Math.floor(Math.random() * 5000) + new Date().getTime();

        this._initElevator();
    }

    //private method
    Util.method(ElevatorControlCenter, {
        _initElevator: function () {
            console.log(' * Init Elevator ! * ');

            for (var i = this.elevatorsNum; i--;) {
                this.elevators.push(new Elevator({
                    floors: this.floors,
                    width: this.elevatorWidth,
                    height: this.elevatorheight
                }));
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
        render: function (node) {
            var that = this;

            var html = '<div id="elevator-control-center-' + this.id + '" class="control-center">';

            for (var i = this.elevators.length; i--;) {
                html += '<div class="building">';
                for (var j = this.floors; j--;) {
                    html += '<div class="floor">';
                    html += '<p class="num">' + (j + 1) + '</p>'
                    html += '<div class="door"></div>';
                    html += '<div class="cover"></div>';
                    html += '<div class="control">';
                    html += '<i class="up" data-type="up" data-index="' + (j + 1) + '"></i>';
                    html += '<i class="down" data-type="down" data-index="' + (j + 1) + '"></i>';
                    html += '</div>';
                    html += '</div>';
                }
                html += '<div class="panel">';
                html += '<ul>';
                for (var k = 0; k < this.floors; k++) {
                    html += '<li>' + (k + 1) + '</li>';
                }
                html += '</ul>';
                html += '</div>';
                html += '</div>';
            }

            html += '</div>';

            node.append(html);

            this.viewNode = $('#elevator-control-center-' + this.id);
            var buildingNode = this.viewNode.find('.building');
            for (var i = 0; i < this.elevators.length; i++) {
                (function (i) {

                    that.elevators[i].render(buildingNode.eq(i));

                    that.elevators[i].e.on('cancel-call', function (e, o) {
                        if (Util.isNumber(o.floorNum) && o.type) {
                            buildingNode.eq(i).find('.floor').eq(that.floors - o.floorNum).find('.' + $.trim(o.type)).removeClass('active');
                        }
                    });

                    buildingNode.eq(i).find('.floor .up').on('click', function (e) {
                        var target = $(e.target),
                            index = target.attr('data-index') * 1;

                        target.addClass('active');
                        that.elevators[i].call(index, 'up');
                    });

                    buildingNode.eq(i).find('.floor .down').on('click', function (e) {
                        var target = $(e.target),
                            index = target.attr('data-index') * 1;

                        target.addClass('active');
                        that.elevators[i].call(index, 'down');
                    });

                })(i);
            }

        }
    });


    module.exports = ElevatorControlCenter;

});
