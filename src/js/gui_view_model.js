//========================================================================================
//Abu Dhabi bus trip planner
//2016
//gui view  - handles gui menu.
//========================================================================================
//Built on knockout framework. 
//Any action related to map is passed to controller.
//========================================================================================

var GUIViewModel = function(controller, city_name) {
    var self = this;

    self.controller = controller;
    self.current_filter_list = ko.observableArray();
    self.current_step = ko.observable(1);
    self.map_loaded = ko.observable(false); //this does not have to be observable in current version of 
    //the program, but keep it like this - may decide to 
    //add some kind of map status indication

    self.gui_shown = ko.observable(true);
    //filtered location name is whatever is in the input text area (an observable)
    //filtered location is an object selected on application 
    //of the filter (since this is a trip planning 
    //application, we can pick only one object as source, only one as destination 
    //and only one bus route)
    self.filtered_location_name = ko.observable("");
    self.filtered_location = {};

    self.selected_source = ko.observable({});
    self.selected_destination = ko.observable({});
    self.selected_bus_route = ko.observable({});
    self.update_current_filter_list(self.controller.get_filtered_list_for_current_step(self.current_step()));
    self.cityName = ko.observable(city_name);

    self.messages = {
        STEP1_AWAITING_INPUT: '<span class ="msg-normal">: Please select starting point and click next step to continue. You can use filter to narrow the list.</span>',
        STEP1_NO_SOURCE_SELECTED: '<span class ="msg-warning">: No starting point selected.</span>',
        STEP1_SOURCE_SELECTED: '<span class ="msg-normal">: Please click next step to continue</span>',
        STEP2_AWAITING_INPUT: '<span class ="msg-normal">: Please select destination and click next step to continue. You can use filter to narrow the list.</span>',
        STEP2_NO_DESTINATION_SELECTED: '<span class ="msg-warning">: No destination selected.</span>',
        STEP2_DESTINATION_SELECTED: '<span class ="msg-normal">: Please click next step to continue.</span>',
        STEP2_ONE_BUS: '<span class ="msg-normal">: Please click next to complete.</span>',
        STEP3_SELECT_BUS_ROUTE_MESSAGE: '<span class ="msg-normal">: Please select bus route and click next step to continue.</span>',
        STEP3_NO_BUS_ROUTE_SELECTED_MESSAGE: '<span class ="msg-warning">:  No bus route selected.</span>',
        STEP3_ROUTE_SELECTED: '<span class ="msg-normal">:Please click next step to complete.</span>'
    };

    self.filtered_location_name_defaults = ['source:', 'destination:', 'route:', 'COMPLETE'];

    self.step_msg = ko.observable(self.messages.STEP1_AWAITING_INPUT);
    self.init_filtered_location_name();
    self.length_of_list = 0;
    self.disable_auto_filter = false;

    self.filtered_location_name.subscribe(self.highlight_chars_and_filter_by_closest_match, self);
    self.step_and_status = ko.computed(self.get_step_and_status_msg, self);
    self.selected_source_destination_display = ko.computed(self.get_selected_source_destination_display, self);

    self.planner_title = ko.computed(function() {
        return (self.cityName() + " BUS TRIP PLANNER");
    }, self);

   
    self.list_item_click = function(clicked_item) {
        //process a click on a filtered list item 

        //disable auto filter (one implemented in highlight_chars_and_filter_by_closest_match 
        //to avoid more then one item being 
        //displayed. (say, user clicks on Yas Mall. But 
        //Yas Mall cinema will also have two matching words and will 
        //be picked by auto-filter)
        self.disable_auto_filter = true;
        self.filtered_location_name(clicked_item.name);
        self.current_filter_list.remove(function(item) {
            return (item.name != clicked_item.name);
        });

        //self.controller.apply_filter_to_markers();
        self.controller.set_active_item(clicked_item);
    };
};

GUIViewModel.prototype.get_selected_source_destination_display = function() {
    if ($.isEmptyObject(this.selected_source())) {
        var msg = ('<span>No source selected.</span>');

        if (!this.map_loaded()) {
            msg = msg + '<br><span class = "msg-warning">Warning: map is not available. You may proceed with trip planning anyway.</span>';
        }
        return (msg);
    }

    if ($.isEmptyObject(this.selected_destination())) {
        return ("From : " + this.selected_source().name);
    }

    if ($.isEmptyObject(this.selected_bus_route())) {
        return ("From : " + this.selected_source().name + " to : " + this.selected_destination().name);
    }

    return ("From : " + this.selected_source().name + " to : " + this.selected_destination().name) + " , route: " + this.selected_bus_route().name;
};

GUIViewModel.prototype.get_step_and_status_msg = function() {
    var msg = "";
    if (this.current_step() == 4) {
        return ("Trip planning complete");
    }
    return ("Step " + String(this.current_step()) + this.step_msg());
};

GUIViewModel.prototype.highlight_chars_and_filter_by_closest_match = function(new_input) {
    //this function  highlights matching characters in list view as user types
    //and filters in the items with max number of words matching user input in real time
    if (this.disable_auto_filter === true) {
        this.disable_auto_filter = false;
        return;
    }

    var current_user_input = substring_after_tag(new_input, this.filtered_location_name_defaults[this.current_step() - 1]);
    if (current_user_input.trim() === ("")) {
        this.update_current_filter_list(this.controller.get_filtered_list_for_current_step(this.current_step()));
        this.controller.apply_filter_to_markers();
        return;
    }

    var current_list = this.controller.get_filtered_list_for_current_step(this.current_step());

    var max_number_of_matched_words = 0;
    var current_number_of_matched_words = 0;
    var i = 0;
    var len = 0;
    var cur_str = "";
    for (i = 0, len = current_list.length; i < len; i++) {
        cur_str = current_list[i].name;
        var searchable_words = current_list[i].searcheable_words;

        current_number_of_matched_words = get_number_of_matching_words_rev(current_user_input, searchable_words);

        if (current_number_of_matched_words > max_number_of_matched_words) {
            max_number_of_matched_words = current_number_of_matched_words;
        }

        current_list[i].number_of_matching_words = current_number_of_matched_words;
        current_list[i].number_of_mismatching_words = get_number_of_mismatching_words_rev(current_user_input, searchable_words);
    }

    // keep only items with highest number of words matched
    //i.e., if one word is matched at least partially - remove all with no words matched, if two is matched - remove 
    //ones with one and zero, etc. Numbers of matches is already computed in the loop above
    if (max_number_of_matched_words > 0) {

        this.current_filter_list.removeAll();
        for (i = 0; i < current_list.length; i++) {
            if (current_list[i].number_of_matching_words === max_number_of_matched_words)
                this.current_filter_list.push(current_list[i]);
        }

    } else {
        this.update_current_filter_list(this.controller.get_filtered_list_for_current_step(this.current_step()));
    }
    for (i = 0, len = this.current_filter_list().length; i < len; i++) {
        cur_str = this.current_filter_list()[i].name;
        var formatted_str = format_string_by_tag_matches(cur_str, current_user_input, "selected-char", "normal-char");
        this.current_filter_list()[i].formatted_displayed_name_for_filter(formatted_str);
    }

    //hide all markers that are not in the filtered list. 
    this.controller.apply_filter_to_markers();

};

GUIViewModel.prototype.set_selected_item = function(obj) {
    //used by contoller to process marker clicks 
    this.disable_auto_filter = true;
    this.filtered_location_name(obj.name);
    this.current_filter_list.remove(function(item) {
        return (obj.name != item.name);
    });
};

GUIViewModel.prototype.update_current_filter_list = function(new_list) {
    //re-populates list on initializations, resets and step transitions
    this.current_filter_list.removeAll();
    for (var i = 0; i < new_list.length; i++) {
        this.current_filter_list.push(new_list[i]);
    }
    this.length_of_list = this.current_filter_list().length;
};


GUIViewModel.prototype.init_filtered_location_name = function() {
    this.filtered_location_name(this.filtered_location_name_defaults[this.current_step() - 1]);
};


GUIViewModel.prototype.transition_to_step = function(step, message) {
    //a common transition function for standard transitions - i.e. 
    //steps that are not final (in our case works for steps 2 and 3)
    this.current_step(step);
    this.init_filtered_location_name();
    this.step_msg(message);
    this.update_current_filter_list(this.controller.get_filtered_list_for_current_step(this.current_step()));
    this.filtered_location = {};
    this.controller.process_step_update();
};

GUIViewModel.prototype.transition_to_step_4 = function() {
    //make it a function in case more functionality will need to be added
    this.current_step(4);
    this.controller.process_step_update();
};

GUIViewModel.prototype.plan_new_trip = function() {
    //callback for new trip button that shows at the end of final step
    this.current_step(1);
    this.init_filtered_location_name();
    this.step_msg(this.messages.STEP1_AWAITING_INPUT);
    this.update_current_filter_list(this.controller.get_filtered_list_for_current_step(this.current_step()));
    this.filtered_location = {};
    this.selected_source({});
    this.selected_destination({});
    this.selected_bus_route({});
    this.controller.process_step_update();
};

GUIViewModel.prototype.next_step = function() {
    //callback for next step button 
    this.apply_filter(false);
    if (this.current_step() === 1) {
        if (!$.isEmptyObject(this.filtered_location)) {
            this.selected_source(this.filtered_location);
            this.transition_to_step(2, this.messages.STEP2_AWAITING_INPUT);

        } else {
            this.step_msg(this.messages.STEP1_NO_SOURCE_SELECTED);
        }
    } else if (this.current_step() === 2) {
        if (!$.isEmptyObject(this.filtered_location)) {
            this.selected_destination(this.filtered_location);
            if (this.filtered_location.via_bus_routes.length === 1) {
                //if there is only one bus route - no point to display bus route selection list
                this.selected_bus_route({ name: this.filtered_location.via_bus_routes[0] });
                this.transition_to_step_4();
            } else {
                this.transition_to_step(3, this.messages.STEP3_SELECT_BUS_ROUTE_MESSAGE);
            }
        } else {
            this.step_msg(this.messages.STEP2_NO_DESTINATION_SELECTED);
        }
    } else if (this.current_step() === 3) {
        if (!$.isEmptyObject(this.filtered_location)) {
            this.step_msg(this.messages.STEP3_ROUTE_SELECTED);
            this.selected_bus_route(this.filtered_location);
            this.transition_to_step_4();
        } else {
            this.step_msg(this.messages.STEP3_NO_BUS_ROUTE_SELECTED_MESSAGE);
        }
    }
};

GUIViewModel.prototype.show_hide = function() {
    //click callback for GUI show-hide button (humb menu)
    if (this.gui_shown()) {
        this.gui_shown(false);
    } else {
        this.gui_shown(true);
    }
};

GUIViewModel.prototype.transition_to_previous_step = function(step, message) {
    this.current_step(step);
    this.init_filtered_location_name();
    this.selected_destination({});

    this.filtered_location = {};
    this.step_msg(message);
    this.update_current_filter_list(this.controller.get_filtered_list_for_current_step(this.current_step()));
    this.controller.process_step_update();
};

GUIViewModel.prototype.previous_step = function() {
    if (this.current_step() === 2) {
        this.selected_source({});
        this.transition_to_previous_step(1, this.messages.STEP1_AWAITING_INPUT);
    } else if (this.current_step() === 3) {
        this.transition_to_previous_step(2, this.messages.STEP2_AWAITING_INPUT);
    }
};

GUIViewModel.prototype.init_filtered_location_name = function() {
    this.filtered_location_name(this.filtered_location_name_defaults[this.current_step() - 1]);
};

GUIViewModel.prototype.get_idx_of_item_by_field_value = function(observable_array, field_value, field) {
    for (var i = 0, len = observable_array().length; i < len; i++) {
        if (observable_array()[i].hasOwnProperty(field)) {
            if (observable_array()[i][field] === field_value) {
                return i;
            }
        }
    }
    return -1;
};

GUIViewModel.prototype.update_filter = function() {
    //see if there is an exact match, and if yes - keep only item with exact match 
    var min_number_of_mismatching_words = 10000000;
    for (var i = 0, len = this.current_filter_list().length; i < len; i++) {
        if (this.current_filter_list()[i].number_of_mismatching_words < min_number_of_mismatching_words) {
            min_number_of_mismatching_words = this.current_filter_list()[i].number_of_mismatching_words;
        }
    }

    if (min_number_of_mismatching_words === 0) {
        this.current_filter_list.remove(function(item) {
            return (item.number_of_mismatching_words > 0);
        });
    }
};

GUIViewModel.prototype.apply_filter = function(activate_item_input) {
    var activate_item = true;
    if (activate_item_input !== undefined) {
        activate_item = activate_item_input;
    }

    if (this.length_of_list === this.current_filter_list().length) {
        return; //nothing to filter on 
    }

    if (this.filtered_location_name() === "") {
        this.reset_filter();
        return;
    }

    this.update_filter();
    //if there is only one item in the list -  
    //set source/destination  
    if (this.current_filter_list().length === 1) {
        this.filtered_location = this.current_filter_list()[0];
        if (activate_item) {
            this.controller.set_active_item(this.filtered_location);
        }
        this.set_filtered_location_message();
        if (this.current_step() === 1) {
            this.selected_source(this.filtered_location);
        } else if (this.current_step() === 2) {
            this.selected_destination(this.filtered_location);
        }

    }

    //hide all markers that are not in the filtered list. 
    this.controller.apply_filter_to_markers();
};

GUIViewModel.prototype.set_filtered_location_message = function() {
    if (this.current_step() === 1) {
        this.step_msg(this.messages.STEP1_SOURCE_SELECTED);
    } else if (this.current_step() === 2) {
        this.step_msg(this.messages.STEP2_DESTINATION_SELECTED);
    } else if (this.current_step() == 3) {
        this.step_msg(this.messages.STEP3_ROUTE_SELECTED);
    }
};

GUIViewModel.prototype.reset_filter = function() {
    //filter reset button
    this.init_filtered_location_name();
    this.update_current_filter_list(this.controller.get_filtered_list_for_current_step(this.current_step()));
    this.controller.apply_filter_to_markers();
    if (this.current_step() === 1) {
        this.selected_source({});
        this.selected_destination({});
        this.step_msg(this.messages.STEP1_AWAITING_INPUT);
    } else if (this.current_step() === 2) {

        this.selected_destination({});
        this.step_msg(this.messages.STEP2_AWAITING_INPUT);
    }
};