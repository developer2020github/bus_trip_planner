//https://en.wikibooks.org/wiki/Algorithm_Implementation/Strings/Dice%27s_coefficient
var get_dice_coefficient = function (string1, string2) {
  var intersection = 0;
  var length1 = string1.length - 1;
  var length2 = string2.length - 1;
  if(length1 < 1 || length2 < 1) return 0;
  var bigrams2 = [];
  for(var i = 0; i < length2; i++) {
    bigrams2.push(string2.substr(i,2));
  }
  for(var i = 0; i < length1; i++) {
    var bigram1 = string1.substr(i, 2);
    for(var j = 0; j < length2; j++) {
      if(bigram1 == bigrams2[j]) {
        intersection++;
        bigrams2[j] = null;
        break;
  }}} 
  return (2.0 * intersection) / (length1 + length2);  
}


var values_within_tolerance = function(v1, v2, tolerance_percent){
  var absolute_tolerance = Math.max(v1,v2)*tolerance_percent/100.0;
  if (Math.abs(v1-v2)<absolute_tolerance){
    return true; 
  }
  return false; 
}


var get_square_ratio = function(h,w){
    //the smaller the result  - the closer image is to square
    var r = h/w;
    if (r>1){
        r = 1/r;
    }
    return 1 - r; 
}
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

//======================================================
//generic functions 
//======================================================
toRad = function(n) {
    return n * Math.PI / 180;
}

toDeg = function(n){

    return((180*n)/Math.PI);
}


substring_after_tag = function(str, tag){
  var idx = str.indexOf(tag);

  if(idx>-1){
    return(str.substring(idx + tag.length, str.length));
  }

  return str; 
}
all_str_characters_found_in_tag = function(str, tag){

  for (var i = 0, len = str.length; i<len; i++){
    if(tag.indexOf(str[i])===-1){
      return false; 
    }
  }

  return true; 
}

get_number_of_matching_words = function(str, tag){
 var num_of_matching_words = 0;
 var l_tag = tag.toLowerCase();
 l_tag = l_tag.split(' ').join('+');
 var tokens = str.toLowerCase().split(" "); 

 for (var i = 0, len = tokens.length; i<len; i++){
  if (all_str_characters_found_in_tag(tokens[i], l_tag)){
    num_of_matching_words++;
  }
 }

 return num_of_matching_words;
}

apply_class_to_span = function(text, css_class){
  return ('<span class="' + css_class +'">' + text + '</span>');
}
