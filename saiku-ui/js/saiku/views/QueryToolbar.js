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
 * The query toolbar, and associated actions
 */
var QueryToolbar = Backbone.View.extend({
    events: {
        'click .options a.button': 'call',
		'mouseover .options a.button': 'hoverWords',
		'mouseout .options a.button': 'hoverWordsDelete',
                 'click .renderer a.button' : 'switch_render_button',
		'click  .renderer a.mapButton':'swicthOver'
    },
    chart: {},
    render_mode: "table",
    spark_mode: null,
	num:false,
    initialize: function(args) {
        // Keep track of parent workspace
        this.workspace = args.workspace;
        // Maintain `this` in callbacks
        _.bindAll(this, "call","activate_buttons", "spark_bar", "spark_line", "render_row_viz", "run_row_viz", "switch_render_button");
        this.render_mode = "table";
		this.num = false;
        this.spark_mode = null;
        // Activate buttons when a new query is created or run
        this.workspace.bind('query:new', this.activate_buttons);
        this.workspace.bind('query:result', this.activate_buttons);
        this.workspace.bind('table:rendered', this.run_row_viz);
    },
    activate_buttons: function(args){

        if (typeof args != "undefined" && args !== null ) {


            $(this.el).find('a').removeClass('disabled_toolbar');
            if (!args.data) {
                $(this.el).find('a.export_button, a.stats').addClass('disabled_toolbar');
            }
            if (isIE /*|| Settings.BIPLUGIN5*/) {
                $(this.el).find('a.export_button').addClass('disabled_toolbar');
            }
        }
    },
    template: function() {
        var template = $("#template-query-toolbar").html() || "";
        return _.template(template)();
    },
    render: function() {
        $(this.el).html(this.template());
        $(this.el).find('render_table').addClass('on');
        $(this.el).find('ul.table').show();
        return this;
    },
    switch_render_button: function(event) {
        var $target = $(event.target);//找到
        event.preventDefault();
        //如果不可用，则不操作
        if ($(event.target).hasClass('disabled_toolbar')) {
            return false;
        }
        $target.parent().siblings().find('.on').removeClass('on');

        var isMap = $(this.el).find('ul.chart li a.on:first').size() > 0 ?
                        $(this.el).find('ul.chart li a.on:first').attr('href').replace('#', '')
                        : null;
        /*判断有没有报错*/
            if ($target.hasClass('render_chart')) {
                //显示图表
                $(".myseperator .yhnExportGroup1").css("display","none");
                $(".myseperator .yhnExportGroup2").css("display","inline-block");
                if($target.hasClass('chartButton')){
                    $(this.el).find('ul.chart tr.mapcharttr').hide();
                    $(this.el).find('ul.chart tr.charttr').show();
                }else if($target.hasClass('mapButton')){
                    $(this.el).find('ul.chart tr.mapcharttr').show();
                    $(this.el).find('ul.chart tr.charttr').hide();
                }
                if (isMap === 'map') {
                    this.switch_render(isMap);
                    this.workspace.query.setProperty('saiku.ui.render.mode', 'map');
                    this.workspace.query.setProperty('saiku.ui.render.type', 'map_marker');
                } else {
                    /*设置是否渲染*/
                    if ($target.hasClass('render_chart')) {
                        //显示图表
                        $(".myseperator .yhnExportGroup1").css("display","none");
                        $(".myseperator .yhnExportGroup2").css("display","inline-block");
                        if($target.hasClass('chartButton')){
                            $(this.el).find('ul.chart tr.mapcharttr').hide();
                            $(this.el).find('ul.chart tr.charttr').show();
                        }else if($target.hasClass('mapButton')){
                            $(this.el).find('ul.chart tr.mapcharttr').show();
                            $(this.el).find('ul.chart tr.charttr').hide();
                        }
                        if (isMap === 'map') {
                            this.switch_render(isMap);
                            this.workspace.query.setProperty('saiku.ui.render.mode', 'map');
                            this.workspace.query.setProperty('saiku.ui.render.type', 'map_marker');
                        } else {

                            this.switch_render('chart');
                            this.workspace.query.setProperty('saiku.ui.render.mode', 'chart');
                            var c = $(this.el).find('ul.chart li a.on:first').size() > 0 ?
                                $(this.el).find('ul.chart li a.on:first').attr('href').replace('#', '')
                                : null;
                            if (c !== null) {
                                this.workspace.query.setProperty('saiku.ui.render.type', c);
                            }
                        }
                    } else if($target.hasClass('render_table')) {

                        //显示表格
                        $(".myseperator .yhnExportGroup2").css("display","none");
                        $(".myseperator .yhnExportGroup1").css("display","inline-block");
                        this.switch_render('table');
                        this.workspace.query.setProperty('saiku.ui.render.mode', 'table');
                        this.workspace.query.setProperty('saiku.ui.render.type', this.spark_mode);
                    }else if($target.hasClass('render_map')){
                        //显示图表
                        $(".myseperator .yhnExportGroup1").css("display","none");
                        $(".myseperator .yhnExportGroup2").css("display","inline-block");
                        this.switch_render('map');
                        this.workspace.query.setProperty('saiku.ui.render.mode', 'map');
                        this.workspace.query.setProperty('saiku.ui.render.type', 'map_marker');
                    }
                    this.switch_render('chart');
                    this.workspace.query.setProperty('saiku.ui.render.mode', 'chart');
                    var c = $(this.el).find('ul.chart li a.on:first').size() > 0 ?
                        $(this.el).find('ul.chart li a.on:first').attr('href').replace('#', '')
                        : null;
                    if (c !== null) {
                        this.workspace.query.setProperty('saiku.ui.render.type', c);
                    }
                }
            } else if($target.hasClass('render_table')) {

                //显示表格
                $(".myseperator .yhnExportGroup2").css("display","none");
                $(".myseperator .yhnExportGroup1").css("display","inline-block");
                this.switch_render('table');
                this.workspace.query.setProperty('saiku.ui.render.mode', 'table');
                this.workspace.query.setProperty('saiku.ui.render.type', this.spark_mode);
            }else if($target.hasClass('render_map')){
                //显示图表
                $(".myseperator .yhnExportGroup1").css("display","none");
                $(".myseperator .yhnExportGroup2").css("display","inline-block");
                this.switch_render('map');
                this.workspace.query.setProperty('saiku.ui.render.mode', 'map');
                this.workspace.query.setProperty('saiku.ui.render.type', 'map_marker');
            }
        // }

		return false;
    },
    switch_render: function(render_type) {

        $(this.el).find('ul.renderer a.on').removeClass('on');
        $(this.el).find('ul.renderer a.render_' + render_type + ':first').addClass('on');
        /*控制报错时候不现实表格*/

            if (render_type == "chart") {

                $(this.el).find('ul.chart').show();
                $(this.el).find('ul.table').hide();
                $(this.el).find('ul.map').hide();
                this.render_mode = "chart";
                $(this.workspace.el).find('.workspace_results').children("div:nth-child(2)").show();//table show
                $(this.workspace.el).find('.table_wrapper').hide();//table show
                if (this.workspace.query.run() != false) {
                    /*控制报错时，不显示图表*/
                    this.workspace.chart.show();
                }
            }
            else if (render_type === 'map') {
                this.$el.find('ul.renderer a.render_map').addClass('on');
                this.$el.find('ul.chart').hide();
                this.$el.find('ul.table').hide();
                this.$el.find('ul.map').show();
                this.render_mode = 'map';
                this.workspace.$el.find('.workspace_results').children().hide();
                this.workspace.chart.$el.find('.canvas_wrapper').show();
                this.workspace.chart.show();
            }
            else {

            $(this.el).find('ul.chart').hide();
            $(this.el).find('ul.table').show();
            $(this.el).find('ul.map').hide();
            $(this.el).find('ul.table .stats').removeClass('on');
            $(this.workspace.el).find('.workspace_results').children().hide();

            $(this.workspace.el).find('.workspace_results .table_wrapper').show();
            $(this.workspace.chart.el).hide();
            this.render_mode = "table";
            var hasRun = this.workspace.query.result.hasRun();
            if (hasRun) {
                this.workspace.table.render({data: this.workspace.query.result.lastresult()});
            }
        }

        return false;
    },
	swicthOver:function(){
			$(this.el).find('ul.renderer a.on').removeClass('on');
			$(this.el).find('ul.renderer a.render_chart:last').addClass('on');
	},
	hoverWords:function(event){
		var $target = $(event.target).hasClass('button') ? $(event.target) : $(event.target).parent();
		if($target.hasClass('yhnBar')){
			this.displayWords("<div class='graphics'><b>柱状图</b> <br>尝试 1个或多个<b>维度</b><br>1个或多个<b>度量</b></div>",$target);
		}else if($target.hasClass('yhnStackedBar')){
			this.displayWords("<div class='graphics'><b>堆积柱状图</b><br>尝试 1个或多个<b>维度</b><br>1个或多个<b>度量</b></div>",$target);
		}else if($target.hasClass('yhnStackedBar100')){
			this.displayWords("<div class='graphics'><b>百分比堆积柱状图</b><br>尝试 1个或多个<b>维度</b><br>1个或多个<b>度量</b></div>",$target);
		}else if($target.hasClass('yhnMultiple')){
			this.displayWords("<div class='graphics'><b>多图式柱状图</b><br>尝试 1个或多个<b>维度</b><br>1个或多个<b>度量</b></div>",$target);
		}else if($target.hasClass('yhnLine')){
			this.displayWords("<div class='graphics'><b>折线图</b><br>尝试1个<b>日期</b><br>0个或多个<b>维度</b><br>1个或多个<b>度量</b></div>",$target);
		}else if($target.hasClass('yhnArea')){
			this.displayWords("<div class='graphics'><b>面积图</b><br>尝试1个<b>日期</b><br>0个或多个<b>维度</b><br>1个或多个<b>度量</b></div>",$target);
		}else if($target.hasClass('yhnHeatGrid')){
			this.displayWords("<div class='graphics'><b>热点图</b><br>尝试1个或多个<b>维度</b><br>1个或2个<b>度量</b></div>",$target);
		}else if($target.hasClass('yhnTreeMap')){
			this.displayWords("<div class='graphics'><b>树地图</b><br>尝试1个或多个<b>维度</b><br>1个或2个<b>度量</b></div>",$target);
		}else if($target.hasClass('yhnSunBurst')){
			this.displayWords("<div class='graphics'><b>环形图</b><br>尝试1个或多个<b>维度</b><br>1个或2个<b>度量</b></div>",$target);
		}else if($target.hasClass('yhnMultipleSunBurst')){
			this.displayWords("<div class='graphics'><b>多图式环形图</b><br>尝试1个或多个<b>维度</b><br>1个或2个<b>度量</b></div>",$target);
		}else if($target.hasClass('yhnDot')){
			this.displayWords("<div class='graphics'><b>散点图</b><br>尝试1个或多个<b>维度</b><br>1个或2个<b>度量</b></div>",$target);
		}else if($target.hasClass('yhnWaterFall')){
			this.displayWords("<div class='graphics'><b>瀑布图</b><br>尝试1个或多个<b>维度</b><br>1个或2个<b>度量</b></div>",$target);
		}else if($target.hasClass('yhnPie')){
			this.displayWords("<div class='graphics'><b>饼图</b><br>尝试1个或多个<b>维度</b><br>1个或2个<b>度量</b></div>",$target);
		}else if($target.hasClass('yhnTreesLink')){
			this.displayWords("<div class='graphics'><b>树状关系图</b><br>尝试1个或多个<b>维度</b><br>1个或2个<b>度量</b></div>",$target);
		}else if($target.hasClass('yhnForce')){
			this.displayWords("<div class='graphics'><b>树状关系网络图</b><br>尝试1个或多个<b>维度</b><br>1个或2个<b>度量</b></div>",$target);
		}else if($target.hasClass('yhnBubble')){
			this.displayWords("<div class='graphics'><b>气泡图</b><br>尝试1个<b>维度</b><br>1个或多个<b>度量</b></div>",$target);
		}else if($target.hasClass('yhnChinamap')){
			this.displayWords("<div class='graphics1'><b>中国地图</b><br>尝试行轴放置1个<b>地理维度</b><br>1个<b>度量</b></div>",$target);
		}else if($target.hasClass('yhnMultiplemap')){
			this.displayWords("<div class='graphics1'><b>时间轴地图</b><br>尝试行轴1个<b>地理维度</b><br>列轴1个<b>时间</b>或其他<b>维度</b><br>1个或多个<b>度量</b></div>",$target);
		}else if($target.hasClass('yhnScattermap')){
			this.displayWords("<div class='graphics1'><b>气泡地图</b><br>尝试行轴放置1个<b>地理维度</b><br>1个或2个<b>度量</b></div>",$target);
		}else if($target.hasClass('yhnWorldmap')){
			this.displayWords("<div class='graphics1'><b>世界地图</b><br>尝试行轴放置1个<b>地理维度</b><br>1个<b>度量</b></div>",$target);
		}else if($target.hasClass('yhnMultipleworld')){
			this.displayWords("<div class='graphics1'><b>时间轴世界地图</b><br>尝试行轴放置1个<b>地理维度</b><br>列轴1个<b>时间</b>或其他<b>维度</b></br>一个或多个<b>度量</b></div>",$target);
		}else if($target.hasClass('yhnRadar')){
            this.displayWords("<div class='graphics1'><b>雷达图</b><br>尝试行轴放置1个<b>维度</b><br>或其他<b>维度</b><br>一个<b>度量</b></div>",$target);
        }else if($target.hasClass('spark_bar')){
            this.displayWords("<div class='graphics1'><b>迷你柱状图</b><br>缩略显示表格数据</div>",$target);
        }
		return false;
	},
    call: function(event) {
        var $target = $(event.target).hasClass('button') ? $(event.target) : $(event.target).parent();
        if (!$target.hasClass('disabled_toolbar')) {
            // Determine callback
            var callback = $target.attr('href').replace('#', '');
            // Attempt to call callback
            if (this.render_mode == "table" && this[callback]) {
                this[callback](event);
            }
            else if (this.render_mode == "chart") {
                this.workspace.chart.$el.find('.canvas_wrapper').find('#map').data('action', 'querytoolbar');
                if ($target.hasClass('chartoption')) {
                    var mapProperties = {};
                    mapProperties.mapDefinition = {};
                    this.workspace.query.setProperty('saiku.ui.map.options', mapProperties);
                    this.workspace.query.setProperty('saiku.ui.render.mode', 'chart');
                    this.workspace.querytoolbar.$el.find('ul.chart [href="#export_button"]').parent().show();
                    this.workspace.querytoolbar.$el.find('ul.chart > li#charteditor').show();
                    this.workspace.querytoolbar.$el.find('ul.chart [href="#map"]').parent().removeClass('seperator_vertical');
                    this.workspace.querytoolbar.$el.find('ul.chart [href="#map"]').removeClass('on');
                    $target.parent().parent().parent().parent().find("li").find('.chartoption.on').removeClass('on');
                    $target.addClass('on');
                }
                if (callback == "export_button") {
                    this.workspace.chart[callback](event);
                } else {
                    this.workspace.chart.renderer.switch_chart(callback);
                    this.workspace.query.setProperty('saiku.ui.render.type', callback);
                }
            }
            else if (this.render_mode === 'map' && callback !== 'map') {
                this.workspace.chart.$el.find('.canvas_wrapper').find('#map').data('action', 'querytoolbar');
                if ($target.hasClass('chartoption')) {
                    var mapProperties = {};
                    mapProperties.mapDefinition = {};
                    this.workspace.query.setProperty('saiku.ui.map.options', mapProperties);
                    this.workspace.query.setProperty('saiku.ui.render.mode', 'chart');
                    this.workspace.querytoolbar.$el.find('ul.chart [href="#export_button"]').parent().show();
                    this.workspace.querytoolbar.$el.find('ul.chart > li#charteditor').show();
                    this.workspace.querytoolbar.$el.find('ul.chart [href="#map"]').parent().removeClass('seperator_vertical');
                    this.workspace.querytoolbar.$el.find('ul.chart [href="#map"]').removeClass('on');
                    $target.parent().siblings().find('.chartoption.on').removeClass('on');
                    $target.addClass('on');
                }
                if (callback == "export_button") {
                    this.workspace.chart[callback](event);
                } else {
                    this.workspace.chart.renderer.switch_chart(callback);
                    this.workspace.query.setProperty('saiku.ui.render.type', callback);
                }
            }
			event.stopPropagation();
        }

        event.preventDefault();
        return false;
    },
    hoverWordsDelete:function(event){
        var $target = $(event.target).hasClass('button') ? $(event.target) : $(event.target).parent();
        document.querySelector("#reminder").style.display = "none";
    },
    displayWords:function(words1,event){
        var obj = event[0];
        for (var t = obj.offsetTop, l = obj.offsetLeft; obj = obj.offsetParent;) {
            t += obj.offsetTop;
            l += obj.offsetLeft;
        }
        l = l - 205;
        t = t - 30;
        document.querySelector("#reminder").style.top = ""+t+"px";
        document.querySelector("#reminder").style.left = ""+l+"px";
        document.querySelector("#reminder").style.display = "block";
        document.querySelector("#reminder li a.reminderWords1").innerHTML = words1;
        //words Length
        var wordsLength =  words1.split("br").length;
        document.querySelector("#reminder").style.height = wordsLength*22+26+"px";
	},
    spark_bar: function() {
        $(this.el).find('table .spark_bar').toggleClass('on');
        $(this.el).find('table .spark_line').removeClass('on');

        $(this.workspace.table.el).find('td.spark').remove();
        if ($(this.el).find('table .spark_bar').hasClass('on')) {
            this.spark_mode = "spark_bar";
            this.workspace.query.setProperty('saiku.ui.render.type', 'spark_bar');
            _.delay(this.render_row_viz, 10, "spark_bar");
        } else {
            this.spark_mode = null;
        }
    },
    spark_line: function() {
        $(this.el).find('table .spark_line').toggleClass('on');
        $(this.el).find('table .spark_bar').removeClass('on');

        $(this.workspace.table.el).find('td.spark').remove();
        if ($(this.el).find('table .spark_line').hasClass('on')) {
            this.spark_mode = "spark_line";
            this.workspace.query.setProperty('saiku.ui.render.type', 'spark_line');
            _.delay(this.render_row_viz, 10, "spark_line");
        } else {
            this.spark_mode = null;
        }
    },
    run_row_viz: function(args) {
        if (this.render_mode == "table" && this.spark_mode !== null) {
            this.render_row_viz(this.spark_mode);
        }

    },
    render_row_viz: function(type) {
        $(this.workspace.table.el).find('tr').each(function(index, element) {
            var rowData = [];
            $(element).find('td.data div').each(function(i,data) {
                var val = $(data).attr('alt');
                val = (typeof val != "undefined" && val !== "" && val !== null && val  != "undefined") ? parseFloat(val) : 0;
                rowData.push(val);
            });
            $("<td class='data spark'>&nbsp;<div id='chart" + index + "'></div></td>").appendTo($(element));
            var width = rowData.length * 9;

                if (rowData.length > 0) {
                    var vis = new pv.Panel()
                        .canvas('chart' + index)
                        .height(12)
                        .width(width)
                        .margin(0)

                    if (type == "spark_bar") {
                        vis.add(pv.Bar)
                            .data(rowData)
                            .left(pv.Scale.linear(0, rowData.length).range(0, width).by(pv.index))
                            .height(pv.Scale.linear(0,_.max(rowData)).range(0, 12))
                            .width(6)
                            .bottom(0);
                    }
                    vis.render();
                }
        });
    }
});
