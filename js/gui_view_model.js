var GUIViewModel = function(update_map, controller){
	//var self = this;
    this.controller = controller; 
	this.map_updater = update_map; 
	this.current_filter_list = ko.observableArray();
	this.current_step = ko.observable(0); 
	this.selected_location = ko.observable("");
	this.cityName = ko.observable("")
	this.step_list = Array()
	this.stepTitle = ko.computed(function() {

    return ("Step " + String(this.current_step()));
  }, this);
   
}

GUIViewModel.prototype.update_current_filter_list = function(new_list){
	this.current_filter_list.removeAll();
	this.step_list = new_list;
	    for (var i = 0; i<new_list.length; i++){
	    	this.current_filter_list.push(new_list[i]);
	    }
}
GUIViewModel.prototype.next_step = function(){
	this.controller.next_step(); 
}

GUIViewModel.prototype.previous_step = function(){
	this.controller.previous_step(); 
}


GUIViewModel.prototype.apply_filter = function() {

    var location = this.selected_location();
    if (location === "") {
        this.reset_filter();
    } else {
        filter_out = function(item) {
            return item.name != location;
        }
        this.current_filter_list.remove(filter_out);
    }
}

GUIViewModel.prototype.reset_filter = function(){
		this.update_current_filter_list(this.step_list);
        this.map_updater.update_map(); 
}
