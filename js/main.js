//========================================================================================
//Abu Dhabi bus trip planner
//2016
//Main module (controller)
//========================================================================================
//This is the main module of bus trip planner. 
//
//JS components of the program are: 
//1. GUI view - implemented with Knockout, handles GUI menu. 
//One module (gui_view_model.js)
//
//2.Data model - loads all the data on iniailization, 
//calculates extra data (distrances, reacheable destinations, etc.) 
//and provides data-related services to other 
//portions of the application. 
//Data consists of three modules: 
//data_model_bus_routes.js - internal class of data model
//data_model_reacheable_objects.js - internal class of data model 
//data_model.js - main 
//
//3.  Map handler provides map-related services (show markers, routes, etc.)
//One module (map_handler.j)
//
//4. controller that connects everything together and does 
//extra calculations that do not belong to any other component.
//One module (main.js)
//
//5. Library of generic functions(lib.js)
// Data model is accessable only by contoller. Data model has no access to contoller. 
// map handler and GUI view both can call controller methods and the other way around. 
//
//6. Data scripts - located in folder map/js_data
// There are three scripts: bus_routes.js, bus_stops.js and map_objects.js
// They are generated from excel files by Python script and contain all the 
// data for trip planner. Python script needs to be used only once, to convert Excel into 
// JS. Excel files and Python script are technically not parts of a front-end application, 
// but are provided with the source to facilitate understansding of the data structures. 
//========================================================================================


//========================================================================================
//Constanst (can be made configurable too)
var CITY_NAME = "ABU DHABI"
var MAP_CENTER_SHIFT = 200; //tune map center position so that GUI does not cover markers
var MAX_WALKING_DISTANCE_METERS = 2000;

//======================================================================================
var controller = {};
var Controller = function() {
    var self = this;
    var map_hanler = {};
    this.data_model = new DataModel(bus_routes_data, bus_stops, map_objects, MAX_WALKING_DISTANCE_METERS);
    this.gui_view = new GUIViewModel(this, CITY_NAME);
    this.map_loaded = false;
    ko.applyBindings(this.gui_view);
}

Controller.prototype.map_is_available = function() {
    return this.map_loaded;
}

Controller.prototype.reset_formatted_displayed_names = function(objects) {
    //used on re-initialization of the list to remove highlights 
    $.each(objects, function(idx, o) {
        o.formatted_displayed_name_for_filter(o.default_formatted_displayed_name_for_filter);
    });
    return objects;
}

Controller.prototype.get_filtered_list_for_current_step = function(step) {
    //returns list of items that should be displayed in current step
    var filtered_list = {};

    //step  1 in this version of the program handles only communities
    if (step === 1) {
        filtered_list = this.data_model.get_map_objects({ class: "community" });
    }

    //for step 2, return list of reacheable stops 
    //desitnation object is considered to be reachebale from a source 
    //if
    //1. there is a walkable bus stop closer to the source than max walking distance
    //2. there is a bus route that leads to a stop that is located closer to destination
    //than max walking distance 
    if (step === 2) {
        filtered_list = this.data_model.get_reacheable_objects(this.gui_view.selected_source());
    }

    if (step === 3) {
        //for step 3, we  need a list of bus routes to display
        //need to build bus route objects with the same 
        //interface as map objects so that GUI view could use 
        //same code to display them
        var step_3_routes = Array();
        $.each(this.gui_view.selected_destination().via_bus_routes, function(index, value) {
            var route_to_display = {};
            route_to_display["name"] = value;
            route_to_display["searcheable_words"] = value;
            route_to_display["formatted_displayed_name_for_filter"] = ko.observable("<b>" + value + "</b>");
            route_to_display["default_formatted_displayed_name_for_filter"] = "<b>" + value + "</b>";
            step_3_routes.push(route_to_display);
        });

        filtered_list = step_3_routes;
    }
    return (this.reset_formatted_displayed_names(filtered_list));

}
Controller.prototype.process_marker_click = function(data_model_array_name, idx_into_data_model_array) {
    //is called by map handler when marker is clicked.
    //map hanlder also passed data model array name and idx into it

    var obj = this.data_model.get_data_object(data_model_array_name, idx_into_data_model_array);

    //in step 2, clicking on alreasy selected source should not reset the list - 
    //trip source is not selectable from the list and is always displayed on the map.
    var update_current_filter_list = true;
    if (this.gui_view.current_step() == 2) {
        if (this.data_model.map_objects_are_equal(obj, this.gui_view.selected_source())) {
            update_current_filter_list = false;
        }
    }

    if ((this.gui_view.current_step() < 3) && update_current_filter_list) {
        this.gui_view.update_current_filter_list(this.get_filtered_list_for_current_step(this.gui_view.current_step()));

        var idx = this.gui_view.get_idx_of_item_by_field_value(this.gui_view.current_filter_list, obj.name, "name");
        if (idx > -1) {
            this.gui_view.set_selected_item(obj);
        }
    }
    if (this.map_is_available()) {
        this.map_handler.display_info_window(obj);
        this.map_handler.animate_marker(obj.marker_idx);
    }
}

Controller.prototype.set_filtered_item = function(item) {
    //handles map effects of item selection from a gui view
    if (!this.map_is_available()) {
        return;
    }

    if (item.hasOwnProperty('marker_idx')) {
        this.map_handler.close_all_info_windows();
        this.map_handler.animate_marker(item.marker_idx);
        this.map_handler.display_info_window(item);
    }

}

Controller.prototype.apply_filter_to_markers = function() {
    //ensure only markers that are in current list are shown.
    if (!this.map_is_available()) {
        return;
    }
    this.map_handler.hide_all_markers();

    for (var i = 0, len = this.gui_view.current_filter_list().length; i < len; i++) {
        this.map_handler.show_marker(this.gui_view.current_filter_list()[i].marker_idx);
    }
    //always display seleted source in step 2 
    if (this.gui_view.current_step() === 2) {
        this.map_handler.show_marker(this.gui_view.selected_source().marker_idx);
    }
}

Controller.prototype.process_step_update = function() {
    //called by GUI view on step transitions and 
    //handles map effects 
    if (!this.map_is_available()) {
        return;
    }
    this.map_handler.hide_all_markers();
    this.map_handler.close_all_info_windows();
    this.map_handler.remove_directions_display();
    if (this.gui_view.current_step() < 3) {

        for (var i = 0, len = this.gui_view.current_filter_list().length; i < len; i++) {
            this.map_handler.show_marker(this.gui_view.current_filter_list()[i].marker_idx);
        }
        if (this.gui_view.current_step() == 2) {
            this.map_handler.show_marker(this.gui_view.selected_source().marker_idx)
        }

    } else if (this.gui_view.current_step() == 3) {
        this.map_handler.show_marker(this.gui_view.selected_source().marker_idx);
        this.map_handler.show_marker(this.gui_view.selected_destination().marker_idx);

    } else if (this.gui_view.current_step() == 4) {
        var stop1 = this.data_model.bus_routes.get_closest_stop(this.gui_view.selected_bus_route().name, this.gui_view.selected_source());
        var stop2 = this.data_model.bus_routes.get_closest_stop(this.gui_view.selected_bus_route().name, this.gui_view.selected_destination());

        var conv = this.data_model.convert_to_array_of_coordinates;
        //this.map_handler.draw_line(route_coordinates);
        this.map_handler.draw_source_destination_bus_line(conv([stop1, stop2]));

        this.map_handler.draw_walking_path(conv([this.gui_view.selected_source(), stop1]));
        this.map_handler.draw_walking_path(conv([stop2, this.gui_view.selected_destination()]));
        this.map_handler.show_marker(this.gui_view.selected_source().marker_idx);
        this.map_handler.show_marker(this.gui_view.selected_destination().marker_idx);
    }
}

Controller.prototype.set_map_available = function() {
    //called by map loading callback 
    //and peforms relevant initializations
    this.gui_view.map_loaded(true);

    var marker_idxs = this.map_handler.init_locations(this.data_model.map_objects);
    this.data_model.assign_marker_idxs(this.data_model.map_objects, marker_idxs);
    this.map_loaded = true;
    this.process_step_update();

}

function initMap() {
    //map load call back 
    var map_handler = new MapHandler(controller.data_model.get_map_center_coordinates(), MAP_CENTER_SHIFT);
    controller.map_handler = map_handler;
    map_handler.controller = controller;
    controller.set_map_available();
}


(function main() {
    //main - gets executed first
    controller = new Controller();
})();
