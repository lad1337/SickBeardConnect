// SAMPLE
this.manifest = {
    "name": chrome.i18n.getMessage("ext_name"),
    "icon": "images/icon48.png",
    "settings": [
         {
             "tab": chrome.i18n.getMessage("options_tab_sickbeard"),
             "group": chrome.i18n.getMessage("options_group_connection"),
             "label": "Profile",
             "name": "profile_popup",
             "type": "popupButton"
         },
         {
             'tab': chrome.i18n.getMessage("options_tab_sickbeard"),
             'group': chrome.i18n.getMessage("options_group_connection"),
             'text': chrome.i18n.getMessage("options_profile_create_button"),
             'name': "profile_create",
             'type': "button"
         },
         {
             'tab': chrome.i18n.getMessage("options_tab_sickbeard"),
             'group': chrome.i18n.getMessage("options_group_connection"),
             'text': chrome.i18n.getMessage("options_profile_copy_button"),
             'name': "profile_duplicate",
             'type': "button"
         },
         {
             'tab': chrome.i18n.getMessage("options_tab_sickbeard"),
             'group': chrome.i18n.getMessage("options_group_connection"),
             'text': chrome.i18n.getMessage("options_profile_delete_button"),
             'name': "profile_delete",
             'type': "button"
         },
         {
             "tab" : chrome.i18n.getMessage("options_tab_sickbeard"),
             "group": chrome.i18n.getMessage("options_group_connection"),
             "label": "Profilename",
             "text": "Default",
             "name": "profile_name",
             "type": "text"
         },
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
             "label": chrome.i18n.getMessage("options_priority_label"),
             "name": "profile_priority",
             "type": "slider",
             "min":  0,
             "max": 20,
             "step": 1,
             "display": true,
             "displayModifier": function (value) {
                 if(!value)
                     return "No priority";
                 return value;
             }
         },
         {
             "tab": chrome.i18n.getMessage("options_tab_sickbeard"),
             "group": chrome.i18n.getMessage("options_group_connection"),
             "text": chrome.i18n.getMessage("options_prority_description"),
             "name": "myDescription_priority",
             "type": "description"
         },
        {
            "tab": chrome.i18n.getMessage("options_tab_sickbeard"),
            "group": chrome.i18n.getMessage("options_group_connection"),
            "text": chrome.i18n.getMessage("options_connectionStatus_label")+' <img style="width:16px;vertical-align:middle;" src="images/throbber.svg" id="connectionStatus"/> <span id="apiVersion"></span>',
            "name": "myDescription_connection_status",
            "type": "description"
        },
        {
            "tab": chrome.i18n.getMessage("options_tab_sickbeard"),
            "group": chrome.i18n.getMessage("options_username_label") + " & " + chrome.i18n.getMessage("options_password_label"),
            "label": chrome.i18n.getMessage("options_username_label"),
            "text": chrome.i18n.getMessage("options_username_example"),
            "name": "sb_username",
            "type": "text"
        },
        {
            "tab": chrome.i18n.getMessage("options_tab_sickbeard"),
            "group": chrome.i18n.getMessage("options_username_label") + " & " + chrome.i18n.getMessage("options_password_label"),
            "label": chrome.i18n.getMessage("options_password_label"),
            "text": chrome.i18n.getMessage("options_password_example"),
            "name": "sb_password",
            "type": "text",
            "masked": true
        },
        {
            "tab": chrome.i18n.getMessage("options_tab_sickbeard"),
            "group": chrome.i18n.getMessage("options_username_label") + " & " + chrome.i18n.getMessage("options_password_label"),
            "text": chrome.i18n.getMessage("options_usernamePassword_description"),
            "name": "myDescription_username_password",
            "type": "description"
        },
        {
            "tab": chrome.i18n.getMessage("options_tab_sickbeard"),
            "group": chrome.i18n.getMessage("options_group_profile_switching"),
            "label": chrome.i18n.getMessage("options_profile_switching_label"),
            "name": "profile_switch_check",
            "type": "slider",
            "min":  0,
            "max": 60,
            "step": 1,
            "display": true,
            "displayModifier": function (value) {
                if(!value)
                    return "Off";
                if(value == 1)
                    return value + " " + chrome.i18n.getMessage("options_minute");
                else
                    return value + " " + chrome.i18n.getMessage("options_minutes");
            }
        },
        {
            "tab": chrome.i18n.getMessage("options_tab_sickbeard"),
            "group": chrome.i18n.getMessage("options_group_profile_switching"),
            "text": chrome.i18n.getMessage("options_profile_switching_description"),
            "name": "myDescription",
            "type": "description"
        },
        {
            "tab": chrome.i18n.getMessage("options_tab_lookAndFeel"),
            "group": chrome.i18n.getMessage("options_group_look"),
            "label": chrome.i18n.getMessage("options_width_label"),
            "name": "config_width",
            "type": "popupButton",
            "options": [
                ["small", "Small"],
                ["medium", "Medium"],
                ["big", "Big"],
            ]
        },
        {
            "tab": chrome.i18n.getMessage("options_tab_lookAndFeel"),
            "group": chrome.i18n.getMessage("options_group_look"),
            "label": chrome.i18n.getMessage("options_iconBadge_label"),
            "name": "config_icon_badge",
            "type": "popupButton",
            "options": [
                        ["auto", "Automatic"],
                        ["missed", "Missed"],
                        ["today", "Today"]
                    ]
        },
        {
            "tab": chrome.i18n.getMessage("options_tab_lookAndFeel"),
            "group": chrome.i18n.getMessage("options_group_look"),
            "label": chrome.i18n.getMessage("options_imageFuture_label"),
            "name": "config_images_future",
            "type": "popupButton",
            "options": [
                ["none", "None"],
                ["poster", "Poster"],
                ["banner", "Banner"],
            ]
        },
        {
            "tab": chrome.i18n.getMessage("options_tab_lookAndFeel"),
            "group": chrome.i18n.getMessage("options_group_look"),
            "label": chrome.i18n.getMessage("options_historyFilter_label"),
            "name": "config_history_filter",
            "type": "popupButton",
            "options": [
                        ["both", "Snatched & Downloaded"],
                        ["Snatched", "Snatched"],
                        ["Downloaded", "Downloaded"]
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
            "group": chrome.i18n.getMessage("options_group_look"),
            "label": chrome.i18n.getMessage("options_imageBanner_label"),
            "name": "config_images_banner",
            "type": "checkbox"
        },
        {
            "tab": chrome.i18n.getMessage("options_tab_lookAndFeel"),
            "group": chrome.i18n.getMessage("options_group_feel"),
            "label": chrome.i18n.getMessage("options_switchToShow_label"),
            "name": "config_switchToShow",
            "type": "checkbox"
        },
        {
            "tab": chrome.i18n.getMessage("options_tab_lookAndFeel"),
            "group": chrome.i18n.getMessage("options_group_feel"),
            "text": chrome.i18n.getMessage("options_switchToShow_description"),
            "name": "myDescription_switchtoshow",
            "type": "description"
        },
        {
            "tab": chrome.i18n.getMessage("options_tab_lookAndFeel"),
            "group": chrome.i18n.getMessage("options_group_feel"),
            "label": chrome.i18n.getMessage("options_addshow_label"),
            "name": "config_addshow",
            "type": "popupButton",
            "options": [
                        ["none", "None"],
                        ["both", "Page & Popup"],
                        ["inpage", "Page"],
                        ["popup", "Popup"]
                    ]
        },
        {
            "tab": chrome.i18n.getMessage("options_tab_lookAndFeel"),
            "group": chrome.i18n.getMessage("options_group_feel"),
            "label": chrome.i18n.getMessage("options_sectionSelect_label"),
            "name": "config_section",
            "type": "popupButton",
            "options": [
                        ["auto", "Remember Last"],
                        ["shows", "Shows"],
                        ["coming_m", "ComingEP Missing"],
                        ["coming_t", "ComingEP Today"],
                        ["coming_s", "ComingEP Soon"],
                        ["coming_l", "ComingEP Later"],
                        ["history", "History"]
                    ]
        },
        {
            "tab": chrome.i18n.getMessage("options_tab_lookAndFeel"),
            "group": chrome.i18n.getMessage("options_group_feel"),
            "text": chrome.i18n.getMessage("options_sectionSelect_description"),
            "name": "myDescription_sectionSelect",
            "type": "description"
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
            "display": true,
            "displayModifier": function (value) {
                if(!value)
                    return "Off";
                if(value == 1)
                    return value + " " + chrome.i18n.getMessage("options_minute");
                else
                    return value + " " + chrome.i18n.getMessage("options_minutes");
            }
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
            "display": true,
            "displayModifier": function (value) {
                if(!value)
                    return "Off";
                if(value == 1)
                    return value + " " + chrome.i18n.getMessage("options_second");
                else
                    return value + " " + chrome.i18n.getMessage("options_seconds");
            }
        },
        {
            "tab": chrome.i18n.getMessage("options_tab_lookAndFeel"),
            "group": chrome.i18n.getMessage("options_group_feel"),
            "text": chrome.i18n.getMessage("options_notificationRefreshRate_description"),
            "name": "myDescription_notifo_rate",
            "type": "description"
        },
        {
            "tab": chrome.i18n.getMessage("options_tab_lookAndFeel"),
            "group": chrome.i18n.getMessage("options_group_feel"),
            "label": chrome.i18n.getMessage("options_notificationVisable_label"),
            "name": "config_notification_timeout",
            "type": "slider",
            "min":  0,
            "max": 60,
            "step": 1,
            "display": true,
            "displayModifier": function (value) {
                if(!value)
                    return "Ever";
                if(value == 1)
                    return value + " " + chrome.i18n.getMessage("options_second");
                else
                    return value + " " + chrome.i18n.getMessage("options_seconds");
            }
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
        ["profile_name","sb_url","sb_api_key"],
        ["config_width","config_icon_badge","config_history_filter","config_images_future"],
        ["config_addshow","config_section"],
        ["config_notification_default_rate","config_refresh_rate","config_notification_timeout"]
    ]
};
