
var msgTimer;
var futureTimer;
var profileSwitchTimer;

var profiles = new ProfileManager();

var connectionStatus = false;
var connectionStatusProfile = {}
var apiVersion = 0;

chrome.extension.onRequest.addListener(
        function(request, sender, sendResponse) {
          console.log(sender.tab ?
                      "from a content script:" + sender.tab.url :
                      "from the extension","MSG", DEBUG);
          console.log(request,"MSG", DEBUG);
          if (request.settings == "all")
              sendResponse({url: getApiUrl()});
          else if(request.cmd == "show.addnew"){
              sendFail = function(response,params){sendResponse({'result':false,'msg':response.message});};
              sendSuccess = function(response,params){
                      sendResponse({'result':true,'name':response.data.name});
                  };
              var params = new Params();
              params.cmd = "show.addnew";
              params.tvdbid = request.tvdbid;
              params.initial = request.quality;
              params.status = request.status;
              age.clear();
              genericRequest(params, sendSuccess, sendFail, 0, null);
          }else if(request.cmd == "own"){
              succescallback = function(data,param){
                  if(data['data'])
                      data = data['data'];
                  
                  var showList = {};
                  $.each(data, function(name, show) {
                      showList[show.tvdbid] = name;
                  });
                  cache.setItem("shows",showList);
                  var own = typeof showList[param.tvdbid] !== 'undefined';
                  sendResponse({'result':own});
              };
              sendUpdatedShowListRespaonse(request,succescallback);
          }else if(request.activate == "yesORno"){
              var addshowset = settings.getItem('config_addshow');
              sendResponse({'result':(addshowset == 'inpage' || addshowset == 'both')});
          }
          else
            sendResponse({}); // snub them.
        });


function setMSGTimer(rate) {
    if (msgTimer)
        clearInterval(msgTimer);
    if (!rate)
        rate = settings.getItem("config_notification_default_rate") * 1000;
    if (rate > 0) {
        log("Will pull notifications from SickBeard every " + settings.getItem("config_notification_default_rate") + " s.", "BAK", INFO);
        msgTimer = setInterval(refreshMSG, rate);
    } else {
        log("Will NOT pull notifications from SickBeard automatically (refresh disabled in options).", "BAK", INFO);
    }
}

function setFutureTimer(rate) {
    if (futureTimer)
        clearInterval(futureTimer);
    if (!rate)
        rate = settings.getItem("config_refresh_rate") * 1000 * 60;
    if (rate > 0) {
        log("Will pull future / badge info from SickBeard every " + (rate / 1000 )/ 60 + " min.", "BAK", INFO);
        refreshFuture();
        futureTimer = setInterval(refreshFuture, rate);
    } else {
        log("Will NOT pull future / badge info from SickBeard automatically (refresh disabled in options).", "BAK", INFO);
    }
}

function setProfileSwitchTimer(rate) {
    if (profileSwitchTimer)
        clearInterval(profileSwitchTimer);
    else
        checkProfileConnections();
    if (!rate)
        rate = settings.getItem("profile_switch_check") * 1000 * 60;
    if (rate > 0) {
        log("Will check profile connections every " + (rate / 1000 )/ 60 + " min.", "BAK", INFO);
        profileSwitchTimer = setInterval(checkProfileConnections, rate);
    } else {
        log("Will NOT check profile connections automatically (check disabled in options).", "BAK", INFO);
    }
}

function refreshHistory() {
    // TODO: implement
    log("refresh history not FULLY implmented", "BAK", WARNING);

    var params = new Params();
    params.cmd = "history";
    genericRequest(params, null, null, 0, null); // timeout disabeld

}
function refreshMSG() {
    var params = new Params();
    params.cmd = "sb.getmessages";
    genericRequest(params, msgCallback, null, 0, null); // timeout disabeld

}

function refreshFuture() {
    // TODO: implement
    log("refresh futur not FULLY implmented", "BAK", WARNING);

    var params = new Params();
    params.cmd = "future";
    genericRequest(params, setBadge, null, 0, null); // timeout disabeld

}
function checkProfileConnections(){
    if(settings.getItem('in_config') || settings.getItem('in_popup')){
        log("Not Checking Profiles connections because popup or config is open", "BAK", DEBUG);
        return false;
    }
    log("Checking all Profiles connections", "BAK", DEBUG);
    connectionStatusProfile = {};
    var allProfiles = profiles.getAll();
    $.each(allProfiles, function(name, curP) {
        if(curP.profile_priority){
            console.log(curP);
            testConnection(name);
        }
    });

}

function msgCallback(response, params) {
    var data = response.data;
    $.each(data, function(k, value) {
        var notification = webkitNotifications.createNotification('images/icon48.png', // icon url - can be relative
        value.title, // notification title
        stripHtmlTags(value.message) // notification body text
        );

        notification.show();
        // timeout to hide the notifications 0 = always display
        if (settings.getItem("config_notification_timeout") > 0)
            window.setTimeout(function() {
                notification.cancel();
            }, settings.getItem("config_notification_timeout")*1000);
    });
    if (data.length > 0)
        setMSGTimer();
}

function setBadge(response, params) {
    console.log("setBadge",response);
    var data = response['data'];
    var mode = settings.getItem("config_icon_badge");

    if (data.missed.length > 0 && mode != "today") {
        chrome.browserAction.setBadgeText( { text : "" + data.missed.length });
        chrome.browserAction.setBadgeBackgroundColor( { color : [ 255, 0, 0, 100 ] });
    } else if (data.today.length > 0 && mode != "missed") {
        chrome.browserAction.setBadgeText( { text : "" + data.today.length });
        chrome.browserAction.setBadgeBackgroundColor( { color : [ 0, 255, 0, 100 ] });
    } else {
        chrome.browserAction.setBadgeText( { text : "" });
    }

}

function testConnection(profileName){
    var params = new Params();
    params.cmd = "sb";
    if(typeof profileName === "undefined"){
        log("Testing connection","BAK",INFO);
        genericRequest(params, connectionEstablished, noConnection, 0, null); // timeout disabeld
    }else{
        log("Testing connection for profile '"+profileName+"'","BAK",INFO);
        genericRequest(params,
                (function(response, params){connectionEstablishedForProfile(profileName);}),
                (function(response, params){noConnectionForProfile(profileName);}),
                0, null, profileName); // timeout disabeld
    }
}

function connectionEstablished(response, params){
    connectionStatus = true;
    apiVersion = response.data.api_version;
}

function connectionEstablishedForProfile(profileName){
    connectionStatusProfile[profileName] = true;
    checkProfileTestDone();
}

function noConnection(){
    connectionStatus = false;
    apiVersion = 0;
    console.log("noConnection", connectionStatus, apiVersion)
}

function noConnectionForProfile(profileName){
    connectionStatusProfile[profileName] = false;
    checkProfileTestDone();
}



function checkProfileTestDone(){
    var allProfiles = profiles.getAll();
    var toCompare = [];
    var testsNotDone = false;
    
    $.each(allProfiles, function(name, values) {
        if(values.profile_priority){
            if(!connectionStatusProfile.hasOwnProperty(name)){
                testsNotDone = true;
                return false;   
            }
            values.name = name;
            values.connectionStatus = connectionStatusProfile[name];
            toCompare.push(values);
        }
    });
    if(testsNotDone)
        return false;
    
    var sorted = toCompare.sort(profileCompare);
    console.log("sorted list",sorted)
    $.each(sorted, function(index, curP) {
       console.log(curP);
       if(curP.connectionStatus){
           var curActive = settings.getItem('profile_name');
           log("active profile: '"+curActive+"' new profile: '"+curP.name+"'","BAK",DEBUG);
           if(curActive != curP.name){
               log("automatic switching to "+curP.name,"BAK",INFO);
               switchProfile(curP.name);
           }else{
               log("no need for automatic switching to "+curP.name,"BAK",DEBUG);
           }
           return false;
        }
    });
}

function profileCompare(a, b){
    if (a.profile_priority < b.profile_priority)
        return 1;
     if (a.profile_priority > b.profile_priority)
       return -1;
     return 0;
}

function reloadBackgroundPage() {
    window.location.reload();
}


function switchProfile(profileName){
    profile = profiles.getProfile(profileName);
    
    settings.setItem('profile_name', profile.name);
    
    settings.setItem('sb_url', profile.values.sb_url);
    settings.setItem('sb_api_key', profile.values.sb_api_key);
    settings.setItem('sb_username', profile.values.sb_username);
    settings.setItem('sb_password', profile.values.sb_password);
    
    cache.clear();
    age.clear();
}

function migration(){

    console.log("migration: init check");
    
    var migrationLvl = settings.getItem('migration');
    if(typeof migrationLvl === undefined){
        settings.setItem('migration', 0);
    }

    // from version 0.1.17 -> 0.1.18
    if(settings.getItem('migration') < 1){
        console.log("migration: creating profile");
        settings.setItem('profile_name', 'Default');
        settings.setItem('profile_priority', 0);
        settings.setItem('profile_switch_check', 5);
        settings.setItem('profiles', getDefaultProfiles());
        profiles.syncActive();
        settings.setItem('migration', 1);
    }
}
migration();

setMSGTimer();
setFutureTimer();
setProfileSwitchTimer();
testConnection();
