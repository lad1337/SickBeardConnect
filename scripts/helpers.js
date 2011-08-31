var settings = new Store("settings", { "sb_url" : "http://localhost:8081", "sb_api_key" : 1234, "config_log_lvl" : 10, "config_width" : "medium", "config_tab_animation" : false, "config_refresh_rate":5 });
settings = settings.toObject();

var NOW = $.now();

function getRefreshRate() {
    return parseInt(settings["refresh_rate"]) * 1000;
}

function getUrl() {
    return checkEndSlash(settings["sb_url"]);
}

function getApiUrl() {
    return getUrl() + "api/" + settings["sb_api_key"];
}

/**
 * issue a request to sickbeard api keeps log of requests
 * 
 * @param params
 * @param succes_callback
 * @param error_callback
 */
function genericRequest(params, succes_callback, error_callback, timeout, timeout_callback) {
    // var paramString = getParamString(params);

    log("New Req for: " + params, "REG", DEBUG);
    if (localStorage["html_" + params])
        if (NOW - parseInt(localStorage["lastcall_" + params]) < timeout) {
            log("Not refreshing for reg: " + params + ". Let the timeout_callback handle this", "REQ", INFO);
            timeout_callback(params);
            return;
        }
    var apiUrl = getApiUrl();
    $.ajax( { type : "GET", url : apiUrl, data : params, dataType : 'json', success : function(data) {
        localStorage["lastcall_" + params] = NOW;
        checkForError(data, params, succes_callback, error_callback);
    }, error : function(data) {
        genricRequestError(data, params, succes_callback, error_callback);
    } });
}

/**
 * checks id data has the attr "error" if not noErrorCallback is called with data and paramString as arguments
 * 
 * @param data
 * @param paramString
 * @param succes_callback
 */
function checkForError(data, params, succes_callback, error_callback) {
    if (data.error) {
        log("Reg successful for BUT WITH ERROR: " + params, "REG", DEBUG);
        if (shouldLvlBeLoged(DEBUG))
            console.log(data);
        error_callback(data, params);
    } else {
        log("Reg successful for: " + params, "REG", DEBUG);
        if (shouldLvlBeLoged(DEBUG))
            console.log(data);
        localStorage["json_" + params] = JSON.stringify(data);
        succes_callback(data, params);
    }
}
/**
 * log the request error
 * 
 * @param data
 */
function genricRequestError(data, params, succes_callback, error_callback) {
    log("request error", "REQ", ERROR);
    console.log(data);
    log("trying to load old data", "REQ", INFO);
    if (localStorage["json_" + params]) {
        data = JSON.parse(localStorage["json_" + params]);
        checkForError(data, params, succes_callback, error_callback);
        
        addErrorMsg("No connection! Using old data.",WARNING);
    }else{
        log("could not load old request data", "REQ", ERROR);
        addErrorMsg("No connection and NO old data!",ERROR);
    }

}

/**
 * log the error response
 * 
 * @param data
 * @param params
 */
function genericResponseError(data, params) {
    log("an error in response for reg: " + params, "REQ", WARNING);
    console.log(data);
}

/**
 * 
 * @returns {Params}
 */
function Params() {

}

/**
 * create a simple string from the param dict/obj the string looks kinda like a get request
 * 
 * @param params
 * @returns {String}
 */
Params.prototype.toString = function() {
    var string = "";
    $.each(this, function(key, value) {
        if (key != "toString")
            string += "?" + key + "=" + value;
    });
    return string;
};

/**
 * @param tvdbid
 * @returns {String}
 */
function constructShowPosterUrl(tvdbid) {
    // /showPoster/?show=73741&amp;which=poster
    var imgPart = "showPoster/?show=" + tvdbid + "&which=poster";
    return getUrl() + imgPart;

}
/**
 * @param tvdbid
 * @returns {String}
 */
function constructShowBannerUrl(tvdbid) {
    // /showPoster/?show=73741&amp;which=poster
    var imgPart = "showPoster/?show=" + tvdbid + "&which=banner";
    return getUrl() + imgPart;

}
/**
 * @param provider
 * @returns {String}
 */
function constructProviderImgUrl(provider) {
    provider = provider.replace(/ /gi, "_").toLowerCase();

    var imgPart = "images/providers/" + provider + ".gif";
    return getUrl() + imgPart;
}

var DEBUG = 10;
var INFO = 20;
var WARNING = 30;
var ERROR = 40;
var logLvlString = {};
logLvlString["DEBUG"] = DEBUG;
logLvlString["INFO"] = INFO;
logLvlString["WARNING"] = WARNING;
logLvlString["ERROR"] = ERROR;
/**
 * generic logger function
 * 
 * @param msg
 *            the msg to display
 * @param sections
 *            section the msg is from
 * @param lvl
 *            log lvl
 */
function log(msg, sections, lvl) {
    if (shouldLvlBeLoged(lvl)) {
        var curLogLvl = "UNKNOWN";
        $.each(logLvlString, function(key, value) {
            if (value == lvl)
                curLogLvl = key;
        });
        console.log($.now() + "-[" + curLogLvl + "-" + sections + "]: " + msg);
    }
}

function shouldLvlBeLoged(lvl) {
    return lvl >= parseInt(settings["config_log_lvl"]);

}

// http://www.electrictoolbox.com/pad-number-zeroes-javascript-improved/
function pad(n, len) {
    s = n.toString();
    if (s.length < len) {
        s = ('0000000000' + s).slice(-len);
    }

    return s;
}

function checkEndSlash(input) {
    if (input.charAt(input.length - 1) == '/') {
        return input;
    } else {
        var output = input + '/';
        return output;
    }
}

var monthNames = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];
function getNiceHistoryDate(date) {
    var dateSplit = date.split("-");
    var yeahr = dateSplit[0];
    var month = dateSplit[1];
    var dayAndTime = dateSplit[2].split(" ");
    var day = dayAndTime[0];
    var time = dayAndTime[1];

    return day + ". " + monthNames[parseInt(month, 10) - 1] + " " + time;

}

function onRequest(request, sender, callback) {
    console.log(request);
    if (request.action == 'getJSON') {
        $.getJSON(request.url, callback);
    }
    if (request.action == 'ajax') {
        $.ajax( { type : request.type, url : request.url, async : async, success : callback });
    }
    if (request.action == 'get') {
        $.get(request.url, callback);
    }
    if (request.action == 'post') {
        $.post(request.url, request.data, callback);
    }
}
chrome.extension.onRequest.addListener(onRequest);
