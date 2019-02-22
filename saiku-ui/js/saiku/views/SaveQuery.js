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
 * The save query dialog
 */
var SaveQuery = Modal.extend({
    type: "save",
    closeText: "Save",

    events: {
        'click': 'select_root_folder', /* select root folder */
        'click .dialog_footer a' : 'call',
        'submit form': 'save',
        'click .query': 'select_name',
        'click li.folder': 'toggle_folder',
        'keyup .search_file' : 'search_file',
        'click .cancel_search' : 'cancel_search'
    },
    buttons: [
        { text: "Cancel", method: "close" ,class:"yhncancel"},
        { text: "确定", method: "save",class:"yhnsave" }
    ],
    folder_name: null,
    file_name: null,
    initialize: function(args) {
        /*初始化显示上次保存路径和名字*/
        if(args.query.attributes.hasOwnProperty("name")){
            //二次保存

            var fullName = args.query.attributes.name;
            var myRealName = fullName.split("/").pop().split(".")[0];
            var myPath = fullName.split("/").slice(0,fullName.split("/").length-1).join("/");
        }else{
            //第一次打开
            if(args.query.attributes.hasOwnProperty("file")){
                var fullName = args.query.attributes.file;
                var myRealName = fullName.split("/").pop().split(".")[0];
                var myPath = fullName.split("/").slice(0,fullName.split("/").length-1).join("/");
            }
        }

        // Append events
        var self = this;
        var name = "";
        var full_path = "";
        var fileName = myRealName;

        var filePath = myPath;

        this.file_name = myRealName ? myRealName:"";
        this.query = args.query;
        this.message = _.template(
            // "<label id='save_query_form'>" +
            // "<label for='name' class='i18n'>文件名</label>" +
            // "<input type='text' name='fileName' class='fileName' value='<%= fileName %>' />" +
            // "<label class='i18n'>路径:</label>" +
            // "<label type='text' name='path'><%= filePath %></label></label>" +
            // "<div class='RepositoryObjects i18n'>"+
            // "<div class='saiku-div-loading' style='display:block;'></div>"+
            //     // "<span class='i18n'>Loading...</span>"+
            // "</div>" +
            // "</form>"
            "<div id='save_query_form'>"+
                "<div style='margin-bottom:10px'>"+
                    "<label for='name' class='i18n'>文件名</label>"+
                    "<input type='text' name='fileName' class='fileName' value='<%= fileName %>' />"+
                "</div>"+
                "<div>"+
                    "<label class='i18n'>路径:</label>"+
                    "<label type='text' name='path' style='margin-left:18px;color: #666'><%= filePath %></label></label>"+
                "</div>"+
                "<div class='RepositoryObjects i18n'>"+
                "<div class='saiku-div-loading' style='display:block;'></div>"+
                    // "<span class='i18n'>Loading...</span>"+
                "</div>"+
                "</form>"+
            "</div>"
          )({ name: full_path ,fileName:fileName,filePath:filePath});

        _.extend(this.options, {
            title: "Save query"
        });

        // Initialize repository
        this.repository = new Repository({}, { dialog: this });

        this.bind( 'open', function( ) {
            var height = ( $( "body" ).height() / 2 ) + ( $( "body" ).height() / 6 );
            height = 260;
            var perc = (((($( "body" ).height() - 600) / 2) * 100) / $( "body" ).height());
            $(this.el).find('.RepositoryObjects').height( height );
            $(this.el).dialog( 'option', 'position', 'center' );
            $(this.el).parents('.ui-dialog').css({ width: "380px", top: perc+'%' });
            self.repository.fetch( );
        } );
        // Maintain `this`
        _.bindAll( this, "copy_to_repository", "close", "toggle_folder", "select_name", "populate", "set_name", "cancel_search" );

        // fix event listening in IE < 9
        if(isIE && isIE < 9) {
            $(this.el).find('form').on('submit', this.save);
        }


    },
    dataFilter:function(inputData){
        /*null判断*/
        if(!inputData){
            return null;
        }
        /*首先过滤不需要的大目录*/
        var tempArray = [];
        for(var i=0;i<inputData.length;i++){
            if(inputData[i].name == "homes" || inputData[i].name == "home" || inputData[i].name == "public"){
                if(inputData[i].name == "home"){
                    inputData[i].name = "用户目录";
                }
                if(inputData[i].name == "public"){
                    inputData[i].name = "共享目录";
                }
                tempArray.push(inputData[i]);

            }
        }
        Array.prototype.remove = function(val) {
            var index = this.indexOf(val);
            if (index > -1) {
                this.splice(index, 1);
            }
        };
        /*再将文件回调过滤掉*/
        var callBackFilter = function(tempchild){
            var deleteArray = [];
            for(var i=0;i<tempchild.length;i++){
                if(tempchild[i].type == "FILE"){
                    deleteArray.push(tempchild[i]);
                }else{
                    if(tempchild[i].repoObjects.length!=0){
                        callBackFilter(tempchild[i].repoObjects);
                    }
                }
            }
            for(var j=0;j<deleteArray.length;j++){
                tempchild.remove(deleteArray[j]);
            }
        }
        callBackFilter(tempArray);
        return tempArray;
    },
    populate: function( repository ) {
        var transformedData = this.dataFilter(repository);

        $( this.el ).find( '.RepositoryObjects' ).html(
            _.template( $( '#template-repository-objects' ).html( ) )( {
                repoObjects: transformedData
            } )
        );
    },
    select_root_folder: function( event ) {
        var isNameInputField = $( event.target ).attr( 'name' ) === 'name';
        if( !isNameInputField ) {
            this.unselect_current_selected_folder( );
        }
    },
    toggle_folder: function( event ) {
        var $target = $( event.currentTarget );
        this.unselect_current_selected_folder( );
        $target.children('.folder_row').addClass( 'selected' );
        var f_name = $target.find( 'a' ).attr('href').replace('#', '');
        this.set_name(f_name, this.file_name);
        var $queries = $target.children( '.folder_content' );
        var isClosed = $target.children( '.folder_row' ).find('.sprite').hasClass( 'collapsed' );
        if( isClosed ) {
            $target.children( '.folder_row' ).find('.sprite').removeClass( 'collapsed' );
            $queries.removeClass( 'hide' );
        } else {
            $target.children( '.folder_row' ).find('.sprite').addClass( 'collapsed' );
            $queries.addClass( 'hide' );
        }
        return false;
    },
    set_name: function(folder, file) {
        if (folder !== null) {
            this.folder_name = folder;
            $(this.el).find('label[name="path"]').text( this.folder_name );
        }
        if (file !== null) {
            $(this.el).find('input[name="fileName"]').val( this.file_name);
        }


    },
    // XXX - duplicaten from OpenQuery
    search_file: function(event) {
        var filter = $(this.el).find('.search_file').val().toLowerCase();
        var isEmpty = (typeof filter == "undefined" || filter === "" || filter === null);
        if (isEmpty || event.which == 27 || event.which == 9) {
            this.cancel_search();
        } else {
            if ($(this.el).find('.search_file').val()) {
                $(this.el).find('.cancel_search').show();
            } else {
                $(this.el).find('.cancel_search').hide();
            }
            $(this.el).find('li.query').removeClass('hide');
            $(this.el).find('li.query a').filter(function (index) {
                return $(this).text().toLowerCase().indexOf(filter) == -1;
            }).parent().addClass('hide');
            $(this.el).find('li.folder').addClass('hide');
            $(this.el).find('li.query').not('.hide').parents('li.folder').removeClass('hide');
            $(this.el).find( 'li.folder .folder_row' ).find('.sprite').removeClass( 'collapsed' );
            $(this.el).find( 'li.folder .folder_content' ).removeClass('hide');
        }
        return false;
    },
    cancel_search: function(event) {
        $(this.el).find('input.search_file').val('');
        $(this.el).find('.cancel_search').hide();
        $(this.el).find('li.query, li.folder').removeClass('hide');
        $(this.el).find( '.folder_row' ).find('.sprite').addClass( 'collapsed' );
        $(this.el).find( 'li.folder .folder_content' ).addClass('hide');
        $(this.el).find('.search_file').val('').focus();
        $(this.el).find('.cancel_search').hide();

    },
    select_name: function( event ) {
        var $currentTarget = $( event.currentTarget );
        this.unselect_current_selected_folder( );
        $currentTarget.parent( ).parent( ).has( '.folder' ).children('.folder_row').addClass( 'selected' );
        var name = $currentTarget.find( 'a' ).attr('href').replace('#','');
        this.set_name(null, name);
        return false;
    },
    unselect_current_selected_folder: function( ) {
        $( this.el ).find( '.selected' ).removeClass( 'selected' );
    },
    save: function(event) {
        // Save the name for future reference
        var foldername = ''; 
		var self = this;
        var fileName = $(this.el).find('input[name="fileName"]').val()
        var filePath = $(this.el).find('label[name="path"]').text()+"/";
        var judgePath = $(this.el).find('label[name="path"]').text();
        var reg = /[\\/:;\?\+#%&\*\|\[\]]+/;

        fileName = $.trim(fileName);

        if(fileName === ''){
            alert("请输入文件名");
            return;
        }

        if(reg.test(fileName)){
            alert("文件名不能包含下列字符：\/:;?+#%&*|[]");
            return;
        }

        if(judgePath === ''){
            alert("请选择存储路径");
            return;
        }

        var name = filePath+fileName;
        if (name !== null && name.length > 0) {
            Saiku.loading(true);
            this.repository.fetch({
                success: function(collection, response){
                    Saiku.loading(false);
                    var paths=[];
                    paths.push.apply(paths, self.get_files(response));
                    if(paths.indexOf(name)> -1 && self.query.get("name")!=name){
                        new OverwriteModal({name: name, foldername: foldername, parent: self}).render().open();
                    }
                    else{
                        self.query.set({ name: name, folder: foldername });
                        self.query.trigger('query:save');
                        self.copy_to_repository();
                        event.stopPropagation();
                        event.preventDefault();
                        return false;
                    }
                },
                error:function(){
                    Saiku.loading(false);
                }
            });
        } else {
            alert("You need to enter a name!");
        }
        
        return false;
    },

	save_remote: function(name, foldername, parent){
		parent.query.set({ name: name, folder: foldername });
		parent.query.trigger('query:save');
		parent.copy_to_repository();
		event.preventDefault();
		return false;
	},

	get_files: function(response){

		var self = this;
		var paths = [];
		_.each( response, function( entry ){
			if( entry.type === 'FOLDER' ) {
				paths.push.apply(paths, self.get_files(entry.repoObjects));
			}
			else{
				paths.push(entry.path);

			}
		});
			return paths;
	},
    copy_to_repository: function() {
        var self = this;
        var folder = this.query.get('folder');

        var file = this.query.get('name');
        file = file.length > 6 && file.indexOf(".saiku") == file.length - 6 ? file : file + ".saiku";
        file = folder + file;
        var error = function(data, textStatus, jqXHR) {
                if (textStatus && textStatus.status == 403 && textStatus.responseText) {
                    alert(textStatus.responseText);
                } else {
                    self.close();
                }
                return true;
        };

        // Rename tab
        this.query.workspace.tab.$el.find('.saikutab').text(file.replace(/^.*[\\\/]/, '').split('.')[0]);

        (new SavedQuery({
            name: this.query.get('name'),
            file: file,
            content: JSON.stringify(this.query.model)
        })).save({},{ success:  this.close, error: error, dataType: 'text'  });
    }
});
