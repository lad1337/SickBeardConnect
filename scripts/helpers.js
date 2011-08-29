
var settings = new Store("settings", { 
    "sb_url" : "http://localhost:8081", 
    "sb_api_key" : 1234, 
    "config_log_lvl" : 10, 
    "config_width" : "medium", 
    "config_tab_animation" : false
    });
var localStorageFS = settings.toObject();
var NOW = $.now();



function getRefreshRate() {
    return parseInt(localStorageFS["refresh_rate"]) * 1000;
}

function getUrl() {
    return checkEndSlash(localStorageFS["sb_url"]);
}

function getApiUrl() {
    return getUrl() + "api/" + localStorageFS["sb_api_key"];
}

function checkEndSlash(input) {
    if (input.charAt(input.length - 1) == '/') {
        return input;
    } else {
        var output = input + '/';
        return output;
    }
}

/**
 * checks id data has the attr "error" if not noErrorCallback is called with
 * data and paramString as arguments
 * 
 * @param data
 * @param paramString
 * @param noErrorCallback
 */
function checkForError(data, params, noErrorCallback) {
    if (data.error) {
        log(data.error, "REG", WARNING);
        console.log(data);
    } else {
        log("Reg successful for: " + params, "REG", DEBUG);
        if (shouldLvlBeLoged(DEBUG))
            console.log(data);
        localStorage["json_" + params] = JSON.stringify(data)
        noErrorCallback(data, params);
    }
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
        checkForError(data, params, succes_callback);
    }, error : error_callback });
}

/**
 * log the request error
 * 
 * @param data
 */
function genricRequestError(data) {
    log("request error", "REQ", ERROR);
    console.log(data);
}

function Params() {

}

/**
 * create a simple string from the param dict/obj the string looks kinda like a
 * get request
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
    var imgPart = "/showPoster/?show=" + tvdbid + "&which=poster";
    return getUrl() + imgPart;

}
/**
 * @param tvdbid
 * @returns {String}
 */
function constructShowBannerUrl(tvdbid) {
    // /showPoster/?show=73741&amp;which=poster
    var imgPart = "/showPoster/?show=" + tvdbid + "&which=banner";
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
    return lvl >= parseInt(localStorageFS["config_log_lvl"]);

}


//http://www.electrictoolbox.com/pad-number-zeroes-javascript-improved/
function pad(n, len) {
    s = n.toString();
    if (s.length < len) {
        s = ('0000000000' + s).slice(-len);
    }

    return s;  
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
