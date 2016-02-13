idx = 0;
function test_set_interval(){
  console.log(idx);
}
function debug_main(){

	test_data_model();
	

}

function test_data_model(){
	var data_model = new DataModel(bus_routes, bus_stops, map_objects, 2000);
	//return; 
	var all_map_points = data_model.bus_stops.concat(data_model.map_objects);
    //console.log(all_map_points)
	var point1 = map_objects[0];
	var point2 = bus_stops[1];
    //var i = 23; 
    //var j = 23; 
	for (var i = 0, len = all_map_points.length; i<len; i++)
	{
		for (var j = 0, len = all_map_points.length; j<len; j++){

            console.log("-------------------------")
            console.log("estimated distance between: ");
            console.log(all_map_points[i].item_type + " " + all_map_points[i].name);
            console.log(all_map_points[j].item_type + " " + all_map_points[j].name);
            console.log("idx into matrix:");
            console.log(all_map_points[i].idx_into_distance_matrix);
            console.log(all_map_points[j].idx_into_distance_matrix);
            console.log(data_model.get_estimated_distance_in_meters_between_two_objects(all_map_points[i], all_map_points[j]));
		}
	}
    
	//data_model.get_walking_distance_in_meters(point1, point2);
}