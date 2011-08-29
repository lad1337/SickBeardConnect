var lastHeight = {};
var initialHeight = {};

function _initGui() {
    log("initialising the gui", "POP", DEBUG)
    $("body").addClass(localStorage["config_width"]);
    // dummy data during testing
    // $(".pannel").html("stuff<br/>stuff<br/>stuff<br/>stuff<br/>stuff<br/>stuff<br/>stuff<br/>stuff");

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
    log("build show not implemented", "GUI", WARNING);
    var show = $("#show");
    // show.html("");
    $("#show .name").html(data.show_name);
    $("#show .banner").attr("src", constructShowBannerUrl(params.tvdbid));
    $("#show .quality").attr("class", "quality "+data.quality);
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
    window.setTimeout(function() {
        recalculateHeight("show", true);
    }, 100); // this timeout is needed
    lastHeight["show"] = ""; // delete the height so the handleArccChange does not set the height for show
    $("#contend").tabs('select', 0);
    $('#shows-arc').accordion('activate', 1);
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
