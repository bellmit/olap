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
 * Class which handles table rendering of resultsets
 */
var Table = Backbone.View.extend({
    className: 'table_wrapper',
    events: {
        'click th.row' : 'clicked_cell',
        'click th.col' : 'clicked_cell',
        'click a.spreadOut':'spreadOut',
        'click a.packOut':'packAllOut'

    },
    initialize: function(args) {
        this.workspace = args.workspace;
        this.renderer = new SaikuTableRenderer();
        // Bind table rendering to query result event
        _.bindAll(this, "render", "process_data");
        this.workspace.bind('query:result', this.render);
        this.id = _.uniqueId("table_");
        $(this.el).attr('id', this.id);
    },
    packAllOut:function(e){
        //点击节点
        var myTarget = $(e.target.parentNode);
        var parentTarget = $(e.target.parentNode.parentNode);
        var pos = myTarget.attr('rel').split(':');
        var axis = parentTarget.hasClass('row') ? "ROWS" : "COLUMNS";
        var row = parseInt(pos[0]);
        var col = parseInt(pos[1]);
        var cell = this.workspace.query.result.lastresult().cellset[row][col];

        var query = this.workspace.query;
        var schema = query.get('schema');
        var cube = query.get('connection') + "/" +
            query.get('catalog') + "/" +
            ((schema === "" || schema === null) ? "null" : schema) +
            "/" + query.get('cube');
        var d = cell.properties.dimension;

        var h = cell.properties.hierarchy;
        var l = cell.properties.level;
        var l_caption = "";
        var keep_payload = JSON.stringify(
            {
                "hierarchy"     :  h,
                "uniquename"    : l,
                "type"          : "level",
                "action"        : "delete"
            }) +
            "," + JSON.stringify(
                {
                    "hierarchy"     :  h,
                    "uniquename"    : cell.properties.uniquename,
                    "type"          : "member",
                    "action"        : "add"
                }
            );
        var children_payload = cell.properties.uniquename;
        var levels = [];
         var key = this.workspace.selected_cube;
        var cubeModel = Saiku.session.sessionworkspace.cube[key];

        var dimensions;
        if (!cubeModel || !dimensions || !measures) {
            if (typeof localStorage !== "undefined" && localStorage && localStorage.getItem("cube." + key) !== null) {
                Saiku.session.sessionworkspace.cube[key] = new Cube(JSON.parse(localStorage.getItem("cube." + key)));
            } else {
                Saiku.session.sessionworkspace.cube[key] = new Cube({ key: key });
                Saiku.session.sessionworkspace.cube[key].fetch({ async : false });
            }
            dimensions = Saiku.session.sessionworkspace.cube[key].get('data').dimensions;
        }
        var used_levels = [];

        var v1 = this.workspace.query.helper.getHierarchy(h);
        var v2 =
            _.each(v1.levels, function(level){
                var lev = h+".["+level.name+"]";
                used_levels.push(lev);
            });
        _.each(dimensions, function(dimension) {
            if (dimension.name == d) {
                _.each(dimension.hierarchies, function(hierarchy) {
                    if (hierarchy.uniqueName == h) {
                        _.each(hierarchy.levels, function(level,e) {
                            if (level.uniqueName == l) {
                                l_caption = level.caption;
                                l_name = level.name;
                                k = hierarchy.levels[e+1].name;
                            }
                        });
                    }
                });
            }
        });
        //Keep and Include
        var updates = [];
        //Keep and Include
        var hierarchy = this.workspace.query.helper.getHierarchy(h);
        if (hierarchy && hierarchy.levels.hasOwnProperty(l_caption)) {
            updates.push({
                uniqueName: cell.properties.uniquename,
                caption: cell.properties.uniquename
            });
            hierarchy.levels[l_caption].selection.type = "INCLUSION";
            hierarchy.levels[l_caption].selection.members = [];
        var k = window.yhnResult[cell.properties.level]["children"];
        this.workspace.query.helper.removeMultiLevel(h, k);

        this.workspace.drop_zones.synchronize_query();
        this.workspace.query.run(true);
        this.workspace.query.helper.displayAllSelections();
        }
    },
    //单独扩展
    spreadOut:function(e){
        //点击节点
        var myTarget = $(e.target.parentNode);
        var parentTarget = $(e.target.parentNode.parentNode);
        var pos = myTarget.attr('rel').split(':');
        var axis = parentTarget.hasClass('row') ? "ROWS" : "COLUMNS";
        var row = parseInt(pos[0]);
        var col = parseInt(pos[1]);
        var cell = this.workspace.query.result.lastresult().cellset[row][col];
        var k = window.yhnResult[cell.properties.level]["next"];
        var query = this.workspace.query;
        var schema = query.get('schema');
        var cube = query.get('connection') + "/" +
            query.get('catalog') + "/" +
            ((schema === "" || schema === null) ? "null" : schema) +
            "/" + query.get('cube');
        var d = cell.properties.dimension;
        var h = cell.properties.hierarchy;
        var l = cell.properties.level;
        var l_caption = "";
        var keep_payload = JSON.stringify(
            {
                "hierarchy"     :  h,
                "uniquename"    : l,
                "type"          : "level",
                "action"        : "delete"
            }) +
            "," + JSON.stringify(
                {
                    "hierarchy"     :  h,
                    "uniquename"    : cell.properties.uniquename,
                    "type"          : "member",
                    "action"        : "add"
                }
            );
        var children_payload = cell.properties.uniquename;
        var levels = [];
        var key = this.workspace.selected_cube;

        var cubeModel = Saiku.session.sessionworkspace.cube[key];

        var dimensions;
        if (!cubeModel || !dimensions || !measures) {
            if (typeof localStorage !== "undefined" && localStorage && localStorage.getItem("cube." + key) !== null) {
                Saiku.session.sessionworkspace.cube[key] = new Cube(JSON.parse(localStorage.getItem("cube." + key)));
            } else {
                Saiku.session.sessionworkspace.cube[key] = new Cube({ key: key });
                Saiku.session.sessionworkspace.cube[key].fetch({ async : false });
            }
            dimensions = Saiku.session.sessionworkspace.cube[key].get('data').dimensions;
        }
        var used_levels = [];

        var v1 = this.workspace.query.helper.getHierarchy(h);
        var v2 =
            _.each(v1.levels, function(level){
                var lev = h+".["+level.name+"]";
                used_levels.push(lev);
            });
        _.each(dimensions, function(dimension) {
            if (dimension.name == d) {
                _.each(dimension.hierarchies, function(hierarchy) {
                    if (hierarchy.uniqueName == h) {
                        _.each(hierarchy.levels, function(level,e) {

                            if (level.uniqueName == l) {
                                l_caption = level.caption;
                                l_name = level.name;
                                k = hierarchy.levels[e+1].name;
                            }
                        });
                    }
                });
            }
        });
        //Keep and Include
        var updates = [];
        var hierarchy = this.workspace.query.helper.getHierarchy(h);

        if (hierarchy && hierarchy.levels.hasOwnProperty(l_caption)) {
            updates.push({
                uniqueName: cell.properties.uniquename,
                caption: cell.properties.uniquename
            });
            //下面这行添加了就是keep
            hierarchy.levels[l_caption].selection.type = "INCLUSION";
            hierarchy.levels[l_caption].selection.members = updates;

            this.workspace.query.helper.includeLevel(axis, h, k, null);
            this.workspace.drop_zones.synchronize_query();
            this.workspace.query.run(true);
            this.workspace.query.helper.displayAllSelections();
        }

    },
    clicked_cell: function(event) {
        var self = this;
        if ($(this.workspace.el).find( ".workspace_results.ui-selectable" ).length > 0) {
            $(this.workspace.el).find( ".workspace_results" ).selectable( "destroy" );
        }
        var $target = ($(event.target).hasClass('row') || $(event.target).hasClass('col') ) ?
            $(event.target).find('div') : $(event.target);

    var $body = $(document);
    },
    render: function(args, block) {

        if (typeof args == "undefined" || typeof args.data == "undefined" ||
            ($(this.workspace.el).is(':visible') && !$(this.el).is(':visible'))) {
            return;
        }

        if (args.data !== null && args.data.error !== null) {
            return;
        }
        // Check to see if there is data
        if (args.data === null || (args.data.height && args.data.height === 0)) {
            return;
        }
        this.clearOut();
        $(this.el).html('Rendering ' + args.data.width + ' columns and ' + args.data.height + ' rows...');

        // Render the table without blocking the UI thread
        _.delay(this.process_data, 2, args.data);

        setTimeout(function() {
            Backbone.trigger('zoomStart');
        },400)

    },

    clearOut: function() {
        // Do some clearing in the renderer
        this.renderer.clear();
        $(this.workspace.el).find( ".workspace_results" ).unbind('scroll');
        var element = document.getElementById(this.id);
        if(element == null){
            this.workspace.tab.select();
            var element = document.getElementById(this.id);
        }
        var table = element.firstChild;


        if (table) {
            element.removeChild(table);
        }
    },
    process_data: function(data) {
        this.workspace.processing.hide();
        this.workspace.adjust();
        // Append the table
        this.clearOut();
        $(this.el).html('<table></table>');
        var contents = this.renderer.render(data, {
            htmlObject:         $(this.el).find('table'),
            batch:              Settings.TABLE_LAZY,
            batchSize:          Settings.TABLE_LAZY_SIZE,
            batchIntervalSize:  Settings.TABLE_LAZY_LOAD_ITEMS,
            batchIntervalTime:  Settings.TABLE_LAZY_LOAD_TIME
        });
        this.post_process();
    },

    post_process: function() {
        if (this.workspace.query.get('type') == 'QM' && Settings.MODE != "view") {
            $(this.el).addClass('headerhighlight');
        } else {
            $(this.el).removeClass('headerhighlight');
        }
        $(this.el).find(".i18n").i18n(Saiku.i18n.po_file);
        this.workspace.trigger('table:rendered', this);
    }
});
