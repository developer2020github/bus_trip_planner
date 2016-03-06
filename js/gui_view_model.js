/*gui view interface with controller: 
- gui view provides currentl syelected item to controller to bounce it on the map 
(contoller method set_filtered_item)
- done for step 1, call to set_filtered_item

- gui view provides final selection at beginning of each step
(contrioller should update 

- gui view at step 1 requests items to display . On this request controller also updates map
- gui view at step 2 requests items to display and provides finally selcted location (process_step_update)
 On this request controller also updates map*/
var GUIViewModel = function(controller, city_name) {
    //var self = this;

    this.controller = controller;

    this.current_filter_list = ko.observableArray();
    this.current_step = ko.observable(1);
    this.map_loaded = ko.observable(false);
    //
    this.filtered_location_name = ko.observable("");
    this.gui_shown = ko.observable(true);
    this.filtered_location = {};
    this.selected_source = ko.observable({});
    this.selected_destination = ko.observable({});
    this.selected_bus_route = ko.observable({});
    this.update_current_filter_list(this.controller.get_filtered_list_for_current_step(this.current_step()));

    this.cityName = ko.observable(city_name)

    //this.step_list = Array()
    this.messages = {
        STEP1_AWAITING_INPUT: '<span class ="msg_normal">: Please select starting point and apply filter to confirm. You can use filter to narrow the list</span>',
        STEP1_NO_SOURCE_SELECTED: '<span class ="msg_warning">: no starting point selected</span>',
        STEP1_SOURCE_SELECTED: '<span class ="msg_normal">: please click next step to continue</span>',
        STEP2_AWAITING_INPUT: '<span class ="msg_normal">:Please select destination and apply filter to confirm. You can use filter to narrow the list</span>',
        STEP2_NO_DESTINATION_SELECTED: '<span class ="msg_warning">: no destination selected</span>',
        STEP2_DESTINATION_SELECTED: '<span class ="msg_normal">:please click next step to continue</span>',
        STEP2_ONE_BUS: '<span class ="msg_normal">:please click next to complete</span>',
        STEP3_SELECT_BUS_ROUTE_MESSAGE: '<span class ="msg_normal">: please select bus route</span>',
        STEP3_NO_BUS_ROUTE_SELECTED_MESSAGE: '<span class ="msg_warning">:  no bus route selected</span>',
        STEP3_ROUTE_SELECTED: '<span class ="msg_normal">:please click next step to complete</span>'
    }
    this.filtered_location_name_defaults = ['source:', 'destination:', 'route:', 'COMPLETE'];

    this.step_msg = ko.observable(this.messages.STEP1_AWAITING_INPUT);
    this.init_filtered_location_name();
    this.length_of_list = 0;
    var self = this;

    this.filtered_location_name.subscribe(function(new_input) {
        //USE FOR UPDATE OF OBSERVABLE ARRAY TO HIGHLIGHT ITEMS
        if (this.disable_auto_filter === true){
            this.disable_auto_filter = false; 
            return;
        }

        var current_user_input = substring_after_tag(new_input, this.filtered_location_name_defaults[this.current_step() - 1]);
        if (current_user_input.trim() === ("")) {
            this.update_current_filter_list(this.controller.get_filtered_list_for_current_step(this.current_step()));
            return;
        }

        var max_number_of_matched_words = 0;
        var current_number_of_matched_words = 0;
        //this.current_filter_list()[0].formatted_displayed_name_for_filter(str + 
        //    substring_after_tag(new_input, this.filtered_location_name_defaults[this.current_step() - 1]));
        for (var i = 0, len = this.current_filter_list().length; i < len; i++) {
            var cur_str = this.current_filter_list()[i].displayed_name_for_filter;
            var searchable_words = this.current_filter_list()[i].meaningful_words;


            var formatted_str = this.format_string_by_tag_matches(cur_str, current_user_input);
            this.current_filter_list()[i].formatted_displayed_name_for_filter(formatted_str);


            current_number_of_matched_words = get_number_of_matching_words(current_user_input, searchable_words);


            if (current_number_of_matched_words > max_number_of_matched_words) {
                max_number_of_matched_words = current_number_of_matched_words;
            }

            this.current_filter_list()[i]['number_of_matching_words'] = current_number_of_matched_words;
        }


        //see if there are entire words matched and keep only items with highest number of words matched
        //i.e., if one word is matched - remove all with no words matched, if two is matched - remove 
        //ones with one and zero, etc. Numbers of matches is already computed in the loop above

        if (max_number_of_matched_words > 0) {
            this.current_filter_list.remove(function(item) {
                return (item.number_of_matching_words < max_number_of_matched_words);
            })
        }

    }, this);

    this.step_and_status = ko.computed(function() {
        var msg = ""
        if (this.current_step() == 4) {
            return ("Trip planning complete");
        }
        return ("Step " + String(this.current_step()) + this.step_msg());
    }, this);

    this.selected_source_destination_display = ko.computed(function() {

        if ($.isEmptyObject(this.selected_source())) {
            return ("No source selected");
        }

        if ($.isEmptyObject(this.selected_destination())) {
            return ("From : " + this.selected_source().name);
        }


        if ($.isEmptyObject(this.selected_bus_route())) {
            return ("From : " + this.selected_source().name + " to : " + this.selected_destination().name);
        }

        return ("From : " + this.selected_source().name + " to : " + this.selected_destination().name) + " , route: " + this.selected_bus_route().name;
    }, this);

    //$('#previousStepButton').prop('disabled', true);
    this.planner_title = ko.computed(function() {
        return (this.cityName() + " BUS TRIP PLANNER");
    }, this)

    this.mapLoadedStatus = ko.pureComputed(function() {
        if (this.map_loaded()) {
            return ("label label-success map_status_class")
        }
        return ("label label-warning map_status_class")
    }, this);

    this.map_status_text = ko.pureComputed(function() {
        if (this.map_loaded()) {
            return ("MAP")
        }
        return ("MAP")
    }, this);
    
    this.disable_auto_filter = false; 
    self.list_item_click = function(clicked_item) {
        //disable auto filter to avoid more then one item being 
        //displayed. 
        self.disable_auto_filter = true; 
        self.filtered_location_name(clicked_item.name);
        self.current_filter_list.remove(function(item) {
                return (item.name!= clicked_item.name);
            })
    }
}

GUIViewModel.prototype.set_selected_item = function(obj){
this.disable_auto_filter = true; 
this.filtered_location_name(obj.name);
this.current_filter_list.remove(function(item) {
                return (obj.name!= item.name);
            })
}

GUIViewModel.prototype.format_string_by_tag_matches = function(input_str, input_tag) {
    //apply highlighted style to matching chnaractes and normal to the rest of them 
    var str = input_str.toLowerCase();
    var tag = input_tag.toLowerCase();

    var begin = 1;
    var selected = 2;
    var normal = 3

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
                result_str = result_str + apply_class_to_span(buf, "selected_char");
                buf = ""
                state = normal;
            }

            buf = buf + input_str[i];
        } else {
            if (state === begin) {
                state = selected;
            } else if (state === normal) {
                result_str = result_str + apply_class_to_span(buf, "normal_char");
                buf = ""
                state = selected;
            }
            buf = buf + input_str[i];
        }
    }

    if (state === normal) {
        result_str = result_str + apply_class_to_span(buf, "normal_char");
    } else if (state === selected) {
        result_str = result_str + apply_class_to_span(buf, "selected_char");
    }

    return result_str;
}

GUIViewModel.prototype.get_displayed_name_for_filter = function(o) {
    var displayed_name_for_filter = o.name;
    /*console.log("get_displayed_name_for_filter");
    console.log(this.current_step());
    console.log(o);*/

    if (this.current_step() == 1) {
        displayed_name_for_filter = displayed_name_for_filter + " (" + o.class + ")";
    }

    if (this.current_step() == 2) {
        var via = "";
        /*console.log("o.via_bus_routes:");
        console.log(o.via_bus_routes);*/
        for (var i = 0, len = o.via_bus_routes.length; i < len; i++) {
            via = via + o.via_bus_routes[i];
            if (i < (len - 1)) {
                via = via + ","
            }
        }

        displayed_name_for_filter = displayed_name_for_filter + " ,bus : " + via;
    }
    /*console.log(displayed_name_for_filter);
    console.log("=================================");*/
    return displayed_name_for_filter;
}

GUIViewModel.prototype.update_current_filter_list = function(new_list) {
    this.current_filter_list.removeAll();
    //this.step_list = new_list;

    for (var i = 0; i < new_list.length; i++) {
        //exclude "al" at the beggining 
        var str = this.get_displayed_name_for_filter(new_list[i]);
        var tokens = str.toLowerCase().split(" ");
        //console.log("before:");
        //   console.log(str);
        if (tokens[0] === "al") {

            str = substring_after_tag(str.toLowerCase(), "al").trim();

        }
        //  console.log("after");
        //    console.log(str);
        new_list[i]["meaningful_words"] = str;
        new_list[i]["displayed_name_for_filter"] = this.get_displayed_name_for_filter(new_list[i]);
        new_list[i]["formatted_displayed_name_for_filter"] =
            ko.observable("<b>" + this.get_displayed_name_for_filter(new_list[i]) + "</b>");
        this.current_filter_list.push(new_list[i]);
    }

    this.length_of_list = this.current_filter_list().length;
}


GUIViewModel.prototype.init_filtered_location_name = function() {

    this.filtered_location_name(this.filtered_location_name_defaults[this.current_step() - 1])
        //console.log(this.filtered_location_name_defaults[this.current_step() - 1])
}


GUIViewModel.prototype.transition_to_step_2 = function() {
    this.current_step(2);

    this.init_filtered_location_name();
    this.selected_source(this.filtered_location);
    this.step_msg(this.messages.STEP2_AWAITING_INPUT);
    this.update_current_filter_list(this.controller.get_filtered_list_for_current_step(this.current_step()))
    this.filtered_location = {};
    this.controller.process_step_update();
}


GUIViewModel.prototype.transition_to_step_3 = function() {
    this.current_step(3);
    this.init_filtered_location_name();
    this.step_msg(this.messages.STEP3_SELECT_BUS_ROUTE_MESSAGE);
    this.update_current_filter_list(this.controller.get_filtered_list_for_current_step(this.current_step()))
    this.filtered_location = {};
    this.controller.process_step_update();
}


GUIViewModel.prototype.transition_to_step_4 = function() {
    this.current_step(4);
    this.controller.process_step_update();
}


GUIViewModel.prototype.plan_new_trip = function() {
    this.current_step(1);
    this.init_filtered_location_name();
    this.step_msg(this.messages.STEP1_AWAITING_INPUT);
    this.update_current_filter_list(this.controller.get_filtered_list_for_current_step(this.current_step()));
    this.filtered_location = {};
    this.selected_source({});
    this.selected_destination({});
    this.selected_bus_route({});
    this.controller.process_step_update();
}


GUIViewModel.prototype.next_step = function() {
    //console.log("this.filtered_location");
    //console.log(this.filtered_location);
    if (this.current_step() === 1) {
        if (!$.isEmptyObject(this.filtered_location)) {
            this.transition_to_step_2();
        } else {
            this.step_msg(this.messages.STEP1_NO_SOURCE_SELECTED);
        }
    } else if (this.current_step() === 2) {
        if (!$.isEmptyObject(this.filtered_location)) {
            this.selected_destination(this.filtered_location);
            if (this.filtered_location.via_bus_routes.length === 1) {
                //if there is only one bus route - no point to display bus route menu

                this.selected_bus_route({ name: this.filtered_location.via_bus_routes[0] });
                this.transition_to_step_4();
            } else {
                this.transition_to_step_3();
            }
        } else {
            this.step_msg(this.messages.STEP2_NO_DESTINATION_SELECTED);
        }
    } else if (this.current_step() === 3) {
        if (!$.isEmptyObject(this.filtered_location)) {
            //this.selected_bus_route({ name: this.filtered_location.via_bus_routes[0] });
            this.step_msg(this.messages.STEP3_ROUTE_SELECTED);
            this.selected_bus_route(this.filtered_location);
            this.transition_to_step_4();
        } else {
            this.step_msg(this.messages.STEP3_NO_BUS_ROUTE_SELECTED_MESSAGE);
        }
    }
}


GUIViewModel.prototype.show_hide = function() {
    if (this.gui_shown()) {
        this.gui_shown(false);
    } else {
        this.gui_shown(true);
    }
}


GUIViewModel.prototype.previous_step = function() {
    if (this.current_step() === 2) {
        this.current_step(1);
        this.init_filtered_location_name();
        this.selected_destination({});
        this.selected_source({});
        this.filtered_location = {};
        this.step_msg(this.messages.STEP1_AWAITING_INPUT);
        this.controller.process_step_update();
        this.update_current_filter_list(this.controller.get_filtered_list_for_current_step(this.current_step()));
    } else if (this.current_step() === 3) {
        this.current_step(2);
        this.init_filtered_location_name();
        this.filtered_location = {};
        this.selected_destination({});
        //this.selected_source({});
        this.step_msg(this.messages.STEP2_AWAITING_INPUT);
        this.controller.process_step_update();
        this.update_current_filter_list(this.controller.get_filtered_list_for_current_step(this.current_step()));
    }
    this.controller.process_step_update();
}


GUIViewModel.prototype.init_filtered_location_name = function() {
    this.filtered_location_name(this.filtered_location_name_defaults[this.current_step() - 1]);
}


GUIViewModel.prototype.get_idx_of_item_by_field_value = function(observable_array, field_value, field) {

    for (var i = 0, len = observable_array().length; i < len; i++) {
        //console.log("get_idx_of_item_by_field");
        //console.log(observable_array()[i]);
        //console.log(observable_array()[i][field]);
        //console.log(o[field]);
        if (observable_array()[i].hasOwnProperty(field)) {
            if (observable_array()[i][field] === field_value) {
                return i;
            }
        }
    }
    return -1;
}

GUIViewModel.prototype.apply_filter = function() {

    if (this.length_of_list === this.current_filter_list().length) {
        return;//nothing to filter on 
    }

    if (this.filtered_location_name() === "") {
        this.reset_filter();
        return;
    }
    //if there is only one item in the list -  
    //set source/destination  
    if (this.current_filter_list().length === 1) {
        this.filtered_location = this.current_filter_list()[0];
        this.controller.set_filtered_item(this.filtered_location);
        this.set_filtered_location_message();
        if (this.current_step()===1){
            this.selected_source(this.filtered_location);
        }
        else if (this.current_step()===2){
            this.selected_destination(this.filtered_location);
        }

    }
    //hide all markers that are not in the filtered list. 
    //this applies only to steps 1 and 2 
    if (this.current_step() < 3) {
        this.controller.apply_filter_to_markers();
    }

}

GUIViewModel.prototype.set_filtered_location_message = function() {
    if (this.current_step() === 1) {
        this.step_msg(this.messages.STEP1_SOURCE_SELECTED);
    } else if (this.current_step() === 2) {
        this.step_msg(this.messages.STEP2_DESTINATION_SELECTED);
    }else if (this.current_step()==3){
          this.step_msg(this.messages.STEP3_ROUTE_SELECTED);
    }
}

GUIViewModel.prototype.reset_filter = function() {
    this.init_filtered_location_name();
    this.update_current_filter_list(this.controller.get_filtered_list_for_current_step(this.current_step()));
    this.controller.apply_filter_to_markers();
    //this.filtered_location_name("");
    this.selected_destination({});
    if (this.current_step() === 1) {
        this.selected_source({});
        this.step_msg(this.messages.STEP1_AWAITING_INPUT);
    }else if (this.current_step()===2){

        this.selected_destination({}); 
        this.step_msg(this.messages.STEP2_AWAITING_INPUT);
    }
}
