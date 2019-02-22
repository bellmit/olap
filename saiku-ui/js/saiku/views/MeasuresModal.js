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
 * 指标计算1
 */
var MeasuresModal = Modal.extend({

    type: "filter",
    closeText: "Save",

    mdxFunctions: ['distinct', 'count distinct'],

    events: {
        'submit form': 'save',
        'click .dialog_footer a': 'call',
        'change #Measures': 'addMeasureToCalculationField',
        'click .form_button.mathBtn': 'addMathOperatorToCalculationField',
        'click div.calculatedMeasureList ul':'clickOneList',
        'click div.buttonCreate':'createNewMeasureLi',
        'click div.buttonDelete':'deleteMeasureLi',
        'click #chooseFormula':'showInsertFormula',
        'click #sureFormulaPanel' : 'sureInsertFormula',
        'click #closeFormulaPanel' : 'hideInsertFormula',
        'focus #yhnFormat':'showFormatPanel',
        // 'blur #yhnFormat':'blurHideFormat',
        'keydown #yhnFormat':'hideFormatPanel',
        'click .fontFormat li':'insertFormat',
        'change #dimensionType1':'changeModel',
        'click #formulaType3': 'hideDateYear',
        'click #formulaType4': 'hideDateYear',
        'click #formulaType1': 'showDateYear',
        'click #formulaType2': 'showDateYear'
    },

    buttons: [
        { text: "关闭", method: "close" ,class:"yhncancel"},
        { text: "应用", method: "save",class:"yhnsave"}
    ],
    options: {
        autoOpen: false,
        modal: true,
        title: "Modal dialog",
        resizable: false,
        draggable: false,
        width:700,
        height: 600,
        closeOnEscape: false,
        close: function(event, ui) {
            $(this).remove();
        },
        open:function(event,ui){
            if($(".calculatedMeasureList>ul>li").length > 0){
                $(".calculatedMeasureList>ul>li:nth-child(1)").addClass("clickMeasureLi");
                if([].slice.call($(".calculatedMeasureList>ul>li:nth-child(1)")).length){
                    var name = $(".calculatedMeasureList>ul>li:nth-child(1)").attr("tag1");
                    var formula = $(".calculatedMeasureList>ul>li:nth-child(1)").attr("tag2");
                    var format = $(".calculatedMeasureList>ul>li:nth-child(1)").attr("tag3");
                    document.querySelector("#measure_form .measure_name").value = name;
                    document.querySelector("#measure_form .measureFormula").value = formula;
                    document.querySelector("#measure_form .measure_format").value = format;
                }
                $(".ironmanCtrl").attr("disabled",false);
            }else{
                $(".ironmanCtrl").attr("disabled","disabled");
            }
        },
        position:{
            my: "center center", at: "center center", of: window
        }
    },
    hideDateYear:function(){
       $(".upRightLayer>div:nth-child(5)").hide();
       $(".upRightLayer>div:nth-child(6)").hide();
    },
    showDateYear:function(){
        $(".upRightLayer>div:nth-child(5)").show();
        $(".upRightLayer>div:nth-child(6)").show();
    },
    changeModel:function(e){

        //获取dimension改变的值
        var a = $("#dimensionType1").val();
        //如果选择了规定的值，进行过滤
        if(a!=""){
            //处理成想要的格式
            // var b = a.replace("\.","].[");
            var b = a.replace(/\[|\]|\./g, '');
            //获取subDimensionList
            var subDimension = this.subDimensions;
            var newSubList = subDimension.filter(function(ele,index,arr){
                return ele.hierarchyUniqueName.replace(/\[|\]|\./g, '') == b
                // if(ele.uniqueName.indexOf(b)>-1){
                //     return ele.uniqueName;
                // }else{
                //     return false;
                // }
            })
            //清空次级菜单
            document.querySelector("#dimensionType2").innerHTML = "";
            newSubList.forEach(function(ele,index){
                $("#dimensionType2").append("<option value='"+ele.name+"'>"+ele.uniqueName+"</option>");
                
            })
        }else{
            $("#dimensionType2").children().remove();
            //如果未选择规定的值则进行还原
            $("#dimensionType2").append("<option value='' selected='selected'>"+"选择日期年度"+"</option>");
            this.subDimensions.forEach(function(ele,index){
                $("#dimensionType2").append("<option value="+ele.name+">"+ele.uniqueName+"</option>");
            })
        }




    },

    insertFormat:function(e){
        e.stopPropagation();
        var targetFormat =  e.target.getAttribute("value");
        $("#yhnFormat").val(targetFormat);
        document.querySelector(".fontFormat").style.display = "none";
    },

    showFormatPanel:function(){
        document.querySelector(".fontFormat").style.display = "block";
    },

    hideFormatPanel:function(e){
        if(e.type==="click" && ($(e.target).closest(".fontFormat li,#yhnFormat").length || $(e.target).closest(".ui-dialog").length === 0)){
            return;
        }
        document.querySelector(".fontFormat").style.display = "none";
    },

    // blurHideFormat:function(e){
    //   setTimeout(function(){
    //       document.querySelector(".fontFormat").style.display = "none";
    //   },100)
    // },

    showInsertFormula:function(){
        document.querySelector(".insertFormulaPanel").style.display = "block";
    },

    hideInsertFormula:function(){
        document.querySelector(".insertFormulaPanel").style.display = "none";
    },

    sureInsertFormula:function(){
        var combineStr = "";
        //获取大的类别
        var outerType = $("input[name='formulaType']:checked").val();
        //获取指标
        var measureType = $("#Measures1").val();
        //获取维度
        var dimentionsType1 = $("#dimensionType1").val();
        //获取第三维度
        var dimentionsType2 = $("#dimensionType2").val();

        if(measureType!=""&&dimentionsType1!=""&&dimentionsType2!=""){
            document.querySelector(".insertFormulaPanel").style.display = "none";
            if(outerType == "type1"){
                combineStr = "IIF(isempty(("+measureType+",ParallelPeriod("+dimentionsType1+".["+
                    dimentionsType2+"],1,"+dimentionsType1+".currentmember))) or isempty("+
                    measureType+"),null, ("+measureType+"/("+measureType+",ParallelPeriod("+
                    dimentionsType1+".["+dimentionsType2+"],1,"+dimentionsType1+".currentmember))-1))";
            }else if(outerType == "type2"){
                combineStr = "IIF(isempty("+measureType+"),null,"+measureType+"-("+measureType+",ParallelPeriod("+
                    dimentionsType1+".["+dimentionsType2+"],1,"+dimentionsType1+".currentmember)))";
            }else if(outerType == "type3"){
                combineStr = "IIF(isempty(("+measureType+",ParallelPeriod("+dimentionsType1+".currentmember.level,1,"+
                    dimentionsType1+".currentmember))) or isempty("+measureType+"),null, ("+measureType+
                    "/("+measureType+",ParallelPeriod("+dimentionsType1+".currentmember.level,1,"+dimentionsType1+
                    ".currentmember))-1))";
            }else if(outerType == "type4"){
                combineStr = "IIF(isempty("+measureType+"),null,"+measureType+"-("+measureType+",ParallelPeriod("+dimentionsType1+
                    ".currentmember.level,1,"+dimentionsType1+".currentmember)))";
            }

            $(".measureFormula").val(combineStr);
        }else{
            this.yhnTips("请选择完整方可插入公式");
        }
    },

    addMeasureTemplate: _.template(
            "<div class = 'measureOuter' style='overflow: hidden;margin-top: 12px;'>"+

            "<div class='fontFormat'>" +
                "<ul>"+
                    "    <% _(formats).each(function(m) { %> " +
                    "      <li value='<%= m.uniqueName %>'><%= m.name %></li> " +
                    "    <% }); %> " +
                "</ul>"+
            "</div>"+

            "<div class = 'insertFormulaPanel'>"+
                "<div class='uplayer'>" +
                    "<div class = 'upLeftLayer'>" +
                        "<div><span>类别</span></div>" +
                        "<div><input name='formulaType' type='radio' id='formulaType1' value='type1' checked='checked'><label for='formulaType1'>同比增幅</label></div>" +
                        "<div><input name='formulaType' type='radio' id='formulaType2' value='type2'><label for='formulaType2'>同比增长额</label></div>" +
                        "<div><input name='formulaType' type='radio' id='formulaType3' value='type3'><label for='formulaType3'>环比增幅</label></div>" +
                        "<div><input name='formulaType' type='radio' id='formulaType4' value='type4'><label for='formulaType4'>环比增长额</label></div>" +
                    "</div>"+
                    "<div class = 'upRightLayer'>" +
                        "<div><span>指标</span></div>" +
                        "<div>" +
                        "<select id='Measures1' class = 'ironmanCtrl yhnSelect1' name='MeasuresId' disabled = 'disabled'> " +
                        "    <option value='' selected='selected' class='i18n'>--select an existing measure--</option> " +
                        "    <% _(measures).each(function(m) { %> " +
                        "      <option value='<%= m.uniqueName %>'><%= m.name %></option> " +
                        "    <% }); %> " +
                        "</select> " +
                        "</div>"+
                        "<div><span>日期维度</span></div>"+
                        "<div>" +
                        "<select id='dimensionType1' class = 'ironmanCtrl yhnSelect1' name='dimensionId'> " +
                        "    <option value='' selected='selected' class='i18n'>--select an existing dimension--</option> " +
                        "    <% _(dimensions).each(function(m) { %> " +
                        "      <option value='<%= m %>'><%= m %></option> " +
                        "    <% }); %> " +
                        "</select> " +
                        "</div>"+
                        "<div><span>日期年度</span></div>"+
                        "<div>" +
                        "<select id='dimensionType2' class = 'ironmanCtrl yhnSelect1' name='dimensionId'> " +
                        "    <option value='' selected='selected' class='i18n'>--select an existing yearDimension--</option> " +
                        "    <% _(subDimensions).each(function(m) { %> " +
                        "      <option value='[<%= m.name %>]'><%= m.uniqueName %></option> " +
                        "    <% }); %> " +
                        "</select> " +
                        "</div>"+
                    "</div>"+
                "</div>"+
                "<div class='downlayer'>" +
                    "<button id='closeFormulaPanel'>关闭</button>"+
                    "<button id='sureFormulaPanel'>确定</button>"+
                "</div>"+
            "</div>"+

            "<div class = 'leftShowArea'><div style='overflow:hidden'><div style='float: left;color:#444;font-weight:bold'>指标</div><div class = 'createButtonGroup'><div class = 'buttonCreate'></div><div class = 'buttonDelete'></div></div></div>" +
            
            // "<div class = 'createButtonGroup'>" +
            //     "<div class = 'buttonCreate'>" +
            //         "<div class = 'createIcon'></div>"+
            //         "<div class = 'createText'>新建</div>"+
            //     "</div>"+
            //     "<div class = 'buttonDelete'>" +
            //         "<div class = 'createIcon'></div>"+
            //         "<div class = 'createText'>删除</div>"+
            //     "</div>"+
            // "</div></div>"+
                "<div class = 'calculatedMeasureList'>" +
                "<ul>" +
                    "    <% _(calculatedList).each(function(m) { %> " +
                    "      <li value='<%= m.name %>' class = 'liOfCalculatedList' tag1 =  '<%= m.name %>' tag2 = '<%= m.formula %>' tag3 = '<%= m.properties.FORMAT_STRING%>'><%= m.name %></li> " +
                    "    <% }); %> " +
                "</ul>"+
                "</div>"+
            "</div>"+

            "<form id='measure_form'>" +
            "<table border='0px'>" +
            "<tr><td class='col0 i18n'>Name:</td>" +
            "<td class='col1'><input type='text' disabled = 'disabled' class='ironmanCtrl measure_name i18n yhnTextInput' value='Measure Name'></input></td></tr>" +

            "<tr><td class='col0 i18n'>insertMeasure</td>" +
            "<td class='col1'>" +
            "<select id='Measures' class = 'ironmanCtrl yhnSelect' name='MeasuresId' disabled = 'disabled'> " +
            "    <option value='' selected='selected' class='i18n'>--select an existing measure--</option> " +
            "    <% _(measures).each(function(m) { %> " +
            "      <option value='<%= m.uniqueName %>'><%= m.name %></option> " +
            "    <% }); %> " +
            "</select> " +
            "</td></tr>" +

            "<tr><td class='col0 i18n'>InsertFormula</td>" +
            "<td class='col1'>" +
            "<a id = 'chooseFormula' style='color:blue;text-decoration:underline;cursor:pointer;color:#169BD5;'>点击选择</a>"+
            "</td></tr>" +

            "<tr><td class='col0 i18n'>Formula:</td>" +
            "<td class='col1' style='margin-bottom:4px'><textarea disabled = 'disabled' class='ironmanCtrl measureFormula yhnTextArea auto-hint i18n' placeholder='Start writing a calculated measure or use the dropdown list'></textarea></td></tr>" +

            "<tr> <td class='col0 ' > </td>" +
            "<td class='col1 yhnSpace'>" +
            " <form> <input type='button' disabled = 'disabled' class='ironmanCtrl form_button mathBtn' style='padding-bottom: 18px;' value='+' id='plusBtn' >  </input>   " +
            " <input type='button' disabled = 'disabled' class='ironmanCtrl form_button mathBtn' style='padding-bottom: 18px;' value='-' id='minusBtn' > </input>  " +
            " <input type='button' disabled = 'disabled' class='ironmanCtrl form_button mathBtn' style='padding-bottom: 18px;' value='*' id='multiplyBtn' >  </input>  " +
            " <input type='button' disabled = 'disabled' class='ironmanCtrl form_button mathBtn' style='padding-bottom: 18px;' value='/' id='divisionBtn' >  </input> " +
            " <input type='button' disabled = 'disabled' class='ironmanCtrl form_button mathBtn' style='padding-bottom: 18px;' value='(' id='leftBracketBtn' >  </input> " +
            " <input type='button' disabled = 'disabled' class='ironmanCtrl form_button mathBtn' style='padding-bottom: 18px;' value=')' id='rightBracketBtn' >  </input> " +

            "</form> </td>" +
            "</tr>" +
            "<tr><td class='col0 i18n'>Format:</td>" +
            "<td class='col1'><input disabled = 'disabled' autocomplete='off' class='ironmanCtrl measure_format yhnTextInput' type='text' value='#,##0.00' id='yhnFormat'></input></td></tr>" +
            "</table></form>"+
            "</div>"
    ),


    measure: null,
    initialize: function (args) {
        var self = this;
        this.workspace = args.workspace;
        this.measure = args.measure;
        var cube = this.workspace.selected_cube;
        this.measures = Saiku.session.sessionworkspace.cube[cube].get('data').measures;
        this.calculated = args.workspace.query.model.queryModel.calculatedMeasures;
        this.dimension = Saiku.session.sessionworkspace.cube[cube].get('data').dimensions;
        this.subDimensions = this.dimension;
        this.formats = [
            {id:0,uniqueName:"#.###",name:"#.### (整数)"},
            {id:1,uniqueName:"#.##0.0#",name:"#.##0.0# (小数)"},
            {id:2,uniqueName:"￥#.##0.00",name:"￥#.##0.00 (货币)"},
            {id:3,uniqueName:"##%",name:"##% (货币)"},
            {id:4,uniqueName:"0.##%",name:"##% (百分小数)"}
        ]
        var dimensionList = [];

         for(var i=0;i<this.dimension.length;i++){
             for(var j = 0;j<this.dimension[i].hierarchies.length;j++){
                 if(this.dimension[i].hierarchies[j].uniqueName.split(".").length>1){
                     var regx = new RegExp(/\[|\]/g);
                     dimensionList.push("["+ this.dimension[i].hierarchies[j].uniqueName.replace(regx,"")+"]");
                 }else{
                     dimensionList.push( this.dimension[i].hierarchies[j].uniqueName);
                 }

             }
         }

        this.dimensions = dimensionList;
        var subDimensionList = [];
         for(var i=0;i<this.dimension.length;i++){
              for(var j = 0;j<this.dimension[i].hierarchies.length;j++){
                  for(var k=0;k<this.dimension[i].hierarchies[j].levels.length;k++){
                      //(All)
                      if(this.dimension[i].hierarchies[j].levels[k].name != '(All)'){
                          subDimensionList.push(this.dimension[i].hierarchies[j].levels[k]);
                      }

                  }
              }
          }

          this.subDimensions = subDimensionList;


        _.bindAll(this, "save");
        this.options.title = "Calculated Measure";
        if (this.measure) {
            _.extend(this.options, {
                title: "Custom Filter for " + this.axis
            });
        }
        this.bind('open', function () {

            if (self.measure) {
            }

        });
        // fix event listening in IE < 9
        if (isIE && isIE < 9) {
            $(this.el).find('form').on('submit', this.save);
        }
        ;
        // Load template
        this.message = this.addMeasureTemplate({
            formats:this.formats,
            measures: this.measures,
            dimensions: this.dimensions,
            subDimensions:this.subDimensions,
            mdxFunctions: this.mdxFunctions,
            calculatedList:this.calculated
        });

        $(document).off('click.FORMAT_PANEL').on('click.FORMAT_PANEL',function(e){
            self.hideFormatPanel(e);
        });
    
    },
    createNewMeasureLi:function(name){
        var liLength = $(".calculatedMeasureList .unSaved").length;
        if(liLength<=0){
            //取消所有li选中状态
            $(".calculatedMeasureList>ul>li").removeClass("clickMeasureLi");

            // 添加新li
            var newli = document.createElement("li");
            //给新添加Li添加高光
            $(newli).addClass("clickMeasureLi unSaved");

            var tag = $(".calculatedMeasureList>ul>li").length;

            newli.innerHTML = "新增计算指标"+tag;

            $(".calculatedMeasureList>ul").append(newli);

            //设置显示内容初始状态
            document.querySelector("#measure_form .measure_name").value = "新增计算指标"+tag;
            document.querySelector("#measure_form .measureFormula").value= "";
            document.querySelector("#measure_form .measure_format").value = "#,##0.00";
        }else{
            this.yhnTips("请应用当前新建内容");
        }
        /*所有设置为可用*/

        $(".ironmanCtrl").attr("disabled",false);
    },
    addVirtualLi:function(name){
        //删除unSaved元素
        $(".calculatedMeasureList .unSaved").remove();
        //取消所有li选中状态
        $(".calculatedMeasureList>ul>li").removeClass("clickMeasureLi");
        var Littleli = document.createElement("li");
        $(Littleli).addClass("liOfCalculatedList clickMeasureLi");
        Littleli.innerHTML = name;
        $(".calculatedMeasureList>ul").append(Littleli);
    },
    deleteMeasureLi:function(){
        var clickedName = $(".calculatedMeasureList li.clickMeasureLi").text();
        /*系统删除*/
        this.workspace.query.helper.removeCalculatedMeasure(clickedName);
        this.workspace.sync_query();

        for(var i=0;i< this.calculated.length;i++){
            if(this.calculated[i].name == clickedName){
                this.calculated.splice(i,1);
            }
        }
        //TODO清空当前
        $(".calculatedMeasureList li.clickMeasureLi").remove();
        document.querySelector("#measure_form .measure_name").value = "";
        document.querySelector("#measure_form .measureFormula").value= "";
        document.querySelector("#measure_form .measure_format").value = "#,##0.00";
        $(".ironmanCtrl").attr("disabled","disabled");

    },
    clickOneList:function(e){
        var liLength = $(".calculatedMeasureList .unSaved").length;
        if(liLength<=0){
            $(e.target).siblings().removeClass("clickMeasureLi");
            e.target.classList.add("clickMeasureLi");
            var clickedName = e.target.innerText;
            var flag = false;
            var boss = this.workspace.query.model.queryModel.calculatedMeasures;
            var measuresLength = this.workspace.query.model.queryModel.calculatedMeasures.length;
            for(var i=0;i<measuresLength;i++){
                if(boss[i].name == clickedName){
                    document.querySelector("#measure_form .measure_name").value = boss[i].name;
                    document.querySelector("#measure_form .measureFormula").value = boss[i].formula;
                    document.querySelector("#measure_form .measure_format").value = boss[i].properties.FORMAT_STRING;
                    flag = true;
                }
            }
            if(flag == false){
                document.querySelector("#measure_form .measure_name").value = "";
                document.querySelector("#measure_form .measureFormula").value = "";
                document.querySelector("#measure_form .measure_format").value = "";
            }
        }else{
            this.yhnTips("请保存后再存储");
        }
        $(".ironmanCtrl").attr("disabled",false);
    },
    save: function (event) {
        event.preventDefault();
        var self = this;
        var measure_name = $(this.el).find('.measure_name').val();
        var measure_formula = $(this.el).find('.measureFormula').val();
        var measure_format = $(this.el).find('.measure_format').val();
        //遍历当前有没有同名的，无同名的就新建
        var flag = false;
        var listSet = [].slice.call($(".calculatedMeasureList li:not(.unSaved)"));
        for(var i=0;i<listSet.length;i++){
            if(listSet[i].innerHTML == measure_name){
                flag = true;
            }
        }

            //没有的话新建
            var alert_msg = "";
            if (typeof measure_name == "undefined" || !measure_name) {
                alert_msg += "请输入指标名称! ";
            }
            if (typeof measure_formula == "undefined" || !measure_formula || measure_formula === "") {
                alert_msg += "请为计算指标添加MDX公式! ";
            }
            if (alert_msg !== "") {
                this.yhnTips(alert_msg);
            } else {

                if(flag == false){
                    if($(".calculatedMeasureList li.unSaved").length>0){
                        //添加新的
                        var m = { name: measure_name, formula: measure_formula, properties: {}, uniqueName: "[Measures]." + measure_name };
                        if (measure_format) {
                            m.properties.FORMAT_STRING = measure_format;
                        }
                        self.workspace.query.helper.addCalculatedMeasure(m);
                        this.addVirtualLi(measure_name);
                        self.workspace.sync_query();
                        //将所有unsaved标记去除
                        $(".calculatedMeasureList .unSaved").removeClass("unSaved");
                    }else{
                        var m = { name: measure_name, formula: measure_formula, properties: {}, uniqueName: "[Measures]." + measure_name };
                        if (measure_format) {
                            m.properties.FORMAT_STRING = measure_format;
                        }
                        //原来的删掉
                        var clickedName = $(".calculatedMeasureList li.clickMeasureLi").text();
                        for(var i=0;i< this.workspace.query.model.queryModel.calculatedMeasures.length;i++){
                            if(this.workspace.query.model.queryModel.calculatedMeasures[i].name == clickedName){
                                this.workspace.query.model.queryModel.calculatedMeasures.splice(i,1);
                            }
                        }
                        //TODO清空当前
                        $(".calculatedMeasureList li.clickMeasureLi").remove();
                        //添加新的
                        self.workspace.query.helper.addCalculatedMeasure(m);
                        this.addVirtualLi(measure_name);
                        self.workspace.sync_query();
                        //更换当前显示
                    }

                    // this.close();
                }else{
                    //编辑(一种是已有编辑一种是新添加编辑还有一种真的重名)
                    if($(".calculatedMeasureList li.unSaved").length>0){
                        //不添加新的
                    }else{
                        var m = { name: measure_name, formula: measure_formula, properties: {}, uniqueName: "[Measures]." + measure_name };
                        if (measure_format) {
                            m.properties.FORMAT_STRING = measure_format;
                        }
                        //原来的删掉
                        var clickedName = $(".calculatedMeasureList li.clickMeasureLi").text();
                        for(var i=0;i< this.workspace.query.model.queryModel.calculatedMeasures.length;i++){
                            if(this.workspace.query.model.queryModel.calculatedMeasures[i].name == clickedName){
                                this.workspace.query.model.queryModel.calculatedMeasures.splice(i,1);
                            }
                        }
                        //TODO清空当前
                        $(".calculatedMeasureList li.clickMeasureLi").remove();
                        //添加新的
                        self.workspace.query.helper.addCalculatedMeasure(m);
                        this.addVirtualLi(measure_name);
                        self.workspace.sync_query();
                        //更换当前显示
                    }

                }


            }



        return false;
    },

    error: function () {
        $(this.el).find('dialog_body')
            .html("Could not add new folder");
    },

    addMathOperatorToCalculationField: function (event) {
        var mathOperator = ' ' + event.target.value + ' ';
        $(".measureFormula").val($(".measureFormula").val() + mathOperator);
    },

    addMeasureToCalculationField: function (event) {
        var measureName = this.$("#Measures option:selected").text();
        measureName = this.surroundWithSquareBrackets("Measures") + '.' + this.surroundWithSquareBrackets(measureName);
        $(".measureFormula").val($(".measureFormula").val() + measureName);
        this.resetSelectDropdown();
    },

    surroundWithSquareBrackets: function (text) {
        return '[' + text + ']';
    },

    resetSelectDropdown: function () {
        document.getElementById("Measures").selectedIndex = 0;
    }
});
