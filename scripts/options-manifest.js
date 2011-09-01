// SAMPLE
this.manifest = {
    "name": "SickBeard Connect",
    "icon": "images/icon48.png",
    "settings": [
        {
            "tab": i18n.get("sickbeard"),
            "group": i18n.get("connection"),
            "name": "sb_url",
            "type": "text",
            "label": i18n.get("url"),
            "text": i18n.get("sample_url")
        },
        {
            "tab": i18n.get("sickbeard"),
            "group": i18n.get("connection"),
            "name": "sb_api_key",
            "type": "text",
            "label": i18n.get("api_key"),
            "text": i18n.get("sample_key")
        },
        {
            "tab": i18n.get("sickbeard"),
            "group": i18n.get("connection"),
            "name": "myDescription",
            "type": "description",
            "text": i18n.get("description")
        },
        {
            "tab": i18n.get("sickbeard"),
            "group": i18n.get("connection"),
            "name": "test_con",
            "type": "button",
            "text": i18n.get("test_con")
        },
        {
            "tab": i18n.get("style"),
            "group": i18n.get("look"),
            "name": "config_width",
            "type": "popupButton",
            "label": i18n.get("width"),
            "options": [
                ["small", "Small"],
                ["medium", "Medium"],
                ["big", "Big"],
            ]
        },
        {
            "tab": i18n.get("style"),
            "group": i18n.get("look"),
            "name": "config_tab_animation",
            "type": "checkbox",
            "label": i18n.get("tab_animation")
        },
        {
            "tab": i18n.get("style"),
            "group": i18n.get("feel"),
            "name": "config_refresh_rate",
            "type": "slider",
            "min":  0,
            "max": 60,
            "step": 1,
            "display": true,
            "label": i18n.get("refresh_rate")
        },
        {
            "tab": i18n.get("style"),
            "group": i18n.get("feel"),
            "name": "config_notification_default_rate",
            "type": "slider",
            "min":  0,
            "max": 50,
            "step": 1,
            "display": true,
            "label": i18n.get("notification_refresh_rate")
        },
        {
            "tab": i18n.get("style"),
            "group": i18n.get("feel"),
            "name": "myDescription_notifo_rate",
            "type": "description",
            "text": i18n.get("desc_notifo_rate")
        },
        {
            "tab": i18n.get("advanced"),
            "group": "Special",
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
            "tab": i18n.get("advanced"),
            "group": "Chrome2Growl",
            "name": "config_chromeToGrowl_use",
            "type": "checkbox",
            "label": i18n.get("chrome2growl")
        },
        {
            "tab": i18n.get("advanced"),
            "group": "Chrome2Growl",
            "name": "myDescription_useC2G",
            "type": "description",
            "text": 'TODO: write description how to use that/install "server"'
        },
        {
            "tab": i18n.get("advanced"),
            "group": "Chrome2Growl",
            "name": "config_chromeToGrowl_icon_path",
            "type": "text",
            "label": i18n.get("chrome2growl_icon_path")
        },
        {
            "tab": i18n.get("advanced"),
            "group": "Chrome2Growl",
            "name": "config_chromeToGrowl_host",
            "type": "text",
            "label": i18n.get("chrome2growl_host"),
            "text": "127.0.0.1:8000"
        }
    ],
    "alignment": [
        ["sb_url","sb_api_key"],
        ["config_chromeToGrowl_host","config_chromeToGrowl_icon_path"],
        ["config_notification_default_rate","config_refresh_rate"]
    ]
};
