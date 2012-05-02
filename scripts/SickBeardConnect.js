
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
function checkDomain(domain){
    var url = ""+window.location;
    var regex = new RegExp(domain+"\.", "g");
    return url.match(regex);
}
function getCurrentTVDBID(){
    var tvdbid = 0;

    if(checkDomain('trakt'))
        tvdbid = document.getElementById("meta-tvdb-id").value;
    else if(checkDomain('thetvdb'))
        tvdbid = get_GET_param('id');
    
    return tvdbid;
    
}
function getCurrentName(){
    var name = "";

    if(checkDomain('trakt'))
        name = document.getElementsByTagName("h2")[0].innerHTML;
    else if(checkDomain('thetvdb'))
        name = document.getElementsByTagName("h1")[0].innerHTML;
    
    return name;
    
}

var haveShow = false;
function initGui(){

    var navbar, newElement;
    var addToText = '<a class="addTo" href="#"></a>';

    var close;
    var popup = create('div', {
      id : popupId,
      style: 'background: url("'+bg+'"); display: none;'
    });
    var addForm = create('div',{
        id: 'addForm'
    });
    var curTVDBID = getCurrentTVDBID();
    var curName = getCurrentName();

    chrome.extension.sendRequest({cmd: "own", tvdbid: curTVDBID
        },function(response) {
            if(response.result){
                haveShow = true;
                popup.style.background = '#C7DB39';
            }else{
                popup.style.background = 'url("'+bg+'")';
            }
    });
    chrome.extension.sendRequest({activate: "yesORno"},
        function(response) {
             if(response.result){
                 popup.style.display = 'block';
             }
         }
     );
    addForm.appendChild(create("span",{innerHTML:"Q:"}));
    addForm.appendChild(_buildSelect('sb_quality',{ 'Default': '',
                                                    'SD':'sdtv|sddvd',
                                                    'HD':'hdtv|hdwebdl|hdbluray',
                                                    'ANY':'sdtv|sddvd|hdtv|hdwebdl|hdbluray|unknown'}));
    addForm.appendChild(create('br',{}));

    addForm.appendChild(create("span",{innerHTML:"S:"}));
    addForm.appendChild(_buildSelect('sb_initial_status',{'Default':'',
                                                        'Wanted':'wanted',
                                                        'Skipped':'skipped',
                                                        'Ignored':'ignored',
                                                        'Archived':'archived'
    }));
    addForm.appendChild(create('br',{}));
    addForm.appendChild(create('input',{
        type: 'button',
        value: 'Add',
        onclick: function(){
            var curQ = getQ();
            var curS = getS();
            addForm.innerHTML = 'Loading <img src="' + loading + '" />';
            chrome.extension.sendRequest({cmd: "show.addnew",
                                        tvdbid:curTVDBID,
                                        quality:curQ,
                                        status:curS
                                        },function(response) {
                                            if(response.result){
                                                popup.innerHTML = '<img src="' + yes + '" />'+response.name+' was added';
                                                popup.style.background = '#C7DB39';
                                            }else{
                                                popup.innerHTML = 'Could not add the show';
                                                if(response.msg)
                                                    popup.innerHTML += ': '+response.msg;
                                            }
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


    chrome.extension.onRequest.addListener(
        function(request, sender, sendResponse) {
                console.log(sender.tab ?
                        "from a content script:" + sender.tab.url :
                        "from the extension");
                if(request.show == "get"){
                    sendResponse({tvdbid: curTVDBID,
                                    name: curName});
                }else if(request.own == "set"){
                    popup.style.background = '#C7DB39';
                    haveShow = true;
                } else
                    sendResponse({}); // snub them.
    });


}
function editShow(){}

var popupId = 'sickbeardc';
initGui();

