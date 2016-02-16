//generic functions and classes 
var FilteredArray  = function(unfiltered_data, identifier){
	//this class will memorize data items by filter on a first call and then return memorized
	//responses. The idea is to capitalize on the fact that once application is launched,. 
	//data cannot be changed, so no need to re-compute anything more than once.
    this.unfiltered_data = unfiltered_data; 
    this.identifier = identifier;
    this.memorized_filters = Array(); 
    this.arrays_matching_filters = Array(); 
}

FilteredArray.prototype.get_filter_index = function(filter){
    for (var i = 0, len = this.memorized_filters.lenght; i<len; i++){
        if (JSON.stringify(filter) === JSON.stringify(this.memorized_filters[i])) {
            return i; 
        }
    }

    return -1; 
}


FilteredArray.prototype.get_filtered_objects = function(filter) {
    var idx = this.get_filter_index(filter);
    if (idx > -1) {
        return this.arrays_matching_filters[idx]
    }

    var matching_array = Array();

    function filter_objects(objects) {

        for (var i = 0, len = objects.length; i < len; i++) {

            for (var key in filter) {
                if (filter.hasOwnProperty(key)) {
                    if (objects[i].hasOwnProperty(key)) {
                        if (objects[i][key] === filter[key]){
                            matching_array.push(objects[i])
                        }
                    }
                }
            }
        }
    }

    filter_objects(this.unfiltered_data);
    this.memorized_filters.push(filter);
    this.arrays_matching_filters.push(matching_array);
    
    return (matching_array);
}