/*gui view interface with controller: 
- gui view provides currentl syelected item to controller to bounce it on the map 
(contoller method set_filtered_item)
- done for step 1, call to set_filtered_item

- gui view provides final selection at beginning of each step
(contrioller should update 

- gui view at step 1 requests items to display . On this request controller also updates map
- gui view at step 2 requests items to display and provides finally selcted location (process_step_update)
 On this request controller also updates map*/
var GUIViewModel = function(update_map, controller){
	//var self = this;
    this.controller = controller; 
	this.map_updater = update_map; 

	this.current_filter_list = ko.observableArray();
	this.current_step = ko.observable(1);

	this.filtered_location_name = ko.observable("");

	this.filtered_location = {}; 


	this.selected_source = ko.observable({});
	this.selected_destination = ko.observable({});

	this.cityName = ko.observable("")
	
	this.step_list = Array()
	this.messages  = {
		STEP1_AWAITING_INPUT: " : please select starting point",
		STEP1_NO_SOURCE_SELECTED: " : no starting point selected",
		STEP1_SOURCE_SELECTED: ": please click next step to continue",  
		STEP2_AWAITING_INPUT: "please select destination",
		STEP2_NO_DESTINATION_SELECTED: " : no destination selected",
		STEP2_DESTINATION_SELECTED: ": please click next step to continue"
	}

    this.step_msg = ko.observable(this.messages.STEP1_AWAITING_INPUT);

	this.step_and_status = ko.computed(function() {
	var msg = ""
    return ("Step " + String(this.current_step()) + this.step_msg());
  }, this);

	this.selected_source_destination_display = ko.computed(function() {
	
	if ($.isEmptyObject(this.selected_source())){
		return("");
	}

	if ($.isEmptyObject(this.selected_destination())){
		return("From : "  + this.selected_source().name);
	}

	return ("From : "  + this.selected_source().name  + " to : " + this.selected_destination().name);
  }, this);

   this.update_current_filter_list(this.controller.get_filtered_list_for_current_step(this.current_step()));
}

GUIViewModel.prototype.update_current_filter_list = function(new_list){
	this.current_filter_list.removeAll();
	this.step_list = new_list;
	    for (var i = 0; i<new_list.length; i++){
	    	this.current_filter_list.push(new_list[i]);
	    }
}
GUIViewModel.prototype.next_step = function(){
    if (this.current_step()===1){
	  if (!$.isEmptyObject(this.filtered_location)){
	  	this.current_step(2);
	  	this.selected_source(this.filtered_location);
	  	this.step_msg(this.messages.STEP2_AWAITING_INPUT);
	  	this.controller.process_step_update();
	  	this.update_current_filter_list(this.controller.get_filtered_list_for_current_step(this.current_step()))
	  }
	  else{
	  	this.step_msg(this.messages.STEP1_NO_SOURCE_SELECTED);
	  }
    }
	//this.controller.next_step(); 
}

GUIViewModel.prototype.previous_step = function(){

}


GUIViewModel.prototype.apply_filter = function() {
    console.log(this.filtered_location_name())
    //console.log(this.filtered_location().name)
    if (this.filtered_location_name() === "") {
        this.reset_filter();
    } else {
    	var location = this.filtered_location_name(); 
        filter_out = function(item) {
            return item.name != location;
        }
        this.current_filter_list.remove(filter_out);
    }
    console.log(this.current_filter_list().length);
    if (this.current_filter_list().length===1){
    
    	if(this.current_step()===1){
   
    		this.filtered_location = this.current_filter_list()[0];
    		this.controller.set_filtered_item(this.filtered_location); 
    		console.log(this.filtered_location);
    	}
    	
    }
}

GUIViewModel.prototype.reset_filter = function(){
		this.update_current_filter_list(this.step_list);
        this.map_updater.update_map(); 
        if (this.current_step()===1){
        	this.step_msg(this.messages.STEP1_AWAITING_INPUT);
        	this.filtered_location("");
		    this.selected_source = "";
			this.selected_destination ="";
        }


}
