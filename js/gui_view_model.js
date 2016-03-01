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
        STEP1_AWAITING_INPUT: " : please select starting point",
        STEP1_NO_SOURCE_SELECTED: " : no starting point selected",
        STEP1_SOURCE_SELECTED: ": please click next step to continue",
        STEP2_AWAITING_INPUT: ": please select destination",
        STEP2_NO_DESTINATION_SELECTED: " : no destination selected",
        STEP2_DESTINATION_SELECTED: " : please click next step to continue",
        STEP2_ONE_BUS: "please click next to complete",
        STEP3_SELECT_BUS_ROUTE_MESSAGE: " : please select bus route",
        STEP3_NO_BUS_ROUTE_SELECTED_MESSAGE: " : no bus route selected",
        STEP3_ROUTE_SELECTED: " : please click next step to complete"
    }
    this.filtered_location_name_defaults = ['source', 'destination', 'route'];

    this.step_msg = ko.observable(this.messages.STEP1_AWAITING_INPUT);
    this.init_filtered_location_name();

    var self = this;

    this.filtered_location_name.subscribe(function(new_input) {
        //USE FOR UPDATE OF OBSERVABLE ARRAY TO HIGHLIGHT ITEMS
        var current_user_input = substring_after_tag(new_input, this.filtered_location_name_defaults[this.current_step() - 1]);
       // if (current_user_input.trim() === ("")) {
       //     this.reset_filter();
       //     return;
       // }
        var max_number_of_matched_words = 0;
        var current_number_of_matched_words = 0;
        //this.current_filter_list()[0].formatted_displayed_name_for_filter(str + 
        //    substring_after_tag(new_input, this.filtered_location_name_defaults[this.current_step() - 1]));
        for (var i = 0, len = this.current_filter_list().length; i < len; i++) {
            var cur_str = this.current_filter_list()[i].displayed_name_for_filter;

            var formatted_str = this.format_string_by_tag_matches(cur_str, current_user_input);
            this.current_filter_list()[i].formatted_displayed_name_for_filter(formatted_str);
            current_number_of_matched_words = get_number_of_matching_words(cur_str, current_user_input);
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
            return ("Trip planning complte");
        }
        return ("Step " + String(this.current_step()) + this.step_msg());
    }, this);



    this.selected_source_destination_display = ko.computed(function() {

        if ($.isEmptyObject(this.selected_source())) {
            return ("Planned trip");
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
        new_list[i]["displayed_name_for_filter"] = this.get_displayed_name_for_filter(new_list[i]);
        new_list[i]["formatted_displayed_name_for_filter"] =
            ko.observable("<b>" + this.get_displayed_name_for_filter(new_list[i]) + "</b>" + "*");
        this.current_filter_list.push(new_list[i]);
    }
    console.log(new_list);
}

GUIViewModel.prototype.init_filtered_location_name = function() {

    this.filtered_location_name(this.filtered_location_name_defaults[this.current_step() - 1])
    console.log(this.filtered_location_name_defaults[this.current_step() - 1])
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
    this.init_filtered_location_name();
    this.current_filter_list.removeAll();
    this.current_step(1);
    this.filtered_location_name("");
    this.filtered_location = {};
    this.selected_source({});
    this.selected_destination({});
    this.selected_bus_route({});
    this.update_current_filter_list(this.controller.get_filtered_list_for_current_step(this.current_step()));
}

GUIViewModel.prototype.next_step = function() {
    console.log("this.filtered_location");
    console.log(this.filtered_location);

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
        this.step_msg(this.messages.STEP1_AWAITING_INPUT);
        this.controller.process_step_update();
        this.update_current_filter_list(this.controller.get_filtered_list_for_current_step(this.current_step()));
    } else if (this.current_step() === 3) {
        this.current_step(2);
        this.init_filtered_location_name();
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
    console.log(this.filtered_location_name())
    var idx = this.get_idx_of_item_by_field_value(this.current_filter_list, this.filtered_location_name(), "name");
    console.log(idx);
    //console.log(this.filtered_location().name)
    if (this.filtered_location_name() === "") {
        this.reset_filter();
    } else if (idx > -1) {

        var location = this.filtered_location_name();
        filter_out = function(item) {
            return item.name != location;
        }
        this.current_filter_list.remove(filter_out);
    }
    //console.log(this.current_filter_list().length);
    if (this.current_filter_list().length === 1) {
        this.filtered_location = this.current_filter_list()[0];
        this.controller.set_filtered_item(this.filtered_location);
        this.set_filtered_location_message();
    }
}

GUIViewModel.prototype.set_filtered_location_message = function() {
    if (this.current_step() === 1) {
        this.step_msg(this.messages.STEP1_SOURCE_SELECTED);
    } else if (this.current_step() === 2) {
        this.step_msg(this.messages.STEP2_DESTINATION_SELECTED);
    }
}

GUIViewModel.prototype.reset_filter = function() {
    this.init_filtered_location_name();
    this.update_current_filter_list(this.controller.get_filtered_list_for_current_step(this.current_step()));
    this.filtered_location_name("");
    this.selected_destination({});
    if (this.current_step() === 1) {
        this.selected_source({});
        this.step_msg(this.messages.STEP1_AWAITING_INPUT);

    }


}
