//this module will display objects on the map.
//computational part of teh job should be done by controller

var MapHandler = function(initial_pos) {
    this.controller = {};
    this.mapDiv = document.getElementById('map');

    this.map = new google.maps.Map(this.mapDiv, {
        center: initial_pos,
        zoom: 12,
        mapTypeControl: true,
        mapTypeControlOptions: {
            position: google.maps.ControlPosition.LEFT_BOTTOM
        }
    });

    this.list_of_locations = Array();
    this.list_of_bus_routes = Array();

    /*
    on load: 
    - show all locations (except for bus stops) 
    - on step 1: show only communities (call show_location_of_a_class)
    - on step 1 upon selection: bounce selected community
    - on step 2 (transition from step 1): show only selected community. 
      show list of destinations reachnable from this community.
     - on step 2 upon selection: bounce selected destination
     - on step 3 show all bus routes in different colors 
     - on step 4 upon transition: show only selected source, selected destionation, bus routes and walking directions 
     from and to relevant stops 
     display extra information on each step.  
    */
}

MapHandler.prototype.init_locations = function(locations) {
    var markers = Array();
    console.log(locations);
    for (var i = 0, len = locations.length; i < len; i++) {
        var psn = {};
        psn['lat'] = locations[i].lat;
        psn['lng'] = locations[i].lng;

        var click_call_back_generator = function(controller, data_model_array_name, idx_into_data_model_array) {
            return function() {
                controller.process_marker_click(data_model_array_name, idx_into_data_model_array);
            };
        }
        var marker_click_call_back = click_call_back_generator(this.controller, locations[i].data_model_array_name, locations[i].idx_into_data_model_array);
        var marker = new google.maps.Marker({
            position: psn,
            map: this.map,
            title: locations[i].name
        })
        marker.addListener('click', marker_click_call_back)
        marker.setVisible(false);
        markers.push(marker);
    }


    return markers;
}

MapHandler.prototype.add_locations = function(list_of_locations) {
    //should add all locations map is aware of. 
    //locations should have class, name, coordinates and icon (source or desitantion)
    //bus stops must also have an ID and list of locations that are reachable 
    //by default all locations are hodden 
    for (var i = 0; i < list_of_locations.length; i++) {
        var current_location = new TransitLocation(list_of_locations[i]);
        this.list_of_locations.push(current_location);
    }
}

MapHandler.prototype.add_bus_route = function(list_of_stops) {
    //each route should be stored as an array of stops from start to end. 
    //each route should have its color (assigned by map)
    //each route should have a function to display and hide itself
    //Route should have two distinct icons for stops: source and destination. 
    //source: place you can walk to 
    //destination: place you can walk from 
}

MapHandler.prototype.show_locations = function(list_of_location_names) {
    //should show locations on the map with standard icons 
}


MapHandler.prototype.select_location = function(list_of_location_names) {
    //should bounce location icon
}
