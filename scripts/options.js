window.addEvent("domready", function () {
    // special settings need some callback functions
    new FancySettings.initWithManifest(function (settings) {
        settings.manifest.test_con.addEvent("action", function () {
            alert("Testing connection!");
        });
        settings.manifest.config_refresh_rate.addEvent("action", function (value) {
            chrome.extension.getBackgroundPage().setHistoryTimer();
        });
        settings.manifest.config_notification_default_rate.addEvent("action", function (value) {
            chrome.extension.getBackgroundPage().setMSGTimer();
        });

    });
});