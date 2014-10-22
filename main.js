/**
 * The elevate
 *
 * @author niko
 * @date
 */

//seajs.use('./modules/elevatorControlCenter', function(ElevatorControlCenter) {
//    new ElevatorControlCenter({
//
//    });
//});
seajs.use('./modules/elevator', function(Elevator) {

    var theElevator = new Elevator({
        floors: 10,
        width: 36,
        height: 40
    });
    theElevator.render($('.wrapper'));

});
