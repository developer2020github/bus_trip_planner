//part of data model
//class to present bus routes data in a way reauired by other portions of the application 
var BusRoutes = function(bus_routes_data, bus_stops, data_model) {
    //interface 
    this.list = Array();
    this.by_number = {};
    this.data_model  = data_model;

    var len = bus_routes_data.length;
    for (var i = 0; i < len; i++) {
        if ($.inArray(bus_routes_data[i].route, this.list) === -1) {
            this.list.push(bus_routes_data[i].route);
        }
    }
    
    for (var i = 0, len1 = this.list.length; i < len1; i++) {
        var stops = Array();
        var walkable_stops = Array();



        //loop through routes data. If route === list item, get stop id and find it in list of stops 
        //
        for (var k = 0; k < len; k++) {
            //console.log(this.list[i]);
            //console.log(bus_routes_data[k].route);
            if (this.list[i] === bus_routes_data[k].route) {
              
                for (var j = 0, len2 = bus_stops.length; j < len2; j++) {
                    if (bus_stops[j].id === bus_routes_data[k].stop_id) {

                        stops.push(bus_stops[j]);
                        if (data_model.location_is_ok_for_walking(bus_stops[j])) {
                            walkable_stops.push(bus_stops[j]);
                        }

                    }
                }
            }
        }

        this.by_number[this.list[i]] = {};
        this.by_number[this.list[i]]['stops'] = stops;
        this.by_number[this.list[i]]['walkable_stops'] = walkable_stops;
        //console.log(this.by_number[this.list[i]])
    }

}

BusRoutes.prototype.get_closest_stop = function(route, map_object){
    var closest_stop = {}; 
    var shortest_distance = 10000000; 
    var self = this; 
   
    $.each(this.by_number[route].walkable_stops, function(idx, stop){
        var distance  = self.data_model.estimate_distance_between_two_map_objects(map_object, stop); 
        if (shortest_distance>distance){
            closest_stop = stop; 
            shortest_distance = distance; 
        }
    }); 

    console.log('BusRoutes.prototype.get_closest_stop'); 
    console.log(map_object);
    console.log(route);
    console.log(closest_stop);

    return closest_stop; 
}

BusRoutes.prototype.get_route_between_stops = function (route, stop1, stop2){
    //this is tested but not used yet - need to use Google driving directions 
    //and add more stops to display routes close to their real shapes. 
    var idx1 = this.get_stop_idx(route, stop1);
    var idx2 = this.get_stop_idx(route, stop2);
    var start_idx = idx1; 
    var end_idx = idx2; 

    if (start_idx>end_idx){
        start_idx  = idx2; 
        end_idx = idx1
    }
    
    var route_between_stops = Array(); 
    for (var i = start_idx; i<=end_idx; i++){
        route_between_stops.push( this.by_number[route].stops[i]);
    }

    return route_between_stops; 
}

BusRoutes.prototype.get_stop_idx = function(route, stop){

 for (var i = 0, len =  this.by_number[route].stops.length; i<len; i++){
    if (this.data_model.map_objects_are_equal(stop, this.by_number[route].stops[i])){
        return i; 
    }
 }
}

BusRoutes.prototype.get_list_of_routes_object_can_be_reached_from = function(map_object) {
    var list_of_routes = Array();
    for (var i = 0, len = this.list.length; i < len; i++) {
        if (this.is_object_in_walking_distance(map_object, this.list[i])) {
            list_of_routes.push(this.list[i]);
        }
    }

    return list_of_routes;
}

BusRoutes.prototype.is_object_in_walking_distance = function(map_object, route_number) {
    for (var i = 0, len = this.by_number[route_number].walkable_stops.length; i < len; i++) {
        if (this.data_model.objects_within_walking_distance(map_object, this.by_number[route_number].walkable_stops[i])) {

            return true;
        }
    }
    return false;
}
