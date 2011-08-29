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
        }
    ],
    "alignment": [
        [
            "sb_url",
            "sb_api_key"
        ]
    ]
};
