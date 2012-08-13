
function initGui() {
    $("#open_sb").click(function(){openSBPage();});
    $("#extension_settings").click(function(){openSettings();});
    $("#refresh").click(function(){refreshContent();});
    
    // see popup-ui.js
    _initGui();
}
/**
 * 
 */
function initContent() {

    log("opening the popup", "POP", DEBUG);
    // load shows into gui

    //set flag to not auto change the profile while pop is open
    settings.setItem('in_popup', true);
    
    // set current profile
    setupProfileSwitcher();
    
    var params = new Params();
    params.cmd = "shows";
    params.sort = "name";
    genericRequest(params, showsBuild, genericResponseError, 300000, showsTimeout); // timeout 5 min

    var params = new Params();
    params.cmd = "future";
    genericRequest(params, futureBuild, genericResponseError, 60000, futureTimeout); // timeout 1 min

    var params = new Params();
    params.cmd = "history";
    genericRequest(params, historyBuild, genericResponseError, 60000, historyTimeout); // timeout 1 min
    
    var addshowset = settings.getItem('config_addshow');
    if((addshowset == 'popup' || addshowset == 'both'))
        pageTVDBID(injectAddNewShow);


}
function refreshContent() {
    // deleting all last call times
    age.clear();
    // reset view
    unlockShows = false;
    unlockFuture = false;
    unlockHistory = false;
    $("#contend").tabs('select', 0); // select first tab
    $('#shows-arc').accordion('activate', 0); // select first arc in shows
    $('#future-arc').accordion('activate', 0); // select first arc in future
    
    $("#loadContainer").show();
    initContent();

}

function listenForNotificationsFast(lastFor) {
    if (!lastFor)
        lastFor = 60000; // default to 1 min
    log("Will pull notifications from SickBeard faster for " + lastFor + " ms.", "POP", DEBUG);
    chrome.extension.getBackgroundPage().setMSGTimer(1000); // pull msgs every second
    window.setTimeout(function() {
        chrome.extension.getBackgroundPage().setMSGTimer(2000);// pull msgs every 2 seconds
        window.setTimeout(function() {
            chrome.extension.getBackgroundPage().setMSGTimer();// second pull interval
        }, lastFor / 2);
    }, lastFor / 2); // first pull interval
}

function injectAddNewShow(tvdbid, name){
    var showList = cache.getItem("shows");
    if(typeof showList[tvdbid] === 'undefined')
        buildAddShow(tvdbid, name);
}

function pageTVDBID(callback){
    var tvdbid;
    var name;
    chrome.tabs.getSelected(null, function(tab) {
        chrome.tabs.sendRequest(tab.id, {show: "get"}, function(response) {
            if(response.tvdbid){
                callback(response.tvdbid, response.name);
            }
        });
    });
}



function setPopupOwn(){
    chrome.tabs.getSelected(null, function(tab) {
        chrome.tabs.sendRequest(tab.id, {own: "set"}, function(response) {
            log(response,"POP",DEBUG);
        });
    });
}

function activateSection(){
    var section = settings.getItem('config_section');
    if(section == 'shows'){
        //$("#contend").tabs('select', 0);
        //$('#shows-arc').accordion('activate', 1);
        $('#future-arc').accordion('activate', cache.getItem('last_future_arc'));
    }else if(section == 'coming_m'){
        $("#contend").tabs('select', 1);
        $('#future-arc').accordion('activate', 0);
    }else if(section == 'coming_t'){
        $("#contend").tabs('select', 1);
        $('#future-arc').accordion('activate', 1);
    }else if(section == 'coming_s'){
        $("#contend").tabs('select', 1);
        $('#future-arc').accordion('activate', 2);
    }else if(section == 'coming_l'){
        $("#contend").tabs('select', 1);
        $('#future-arc').accordion('activate', 3);
    }else if(section == 'history'){
        $("#contend").tabs('select', 2);
        $('#future-arc').accordion('activate', cache.getItem('last_future_arc'));
    }else if(section == 'auto'){
        var tabIndex = cache.getItem('last_tab');
        $("#contend").tabs('select', tabIndex);
        if(tabIndex == 1){
            var arcIndex = cache.getItem('last_arc');
            $('#future-arc').accordion('activate', arcIndex);
        }else{
            $('#future-arc').accordion('activate', cache.getItem('last_future_arc'));
        }
    }
    
}


/**
 * open the show panel with the requested show info for the tvdbid
 * 
 * @param tvdbid
 */
function openShow(tvdbid) {
    var params = new Params();
    params.cmd = "show";
    params.tvdbid = tvdbid;
    genericRequest(params, showBuild, genericResponseError, 150000, showTimeout); // timeout 5 min
}

function displaySeaoson(tvdbid, season) {

    var params = new Params();
    params.cmd = "show.seasons";
    params.tvdbid = tvdbid;
    params.season = season;
    genericRequest(params, seasonBuild, genericResponseError, 150000, seasonTimeout); // timeout 5 min
}

var closeWindow = false;
var lastOpened = age.getItem("lastOpened");

function openSBPage() {
    chrome.tabs.create( { url : getUrl() });
    closeWindow = true;
    window.close();
}

function openSettings(){
    chrome.tabs.create({url: 'options.html'});
    window.close();
}

addEventListener("unload", function (event) {
    settings.setItem('in_popup', false);
}, true);


if (lastOpened > 0) {
    if (NOW - lastOpened < 700) {
        openSBPage();
        window.close();
    }
}
if (!closeWindow) {
    age.setItem("lastOpened", NOW);
    // this comes before the bottom one
    $(document).ready(function() {
        initGui();
        initContent();
    });
}else{
    window.close();
}

