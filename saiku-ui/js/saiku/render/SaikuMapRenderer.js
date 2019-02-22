// Process data method
SaikuChartRenderer.prototype.myself_process_data_tree = function (args, flat) {
	var self = this,
	    headerNum,headerCnt = [],
		dataAll = [],doubleString=[],
	    singleString = [], data = {},
		content = [],dataInfo = [],
		dataList = [];
	this.valueContent=[], this.doubleHeader;
	if (flat) {
		data.resultset = [];
		data.metadata = [];
		data.height = 0;
		data.width = 0;
	}
	var currentDataPos = data;
	if (typeof args == "undefined" || typeof args.data == "undefined") {
		return;
	}
	if (args.data !== null && args.data.error !== null) {
		return;
	}
	// Check to see if there is data
	if (args.data === null || (args.data.cellset && args.data.cellset.length === 0)) {
		return;
	}
	var cellset = args.data.cellset;
	for(var m=0;m<cellset.length;m++){
		if(cellset[m][0].type=="ROW_HEADER_HEADER"){
			headerNum=m;
		}
	}
	cellset[0].forEach(function(n){
		if(n.type=="COLUMN_HEADER"&&n.value!="null"){
			content.push(n.value);
		}
	})
	if(headerNum - 1 >= 0){
		for(var p=0;p<cellset[headerNum].length;p++){
			var headerArr = [],
				titleStr = [];
				if(cellset[headerNum][p].value!="null"&& cellset[headerNum][p].type=="COLUMN_HEADER"){
					headerArr.push(cellset[headerNum-1][p].value);
					headerArr.push(cellset[headerNum][p].value);
					if(cellset[headerNum-1][p].value=="null"){
						titleStr = cellset[headerNum][p].value;
					}else{
						titleStr = headerArr.join("~");
					}
					headerCnt.push(titleStr);
				}
		}
		for(var b=0;b<headerCnt.length;b++){
			var titleString = [],
				titleArray = [];
			if(headerNum-1==0){
				 titleString=[headerCnt[b]];
			}else{
				titleArray=[content[b],headerCnt[b]];
				titleString = titleArray.join("~");
			}
				doubleString.push(titleString);
		}
	}
	if(cellset[0][0].type=="ROW_HEADER_HEADER"){
		cellset[0].forEach(function(e){
			if(e.value!=null && e.type=="COLUMN_HEADER"){
				singleString.push(e.value);
			}
		})
		this.valueContent = singleString;
	}else{
		this.valueContent = doubleString;
	}
	if (cellset && cellset.length > 0) {
		var lowest_level = 0;
		var data_start = 0;
		var hasStart = false;
		var row, rowLen, labelCol
		for (row = 0, rowLen = cellset.length; data_start === 0 && row < rowLen; row++) {
			for (var field = 0, fieldLen = cellset[row].length; field < fieldLen; field++) {
				if (!hasStart) {
					while (cellset[row][field].type == "COLUMN_HEADER" && cellset[row][field].value == "null") {
						row++;
					}
				}
				hasStart = true;
				if (cellset[row][field].type == "ROW_HEADER_HEADER") {
					while (cellset[row][field].type == "ROW_HEADER_HEADER") {
						if (flat) {
							data.metadata.push({
								colIndex: field,
								colType: "String",
								colName: cellset[row][field].value
							});
						}
						field++;
					}
					lowest_level = field - 1;
				}
				this.doubleHeader = field
				if (cellset[row][field].type == "COLUMN_HEADER") {
					var lowest_col_header = 0;
					var colheader = [];
					while (lowest_col_header <= row) {
						if (cellset[lowest_col_header][field].value !== "null") {
							colheader.push(cellset[lowest_col_header][field].value);
						}
						lowest_col_header++;
					}
					if (flat) {
						data.metadata.push({
							colIndex: field,
							colType: "Numeric",
							colName: colheader.join(' ~ ')
						});
					}
					data_start = row + 1;
				}
			}
		}
		var rowlabels = [];
		for (labelCol = 0; labelCol <= lowest_level; labelCol++) {
			rowlabels.push(null);
		}
		for (row = data_start, rowLen = cellset.length; row < rowLen; row++) {
			if (cellset[row][0].value !== "") {
				var record = [],
                    flatrecord = [],
				    parent = null,
                    rv = null;
				for (labelCol = 0; labelCol <= lowest_level; labelCol++) {
					if (cellset[row] && cellset[row][labelCol].value === 'null') {
						currentDataPos = data;
						var prevLabel = 0;
						for (; prevLabel < lowest_level && cellset[row][prevLabel].value === 'null'; prevLabel++) {
							currentDataPos = currentDataPos[rowlabels[prevLabel]];
						}
						if (prevLabel > labelCol) {
							labelCol = prevLabel;
						}
					}
					if (cellset[row] && cellset[row][labelCol].value !== 'null') {
						if (labelCol === 0) {
							for (var xx = 0; xx <= lowest_level; xx++) {
								rowlabels[xx] = null;
							}
						}
						if (typeof currentDataPos == "number") {
							parent[rv] = {};
							currentDataPos = parent[rv];
						}
						rv = cellset[row][labelCol].value;
						rowlabels[labelCol] = rv;
						if (!currentDataPos.hasOwnProperty(rv)) {
							currentDataPos[rv] = {};
						}
						parent = currentDataPos;
						currentDataPos = currentDataPos[rv];
					}
				}
				flatrecord = _.clone(rowlabels);
				for (var col = lowest_level + 1, colLen = cellset[row].length; col < colLen; col++) {
					var cell = cellset[row][col];
					var value = cell.value || 0;
					var maybePercentage = (value !== 0);
					// check if the resultset contains the raw value, if not try to parse the given value
					var raw = cell.properties.raw;
					if (raw && raw !== "null") {
						value = parseFloat(raw);
					} else if (typeof(cell.value) !== "number" && parseFloat(cell.value.replace(/[^a-zA-Z 0-9.]+/g, ''))) {
						value = parseFloat(cell.value.replace(/[^a-zA-Z 0-9.]+/g, ''));
						maybePercentage = false;
					}
					if (value > 0 && maybePercentage) {
						value = cell.value && cell.value.indexOf('%') >= 0 ? value * 100 : value;
					}
					record.push({tipStr: cell.value, arithmetic: value});
					flatrecord.push({f: cell.value, v: value});
				}
				rv = (rv === null ? "null" : rv);
				parent[rv] = record;
				currentDataPos = data;
			}
			dataInfo.push(flatrecord);
		}
		dataInfo.forEach(function(d){
			if(d != undefined){
				dataList.push(d);
			}
		});
		dataAll.push(data);
		dataAll.push(dataList);
		$(self.el).find('.tipsSpan').hide();

		return dataAll;
	}
    else {
		$(self.el).find('.tipsSpan').show();
	}
}
// Privence sum data
SaikuChartRenderer.prototype.Privence_data_sum = function (){
	var data = this.myself_process_data_tree({data: this.rawdata});
	var summeta;
	if(this.type == "worldmap"||this.type == "multipleworld"){
		return data[0];
	}
    else{
		if(data[0].中国!="undefined"){
			summeta = data[0].中国;
		}
		if(data[0].中国=="undefined"||data[0].中国==""||data[0].中国==null){
			summeta = data[0];
		}
		return summeta;
	}
}
// World map chart
SaikuChartRenderer.prototype.worldMap = function(o){
	this.type="worldmap";
	this.library = "d3_chart";
	var options = this.getQuickOptions(o);
	var dataSum = this.Privence_data_sum();
	d3.select('#' + options.canvas).selectAll("svg").remove();
	var svg = d3.select('#' + options.canvas).append("svg")
		.attr("width", options.width)
		.attr("height", options.height + 50)
		.append("g")
		.attr("transform", "translate(" + options.width * 0.3 + " ,0)")
	d3.selectAll(".d3-tip").remove();
	var worldJsonPath = "/xdatainsight/content/saiku-ui/js/saiku/plugins/fine_Chart/mapdata/world-countries.json";
	var argsWorld = {
		mapPath: worldJsonPath,
		svg: svg,
		dataSum: dataSum,
		clickNum: 0,
		panleObj: options,
		typeChart: this.type
	}
	drawMapPath(argsWorld);
	this.chart = svg;
}
// China map chart
SaikuChartRenderer.prototype.chinaMap = function (o){
	this.type="chinamap";
	this.library = "d3_chart";
	var options = this.getQuickOptions(o);
	var dataSum = this.Privence_data_sum();
	d3.select('#' + options.canvas).selectAll("svg").remove();
	var svg = d3.select('#' + options.canvas).append("svg")
		.attr("width", options.width)
		.attr("height", options.height + 50)
		.append("g")
		.attr("transform", "translate(" + options.width * 0.3 + ", 0)")
	d3.selectAll(".d3-tip").remove();
	var chinaJsonPath = "/xdatainsight/content/saiku-ui/js/saiku/plugins/fine_Chart/mapdata/china.json";
	var argsChina = {
		mapPath: chinaJsonPath,
		svg: svg,
		dataSum: dataSum,
		clickNum: 0,
		panleObj: options,
		typeChart: this.type,
		spanRedender: $(this.el).find('a.rerender')
	};
	drawMapPath(argsChina);
	this.chart = svg;
}
// China Multiple china map chart
SaikuChartRenderer.prototype.multipleChinaMap = function (o){
	var options = this.getQuickOptions(o);
	this.library = "d3_chart",
	this.type = "multiplemap";
	var dataSum = this.Privence_data_sum();
	d3.select('#' + options.canvas).selectAll("svg").remove();
	var svgMultiple = d3.select('#' + options.canvas).append("svg")
		.attr("width", options.width)
		.attr("height", options.height*1.5)
		.append("g")
		.attr("transform", "translate("+options.width*0.3+",0)")
	var chinaJsonPath = "/xdatainsight/content/saiku-ui/js/saiku/plugins/fine_Chart/mapdata/china.json";
	var argsMultiple = {
		mapPath:chinaJsonPath,
		svg:svgMultiple,
		panleObj:options,
		vauleCnt : this.valueContent,
		typeChart:this.type,
		dataSum:dataSum
	}
	drawMultipleMap(argsMultiple);
	this.chart = svgMultiple;
}
// Scatter China Map chart
SaikuChartRenderer.prototype.scatterChinaMap = function(o){
	this.type="scattermap";
	this.library = "d3_chart";
	var options = this.getQuickOptions(o);
	var data = this.myself_process_data_tree({data:this.rawdata});
	d3.select('#' + options.canvas).selectAll("svg").remove();
	var svg = d3.select('#' + options.canvas).append("svg")
		.attr("width", options.width)
		.attr("height", options.height+50)
		.append("g")
		.attr("transform", "translate("+options.width*0.3+",0)")
	d3.selectAll(".d3-tip").remove();
	var chinaJsonPath = "/xdatainsight/content/saiku-ui/js/saiku/plugins/fine_Chart/mapdata/china.json";
	var lengthNum = this.valueContent.length;
	var argsScatter = {
		mapPath:chinaJsonPath,
		svg:svg,
		options:options,
		data:data[1],
		lengthNum:lengthNum,
		contentHeader:this.valueContent
	};
	drawScatterChina(argsScatter);
	this.chart = svg;
}
// China Multiple world map chart
SaikuChartRenderer.prototype.multipleWorldMap = function (o){
	this.library = "d3_chart",
	this.type = "multipleworld";
	var options = this.getQuickOptions(o),
		dataSum = this.Privence_data_sum();
	d3.select('#' + options.canvas).selectAll("svg").remove();
	var svg = d3.select('#' + options.canvas).append("svg")
		.attr("width", options.width)
		.attr("height", options.height*1.3)
		.append("g")
		.attr("transform", "translate("+options.width*0.3+",0)")
	var chinaJsonPath = "/xdatainsight/content/saiku-ui/js/saiku/plugins/fine_Chart/mapdata/world-countries.json";
	var argsMultiple = {
		mapPath:chinaJsonPath,
		svg:svg,
		panleObj:options,
		vauleCnt : this.valueContent,
		typeChart:this.type,
		dataSum:dataSum
	};
	drawMultipleMap(argsMultiple);
	this.chart = svg;
}
