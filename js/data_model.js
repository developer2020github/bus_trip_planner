//should handle all data - related computations and serve as interface between map and gui 
//(need a data structure: reachable destinations with list of bus routes they can be reached by by source)



/*on next step: 
  controller will provide source and destination selected by user. 
  data model will need to return a list of objects containing 
   source
   source bus stop (stop closest to source)
   bus route number 
   destination bus stop 
   destination 
*/

/* on following step controller will decide which route to use (the one with shortest distance 
between source and destination for now 
now) and request map to draw bus route and path from source to source bus stop, 
and path from destination to destination bus stop*/


//============================================================================================



//============================================================================================
var DataModel = function(bus_routes_data, bus_stops, map_objects, max_walking_distance_meters) {

    //decorate objects accrodingly 
    //https://www.iconfinder.com/icons/452386/bus_buss_coach_shuttle_icon#size=48
    this.bus_routes_data = bus_routes_data;
    //console.log(this.bus_routes);

    this.bus_stops = bus_stops;
    this.map_objects = map_objects;
    
    //add unique integer ID for easy comparisons
    var object_idx = 1
    object_idx = this.decorate_objects(this.bus_stops, object_idx, "bus_stops");
    object_idx = this.decorate_objects(this.map_objects, object_idx, "map_objects");
    this.decorate_objects(this.bus_routes_data, object_idx, "bus_routes_data");

    //this.list_of_bus_numbers = this.build_list_of_bus_routes(); 

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

    //they are not arranged by source in any way (i.e. there is no sorted or
    //any other order) There is one reacheable object for each  source. 
    this.reacheable_objects_by_source = Array();

    this.bus_routes = new BusRoutes(this.bus_routes_data, this.bus_stops, this);
}

DataModel.prototype.convert_to_array_of_coordinates = function(map_objects){
    var coordinates = Array(); 

    $.each(map_objects, function (idx, o){
        coordinates.push({lat: o.lat, lng: o.lng})
    })

    return coordinates; 
}

DataModel.prototype.get_map_center_coordinates=function(){
    var min_lat = 1000.0;
    var min_lng = 1000.0;
    var max_lat = -10.0;
    var max_lng = -10.0;
    $.each(this.all_map_objects, function(idx, o){
        if (o.lat<min_lat){
            min_lat  = o.lat; 
        }

        if (o.lng<min_lng){
            min_lng  = o.lng; 
        }

        if (o.lat>max_lat){
            max_lat  = o.lat; 
        }

         if (o.lng>max_lng){
            max_lng  = o.lng; 
        }
    })

    var r_lat = (max_lat+min_lat)/2.0; 
    var r_lng = (max_lng+min_lng)/2.0;
    //console.log(max_lat, min_lat, max_lng, min_lng);
    return({lat:r_lat, lng:r_lng });
}

DataModel.prototype.map_objects_are_equal=function(o1, o2){
    return (o1.object_id===o2.object_id)
}

DataModel.prototype.get_reacheable_objects = function(source) {
    var reacheable_map_objects = Array(); 
    for (var i = 0, len = this.reacheable_objects_by_source.length; i<len; i++){
         if (this.reacheable_objects_by_source[i].source === source){
            reacheable_map_objects = this.reacheable_objects_by_source[i].reacheable_map_objects;
         }
    }

    if (reacheable_map_objects.length>0){
        return reacheable_map_objects; 
    }

    var routes_to_check = this.bus_routes.get_list_of_routes_object_can_be_reached_from(source);

    for (var i =0, len = routes_to_check.length; i<len; i++){

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
    //console.log('after');
    //console.log(this.reacheable_objects_by_source);
    return reacheable_map_objects; 

}

DataModel.prototype.get_map_objects = function(filter) {
    return this.filtered_map_objects.get_filtered_objects(filter);
}


DataModel.prototype.decorate_map_objects = function(objects) {
    //add fields that are calculated by the application 
    for (var i = 0, len = objects.length; i < len; i++) {
        objects[i]["idx_into_distance_matrix"] = -1;
        if (objects[i].class==="community"){
            objects[i].map_icon = "image/source_marker.png"
        }
        else{
            objects[i].map_icon = "image/destination_marker.png"
        }

        objects[i]["search_window_upper_right_corner"] = this.destination_point(objects[i].lat, objects[i].lng, 1000,45);
        objects[i]["search_window_lower_left_corner"] = this.destination_point(objects[i].lat, objects[i].lng, 1000,225);
    }

}

DataModel.prototype.get_data_object  = function (data_model_array_name, idx_into_data_model_array){
    return this[data_model_array_name][idx_into_data_model_array];
}

DataModel.prototype.decorate_objects = function (objects, object_idx, data_model_array_name){
     for (var i = 0, len = objects.length; i < len; i++) {
        objects[i]["object_id"] = object_idx;
        objects[i]["data_model_array_name"] = data_model_array_name;
        objects[i]["idx_into_data_model_array"] =i;
        object_idx++;
    }
    return object_idx; 
}


//ref http://www.movable-type.co.uk/scripts/latlong.html
// @param   {number} distance - Distance travelled, in same units as earth radius (default: metres).
 //* @param   {number} bearing - Initial bearing in degrees from north.
DataModel.prototype.destination_point = function(lat1, lng1, distance, bearing) {
    //console.log("destination_point");
    //radius = (radius === undefined) ? 6371e3 : Number(radius);
     distance = (distance===undefined)? 1500 : Number(distance);
     bearing = (bearing===undefined)? 45 : Number(bearing);
    // φ2 = asin( sinφ1⋅cosδ + cosφ1⋅sinδ⋅cosθ )
    // λ2 = λ1 + atan2( sinθ⋅sinδ⋅cosφ1, cosδ − sinφ1⋅sinφ2 )
    // see http://williams.best.vwh.net/avform.htm#LL
    var radius = 6371000; // meters
    var delta = Number(distance) / radius; // angular distance in radians
    var theta = toRad(Number(bearing));

    var phi1 = toRad(lat1);
    var lambda1 = toRad(lng1);

    var phi2 = Math.asin(Math.sin(phi1)*Math.cos(delta) + Math.cos(phi1)*Math.sin(delta)*Math.cos(theta));
    var x = Math.cos(delta) - Math.sin(phi1) * Math.sin(phi2);
    var y = Math.sin(theta) * Math.sin(delta) * Math.cos(phi1);
    var lambda2 = lambda1 + Math.atan2(y, x);

    // normalise to −180..+180°
    var dest_lat = toDeg(phi2);
    var dest_lng = (toDeg(lambda2)+540)%360-180;

    //return new LatLon(φ2.toDegrees(), (λ2.toDegrees()+540)%360-180); 
    return {lat: dest_lat, lng: dest_lng}
};

DataModel.prototype.get_distance_between_two_locations = function(lat1, lon1, lat2, lon2) {
    //ref. http://www.movable-type.co.uk/scripts/latlong.html
    //this function is to estimate distances and exclude too long ones 
    //from request to google maps API. 
    //console.log("get_distance_between_two_locations");

    var R = 6371000; // meters
    var x1 = lat2 - lat1;

    var dLat = toRad(x1);
    var x2 = lon2 - lon1;
    var dLon = toRad(x2);

    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c;
    return d;
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

    var d = this.get_distance_between_two_locations(o1.lat, o1.lng, o2.lat, o2.lng);
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

DataModel.prototype.get_object_idx = function(o, array_of_objects){
    for (var i = 0, len  = array_of_objects.length; i<len; i++){
        if (o.object_id===array_of_objects[i].object_id){
            return i;
        }
    }

    return -1;
}

DataModel.prototype.location_is_ok_for_walking = function(o) {
    //the idea is to cover locations user actually checked himself and knows they 
    //are "walkable". All map_objects are walkable, and bus stops have a field indicating 
    //they are "walkable".
    /*console.log(o);*/
    if (o.item_type === "map_object") {
        return true;
    }

    if ((o.item_type === "bus_stop") && (o.verified_for_walking === "yes")) {
        return true;
    }

    return false;
}

DataModel.prototype.build_local_distance_matrix = function() {
    //console.log("build_local_distance_matrix");
    this.prepare_locations_for_distance_matrix();
    this.populate_local_distance_matrix();
}

DataModel.prototype.prepare_locations_for_distance_matrix = function() {
    //Google Maps API does not allow to pull more than 25 origins or destinations or 
    //get more than 100 items in one request.
    //Thus, to minimize requests to maps API, 
    //  , 
    //the idea is to use locally built matrix for 
    //estimated distances and then process the locations that are close
    //(no point to calculate exact walking distance for points that are >2000 m away anayway)
    // 
    //see http://www.movable-type.co.uk/scripts/latlong.html
    //technically, this can and should be done on the "server" side before 
    //applcation even starts, but do it here for the sake of practicing Javascript. 
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
    //this.populate_local_distance_matrix(); 
}

DataModel.prototype.get_estimated_distance_in_meters_between_two_objects = function(o1, o2) {
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
    //console.log("populate_local_distance_matrix");
    for (var i = 0, len = this.matrix_items.length; i < len; i++) {
        this.matrix_items[i].idx_into_distance_matrix = i;
        var a = Array(len);
        for (var j = i, len = this.matrix_items.length; j < len; j++) {
            var d = this.estimate_distance_between_two_map_objects(this.matrix_items[i], this.matrix_items[j]);
            a[j] = d;
        }

        this.local_distance_matrix.push(a);
    }

    //console.log(this.local_distance_matrix);
}


