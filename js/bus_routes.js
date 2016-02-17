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
                //console.log('one');
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
