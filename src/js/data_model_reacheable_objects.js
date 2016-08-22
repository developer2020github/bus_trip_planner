
//========================================================
//Bus trip planner
//2016
//Author:  developer2020 
//e-mail:  dev276236@gmail.com
//========================================================

//========================================================================================
//reachable objects - part of data model 
//builds a list of map objects reachable from a source via a particular bus route 
//========================================================================================

var ReacheableObjects = function(source, array_of_walkable_bus_stops, bus_route, data_model, map_objects) {
    //inputs:
    //source  - source provided by gui view via controller (selected by user)
    //it is assumed that source itself is reachable.
    //array of walkable_bus_stops -  one array per route - stops that are ok for walking (supplied with the 
    //data - these are stops that are convenient for walking)
    //route - just route number 
    //map objects - all map objects (not bus stops)

    this.source = source;
    this.via_bus_route = bus_route;
    this.reacheable_map_objects = Array();
    this.data_model = data_model;

    for (var i = 0, len_i = map_objects.length; i < len_i; i++) {
        var reacheable_map_object = {};
        for (var j = 0, len_j = array_of_walkable_bus_stops.length; j < len_j; j++) {
            var dist = this.data_model.estimate_distance_between_two_map_objects(map_objects[i], array_of_walkable_bus_stops[j]);

            //eliminate sources user can just walk to without taking a bus
            var walking_dist = this.data_model.estimate_distance_between_two_map_objects(map_objects[i], this.source);
            if ((dist < this.data_model.max_walking_distance_meters) &&
                (walking_dist > this.data_model.max_walking_distance_meters)) {
                if ($.isEmptyObject(reacheable_map_object)) {
                    reacheable_map_object = $.extend({}, map_objects[i]);
                    reacheable_map_object.closest_stop_idx_into_data_model_array = array_of_walkable_bus_stops[j].idx_into_data_model_array;
                    reacheable_map_object.closest_stop_data_model_array = array_of_walkable_bus_stops[j].data_model_array_name;
                    reacheable_map_object.distance_to_closest_stop = dist;

                    reacheable_map_object.via_bus_routes = Array();
                    reacheable_map_object.via_bus_routes.push(this.via_bus_route);
                } else {
                    if (reacheable_map_object.distance_to_closest_stop > dist) {
                        reacheable_map_object.closest_stop_idx_into_data_model_array = array_of_walkable_bus_stops[j].idx_into_data_model_array;
                        reacheable_map_object.closest_stop_data_model_array = array_of_walkable_bus_stops[j].data_model_array_name;
                        reacheable_map_object.distance_to_closest_stop = dist;
                    }
                }
            }
        }

        if (!($.isEmptyObject(reacheable_map_object))) {
            this.reacheable_map_objects.push(reacheable_map_object);
        }
    }
};

ReacheableObjects.prototype.compare_reachable_objects = function(o1, o2) {
    //will return 0 if objects are the same and their closest stop is the same
    //will return 1 if objects are the same but first route has a closer stop
    //will return 2 if objects are the same but second route has a closer stop
    //will return -1 otherwise
    if (!(this.data_model.map_objects_are_equal(o1, o2))) {
        return -1;
    }

    var closest_stop1 = this.data_model.get_data_object(o1.closest_stop_data_model_array, o1.closest_stop_idx_into_data_model_array);
    var closest_stop2 = this.data_model.get_data_object(o2.closest_stop_data_model_array, o2.closest_stop_idx_into_data_model_array);

    if (this.data_model.map_objects_are_equal(closest_stop1, closest_stop1)) {
        return 0;
    }

    if (o1.distance_to_closest_stop < o2.distance_to_closest_stop) {
        return 1;
    } else {
        return 2;
    }

    return -1; //default
};

ReacheableObjects.prototype.merge_reacheable_objects = function(reacheable_map_objects) {
    //many destination objects are reachable via multiple routes. 
    //this method will merge info into one array, eliminating duplicates,  and return it.
    var merged = Array();
    merged = merged.concat(this.reacheable_map_objects);
    if ($.isEmptyObject(reacheable_map_objects)) {
        return merged;
    }

    //step 1 - see which objects already in merged should be overwritten 
    //(because there is a closer
    //stop in the reacheable_map_objects then currently in merged) or 
    //updated with extra bus route information (if stop belongs to same route)
    var i = 0; 
    var len = 0;
    for (var j = 0, len1 = merged.length; j < len1; j++) {
        for (i = 0, len = reacheable_map_objects.length; i < len; i++) {
            var cmp = this.compare_reachable_objects(merged[j], reacheable_map_objects[i]);
            if (cmp === 2) {
                //second route has closer stop. overwrite first stop info
                merged[j] = $.extend({}, reacheable_map_objects[i]);
            }
            if (cmp === 0) {
                //add extra route information 
                merged[j].via_bus_routes = merged[j].via_bus_routes.concat(reacheable_map_objects[i].via_bus_routes);
            }
        }
    }

    //step 2 - add new objects 
    for (i = 0, len = reacheable_map_objects.length; i < len; i++) {
        if (this.data_model.get_object_idx(reacheable_map_objects[i], merged) === -1) {
            merged.push(reacheable_map_objects[i]);
        }
    }

    return merged;
};
