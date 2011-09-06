var settings = chrome.extension.getBackgroundPage().settings;
var cache = chrome.extension.getBackgroundPage().cache;
var age = chrome.extension.getBackgroundPage().age;

var connectionStatus = chrome.extension.getBackgroundPage().connectionStatus;

var NOW = $.now();

function getRefreshRate() {
    return settings.getItem("refresh_rate") * 1000;
}

function getUrl() {
    var url = settings.getItem("sb_url");
    if (url.search("http://") != 0)
        url = "http://" + url;
    return checkEndSlash(url);
}
function getHTTPLoginUrl() {
    if (settings.getItem("sb_username") && settings.getItem("sb_password")) {
        var url = getUrl();
        url = url.substr(7, url.length - 7);
       return "http://"+settings.getItem("sb_username")+":"+settings.getItem("sb_password")+"@"+url;
    }
    return getUrl();
}

function getApiUrl() {
    return getUrl() + "api/" + settings.getItem("sb_api_key");
}

/**
 * issue a request to sickbeard api keeps log of requests
 * 
 * @param params
 * @param succes_callback
 * @param error_callback
 */
function genericRequest(params, succes_callback, error_callback, timeout, timeout_callback) {

    log("New Req for: " + params, "REG", DEBUG);
    if (cache.getItem("html_" + params) || cache.getItem("json_" + params))
        if ($.now() - age.getItem("json_" + params) < timeout) {
            log("Not refreshing for reg: " + params + ". Let the timeout_callback handle this", "REQ", INFO);
            data = cache.getItem("json_" + params);
            if (timeout_callback)
                timeout_callback(data, params, timeout);
            return;
        }
    var apiUrl = getApiUrl();
    $.ajax( { type : "POST", url : apiUrl, data : params, dataType : 'json', success : function(data) {
        age.setItem("json_" + params, $.now()); // time of last successful call
        cache.setItem("json_" + params, data); // json string of last response
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
        if (data.error.search("ACCESS DENIED") != -1) {
            connectionStatus = false;
            log("Api Key not accepted", "REQ", WARNING);
        } else {
            connectionStatus = true;
        }
        if (shouldLvlBeLoged(DEBUG))
            console.log(data);
        if (error_callback)
            error_callback(data, params);
    } else {
        log("Reg successful for: " + params, "REQ", DEBUG);
        if (shouldLvlBeLoged(DEBUG))
            console.log(data);
        if (succes_callback)
            succes_callback(data, params);
    }
}
/**
 * log the request error
 * 
 * @param data
 */
function genricRequestError(data, params, succes_callback, error_callback) {
    connectionStatus = false;
    log("request error", "REQ", ERROR);
    console.log(data);
    log("trying to load old data", "REQ", INFO);
    if (cache.getItem("json_" + params) && params.cmd != "sb.ping") {
        data = cache.getItem("json_" + params);
        var msg = "No connection! Using old data.";
        log(msg, WARNING);
        try {
            addErrorMsg(msg, WARNING);
        } catch (e) {
        }
        checkForError(data, params, succes_callback, error_callback);
    } else {
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
function genericResponseError(data, params) {
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
    // /showPoster/?show=73741&amp;which=poster
    var imgPart = "showPoster/?show=" + tvdbid + "&which=poster";
    return getHTTPLoginUrl() + imgPart;

}
/**
 * @param tvdbid
 * @returns {String}
 */
function constructShowBannerUrl(tvdbid) {
    // /showPoster/?show=73741&amp;which=poster
    var imgPart = "showPoster/?show=" + tvdbid + "&which=banner";
    return getHTTPLoginUrl() + imgPart;
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
    return strInputCode.replace(/[.' !]/g, "");
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
