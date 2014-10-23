/**
 * Elevator
 *
 * @author niko
 * @date
 */

define(function (require, exports, module) {

    var Util = require('./util');

    //the elevator class
    function Elevator(o) {

        //copy the property
        for (var prop in o || {}) {
            if (o.hasOwnProperty(prop)) {
                this[prop] = o[prop];
            }
        }

        //jquery event extend
        this.e = $({});

        //random id
        this.id = Math.floor(Math.random() * 4000) + Math.floor(Math.random() * 5000) + new Date().getTime();

        this.currentFloor = 1;
        this.targetFloors = [];

        this.moveDir = '';
        this.distance = 0;
        this.speed = 2;
        this.callbacks = [];

        this.calllist = {
            up: [],
            down: []
        };

        this.status = 'stop';

        this.moveTimmer = 0;

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
            if (this.targetFloors.length == 1) {
                this.nextFloor = this.targetFloors[0];
                if (this.nextFloor > this.currentFloor) {
                    this.moveDir = 'up';
                    this._triggerCallList(this.moveDir);
                } else if (this.nextFloor < this.currentFloor) {
                    this.moveDir = 'down';
                    this._triggerCallList(this.moveDir);
                } else {
                    this.moveDir = '';
                }
                return;
            }
            if (this.moveDir == 'up') {

                this.nextFloor = Util.arrayGetNext(this.targetFloors, this.currentFloor);
                if (this.nextFloor == undefined) {
                    this.moveDir = 'down';
                    this._triggerCallList(this.moveDir);
                    this._setTargetFloor();
                }
            } else if (this.moveDir == 'down') {
                if (this.nextFloor == this.currentFloor) {
                }
                this.nextFloor = Util.arrayGetPrev(this.targetFloors, this.currentFloor);
                if (this.nextFloor == undefined) {
                    this.moveDir = 'up';
                    this._triggerCallList(this.moveDir);
                    this._setTargetFloor();
                }
            } else {

                this.nextFloor = this.targetFloors[0];
                if (this.nextFloor > this.currentFloor) {
                    this.moveDir = 'up';
                } else if (this.nextFloor < this.currentFloor) {
                    this.moveDir = 'down';
                } else {
                    this.moveDir = '';
                }
            }
        },
        _goon: function () {
            this.openDoor(function () {
                this.closeDoor(function () {
                    this._move();
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

            var targetDis;

            this.moveTimmer = setInterval(Util.proxy(function () {
                targetDis = (this.nextFloor - 1) * this.floorHeight;
                //check the distance to stop elevator
                if (Math.abs(targetDis - this.distance) < this.speed) {
                    this.distance = targetDis;

                    clearInterval(this.moveTimmer);
                    this.status = 'stop';

                    this._cancelTrigger(this.nextFloor);
                    //this.cancelCall(this.currentFloor, this.moveDir);

                    if (this.targetFloors.length > 0) {
                        this._goon();
                    } else {
                        if ( this.moveDir == 'up' ) {
                            this._triggerCallList('up', 'down');
                        } else if ( this.moveDir == 'down' ) {
                            this._triggerCallList('down', 'up');
                        } else {
                        }
                    }

                    //this.nextFloor may be undefined
                    try {
                        this.callbacks[this.nextFloor].call(this);
                    } catch (e) {
                    }

                    //update view
                    this.render();

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

        },
        _cancelTrigger: function (floorNum) {
            Util.arrayRemove(this.targetFloors, floorNum);

            //
            this.panelViewNode.find('li').eq(floorNum - 1).removeClass('active');
        },
        _triggerCallList: function (type1, type2) {
            try {
                if (this.calllist[type1].length < 1 && type2) {
                    this.calllist[type2].sort(function (a, b) {
                        return  a > b;
                    });
                    if (type2 == 'up') {
                        this.go(this.calllist[type2][0]);
                        this.cancelCall(this.calllist[type2][0], type2);
                    } else if (type2 == 'down') {
                        this.go(this.calllist[type2][this.calllist[type2].length - 1]);
                        this.cancelCall(this.calllist[type2][this.calllist[type2].length - 1], type2);
                    }
                } else {
                    for (var i = this.calllist[type1].length; i--;) {
                        this.go(this.calllist[type1][i]);
                        this.cancelCall(this.calllist[type1][i], type1);
                    }
                }
            } catch (e) {

            }
        }
    });

    //public method
    Util.method(Elevator, {
        go: function (floorNum) {
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
            if (floorNum > this.currentFloor && type == 'up' && this.moveDir == 'up' ||
                floorNum < this.currentFloor && type == 'down' && this.moveDir == 'down' ||
                this.moveDir == '' && this.status == 'stop' ||
                this.targetFloors.length < 1) {
                this.go(floorNum);
                this.cancelCall(floorNum, type);
            } else {
                if (Util.arrayGetIndex(this.calllist[type], floorNum) == undefined) {
                    this.calllist[type].push(floorNum);
                }
            }
        },
        cancelCall: function (floorNum, type) {
//            this.e.trigger('cancel-call', {
//                floorNum: floorNum,
//                type: type
//            });
            Util.arrayRemove(this.calllist[type], floorNum);
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
                        '<div id="light-' + this.id + '" class="light"></div>',
                        '<div id="elevator-' + this.id + '" class="elevator">',
                    '<i class="l"></i>',
                    '<i class="r"></i>',
                    '</div>'
                ].join('');

                node.append(this.view);
                node.append(this.panelView);

                this.viewNode = $('#elevator-' + this.id);
                this.panelViewNode = $('#elevator-panel-' + this.id);
                this.lightNode = $('#light-' + this.id);
                this.ldoorNode = this.viewNode.find('i.l');
                this.rdoorNode = this.viewNode.find('i.r');

                this.panelViewNode.on('click', Util.proxy(function (e) {
                    this.go($(e.target).html() * 1 || undefined);
                }, this));

            } else {

                //update
                this.viewNode.css('bottom', this.distance);
                this.lightNode.html(this.moveDir.toLocaleUpperCase());

            }
        }
    });

    module.exports = Elevator;

});
