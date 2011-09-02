var lastHeight = {};
var initialHeight = {};

function _initGui() {
    log("initialising the gui", "POP", DEBUG);
    $("body").addClass(settings["config_width"]);

    var arccOptions = { animated : false, autoHeight : false, navigation : true };
    var showsArcc = $("#shows-arc").accordion(arccOptions);
    var futureArcc = $("#future-arc").accordion(arccOptions);
    var historyArcc = $("#history-arc").accordion(arccOptions);
    $.each($(".pannel"), function(k, v) {
        var id = v.getAttribute("id");
        var element = $("#" + id);
        lastHeight[id] = element.css("height");
        log("INITIAL: saving height for " + id + ": " + lastHeight[id], "GUI", DEBUG);
        if (element.css("display") == "none") {
            setHeightForInital(id, "0px");
            element.css("display", "block");
        } else {
            setHeightForInital(id, lastHeight[id]);
        }
    });

    $("#shows-arc").bind("accordionchange", function(event, ui) {
        handleArccChange(ui);
    });
    $("#future-arc").bind("accordionchange", function(event, ui) {
        handleArccChange(ui);
    });
    $("#history-arc").bind("accordionchange", function(event, ui) {
        handleArccChange(ui);
    });

    var tab = $("#contend").tabs();

    $("#tabHeader li").live('click', function(e) {
        var id = $(this).find("a").attr("id");
        if (id) {
            $("#contend").tabs('select', parseInt(id));
        }
    });

    $("img.search").live('click', function(e) {
        var id = $(this).attr("id");
        var splitID = id.split("-");
        var tvdbid = splitID[0];
        var season = splitID[1];
        var episode = splitID[2];

        $("img." + id).attr("src", chrome.extension.getURL('images/loading32.gif'));
        $("img." + id).addClass("visible");
        var params = new Params();
        params.cmd = "episode.search";
        params.tvdbid = tvdbid;
        params.season = season;
        params.episode = episode;
        genericRequest(params, searchSuccess, searchError, 0, null); // no timeout
        listenForNotificationsFast(60000); // for 1 min
    });

    if (settings["config_tab_animation"])
        $(".tab").addClass("animated");
    // window.setTimeout(setMainContentHeight, 750);
}

var unlockShows = false;
var unlockFuture = false;
var unlockHistory = false;

function unlockContent(area) {
    switch (area) {
    case "shows":
        unlockShows = true;
        break;
    case "future":
        unlockFuture = true;
        break;
    case "history":
        unlockHistory = true;
        break;
    default:
        break;
    }

    if (unlockShows && unlockFuture && unlockHistory) {
        log("every areay is UNlocked", "POP", DEBUG);
        window.setTimeout(setMainContentHeight, 300);
        // setHeightForInital("contend","auto");
        // setMainContentHeight();
    }
}

function setMainContentHeight() {
    log("setting the content height to AUTO", "POP", DEBUG);
    $(".tab").removeClass("hidden");
    $("#loadContainer").hide();
    // $("#contend").css("height", "auto");
}

/*
 * builder, timeout and afterDone functions
 */

/*
 * Shows
 */

function showsBuild(data, params) {
    var shows = $("#shows");
    shows.html("");
    var ul = $("<ul>");
    $.each(data, function(key, show) {
        var li = $("<li>");
        var nameSpan = $("<span>");
        nameSpan.addClass("name");
        nameSpan.attr("id", show.tvdbid);
        nameSpan.html(key);
        var liHTMLString = '<span class="quality ' + show.quality + '">' + show.quality + '</span>';
        liHTMLString += '<div class="clearer"></div>';
        li.append(nameSpan);
        li.append(liHTMLString);
        ul.append(li);
    });
    shows.append(ul);
    showsAfterDone();
    // save the html for later
    localStorage["html_" + params] = shows.html();
}

function showsTimeout(data, params) {
    if (localStorage["html_" + params]) {
        $("#shows").html(localStorage["html_" + params]);
        showsAfterDone();
    } else {
        showsBuild(data, params);
    }
}
function showsAfterDone() {
    $("#shows li .name").click(function(data) {
        openShow($(this).attr("id"));
    });
    recalculateHeight("shows", true);
    unlockContent("shows");
}

/*
 * Show
 */
function showBuild(data, params) {
    log("build show not FULLY implemented", "GUI", WARNING);
    var show = $("#show");

    $("#show .name").html(data.show_name);

    $("#airs").html(data.airs);
    if (data.location) {
        $("#location").html(data.location);
        $("#location").removeClass("broken");
    } else {
        $("#location").html("broken path");
        $("#location").addClass("broken");
    }
    $("#language").html(data.language);
    $("#paused").attr("src", yesORnoPic(data.paused));
    $("#season_folder").attr("src", yesORnoPic(data.season_folders));
    $("#active").attr("src", yesORnoPic(data.active));
    $("#air_by_date").attr("src", yesORnoPic(data.air_by_date));

    var bannerURL = constructShowBannerUrl(params.tvdbid);
    if (bannerURL)
        $("#show .banner").attr("src", bannerURL);
    else
        $("#show .banner").attr("src", "images/spacer.gif");
    $("#show .quality").attr("class", "quality " + data.quality);
    $("#show .quality").html(data.quality);

    // save the html for later
    localStorage["html_" + params] = show.html();
    showAfterDone();
}

function showTimeout(params) {
    if (localStorage["html_" + params]) {
        $("#show").html(localStorage["html_" + params]);
        showAfterDone();
    } else {
        showBuild(data, params);
    }
}

function showAfterDone() {
    // recalculateHeight("show");
    $("#contend").tabs('select', 0);
    lastHeight["show"] = "450px";
    $('#shows-arc').accordion('activate', 1);
}

/*
 * Future
 */
function futureBuild(data, params) {
    var types = [ "missed", "today", "soon", "later" ];
    $.each(types, function(k, type) {
        var curUl = $("<ul>");
        var entrys = false;
        $.each(data[type], function(key, value) {
            var li = $("<li>");
            var liHTMLString = '<span class="show_name" id="' + value.tvdbid + '">' + value.show_name + '</span><br/>';
            liHTMLString += '<span class="epSeasonEpisode">s' + pad(value.season, 2) + 'e' + pad(value.episode, 2) + '</span>';
            liHTMLString += '<span class="ep_name">' + value.ep_name + '</span>';

            li.append(createSearchImg(value.tvdbid, value.season, value.episode));
            li.append(liHTMLString);
            curUl.append(li);
            entrys = true;
        });
        if (entrys) {
            $("#" + type).html("");
            $("#" + type).append(curUl);
        }
        localStorage["html_" + params + "_" + type] = $("#" + type).html();
    });

    localStorage["html_" + params] = $("#future-arc").html();
    futureAfterDone();
}

function futureTimeout(data, params) {
    if (localStorage["html_" + params]) {
        // this kills the hooked events :(
        // $("#future-arc").html(localStorage["html_" + params]);
        // this does not work for some reason the events get not reattached
        // var futureArcc = $("#future-arc").accordion(arccOptions);
        var types = [ "missed", "today", "soon", "later" ];
        $.each(types, function(k, type) {
            $("#" + type).html(localStorage["html_" + params + "_" + type]);
        });
        futureAfterDone();
    } else {
        futureBuild(data, params);
    }
}

function futureAfterDone() {
    var types = [ "today", "soon", "later" ];
    $.each(types, function(k, type) {
        recalculateHeight(type);
        $("#" + type).css("height", "0px");
    });
    recalculateHeight("missed", true);

    $("#future-arc li .show_name").click(function(data) {
        openShow($(this).attr("id"));
    });

    unlockContent("future");
}

/*
 * History
 */
function historyBuild(data, params) {
    var ul = $("<ul>");
    $.each(data, function(key, value) {
        var li = $("<li>");
        var liHTMLString = '<span class="show_name" id="' + value.tvdbid + '">' + value.show_name + '</span>';
        liHTMLString += '<span class="date">' + getNiceHistoryDate(value.date) + '</span><br/>';
        liHTMLString += '<span class="epSeasonEpisode">s' + pad(value.season, 2) + 'e' + pad(value.episode, 2) + '</span>';
        liHTMLString += '<span class="action ' + value.action + '">' + value.action + '</span>';
        liHTMLString += '<span class="historyQuality">' + value.quality + '</span>';
        li.append(liHTMLString);
        ul.append(li);
    });
    $("#history").append(ul);

    localStorage["html_" + params] = $("#history").html();
    historyAfterDone();
}

function historyTimeout(params) {
    if (localStorage["html_" + params]) {
        $("#history").html(localStorage["html_" + params]);
        historyAfterDone();
    } else {
        historyBuild(data, params);
    }
}

function historyAfterDone() {
    recalculateHeight("history", true);
    $("#history li .show_name").click(function(data) {
        openShow($(this).attr("id"));
    });
    unlockContent("history");
}

/*
 * Episode Search
 */

function searchSuccess(data, params) {
    var img = $("img." + params.tvdbid + "-" + params.season + "-" + params.episode);
    img.attr("src", chrome.extension.getURL('images/yes16.png'));
    img.siblings(".ep_name").addClass("success");
    img.siblings(".ep_name").html('Snatched (' + data.result + ')');
    listenForNotificationsFast(20000); // 20 sec
}

function searchError(data, params) {
    var img = $("img." + params.tvdbid + "-" + params.season + "-" + params.episode);
    img.attr("src", chrome.extension.getURL('images/no16.png'));
    img.siblings(".ep_name").addClass("error");
    img.siblings(".ep_name").html("Unable to find episode");
    listenForNotificationsFast(20000); // 20 sec
}

function createSearchImg(tvdbid, season, episode) {
    var img = $("<img>");
    img.addClass("search " + tvdbid + "-" + season + "-" + episode);
    img.attr("id", tvdbid + "-" + season + "-" + episode);
    img.attr("src", chrome.extension.getURL('images/search16.png'));
    return img;
}

/*
 * generic gui helper functions
 */

function handleArccChange(ui) {
    lastHeight[ui.oldContent.attr('id')] = ui.oldContent.css("height");
    ui.oldContent.css("display", "block");
    ui.oldContent.css("height", "0px");
    if (lastHeight[ui.newContent.attr('id')]) {
        var id = ui.newContent.attr('id');
        setHeightFor(id, lastHeight[id]);
    }
}

function recalculateHeight(id, setHeight) {
    var element = $("#" + id);
    element.removeClass("animated"); // remove the class to the calculation
    // is done in an instand
    setHeightFor(id, "auto");
    lastHeight[id] = element.css("height");
    log("saving height for " + id + ": " + lastHeight[id], "GUI", DEBUG);
    element.addClass("animated"); // add animation back to the pannel

    if (setHeight) {
        setHeightFor(id, lastHeight[id]);
    }
}

function setHeightForInital(id, height) {
    log("INITIAL: setting height for " + id + " to " + height, "GUI", DEBUG);
    _setHeightFor(id, height);
}
function setHeightFor(id, height) {
    log("setting height for " + id + " to " + height, "GUI", DEBUG);
    _setHeightFor(id, height);
}
function _setHeightFor(id, height) {
    $("#" + id).css("height", height);
}

function addErrorMsg(msg, lvl) {
    var identifier = stripDotsAndStuff(msg);
    if ($("#errors #" + identifier).length > 0) {
        var numberString = $("#errors #" + identifier + " .counter").html().replace("(", "").replace(")", "");
        var oldNumber = parseInt(numberString);
        if (!oldNumber) {
            oldNumber = 1;
        }
        var newNumber = oldNumber + 1;
        $("#errors #" + identifier + " .counter").html("(" + newNumber + ") ");
    } else {
        if (lvl == ERROR)
            $("#errors").append(createError(msg, "Error", identifier));
        else
            $("#errors").append(createWarning(msg, "Warning", identifier));
    }

    if (lvl == ERROR) {
        $("#errors .ui-state-error").show();
        $("#errors .ui-state-error").delay(5000).hide(1000);
    } else {
        $("#errors .ui-state-highlight").show();
        $("#errors .ui-state-highlight").delay(5000).hide(1000);
    }
}

function createError(msg, lvl, identifier) {
    return createErrorWarning(msg, lvl, "ui-state-error", identifier);
}
function createWarning(msg, lvl, identifier) {
    return createErrorWarning(msg, lvl, "ui-state-highlight", identifier);
}
function createErrorWarning(msg, lvl, cssClass, identifier) {
    var div = '<div class="' + cssClass + ' ui-corner-all" style="padding: 0 4px;" id="' + identifier + '">';
    div += '<p style="margin: 5px 0 5px 0;"><span class="ui-icon ui-icon-alert" style="float: left; margin-right: .3em;"></span>';
    div += '<strong>' + lvl + ' : </strong>';
    div += msg;
    div += '<span class="counter" style="float: right;"></span></p></div>';
    return div;
}
function yesORnoPic(int) {
    if (int == 0)
        return "images/no16.png";
    else
        return "images/yes16.png";

}
