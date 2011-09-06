function initGui() {
    // see popup-ui.js
    _initGui();
}
/**
 * 
 */
function initContent() {
    log("opening the popup", "POP", DEBUG);
    // load shows into gui

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

}
function refreshContent() {
    // deleting all last call times
    age.clear();
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
        }, lastFor/2);
    }, lastFor/2); // first pull interval
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

var closeWindow = false;
var lastOpened = age.getItem("lastOpened");

function openSBPage() {
    chrome.tabs.create( { url : getUrl() });
    closeWindow = true;
    window.close();
}

if (lastOpened > 0) {
    if (NOW - lastOpened < 700) {
        openSBPage();
    }
}

if (!closeWindow) {
    age.setItem("lastOpened", NOW);
    // this comes before the bottom one
    $(document).ready(function() {
        initGui();
        initContent();
    });
    // this is called after the above one
    window.onload = function() {
        // what can we do here ?
    };
}
