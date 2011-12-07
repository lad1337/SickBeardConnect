
var msgTimer;
var futureTimer;

var connectionStatus = false;

var defaultSettings = { "sb_url" : "",
        "sb_api_key": "",
        "sb_username": "",
        "sb_password": "",
        "config_log_lvl" : 20,
        "config_width" : "medium",
        "config_tab_animation" : true,
        "config_images_banner" : false,
        "config_images_future" : "none",
        "config_icon_badge" : "auto",
        "config_history_filter" : "both",
        "config_addshow": "both",
        "config_switchToShow": true,
        "config_section": 'auto',
        "config_refresh_rate" : 5,
        "config_notification_timeout" : 4,
        "config_notification_default_rate" : 20,
        "config_chromeToGrowl_use" : false,
        "config_chromeToGrowl_icon_path" : "" };
var settings = new Store("settings", defaultSettings); // globaly used
var cache = new Store("cache");
var age = new Store("age");


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
        log("Will pull future / badge info from SickBeard every " + settings.getItem("config_refresh_rate") + " min.", "BAK", INFO);
        refreshFuture();
        msgTimer = setInterval(refreshFuture, rate);
    } else {
        log("Will NOT pull future / badge info from SickBeard automatically (refresh disabled in options).", "BAK", INFO);
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

function testConnection(){
    log("Testing connection","BAK",INFO);
    var params = new Params();
    params.cmd = "sb.ping";
    genericRequest(params, connectionEstablished, noConnection, 0, null); // timeout disabeld
}

function connectionEstablished(){
    connectionStatus = true;
}

function noConnection(){
    connectionStatus = false;
}

function reloadBackgroundPage() {
    window.location.reload();
}

setMSGTimer();
setFutureTimer();
//testConnection();

if (settings.getItem("config_chromeToGrowl_use")){
    chrome2growl.init(settings.getItem("config_chromeToGrowl_host"), settings.getItem("config_chromeToGrowl_icon_path"));
    var chrome2growlTImmer = setInterval(function() {
        chrome2growl.reconnect();
    }, 30000);

}