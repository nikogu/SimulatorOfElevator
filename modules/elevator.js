/**
 * Elevator
 *
 * @author niko
 * @date
 */

define(function (require, exports, module) {

    var Util = require('./util');

    function Elevator(o) {

        for (var prop in o || {}) {
            if (o.hasOwnProperty(prop)) {
                this[prop] = o[prop];
            }
        }

        this.id = Math.floor(Math.random() * 4000) + Math.floor(Math.random() * 5000) + new Date().getTime();

        this.currentFloor = 1;
        this.targetFloors = [];

        this.moveDir = '';
        this.distance = 0;
        this.speed = 2;
        this.callbacks = [];
        this.calllist = [];
        this.status = 'stop';

        this.moveTimmer = 0;
        this.doorTimmer = 0

        this.height = this.height || 40;
        this.width = this.width || 36;
        this.doorWidth = this.width / 2;
        this.floorHeight = this.floorHeight || this.height + 10;

    }

    //private method
    Util.method(Elevator, {
        _setTargetFloor: function () {
            if (this.targetFloors.length < 1) {
                return;
            }
            if (this.moveDir == 'up') {
                //has bug
                this.nextFloor = Util.arrayGetNext(this.targetFloors, this.currentFloor);
                if (this.nextFloor == undefined) {
                    this.moveDir = 'down';
                    this._setTargetFloor();
                }
            } else if (this.moveDir == 'down') {
                this.nextFloor = Util.arrayGetPrev(this.targetFloors, this.currentFloor);
                if (this.nextFloor == undefined) {
                    this.moveDir = 'up';
                    this._setTargetFloor();
                }
            } else {

                this.nextFloor = this.targetFloors[0];
                if (this.nextFloor > this.currentFloor) {
                    this.moveDir = 'up';
                } else if (this.nextFloor < this.currentFloor) {
                    this.moveDir = 'down';
                } else {

                }
            }
        },
        _goon: function () {
            this.openDoor(function () {
                this.closeDoor(function () {
                    if (this.targetFloors.length > 0) {
                        this._move();
                    }
                });
            });
        },
        _move: function (num, callback) {

            this._setTargetFloor();

            //set callback of trigger floor
            num ? (this.callbacks[num] = callback) : 1;

            if (!this.nextFloor || this.status != 'stop') {
                return;
            }
            //update the elevator status
            this.status = 'run';

            var targetDis,
                tempFloor;
            this.moveTimmer = setInterval(Util.proxy(function () {
                targetDis = (this.nextFloor - 1) * this.floorHeight;

                //check the distance to stop elevator
                if (Math.abs(targetDis - this.distance) < this.speed) {
                    this.distance = targetDis;

                    //update view
                    this.render();

                    clearInterval(this.moveTimmer);
                    this.status = 'stop';

                    this.cancelTrigger(this.nextFloor);

                    //this.nextFloor may be undefined
                    try {
                        this.callbacks[this.nextFloor].call(this);
                    } catch (e) {

                    }
                    this._goon();

                    return;
                }

                if (targetDis > this.distance) {
                    this.distance += this.speed;
                } else {
                    this.distance -= this.speed;
                }

                //update currentFloor
                this.currentFloor = Math.floor(this.distance / this.floorHeight) + 1;

                //update view
                this.render();

            }, this), 50);

        },
        _trigger: function (floorNum, callback) {

            if (!Util.isNumber(floorNum)) {
                return;
            }

            //if there is lager than total floors then return
            if (floorNum > this.floors) {
                floorNum = this.floors;
            }
            //check is there already in targetFloors
            if (Util.arrayGetIndex(this.targetFloors, floorNum) == undefined) {
                this.targetFloors.push(floorNum);
            }
            //sort
            this.targetFloors.sort(function (a, b) {
                return a > b;
            });

            //high light the panel
            this.panelViewNode.find('li').eq(floorNum - 1).addClass('active');

            //move elevator
            this._move(floorNum, callback);

        }
    });

    //public method
    Util.method(Elevator, {
        go: function (floorNum) {
            console.log(this.status);
            if (this.status == 'stop') {
                this.openDoor(function () {
                    this.closeDoor(function () {
                        this._trigger(floorNum);
                    });
                });
            } else {
                this._trigger(floorNum);
            }
        },
        openDoor: function (callback) {
            this.status = 'open-door';
            this.ldoorNode.animate({
                left: -this.doorWidth
            }, 500, Util.proxy(function () {
                callback ? callback.call(this) : 1;
            }, this));
            this.rdoorNode.animate({
                right: -this.doorWidth
            }, 500);
        },
        closeDoor: function (callback) {
            this.status = 'close-door';
            this.ldoorNode.animate({
                left: -1
            }, 500, Util.proxy(function () {
                this.status = 'stop';
                callback ? callback.call(this) : 1;
            }, this));
            this.rdoorNode.animate({
                right: 0
            }, 500);
        },
        call: function (floorNum, type) {
            this.calllist.push({
                floor: floorNum,
                type: type
            });
        },
        cancelTrigger: function (floorNum) {
            Util.arrayRemove(this.targetFloors, floorNum);

            //
            this.panelViewNode.find('li').eq(floorNum - 1).removeClass('active');
        },
        render: function (node) {
            if (node) {

                //panel view
                this.panelView = '<div id="elevator-panel-' + this.id + '" class="elevator-panel">';
                this.panelView += '<ul>';
                for (var i = 0; i < this.floors; i++) {
                    this.panelView += '<li>' + (i + 1) + '</li>';
                }
                this.panelView += '</ul>';
                this.panelView += '</div>';

                //elevator view
                this.view = [
                        '<div id="elevator-' + this.id + '" class="elevator">',
                    '<i class="l"></i>',
                    '<i class="r"></i>',
                    '</div>'
                ].join('');

                node.append(this.view);
                node.append(this.panelView);

                this.viewNode = $('#elevator-' + this.id);
                this.panelViewNode = $('#elevator-panel-' + this.id);
                this.ldoorNode = this.viewNode.find('i.l');
                this.rdoorNode = this.viewNode.find('i.r');

                this.panelViewNode.on('click', Util.proxy(function (e) {
                    console.log('trigger' + ($(e.target).html() * 1));
                    this.go($(e.target).html() * 1 || undefined);
                }, this));

            } else {

                this.viewNode.css('bottom', this.distance);

            }
        }
    });

    module.exports = Elevator;

});
