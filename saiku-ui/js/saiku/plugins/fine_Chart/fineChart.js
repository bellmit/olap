/**
 * Created by Administrator on 2016/3/8.
 */
var fillBubbleColor = function(num){
	var colors = [];
	if(num<=3){
		colors = ['#2DC1E9', '#B7EFFE', '#BAD202'];
	}else if(num<=7){
		colors = ['#00667D', '#1686B6', '#36BEF0','#83AD01','#BAD202',"#FDD900","#FF7A4D"];
	}else if(num<=15){
		colors = ["#00679A","#1686B6","#6068B1","#667FB5","#01BCCD","#2DC1E9","#B7EFFE","#75C5A2",
			"#83AD01","#BAD202","#FDD900","#FCBD56","#FF7A4D","#EC407A","#959595"];
	}else{
		colors = ["#345684","#00679A","#5960A6","#017F96","#00A0B8","#01B6D3","#2DC1E9",
			"#6CC9DA","#B7EFFE","#CCE3DD","#75C5A2","#83AD01","#ADBE22","#BAD202","#FDD900",
			"#FCBD56","#FF7A4D","#EC407A","#D26A9D","#959595"];
	}
	return colors;
}
// bubble draw
var drawBubble = function(bubbleObj) {
	var lengthCol  = bubbleObj.headerCnt.length,
		dataArr = bubbleObj.data[1],
		dataNodes = [],
		nodesLength = dataArr.length,
	    color = fillBubbleColor(nodesLength);
	var bubble = d3.layout.pack()
		.sort(null)
		.size([bubbleObj.options.width, bubbleObj.options.height])
		.padding(3);
	var node = bubbleObj.svg.selectAll(".node")
		.data(bubble.nodes(classes(dataArr))
		.filter(function(d) {
			return !d.children;
			}
		)
	)
		.enter().append("g")
		.attr("class", "node")
		.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
	var tip = d3.behavior.tip()
		.attr({'class':'d3-tip'})
		.offset([-10, 0]);
	bubbleObj.svg.call(tip);
	node.append("circle")
		.on("mouseover",function(d){
			var tipsArray = [];
			for(var t = 0;t<d.valueArr.length;t++){
				var transferHeader = [],
					headerStr = [];
				transferHeader.push(bubbleObj.headerCnt[t]);
				transferHeader.push(d.valueArr[t]);
				headerStr = transferHeader.join(" : ");
				tipsArray.push(headerStr);
			}
			tip.html(d.className+" :</br>"+tipsArray.join("</br>"));
			tip.show();
		})
		.on("mouseleave",function(){
			tip.hide();
		})
		.attr("transform", function() { return "translate(" + 0 + "," + 0 + ")"; })
		.attr("r", 0)
		.transition()
		.delay(function(d,i){
			if(nodesLength<=9){
				return (800)/nodesLength*i;
			}
			return (800)/nodesLength*i;
		})
		.duration(function(d,i){
			return 800/nodesLength*i;
		})
		.attr("r", function(d) {
			return d.r;
		})
		.style("fill", function(d,i) {
			if(d.negativePara == 0){
				var colortip = "#FF4500";
			}else{
				if(color.length<=i){
					var colortip = color[i%color.length];
				}else{
					var colortip = color[i];
				}
			}
			return colortip;
		})
		.style("cursor","default");
	var divide = 0;
	var subLength=0;
	var flag=0;
	if ((navigator.userAgent.indexOf('MSIE') >= 0) && (navigator.userAgent.indexOf('Opera') < 0)){divide = 3;subLength=6;flag=1;}
	else if (navigator.userAgent.indexOf('Firefox') >= 0){divide = 3;subLength=6;flag=1;}
	else if (navigator.userAgent.indexOf('Opera') >= 0){divide = 20;}
	else{divide=5;subLength=6;flag=2;}
	var text = node.append("text")
		.on("mouseover",function(d,i){
			var tipsArray = [];
			for(var t = 0;t<d.valueArr.length;t++){
				var transferHeader = [],
					headerStr = [];
				transferHeader.push(bubbleObj.headerCnt[t]);
				transferHeader.push(d.valueArr[t]);
				headerStr = transferHeader.join(" : ");
				tipsArray.push(headerStr);
			}
			tip.html(d.className+" :</br>"+tipsArray.join("</br>"));
			tip.show();
		})
		.on("mouseleave",function(){
			tip.hide();
		})
		.attr("dy", "0")
		.style("text-anchor", "middle")
		.text(function(d) { return d.className.substring(0, d.r/subLength ); })
		.attr("font-size",function(d){
			if(flag==1){
				if(d.r/divide<=12){return 12;}
			}
			return d.r/divide;
		})
		.style("cursor","default");
	function classes(root){
		root.forEach(function(d){
			var titleLoc = d.length - lengthCol,
				dataFloat = [],
				negative = null;
			for(var a = titleLoc;a<d.length;a++){
				dataFloat.push(d[a].f);
			}
			if(titleLoc-2>=0){
				var packageNum = d[titleLoc-2];
			}else{
				var packageNum = d[titleLoc-1];
			}
			if(d[titleLoc].v<=0){
				negative = 0
				d[titleLoc].v = -(d[titleLoc].v);
			}
			if(d[titleLoc-1]!= null){
				var dataObj = {
					packageName: packageNum,
					className: d[titleLoc-1],
					value: d[titleLoc].v,
					valueArr:dataFloat,
					negativePara:negative
				}
				dataNodes.push(dataObj);
			}
		})
		return {children: dataNodes};
	}
}
// radar draw
var drawRadar = function(radarObj) {
	var id = '#' + radarObj.options.canvas,
		dataArr = radarObj.data[1];
	radarObj.svg.attr("transform", "translate("+radarObj.options.width * 0.5+", "+radarObj.options.height * 0.51+")")
		.attr("class", "radar" + id);
	var color = d3.scale.ordinal()
		          .range(radarObj.options.colors),
    radarChartOptions = {
		w: radarObj.options.width * 0.6,
		h: radarObj.options.height * 0.6,
		margin: 5,
		maxValue: 0.5,
		levels: 5,
		roundStrokes: true,
		width:radarObj.options.width,
		height:radarObj.options.height,
		color: color,
		svg:radarObj.svg,
		headerCnt:radarObj.headerCnt
	};
	var data = radarData(dataArr,radarObj.headerCnt);
	RadarPath(data,radarChartOptions);
}
// draw radar path
var RadarPath = function(data, options) {
	var cfg = {
		w: 600,				//Width of the circle
		h: 600,				//Height of the circle
		margin: {
			top: 5,
			right: 5,
			bottom: 5,
			left: 5
		},                     //The margins of the SVG
		levels: 3,				//How many levels or inner circles should there be drawn
		maxValue: 0, 			//What is the value that the biggest circle will represent
		labelFactor: 1.25, 	//How much farther than the radius of the outer circle should the labels be placed
		wrapWidth: 60, 		//The number of pixels after which a label needs to be given a new line
		opacityArea: 0.35, 	//The opacity of the area of the blob
		dotRadius: 4, 			//The size of the colored circles of each blog
		opacityCircles: 0.1, 	//The opacity of the circles of each blob
		strokeWidth: 2, 		//The width of the stroke around each blob
		roundStrokes: false,	//If true the area and stroke will follow a round path (cardinal-closed)
		color: d3.scale.category10()	//Color function
	};
	//Put all of the options into a variable called cfg
	if('undefined' !== typeof options){
		for(var i in options){
			if('undefined' !== typeof options[i]){ cfg[i] = options[i]; }
		}
	}
	//If the supplied maxValue is smaller than the actual one, replace by the max in the data
	var maxValue = Math.max(cfg.maxValue, d3.max(data, function(i){
		return d3.max(i.map(function(o){
			return o.value.v;
			}
		))
	}));
	var allAxis = (data[0].map(function(i, j){return i.key})),	//Names of each axis
		total = allAxis.length,					//The number of different axes
		radius = Math.min(cfg.w/2, cfg.h/2), 	//Radius of the outermost circle
		angleSlice = Math.PI * 2 / total;		//The width in radians of each "slice"
	//Scale for the radius
	var rScale = d3.scale.linear()
		.range([0, radius])
		.domain([0, maxValue]);
	//explain color
	var parentTitle = options.svg.append("g")
		.attr({
			"transform": "translate("+(-options.width * 0.4)+","+(-options.height * 0.43)+")"
		})
		.style({
			"font-variant": "normal",
			"font-stretch": "normal",
			"font-size":"15px"
		});
	var childTitle = parentTitle.selectAll(".childInfo")
		.data(options.headerCnt).enter()
		.append("g")
		.attr({
			"class": "childInfo",
			"transform":function(d,i){
				return "translate("+(i*150)+","+(-7)+")";
			}
		});
	var textTitle = parentTitle.selectAll(".textInfo")
		.data(options.headerCnt).enter()
		.append("g")
		.attr({
		"class": "textInfo",
		"transform":function(d,i){
			return "translate("+(i*150+20)+","+0+")";
		}
	});
	textTitle.append("text")
		.attr({
			"class":"textColor",
			"font-style":"normal" ,
			"font-variant": "normal",
			"font-weight": "normal",
			"font-stretch": "normal",
			"font-size": "15px",
			"line-height": "normal",
			"font-family": "sans-serif"
		})
		.text(function(d){
			return d;
	   })
	childTitle.append("circle")
		.attr({
			"r":8,
			"class":"circleColor"
		})
		.style({
			"fill":function(d,i){
				return cfg.color(i)
			},
			"stroke":function(d,i){
				return cfg.color(i)
			}
		})
	//Append a g element
	var g = options.svg.append("g")
	//Filter for the outside glow
	var filter = g.append('defs')
			.append('filter')
			.attr('id','glow'),
		feGaussianBlur = filter.append('feGaussianBlur')
			.attr('stdDeviation','2.5')
			.attr('result','coloredBlur'),
		feMerge = filter.append('feMerge'),
		feMergeNode_1 = feMerge.append('feMergeNode')
			.attr('in','coloredBlur'),
		feMergeNode_2 = feMerge.append('feMergeNode')
			.attr('in','SourceGraphic');
	//Wrapper for the grid & axes
	var axisGrid = g.append("g").attr("class", "axisWrapper");
	//Draw the background circles
	axisGrid.selectAll(".levels")
		.data(d3.range(1,(cfg.levels + 1)).reverse())
		.enter()
		.append("circle")
		.attr("class", "gridCircle")
		.attr("r", function(d, i){
			return radius/cfg.levels*d;
		})
		.style({
			"fill": "#CDCDCD",
			"stroke": "#CDCDCD",
			"fill-opacity": cfg.opacityCircles,
			"filter" : "url(#glow)"
		});
	//Text indicating at what % each level is
	axisGrid.selectAll(".axisLabel")
		.data(d3.range(1,(cfg.levels+1)).reverse())
		.enter().append("text")
		.attr("class", "axisLabel")
		.attr("x", 4)
		.attr("y", function(d){
			return -d * radius/cfg.levels;
		})
		.attr("dy", "0.4em")
		.style("font-size", "10px")
		.attr("fill", "#737373")
		//.text(function(d,i) { return maxValue * d/cfg.levels; });
	//Create the straight lines radiating outward from the center
	var axis = axisGrid.selectAll(".axis")
		.data(allAxis).enter()
		.append("g")
		.attr("class", "axis");
	//Append the lines
	axis.append("line")
		.attr("x1", 0)
		.attr("y1", 0)
		.attr("x2", function(d, i){
			return rScale(maxValue*1.1) * Math.cos(angleSlice*i - Math.PI/2);
		})
		.attr("y2", function(d, i){
			return rScale(maxValue*1.1) * Math.sin(angleSlice*i - Math.PI/2);
		})
		.attr("class", "line")
		.style("stroke", "white")
		.style("stroke-width", "2px");
	//Append the labels at each axis
	axis.append("text")
		.attr("class", "legend")
		.style("font-size", "11px")
		.attr("text-anchor", "middle")
		.attr("dy", "0.35em")
		.attr("x", function(d, i){
			return rScale(maxValue * cfg.labelFactor) * Math.cos(angleSlice*i - Math.PI/2);
		})
		.attr("y", function(d, i){
			return rScale(maxValue * cfg.labelFactor) * Math.sin(angleSlice*i - Math.PI/2);
		})
		.text(function(d){
			return d;
		})
		.call(wrap, cfg.wrapWidth);
	//The radial line function
	var radarLine = d3.svg.line.radial()
		.interpolate("linear-closed")
		.radius(function(d) {
			return rScale(d.value.v);
		})
		.angle(function(d,i) {
			return i*angleSlice;
		});
	if(cfg.roundStrokes) {
		radarLine.interpolate("cardinal-closed");
	}
	//Create a wrapper for the blobs
	var blobWrapper = g.selectAll(".radarWrapper")
		.data(data)
		.enter().append("g")
		.attr("class", "radarWrapper");
	//Append the backgrounds
	blobWrapper.append("path")
		.attr("class", "radarArea")
		.attr("d", function(d,i) {
			return radarLine(d);
		})
		.style("fill", function(d,i) {
			return cfg.color(i);
		})
		.style("fill-opacity", cfg.opacityArea)
		.on('mouseover', function (d,i){
			//Dim all blobs
			d3.selectAll(".radarArea")
				.transition().duration(200)
				.style("fill-opacity", 0.1);
			//Bring back the hovered over blob
			d3.select(this)
				.transition().duration(200)
				.style("fill-opacity", 0.8);
		})
		.on('mouseout', function(){
			//Bring back all blobs
			d3.selectAll(".radarArea")
				.transition().duration(200)
				.style("fill-opacity", cfg.opacityArea);
		});
	//Create the outlines
	blobWrapper.append("path")
		.attr("class", "radarStroke")
		.attr("d", function(d,i) { return radarLine(d); })
		.style("stroke-width", cfg.strokeWidth + "px")
		.style("stroke", function(d,i) { return cfg.color(i); })
		.style("fill", "none")
		.style("filter" , "url(#glow)");
	//Append the circles
	blobWrapper.selectAll(".radarCircle")
		.data(function(d,i) { return d; })
		.enter().append("circle")
		.attr("class", "radarCircle")
		.attr("r", cfg.dotRadius)
		.attr("cx", function(d,i){
			return rScale(d.value.v) * Math.cos(angleSlice*i - Math.PI/2);
		})
		.attr("cy", function(d,i){
			return rScale(d.value.v) * Math.sin(angleSlice*i - Math.PI/2);
		})
		.style("fill", function(d,i,j) {
			return cfg.color(j);
		})
		.style("fill-opacity", 0.8);
	var tip = d3.behavior.tip()
		.attr({'class':'d3-tip'})
		.offset([-10, 0]);
	options.svg.call(tip);
	//Wrapper for the invisible circles on top
	var blobCircleWrapper = g.selectAll(".radarCircleWrapper")
		.data(data)
		.enter().append("g")
		.attr("class", "radarCircleWrapper");
	//Append a set of invisible circles on top for the mouseover pop-up
	blobCircleWrapper.selectAll(".radarInvisibleCircle")
		.data(function(d,i) { return d; })
		.enter().append("circle")
		.attr("class", "radarInvisibleCircle")
		.attr("r", cfg.dotRadius * 1.5)
		.attr("cx", function(d,i){
			return rScale(d.value.v) * Math.cos(angleSlice*i - Math.PI/2);
		})
		.attr("cy", function(d,i){
			return rScale(d.value.v) * Math.sin(angleSlice*i - Math.PI/2);
		})
		.style("fill", "none")
		.style("pointer-events", "all")
		.on("mouseover", function(d,i) {
			tip.html(d.key+" : "+d.value.f);
			tip.show();
		})
		.on("mouseout", function(){
			tip.hide();
		});
	//Set up the small tooltip for when you hover over a circle
	var tooltip = g.append("text")
		.attr("class", "tooltip")
		.style("opacity", 0);
	//Wraps SVG text
	function wrap(text, width) {
		text.each(function() {
			var text = d3.select(this),
				words = text.text().split(/\s+/).reverse(),
				word,
				line = [],
				lineNumber = 0,
				lineHeight = 1.4, // ems
				y = text.attr("y"),
				x = text.attr("x"),
				dy = parseFloat(text.attr("dy")),
				tspan = text.text(null)
					.append("tspan")
					.attr("x", x)
					.attr("y", y)
					.attr("dy", dy + "em");
			while (word = words.pop()) {
				line.push(word);
				tspan.text(line.join(" "));
				if (tspan.node().getComputedTextLength() > width) {
					line.pop();
					tspan.text(line.join(" "));
					line = [word];
					tspan = text.append("tspan")
						.attr("x", x)
						.attr("y", y)
						.attr("dy", ++lineNumber * lineHeight + dy + "em")
						.text(word);
				}
			}
		});
	}
}
// radar data process
var radarData = function(dataArr,headerCnt){
	var childArr = [];
	for(var b = 0;b<headerCnt.length;b++){
		childArr[b] = [];
	}
	for(var d=0;d<dataArr.length;d++){
		var s= 0,
			dataLength = dataArr[d].length - headerCnt.length;
		for(var a = dataLength; a<dataArr[d].length;a++){
			var childObj = {};
			childObj = {
				key:dataArr[d][dataLength-1],
				value:dataArr[d][a]
			}
			childArr[s].push(childObj);
			s++;
		}
	}
	return childArr;
}
// color data node
var colorHandle = function(colorParam){
	var sortParam = colorParam.sort(compare);
	if (sortParam.length % 5 == 0) {
		var share = parseInt(sortParam.length/5);
	}
    else{
		if(sortParam.length%5>=3) {
			var share = parseInt(sortParam.length / 5)+1;
		}else{
			var share = parseInt(sortParam.length / 5);
		}
	}
	var rangeData = [];
	if(sortParam.length<=6){
		rangeData = sortParam;
	}
    else if(sortParam.length<=7){
		for(var n=0;n<5;n++){
			rangeData.push(sortParam[n])
		}
		rangeData.push(sortParam[sortParam.length-1]);
	}
    else if(sortParam.length>7){
		for(var n=0;n<5;n++){
			if(n==0){
				rangeData.push(sortParam[0]);
			}else{
				rangeData.push(sortParam[share*n-1]);
			}
		}
		rangeData.push(sortParam[sortParam.length-1]);
	}
	if(rangeData.length<6){
		for(var m = rangeData.length;m<6;m++){
			rangeData[m] = 0;
		}
	}
	return rangeData;
}
// multiple color range chose
var fillColor = function(dataValue,rangeData){
	var colorParam = {
		a:d3.rgb(253,217,0),
		b:d3.rgb(187,211,1),
		c:d3.rgb(131,173,0),
		d:d3.rgb(54,191,241),
		e:d3.rgb(22,135,183),
		f:d3.rgb(0,102,124)
	}
	if(dataValue<=rangeData[4]){
		var minParam=rangeData[5];
		var maxParam = rangeData[4];
		var computeColor = d3.interpolate(colorParam.a,colorParam.b);
	}else if(dataValue<=rangeData[3]){
		var minParam=rangeData[4];
		var maxParam = rangeData[3];
		var computeColor = d3.interpolate(colorParam.b,colorParam.c);
	}else if(dataValue<=rangeData[2]){
		var minParam=rangeData[3];
		var maxParam = rangeData[2];
		var computeColor = d3.interpolate(colorParam.c,colorParam.d);
	}else if(dataValue<=rangeData[1]){
		var minParam=rangeData[2];
		var maxParam = rangeData[1];
		var computeColor = d3.interpolate(colorParam.d,colorParam.e);
	}else if(dataValue<=rangeData[0]){
		var minParam=rangeData[1];
		var maxParam = rangeData[0];
		var computeColor = d3.interpolate(colorParam.e,colorParam.f);
	}
	var linear = d3.scale.linear()
		.domain([minParam, maxParam])
		.range([0, 1]);
	var t = linear(dataValue);
	var color = computeColor(t);
	if(dataValue<0){
		color = "#FF7A4C";
	}else if(dataValue==0){
		color = "#E0FFFF";
	}
	return color;
}
// world and china map draw
var drawMapPath = function (argsChina){
	var nodes = [],
		nodesSum = d3.entries(argsChina.dataSum),
		mapSum = d3.map(argsChina.dataSum),
		dataFill= [],
		lengthNum = [];
	nodesSum.forEach(function(s){
		dataFill.push(s.value);
	})
	dataFill.forEach(function(d){
		lengthNum.push(d.length);
	})
	var lengthArray = d3.max(lengthNum);
	var doubleData = [];
	for(var b=0;b<lengthArray;b++){
		doubleData[b]=[];
	}
	dataFill.map(function(d){
		for(var e=0;e< d.length;e++){
			doubleData[e].push(d[e].arithmetic);
		}
	});
	if(doubleData[0]){
		var rangeData = colorHandle(doubleData[0]);
	}
	d3.json(argsChina.mapPath, function(error, root) {
		var backColor,path;
		if (error)
			return console.error(error);
		if(argsChina.typeChart == "worldmap"){
			var zoomScale = getZoomScale(root.features, argsChina.panleObj.width, argsChina.panleObj.height);
			var projection = d3.geo.mercator()
				.center([6, 35])
				.scale(zoomScale*46)
				.translate([argsChina.panleObj.width/5, argsChina.panleObj.height*0.6]);
			path = d3.geo.path().projection(projection);
		}else if(argsChina.typeChart == "chinamap"){
			var zoomScale = getZoomScale(root.features, argsChina.panleObj.width, argsChina.panleObj.height);
			var projection = d3.geo.mercator()
				.center([107, 38])
				.scale(zoomScale*43)
				.translate([argsChina.panleObj.width/5, argsChina.panleObj.height/2]);
			path = d3.geo.path().projection(projection);
		}
		var tip = d3.behavior.tip()
			.attr('class', 'd3-tip')
			.offset([-10, 0]);
		argsChina.svg.call(tip);
		argsChina.svg.selectAll(".pathChina")
			.data(function(){
				if(argsChina.typeChart=="chinamap"){
					return root.features;
				}else if(argsChina.typeChart=="worldmap"){
					var features = _.filter(root.features, function(value) {
						return value.properties.name != '南极洲';
					});
					return features;
				}
			})
			.enter()
			.append("path")
			.attr("d", path)
			.attr("class", "pathChina")
			.attr("stroke","#000")
			.attr("stroke-width", 0.3)
			.attr("fill", function(d){
				var nameNode=d.properties.name;
				var dataValue=[];
				nodesSum.forEach(function(m){
					if(m.key==nameNode){
						if(typeof m.value === 'object' && !isNaN(m.value.length)){
							dataValue.push(m.value[0].arithmetic);
						}else{
							dataValue=0;
						}
					}
				})
				if(rangeData){
					return fillColor(dataValue,rangeData);
				}else if(dataValue=="undefined"||dataValue==null||dataValue==""||dataValue==0||!rangeData){
					return "#E0FFFF";
				}
			})
			.on("mousedown", d3.behavior.zoom())
			.on("mouseover",function(d){
				var overColor = "#FFB980";
				backColor = d3.select(this).attr("fill");
				d3.select(this)
					.attr("fill", overColor)
				var nameNode=d.properties.name;
				var nodemap=[];
				nodesSum.forEach(function(n){
					if(n.key==nameNode){
						nodemap.push(n.value[argsChina.clickNum].tipStr);}
				})
				if(nodemap==null||nodemap==""){nodemap=0;}
				tip.html(nameNode+":"+nodemap);
				tip.show();
			})
			.on("mouseout",function(){
				d3.select(this)
					.attr("fill",backColor);
				tip.hide();
			})
			.on("click",function(d,i){
				if(argsChina.typeChart=="chinamap"){
					var sumCountry = {};
					var id = d.properties.id;
					var name = d.properties.name;
					mapSum.forEach(function(m,i){
						if(m==name){
							sumCountry=i;
						}
					});
					d3.selectAll(".pathProvince").remove();
					d3.selectAll(".pathCouty").remove();
					var pathProvince="/xdatainsight/content/saiku-ui/js/saiku/plugins/fine_Chart/mapdata/geometryProvince/" + id + ".json";
					var argsProvince ={
						d:d,
						mapPath:pathProvince,
						svg:argsChina.svg,
						dataNodes:argsChina.dataNodes,
						dataSum:argsChina.dataSum,
						sumCountry:sumCountry,
						panleObj:argsChina.panleObj,
						typeChart:argsChina.typeChart,
						spanRedender:argsChina.spanRedender
					}
					clickMap(argsProvince);
				}
			});
		var colorParam = {
			a:d3.rgb(253,217,0),
			b:d3.rgb(187,211,1),
			c:d3.rgb(131,173,0),
			d:d3.rgb(54,191,241),
			e:d3.rgb(22,135,183),
			f:d3.rgb(0,102,124)
		}
		if(rangeData){
            colorMultiple(argsChina.svg,colorParam,argsChina.panleObj,rangeData[0],rangeData[5]);
		}else{
            colorMultiple(argsChina.svg,colorParam,argsChina.panleObj);
		}

		//get center coordinate
		root.features.forEach(function(d, i) {
			var centroid = path.centroid(d);
			centroid.x = centroid[0];
			centroid.y = centroid[1];
			centroid.id = d.properties.id;
			centroid.name = d.properties.name;
			centroid.feature = d;
			nodes.push(centroid);
		});
	});
	if(argsChina.typeChart=="chinamap"){
		argsChina.spanRedender.hide();
	}
}
// click China map
var clickMap = function(argsProvince){
	d3.selectAll(".pathChina").remove();
	d3.selectAll(".d3-tip").remove();
	drawPrivenceMap(argsProvince);
}
// Privence Map draw
var drawPrivenceMap = function(argsProvince) {
	var background,
		provinceNodes=[],
		dataFill=[];
	var sumCount=d3.entries(argsProvince.sumCountry);
	var mapSum = d3.entries(argsProvince.dataSum);
	if(sumCount==""||sumCount==null||sumCount.length<=1){
		mapSum.forEach(function(n){
			if(n.key!="undefined"|| n.key!=null){
				if(typeof n.value === 'object' && !isNaN(n.value.length)){
					dataFill.push(n.value[0].arithmetic);
				}
			}
		});
	}else{
		sumCount.forEach(function(d){
			if(typeof d.key !="number"){
				if(typeof d.value === 'object' && !isNaN(d.value.length)){
					dataFill.push(d.value[0].arithmetic);
				}
			}
		});
	}
	if(dataFill[0]){
		var rangeData = colorHandle(dataFill);
	}
	d3.json(argsProvince.mapPath, function(error, root) {
		var zoomScale = getZoomScale(root.features, argsProvince.panleObj.width, argsProvince.panleObj.height);
		var centers = getCenters(root.features);
		if (error)
			return console.error(error);
		var projection = d3.geo.mercator()
			.center(centers)
			.scale(zoomScale*36)
			.translate([argsProvince.panleObj.width/4, argsProvince.panleObj.height/2]);
		var path = d3.geo.path().projection(projection);
		var tip = d3.behavior.tip()
			.attr('class', 'd3-tip')
			.offset([-10, 0]);
		argsProvince.svg.call(tip);
		argsProvince.svg.selectAll(".pathProvince")
			.data(root.features)
			.enter()
			.append("path")
			.attr("class", "pathProvince")
			.attr("stroke","#000")
			.attr("stroke-width",0.3)
			.attr("fill", function(d){
				var nameNode=d.properties.name;
				var valueArray = [];
				if(sumCount ==""||sumCount==null||sumCount.length<=1){
					mapSum.forEach(function(n){
						if(n.key==nameNode) {
							if(typeof n.value === 'object' && !isNaN(n.value.length)){
								valueArray.push(n.value[0].arithmetic);
							}else{
								valueArray=1;
							}
						}
					})
				} else{
					sumCount.forEach(function(j){
						if(j.key==nameNode){
							if(typeof j.value === 'object' && !isNaN(j.value.length)){
								valueArray.push(j.value[0].arithmetic);
							}
						}
					})
				}
				if(rangeData){
					return fillColor(valueArray,rangeData);
				}else if(valueArray=="undefined"||valueArray==null||valueArray==""||!rangeData){
					return "#E0FFFF";
				}
			})
			.attr("d", path )
			.on("mouseover",function(d){
				background = d3.select(this).attr("fill");
				var nameNode=d.properties.name;
				var nodemap=[];
				if(sumCount ==""||sumCount==null){
					mapSum.forEach(function(i){
						if(i.key==nameNode) {
							nodemap.push(i.value[0].tipStr);
						}
					})
				}else{
					sumCount.forEach(function(m){
						if(m.key==nameNode){
							nodemap.push(m.value[0].tipStr);
						}
					})
				}
				if(nodemap==null||nodemap==""){
					nodemap=0;}
				tip.html(nameNode+":"+nodemap);
				tip.show();
			})
			.on("mouseout",function(d,i){
				d3.select(this)
					.attr("fill",background);
				tip.hide();
			})
			.on("click",function(d,i){
				tip.hide();
				var nameNode=d.properties.name;
				var cnt = [];
				if(sumCount ==""||sumCount==null){
					mapSum.forEach(function(n){
						if(n.key==nameNode) {cnt = n.value;}
					})
				} else{
					sumCount.forEach(function(j,h){
						if(j.key==nameNode){cnt = j.value;}
					})
				}
				var argsCountry={
					d:d,
					svg:argsProvince.svg,
					dataCountry:argsProvince.dataNodes,
					dataSum:argsProvince.dataSum,
					cnt:cnt,
					panleObj:argsProvince.panleObj,
					typeChart:argsProvince.typeChart,
					spanRedender:argsProvince.spanRedender
				}
				clickProvince(argsCountry);
			});
		//get center coordinate
		root.features.forEach(function(d) {
			var centroid = path.centroid(d);
			centroid.x = centroid[0];
			centroid.y = centroid[1];
			centroid.id = d.properties.id;
			centroid.name = d.properties.name
			centroid.feature = d;
			provinceNodes.push(centroid);
		})
	});
	argsProvince.spanRedender.show();
}
// click province map
var clickProvince = function(argsCountry) {
	d3.selectAll(".pathProvince").remove();
	d3.selectAll(".pathChina").remove();
	drawCoutyMap(argsCountry);
}
// Country Map draw
var drawCoutyMap = function(argsCountry) {
	var backColor;
	var id = argsCountry.d.properties.id;
	var dataFill=[],coutiesNodes=[];
	var count = d3.entries(argsCountry.cnt);
	var dataSum = d3.entries(argsCountry.dataSum);
	if(count==""||count==null){
		dataSum.forEach(function(n){
			if(typeof n.value === 'object' && !isNaN(n.value.length)){
				dataFill.push(n.value[0].arithmetic);
			}
		});
	}else{
		count.forEach(function(m){
			if(typeof m.value === 'object' && !isNaN(m.value.length)){
				dataFill.push(m.value[0].arithmetic);
			}
		})
	}
	if(dataFill[0]){
		var rangeData = colorHandle(dataFill);
	}
	var mapPath = " /xdatainsight/content/saiku-ui/js/saiku/plugins/fine_Chart/mapdata/geometryCouties/" + id + "00.json";
	var tip = d3.behavior.tip()
		.attr('class', 'd3-tip')
		.offset([-10, 0]);
	argsCountry.svg.call(tip);
	d3.json(mapPath, function(error, root) {
		if (error)
			return console.error(error);
		var zoomScale = getZoomScale(root.features, argsCountry.panleObj.width, argsCountry.panleObj.height);
		var centers = getCenters(root.features);
		var projection = d3.geo.mercator()
			.center(centers)
			.scale(zoomScale*35)
			.translate([argsCountry.panleObj.width/4, argsCountry.panleObj.height/2]);
		var path = d3.geo.path().projection(projection);
		argsCountry.svg.selectAll(".pathCouty")
			.data( root.features )
			.enter()
			.append("path")
			.attr("class", "pathCouty")
			.attr("stroke","#000")
			.attr("stroke-width",0.3)
			.attr("fill", function(d,i){
				var nameNode=d.properties.name;
				var valueArray = [];
				if(count==null||count==""){
					dataSum.forEach(function(r){
						if(r.key==nameNode) {
							valueArray.push(r.value[0].arithmetic);
						}
					})
				}else{
					count.forEach(function(n){
						if(n.key==nameNode) {
							valueArray.push(n.value[0].arithmetic);
						}
					})
				}
				if(rangeData){
					return fillColor(valueArray,rangeData);
				}else if(valueArray=="undefined"||valueArray==null||valueArray==""||!rangeData){
					return "#E0FFFF";
				}
			})
			.attr("d", path)
			.on("mouseover",function(d){
				backColor = d3.select(this).attr("fill");
				var nameNode=d.properties.name;
				var nodemap=[];
				if(count==""||count==null){
					dataSum.forEach(function(r){
						if(r.key==nameNode) {
							nodemap.push(r.value[0].tipStr);
						}
					})
				}else{
					count.forEach(function(n){
						if(n.key==nameNode){
							nodemap.push(n.value[0].tipStr);
						}
					})
				}
				if(nodemap==null||nodemap==""){
					nodemap=0;
				}
				tip.html(nameNode+":"+nodemap);
				tip.show();
			})
			.on("mouseout",function(d,i){
				tip.hide();
				d3.select(this)
					.attr("fill",backColor);
			}).on("click",function(d,i){
				tip.hide();
				var countryObj = {
					svg:argsCountry.svg,
					data:argsCountry.dataCountry,
					dataSum:argsCountry.dataSum,
					panleObj:argsCountry.panleObj,
					spanRedender:argsCountry.spanRedender
				}
				clickCouty(countryObj);
			});
		//get center coordinate
		root.features.forEach(function(d, i) {
			var centroid = path.centroid(d);
			centroid.x = centroid[0];
			centroid.y = centroid[1];
			centroid.id = d.properties.id;
			centroid.name = d.properties.name
			centroid.feature = d;
			coutiesNodes.push(centroid);
		});
	});
}
// click country map
var clickCouty = function(countryData){
	d3.selectAll(".pathProvince").remove();
	d3.selectAll(".pathCouty").remove();
	countryData.spanRedender.hide();
	var chinaJsonPath = " /xdatainsight/content/saiku-ui/js/saiku/plugins/fine_Chart/mapdata/china.json";
	var argsChina = {
		mapPath:chinaJsonPath,
		svg:countryData.svg,
		dataNodes:countryData.data,
		dataSum:countryData.dataSum,
		clickNum:0,
		panleObj:countryData.panleObj,
		typeChart:"chinamap",
		spanRedender:countryData.spanRedender
	}
	drawMapPath(argsChina);
}

var getCenters = function(features){
	var longitudeMin = 100000;//最小经度
	var latitudeMin = 100000;//最小维度
	var longitudeMax = 0;//最大经度
	var latitudeMax = 0;//最大纬度
	features.forEach(function(e){
		var a = d3.geo.bounds(e);//[[最小经度，最小维度][最大经度，最大纬度]]
		if(a[0][0] < longitudeMin) {
			longitudeMin = a[0][0];
		}
		if(a[0][1] < latitudeMin) {
			latitudeMin = a[0][1];
		}
		if(a[1][0] > longitudeMax) {
			longitudeMax = a[1][0];
		}
		if(a[1][1] > latitudeMax) {
			latitudeMax = a[1][1];
		}
	});
	var a = (longitudeMax + longitudeMin)/2;
	var b = (latitudeMax + latitudeMin)/2;
	return [a, b];
}

var getZoomScale = function(features, width, height){
	var longitudeMin = 100000;//最小经度
	var latitudeMin = 100000;//最小维度
	var longitudeMax = 0;//最大经度
	var latitudeMax = 0;//最大纬度
	features.forEach(function(e){
		var a = d3.geo.bounds(e);//[[最小经度，最小维度][最大经度，最大纬度]]
		if(a[0][0] < longitudeMin) {//左
			longitudeMin = a[0][0];
		}
		if(a[0][1] < latitudeMin) {/*上*/
			latitudeMin = a[0][1];
		}
		if(a[1][0] > longitudeMax) {/*右*/
			longitudeMax = a[1][0];
		}
		if(a[1][1] > latitudeMax) {/*下*/
			latitudeMax = a[1][1];
		}
	});
	var a = longitudeMax-longitudeMin;/*数值宽度*/
	var b = latitudeMax-latitudeMin;/*数值高度*/
	if(width/height>=a/b){
		return height/b;
	} else{
		return width/a;
	}
}
// draw multiple china map
var drawMultipleMap = function(argsMultiple) {
	var vauleCnt = argsMultiple.vauleCnt,
		lengthNum = vauleCnt.length,
		clickNum = [0],
		randNum = new Date().getTime(),
		padding = 60,
		axisw,
		r = 4,
		circleNum = 0;
	var svgTimeAxis = argsMultiple.svg.append("g")
		.attr("class", "axis")
		.attr("transform", "translate(" + (-argsMultiple.panleObj.width / 6) + ",0)");
	if (lengthNum <= 1) {
		axisw = 0;
	} else {
		axisw = argsMultiple.panleObj.width - 5 * padding;
	}
	var axish = argsMultiple.panleObj.height;
	svgTimeAxis.append("line")
		.attr({
			"x1": 0,
			"y1": axish,
			"x2": axisw,
			"y2": axish,
			"stroke": "#63B8FF",
			"stroke-dasharray":"5,5"
		})
	var xScale = d3.scale.linear()
		.domain([0, vauleCnt.length - 1])
		.range([0, axisw]);
	var circles = svgTimeAxis.selectAll("circle"+randNum)
		.data(vauleCnt).enter()
		.append("circle")
		.attr("class", "circle"+randNum)
		.attr("id", function (d) {return d;})
		.style("stroke", function () {return "#63B8FF";})
		.style("fill", function () {return "#ffffff";});
	var tip = d3.behavior.tip()
		.attr('class', 'd3-tip')
		.offset([-10, 0]);
	argsMultiple.svg.call(tip);
	circles.attr("cx", function (d, i) {return xScale(i);})
		.on("click", function (w) {
			var a = [];
			for (var z = 0; z < circles[0].length; z++) {
				if (circles[0][z].id == w) {a.push(z);}
			}
			circleNum = a[0];
		})
		.style("cursor","pointer")
		.attr("cy", axish)
		.attr("r", r)
		.append("title")
		.text(function(d){return d});
	var texts = svgTimeAxis.selectAll("text")
		.data(vauleCnt).enter()
		.append("text")
		.text(function(d){return d;})
		.attr({
			"transform":function(d,i){
				return "translate("+(xScale(i)+3)+","+(axish+10)+"), rotate(-90)"
			}
		})
		.style({
			"font-size": "12px",
			"font-family": "sans-serif",
			"fill": "rgb(102, 102, 102)",
	        "text-anchor": "end"
		});
	if(vauleCnt.length<=1){
		d3.selectAll(".circle"+randNum)
			.style("opacity","0");
		texts.style("opacity","0");
	}
	setInterval(function () {
		var args = {
			circleObj:circles[0][circleNum],
			clickNum:clickNum,
			circle_id:circles[0][circleNum].id,
			vauleCnt:vauleCnt,
			mapPath:argsMultiple.mapPath,
			svg:argsMultiple.svg,
			panleObj:argsMultiple.panleObj,
			dataSum:argsMultiple.dataSum,
			tip:tip,
			randNum:randNum,
			typeChart:argsMultiple.typeChart
		};
		clickAxis(args);
		circleNum++;
		if (circleNum >= circles[0].length) {
			circleNum = 0;
		}
	}, 3000);
	var multipleChina = {
		mapPath:argsMultiple.mapPath,
		svg:argsMultiple.svg,
		panleObj:argsMultiple.panleObj,
		dataSum:argsMultiple.dataSum,
		clickNum:clickNum,
		tip:tip,
		randNum:randNum,
		typeChart:argsMultiple.typeChart
	}
	drawMultipleChina(multipleChina);
}
// draw  multiple china map initial status
var drawMultipleChina = function (multipleChina){
	var nodes=[];
	var nodesSum=d3.entries(multipleChina.dataSum);
	var dataFill=[];
	var lengthNum = [];
	nodesSum.forEach(function(s){
		dataFill.push(s.value);
	})
	dataFill.forEach(function(d){
		lengthNum.push(d.length);
	})
	var lengthArray = d3.max(lengthNum);
	var doubleData = [],maxvalue = [], minvalue = [];
	for(var b=0;b<lengthArray;b++){
		doubleData[b]=[];
	}
	dataFill.forEach(function(d){
		for(var e=0;e< d.length;e++){
			doubleData[e].push(d[e].arithmetic);
		}
	})
	doubleData.forEach(function(d){
		maxvalue.push(d3.max(d));
		minvalue.push(d3.min(d));
	})
	for(var t = 0;t<maxvalue.length;t++){
		if(maxvalue[t]==minvalue[t]){
			minvalue[t]=[0];
		}
	}
	d3.json(multipleChina.mapPath, function(error, root) {
		var backColor,
			path;
		if (error)
			return console.error(error);
		if(multipleChina.typeChart=="multipleworld"){
			var zoomScale = getZoomScale(root.features, multipleChina.panleObj.width, multipleChina.panleObj.height);
			var projection = d3.geo.mercator()
				.center([10, 48])
				.scale(zoomScale*44)
				.translate([multipleChina.panleObj.width/5, multipleChina.panleObj.height/2]);
			path = d3.geo.path().projection(projection);
		}else if(multipleChina.typeChart=="multiplemap"){
			var zoomScale = getZoomScale(root.features, multipleChina.panleObj.width, multipleChina.panleObj.height);
			var projection = d3.geo.mercator()
				.center([107, 38])
				.scale(zoomScale*43)
				.translate([multipleChina.panleObj.width/5, multipleChina.panleObj.height/2]);
			path = d3.geo.path().projection(projection);
		}
		multipleChina.svg.selectAll(".chinaPath"+multipleChina.randNum)
			.data(function(){
				if(multipleChina.typeChart=="multiplemap"){
					return root.features;
				}else if(multipleChina.typeChart=="multipleworld"){
					var features = _.filter(root.features, function(value) {
						return value.properties.name != '南极洲';
					});
					return features;
				}
			})
			.enter()
			.append("path")
			.attr("class", "chinaPath"+multipleChina.randNum)
			.attr("stroke","#000")
			.attr("stroke-width", 0.3)
			.attr("fill", function(d){return colorInfo(d,nodesSum,maxvalue,minvalue,multipleChina.clickNum)})
			.attr("d", path )
			.on("mousedown", d3.behavior.zoom())
			.on("mouseover", function (d) {
				backColor = d3.select(this).attr("fill");
				var overColor = "#FFB980";
				d3.select(this)
					.attr("fill", overColor)
				multipleChina.tip.html(titleInfo(d,nodesSum,multipleChina.clickNum));
				multipleChina.tip.show();
			})
			.on("mouseout",function(){
				d3.select(this)
					.attr("fill",function(d){return colorInfo(d,nodesSum,maxvalue,minvalue,multipleChina.clickNum)});
				multipleChina.tip.hide();
			});
		//get center coordinate
		root.features.forEach(function(d, i) {
			var centroid = path.centroid(d);
			centroid.x = centroid[0];
			centroid.y = centroid[1];
			centroid.id = d.properties.id;
			centroid.name = d.properties.name;
			centroid.feature = d;
			nodes.push(centroid);
		});
	});
}
// multiple china map axis dynamic state show
var clickAxis = function (args){
	var lengthNum = args.vauleCnt.length,
		r = 4;
	d3.selectAll(".circle"+args.randNum)
		.attr("r", r)
		.style("stroke", function() {return "#63B8FF";})
		.style("fill", function() {return "#ffffff";})
		.style("stroke-width", 1);
	if(args.circleObj != "undefined") {
		var circle = d3.select(args.circleObj);
		circle.transition()
			.duration(300)
			.attr("r", function(){return r+2})
			.style("stroke-width", 5);
	}
	args.clickNum=[];
	for(var a=0;a<lengthNum;a++){
		if(args.circle_id==args.vauleCnt[a]){
			args.clickNum.push(a);}
	}
	var svgChina=d3.selectAll(".chinaPath"+args.randNum)
	var nodesSum=d3.entries(args.dataSum);
	var dataFill=[],lengthNum = [];
	nodesSum.forEach(function(s){
		if(typeof s.value === 'object' && !isNaN(s.value.length)) {
			dataFill.push(s.value);
		}
	})
	dataFill.forEach(function(d){
		lengthNum.push(d.length);
	})
	var lengthArray = d3.max(lengthNum);
	var doubleData = [],maxvalue = [],minvalue = [];
	for(var b=0;b<lengthArray;b++){
		doubleData[b]=[];
	}
	dataFill.forEach(function(d){
		for(var e=0;e< d.length;e++){
			doubleData[e].push(d[e].arithmetic);
		}
	})
	doubleData.forEach(function(d){
		maxvalue.push(d3.max(d));
		minvalue.push(d3.min(d));
	})
	for(var b = 0;b<maxvalue.length;b++){
		if(maxvalue[b]==minvalue[b]){
			minvalue[b]=[0];
		}
	}
	var backColor;
	svgChina.transition()
		.duration(300)
		.attr("fill",function(d){
			return colorInfo(d,nodesSum,maxvalue,minvalue,args.clickNum);
		})
	svgChina.on("mouseover",function(d){
		var overColor = "#FFB980";
		backColor = d3.select(this).attr("fill");
		d3.select(this)
			.attr("fill",overColor)
		args.tip.html(titleInfo(d,nodesSum,args.clickNum))
		args.tip.show();
	})
		.on("mouseout",function(){
			d3.select(this)
				.attr("fill",function(d){
					return colorInfo(d,nodesSum,maxvalue,minvalue,args.clickNum)});
			args.tip.hide();
		})
}
// tips information
var titleInfo = function(d,nodesSum,clickNum){
	var nameNode=d.properties.name;
	var nodemap=[];
	nodesSum.forEach(function(n){
		if(n.key==nameNode){
			if(typeof n.value === 'object' && !isNaN(n.value.length)){
				nodemap.push(n.value[clickNum].tipStr);
			}
		}
	})
	if(nodemap==null||nodemap==""){
		nodemap=0;
	}
	return nameNode+" : "+nodemap;
}
// map color fill
var colorInfo = function(d,nodesSum,maxvalue,minvalue,clickNum){
	var nameNode=d.properties.name;
	var dataValue=[];
	nodesSum.forEach(function(m){
		if(m.key==nameNode){
			if(typeof m.value === 'object' && !isNaN(m.value.length)){
				dataValue.push(m.value[clickNum].arithmetic);
			}
		}
	})
	var linear = d3.scale.linear()
		.domain([minvalue[clickNum], maxvalue[clickNum]])
		.range([0, 1]);
	var a = d3.rgb(223,254,255);//low
	var b = d3.rgb(50,143,229);//high
	var computeColor = d3.interpolate(a,b);
	var t = linear(dataValue);
	var color = computeColor(t);
	if(dataValue<0){
		color = "#FF4500";
	}
	if(dataValue=="undefined"||dataValue==null||dataValue==""||dataValue==0){
		color = "#E0FFFF";
	}
	return color.toString();
}
// array sort function
var compare = function (value1, value2) {
	if (value1 < value2) {
		return 1;
	} else if (value1 > value2) {
		return -1;
	} else {
		return 0;
	}
}
// scatter map draw
var drawScatterChina = function(argsScatter) {
	var top5Info = [],
		top5Array = [],
		dataNodes = argsScatter.data,
		contentHeader  = argsScatter.contentHeader,
		lengthCol  = argsScatter.lengthNum, //type is DETA_CELL number
		countryPath = "/xdatainsight/content/saiku-ui/js/saiku/plugins/fine_Chart/mapdata/citycoordinates.json";
	var tip = d3.behavior.tip()
		.attr('class', 'd3-tip')
		.offset([-10, 0]);
	argsScatter.svg.call(tip);
	d3.json(argsScatter.mapPath, function (error, root) {
		if (error)
			return console.error(error);
		var zoomScale = getZoomScale(root.features, argsScatter.options.width, argsScatter.options.height);
		var projection = d3.geo.mercator()
			.center([107, 38])
			.scale(zoomScale * 43)
			.translate([argsScatter.options.width / 5, argsScatter.options.height / 2]);
		var path = d3.geo.path().projection(projection);
		argsScatter.svg.selectAll(".chinaPathScatter")
			.data(root.features).enter()
			.append("path")
			.attr("class", "chinaPathScatter")
			.attr("stroke", "#000")
			.attr("stroke-width", 0.3)
			.attr("stroke-dasharray", "5,5")
			.attr("fill", function () {
				var overColor = "#F1F1F1";
				return overColor;
			})
			.attr("d", path)
		var maxArray = [],
			minArray = [],
			titleLoc = 0,
			vauleData = [],
			maxColor1 = d3.rgb(84,164,182),//value is gt 0
			minColor1 = d3.rgb(164,182,113),
			maxColor = d3.rgb(164,182,113),
			minColor = d3.rgb(220,102,85);
		for(var p=0;p<lengthCol;p++){
			vauleData[p]=[];
		}
		titleLoc = dataNodes[0].length - lengthCol;
		dataNodes.forEach(function(j){
			var y = 0;
			for(var c=titleLoc;c<j.length;c++){
				vauleData[y].push(j[c].v);
				y++;
			}
		})
		vauleData.forEach(function(g){
			maxArray.push(d3.max(g));
			minArray.push(d3.min(g));
		})
		var sortArray=vauleData[0].sort(compare);
		for(var o = 0;o<5;o++){
			top5Array.push(sortArray[o]);
		}
		dataNodes.forEach(function(d){
			for(var s=0;s< d.length;s++){
				if(d[s]==null){
					d[s]=d[s-1];
				}
			}
		})
		d3.json(countryPath, function (error, root) {
			if (error)
				return console.error(error);
			if(lengthCol<=1){
				var minValue=minArray[0],
					maxValue=maxArray[0];
			}else if(lengthCol>1){
				var minValue=minArray[0],
					maxValue=maxArray[0],
					paraRange = d3.scale.linear()
						.domain([minArray[1],maxArray[1]])
						.range([0,1]);
			}
			//value is gt 0
			var paraNumber = d3.scale.linear()
				.domain([minValue,maxValue])
				.range([0,1]);
			root.coordinates.forEach(function (d) {
				var proLocation = projection(d.cp);
				dataNodes.forEach(function (g) {
					var titleLoc = g.length - lengthCol;
					if (d.name == g[titleLoc-1]) {
						if(lengthCol<=1){
							if(g[titleLoc].v>0){
								//size change
								var computeVaule = d3.interpolate(2,10);
								var t = paraNumber(g[titleLoc].v);
								var dataVaule = computeVaule(t);
								//color change
								var computeColor1 = d3.interpolate(minColor1,maxColor1);
								var w = paraNumber(g[titleLoc].v);
								var vauleColor = computeColor1(w);
							}else{
								var dataVaule = 4;
								var computeColor1 = d3.interpolate(minColor,maxColor);
								var w = paraNumber(g[titleLoc].v);
								var vauleColor = computeColor1(w);
							}
						}else if(lengthCol>=2){
							//size change
							if(g[titleLoc].v>0){
								var computeVaule = d3.interpolate(2,10);
								var t = paraNumber(g[titleLoc].v);
								var dataVaule = computeVaule(t);
							}else{
								var dataVaule = 4;
							}
							//color change
							if(g[titleLoc+1].v>0){
								var computeColor1 = d3.interpolate(minColor1,maxColor1);
								var w = paraRange(g[titleLoc+1].v);
								var vauleColor = computeColor1(w);
							}else{
								var computeColor1 = d3.interpolate(minColor,maxColor);
								var w = paraRange(g[titleLoc+1].v);
								var vauleColor = computeColor1(w);
							}
						}
						top5Array.forEach(function(t){
							if(g[titleLoc].v==t){
								var top5Obj = {
									dataInfo:g,
									titleLoc:titleLoc,
									location:[proLocation[0],proLocation[1]],
									dataVaule:dataVaule
								}
								top5Info.push(top5Obj);
							}
						})
						argsScatter.svg.append("circle")
							.attr({
								"class": "scatterCity",
								"cx": proLocation[0],
								"cy": proLocation[1],
								"r": 0,
								"position":"relative",
								"z-index":"100",
								"fill": vauleColor})
							.on("mouseover",function(){
								d3.select(this)
									.attr("stroke","#000")
								var tipsName = g[titleLoc-1],
									tipsArray = [],
									tipsData = [];
								for(var k =titleLoc;k< g.length;k++){
									tipsData.push(g[k].f);
								}
								tip.html(function(){
									for(var t = 0;t<contentHeader.length;t++){
										var saveHeader = [],
											headerStr = [];
										saveHeader.push(contentHeader[t]);
										saveHeader.push(tipsData[t]);
										headerStr = saveHeader.join(" : ");
										tipsArray.push(headerStr);
									}
									return tipsName+" :</br>"+tipsArray.join("</br>");
								});
								tip.show();
							})
							.on("mouseout",function(){
								d3.select(this)
									.attr("stroke",vauleColor)
								tip.hide();
							})
							.transition()
							.duration(1000)
							.attr("r", dataVaule);
					}
				})
			})
		})
		setInterval(function(){
			argsScatter.svg.selectAll("g").remove();
			var svgCircle = argsScatter.svg.selectAll(".threeCircle")
				.data(top5Info)
				.enter().append("g")
				.attr("transform", function(d){
					return "translate("+d.location[0]+","+d.location[1]+")"
				});
			svgCircle.selectAll(".circleLine")
				.data([1,2,3])
				.enter().append("circle")
				.attr({
					"class": "circleLine",
					"r": function(){
						var d = this.parentElement.__data__
						return d.dataVaule
					}
				})
				.style({
					"fill":"rgba(255,255,255,0)",
					"stroke":"#50A3BA",
					"stroke-width":2.5,
					"position":"relative",
					"opacity":0.7
				})
				.on("mouseover",function(){
					var d = this.parentElement.__data__;
					var tipsName = d.dataInfo[titleLoc-1],
						tipsArray = [],
						tipsData = [];
					for(var k =titleLoc;k< d.dataInfo.length;k++){
						tipsData.push(d.dataInfo[k].f);
					}
					tip.html(function(){
						for(var t = 0;t<contentHeader.length;t++){
							var saveHeader = [],
								headerStr = [];
							saveHeader.push(contentHeader[t]);
							saveHeader.push(tipsData[t]);
							headerStr = saveHeader.join(" : ");
							tipsArray.push(headerStr);
						}
						return tipsName+" :</br>"+tipsArray.join("</br>");
					});
					tip.show();
				})
				.on("mouseout",function(){
					tip.hide();
				})
				.transition()
				.duration(function(d){
					return d*2000;
				})
				.delay(0)
				.attr({
					"r":function(){return this.parentElement.__data__.dataVaule+20}
				})
				.style("stroke-width",0)
				.remove();

		},3000)
		colorRange(argsScatter.svg,minColor,maxColor1,argsScatter.options,maxArray[1],minArray[1],contentHeader);
		var argsSize = {
			svg:argsScatter.svg,
			contentHeader:contentHeader,
			options:argsScatter.options
		}
		sizeRange(argsSize)
	})
}

var sizeRange = function(argsSize){
	var circleData = [7,6,5,4,3]
	argsSize.svg.selectAll(".nodeCircle")
		.data(circleData)
		.enter().append("circle")
		.attr({
			"class":"nodeCircle",
			"cx":argsSize.options.width * 0.65,
			"cy":function(d){return argsSize.options.height*0.7 - d*20;},
			"r":function(d){return d;},
			"fill":"white",
			"stroke":"#1C5896"
		})
	if(argsSize.contentHeader){
		var ValueText = argsSize.svg.append("text")
			.attr("class","sizeText")
			.attr({
				"x": argsSize.options.width*0.65-5,
		        "y": argsSize.options.height*0.7 - circleData[0]*20-20,
				"text-anchor":"middle"
			})
			.text(function(){
				return argsSize.contentHeader[0];
			});
	}
	var maxValueText = argsSize.svg.append("text")
		.attr("class","sizeText")
		.attr({
			"x": argsSize.options.width*0.65-50,
			"y": argsSize.options.height*0.7 - circleData[0]*20
		})
		.text("Large")
	var minValueText = argsSize.svg.append("text")
		.attr("class","sizeText")
		.attr("x", argsSize.options.width*0.65-50)
		.attr("y", argsSize.options.height*0.7 - circleData[4]*20 +5)
		.text("Small")
}
// color range
var colorRange = function(svg,a,b,options,maxvalue,minvalue,contentHeader){
	var defs = svg.append("defs");
	var linearGradient = defs.append("linearGradient")
		.attr("id","linearColor")
		.attr("x1","0%")
		.attr("y1","0%")
		.attr("x2","0%")
		.attr("y2","100%");

	var stop1 = linearGradient.append("stop")
		.attr("offset","0%")
		.style("stop-color",b.toString());

	var stop2 = linearGradient.append("stop")
		.attr("offset","100%")
		.style("stop-color",a.toString());
	var colorLength = 100;
	var colorWidth = 20;
	var colorRect = svg.append("rect")
		.attr("x", options.width * 0.65 - 7)
		.attr("y", options.height * 0.6)
		.attr("width", colorWidth)
		.attr("height", colorLength)
		.style("fill","url(#" + linearGradient.attr("id") + ")");

	//add words
	if(contentHeader){
		var ValueText = svg.append("text")
			.attr({
				"class":"valueText",
				"x": options.width * 0.65 + 5,
				"y": options.height * 0.6 - 10,
				"text-anchor":"middle"
			})
			.text(function(){
				if(contentHeader[1]){
					var contentTitle = contentHeader[1];
				}else{
					var contentTitle = contentHeader[0];
				}
				return contentTitle;
			});
	}
	var minValueText = svg.append("text")
		.attr("class","valueText")
		.attr("x", options.width * 0.65 - 40)
		.attr("y", options.height * 0.6 + 10)
		.text("High")

	var maxValueText = svg.append("text")
		.attr("class","valueText")
		.attr("x", options.width*0.65-40)
		.attr("y", options.height*0.6+colorLength)
		.text("Low")
}
// tips of force,treeslink and sunburst data
var dataTips = function(dataMy,headerCnt){
	var dataNodes = [];
	dataMy.forEach(function(d){
		for(var s=0;s< d.length;s++){
			if(d[s]==null){
				d[s]=d[s-1];
			}
		}
	})
	dataMy.forEach(function(d){
		var titleLoc = d.length - headerCnt.length,
			dataFloat = [];
		for(var a = titleLoc;a<d.length;a++){
			dataFloat.push(d[a].f);
		}
		var dataObj = {
			nodeName: d[titleLoc-1],
			nodeValue: d[titleLoc].v,
			valueFloat:dataFloat
		}
		dataNodes.push(dataObj);
	})
	return dataNodes;
}
// tips of force,treeslink and sunburst information
var textContent = function(d,dataNodes,headerCnt){
	var tipsArray = null;
	for(var c=0;c<dataNodes.length;c++){
		if(d.nodeName == dataNodes[c].nodeName){
			tipsArray = [];
			for(var w = 0;w< dataNodes[c].valueFloat.length;w++){
				var transferHeader = [],
					headerStr = [];
				transferHeader.push(headerCnt[w]);
				transferHeader.push(dataNodes[c].valueFloat[w]);
				headerStr = transferHeader.join(" : ");
				tipsArray.push(headerStr);
			}
		}
	}
	if(tipsArray == null){
		return (d.nodeName);
	}else{
		return (d.nodeName+":</br>"+tipsArray.join("</br>"));
	}

}
// multiple color range
var colorMultiple = function(svg,colorParam,options,maxvalue,minvalue,contentHeader){
	var defs = svg.append("defs");
	var linearGradient = defs.append("linearGradient")
		.attr("id","linearColorMultiple")
		.attr("x1","0%")
		.attr("y1","0%")
		.attr("x2","0%")
		.attr("y2","100%");

	var stop1 = linearGradient.append("stop")
		.attr("offset","0%")
		.style("stop-color",colorParam.f.toString());
	var stop2 = linearGradient.append("stop")
		.attr("offset","20%")
		.style("stop-color",colorParam.e.toString());
	var stop3 = linearGradient.append("stop")
		.attr("offset","40%")
		.style("stop-color",colorParam.d.toString());
	var stop4 = linearGradient.append("stop")
		.attr("offset","60%")
		.style("stop-color",colorParam.c.toString());
	var stop5 = linearGradient.append("stop")
		.attr("offset","80%")
		.style("stop-color",colorParam.b.toString());
	var stop5 = linearGradient.append("stop")
		.attr("offset","100%")
		.style("stop-color",colorParam.a.toString());

	var colorLength = 180;
	var colorWidth = 20;
	var colorRect = svg.append("rect")
		.attr("x", options.width*0.65-7)
		.attr("y", options.height*0.3)
		.attr("width", colorWidth)
		.attr("height", colorLength)
		.style("fill","url(#" + linearGradient.attr("id") + ")");

	//add words
	if(contentHeader){
		var ValueText = svg.append("text")
			.attr({
				"class":"valueText",
				"x": options.width*0.65+5,
				"y": options.height*0.3-10,
				"text-anchor":"middle"
			})
			.text(function(){
				if(contentHeader[1]){
					var contentTitle = contentHeader[1];
				}else{
					var contentTitle = contentHeader[0];
				}
				return contentTitle;
			});
	}
	var minValueText = svg.append("text")
		.attr("class","valueText")
		.attr("x", options.width*0.65-40)
		.attr("y", options.height*0.3+10)
		.text("High")

	var maxValueText = svg.append("text")
		.attr("class","valueText")
		.attr("x", options.width*0.65-40)
		.attr("y", options.height*0.3+colorLength)
		.text("Low")
}
