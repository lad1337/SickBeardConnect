window.addEvent("domready", function() {
    // special settings need some callback functions
    new FancySettings.initWithManifest(function(settings) {

        settings.manifest.config_refresh_rate.addEvent("action", function(value) {
            chrome.extension.getBackgroundPage().setFutureTimer();
        });

        settings.manifest.config_notification_default_rate.addEvent("action", function(value) {
            chrome.extension.getBackgroundPage().testConnection();
            chrome.extension.getBackgroundPage().setMSGTimer();
        });

        settings.manifest.reset_to_default.addEvent("action", function(value) {
            if (confirm(chrome.i18n.getMessage("options_resetSettings_question")))
                setDefaultSettings();
        });

        settings.manifest.clear_cache.addEvent("action", function(value) {
            chrome.extension.getBackgroundPage().cache.clear();
            chrome.extension.getBackgroundPage().age.clear();
        });

        settings.manifest.config_chromeToGrowl_use.addEvent("action", function(value) {
            var img = document.id("connectionStatus_c2g");
            if(img.getProperty("src") != "images/throbber.svg")
                document.id("connectionStatus_c2g").setProperty('src', "images/throbber.svg");
            chrome.extension.getBackgroundPage().reloadBackgroundPage();
        });

        settings.manifest.sb_url.addEvent("action", function(value) {
            chrome.extension.getBackgroundPage().testConnection();
            var img = document.id("connectionStatus");
            if(img.getProperty("src") != "images/throbber.svg")
                document.id("connectionStatus").setProperty('src', "images/throbber.svg");
            //chrome.extension.getBackgroundPage().reloadBackgroundPage();
        });
        settings.manifest.sb_api_key.addEvent("action", function(value) {
            chrome.extension.getBackgroundPage().testConnection();
            var img = document.id("connectionStatus");
            if(img.getProperty("src") != "images/throbber.svg")
                document.id("connectionStatus").setProperty('src', "images/throbber.svg");
            //chrome.extension.getBackgroundPage().reloadBackgroundPage();
        });
        settings.manifest.config_icon_badge.addEvent("action", function(value) {
            chrome.extension.getBackgroundPage().setFutureTimer();
        });
        settings.manifest.config_images_banner.addEvent("action", function(value) {
            chrome.extension.getBackgroundPage().age.clear();
        });

    });
    window.setInterval(function() {

        var img = document.id("connectionStatus");
        if (chrome.extension.getBackgroundPage().connectionStatus) {
            img.setProperty('src', "images/yes16.png");
        } else {
            img.setProperty('src', "images/no16.png");
        }
    }, 2000);
    window.setInterval(function() {

        var img = document.id("connectionStatus_c2g");
        if (chrome.extension.getBackgroundPage().chrome2growl.opened) {
            img.setProperty('src', "images/yes16.png");
        } else {
            img.setProperty('src', "images/no16.png");
        }
    }, 3000);
    var p = document.id("connectionStatus").getParent();
    p.setStyle('color', "black");
    var p = document.id("connectionStatus_c2g").getParent();
    p.setStyle('color', "black");
    chrome.extension.getBackgroundPage().testConnection();
    
});

function setDefaultSettings() {
    defaultSettings = chrome.extension.getBackgroundPage().defaultSettings;
    var settings = new Store("settings", defaultSettings);
    settings.fromObject(defaultSettings);
    window.location.reload();
}

