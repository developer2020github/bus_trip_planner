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

    this.map_active_windows_markers = Array(); 

    this.list_of_locations = Array();
    this.list_of_bus_routes = Array();
    this.info_windows_enabled = true; //I feel info windows might be a bit annoying in a bus trip 
    //planning application, yet have to include them to meet requirements. As an option, 
    //give control to user. 

    /*
    on load: 
    - show all locations (except for bus stops) ->currently automatically transitioning to step 1
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

MapHandler.prototype.stop_animation = function (marker) {
    setTimeout(function () {
        marker.setAnimation(null);
    }, 3000);
}
MapHandler.prototype.animate_marker = function(marker){
  marker.setAnimation(google.maps.Animation.BOUNCE);
  this.stop_animation(marker); 
}
MapHandler.prototype.display_info_window = function(marker, search_string){
    if (!this.info_windows_enabled){
        return; 
    }

    var contentString = '<div id="content">'+
                          '<div id="siteNotice">'+
                          '</div>'+
                          '<h1 id="firstHeading" class="firstHeading">Uluru</h1>'+
                          '<div id="bodyContent">'+
                          '<p><b>Uluru</b>, also referred to as <b>Ayers Rock</b>, is a large ' +
                          'sandstone rock formation in the southern part of the '+
                          'Northern Territory, central Australia. It lies 335&#160;km (208&#160;mi) '+
                          'south west of the nearest large town, Alice Springs; 450&#160;km '+
                          '(280&#160;mi) by road. Kata Tjuta and Uluru are the two major '+
                          'features of the Uluru - Kata Tjuta National Park. Uluru is '+
                          'sacred to the Pitjantjatjara and Yankunytjatjara, the '+
                          'Aboriginal people of the area. It has many springs, waterholes, '+
                          'rock caves and ancient paintings. Uluru is listed as a World '+
                          'Heritage Site.</p>'+
                          '<p>Attribution: Uluru, <a href="https://en.wikipedia.org/w/index.php?title=Uluru&oldid=297882194">'+
                          'https://en.wikipedia.org/w/index.php?title=Uluru</a> '+
                          '(last visited June 22, 2009).</p>'+
                          '</div>'+
                          '</div>';

     var infowindow = new google.maps.InfoWindow({
                        content: contentString
                      });

     infowindow.open(this.map, marker);

     this.map_active_windows_markers.push(infowindow);

}

MapHandler.prototype.close_all_info_windows = function(){
    $.each(this.map_active_windows_markers, function(idx, win){
        win.close();
    });

    this.map_active_windows_markers=[];
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
            title: locations[i].name, 
            icon: locations[i].map_icon
        })
        marker.addListener('click', marker_click_call_back)
        marker.setVisible(false);
        markers.push(marker);
    }


    return markers;
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
