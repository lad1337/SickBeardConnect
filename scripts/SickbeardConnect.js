
var sb_img_head_url = chrome.extension.getURL('images/icon48.png');
var no = chrome.extension.getURL('images/no16.png');
var yes = chrome.extension.getURL('images/yes16.png');
var bg = chrome.extension.getURL('images/bg.gif');
var loading = chrome.extension.getURL('images/throbber.svg');
 
function create() {
    switch (arguments.length) {
    case 1:
        var A = document.createTextNode(arguments[0]);
        break;
    default:
        var A = document.createElement(arguments[0]), B = arguments[1];
        for ( var b in B) {
            if (b.indexOf("on") == 0){
                A.addEventListener(b.substring(2), B[b], false);
            }
            else if (",style,accesskey,id,name,src,href,which,class".indexOf(","+ b.toLowerCase()) != -1){
                A.setAttribute(b, B[b]);
            }
            else{
                A[b] = B[b];
            }
        }
        for ( var i = 2, len = arguments.length; i < len; ++i){
            A.appendChild(arguments[i]);
        }
    }
    return A;
}
function get_GET_params() {
    var GET = new Array();
    if(location.search.length > 0) {
       var get_param_str = location.search.substring(1, location.search.length);
       var get_params = get_param_str.split("&");
       for(i = 0; i < get_params.length; i++) {
          var key_value = get_params[i].split("=");
          if(key_value.length == 2) {
             var key = key_value[0];
             var value = key_value[1];
             GET[key] = value;
          }
       }
    }
    return(GET);
 }
  
 function get_GET_param(key) {
    var get_params = get_GET_params();
    if(get_params[key])
       return(get_params[key]);
    else
       return false;
 }

function _buildSelect(curID, options){
    var select = create('select', {
        id: curID
    });
    for (key in options){
        select.appendChild(create('option',{
                innerHTML: key,
                value: options[key]
            }
        ));
    }
    return select;
}

function getQ(){
    var e = document.getElementById("sb_quality");
    return e.options[e.selectedIndex].value;
}
function getS(){
    var e = document.getElementById("sb_initial_status");
    return e.options[e.selectedIndex].value;
}

function getCurrentTVDBID(){
    var tvdbid = 0;
    //trakt.tv
    tvdbid = document.getElementById("meta-tvdb-id");
    if(tvdbid)
        return tvdbid.value;
    //tvdb
    tvdbid = get_GET_param('id');
    if(tvdbid)
        return tvdbid;
    return 0;
    
}

function initGui(){

    var navbar, newElement;
    var addToText = '<a class="addTo" href="#"></a>';
    var popupId = 'sickbeardc';
    var haveShow = false;
    var close;
    var popup = create('div', {
      id : popupId,
      style: 'background: url("'+bg+'")'
    });
    var addForm = create('div',{
        id: 'addForm'
    });

    chrome.extension.sendRequest({cmd: "own",
        tvdbid:getCurrentTVDBID()
        },function(response) {
            if(response.result){
                haveShow = true;
                popup.style.background = '#C7DB39';
                closeButton.onclick = function(){console.log('not implmented');};
            }else{
                popup.style.background = 'url("'+bg+'")';
            }
    });

    
    addForm.appendChild(_buildSelect('sb_quality',{'SD':'sdtv|sddvd',
                                                    'HD':'hdtv|hdwebdl|hdbluray',
                                                    'ANY':'sdtv|sddvd|hdtv|hdwebdl|hdbluray|unknown'}));
    addForm.appendChild(create('br',{}));
    addForm.appendChild(_buildSelect('sb_initial_status',{'Defauld':'',
                                                        'Wanted':'&status=wanted',
                                                        'Skipped':'&status=skipped',
                                                        'Ignored':'&status=ignored'
    }));
    addForm.appendChild(create('br',{}));
    addForm.appendChild(create('input',{
        type: 'button',
        value: 'add',
        onclick: function(){
            var curQ = getQ();
            var curS = getS();
            addForm.innerHTML = 'Loading <img src="' + loading + '" />';
            chrome.extension.sendRequest({cmd: "show.addnew",
                                        tvdbid:getCurrentTVDBID(),
                                        quality:curQ,
                                        status:curS
                                        },function(response) {
                                            if(response.result){
                                                popup.innerHTML = response.name+' was added <img src="' + yes + '" />';
                                                window.setTimeout(function(){close();popup.style.background = '#C7DB39';},2000);
                                            }else
                                                popup.innerHTML = 'Could not add the show';
            });
        }
    }));

    var addButton = create('a', {
        innerHTML: '<img src="' + sb_img_head_url + '" />',
        id: 'addTo',
        class: 'sbc',
        onclick: function(){
            if(!haveShow){
                popup.innerHTML = '';
                popup.appendChild(closeButton);
                popup.appendChild(addForm);
                popup.setAttribute("class", "inUse");
            }
        }
    }); //create
    
    close = function(){
        popup.innerHTML = '';
        popup.appendChild(addButton);
        popup.setAttribute("class", "");
    
    };
    
    var closeButton = create('a', {
        innerHTML: '<img src="' + no + '" />',
        class: 'closeSBC',
        onclick: close
    });

    var fileref=document.createElement("link");
    fileref.setAttribute("rel", "stylesheet");
    fileref.setAttribute("type", "text/css");
    fileref.setAttribute("href", chrome.extension.getURL('css/sbconnect_content.css'));
    document.getElementsByTagName("head")[0].appendChild(fileref)
    popup.appendChild(addButton);
    document.body.appendChild(popup);
}

initGui();

