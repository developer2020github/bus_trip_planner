		function initMap() {
          //refer to this for full screen map
          //http://stackoverflow.com/questions/17067196/google-maps-api-full-screen
          //http://alistapart.com/article/conflictingabsolutepositions

  				    var myLatLng = {lat: 24.4667, lng: 54.3667};
  				    var latLngAlMuneera = {lat: 24.44964501, lng: 54.6054706};
  				    var latLngAlMuneeraBusStop = {lat: 24.44840463, lng: 54.60405439};


  				    var mapDiv = document.getElementById('map');

    				var map = new google.maps.Map(mapDiv, {
     				 center: myLatLng,
     				 zoom: 12,
             mapTypeControl: true,
             mapTypeControlOptions: {         
                      position: google.maps.ControlPosition.LEFT_BOTTOM
                  }
   					 });

					 var marker = new google.maps.Marker({
					    position: myLatLng,
					    map: map,
					    title: 'Hello World!'
					  });
					 marker.addListener('click', toggleBounce);
					 function toggleBounce() {
					  if (marker.getAnimation() !== null) {
					    marker.setAnimation(null);
					  } else {
					    marker.setAnimation(google.maps.Animation.BOUNCE);
					  }
                      }

					  var marker2 = new google.maps.Marker({
					    position: latLngAlMuneera,
					    map: map,
					    title: 'Al Muneera'
					  });
					  //https://mapicons.mapsmarker.com/markers/transportation/road-transportation/bus-stop/?custom_color=e6c312
					  var busImage = 'image/bus_stop.png';
					  var marker3 = new google.maps.Marker({
					    position: latLngAlMuneeraBusStop,
					    map: map,
					    title: 'Al Muneera Bus Stop: bus 170, 180',
					    icon: busImage
					  });
					  //display walking path
					   var directionsService = new google.maps.DirectionsService();
					   var directionsDisplay = new google.maps.DirectionsRenderer({ map: map,
                         preserveViewport: true,
                         suppressMarkers: true});
					   //and bus route shown with different color

					   var directionsDisplay1 = new google.maps.DirectionsRenderer({ map: map,
                         preserveViewport: true,
                         suppressMarkers: true,
                     	polylineOptions: { strokeColor: '#5cb85c' }});
					   //presrveVieport needs to be set to True to prevent map from re-focusing on a current
					   //walk path
					    //directionsDisplay.setMap(map);
					    var start = latLngAlMuneera;
					    var end = latLngAlMuneeraBusStop;

					    var request = {
									    origin:start,
									    destination:end,
									    travelMode: google.maps.TravelMode.WALKING
									  };

						directionsService.route(request, function(result, status) {
									    if (status == google.maps.DirectionsStatus.OK) {
									      directionsDisplay.setDirections(result);

									}
								});


                        start = latLngAlMuneeraBusStop;
                        end = myLatLng;

                        request = {
									    origin:start,
									    destination:end,
									    travelMode: google.maps.TravelMode.DRIVING
									  };

							directionsService.route(request, function(result, status) {
									    if (status == google.maps.DirectionsStatus.OK) {
									      directionsDisplay1.setDirections(result);

									}
								});

						map.setCenter(myLatLng);
						map.setZoom(12);

                        //add inforwindow on click
                        //--------------------------------------------
                         var contentString = '<div id="content">'+
                          '<div id="siteNotice">'+
                          '</div>'+
                          '<h1 id="firstHeading" class="firstHeading">Uluru</h1>'+
                          '<div id="bodyContent">'+
                          '<p><b>Uluru</b>, also referred to as <b>Ayers Rock</b>, is a large ' +
                          'sandstone rock formation in the southern part of the '+
                          'Northern Territory, central Australia. It lies 335&#160;km (208&#160;mi) '+
                          'south west of the nearest large town, Alice Springs; 450&#160;km '+
                          '(280&#160;mi) by road. Kata Tjuta and Uluru are the two major '+
                          'features of the Uluru - Kata Tjuta National Park. Uluru is '+
                          'sacred to the Pitjantjatjara and Yankunytjatjara, the '+
                          'Aboriginal people of the area. It has many springs, waterholes, '+
                          'rock caves and ancient paintings. Uluru is listed as a World '+
                          'Heritage Site.</p>'+
                          '<p>Attribution: Uluru, <a href="https://en.wikipedia.org/w/index.php?title=Uluru&oldid=297882194">'+
                          'https://en.wikipedia.org/w/index.php?title=Uluru</a> '+
                          '(last visited June 22, 2009).</p>'+
                          '</div>'+
                          '</div>';

                      var infowindow = new google.maps.InfoWindow({
                        content: contentString
                      });

                       marker2.addListener('click', function() {
                                infowindow.open(map, marker2);
                                });

          //demonstrate distance calculation between two points
          //ref http://gmaps-samples-v3.googlecode.com/svn/trunk/distancematrix/london.html 
          //https://developers.google.com/maps/documentation/javascript/distancematrix
           var origins = [latLngAlMuneera]
           var destinations = [latLngAlMuneeraBusStop]
           var query = {
                          origins: origins,
                          destinations: destinations,
                          travelMode: google.maps.TravelMode.WALKING,
                          unitSystem: google.maps.UnitSystem.METRIC };

          var  dms = new google.maps.DistanceMatrixService();
          dms.getDistanceMatrix(query, function(response, status) {
                  if (status == "OK") {
                   //console.log(response);
                   //rows is an array of DistanceMatrixResponseRow objects, with each row corresponding to an origin.
                   for (var i = 0; i<response.rows.length; i++){
                    //elements are children of rows, and correspond to a pairing of the row's origin with each destination. 
                    //console.log(response.rows[i].)
                    for (var j = 0; j<response.rows[i].elements.length; j++){
                      console.log('distance in meters: ')
                      console.log(response.rows[i].elements[j].distance.value);
                    }
                   }
                 }
             }
         );
}

