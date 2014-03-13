var lastHeight = {};
var initialHeight = {};

var unlockShows = false;
var unlockFuture = false;
var unlockHistory = false;

function _initGui() {
    log("initialising the gui", "POP", DEBUG);
    $("body").addClass(settings.getItem("config_width"));

    var arccOptions = { animated : false, autoHeight : false, navigation : true };
    var showsArcc = $("#shows-arc").accordion(arccOptions);
    var futureArcc = $("#future-arc").accordion(arccOptions);
    var historyArcc = $("#history-arc").accordion(arccOptions);
    
    $.each($(".panel"), function(k, v) {
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
    $('#contend').bind('tabsshow', function(event, ui) {
        cache.setItem('last_tab', ui.index);
    });
    
    initSearchImageEventHook();
}

function initSearchImageEventHook(){
    $("img.search").live('click', function(e) {
        var id = $(this).attr("id");
        var splitID = id.split("-");
        var tvdbid = splitID[0];
        var season = splitID[1];
        var episode = splitID[2];

        $("img." + id).attr("src", chrome.extension.getURL('images/throbber.svg'));
        $("img." + id).addClass("visible");
        var params = new Params();
        params.cmd = "episode.search";
        params.tvdbid = tvdbid;
        params.season = season;
        params.episode = episode;
        genericRequest(params, searchSuccess, searchError, 0, null); // no timeout
        listenForNotificationsFast(); // for 1 min
    });    
}


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
        activateSection();
        if(settings.getItem('config_switchToShow'))
            pageTVDBID(openShow);
        window.setTimeout(setMainContentHeight, 500);
    }
}

function setMainContentHeight() {

    if (settings.getItem("config_tab_animation"))
        $(".tab").addClass("animated");
    log("setting the content height to AUTO", "POP", DEBUG);

    $(".tab").removeClass("hidden");
    $("#loadContainer").hide();

}

/*
 * builder, timeout and afterDone functions
 */

/*
 * Shows
 */

function showsBuild(response, params) {
    var data = response.data;
    var shows = $("#shows");
    var showList = {};
    shows.html("");
    var ul = $("<ul>");
    $.each(data, function(name, show) {
        var li = $("<li>");
        showList[show.tvdbid] = name;
        var nameSpan = $("<span>");
        nameSpan.addClass("name");
        nameSpan.attr("id", show.tvdbid);
        nameSpan.html(name);
        var liHTMLString = '<span class="quality ' + show.quality + '">' + show.quality + '</span>';
        liHTMLString += '<div class="clearer"></div>';
        li.append(nameSpan);
        li.append(liHTMLString);
        ul.append(li);
    });
    shows.append(ul);
    showsAfterDone();
    // save the html for later
    cache.setItem("html_" + params, shows.html());
    cache.setItem("shows",showList);
    age.setItem("html_" + params, $.now());
}

function showsTimeout(response, params, timeout) {
    if (cache.getItem("html_" + params) && ($.now() - age.getItem("html_" + params) < timeout)) {
        $("#shows").html(cache.getItem("html_" + params));
        showsAfterDone();
    } else {
        showsBuild(response, params);
    }
}
function showsAfterDone() {
    $("#shows li .name").click(function(data) {
        openShow($(this).attr("id"));
    });
    recalculateHeight("shows", true);
    unlockContent("shows");
}

function buildAddShow(tvdbid,name){
    var newLi = $('<li>');
    var spanText = $('<span>');
    spanText.append('<b>Add '+name+'</b><br/>');
    spanText.addClass('addShow');
    var buttonSpan = $('<span class="quality" style="background:none;">');
    var selectQ = $('<select>');
    selectQ.append('<option value="">Default</option>');
    selectQ.append('<option value="sdtv|sddvd">SD</option>');
    selectQ.append('<option value="hdtv|hdwebdl|hdbluray">HD</option>');
    selectQ.append('<option value="sdtv|sddvd|hdtv|hdwebdl|hdbluray|unknown">ANY</option>');
    var selectS = $('<select>');
    selectS.append('<option value="">Default</option>');
    selectS.append('<option value="wanted">Wanted</option>');
    selectS.append('<option value="skipped">Skipped</option>');
    selectS.append('<option value="ignored">Ignored</option>');
    selectS.append('<option value="archived">Archived</option>');
    
    addFail = function(response,params){
        newLi.html('');
        spanText.html('<b>Could not add show:'+response.message+'</b>');
        spanText.addClass('error');
        newLi.append(spanText);
        buttonSpan.html('<img src="'+yesORnoPic(false)+'"/>');
        newLi.append(buttonSpan);
    };
    addSuccess = function(response,params){
        newLi.html('');
        spanText.html('<b>'+name+' succesfuly added</b>');
        spanText.addClass('success');
        newLi.append(spanText);
        buttonSpan.html('<img src="'+yesORnoPic(true)+'"/>');
        newLi.append(buttonSpan);
        setPopupOwn();
    };
    
    var noImg = $('<img>');
    noImg.attr('src',yesORnoPic(false));
    noImg.click(function(){newLi.hide('slow');});
    noImg.css('cursor','pointer');
    var yesImg = $('<img>');
    yesImg.attr('src',yesORnoPic(true));
    yesImg.css('cursor','pointer');
    yesImg.click(function(){
        var params = new Params();
        params.cmd = "show.addnew";
        params.tvdbid = tvdbid;
        params.initial = selectQ.val();
        params.status = selectS.val();
        age.clear();
        noImg.hide();
        yesImg.attr('src',chrome.extension.getURL('images/throbber.svg'));
        genericRequest(params, addSuccess, addFail, 0, null);    
    });
    newLi.append(spanText);
    newLi.append('<span>Q:</span>');
    newLi.append(selectQ);
    newLi.append('<span>   S:</span>');
    newLi.append(selectS);
    buttonSpan.append(yesImg);
    buttonSpan.append(noImg);
    newLi.prepend(buttonSpan);
    $("#shows ul").prepend(newLi);
    
}

/*
 * Show
 */
function showBuild(response, params) {
    var data = response.data;
    log("build show not FULLY implemented", "GUI", WARNING);
    var show = $("#show");

    $("#show .name").html(data.show_name);
    
    if(data.airs){
        $("#airs").show();
        $("#airs").html(data.airs);
    }else{
        $("#airs").hide();
        $("#airs").html("");
    }
    if (data.location) {
        $("#location").html(data.location);
        $("#location").removeClass("broken");
    } else {
        $("#location").html("broken path");
        $("#location").addClass("broken");
    }
    $("#language").html(data.language);
    $("#season_folder").attr("src", yesORnoPic(data.season_folders));
    
    
    yesORno = data.paused == 0 && data.status != "Ended";
    $("#active").attr("src", yesORnoPic(yesORno));
    $("#air_by_date").attr("src", yesORnoPic(data.air_by_date));

    var bannerURL = constructShowBannerUrl(params.tvdbid);
    var img = $("#show .banner");
    img.hide();
    img.css("height","0px")
    if (bannerURL && settings.getItem("config_images_banner")) {
        img.attr("src", bannerURL);
        img.show();
        img.css("height","auto")
    } else
        img.attr("src", "images/spacer.gif");
    $("#show .quality").attr("class", "quality " + data.quality);
    $("#show .quality").html(data.quality);
    // season stuff
    $("#seasonList").html("");
    $("#seasonEpisodes ul").html("");
    $("#loadContainerSeasonEpisodes").show();
    $.each(data.season_list, function(k, v) {
        $("#seasonList").append('<li id="' + params.tvdbid + '-' + v + '">' + v + '</li>');
    });
    // save the html for later
    cache.setItem("html_" + params, show.html());
    age.setItem("html_" + params, $.now());
    showAfterDone();
}

function showTimeout(response, params, timeout) {
    if (cache.getItem("html_" + params) && ($.now() - age.getItem("html_" + params) < timeout)) {
        $("#show").html(cache.getItem("html_" + params));
        showAfterDone();
    } else {
        showBuild(response, params);
    }
}

function showAfterDone() {
    // recalculateHeight("show");
    $("#contend").tabs('select', 0);
    lastHeight["show"] = "450px";
    $('#shows-arc').accordion('activate', 1);
    $("#seasonList li").bind("click", function() {
        var tvdbid = $(this).attr("id").split("-")[0];
        var season = $(this).attr("id").split("-")[1];
        $("#seasonList li").removeClass("active");
        $(this).addClass("active");
        displaySeaoson(tvdbid, season);
    });
    window.setTimeout(function() {
        $("#seasonList li:first-child").click();
    }, 1000);
}

/*
 * Seasons
 */
function seasonBuild(response, params) {
    var data = response.data;
    $("#seasonEpisodes ul").html("");
    var arrayData = [];
    $.each(data, function(key, value) {
        value.episode = key;
        arrayData.push(value);
    });

    $.each(arrayData.reverse(), function(key, value) {
        var li = $("<li>");
        var liHTMLString = '<span class="episode">' + pad(value.episode, 2) + '</span>';
        liHTMLString += '<span class="ep_name">' + value.name + '</span><br/>';
        liHTMLString += '<span class="status ' + value.status + '">' + value.status + '</span>';
        liHTMLString += '<span class="date">' + getAirDate(value.airdate) + '</span>';

        li.append(createSearchImg(params.tvdbid, params.season, value.episode,2));
        li.append(liHTMLString);
        $("#seasonEpisodes ul").append(li);
    });
    cache.setItem("html_" + params, $("#seasonEpisodes ul").html());
    age.setItem("html_" + params, $.now());
    seasonAfterDone();
}

function seasonTimeout(response, params, timeout) {
    if (cache.getItem("html_" + params) && ($.now() - age.getItem("html_" + params) < timeout)) {
        $("#seasonEpisodes ul").html(cache.getItem("html_" + params));
        seasonAfterDone();
    } else {
        seasonBuild(response, params);
    }
}

function seasonAfterDone() {
    $("#loadContainerSeasonEpisodes").hide();
    $("#seasonEpisodes").css('height', 450 - (parseInt($("#show #showInfos").css("height"), 10) + parseInt($("#show .banner").css("height"), 10) + 5) + "px");
}

/*
 * Future
 */
function futureBuild(response, params) {
    var data = response.data;
    var imgType = settings.getItem("config_images_future");
    var popWidth = settings.getItem("config_width");
    
    var types = [ "missed", "today", "soon", "later" ];
    $.each(types, function(k, type) {
        var curUl = $("<ul>");
        var entrys = false;
        $.each(data[type], function(key, value) {
            
            var li = $('<li class="'+imgType+' '+popWidth+'">');
            var liHTMLString_name = '<span class="show_name" id="' + value.tvdbid + '">' + value.show_name + '</span><br/>';
            liHTMLString_ep = '<span class="epSeasonEpisode">S' + pad(value.season, 2) + 'E' + pad(value.episode, 2) + '</span>';
            liHTMLString_ep += '<span class="ep_name">' + value.ep_name + '</span>';
            var img = "";
            if(imgType == 'poster'){
                liHTMLString_ep += '<br /><span class="ep_airs_poster">' + value.airs + '</span>';
				img = '<img class="future_poster" src="'+constructShowPosterUrl(value.tvdbid)+'"/>';
            }else if(imgType == 'banner'){
                liHTMLString_ep += '<span class="ep_airs_banner">' + value.airs + '</span>';
                img = '<div style="height:';
		if(popWidth == 'small'){
			img += '45px;';
		}else if(popWidth == 'medium'){
			img += '63px;';
		}if(popWidth == 'big'){
			img += '82px;';
		}
		img += 'background-image: url(\''+constructShowBannerUrl(value.tvdbid)+'\');background-size:100%;text-align:right;"><div style="float:right;padding: 5px 5px 5px 5px;">';
		img += createSearchImg(value.tvdbid, value.season, value.episode, 1);82
		img += '</div></div>';
            }

            if(img)
                li.append(img);

            if(imgType != "banner"){
                li.append(liHTMLString_name);
            }else if(imgType != "none"){
                li.append('<div class="clearRight clearLeft"></div>');
            }
            li.append(liHTMLString_ep);
            if(imgType == "poster") {
                li.prepend(createSearchImg(value.tvdbid, value.season, value.episode, 2));
			}
            curUl.append(li);
            entrys = true;
        });
        if (entrys) {
            $("#" + type).html("");
            $("#" + type).append(curUl);
        }
        cache.setItem("html_" + params + "_" + type, $("#" + type).html());
    });

    cache.setItem("html_" + params, $("#future-arc").html());
    age.setItem("html_" + params, $.now());
    // refresh the badge
    try { // this will fail if called from the aNTP iframe
        chrome.extension.getBackgroundPage().setBadge(response, params);
    } catch (e){
        // do nothing
    }

    futureAfterDone();
}

function setupProfileSwitcher(){
    if(profiles.count() <= 1)
        return false;
    $('#profile').show();
    var allProfiles = profiles.getAll();
    var ul = $('<ul>');
    $.each(allProfiles, function(name, values) {

        var curLi = $('<li>');
        curLi.html(name);
        curLi.click(function(){
            chrome.extension.getBackgroundPage().switchProfile(name);
            refreshContent();
        });
        ul.append(curLi);
    });
        
    $('#profile').qtip({
        content: {
            text: function(api) {
                return $('<h5>Switch to Profile</h5>').append(ul);
            }
        },
        show: {
            event: 'click'
        },
        style: {
            classes: 'ui-tooltip-shadow ui-tooltip-rounded ui-sb-profile-switcher ui-tooltip-tipped'
        },
        position: {
            my: 'bottom center',
            at: 'top center'
        },
        hide: {
            fixed: true,
            delay: 500
        }
    });
    
    
    $('#profile').html(settings.getItem('profile_name'));
}

function futureTimeout(response, params, timeout) {
    if (cache.getItem("html_" + params) && ($.now() - age.getItem("html_" + params) < timeout)) {
        var types = [ "missed", "today", "soon", "later" ];
        $.each(types, function(k, type) {
            $("#" + type).html(cache.getItem("html_" + params + "_" + type));
        });
        futureAfterDone();
    } else {
        futureBuild(response, params);
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
function historyBuild(response, params) {
    var data = response.data;
    var filter = settings.getItem("config_history_filter");
    $("#history").html("");
    var ul = $("<ul>");
    $.each(data, function(key, value) {
        if(filter == "both" || filter == value.status){
            var li = $("<li>");
            var liHTMLString = '<span class="show_name" id="' + value.tvdbid + '">' + value.show_name + '</span>';
            liHTMLString += '<span class="date">' + getNiceHistoryDate(value.date) + '</span><br/>';
            liHTMLString += '<span class="epSeasonEpisode">S' + pad(value.season, 2) + 'E' + pad(value.episode, 2) + '</span>';
            liHTMLString += '<span class="status ' + value.status + '">' + value.status + '</span>';
            liHTMLString += '<span class="historyQuality">' + value.quality + '</span>';
            li.append(liHTMLString);
            ul.append(li);
        }
    });
    $("#history").append(ul);

    cache.setItem("html_" + params, $("#history").html());
    age.setItem("html_" + params, $.now());
    historyAfterDone();
}

function historyTimeout(response, params, timeout) {
    if (cache.getItem("html_" + params) && ($.now() - age.getItem("html_" + params) < timeout)) {
        $("#history").html(cache.getItem("html_" + params));
        historyAfterDone();
    } else {
        historyBuild(response, params);
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

function searchSuccess(response, params) {
    var data = response.data;
    var img = $("img." + params.tvdbid + "-" + params.season + "-" + params.episode);
    img.attr("src", chrome.extension.getURL('images/yes16.png'));
    img.siblings(".ep_name").addClass("success");
    img.siblings(".ep_name").html('Snatched (' + data.quality + ')');
    listenForNotificationsFast(20000); // 20 sec
}

function searchError(response, params) {
    var data = response.data;
    var img = $("img." + params.tvdbid + "-" + params.season + "-" + params.episode);
    img.attr("src", chrome.extension.getURL('images/no16.png'));
    img.siblings(".ep_name").addClass("error");
    img.siblings(".ep_name").html("Unable to find episode");
    listenForNotificationsFast(20000); // 20 sec
}

function createSearchImg(tvdbid, season, episode, type) {
	var img = '<img ';
	if (type == 1)
	{
	img += 'style="background-color: white; padding: 5px 5px 5px 5px;"';
	}
	img += 'class="search ' + tvdbid + "-" + season + "-" + episode+ '" id="'+ tvdbid + "-" + season + "-" + episode +'" src="'+chrome.extension.getURL('images/search16.png')+'">';
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
    var curIndex = indexForComingArc(ui.newContent.attr('id'));
    cache.setItem('last_arc', curIndex);
    if(cache.getItem('last_tab') == 1)
        cache.setItem('last_future_arc', curIndex);
}

function recalculateHeight(id, setHeight) {
    var element = $("#" + id);
    element.removeClass("animated"); // remove the class to the calculation
    // is done in an instand
    setHeightFor(id, "auto");
    lastHeight[id] = element.css("height");
    log("saving height for " + id + ": " + lastHeight[id], "GUI", DEBUG);
    element.addClass("animated"); // add animation back to the panel
    return false;
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
    element = $("#" + id);
    element.css("height", height);
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
function yesORnoPic(yesORno) {
    if (yesORno)
        return "images/yes16.png";
    else
        return "images/no16.png";

}

function indexForComingArc(id){
    if(id == 'missed')
        return 0;
    else if(id == 'today')
        return 1;
    else if(id == 'soon')
        return 2;
    else if(id == 'later')
        return 3;
    else
        return 0;
}

