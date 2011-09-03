var historyTimer;
var msgTimer;
var futureTimer;
/**
 * start the refresh timer or not set it
 */
function setHistoryTimer() {
    setSettings();
    var refreshRate = settings["config_refresh_rate"] * 1000 * 60;
    if (refreshRate > 0) {
        log("Will refresh from SickBeard every " + settings["config_refresh_rate"] + " min.", "BAK", INFO);
        historyTimer = setInterval(refreshHistory, refreshRate);
    } else {
        if (historyTimer)
            clearInterval(historyTimer);
        log("Will NOT refresh from SickBeard automatically (refresh disabled in options).", "BAK", INFO);
    }
}

function setMSGTimer(rate) {
    setSettings();
    if (msgTimer)
        clearInterval(msgTimer);
    if (!rate)
        rate = settings["config_notification_default_rate"] * 1000;
    if (rate > 0) {
        log("Will pull notifications from SickBeard every " + rate + " ms.", "BAK", INFO);
        msgTimer = setInterval(refreshMSG, rate);
    } else {
        log("Will NOT pull notifications from SickBeard automatically (refresh disabled in options).", "BAK", INFO);
    }
}
// TODO: use the normal refresh rate! not notifications
function setFutureTimer(rate) {
    setSettings();
    if (futureTimer)
        clearInterval(futureTimer);
    if (!rate)
        rate = settings["config_notification_default_rate"] * 1000;
    if (rate > 0) {
        log("Will pull future / badge info from SickBeard every " + rate + " ms.", "BAK", INFO);
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
    genericRequest(params, null, genericResponseError, 0, null); // timeout disabeld

}
function refreshMSG() {
    var params = new Params();
    params.cmd = "sb.getmessages";
    genericRequest(params, msgCallback, genericResponseError, 0, null); // timeout disabeld

}

function refreshFuture() {
    // TODO: implement
    log("refresh futur not FULLY implmented", "BAK", WARNING);

    var params = new Params();
    params.cmd = "future";
    genericRequest(params, setBadge, genericResponseError, 0, null); // timeout disabeld

}
function msgCallback(data, params) {
    $.each(data, function(k, value) {
        var notification = webkitNotifications.createNotification('images/icon48.png', // icon url - can be relative
        value.title, // notification title
        stripHtmlTags(value.message) // notification body text
        );

        notification.show();
        // timeout to hide the notifications 0 = always display
        if (settings["config_notification_timeout"] > 0)
            window.setTimeout(function() {
                notification.cancel();
            }, settings["config_notification_timeout"]);
    });
    if (data.length > 0)
        setMSGTimer();
}

function setBadge(data, params) {
    if (data.missed.length > 0) {
        chrome.browserAction.setBadgeText( { text : "" + data.missed.length });
        chrome.browserAction.setBadgeBackgroundColor( { color : [ 255, 0, 0, 100 ] });
    } else if (data.missed.today > 0) {
        chrome.browserAction.setBadgeText( { text : "" + data.today.length });
        chrome.browserAction.setBadgeBackgroundColor( { color : [ 255, 0, 0, 100 ] });
    } else {
        chrome.browserAction.setBadgeText( { text : "" });
    }

}

function reloadBackgroundPage() {
    window.location.reload();
}

setHistoryTimer();
setMSGTimer();
setFutureTimer();

if (settings["config_chromeToGrowl_use"])
    chrome2growl.init(settings["config_chromeToGrowl_host"], settings["config_chromeToGrowl_icon_path"]);
