
function initGui() {
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
    genericRequest(params, showsBuild, genricRequestError, 300000, showsTimeout); // timeout 5 min

    var params = new Params();
    params.cmd = "future";
    genericRequest(params, futureBuild, genricRequestError, 0, futureTimeout); // timeout 1 min -60000
}

/**
 * open the show pannel with the requested show info for the tvdbid
 * 
 * @param tvdbid
 */
function openShow(tvdbid) {
    var params = new Params();
    params.cmd = "show";
    params.tvdbid = tvdbid;
    genericRequest(params, showBuild, genricRequestError, 300000, showTimeout); // timeout 5 min
}

var lastOpened = parseInt(localStorage["lastOpened"]);
var closeWindow = false;
if (lastOpened > 0) {
    if (NOW - lastOpened < 700) {
        chrome.tabs.create( { url : getUrl() });
        closeWindow = true;
        window.close();
    }
}

if (!closeWindow) {
    localStorage["lastOpened"] = NOW;
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
