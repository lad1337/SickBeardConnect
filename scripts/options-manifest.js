// SAMPLE
this.manifest = {
    "name": chrome.i18n.getMessage("ext_name"),
    "icon": "images/icon48.png",
    "settings": [
        {
            "tab" : chrome.i18n.getMessage("options_tab_sickbeard"),
            "group": chrome.i18n.getMessage("options_group_connection"),
            "label": chrome.i18n.getMessage("options_url_label"),
            "text": chrome.i18n.getMessage("options_url_example"),
            "name": "sb_url",
            "type": "text"
        },
        {
            "tab": chrome.i18n.getMessage("options_tab_sickbeard"),
            "group": chrome.i18n.getMessage("options_group_connection"),
            "label": chrome.i18n.getMessage("options_apiKey_label"),
            "text": chrome.i18n.getMessage("options_apiKey_example"),
            "name": "sb_api_key",
            "type": "text"
        },
        {
            "tab": chrome.i18n.getMessage("options_tab_sickbeard"),
            "group": chrome.i18n.getMessage("options_group_connection"),
            "text": chrome.i18n.getMessage("options_apiKey_description"),
            "name": "myDescription",
            "type": "description"
        },
        {
            "tab": chrome.i18n.getMessage("options_tab_sickbeard"),
            "group": chrome.i18n.getMessage("options_group_connection"),
            "text": chrome.i18n.getMessage("option_testCon_text"),
            "name": "test_con",
            "type": "button"
        },
        {
            "tab": chrome.i18n.getMessage("options_tab_lookAndFeel"),
            "group": chrome.i18n.getMessage("options_group_look"),
            "name": "config_width",
            "type": "popupButton",
            "label": chrome.i18n.getMessage("width"),
            "options": [
                ["small", "Small"],
                ["medium", "Medium"],
                ["big", "Big"],
            ]
        },
        {
            "tab": chrome.i18n.getMessage("options_tab_lookAndFeel"),
            "group": chrome.i18n.getMessage("options_group_look"),
            "label": chrome.i18n.getMessage("options_tabAnimation_label"),
            "name": "config_tab_animation",
            "type": "checkbox"
        },
        {
            "tab": chrome.i18n.getMessage("options_tab_lookAndFeel"),
            "group": chrome.i18n.getMessage("options_group_feel"),
            "label": chrome.i18n.getMessage("options_badgeRefreshRate_label"),
            "name": "config_refresh_rate",
            "type": "slider",
            "min":  0,
            "max": 60,
            "step": 1,
            "display": true
        },
        {
            "tab": chrome.i18n.getMessage("options_tab_lookAndFeel"),
            "group": chrome.i18n.getMessage("options_group_feel"),
            "label": chrome.i18n.getMessage("options_notificationRefreshRate_label"),
            "name": "config_notification_default_rate",
            "type": "slider",
            "min":  0,
            "max": 50,
            "step": 1,
            "display": true
        },
        {
            "tab": chrome.i18n.getMessage("options_tab_lookAndFeel"),
            "group": chrome.i18n.getMessage("options_group_feel"),
            "text": chrome.i18n.getMessage("options_notificationRefreshRate_description"),
            "name": "myDescription_notifo_rate",
            "type": "description"
        },
        {
            "tab": chrome.i18n.getMessage("options_tab_advanced"),
            "group": chrome.i18n.getMessage("options_group_special"),
            "name": "config_log_lvl",
            "type": "popupButton",
            "label": "Debug Level",
            "options": [
                        [10, "Debug"],
                        [20, "Info"],
                        [30, "Warning"],
                        [40, "Error"],
                        [99, "Off"],
                    ]
        },
        {
            "tab": chrome.i18n.getMessage("options_tab_advanced"),
            "label": chrome.i18n.getMessage("options_useChrome2growl_label"),
            "group": "Chrome2Growl",
            "name": "config_chromeToGrowl_use",
            "type": "checkbox"
        },
        {
            "tab": chrome.i18n.getMessage("options_tab_advanced"),
            "group": "Chrome2Growl",
            "name": "myDescription_useC2G",
            "type": "description",
            "text": chrome.i18n.getMessage("options_useChrome2growl_describtion")
        },
        {
            "tab": chrome.i18n.getMessage("options_tab_advanced"),
            "label": chrome.i18n.getMessage("options_chrome2growlIconPath_label"),
            "group": "Chrome2Growl",
            "name": "config_chromeToGrowl_icon_path",
            "type": "text"
        },
        {
            "tab": chrome.i18n.getMessage("options_tab_advanced"),
            "label": chrome.i18n.getMessage("options_chrome2growlHost_label"),
            "group": "Chrome2Growl",
            "name": "config_chromeToGrowl_host",
            "type": "text",
            "text": "127.0.0.1:8000"
        },
        {
            "tab": chrome.i18n.getMessage("options_tab_advanced"),
            "group": chrome.i18n.getMessage("options_group_localStorage"),
            "text": chrome.i18n.getMessage("options_resetSettings_text"),
            "name": "reset_to_default",
            "type": "button"
        },
        {
            "tab": chrome.i18n.getMessage("options_tab_advanced"),
            "group": chrome.i18n.getMessage("options_group_localStorage"),
            "text": chrome.i18n.getMessage("options_clearCache_text"),
            "name": "clear_cache",
            "type": "button"
        }
    ],
    "alignment": [
        ["sb_url","sb_api_key"],
        ["config_chromeToGrowl_host","config_chromeToGrowl_icon_path"],
        ["config_notification_default_rate","config_refresh_rate"]
    ]
};
