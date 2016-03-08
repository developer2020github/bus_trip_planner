/*
 part of data model
 
 request: source
 response: array of objects: 

              source === source 
              via === bus_route 
              walking_distance_to_source === distance (must be reacheable)
              source_idx - index into array of map objects reacheable from source
              //stop_closest_to_destination = undefined
              //destination = undefined 
              array of map objects reacheable by walking from this route
                  each map object decorated with closest bus stop index from next array
              array of bus stops these objects can be reached from 
             this will be a helper class in the data model.  
             Pretty much everything can be calculated by constuctor. Should only be created if 
             - route has a stop close enough to source. Thus, 
              * array of stops will be provided beforehand (all walkable stops on the route)
              * source is known too 
              * calculation of index into array is cheap (matrix is pre-calculated), so it's ok to 
              not bother with supplying anyting 

              See class ReachebleObjects.

 this array can be pre-built and then return ones mathing source is found  
*/
//source  - source provided by view 
//array of walkable_bus_stops - need to build one array per route 
//route - just route number 
//map objects - all map objects (not bus stops)

//when get a source at step2: 
//will need to get : list of bus routes source belongs to.
//then for each such route - list of reachable objects 
//return a list of objects of class ReachableObjects 
//store the list in 
var ReacheableObjects = function(source, array_of_walkable_bus_stops, bus_route,  data_model, map_objects) {
    //class builds a list of map objects reacheable from a source via a particular bus route 
    //it assumes that source itself is reacheable.

    this.source = source;
    //console.log(array_of_walkable_bus_stops);
    //this.array_of_bus_stops = array_of_walkable_bus_stops.slice(); //should be only stops in this route
    this.via_bus_route = bus_route;
    this.reacheable_map_objects = Array()
    this.data_model = data_model;

    for (var i = 0, len_i = map_objects.length; i < len_i; i++) {
        var reacheable_map_object = {};
        for (var j = 0, len_j = array_of_walkable_bus_stops.length; j < len_j; j++) {
            var dist = this.data_model.estimate_distance_between_two_map_objects(map_objects[i], array_of_walkable_bus_stops[j]);
            
            //eliminate sources user can just walk to
            var walking_dist = this.data_model.estimate_distance_between_two_map_objects(map_objects[i], this.source);
            if ((dist < this.data_model.max_walking_distance_meters)&&
               (walking_dist > this.data_model.max_walking_distance_meters)){
                if ($.isEmptyObject(reacheable_map_object)) {
                    reacheable_map_object = $.extend({}, map_objects[i]);
                    reacheable_map_object["closest_stop_idx_into_data_model_array"] = array_of_walkable_bus_stops[j].idx_into_data_model_array;
                    reacheable_map_object["closest_stop_data_model_array"] = array_of_walkable_bus_stops[j].data_model_array_name;
                    reacheable_map_object["distance_to_closest_stop"] = dist;

                    reacheable_map_object["via_bus_routes"] = Array();
                    reacheable_map_object["via_bus_routes"].push(this.via_bus_route);
                } else {
                    if (reacheable_map_object["distance_to_closest_stop"] > dist) {
                        reacheable_map_object["closest_stop_idx_into_data_model_array"] = array_of_walkable_bus_stops[j].idx_into_data_model_array;
                        reacheable_map_object["closest_stop_data_model_array"] = array_of_walkable_bus_stops[j].data_model_array_name;
                        reacheable_map_object["distance_to_closest_stop"] = dist;
                    }
                }


            }
        }

        if (!($.isEmptyObject(reacheable_map_object))) {
            this.reacheable_map_objects.push(reacheable_map_object);
        }
    }  

}

ReacheableObjects.prototype.get_closest_bus_stop = function(map_object){
    //see if this is actually useful
 for (var i = 0, len = this.reacheable_map_objects.length; i<len; i++){
    if (this.data_model.map_objects_are_equal(this.reacheable_map_objects[i], map_object)){
        var idx = this.reacheable_map_objects[i].closest_stop_idx; 
        return(this.array_of_bus_stops[idx]);
    }
 }
}
ReacheableObjects.prototype.compare_reachable_objects = function (o1, o2) {
    //will return 0 if objects are the same and their closest stop is the same
    //will return 1 if objects are the same but first route has a closer stop
    //will return 2 if objects are the same but second route has a closer stop
    //will return -1 otherwise
    if (!(this.data_model.map_objects_are_equal(o1, o2))){
        return -1; 
    }

    var closest_stop1 = this.data_model.get_data_object(o1.closest_stop_data_model_array,o1.closest_stop_idx_into_data_model_array);
    var closest_stop2 = this.data_model.get_data_object(o2.closest_stop_data_model_array,o2.closest_stop_idx_into_data_model_array);

    if (this.data_model.map_objects_are_equal(closest_stop1, closest_stop1)){
        return 0; 
    }

    if (o1.distance_to_closest_stop<o2.distance_to_closest_stop){
        return 1;
    }else{
        return 2;
    }

    return -1;//default
}
ReacheableObjects.prototype.merge_reacheable_objects = function (reacheable_map_objects){
    //many objects are reacheable via multiple routes. 
    //this method will merge info into one array, eliminating duplicates,  and return it.
    var merged = Array();
    merged  = merged.concat(this.reacheable_map_objects)
    if ($.isEmptyObject(reacheable_map_objects)){
        return merged; 
    }
    
   
   var len1 = merged.lenght;

   //step 1 - see which objects already in merged should be overwirtten 
   //(becuase there is a closer
   //stop in the reacheable_map_objects then currently in merged) or 
   //updated with extra bus route information (if stop belongs to same route)
   for (var j = 0, len1 = merged.length; j<len1; j++){
        for (var i = 0, len = reacheable_map_objects.length; i<len; i++){
            var cmp = this.compare_reachable_objects(merged[j], reacheable_map_objects[i]);
            /*
            console.log("comparing");
            console.log(merged[j]);
            console.log(reacheable_map_objects[i]);
            console.log(cmp);*/
            if(cmp===2){
                //second route has closer stop. overwrite first stop info
                merged[j] = $.extend({}, reacheable_map_objects[i]);
            }
            if (cmp===0){
                //add extra route information 
                merged[j].via_bus_routes = merged[j].via_bus_routes.concat(reacheable_map_objects[i].via_bus_routes);
            }
        }
    }


    //step 2 - add new objects 
    for (var i = 0, len = reacheable_map_objects.length; i<len; i++){
      if (this.data_model.get_object_idx(reacheable_map_objects[i], merged)===-1){
         merged.push(reacheable_map_objects[i]);
      }
    }

    return merged;

}