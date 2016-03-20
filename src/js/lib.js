//========================================================================================
//Library  - functions and classes that do not belong to any 
//particular class/object and can be re-used in a generic way.
//========================================================================================


//========================================================================================
//Generic classes
//========================================================================================
var FilteredArray = function(unfiltered_data, identifier) {
    //this class will memorize data items by filter on a first call and then return memorized
    //responses. The idea is to capitalize on the fact that once application is launched,. 
    //data cannot be changed, so no need to re-compute anything more than once.
    this.unfiltered_data = unfiltered_data;
    this.identifier = identifier;
    this.memorized_filters = Array();
    this.arrays_matching_filters = Array();
};

FilteredArray.prototype.get_filter_index = function(filter) {
    for (var i = 0, len = this.memorized_filters.lenght; i < len; i++) {
        if (JSON.stringify(filter) === JSON.stringify(this.memorized_filters[i])) {
            return i;
        }
    }

    return -1;
};


FilteredArray.prototype.get_filtered_objects = function(filter) {
    var idx = this.get_filter_index(filter);
    if (idx > -1) {
        return this.arrays_matching_filters[idx];
    }

    var matching_array = Array();

    function filter_objects(objects) {

        for (var i = 0, len = objects.length; i < len; i++) {

            for (var key in filter) {
                if (filter.hasOwnProperty(key)) {
                    if (objects[i].hasOwnProperty(key)) {
                        if (objects[i][key] === filter[key]) {
                            matching_array.push(objects[i]);
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
};


//========================================================================================
//Generic functions
//========================================================================================

//https://en.wikibooks.org/wiki/Algorithm_Implementation/Strings/Dice%27s_coefficient
//dice coefficient shows simularity between two strings
var get_dice_coefficient = function(string1, string2) {
    var intersection = 0;
    var length1 = string1.length - 1;
    var length2 = string2.length - 1;
    var i = 0; 
    if (length1 < 1 || length2 < 1) return 0;
    var bigrams2 = [];
    for (i = 0; i < length2; i++) {
        bigrams2.push(string2.substr(i, 2));
    }

    for (i = 0; i < length1; i++) {
        var bigram1 = string1.substr(i, 2);
        for (var j = 0; j < length2; j++) {
            if (bigram1 == bigrams2[j]) {
                intersection++;
                bigrams2[j] = null;
                break;
            }
        }
    }
    return (2.0 * intersection) / (length1 + length2);
};

//returns true if values are within % tolerance of each other, 
//and false otherwise. % is taken of the higher value
var values_within_tolerance = function(v1, v2, tolerance_percent) {
    var absolute_tolerance = Math.max(v1, v2) * tolerance_percent / 100.0;
    if (Math.abs(v1 - v2) < absolute_tolerance) {
        return true;
    }
    return false;
};

//applies selected_char style to matching charactes and normal_char to the rest of them 
//mmatches are determined as follows: if a character of input string is found  in input tag
//- there is a match, and no match otherwise.
format_string_by_tag_matches = function(input_str, input_tag, selected_char, normal_char) {
    
    var str = input_str.toLowerCase();
    var tag = input_tag.toLowerCase();

    var begin = 1;
    var selected = 2;
    var normal = 3;

    var state = begin;
    var buf = "";
    var result_str = "";
    var idx = 0;
    for (var i = 0, len = str.length; i < len; i++) {
        idx = tag.indexOf(str[i]);

        if (idx === -1) {
            if (state === begin) {
                state = normal;
            } else if (state === selected) {
                result_str = result_str + apply_class_to_span(buf, selected_char);
                buf = "";
                state = normal;
            }

            buf = buf + input_str[i];
        } else {
            if (state === begin) {
                state = selected;
            } else if (state === normal) {
                result_str = result_str + apply_class_to_span(buf, normal_char);
                buf = "";
                state = selected;
            }
            buf = buf + input_str[i];
        }
    }

    if (state === normal) {
        result_str = result_str + apply_class_to_span(buf, normal_char);
    } else if (state === selected) {
        result_str = result_str + apply_class_to_span(buf, selected_char);
    }

    return result_str;
};

//the smaller the result  - the closer image is to square
var get_square_ratio = function(h, w) {
      
        var r = h / w;
        if (r > 1) {
            r = 1 / r;
        }
        return 1 - r;
};


toRad = function(n) {
    return n * Math.PI / 180;
};

toDeg = function(n) {
    return ((180 * n) / Math.PI);
};

//does not include tag itself. Searches for the first 
//instance of tag
substring_after_tag = function(str, tag) {
    var idx = str.indexOf(tag);

    if (idx > -1) {
        return (str.substring(idx + tag.length, str.length));
    }

    return str;
};

//returns true if all characters of str are found in tag
all_str_characters_found_in_tag = function(str, tag) {

    for (var i = 0, len = str.length; i < len; i++) {
        if (tag.indexOf(str[i]) === -1) {
            return false;
        }
    }

    return true;
};


//returns number of matching words between user input and tags_string.
//user input does not need to be splittable, tags string should 
//consist of space - separated tags.
//(i.e., user input is searched for words from tags_string)
get_number_of_matching_words = function(user_input, tags_string) {
    var tokens_to_exclude = [',', ':'];
    var num_of_matching_words = 0;
    var tokens = tags_string.toLowerCase().split(' ');
    var user_input_l = user_input.toLowerCase();

    for (var i = 0, len = tokens.length; i < len; i++) {
        if ($.inArray(tokens[i], tokens_to_exclude) === -1) {
            if (user_input_l.indexOf(tokens[i]) > -1) {

                num_of_matching_words++;
            }
        }
    }
    return num_of_matching_words;
};

//similar to get_number_of_matching_words, but searches 
//tags of tags string to contain a portion of user intput
//if user input is in a tag - it is considered to be a match.
get_number_of_matching_words_rev = function(user_input, tags_string) {
    var tokens_to_exclude = [',', ':'];
    var num_of_matching_words = 0;
    var tokens = tags_string.toLowerCase().split(' ');

    var user_input_tokens = user_input.toLowerCase().split(' ');
    for (var j = 0, len1 = user_input_tokens.length; j<len1; j++){
    var user_input_l = user_input_tokens[j];
    var match_found = false; 
    for (var i = 0, len = tokens.length; i < len; i++) {
        if ($.inArray(tokens[i], tokens_to_exclude) === -1) {
            if (tokens[i].indexOf(user_input_l) > -1) {
                match_found=true;
            }
        }
    }
    if (match_found){
        num_of_matching_words++;
    }
    }
    return num_of_matching_words;
}

get_number_of_mismatching_words_rev = function(user_input, tags_string){
    var tokens = tags_string.toLowerCase().split(' ');
    var number_of_matches = get_number_of_matching_words_rev(user_input, tags_string);
    return (tokens.length-number_of_matches);
}

//this will count number of words in tag that
//contain all characters of str.
//tag has to be splittable on " "
get_number_of_found_words = function(str, tag) {
    var num_of_matching_words = 0;
    var l_tag = tag.toLowerCase();
    l_tag = l_tag.split(' ').join('+');
    var tokens = str.toLowerCase().split(" ");

    for (var i = 0, len = tokens.length; i < len; i++) {
        if (all_str_characters_found_in_tag(tokens[i], l_tag)) {
            num_of_matching_words++;
        }
    }

    return num_of_matching_words;
};

//small helper function to wrap a string 
//into span with css class
apply_class_to_span = function(text, css_class) {
    return ('<span class="' + css_class + '">' + text + '</span>');
};


//========================================================================================
//map and coordinates-related functions 
//========================================================================================
function point2LatLng(point, map) {
    //http://stackoverflow.com/questions/25219346/how-to-convert-from-x-y-screen-coordinates-to-latlng-google-maps
  var topRight = map.getProjection().fromLatLngToPoint(map.getBounds().getNorthEast());
  var bottomLeft = map.getProjection().fromLatLngToPoint(map.getBounds().getSouthWest());
  var scale = Math.pow(2, map.getZoom());
  var worldPoint = new google.maps.Point(point.x / scale + bottomLeft.x, point.y / scale + topRight.y);
  return map.getProjection().fromPointToLatLng(worldPoint);
}

function latLng2Point(latLng, map) {
    //http://stackoverflow.com/questions/25219346/how-to-convert-from-x-y-screen-coordinates-to-latlng-google-maps
  var topRight = map.getProjection().fromLatLngToPoint(map.getBounds().getNorthEast());
  var bottomLeft = map.getProjection().fromLatLngToPoint(map.getBounds().getSouthWest());
  var scale = Math.pow(2, map.getZoom());
  var worldPoint = map.getProjection().fromLatLngToPoint(latLng);
  return new google.maps.Point((worldPoint.x - bottomLeft.x) * scale, (worldPoint.y - topRight.y) * scale);
}

//get coordinates of a point located at a certain 
//distance and bearing from lat1 lng1
//ref http://www.movable-type.co.uk/scripts/latlong.html
// @param   {number} distance - Distance travelled, in same units as earth radius (default: metres).
 //* @param   {number} bearing - Initial bearing in degrees from north.
get_destination_point = function(lat1, lng1, distance, bearing) {
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
    return {lat: dest_lat, lng: dest_lng};
};

//ref. http://www.movable-type.co.uk/scripts/latlong.html
//this function is to estimate distances. Result is in meters.
get_distance_between_two_locations = function(lat1, lon1, lat2, lon2) {
    var R = 6371000; // meters
    var x1 = lat2 - lat1;

    var dLat = toRad(x1);
    var x2 = lon2 - lon1;
    var dLon = toRad(x2);

    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c;
    return d;
};