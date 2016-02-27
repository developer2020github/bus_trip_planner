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

var CITY_NAME = "ABU DHABI"
var controller = {}; 


//============================
var Controller = function() {
    var self = this;
    var map_hanler = {}; 
    this.map_markers = {}; 
    this.data_model = new DataModel(bus_routes_data, bus_stops, map_objects, 2000);
    this.gui_view = new GUIViewModel(this, CITY_NAME);
    
    
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
Controller.prototype.process_marker_click = function(data_model_array_name, idx_into_data_model_array){

    var obj = this.data_model.get_data_object(data_model_array_name, idx_into_data_model_array);
    var idx  = this.gui_view.get_idx_of_item_by_field_value(this.gui_view.current_filter_list, obj.name, "name");
    if (idx>-1){
        this.gui_view.filtered_location_name(obj.name);
    }
}
Controller.prototype.set_filtered_item = function(item) {
  if (item.hasOwnProperty('idx_into_data_model_array')){
    this.map_handler.animate_marker(this.markers[item.idx_into_data_model_array]);
    this.map_handler.display_info_window(this.markers[item.idx_into_data_model_array], item);
}

}
Controller.prototype.set_filtered_source = function(source) {


}
Controller.prototype.hide_markers = function(){
     $.each(this.markers, function(index, marker) {
           marker.setVisible(false);
        });
}

Controller.prototype.process_step_update = function() {
    this.hide_markers();
    this.map_handler.close_all_info_windows();
    if (this.gui_view.current_step() < 3) {
       
        for (var i = 0, len = this.gui_view.current_filter_list().length; i < len; i++) {
            this.markers[this.gui_view.current_filter_list()[i].idx_into_data_model_array].setVisible(true);

        }
        if  (this.gui_view.current_step()==2){
            this.markers[this.gui_view.selected_source().idx_into_data_model_array].setVisible(true);
            
        }
    }else if (this.gui_view.current_step()==3){
       this.markers[this.gui_view.selected_source().idx_into_data_model_array].setVisible(true);
       this.markers[this.gui_view.selected_destination().idx_into_data_model_array].setVisible(true);
    }else if (this.gui_view.current_step()==4){
        console.log("this.gui_view.current_step()==4");

        var stop1 = this.data_model.bus_routes.get_closest_stop(this.gui_view.selected_bus_route().name, this.gui_view.selected_source());
        var stop2 = this.data_model.bus_routes.get_closest_stop(this.gui_view.selected_bus_route().name, this.gui_view.selected_destination());
        //var route = this.data_model.bus_routes.get_route_between_stops(this.gui_view.selected_bus_route().name, stop1, stop2);
     
        var conv = this.data_model.convert_to_array_of_coordinates;
        //this.map_handler.draw_line(route_coordinates);
        this.map_handler.draw_source_destination_bus_line(conv([stop1, stop2]));

        this.map_handler.draw_walking_path(conv([this.gui_view.selected_source(), stop1]));
        this.map_handler.draw_walking_path(conv([stop2, this.gui_view.selected_destination()]));
    }
}

Controller.prototype.set_map_available = function(){
   this.gui_view.map_loaded(true);
   this.markers = this.map_handler.init_locations(this.data_model.map_objects);
   this.process_step_update(); 
} 

function initMap() {
    
    var map_handler = new MapHandler(controller.data_model.get_map_center_coordinates());
    controller.map_handler = map_handler; 
    map_handler.controller = controller;
    controller.set_map_available();
    //controller.set_map_available();  

}




(function main() {
    controller = new Controller();
})();
