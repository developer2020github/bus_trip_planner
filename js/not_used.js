DataModel.prototype.get_walking_distance_in_meters = function(point1, point2) {
	//{lat: 24.4667, lng: 54.3667};
	console.log([{lat: point1.lat, lng: point1.lng}]);
	//return; 
    var query = {
       // origins: [{lat: point1.lat, lng: point1.lng}],
        //destinations: [{lat: point2.lat, lng: point2.lng}],
        origins: [{lat: 24.44964501, lng: 54.6054706}],
        destinations: [{lat: 24.44840463, lng: 54.60405439}],
        travelMode: google.maps.TravelMode.WALKING,
        unitSystem: google.maps.UnitSystem.METRIC
    };
    console.log(query);
    var query1 = {
        origins: [{lat: point1.lat, lng: point1.lng}],
        destinations: [{lat: point2.lat, lng: point2.lng}],
        travelMode: google.maps.TravelMode.WALKING,
        unitSystem: google.maps.UnitSystem.METRIC
    };
    console.log(query1);
    
    
    var distance = 100;
    var process_response = function(response, status) {
        if (status == "OK") {
        	local_distance_matrix = response;
            for (var i = 0; i < response.rows.length; i++) {
                for (var j = 0; j < response.rows[i].elements.length; j++) {
                    console.log('walking distance in meters: ')
                    console.log(response.rows[i].elements[j].distance.value);
                    console.log(distance);
                    distance = response.rows[i].elements[j].distance.value;
                    console.log(distance);
                    console.log('distance assigned');
                }
            }
        }
    }


    this.dms.getDistanceMatrix(query1, process_response);
    console.log("distance outer scope:")
    console.log(distance);

}