var gTimer;
/**
 * start the refresh timer or not set it
 */
function setTimer() {
	var refreshRate = getRefreshRate();
	if (refreshRate > 0) {
		console
				.log("Will refresh from SickBeard every " + refreshRate
						+ " ms.");
		gTimer = setInterval(refresh, refreshRate);
	} else {
		if (gTimer)
			clearInterval(gTimer)
		console
				.log("Will NOT refresh from SickBeard automatically (refresh disabled in options).");
	}
}

console.log(localStorage["sb_url"])


function refresh() {
	//TODO: implement
	return;
}