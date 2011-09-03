window.addEvent("domready", function() {
    // special settings need some callback functions
    new FancySettings.initWithManifest(function(settings) {
        settings.manifest.test_con.addEvent("action", function() {
            alert("Testing connection!");
        });

        settings.manifest.config_refresh_rate.addEvent("action", function(value) {
            chrome.extension.getBackgroundPage().setHistoryTimer();
        });

        settings.manifest.config_notification_default_rate.addEvent("action", function(value) {
            chrome.extension.getBackgroundPage().setMSGTimer();
        });

        settings.manifest.reset_to_default.addEvent("action", function(value) {
            if (confirm("This will reset this extension's settings.  Are you sure?"))
                setDefaultSettings();
        });

        settings.manifest.clear_cache.addEvent("action", function(value) {
            clearCache();
        });

        settings.manifest.config_chromeToGrowl_use.addEvent("action", function(value) {
            chrome.extension.getBackgroundPage().reloadBackgroundPage();
        });

        settings.manifest.sb_url.addEvent("action", function(value) {
            chrome.extension.getBackgroundPage().reloadBackgroundPage();
        });
        
    });
});

function setDefaultSettings() {
    defaultSettings = chrome.extension.getBackgroundPage().defaultSettings;
    var settings = new Store("settings", defaultSettings);
    settings.fromObject(defaultSettings);
    window.location.reload();
}

function clearCache() {

    defaultSettings = chrome.extension.getBackgroundPage().defaultSettings;
    var settings = new Store("settings", defaultSettings);
    var currentSettings = settings.toObject();
    window.localStorage.clear();
    settings.fromObject(currentSettings);
}
