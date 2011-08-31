var gTimer;
/**
 * start the refresh timer or not set it
 */
function setTimer() {
    var refreshRate = settings["config_refresh_rate"]*1000*60;
    if (refreshRate > 0) {
        console.log("Will refresh from SickBeard every " + refreshRate + " ms.");
        gTimer = setInterval(refresh, refreshRate);
    } else {
        if (gTimer)
            clearInterval(gTimer);
        console.log("Will NOT refresh from SickBeard automatically (refresh disabled in options).");
    }
}

function refresh() {
    // TODO: implement
    log("refresh not implmented","BAK",WARNING);
    return;
}

setTimer();