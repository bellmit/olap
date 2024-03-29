/*
 *   Copyright 2012 OSBI Ltd
 *
 *   Licensed under the Apache License, Version 2.0 (the "License");
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */

/**
 * The "add a folder" dialog
 */
var CustomFilterModal = Modal.extend({

    type: "filter",
    closeText: "Save",

    events: {
        'submit form': 'save',
        'change .function' : 'switch_function',
        'change .type' : 'switch_type',
        'click .dialog_footer a' : 'call'
    },

    buttons: [
        { text: "Cancel", method: "close",class:"yhncancel"},
        { text: "OK", method: "save",class:"yhnsave"}
        
    ],

    message: "<form id='custom_filter'>" +
                     "<table border='0px'>" +
                     "<tr><td class='col0 i18n'>Define Filter:</td>" +
                     "<td class='col1'><select class='function yhnSelect'><option class='i18n' selected>Select a Function...</option><option value='TopCount' class='i18n'>TopCount</option>" +
                        "<option value='TopPercent' class='i18n'>TopPercent</option><option value='TopSum' class='i18n'>TopSum</option>" +
                        "<option value='BottomCount' class='i18n'>BottomCount</option><option value='BottomPercent' class='i18n'>BottomPercent</option>" +
                        "<option value='BottomSum' class='i18n'>BottomSum</option></select></td></tr>" +
                     "<tr class='filter_details hide'><td><span class='ntype i18n'></span></td><td><input class='n' /></td></tr>" +
                     "<tr class='filter_details hide i18n'><td class='i18n'>Sort by:</td>" +
                     "<td><select class='type yhnSelect'><option value='measure'class='i18n'>Measure</option><option value='custom'class='i18n'>MDX Expression</option></select></td></tr>" +
                     "<tr class='filter_details hide'><td>&nbsp;</td><td class='sortingoption'>&nbsp;</td>" +
                     "</table></form>",


    func: null,
    func_type: 'Measure',
    n: "",
    sortliteral: "",
    measure_list: null,

    initialize: function(args) {
        var self = this;
        this.axis = args.axis;
        this.measures = args.measures;
        this.query = args.query;
        this.success = args.success;
        this.func = args.func;
        this.n = args.n;
        this.sortliteral = args.sortliteral;
        this.isMdx = true;
        _.bindAll(this, "build_measures_list", "save");

        this.measure_list = this.build_measures_list();

        _.extend(this.options, {
            title: "Custom Filter for " + this.axis
        });

        this.bind( 'open', function( ) {
            if (self.func !== null) {
                $(self.el).find('.function').val(self.func);
                self.switch_function({ target : $(self.el).find('.function')});
                $(self.el).find('.n').val(self.n);
                if (self.isMdx === true && self.sortliteral !== null) {
                    $(this.el).find('.type').val('custom');
                    $(this.el).find('.sortingoption').html('').html("<textarea class='sortliteral'>" + self.sortliteral + "</textarea>");
                }
            }

        });
        // fix event listening in IE < 9
        if(isIE && isIE < 9) {
            $(this.el).find('form').on('submit', this.save);
        }

    },

    build_measures_list: function() {
        var self = this;
        if (this.measure_list !== null)
            return "";
        var tmpl = "<select class='sortliteral yhnSelect'>";
        _.each(this.measures, function(measure) {
            var selected = "";
            if (measure.uniqueName == self.sortliteral) {
                selected = " selected ";
                self.isMdx = false;
            }
            tmpl += "<option " + selected + "value='" + measure.uniqueName + "'>" + measure.caption + "</option>";
        });
        tmpl += "</select>";
        return tmpl;
    },

    switch_function: function(event) {
        var val = $(event.target).val();
        if (typeof val == "undefined" || val === "") {
            $(this.el).find('.filter_details').hide();
        } else {
            var ntype = val.replace('Top','').replace('Bottom','');
            $(this.el).find('.ntype').addClass('i18n').html(ntype + ":");
            $(this.el).find('.filter_details').show();
            $(this.el).find('.sortingoption').html('').html(this.measure_list);
        }
        Saiku.i18n.translate();
        return false;
    },

    switch_type: function(event) {
        var sortingoption = $(event.target).val();
        if (sortingoption == "按指标") {
            $(this.el).find('.sortingoption').html('').html(this.measure_list);
        } else {
            $(this.el).find('.sortingoption').html('').html("<textarea class='sortliteral' />");
        }

        return false;

    },

    save: function( event ) {
        event.preventDefault( );
        var self = this;
        this.func = $(this.el).find('.function').val();
        this.n = parseInt($(this.el).find('.n').val());
        this.sortliteral = $(this.el).find('.sortliteral').val();

        var alert_msg = "";
        if (typeof this.n == "undefined" || !this.n) {
            alert_msg += "You have to enter a numeric for N! ";
        }
        if (typeof this.sortliteral == "undefined" || !this.sortliteral || this.sortliteral === "") {
            alert_msg += "You have to enter a MDX expression for the sort literal! ";
        }
        if (alert_msg !== "") {
            alert(alert_msg);
        } else {
            self.success(this.func, this.n, this.sortliteral);
            this.close();
        }

        return false;
    },

    error: function() {
        $(this.el).find('dialog_body')
            .html("Could not add new folder");
    }


});
