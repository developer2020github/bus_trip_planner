//========================================================================================
//this is the main module. 
//there are 4 following main abstractions in the program: 
//1. GUI view - implemented with Knockout, handles GUI menu
//2. data_model - loads all the data on iniailization, 
//calculates extra data (distrance matrix) and provides data-related services to other 
//portions of the application. 
//3. map_handler - provides map-related services (show routes and points, etc.)
//4. main - controller that connects everything together. 
// Data model is accessable only by contoller. Data model has no access to contoller. 
// map handler and GUI view both can call controller methods and the other way around. 
//========================================================================================
//Data
//data is generated by a separate utility from Excel spreadheets into scripts and 
//is not supposed to be accessed by any object other than data model.
//========================================================================================
//Global variables (plan to  make them configurable too)
var MAP_INITIAL_POS = { lat: 24.4667, lng: 54.3667 }; // do not like the deaulf, need to customize 
var CITY_NAME = "ABU DHABI"

var map_handler;
//==========================
var UpdateMap = function() {
    var self = this;
    self.update_map = function() {
        console.log("map was just updated");
    }
}

//============================
var Controller = function() {
    var self = this;
    this.data_model = new DataModel(bus_routes_data, bus_stops, map_objects, 2000);
    var update_map = new UpdateMap();
    this.gui_view = new GUIViewModel(update_map, self);
    this.gui_view.cityName(CITY_NAME);
    //this.gui_view.update_current_filter_list(this.data_model.get_map_objects({class: "community"}));

    ko.applyBindings(this.gui_view);

    //document.getElementById("nextStepButton").addEventListener("click", this.next_step);
    //document.getElementById("previousStepButton").addEventListener("click", this.previous_step);
}

//console.log(local_distance_matrix);

//=============================
//interface with gui view 
Controller.prototype.get_filtered_list_for_current_step = function(step) {
    if (step === 1) {
        return (this.data_model.get_map_objects({ class: "community" }));
    }
    //for step 2, need to implement list of reacheable stops in data model 

    if (step ===2 ){
        return (this.data_model.get_reacheable_objects(this.gui_view.selected_source()));
    }
 
    if (step===3){
        //for step 3, we just need a lits of bus routes to display
        var step_3_routes = Array();
        $.each(this.gui_view.selected_destination().via_bus_routes, function( index, value ) {
                step_3_routes.push({name: value});
        });

        return step_3_routes;
    }

}
Controller.prototype.set_filtered_item = function(item) {

}
Controller.prototype.set_filtered_source = function(source) {

}

Controller.prototype.process_step_update = function(source) {

}


function initMap() {
    debug_main();
    map_handler = new MapHandler(MAP_INITIAL_POS);
    map_handler.add_locations(bus_stops);

}




(function main() {
    var controller = new Controller();
})();
