//========================================================================================
//Abu Dhabi bus trip planner
//2016
//data model main module
//handles all data - related computations and builds data structures to support 
//application functionality
//========================================================================================

var DataModel = function(bus_routes_data, bus_stops, map_objects, max_walking_distance_meters) {

    //bus_routes_daat, bus_stops and map_objects come from datascrtips 
    //genrated by Python utility. 
    //max_walking_distance_meters is a tuning variables - it 
    //represents max distance at which it is still considered ok to walk from one object to another
    //decorate objects accrodingly 
    //https://www.iconfinder.com/icons/452386/bus_buss_coach_shuttle_icon#size=48
    this.bus_routes_data = bus_routes_data;

    this.bus_stops = bus_stops;
    this.map_objects = map_objects;

    //add unique integer ID for easy comparisons between various objects. 
    //the idea is that within this applciation all we care about 
    //is if two objects have same "parent" from original data scripts. 
    var object_idx = 1
    object_idx = this.decorate_objects(this.bus_stops, object_idx, "bus_stops");
    object_idx = this.decorate_objects(this.map_objects, object_idx, "map_objects");
    this.decorate_objects(this.bus_routes_data, object_idx, "bus_routes_data");

    //add extra fields to map objects - bus stops and desitnations. 
    this.decorate_map_objects(this.bus_stops);
    this.decorate_map_objects(this.map_objects);

    this.all_map_objects = this.map_objects.concat(this.bus_stops);

    this.destinations_by_source = {}
    this.max_walking_distance_meters = max_walking_distance_meters;
    this.matrix_items = Array();
    this.local_distance_matrix = Array();
    this.infinite_walking_distance = 1000 * this.max_walking_distance_meters;
    this.build_local_distance_matrix();
    this.filtered_map_objects = new FilteredArray(this.all_map_objects, "all_map_objects");

    //There is one reacheable object for each  source. 
    //it contains a list of objects that can be reached 
    //by taking a bus and walking.
    //i.e., destination object is reacheable form source 
    //if there is a bus stop close enough to source, then 
    //there is bus stop on the same route close enough to destination.
    this.reacheable_objects_by_source = Array();

    this.bus_routes = new BusRoutes(this.bus_routes_data, this.bus_stops, this);
}

DataModel.prototype.convert_to_array_of_coordinates = function(map_objects) {
    //takes array of map objects and returns array of lat lon objects 
    var coordinates = Array();

    $.each(map_objects, function(idx, o) {
        coordinates.push({ lat: o.lat, lng: o.lng })
    })

    return coordinates;
}

DataModel.prototype.get_map_center_coordinates = function() {
    //used during initialization to center map better (ensure all sources and distiunations are shown at 
    //each step)
    var min_lat = 1000.0;
    var min_lng = 1000.0;
    var max_lat = -1000.0;
    var max_lng = -1000.0;
    $.each(this.all_map_objects, function(idx, o) {
        if (o.lat < min_lat) {
            min_lat = o.lat;
        }

        if (o.lng < min_lng) {
            min_lng = o.lng;
        }

        if (o.lat > max_lat) {
            max_lat = o.lat;
        }

        if (o.lng > max_lng) {
            max_lng = o.lng;
        }
    })

    var r_lat = (max_lat + min_lat) / 2.0;
    var r_lng = (max_lng + min_lng) / 2.0;
    return ({ lat: r_lat, lng: r_lng });
}

DataModel.prototype.map_objects_are_equal = function(o1, o2) {
    //comparison based on object id
    if ((o1.hasOwnProperty("object_id")) && (o2.hasOwnProperty("object_id"))) {
        return (o1.object_id === o2.object_id)
    } else {
        return false;
    }
}

DataModel.prototype.get_reacheable_objects = function(source) {
    //see if list was already built for this source. If 
    //yes - return it, if not - build it and memorize for future use. 
    var reacheable_map_objects = Array();
    for (var i = 0, len = this.reacheable_objects_by_source.length; i < len; i++) {
        if (this.reacheable_objects_by_source[i].source === source) {
            reacheable_map_objects = this.reacheable_objects_by_source[i].reacheable_map_objects;
        }
    }

    if (reacheable_map_objects.length > 0) {
        return reacheable_map_objects;
    }

    var routes_to_check = this.bus_routes.get_list_of_routes_object_can_be_reached_from(source);

    for (var i = 0, len = routes_to_check.length; i < len; i++) {

        var reacheable_objects = new ReacheableObjects(source,
            this.bus_routes.by_number[routes_to_check[i]].walkable_stops,
            routes_to_check[i],
            this,
            this.map_objects);


        reacheable_map_objects = reacheable_objects.merge_reacheable_objects(reacheable_map_objects);
    }

    var stored_object = {
        reacheable_map_objects: reacheable_map_objects,
        source: source
    }

    this.reacheable_objects_by_source.push(stored_object);
    return reacheable_map_objects;
}

DataModel.prototype.get_map_objects = function(filter) {
    //retuns map objects that match the filter (i.e. each property of filter matches 
    //each property of map object)
    return this.filtered_map_objects.get_filtered_objects(filter);
}

DataModel.prototype.assign_marker_idxs = function(objects, idxs) {
    //indexes into markers array - to be called by controller after map was initialized.
    for (var i = 0, len = objects.length; i < len; i++) {
        objects[i]['marker_idx'] = idxs[i];
    }
}

DataModel.prototype.decorate_map_objects = function(objects) {
    for (var i = 0, len = objects.length; i < len; i++) {
        objects[i]["idx_into_distance_matrix"] = -1;

        //in this verion only communities can be sources 
        if (objects[i].class === "community") {
            objects[i].map_icon = "image/source_marker.png"
        } else {
            objects[i].map_icon = "image/destination_marker.png"
        }

        //need these for Panoramio API to search for photos in
        //a box around the location point
        objects[i]["search_window_upper_right_corner"] = get_destination_point(objects[i].lat, objects[i].lng, 1000, 45);
        objects[i]["search_window_lower_left_corner"] = get_destination_point(objects[i].lat, objects[i].lng, 1000, 225);

        //create names for GUI
        //exclude "al" at the beggining 
        var str = objects[i].name;
        var tokens = str.toLowerCase().split(" ");
        if (tokens[0] === "al") {

            str = substring_after_tag(str.toLowerCase(), "al").trim();
        }
        objects[i]["searcheable_words"] = str;
        //this is default constant display of the names
        objects[i]['default_formatted_displayed_name_for_filter'] = "<b>" + objects[i].name + "</b>";
        //this is used to highlight characters
        objects[i]["formatted_displayed_name_for_filter"] =
            ko.observable("<b>" + objects[i].name + "</b>");
    }

}

DataModel.prototype.get_data_object = function(data_model_array_name, idx_into_data_model_array) {
    //get an object based on its data model array name and index into this array. 
    return this[data_model_array_name][idx_into_data_model_array];
}

DataModel.prototype.decorate_objects = function(objects, object_idx, data_model_array_name) {
    for (var i = 0, len = objects.length; i < len; i++) {
        objects[i]["object_id"] = object_idx;
        objects[i]["data_model_array_name"] = data_model_array_name;
        objects[i]["idx_into_data_model_array"] = i;
        object_idx++;
    }
    return object_idx;
}


DataModel.prototype.objects_within_walking_distance = function(o1, o2) {
    if (this.estimate_distance_between_two_map_objects(o1, o2) < this.max_walking_distance_meters) {
        return true;
    }
    return false;
}

DataModel.prototype.estimate_distance_between_two_map_objects = function(o1, o2) {
    if (this.map_objects_at_same_location(o1, o2)) {
        return 0;
    }

    var d = get_distance_between_two_locations(o1.lat, o1.lng, o2.lat, o2.lng);
    return d;
}

DataModel.prototype.map_objects_at_same_location = function(o1, o2) {
    if ((o1.lng === o2.lng) && (o1.lat === o2.lat)) {
        return true;
    }
    return false;
}

DataModel.prototype.map_object_location_is_in_array = function(o, map_objects) {
    for (var i = 0, len = map_objects.length; i < len; i++) {
        if (this.map_objects_at_same_location(o, map_objects[i])) {
            return true;
        }
    }
}

DataModel.prototype.get_object_idx = function(o, array_of_objects) {
    for (var i = 0, len = array_of_objects.length; i < len; i++) {
        if (o.object_id === array_of_objects[i].object_id) {
            return i;
        }
    }

    return -1;
}

DataModel.prototype.location_is_ok_for_walking = function(o) {
    //the idea is to cover locations user actually checked himself and knows they 
    //are "walkable". All map_objects are walkable, and bus stops have a field indicating 
    //they are "walkable".
    if (o.item_type === "map_object") {
        return true;
    }

    if ((o.item_type === "bus_stop") && (o.verified_for_walking === "yes")) {
        return true;
    }

    return false;
}

DataModel.prototype.build_local_distance_matrix = function() {
    //Google Maps API does not allow to pull more than 25 origins or destinations or 
    //get more than 100 items in one request.
    //Thus, to minimize (or exlcude) requests to maps API for estimating distances, 
    //  , 
    //the idea is to use locally built matrix for 
    //estimated distances and then process the locations that are close
    //(no point to calculate exact walking distance for points that are >2000 m away anayway)
    // 
    //see http://www.movable-type.co.uk/scripts/latlong.html
    this.prepare_locations_for_distance_matrix();
    this.populate_local_distance_matrix();
}

DataModel.prototype.prepare_locations_for_distance_matrix = function() {

    var locations = Array();

    function add_map_objects(objects, self) {

        for (var i = 0, len = objects.length; i < len; i++) {
            if (self.location_is_ok_for_walking(objects[i])) {

                locations.push(objects[i]);
            }
        }
    }
    add_map_objects(bus_stops, this);
    add_map_objects(map_objects, this);

    this.matrix_items = locations;
}

DataModel.prototype.get_estimated_distance_in_meters_between_two_objects = function(o1, o2) {
    //get distance based on pre-built distance matrix
    var row_idx = o1.idx_into_distance_matrix;
    var col_idx = o2.idx_into_distance_matrix;

    if ((row_idx === -1) || (col_idx === -1)) {
        return this.infinite_walking_distance; //if it is not in the matrix - path is not "walkable"
    }
    if (col_idx < row_idx) {
        row_idx = o2.idx_into_distance_matrix;
        col_idx = o1.idx_into_distance_matrix;
    }

    return (this.local_distance_matrix[row_idx][col_idx]);
}

DataModel.prototype.populate_local_distance_matrix = function() {
    for (var i = 0, len = this.matrix_items.length; i < len; i++) {
        this.matrix_items[i].idx_into_distance_matrix = i;
        var a = Array(len);
        for (var j = i, len = this.matrix_items.length; j < len; j++) {
            var d = this.estimate_distance_between_two_map_objects(this.matrix_items[i], this.matrix_items[j]);
            a[j] = d;
        }
        this.local_distance_matrix.push(a);
    }
}
