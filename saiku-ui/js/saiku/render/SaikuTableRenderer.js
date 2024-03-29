
function SaikuTableRenderer(data, options) {
    this._data = data;
    this._options = _.extend({}, SaikuRendererOptions, options);
}

SaikuTableRenderer.prototype.render = function(data, options) {
        var self = this;
        if (data) {
            this._data = data;
        }
        if (options) {
            this._options = _.extend({}, SaikuRendererOptions, options);
        }

        if (typeof this._data == "undefined") {
            return;
        }

        if (this._data != null && this._data.error != null) {
            return;
        }
        if (this._data == null || (this._data.cellset && this._data.cellset.length === 0)) {
            return;
        }
        if (this._options.htmlObject) {
            // in case we have some left over scrollers
            if (self._options.hasOwnProperty('batch')) {
                $(self._options.htmlObject).parent().parent().unbind('scroll');
            }
            _.defer(function(that) {
                if (self._options.hasOwnProperty('batch') && !self._options.hasOwnProperty('batchSize')) {
                    self._options['batchSize'] = 1000;
                }
                var html =  self.internalRender(self._data, self._options);
                $(self._options.htmlObject).html(html);


//                $(self._options.htmlObject).stickyTableHeaders( { container: self._options.htmlObject.parent().parent(), fixedOffset: self._options.htmlObject.parent().parent().offset().top });

                _.defer(function(that) {
                    if (self._options.hasOwnProperty('batch') && self._options.hasBatchResult) {
                        var batchRow = 0;
                        var batchIsRunning = false;
                        var batchIntervalSize = self._options.hasOwnProperty('batchIntervalSize') ? self._options.batchIntervalSize : 20;
                        var batchIntervalTime = self._options.hasOwnProperty('batchIntervalTime') ? self._options.batchIntervalTime : 20;
                        var len = self._options.batchResult.length;

                        var batchInsert = function() {
                            // maybe add check for reach table bottom - ($('.workspace_results').scrollTop() , $('.workspace_results table').height()
                            if (!batchIsRunning && len > 0 && batchRow < len) {
                                batchIsRunning = true;
                                var batchContent = "";
                                var startb = batchRow;
                                for (var i = 0;  batchRow < len && i < batchIntervalSize ; i++, batchRow++) {
                                    batchContent += self._options.batchResult[batchRow];
                                }
                                if (batchRow > startb) {
                                    $(self._options.htmlObject).append( $(batchContent));
                                }
                                batchIsRunning = false;
                            }
                            if (batchRow >= len) {
                                $(self._options.htmlObject).parent().parent().unbind('scroll');
                            }
                        };
                        var lazyBatchInsert = _.debounce(batchInsert, batchIntervalTime);
                        $(self._options.htmlObject).parent().parent().scroll(function () {
                            lazyBatchInsert();
                        });
                    }
                });
                return html;
            });
        } else {
            var html =  this.internalRender(this._data, self._options);
            return html;
        }
};

SaikuTableRenderer.prototype.clear = function(data, options) {
    var self = this;
    if (this._options && this._options.htmlObject && this._options.hasOwnProperty('batch')) {
        $(self._options.htmlObject).parent().parent().unbind('scroll');
    }
};

SaikuTableRenderer.prototype.processData = function(data, options) {
    this._hasProcessed = true;
};

function genTotalDataCells(currentIndex, cellIndex, scanSums, scanIndexes, lists) {
    var contents = '';
    var lists = lists[ROWS];
    for (var i = scanSums.length - 1; i >= 0; i--) {
        if (currentIndex == scanSums[i]) {
            var currentListNode = lists[i][scanIndexes[i]];
            for (var m = 0; m < currentListNode.cells.length; m++)
                contents += '<td class="data total">' + currentListNode.cells[m][cellIndex].value + '</td>';
            scanIndexes[i]++;
            if (scanIndexes[i] < lists[i].length)
                scanSums[i] += lists[i][scanIndexes[i]].width;
        }
    }
    return contents;
}

function genTotalHeaderCells(currentIndex, bottom, scanSums, scanIndexes, lists, wrapContent,aggreType) {
    var contents = '';
    for (var i = bottom; i >= 0; i--) {
        if (currentIndex == scanSums[i]) {
            var currentListNode = lists[i][scanIndexes[i]];
            var cssClass;
            if (i == 0 && bottom == 1)
                cssClass = "col";
            else if (i == bottom)
                cssClass = "col_total_corner";
            else if (i == bottom - 1 && currentListNode.captions)
                cssClass = "col_total_first";
            else cssClass = "col_null";

            for (var m = 0; m < currentListNode.cells.length; m++) {
                var text = '&nbsp;';
                if (bottom == lists.length - 1) {
                    if (currentListNode.captions) {
                        text = lists[i][scanIndexes[i]].captions[m];
                    }
                    if (i == 0 && scanIndexes[i] == 0) {
                        if (currentListNode.captions)
                            text += "&nbsp;";
                        else text = "";
                        // 列上面
                        text += (wrapContent ? "<span class='i18n'>"+aggreType+"</span>" :  "Grand Total");
                    }
                }
                contents += '<th class="' + cssClass + '">'
                  + (wrapContent ? '<div>' + text + '</div>' : text ) + '</th>';
            }
            scanIndexes[i]++;
            if (scanIndexes[i] < lists[i].length)
                scanSums[i] += lists[i][scanIndexes[i]].width;
        }
    }
    return contents;
}

function totalIntersectionCells(currentIndex, bottom, scanSums, scanIndexes, lists) {
    var contents = '';
    for (var i = bottom; i >= 0; i--) {
        if (currentIndex == scanSums[i]) {
            var currentListNode = lists[i][scanIndexes[i]];
            var cssClass = "data total";
            for (var m = 0; m < currentListNode.cells.length; m++) {
                var text = '&nbsp;';
                contents += '<td class="' + cssClass + '">' + text + '</td>';
            }
            scanIndexes[i]++;
            if (scanIndexes[i] < lists[i].length)
                scanSums[i] += lists[i][scanIndexes[i]].width;
        }
    }
    return contents;
}

function genTotalHeaderRowCells(currentIndex, scanSums, scanIndexes, totalsLists, wrapContent,chineseType) {
    var colLists = totalsLists[COLUMNS];
    var colScanSums = scanSums[COLUMNS];
    var colScanIndexes = scanIndexes[COLUMNS];
    var bottom = colLists.length - 2;
    var contents = '';
    for (var i = bottom; i >= 0; i--) {
        if (currentIndex == colScanSums[i]) {
            for (var m = 0; m < colLists[i][colScanIndexes[i]].cells.length; m++) {
                contents += '<tr>';
                for (var j = 0; j <= bottom; j++) {
                    var cssClass;
                    var text = '&nbsp;';
                    if (i == 0 && j == 0)
                        cssClass = 'row';
                    else if (i == j + 1)
                        cssClass = 'row_total_corner';
                    else if (i == j && colLists[i][colScanIndexes[i]].captions) {
                        cssClass = 'row_total_first';
                    } else if (i < j + 1)
                        cssClass = 'row_total';
                    else
                        cssClass = 'row_null';
                    if (j == bottom ) {
                        if (colLists[i][colScanIndexes[i]].captions) {
                            text = colLists[i][colScanIndexes[i]].captions[m];
                        }
                        if (i == 0 && colScanIndexes[i] == 0) {
                            if (colLists[i][colScanIndexes[i]].captions)
                                text += "&nbsp;";
                            else text = "";
                            text += (wrapContent ? "<span class='i18n'>"+chineseType+"</span>" :  "Grand Total");
                        }
                    }
                    contents += '<th class="' + cssClass + '">'
                                + (wrapContent ? '<div>' + text + '</div>' : text ) + '</th>';

                }

                var scanIndexes = {};
                var scanSums = {};
                for (var z = 0; z < totalsLists[ROWS].length; z++) {
                    scanIndexes[z] = 0;
                    scanSums[z] = totalsLists[ROWS][z][scanIndexes[z]].width;
                }
                for (var k = 0; k < colLists[i][colScanIndexes[i]].cells[m].length; k++) {
                    contents += '<td class="data total">' + colLists[i][colScanIndexes[i]].cells[m][k].value + '</td>';
                    contents += totalIntersectionCells(k + 1, totalsLists[ROWS].length - 1, scanSums, scanIndexes, totalsLists[ROWS]);
                }
                contents += '</tr>';
            }
            colScanIndexes[i]++;
            if (colScanIndexes[i] < colLists[i].length)
                colScanSums[i] += colLists[i][colScanIndexes[i]].width;
        }
    }
    return contents;
}

var ROWS = "ROWS";
var COLUMNS = "COLUMNS";

function nextParentsDiffer(data, row, col) {
    while (row-- > 0) {
        if (data[row][col].properties.uniquename != data[row][col + 1].properties.uniquename)
            return true;
    }
    return false;
}

function topParentsDiffer(data, row, col) {
    while (col-- > 0)
        if (data[row][col].properties.uniquename != data[row - 1][col].properties.uniquename)
            return true;
    return false;
}

SaikuTableRenderer.prototype.internalRender = function(allData, options) {

    var getBossDimension = function(allData){

        var temp1 = allData.query.cube.uniqueName.split("].[").join("/");

        var temp2 = temp1.split("[").join("");

        var temp3 = temp2.split("]").join("");

        var temp4 = encodeURI(temp3);

        return temp4;

    }
    var key = getBossDimension(allData);
    /*数据复制*/
   $.each(Saiku.session.sessionworkspace.cube,function(content,name){
       var temp = content.split("/");
       for(var i=0;i<4;i++){
           if(temp[i].indexOf("%")==-1){
               temp[i] = encodeURI(temp[i]);
           }
       }
       var temp2 = temp.join("/");
       Saiku.session.sessionworkspace.cube[temp2] = Saiku.session.sessionworkspace.cube[content];
   })

    var dimensions = Saiku.session.sessionworkspace.cube[key].get('data').dimensions;
    //构建当前查询库
    var currentList1 = function(columns,rows){
        var list = {};
        /*如果有rows*/
        if(rows){
            for(var i=0;i<rows.length;i++){
                $.each(rows[i].levels,function(name,value){
                    var tempname = ""+rows[i].name + ".["+ value.name +"]";
                    list[tempname] = {};
                    list[tempname]["value"] = "true";

                })
            }
        }
        /*如果有columns*/
        if(columns){
            for(var i=0;i<columns.length;i++){
                $.each(columns[i].levels,function(name,value){
                    var tempname = ""+columns[i].name + ".["+ value.name +"]";
                    list[tempname] = {};
                    list[tempname]["value"] = "true";

                })
            }
        }
        return list;
    }
    var currentListFact1 = currentList1(allData.query.queryModel.axes.COLUMNS.hierarchies,allData.query.queryModel.axes.ROWS.hierarchies);
    /*children*/
    var returnAllChilren = function(index,e){
        var list = [];
        for(var i=index+1;i<e.length;i++){
            list.push(e[i].uniqueName);
        }
        return list;
    }
    /*将level组织好并将数组返回来*/
    var levelList = function(e){
        var list = [];

        for(var i=0;i<e.length;i++){
            var singleJson = {};
            singleJson["name"] = e[i].uniqueName;
            if(i+1 == e.length){
                singleJson["next"] = "no";
            }else{
                singleJson["next"] = e[i+1].uniqueName;
            }

            singleJson["children"] = returnAllChilren(i,e);
            list.push(singleJson);
        }
        return list;
    }

    var totalHeaderList1  = function(columns,rows,dimensions){
        /*先获取当前的显示列表*/
        var bothList = [];
        /*存储totalArrayList*/
        var totalArrayList = [];
        /*存储最终输出的json*/
        var totalListJson = {};

        if(rows){
            for(var i=0;i<rows.length;i++){
                var temp = rows[i].name;
                bothList.push(temp);
            }
        }
        if(columns){
            for(var i=0;i<columns.length;i++){
                var temp = columns[i].name;
                bothList.push(temp);
            }
        }

        /*去总库中拿*/
        if(dimensions){
            for(var i=0;i<dimensions.length;i++){
                for(var j=0;j<dimensions[i].hierarchies.length;j++){
                    if(bothList.indexOf(dimensions[i].hierarchies[j].uniqueName)!=-1){
                        var arrayList = levelList(dimensions[i].hierarchies[j].levels);
                        totalArrayList = totalArrayList.concat(arrayList);
                    }
                }
            }
        }
        /*转换成json*/
        for(var i=0;i<totalArrayList.length;i++){
            totalListJson[totalArrayList[i]["name"]] = {};
            totalListJson[totalArrayList[i]["name"]]["next"] = totalArrayList[i]["next"];
            totalListJson[totalArrayList[i]["name"]]["children"] = totalArrayList[i]["children"];
            totalListJson[totalArrayList[i]["name"]]["value"] = true;
        }
        return totalListJson;
    }

    var totalHeaderListFact1 = totalHeaderList1(allData.query.queryModel.axes.COLUMNS.hierarchies,allData.query.queryModel.axes.ROWS.hierarchies,dimensions);
    window.yhnResult  = totalHeaderListFact1;

    var tableContent = "";
    var rowContent = "";
    var data = allData.cellset;
    var table = data ? data : [];
    var colSpan;
    var colValue;
    var isHeaderLowestLvl;
    var isBody = false;
    var firstColumn;
    var isLastColumn, isLastRow;
    var nextHeader;
    var processedRowHeader = false;
    var lowestRowLvl = 0;
    var rowGroups = [];
    var batchSize = null;
    var batchStarted = false;
    var isColHeader = false, isColHeaderDone = false;
    var resultRows = [];
    var wrapContent = true;
    if (options) {
        batchSize = options.hasOwnProperty('batchSize') ? options.batchSize : null;
        wrapContent = options.hasOwnProperty('wrapContent') ? options.wrapContent : true;
    }
    var totalsLists = {};
    totalsLists[COLUMNS] = allData.rowTotalsLists;
    totalsLists[ROWS] = allData.colTotalsLists;
    var scanSums = {};
    var scanIndexes = {};
    var dirs = [ROWS, COLUMNS];
    for (var i = 0; i < dirs.length; i++) {
        scanSums[dirs[i]] = new Array();
        scanIndexes[dirs[i]] = new Array();
    }
    if (totalsLists[COLUMNS])
        for (var i = 0; i < totalsLists[COLUMNS].length; i++) {
            scanIndexes[COLUMNS][i] = 0;
            scanSums[COLUMNS][i] = totalsLists[COLUMNS][i][scanIndexes[COLUMNS][i]].width;
        }

    for (var row = 0, rowLen = table.length; row < rowLen; row++) {
        var rowShifted = row - allData.topOffset;
        colSpan = 1;
        colValue = "";
        isHeaderLowestLvl = false;
        isLastColumn = false;
        isLastRow = false;
        isColHeader = false;
        var headerSame = false;
        if (totalsLists[ROWS])
            for (var i = 0; i < totalsLists[ROWS].length; i++) {
                scanIndexes[ROWS][i] = 0;
                scanSums[ROWS][i] = totalsLists[ROWS][i][scanIndexes[ROWS][i]].width;
            }
        rowContent = "<tr>";
        if ( row === 0) {
            rowContent = "<thead>" + rowContent;
        }
        for (var col = 0, colLen = table[row].length; col < colLen; col++) {
            var colShifted = col - allData.leftOffset;
            var header = data[row][col];
            if (header.type === "COLUMN_HEADER"){
                isColHeader = true;
            }

            // If the cell is a column header and is null (top left of table)
            if (header.type === "COLUMN_HEADER" && header.value ===  "null" && (firstColumn == null || col < firstColumn)) {
                rowContent += '<th class="all_null">&nbsp;</th>';
            } // If the cell is a column header and isn't null (column header of table)
            else if (header.type === "COLUMN_HEADER") {
                if (firstColumn == null) {
                    firstColumn = col;
                }
                if (table[row].length == col+1)
                    isLastColumn = true;
                else
                    nextHeader = data[row][col+1];
                if (isLastColumn) {
                    // Last column in a row...
                    if (header.value == "null") {
                        rowContent += '<th class="col_null">&nbsp;</th>';
                    } else {
                        if(header.value!="null"){
                            if(header.properties.dimension != "Measures"){
                                if(totalHeaderListFact1[header.properties.level]["next"]=="no"){
                                    var myTag1 = "";
                                }else{

                                    var myboy1 =  totalHeaderListFact1[header.properties.level]["next"];
                                    if(currentListFact1[myboy1]){
                                        var myTag1 = '<a class = "packOut">-</a>';
                                    }else{
                                        var myTag1 = '<a class = "spreadOut">+</a>';
                                    }
                                }
                            }else{
                                var myTag1 = "";
                            }
                        }else{
                            var myTag1 = "";
                        }
                        if (totalsLists[ROWS])
                            colSpan = totalsLists[ROWS][row + 1][scanIndexes[ROWS][row + 1]].span;
                        rowContent += '<th class="col" style="text-align: center;" colspan="' + colSpan + '" title="' + header.value + '">'
                            + (wrapContent ? '<div rel="' + row + ":" + col +'">' + header.value  + myTag1 +'</div>' : header.value)
                            + '</th>';
                    }
                } else {
                    if(header.value != "null"){
                        if(header.properties.dimension != "Measures"){
                            if(totalHeaderListFact1[header.properties.level]["next"]=="no"){
                                var myTag2 = "";
                            }else{
                                var myboy1 =  totalHeaderListFact1[header.properties.level]["next"];
                                if(currentListFact1[myboy1]){
                                    var myTag2 = '<a class = "packOut">-</a>';
                                }else{
                                    var myTag2 = '<a class = "spreadOut">+</a>';
                                }
                            }
                        }else{
                            var myTag2 = "";
                        }
                    }else{
                        var myTag2 = "";
                    }
                    // All the rest...
                    var groupChange = (col > 1 && row > 1 && !isHeaderLowestLvl && col > firstColumn) ?
                        data[row-1][col+1].value != data[row-1][col].value || data[row-1][col+1].properties.uniquename != data[row-1][col].properties.uniquename
                        : false;
                    var maxColspan = colSpan > 999 ? true : false;
                    if (header.value != nextHeader.value || nextParentsDiffer(data, row, col) || isHeaderLowestLvl || groupChange || maxColspan) {
                        if (header.value == "null") {
                            rowContent += '<th class="col_null" colspan="' + colSpan + '">&nbsp;</th>';
                        } else {
                            if (totalsLists[ROWS])
                                colSpan = totalsLists[ROWS][row + 1][scanIndexes[ROWS][row + 1]].span;
                            rowContent += '<th class="col" style="text-align: center;" colspan="' + (colSpan == 0 ? 1 : colSpan) + '" title="' + header.value + '">'
                            + (wrapContent ? '<div rel="' + row + ":" + col +'">' + header.value + myTag2 + '</div>' : header.value)
                            + '</th>';
                        }
                        colSpan = 1;
                    } else {
                        colSpan++;
                    }
                }
                if (totalsLists[ROWS])
                    var aggreType = null;
                    aggreType = allData.query.queryModel.axes.COLUMNS.aggregators[0];
                    chineseType = null;
                    switch(aggreType){
                        case "median": chineseType = "中位数";break;
                        case "sum": chineseType = "总额";break;
                        case "min": chineseType = "最小值";break;
                        case "max": chineseType = "最大值";break;
                        case "avg": chineseType = "平均数";break;
                        case "var": chineseType = "方差";break;
                        case "std": chineseType = "标准差";break;
                    }
                    rowContent += genTotalHeaderCells(col - allData.leftOffset + 1, row + 1, scanSums[ROWS], scanIndexes[ROWS], totalsLists[ROWS], wrapContent,chineseType);
            } // If the cell is a row header and is null (grouped row header)
            else if (header.type === "ROW_HEADER" && header.value === "null") {
                rowContent += '<th class="row_null">&nbsp;</th>';
            } // If the cell is a row header and isn't null (last row header)
            else if (header.type === "ROW_HEADER") {
                if (lowestRowLvl == col)
                    isHeaderLowestLvl = true;
                else
                    nextHeader = data[row][col+1];
                var previousRow = data[row - 1];
                var same = !headerSame && !isHeaderLowestLvl && (col == 0 || !topParentsDiffer(data, row, col)) && header.value === previousRow[col].value;
                headerSame = !same;
                    if(header.value!="null"){
                        if(header.properties.dimension != "Measures"){
                            if(totalHeaderListFact1[header.properties.level]["next"]=="no"){
                                var myTag = "";
                            }else{
                                var myboy =  totalHeaderListFact1[header.properties.level]["next"];
                                if(currentListFact1[myboy]){
                                    var myTag = '<a class = "packOut">-</a>';
                                }else{
                                    var myTag = '<a class = "spreadOut">+</a>';
                                }
                            }
                        }else{
                            var myTag = "";
                        }
                    }else{
                        var myTag = "";
                    }
                var value = (same ? "<div>&nbsp;</div>" : '<div rel="' + row + ":" + col +'">' + header.value +myTag+ '</div>');
                if (!wrapContent) {
                    value = (same ? "&nbsp;" : header.value );
                }
                var tipsy = "";
                var cssclass = (same ? "row_null" : "row");
                var colspan = 0;

                if (!isHeaderLowestLvl && (typeof nextHeader == "undefined" || nextHeader.value === "null")) {
                    colspan = 1;
                    var group = header.properties.dimension;
                    var level = header.properties.level;
                    var groupWidth = (group in rowGroups ? rowGroups[group].length - rowGroups[group].indexOf(level) : 1);
                    for (var k = col + 1; colspan < groupWidth && k <= (lowestRowLvl+1) && data[row][k] !== "null"; k++) {
                        colspan = k - col;
                    }
                    col = col + colspan -1;
                }
                rowContent += '<th class="' + cssclass + '" ' + (colspan > 0 ? ' colspan="' + colspan + '"' : "") + tipsy + '>' + value + '</th>';
            }
            else if (header.type === "ROW_HEADER_HEADER") {
                rowContent += '<th class="row_header">' + (wrapContent ? '<div>' + header.value + '</div>' : header.value) +'</th>';
                isHeaderLowestLvl = true;
                processedRowHeader = true;
                lowestRowLvl = col;
                if (header.properties.hasOwnProperty("dimension")) {
                    var group = header.properties.dimension;
                    if (!(group in rowGroups)) {
                        rowGroups[group] = [];
                    }
                    rowGroups[group].push(header.properties.level);
                }
            } // If the cell is a normal data cell
            else if (header.type === "DATA_CELL") {
                batchStarted = true;
                var color = "";
                var val = header.value;
                var arrow = "";
                if (header.properties.hasOwnProperty('image')) {
                    var img_height = header.properties.hasOwnProperty('image_height') ? " height='" + header.properties.image_height + "'" : "";
                    var img_width = header.properties.hasOwnProperty('image_width') ? " width='" + header.properties.image_width + "'" : "";
                    val = "<img " + img_height + " " + img_width + " style='padding-left: 5px' src='" + header.properties.image + "' border='0'>";
                }

                if (header.properties.hasOwnProperty('style')) {
                    color = " style='background-color: " + header.properties.style + "' ";
                }
                if (header.properties.hasOwnProperty('link')) {
                    val = "<a target='__blank' href='" + header.properties.link + "'>" + val + "</a>";
                }
                if (header.properties.hasOwnProperty('arrow')) {
                    arrow = "<img height='10' width='10' style='padding-left: 5px' src='./images/arrow-" + header.properties.arrow + ".gif' border='0'>";
                }

                rowContent += '<td class="data" ' + color + '>'
                        + (wrapContent ? '<div class="datadiv" alt="' + header.properties.raw + '" rel="' + header.properties.position + '">' : "")
                        + val + arrow
                        + (wrapContent ? '</div>' : '') + '</td>';
                if (totalsLists[ROWS])
                    rowContent += genTotalDataCells(colShifted + 1, rowShifted, scanSums[ROWS], scanIndexes[ROWS], totalsLists, wrapContent);
            }
        }
        rowContent += "</tr>";
        var totals = "";
        if (totalsLists[COLUMNS] && rowShifted >= 0) {
            var aggreType = null;
            aggreType = allData.query.queryModel.axes.ROWS.aggregators[0];
            chineseType = null;
            switch(aggreType){
                case "median": chineseType = "中位数";break;
                case "sum": chineseType = "总额";break;
                case "min": chineseType = "最小值";break;
                case "max": chineseType = "最大值";break;
                case "avg": chineseType = "平均数";break;
                case "var": chineseType = "方差";break;
                case "std": chineseType = "标准差";break;
            }


            totals += genTotalHeaderRowCells(rowShifted + 1, scanSums, scanIndexes, totalsLists, wrapContent,chineseType);
        }
        if (batchStarted && batchSize) {
                if (row <= batchSize) {
                    if (!isColHeader && !isColHeaderDone) {
                        tableContent += "</thead><tbody>";
                        isColHeaderDone = true;
                    }
                    tableContent += rowContent;
                    if (totals.length > 0) {
                        tableContent += totals;
                    }

                } else {
                    resultRows.push(rowContent);
                    if (totals.length > 0) {
                        resultRows.push(totals);
                    }

                }
        } else {
            if (!isColHeader && !isColHeaderDone) {
                tableContent += "</thead><tbody>";
                isColHeaderDone = true;
            }
            tableContent += rowContent;
            if (totals.length > 0) {
                tableContent += totals;
            }
        }
    }
    if (options) {
        options['batchResult'] = resultRows;
        options['hasBatchResult'] = resultRows.length > 0;
    }
    return "<table>" + tableContent + "</tbody></table>";
};
