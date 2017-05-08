
//========================================================
//Bus trip planner
//2016
//Author:  developer2020 
//e-mail:  dev276236@gmail.com
//========================================================

//========================================================================================
//map handler  - handles map-related objects: map itself, markers, info windows, 
//route lines
//========================================================================================

var MapHandler = function(initial_pos, center_shift) {
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

    var self = this;
    google.maps.event.addListenerOnce(this.map, "projection_changed", function() {
        //re-center map to ensure GUI does not cover markers
        var p = latLng2Point(self.map.getCenter(), self.map);
        p.x = p.x - center_shift;
        var newLatLng = point2LatLng(p, self.map);
        self.map.setCenter(newLatLng);
    });

    this.map_active_windows_markers = Array();
    this.map_active_lines = Array();

    this.list_of_locations = Array();
    this.list_of_bus_routes = Array();
    this.direction_displays = Array();
    //all markers are created once and stored in an array.
    //all operations performed on markers will be requested 
    //via indexes into this array: upon creation of markers
    //controller should ensure all map objects have their marker idxs assigned to them,
    //so each map object has a way to connect to its marker.
    this.markers = Array();

    //I feel info windows might be a bit annoying in a bus trip 
    //planning application, yet have to include them to meet requirements. As an option, 
    //will give control to user in the subsequent versions of the program. 
    this.info_windows_enabled = true;

    this.debug_options = {};

    //if this debug option is set to true, corners of Panoramio search squares will show on the map.
    //should always be set to false for released versions of the program. 
    this.debug_options.show_corner_markers = false;
};

MapHandler.prototype.stop_animation = function(marker) {
    setTimeout(function() {
        marker.setAnimation(null);
    }, 3000);
};

MapHandler.prototype.animate_marker = function(marker_idx) {
    //animates marker with idx === marker_idx
    this.markers[marker_idx].setAnimation(google.maps.Animation.BOUNCE);
    this.stop_animation(this.markers[marker_idx]);
};

MapHandler.prototype.set_map_to_null = function(items) {
    //a shortcut to set map to null to an array of objects
    $.each(items, function(idx, i) {
        i.setMap(null);
    });
};

MapHandler.prototype.remove_directions_display = function() {
    //removes all direction lines and eliminates all relevant memorized data
    this.set_map_to_null(this.direction_displays);
    this.direction_displays = [];
    this.set_map_to_null(this.map_active_lines);
    this.map_active_lines = [];
};

MapHandler.prototype.draw_walking_path = function(coordinates) {
    //shows a green walking path between two points - 
    //source to a bus stop or from a bus stop to destination
    var directions_service = new google.maps.DirectionsService();

    var directions_display = new google.maps.DirectionsRenderer({
        map: this.map,
        preserveViewport: true,
        suppressMarkers: true,
        polylineOptions: { strokeColor: '#5cb85c' }
    });


    var request = {
        origin: coordinates[0],
        destination: coordinates[1],
        travelMode: google.maps.TravelMode.WALKING
    };

    var self = this;

    directions_service.route(request, function(result, status) {
        if (status == google.maps.DirectionsStatus.OK) {
            directions_display.setDirections(result);
            self.direction_displays.push(directions_display);
        } else {
            // if can't get proper directions - still can draw a straight line 
            //(better than nothing)
            self.draw_source_destination_bus_line(coordinates);
        }
    });
};

MapHandler.prototype.show_marker = function(marker_idx) {
    this.markers[marker_idx].setVisible(true);
};

MapHandler.prototype.hide_all_markers = function() {
    //hides all markers
    $.each(this.markers, function(idx, m) {
        m.setVisible(false);
    });
};

MapHandler.prototype.hide_marker = function(marker_idx) {
    this.markers[marker_idx].setVisible(false);
};

MapHandler.prototype.draw_source_destination_bus_line = function(coordinates) {
    //this is a simplified version - used for first release 
    //(or may keep it if like it - this program is about walking directions, 
    //does not matter much how exactly bus gets from a to b) - 
    //shows a straight blue line with an arrow between source and destination bus stops
    var line_symbol = {
        path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW
    };

    // Create the polyline and add the symbol via the 'icons' property.
    var line = new google.maps.Polyline({
        path: coordinates,
        icons: [{
            icon: line_symbol,
            offset: '100%'
        }],

        strokeColor: "#2525B2",
        strokeOpacity: 1.0,
        strokeWeight: 2
    });

    line.setMap(this.map);
    this.map_active_lines.push(line);
};

MapHandler.prototype.draw_line = function(coordinates) {
    //this is tested but not used in the first version of the program - 
    //need to add more points or use google driving directions 
    //function to display routes properly. 
    //console.log("MapHandler.prototype.draw_line");
    //console.log(coordinates);
    var line = new google.maps.Polyline({
        path: coordinates,
        strokeColor: "#2525B2",
        strokeOpacity: 1.0,
        strokeWeight: 2
    });

    line.setMap(this.map);
    this.map_active_lines.push(line);
};

MapHandler.prototype.remove_walking_directions = function() {
    $.each(this.direction_displays, function(idx, d) {
        d.setMap(null);
    });
    this.direction_displays = [];
};

MapHandler.prototype.remove_lines = function() {
    $.each(this.map_active_lines, function(idx, line) {
        line.setMap(null);
    });
    this.map_active_lines = [];
};

//need to replace panoramio APi with Google places as Panoramio is not available any more
//    //https://developers.google.com/maps/documentation/javascript/places#places_photos
//https://developers.google.com/places/web-service/photos
//Record of work done: 
//0. Went to https://developers.google.com/maps/documentation/javascript/places
//1. Enabled google places API for this application. 
MapHandler.prototype.google_places_pictures = function(o){
    //new google.maps.LatLng(-34, 151)
    //bounds, which must be a google.maps.LatLngBounds object defining the rectangular search area; 
    //google.maps.LatLngBounds class
    //LatLngBounds(sw?:LatLng|LatLngLiteral, ne?:LatLng|LatLngLiteral)    Constructs a rectangle from the points at its south-west and north-east corners.
    //south west is lower left and north east is upper right 
    var o_sw = new google.maps.LatLng(o.search_window_lower_left_corner.lat, o.search_window_lower_left_corner.lng); 
    var o_ne = new google.maps.LatLng(o.search_window_upper_right_corner.lat, o.search_window_upper_right_corner.lng); 
    var search_bounds = new google.maps.LatLngBounds(o_sw, o_ne);

    var request = {bounds: search_bounds};
    //stopped here - function callback was copied from https://developers.google.com/maps/documentation/javascript/places but not customized yet
        function callback(results, status) {
      if (status == google.maps.places.PlacesServiceStatus.OK) {
        for (var i = 0; i < results.length; i++) {
          var place = results[i];
          console.log("found some places!")
          console.log(results[i]);
          var photos = place.photos;
          if (photos){
           var url = photos[0].getUrl({'maxWidth': 100, 'maxHeight': 100})
           console.log("photo url:"); 
           console.log(url); // this is working - return correct urls for photos; need to select ones that have locality in type
          }

          //createMarker(results[i]);
        }
      }
    }
    service = new google.maps.places.PlacesService(this.map);
    service.nearbySearch(request, callback);
}


MapHandler.prototype.get_panoramio_request_url = function(o) {
    //builds a request url for Panoramio API
    // take a look at 

    var panoramio_url = "http://www.panoramio.com/map/get_panoramas.php?" +
        "order=popularity" +
        "&set=public" +
        "&from=0" +
        "&to=30" +
        "&minx=" + o.search_window_lower_left_corner.lng.toString() +
        "&miny=" + o.search_window_lower_left_corner.lat.toString() +
        "&maxx=" + o.search_window_upper_right_corner.lng.toString() +
        "&maxy=" + o.search_window_upper_right_corner.lat.toString() +
        "&size=small" +
        "&mapfilter=true" +
        "&callback=?";
    return panoramio_url;
};

MapHandler.prototype.get_best_matching_panoramio_photo = function(o, panoramio_photos) {
    //some photos, while are taken on the location, do not really show what we 
    //want to show (example - a photo of a building facing community but not a part of it)
    //this function will try to get the best match by photo title. 
    //for otherwise equal photos take more "square" ones
    var best_match = panoramio_photos[0];
    var max_dice_coefficient = get_dice_coefficient(o.name, panoramio_photos[0].photo_title);
    var min_square_ratio = get_square_ratio(panoramio_photos[0].height, panoramio_photos[0].width);

    $.each(panoramio_photos, function(idx, photo) {
        var dice_coefficient = get_dice_coefficient(o.name, photo.photo_title);
        var square_ratio = get_square_ratio(photo.height, photo.width);
        if ((dice_coefficient > max_dice_coefficient) ||
            ((values_within_tolerance(max_dice_coefficient, dice_coefficient, 5)) && (square_ratio < min_square_ratio))) {
            best_match = photo;
            max_dice_coefficient = dice_coefficient;
            min_square_ratio = square_ratio;
        }

    });
    return best_match;
};

MapHandler.prototype.display_info_window = function(o) {
    //shows info window attached to a marker based on a passed map object. 
    if (!this.info_windows_enabled) {
        return;
    }

    var self = this;
    var marker = this.markers[o.marker_idx];

    var open_window = function(self, include_image, image_url) {
        var content_string = '<div id="content">' +
            '<div id = "location_name">' +
            o.name +
            '</div>';
        if (include_image) {
            content_string = content_string +
                '<div id ="image">' +
                "<img src=" + "\"" + image_url + "\"" + "alt=\"" + "" + "\"" + ">" +
                '</div>';
        }

        content_string = content_string + "</div>";
        var infowindow = new google.maps.InfoWindow({
            content: content_string
        });

        infowindow.open(self.map, marker);
        self.map_active_windows_markers.push(infowindow);
    };

    console.log("calling google_places_pictures");

    this.google_places_pictures(o);

    $.getJSON(this.get_panoramio_request_url(o))
        .done(function(data) {
            var best_photo = self.get_best_matching_panoramio_photo(o, data.photos);
            open_window(self, true, best_photo.photo_file_url);
        })
        .fail(function() {
            //if request to panoramio fails - still open window with the place name , without 
            //any images
            open_window(self, false);
        });
};

MapHandler.prototype.close_all_info_windows = function() {
    //close all the windows on the map 
    $.each(this.map_active_windows_markers, function(idx, win) {
        win.close();
    });

    this.map_active_windows_markers = [];
};

MapHandler.prototype.init_locations = function(locations) {
    //initialization function - should be called after map 
    //handler object was created. Accepts an array of map objects, returns array of marker idxs 
    //- controller should ensure these idxs are assigned to appropriate objects. 
    var markers_idxs = Array();
    for (var i = 0, len = locations.length; i < len; i++) {
        var psn = {};
        psn.lat = locations[i].lat;
        psn.lng = locations[i].lng;

        var click_call_back_generator = function(controller, data_model_array_name, idx_into_data_model_array) {
            return function() {
                controller.process_marker_click(data_model_array_name, idx_into_data_model_array);
            };
        };
        var marker_click_call_back = click_call_back_generator(this.controller, locations[i].data_model_array_name, locations[i].idx_into_data_model_array);
        var marker = new google.maps.Marker({
            position: psn,
            map: this.map,
            title: locations[i].name,
            icon: locations[i].map_icon
        });
        marker.addListener('click', marker_click_call_back);
        marker.setVisible(false);
        this.markers.push(marker);
        markers_idxs.push(i);
        if (this.debug_options.show_corner_markers) {
            var right_corner_marker = new google.maps.Marker({
                position: locations[i].search_window_upper_right_corner,
                map: this.map,
                title: locations[i].name + " right corner"
            });
            var left_corner_marker = new google.maps.Marker({
                position: locations[i].search_window_lower_left_corner,
                map: this.map,
                title: locations[i].name + " left  corner"
            });
        }
    }
    return markers_idxs;
};
