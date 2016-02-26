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
    this.info_windows_enabled = true;
    this.debug_options = {};
    this.debug_options["show_corner_markers"] = false;



    //I feel info windows might be a bit annoying in a bus trip 
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

MapHandler.prototype.stop_animation = function(marker) {
    setTimeout(function() {
        marker.setAnimation(null);
    }, 3000);
}

MapHandler.prototype.animate_marker = function(marker) {
    marker.setAnimation(google.maps.Animation.BOUNCE);
    this.stop_animation(marker);
}

MapHandler.prototype.get_panoramio_request_url = function(o) {
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
}

MapHandler.prototype.get_best_matching_panoramio_photo = function(o, panoramio_photos) {
    //some photos, while are taken on the location, do not really show what we 
    //want to show (example - a photo of a buiding facing community but not a part of it)
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

    })
    return best_match;
}


MapHandler.prototype.display_info_window = function(marker, o) {
    if (!this.info_windows_enabled) {
        return;
    }

    var self = this;

    var open_window = function(self, include_image, image_url) {
        var content_string = '<div id="content">' +
            '<div id = "location_name">' +
            o.name +
            '</div>';
        if (include_image) {
            content_string = content_string +
                '<div id ="image">' +
                "<img src=" + "\"" + image_url + "\"" + "alt=\"" + "" + "\"" + ">" +
                '</div>'
        }

        content_string = content_string + "</div>";
        var infowindow = new google.maps.InfoWindow({
            content: content_string
        });

        infowindow.open(self.map, marker);
        self.map_active_windows_markers.push(infowindow);
    }

    $.getJSON(this.get_panoramio_request_url(o))
        .done(function(data) {
            var best_photo = self.get_best_matching_panoramio_photo(o, data.photos);
            open_window(self, true, best_photo.photo_file_url);
        })
        .fail(function() {
            //if request to panoramio fails - still open window with the place name 
            open_window(self, false);
        });
}

MapHandler.prototype.close_all_info_windows = function() {
    $.each(this.map_active_windows_markers, function(idx, win) {
        win.close();
    });

    this.map_active_windows_markers = [];
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

        if (this.debug_options.show_corner_markers) {
            var right_corner_marker = new google.maps.Marker({
                position: locations[i].search_window_upper_right_corner,
                map: this.map,
                title: locations[i].name + " right corner"
            })
            var left_corner_marker = new google.maps.Marker({
                position: locations[i].search_window_lower_left_corner,
                map: this.map,
                title: locations[i].name + " left  corner"
            })
        }


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
