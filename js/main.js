//list of objects currently displayed 

var sources_list = Array(); 
var destinations_list = Array();
var bus_route_list = Array(); 
var current_view_model; 

var map_inital_pos = {lat: 24.4667, lng: 54.3667};
var map_handler; 
//==========================
var UpdateMap = function(){
	var self = this; 
	self.update_map = function(){
		console.log("map was just updated");
	}
}
var ViewModel = function(update_map){
	var self = this;

	self.map_updater = update_map; 
	self.current_filter_list = ko.observableArray();
	self.current_step = ko.observable(0); 
	self.selected_location = ko.observable("");
	self.step_list = Array()
	//operations 
	self.update_current_filter_list = function(new_list){
	//this is not good at all, but ok for now (while lists are small)
	this.current_filter_list.removeAll();
	this.step_list = new_list;
	    for (var i = 0; i<new_list.length; i++){
	    	this.current_filter_list.push(new_list[i]);
	    }

	}

	self.apply_filter = function(){
		
		var location = this.selected_location(); 
		if (location === "") {
          this.reset_filter();
		}else{
				filter_out = function(item){
				 return item.name !=location;
				}
		        this.current_filter_list.remove( filter_out );
    	}
	}

	self.reset_filter = function(){
		this.update_current_filter_list(this.step_list);
        this.map_updater.update_map(); 
	}

	self.set_current_step = function(step){
       this.current_step(step);
	}

	self.stepTitle = ko.computed(function() {
	//console.log("computed step");
	//console.log(this.current_step);

    return ("Step" + String(this.current_step()));
  }, this);

}
//============================
function initialize(){
  //populate current list with communites 
  for (var i =0; i<map_objects.length; i++){
  	//console.log(map_objects[i].class);
  	if (map_objects[i].class=="community"){
  		sources_list.push(map_objects[i]);
  	}
  	else
  	{
  		destinations_list.push(map_objects[i]);
  	}
  }

  for (var i = 0; i<bus_routes.length; i++){
  	 if (bus_route_list.indexOf(bus_routes.route)===-1){
  	 	bus_route_list.push(bus_routes.route);
  	 	//STOPPED HERE UNTESTED
  	 }
  }
  var update_map = new UpdateMap();
  current_view_model = new ViewModel(update_map); 
  current_view_model.update_current_filter_list(sources_list);
  current_view_model.set_current_step(1);
  //console.log(current_view_model);

  //////////////
  

  //////////
  ko.applyBindings(current_view_model);

  document.getElementById("nextStepButton").addEventListener("click", next_step);
  document.getElementById("previousStepButton").addEventListener("click", previous_step);
  

 
  this.current_step = 1;
  //ko.applyBindings(stepTitle, document.getElementById('steps'));
  /*
   
*/
}

function initMap(){
	debug_main();
	map_handler = new MapHandler(map_inital_pos);
	map_handler.add_locations(bus_stops);

}

function previous_step(){
	if (current_view_model.current_step()===2){
	  current_view_model.update_current_filter_list(sources_list);
	  current_view_model.set_current_step(1);
    }
}

function next_step(){
	if (current_view_model.current_step()===1){
	  current_view_model.update_current_filter_list(destinations_list);
	  current_view_model.set_current_step(2);
    }
    console.log(local_distance_matrix);
}



(function main(){
 //debugOut(); 
  initialize(); 
})(); 

