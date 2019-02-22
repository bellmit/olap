
var SaikuOlapQueryTemplate = {
  "queryModel": {
    "axes": {
      "FILTER": {
        "mdx": null,
        "filters": [],
        "sortOrder": null,
        "sortEvaluationLiteral": null,
        "hierarchizeMode": null,
        "location": "FILTER",
        "hierarchies": [],
        "nonEmpty": false,
      },
      "COLUMNS": {
        "mdx": null,
        "filters": [],
        "sortOrder": null,
        "sortEvaluationLiteral": null,
        "hierarchizeMode": null,
        "location": "COLUMNS",
        "hierarchies": [],
        "nonEmpty": true,
      },
      "ROWS": {
        "mdx": null,
        "filters": [],
        "sortOrder": null,
        "sortEvaluationLiteral": null,
        "hierarchizeMode": null,
        "location": "ROWS",
        "hierarchies": [],
        "nonEmpty": true,
      }
    },
    "visualTotals": false,
    "visualTotalsPattern": null,
    "lowestLevelsOnly": false,
    "details": {
      "axis": "COLUMNS",
      "location": "BOTTOM",
      "measures": []
    },
    "calculatedMeasures": []
  },
  "queryType": "OLAP",
  "type": "QUERYMODEL"
};

var SaikuOlapQueryHelper = function(query) {
	this.query = query;
};
SaikuOlapQueryHelper.prototype.model = function() {
	return this.query.model;
};
SaikuOlapQueryHelper.prototype.removeSelection = function(axes,hierarchy,level,selection) {
    //step1 gethierarchy
    var myHierarchies = this.model().queryModel.axes[axes].hierarchies;
    var myHierarchy = null;
    //step2  loop search
    for(var i=0;i<myHierarchies.length;i++){
        if(myHierarchies[i].name = hierarchy){
            myHierarchy = myHierarchies[i];
        }
    }
    //step3 check find it or not
    if(myHierarchy!=null){
        //clear
        myHierarchy.levels[level].selection.members = [];
    }
};
//遍历所有的过滤条件
SaikuOlapQueryHelper.prototype.displayAllSelections = function() {
    //clear past
    document.querySelector(".fields_list_body ul.connectableRemade").innerHTML = "";
    var myColumns = this.model().queryModel.axes.COLUMNS.hierarchies;
    var myRows = this.model().queryModel.axes.ROWS.hierarchies;
    var myFilter = this.model().queryModel.axes.FILTER.hierarchies;
    //遍历行
    if(myRows){
        for(var j=0;j<myRows.length;j++){
            var liName = myRows[j].name;
            $.each(myRows[j].levels,function(key,value){
                if(value.selection){
                    if(value.selection.members.length>0){
                        var myli = document.createElement("li");
                        myli.setAttribute("name",value.name);
                        myli.setAttribute("hierarchy",liName);
                        myli.setAttribute("axes","ROWS");
                        var parentSpan = document.createElement("span");
                        var meOrYou = document.createElement("span");
                        meOrYou.setAttribute("class","meOrYou");
                        if(value.selection.type == "EXCLUSION"){
                            meOrYou.innerHTML = "排除";
                        }else{
                            meOrYou.innerHTML = "包含";
                        }
                        parentSpan.innerHTML = value.name;
                        parentSpan.setAttribute("class","parentName");
                        $(myli).append(parentSpan);
                        $(myli).append(meOrYou);
                        for(var i=0;i<value.selection.members.length;i++){
                            var myspan = document.createElement("span");
                            myspan.setAttribute("class","childName");
                            /*对caption的展示进行处理*/
                            var temp = value.selection.members[i].caption;
                            if(temp.indexOf(".")>0){
                                var tempLength = temp.split(".").length;
                                temp  = temp.split(".")[tempLength-1];
                                temp = temp.split("[").join("");
                                temp = temp.split("]").join("");
                            }else{
                            }
                            if(i== value.selection.members.length-1){
                                myspan.innerHTML = temp;
                            }else{
                                myspan.innerHTML = temp+",";
                            }
                            $(myli).append(myspan);
                        }
                        var closeSpan = document.createElement("span");
                        closeSpan.setAttribute("class","closeSpan");
                        closeSpan.innerHTML = "";
                        $(myli).append(closeSpan);
                        $(document.querySelector(".fields_list_body ul.connectableRemade")).append(myli);
                    }
                }
            })
        }
    }
    //遍历列
    if(myColumns){
        for(var j=0;j<myColumns.length;j++){
            var liName = myColumns[j].name;
            if(myColumns[j].levels){
                $.each(myColumns[j].levels,function(key,value){
                    if(value.selection){
                        if(value.selection.members.length>0){
                            var myli = document.createElement("li");
                            myli.setAttribute("name",value.name);
                            myli.setAttribute("hierarchy",liName);
                            myli.setAttribute("axes","COLUMNS");
                            var parentSpan = document.createElement("span");
                            var meOrYou = document.createElement("span");
                            meOrYou.setAttribute("class","meOrYou");
                            if(value.selection.type == "EXCLUSION"){
                                meOrYou.innerHTML = "排除";
                            }else{
                                meOrYou.innerHTML = "包含";
                            }
                            parentSpan.innerHTML = value.name;
                            parentSpan.setAttribute("class","parentName");
                            $(myli).append(parentSpan);
                            $(myli).append(meOrYou);
                            for(var i=0;i<value.selection.members.length;i++){
                                var myspan = document.createElement("span");
                                myspan.setAttribute("class","childName");

                                /*对caption的展示进行处理*/
                                var temp = value.selection.members[i].caption;
                                if(temp.indexOf(".")>0){
                                    var tempLength = temp.split(".").length;
                                    temp  = temp.split(".")[tempLength-1];
                                    temp = temp.split("[").join("");
                                    temp = temp.split("]").join("");
                                }else{

                                }
                                if(i== value.selection.members.length-1){
                                    myspan.innerHTML = temp;
                                }else{
                                    myspan.innerHTML = temp+",";
                                }
                                $(myli).append(myspan);
                            }
                            var closeSpan = document.createElement("span");
                            closeSpan.setAttribute("class","closeSpan");
                            closeSpan.innerHTML = "";
                            $(myli).append(closeSpan);
                            $(document.querySelector(".fields_list_body ul.connectableRemade")).append(myli);
                        }
                    }
                })
            }
        }
    }
    //遍历过滤
    if(myFilter){
        for(var j=0;j<myFilter.length;j++){
            var liName = myFilter[j].name;
            $.each(myFilter[j].levels,function(key,value){
                if(value.selection){
                    if(value.selection.members.length>0){
                        var myli = document.createElement("li");
                        myli.setAttribute("name",value.name);
                        myli.setAttribute("hierarchy",liName);
                        myli.setAttribute("axes","FILTER");
                        var parentSpan = document.createElement("span");
                        var meOrYou = document.createElement("span");
                        meOrYou.setAttribute("class","meOrYou");
                        if(value.selection.type == "EXCLUSION"){
                            meOrYou.innerHTML = "排除";
                        }else{
                            meOrYou.innerHTML = "包含";
                        }
                        parentSpan.innerHTML = value.name;
                        parentSpan.setAttribute("class","parentName");
                        $(myli).append(parentSpan);
                        $(myli).append(meOrYou);
                        for(var i=0;i<value.selection.members.length;i++){
                            var myspan = document.createElement("span");
                            myspan.setAttribute("class","childName");
                            if(i== value.selection.members.length-1){
                                myspan.innerHTML = value.selection.members[i].caption;
                            }else{
                                myspan.innerHTML = value.selection.members[i].caption+",";
                            }
                            $(myli).append(myspan);
                        }
                        var closeSpan = document.createElement("span");
                        closeSpan.setAttribute("class","closeSpan");
                        closeSpan.innerHTML = "";
                        $(myli).append(closeSpan);
                        $(document.querySelector(".fields_list_body ul.connectableRemade")).append(myli);
                    }
                }
            })
        }
    }

}
//下面这句没用了
SaikuOlapQueryHelper.prototype.clearAxis = function(axisName) {
  this.model().queryModel.axes[axisName].hierarchies = [];
};
SaikuOlapQueryHelper.prototype.getHierarchy = function(name) {
  var _searchFunction = function(he) {
    return (he && he.name == name);
  };

  for (var axisName in this.model().queryModel.axes) {
      var axis = this.model().queryModel.axes[axisName];
      var hierarchy = _.find(axis.hierarchies, _searchFunction);
      if (hierarchy) {
        return hierarchy;
      }
    }
    return null;
};

SaikuOlapQueryHelper.prototype.moveHierarchy = function(fromAxis, toAxis, hierarchy, position) {
  var h = this.getHierarchy(hierarchy);
  var i = this.model().queryModel.axes[fromAxis].hierarchies.indexOf(h);
  var target = this.model().queryModel.axes[toAxis].hierarchies;
  this.model().queryModel.axes[fromAxis].hierarchies.splice(i,1);
  if (typeof position != "undefined" && position > -1 && target.length > position) {
      target.splice(position, 0, h);
      return;
  }
  target.push(h);

};

SaikuOlapQueryHelper.prototype.removeHierarchy = function(hierarchy) {
  var h = this.getHierarchy(hierarchy);
  if (!h) {
    return null;
  }
  var axis = this.findAxisForHierarchy(hierarchy);
  if (axis) {
    var i = axis.hierarchies.indexOf(h);
      axis.hierarchies.splice(i,1);
  }
  return h;
};

SaikuOlapQueryHelper.prototype.findAxisForHierarchy = function(hierarchy) {
  for (var axisName in this.model().queryModel.axes) {
    var axis = this.model().queryModel.axes[axisName];
    if (axis.hierarchies && axis.hierarchies.length > 0) {
      for (var i = 0, len = axis.hierarchies.length; i < len; i++) {
        if (axis.hierarchies[i].name == hierarchy) {
          return axis;
        }
      }
    }
  }
  return null;
};

SaikuOlapQueryHelper.prototype.getAxis = function(axisName) {
  if (axisName in this.model().queryModel.axes) {
    return this.model().queryModel.axes[axisName];
  }
  Saiku.log("Cannot find axis: " + axisName);
};

SaikuOlapQueryHelper.prototype.removeFilter = function(filterable, flavour) {
    if (flavour && filterable.filters.length > 1) {
      var removeIndex = -1;
      for (var i = 0, len = filterable.filters.length; i < len; i++) {
        if (filterable.filters[i].flavour == flavour) {
          removeIndex = i;
        }
      }
      if (removeIndex && removeIndex >= 0) {
        filterable.filters.splice(removeIndex, 0);
      }
    } else {
      filterable.filters = [];
    }
};

SaikuOlapQueryHelper.prototype.includeLevel = function(axis, hierarchy, level, position) {
    var mHierarchy = this.getHierarchy(hierarchy);
    if (mHierarchy) {
      mHierarchy.levels[level] = { name: level };
    } else {
      mHierarchy = { "name" : hierarchy, "levels": { }};
      mHierarchy.levels[level] = { name: level };
    }

    var existingAxis = this.findAxisForHierarchy(hierarchy);
    if (existingAxis) {
      this.moveHierarchy(existingAxis.location, axis, hierarchy, position);
    } else {
      var _axis = this.model().queryModel.axes[axis];
      if (_axis) {
        if (typeof position != "undefined" && position > -1 && _axis.hierarchies.length > position) {
          _axis.hierarchies.splice(position, 0, mHierarchy);
          return;
        }
        _axis.hierarchies.push(mHierarchy);
      } else {
        Saiku.log("Cannot find axis: " + axis + " to include Level: " + level);
      }
    }
};

SaikuOlapQueryHelper.prototype.removeLevel = function(hierarchy, level) {
  hierarchy = this.getHierarchy(hierarchy);
  if (hierarchy && hierarchy.levels.hasOwnProperty(level)) {
    delete hierarchy.levels[level];
  }
};

SaikuOlapQueryHelper.prototype.removeMultiLevel = function(hierarchy, level) {
    hierarchy = this.getHierarchy(hierarchy);
    for(var i=0;i<level.length;i++){
        var thisLevel = level[i].split(".").pop().split("[").pop().split("]")[0];
        if (hierarchy && hierarchy.levels.hasOwnProperty(thisLevel)) {
            delete hierarchy.levels[thisLevel];
        }
    }
};

SaikuOlapQueryHelper.prototype.includeMeasure = function(measure) {
  var measures = this.model().queryModel.details.measures,
      len = measures.length,
      i,
      aux = false;
  if (measures && !(_.isEmpty(measures))) {
    for (i = 0; i < len; i++) {
      if (measures[i].name === measure.name) {
        aux = true;
        break;
      }
      else {
        aux = false;
      }
    }

    if (aux === false) {
      measures.push(measure);
    }
  }
  else {
    measures.push(measure);
  }
};

SaikuOlapQueryHelper.prototype.removeMeasure = function(name) {
  var measures = this.query.model.queryModel.details.measures;
  var removeMeasure = _.findWhere(measures , { name: name });
  if (removeMeasure && _.indexOf(measures, removeMeasure) > -1) {
    measures = _.without(measures, removeMeasure);
  }
};

SaikuOlapQueryHelper.prototype.clearMeasures = function() {
  this.model().queryModel.details.measures = [];
};

SaikuOlapQueryHelper.prototype.setMeasures = function(measures) {
  this.model().queryModel.details.measures = measures;
};

SaikuOlapQueryHelper.prototype.addCalculatedMeasure = function(measure) {
  if (measure) {
    this.removeCalculatedMeasure(measure.name);
    this.model().queryModel.calculatedMeasures.push(measure);
  }
};

SaikuOlapQueryHelper.prototype.removeCalculatedMeasure = function(name) {

  var measures = this.model().queryModel.calculatedMeasures;
  var removeMeasure = _.findWhere(measures , { name: name });
  if (removeMeasure && _.indexOf(measures, removeMeasure) > -1) {
    measures = _.without(measures, removeMeasure);
    this.model().queryModel.calculatedMeasures = measures;
  }
};

SaikuOlapQueryHelper.prototype.getCalculatedMeasures = function() {
  var ms = this.model().queryModel.calculatedMeasures;
  if (ms) {
    return ms;
  }
  return null;
};



SaikuOlapQueryHelper.prototype.swapAxes = function() {
  var axes = this.model().queryModel.axes;
  var tmpAxis = axes.ROWS;
  tmpAxis.location = 'COLUMNS';
  axes.ROWS = axes.COLUMNS;
  axes.ROWS.location = 'ROWS';
  axes.COLUMNS = tmpAxis;
};

SaikuOlapQueryHelper.prototype.nonEmpty = function(nonEmpty) {
  if (nonEmpty) {
    this.model().queryModel.axes.ROWS.nonEmpty = true;
    this.model().queryModel.axes.COLUMNS.nonEmpty = true;
  } else {
    this.model().queryModel.axes.ROWS.nonEmpty = false;
    this.model().queryModel.axes.COLUMNS.nonEmpty = false;
  }
};




