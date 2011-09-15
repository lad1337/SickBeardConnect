
var msgTimer;
var futureTimer;

var connectionStatus = false;

var defaultSettings = { "sb_url" : "",
        "sb_api_key": "",
        "sb_username": "",
        "sb_password": "",
        "config_log_lvl" : 20, "config_width" : "medium",
        "config_tab_animation" : true,
        "config_images_banner" : false,
        "config_icon_badge" : "auto",
        "config_refresh_rate" : 5,
        "config_notification_timeout" : 4,
        "config_notification_default_rate" : 20,
        "config_chromeToGrowl_use" : false,
        "config_chromeToGrowl_icon_path" : "" };
var settings = new Store("settings", defaultSettings); // globaly used
var cache = new Store("cache");
var age = new Store("age");


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
function msgCallback(data, params) {
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

function setBadge(data, params) {
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