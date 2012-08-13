function getDefaultProfileData(){
    return {"sb_url":"", "sb_api_key":"", "sb_username": "", "sb_password": "", "profile_priority": 0};
}
function getDefaultProfileName(){
        return chrome.i18n.getMessage("default_profile_name");
}
function getDefaultProfiles(){
    var default_name = getDefaultProfileName();
    var default_profile = {};
    default_profile[default_name] = getDefaultProfileData();
    return default_profile;
}
function getDefaultSettings(){
    
    var defaultSettings = { 
            "profile_name": getDefaultProfileName(),
            "profiles": getDefaultProfiles(),
            "sb_url" : "",
            "sb_api_key": "",
            "sb_username": "",
            "sb_password": "",
            "profile_priority": 0,
            "profile_switch_check": 10,
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
            "config_chromeToGrowl_icon_path" : "",
            "in_config": false,
            "migration": 0}; // migration=0 since version 0.1.19
    return defaultSettings;
}


var settings = new Store("settings", getDefaultSettings()); // globaly used
var cache = new Store("cache");
var age = new Store("age");

var connectionStatus = chrome.extension.getBackgroundPage().connectionStatus;
var apiVersion = chrome.extension.getBackgroundPage().apiVersion;
var profiles = chrome.extension.getBackgroundPage().profiles;

var NOW = $.now();

function getRefreshRate() {
    return settings.getItem("refresh_rate") * 1000;
}

function getUrl(profileName) {
    var url = getUrlObj(profileName);
    return url.full;
}

function getUrlObj(profileName){
    if(typeof profileName === "undefined")
        var curUrl = settings.getItem("sb_url");
    else{
        p = profiles.getProfile(profileName);
        var curUrl = p.values.sb_url;
    }
    var full = "";
    var urlObj = {};
    if (curUrl.search("http") != 0){ // user did not enter anything we will assume http
        urlObj.protocol = 'http://';
        urlObj.plain = curUrl;
        full = "http://" + curUrl;
    }else if(curUrl.search("https://") == 0){ // user entered https
        urlObj.protocol = 'https://';
        urlObj.plain = curUrl.substr(8, curUrl.length - 8);
        full = curUrl;
    }else if(curUrl.search("http://") == 0){ // user entered http
        urlObj.protocol = 'http://';
        urlObj.plain = curUrl.substr(7, curUrl.length - 7);
        full = curUrl;
    }else{ //we have an url that starts with http...something like httpweb.com...but no protocol...crazy
        urlObj.protocol = 'http://';
        urlObj.plain = curUrl;
        full = "http://" + curUrl;
    }
    urlObj.full = checkEndSlash(full);
    return urlObj;
}

function getHTTPLoginUrl() {
    var urlObj= getUrlObj();
    if (settings.getItem("sb_username") && settings.getItem("sb_password")) {
        var imgUrl = urlObj.protocol+settings.getItem("sb_username")+":"+settings.getItem("sb_password")+"@"+urlObj.plain;
        return checkEndSlash(imgUrl);
    }
    return urlObj.full;
}

function getApiUrl(profileName) {
    if(typeof profileName === "undefined")
        return getUrl() + "api/" + settings.getItem("sb_api_key");
    else{
        p = profiles.getProfile(profileName);
        return getUrl(profileName) + "api/" + p.values.sb_api_key;
    }
}

/**
 * issue a request to sickbeard api keeps log of requests
 * 
 * @param params
 * @param succes_callback
 * @param error_callback
 */
function genericRequest(params, succes_callback, error_callback, timeout, timeout_callback, profileName) {
    if(typeof profileName === "undefined")
        profileName = settings.getItem('profile_name');
    
    log("New Req for("+profileName+"): " + params, "REG", DEBUG);
    if (cache.getItem("html_" + params) || cache.getItem("json_" + params))
        if ($.now() - age.getItem("json_" + params) < timeout) {
            log("Not refreshing for reg: " + params + ". Let the timeout_callback handle this", "REQ", INFO);
            data = cache.getItem("json_" + params);
            if (timeout_callback)
                timeout_callback(data, params, timeout);
            return;
        }

    var apiUrl = getApiUrl(profileName);
    $.ajax( { type : "POST", url : apiUrl, data : params, dataType : 'json', success : function(data) {
        age.setItem("json_" + params, $.now()); // time of last successful call
        cache.setItem("json_" + params, data); // json string of last response
        checkForError(data, params, succes_callback, error_callback);
    }, error : function(data) {
        genricRequestError(data, params, succes_callback, error_callback, timeout);
    } });
}

/**
 * checks id data has the attr "error" if not noErrorCallback is called with data and paramString as arguments
 * 
 * @param response
 * @param paramString
 * @param succes_callback
 */
function checkForError(response, params, succes_callback, error_callback) {
    /*
    {RESULT_SUCCESS:"success",
        RESULT_FAILURE:"failure",
        RESULT_TIMEOUT:"timeout",
        RESULT_ERROR:"error",
        RESULT_DENIED:"denied",
        }
*/
    
    if (response.result != "success") {
        log("Reg recived for BUT not successful : " + params, "REG", DEBUG);
        if (response.result == "denied") {
            connectionStatus = false;
            log("Api Key not accepted", "REQ", WARNING);
        } else {
            connectionStatus = true;
        }
        if (shouldLvlBeLoged(DEBUG))
            console.log(response);
        if (error_callback)
            error_callback(response, params);
    } else {
        log("Reg successful for: " + params, "REQ", DEBUG);
        connectionStatus = true;
        if (shouldLvlBeLoged(DEBUG))
            console.log(response);
        if (succes_callback)
            succes_callback(response, params);
    }
}
/**
 * log the request error
 * 
 * @param data
 */
function genricRequestError(data, params, succes_callback, error_callback, timeout) {
    connectionStatus = false;
    log("request error", "REQ", ERROR);
    console.log(data);
    log("trying to load old data", "REQ", INFO);
    if (cache.getItem("json_" + params) && params.cmd != "sb.ping" && timeout) {
        data = cache.getItem("json_" + params);
        var msg = "No connection! Using old data.";
        log(msg, WARNING);
        try {
            addErrorMsg(msg, WARNING);
        } catch (e) {
        }
        checkForError(data, params, succes_callback, error_callback);
    } else {
        if(error_callback)
            error_callback();
        
        var msg = "No connection and NO old data!";
        log(msg, ERROR);
        try {
            addErrorMsg(msg, ERROR);
        } catch (e) {
        }
    }

}

/**
 * log the error response
 * 
 * @param data
 * @param params
 */
function genericResponseError(response, params) {
    if(typeof response === "undefined"){
        log("empty/broken Response" + params, "REQ", WARNING);
        return
    }

    var data = response.data;
    log("an error in response for reg: " + params, "REQ", WARNING);
    console.log(data);

    addErrorMsg(data.error, ERROR);
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
    var first = true;
    $.each(this, function(key, value) {
        if (key != "toString") {
            var splitter = "&";
            if (first) {
                splitter = "?";
                first = false;
            }
            string += splitter + key + "=" + value;
        }
    });
    return string;
};

/**
 * @param tvdbid
 * @returns {String}
 */
function constructShowPosterUrl(tvdbid) {
    if(apiVersion >= 0.2){
        // /api/1234/?cmd=show.getbanner&tvdbid=
        return getApiUrl() + "?cmd=show.getposter&tvdbid=" + tvdbid;
    }else{
        // /showPoster/?show=73741&amp;which=poster
        var imgPart = "showPoster/?show=" + tvdbid + "&which=poster";
        return getHTTPLoginUrl() + imgPart;
    }

}
/**
 * @param tvdbid
 * @returns {String}
 */
function constructShowBannerUrl(tvdbid) {
    if(apiVersion >= 0.2){
        // /api/1234/?cmd=show.getposter&tvdbid
        return getApiUrl() + "?cmd=show.getbanner&tvdbid=" + tvdbid;
    }else{
        // /showPoster/?show=73741&amp;which=poster
        var imgPart = "showPoster/?show=" + tvdbid + "&which=banner";
        return getHTTPLoginUrl() + imgPart;
    }
}
/**
 * @param provider
 * @returns {String}
 */
function constructProviderImgUrl(provider) {
    provider = provider.replace(/ /g, "_").toLowerCase();
    var imgPart = "images/providers/" + provider + ".gif";
    return getHTTPLoginUrl() + imgPart;
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

        if (lvl >= ERROR)
            console.error($.now() + "-[" + curLogLvl + "-" + sections + "]: " + msg);
        else if (lvl >= WARNING)
            console.warn($.now() + "-[" + curLogLvl + "-" + sections + "]: " + msg);
        else
            console.log($.now() + "-[" + curLogLvl + "-" + sections + "]: " + msg);

    }
}

function shouldLvlBeLoged(lvl) {
    return lvl >= settings.getItem("config_log_lvl");

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
function stripHtmlTags(strInputCode) {
    // <[^<]+?>
    // (?<=^|>)[^><]+?(?=<|$)
    // <\/?[^>]+(>|$)
    return strInputCode.replace(/<[^<]+?>/g, "");
}
function stripDotsAndStuff(strInputCode) {
    return strInputCode.replace(/[:.' !]/g, "");
}
function sendUpdatedShowListRespaonse(request,succescallback){
    var params = new Params();
    params.cmd = "shows";
    params.sort = "name";
    params.tvdbid = request.tvdbid;
    genericRequest(params, succescallback, genericResponseError, 60000, succescallback);
}


var monthNames = [ chrome.i18n.getMessage("gui_month_january"),
                   chrome.i18n.getMessage("gui_month_february"),
                   chrome.i18n.getMessage("gui_month_march"),
                   chrome.i18n.getMessage("gui_month_april"),
                   chrome.i18n.getMessage("gui_month_may"),
                   chrome.i18n.getMessage("gui_month_june"),
                   chrome.i18n.getMessage("gui_month_july"),
                   chrome.i18n.getMessage("gui_month_august"),
                   chrome.i18n.getMessage("gui_month_september"),
                   chrome.i18n.getMessage("gui_month_october"),
                   chrome.i18n.getMessage("gui_month_november"),
                   chrome.i18n.getMessage("gui_month_december")];

function getNiceHistoryDate(date) {
    var dateSplit = date.split("-");
    var yeahr = dateSplit[0];
    var month = dateSplit[1];
    var dayAndTime = dateSplit[2].split(" ");
    var day = dayAndTime[0];
    var time = dayAndTime[1];

    return day + ". " + monthNames[parseInt(month, 10) - 1] + " " + time;

}

function getAirDate(date) {
    var dateSplit = date.split("-");
    var yeahr = dateSplit[0];
    var month = dateSplit[1];
    var day = dateSplit[2];

    return day + ". " + monthNames[parseInt(month, 10) - 1];

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
