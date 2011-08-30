var lastHeight = {};
var initialHeight = {};

function _initGui() {
    log("initialising the gui", "POP", DEBUG);
    $("body").addClass(localStorageFS["config_width"]);

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

    if (localStorageFS["config_tab_animation"])
        $(".tab").addClass("animated");
    window.setTimeout(setMainContentHeight, 1000);
}

function setMainContentHeight() {
    $("#contend").css("height", "auto");
}

/*
 * builder, timeout and afterDone functions
 */

/*
 * Shows
 */

function showsBuild(data, paramString) {
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
    localStorage["html_" + paramString] = shows.html();
}

function showsTimeout(params) {
    $("#shows").html(localStorage["html_" + params]);
    showsAfterDone();
}
function showsAfterDone() {
    $("#shows li .name").click(function(data) {
        openShow($(this).attr("id"));
    });
    recalculateHeight("shows", true);
}

/*
 * Show
 */
function showBuild(data, params) {
    log("build show not FULLY implemented", "GUI", WARNING);
    var show = $("#show");

    $("#show .name").html(data.show_name);
    var bannerURL = constructShowBannerUrl(params.tvdbid);
    if (bannerURL) {
        if ($("#show img.banner").length > 0)
            $("#show img.banner").attr("src", bannerURL);
        else {
            var img = $("<img>");
            img.attr("src", bannerURL);
            img.addClass("banner");
            show.prepend(img);
        }
    }
    $("#show .quality").attr("class", "quality " + data.quality);
    $("#show .quality").html(data.quality);

    // save the html for later
    localStorage["html_" + params] = show.html();
    showAfterDone();
}

function showTimeout(params) {
    $("#show").html(localStorage["html_" + params]);
    showAfterDone();
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
            var liHTMLString = '<span class="show_name" id="' + value.tvdbid + '">' + value.show_name + '</span><br/>\
                                <span class="epSeasonEpisode">s' + pad(value.season, 2) + 'e' + pad(value.episode, 2) + '</span>\
                                <span class="ep_name">' + value.ep_name + '</span>';
            liHTMLString += '<div class="clearer"></div>';
            li.append(liHTMLString);
            curUl.append(li);
            entrys = true;
        });
        if (entrys) {
            $("#" + type).html("");
            $("#" + type).append(curUl);
        }

    });

    localStorage["html_" + params] = $("#future-arc").html();
    futureAfterDone();
}

function futureTimeout(params) {
    $("#future-arc").html(localStorage["html_" + params]);
    futureAfterDone();
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
}

/*
 * History
 */
function historyBuild(data, params) {
    var ul = $("<ul>");
    $.each(data, function(key, value) {
        var li = $("<li>");
        var liHTMLString = '<span class="show_name" id="' + value.tvdbid + '">' + value.show_name + '</span><br/>\
                            <span class="epSeasonEpisode">s' + pad(value.season, 2) + 'e' + pad(value.episode, 2) + '</span>\
                            <span class="action">' + value.action + '</span>';
        liHTMLString += '<div class="clearer"></div>';
        li.append(liHTMLString);
        ul.append(li);
    });
    $("#history").append(ul);

    localStorage["html_" + params] = $("#history").html();
    historyAfterDone();
}

function historyTimeout(params) {
    $("#history").html(localStorage["html_" + params]);
    historyAfterDone();
}

function historyAfterDone() {
    recalculateHeight("history", true);
    $("#history li .show_name").click(function(data) {
        openShow($(this).attr("id"));
    });
}

/*
 * generic gui helper functions
 */

function handleArccChange(ui) {
    console.log(ui.newContent.attr('id'));
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
