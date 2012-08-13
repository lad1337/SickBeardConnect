var store = new Store( 'settings' );
var popup = null;
var global_settings = null;

var profiles = new ProfileManager();
var ProfilePopup = new Class({
    'profiles': {},
    
    'initialize': function ( settings )
    {
        this.settings = settings;
    },
    
    'add': function ( name )
    {
        var opt = new Element('option', {
            'id': name,
            'text': name,
            'value': name
        });
        
        opt.inject(this.settings.manifest.profile_popup.element);
        this.profiles[name] = opt;
    },
    
    'remove': function ( name )
    {
        this.profiles[name].dispose();
        delete this.profiles[name];
    },
    
    'clear': function(){
        for(var p in this.profiles){
            this.remove(p);
        }
    },
    
    
    'rename': function( currentName, newName )
    {
        var p = this.profiles[currentName];
        p.set( 'id', newName );
        p.set( 'text', newName );
        p.set( 'value', newName );
        
        delete this.profiles[currentName];
        this.profiles[newName] = p;
    },
    
    'setSelection': function( name )
    {
        console.log("setting new selected to '"+name+"'")
        this.settings.manifest.profile_popup.element.set('value', name);
        console.log("setting is now '"+this.getSelection()+"'")
    },
    
    'getSelection': function()
    {
        return this.settings.manifest.profile_popup.element.getSelected().get('value')[0];
    }
});


var profileList = null;

window.addEvent("domready", function() {
    // http://davidwalsh.name/mootools-show-hide
    //time to implement basic show / hide
    Element.implement({
      //implement show
      show: function() {
        this.setStyle('display','');
      },
      //implement hide
      hide: function() {
        this.setStyle('display','none');
      }
    });
    //time to implement fancy show / hide
    Element.implement({
        //implement show
        fancyShow: function() {
          this.fade('in');
        },
        //implement hide
        fancyHide: function() {
          this.fade('out').setStyle('display','none');
        }
      });
    

    function initSetting(settings) {
        global_settings = settings;
        profileList = new ProfilePopup( settings );
        settings.manifest.config_refresh_rate.addEvent("action", function(value) {
            chrome.extension.getBackgroundPage().setFutureTimer();
        });

        settings.manifest.config_notification_default_rate.addEvent("action", function(value) {
            chrome.extension.getBackgroundPage().testConnection();
            chrome.extension.getBackgroundPage().setMSGTimer();
        });
        
        settings.manifest.profile_switch_check.addEvent("action", function(value) {
            chrome.extension.getBackgroundPage().setProfileSwitchTimer();
        });

        
        settings.manifest.reset_to_default.addEvent("action", function(value) {
            if (confirm(chrome.i18n.getMessage("options_resetSettings_question")))
                setDefaultSettings();
        });

        settings.manifest.clear_cache.addEvent("action", function(value) {
            chrome.extension.getBackgroundPage().cache.clear();
            chrome.extension.getBackgroundPage().age.clear();
            alert(chrome.i18n.getMessage("options_clearCache_message"))
        });

        settings.manifest.sb_url.addEvent("action", function(value) {
            chrome.extension.getBackgroundPage().testConnection();
            var img = document.id("connectionStatus");
            if(img.getProperty("src") != "images/throbber.svg")
                document.id("connectionStatus").setProperty('src', "images/throbber.svg");
            profiles.syncActive();
        });
        settings.manifest.sb_api_key.addEvent("action", function(value) {
            chrome.extension.getBackgroundPage().testConnection();
            var img = document.id("connectionStatus");
            if(img.getProperty("src") != "images/throbber.svg")
                document.id("connectionStatus").setProperty('src', "images/throbber.svg");
            profiles.syncActive();
        });
        settings.manifest.profile_priority.addEvent("action", function(value) {
            profiles.syncActive();
        });
        
        settings.manifest.profile_name.addEvent("action", function(value) {
            var oldName = profileList.getSelection();
            console.log("oldname '"+oldName+"'",oldName);
            
            var newName = settings.manifest.profile_name.element.value;
            if(!newName){
                return false;
            }
            profiles.syncProfile(oldName, newName);
            console.log("renaming in list '"+oldName+" '"+newName+"'");
            profileList.rename(oldName,  newName);

            console.log("renaming in list done it is now '"+profileList.getSelection()+"'");
        });

        settings.manifest.profile_popup.addEvent("action", function(value) {
            var switchToProfile = profileList.getSelection();
            switchWrapper(switchToProfile);
        });
        
        
        settings.manifest.config_icon_badge.addEvent("action", function(value) {
            chrome.extension.getBackgroundPage().setFutureTimer();
        });
        settings.manifest.config_images_banner.addEvent("action", function(value) {
            chrome.extension.getBackgroundPage().age.clear();
        });
        settings.manifest.config_history_filter.addEvent("action", function(value) {
            chrome.extension.getBackgroundPage().age.clear();
        });
        settings.manifest.config_images_future.addEvent("action", function(value) {
            chrome.extension.getBackgroundPage().age.clear();
        });

        addProfileButtons( settings );
        fillProfileList(settings, profileList);
        switchWrapper(profiles.getActiveProfile().name);
        store.set('in_config', true);
    }
    // special settings need some callback functions
    new FancySettings.initWithManifest(initSetting);
    
    
    var userPWGroup = document.id(chrome.i18n.getMessage("options_username_label") + "__" + chrome.i18n.getMessage("options_password_label"));
    userPWGroup.hide();
    
    window.setInterval(function() {

        var img = document.id("connectionStatus");
        var versionSpan = document.id("apiVersion");
        var apiVersion = chrome.extension.getBackgroundPage().apiVersion;
        if (chrome.extension.getBackgroundPage().connectionStatus) {
            img.setProperty('src', "images/yes16.png");
            versionSpan.set('html', "v"+apiVersion);    
        } else {
            img.setProperty('src', "images/no16.png");
            versionSpan.set('html', "");
        }
        console.log(apiVersion);
        if(apiVersion >= 0.2){
            userPWGroup.fancyHide();
        }else if(apiVersion != 0){
            userPWGroup.fancyShow();
            userPWGroup.show(); 
        }else{
            userPWGroup.fancyHide();
        }
        
    }, 3000);
    
    window.setInterval(function() {
        var curProfile = store.get('profile_name');
        if(curProfile != profileList.getSelection()){
            loadProfile(global_settings, curProfile);
            if(curProfile != profileList.getSelection()){
                profileList.setSelection(curProfile);
            }
        }
    }, 1000);
    
    
    var p = document.id("connectionStatus").getParent();
    p.setStyle('color', "black");
    chrome.extension.getBackgroundPage().testConnection();


    function addProfileButtons( settings ){
        var m = settings.manifest;
        m.profile_create.bundle.inject( m.profile_popup.bundle );
        m.profile_duplicate.bundle.inject( m.profile_popup.bundle );
        m.profile_delete.bundle.inject( m.profile_popup.bundle );
        
        m.profile_popup.container.setStyle( 'display', 'inline-block' );
        m.profile_popup.container.setStyle( 'margin-right', '10');
        m.profile_popup.element.setStyle( 'width', '150');
        m.profile_create.bundle.setStyle( 'display', 'inline-block');
        m.profile_duplicate.bundle.setStyle( 'display', 'inline-block');
        m.profile_delete.bundle.setStyle( 'display', 'inline-block');
        
        m.profile_create.addEvent( 'action', createProfile);
        m.profile_duplicate.addEvent( 'action', copyProfile );
        m.profile_delete.addEvent( 'action', deleteActiveProfile );
    }
    
    
});
function generateUniqueName( name ){
    var newName = name;
    var counter = 1;
    while( profiles.contains( newName ) ) {
        newName = name + counter++;
    }
    return newName;
}

function copyProfile(){
    var p = profiles.getActiveProfile();
    createProfile(p.name, p.values);
}

function createProfile(name, data){
    
    if(typeof name === "undefined")
        name = 'New_Profile';
    
    var newName = generateUniqueName(name);
    console.log("creating new profile with name", newName);
    if(typeof data === "undefined")
        profiles.add(newName, chrome.extension.getBackgroundPage().getDefaultProfileData());
    else
        profiles.add(newName, data);
        
    switchWrapper(newName);
}

function deleteActiveProfile(){
    if(profiles.count() > 1){
        console.log("i will delete something")
        var toDelete = profiles.getActiveProfile();
        var profileName = toDelete.name;
        profiles.remove(profileName);
        var nowActiveP = profiles.getFirstProfile();
        switchWrapper(nowActiveP.name);
    }
    
}

function loadProfile(settings, profileName){
    
    console.log("loading profile: '"+profileName+"'");
    profile = profiles.getProfile(profileName);
    
    settings.manifest.profile_name.element.value = profile.name;
    
    settings.manifest.sb_url.element.value = profile.values.sb_url;
    settings.manifest.sb_api_key.element.value = profile.values.sb_api_key;
    settings.manifest.sb_username.element.value = profile.values.sb_username;
    settings.manifest.sb_password.element.value = profile.values.sb_password;
    settings.manifest.profile_priority.element.value = profile.values.profile_priority;
    
    settings.manifest.profile_priority.display.set("text", settings.manifest.profile_priority.params.displayModifier(settings.manifest.profile_priority.get()))
}


function fillProfileList(settings, profileList){
    profileList.clear();
    var profileNames = store.get( 'profiles' );
    for( var p in profileNames ) {
        profileList.add( p );
    }
}

function switchWrapper(profileName){
    loadProfile(global_settings, profileName);
    fillProfileList(global_settings, profileList);
    chrome.extension.getBackgroundPage().switchProfile(profileName);
    chrome.extension.getBackgroundPage().testConnection();
    var img = document.id("connectionStatus");
    if(img.getProperty("src") != "images/throbber.svg")
        document.id("connectionStatus").setProperty('src', "images/throbber.svg");
    
    if(profileName != profileList.getSelection()){
        profileList.setSelection(profileName);
    }
}


function setDefaultSettings() {
    defaultSettings = chrome.extension.getBackgroundPage().getDefaultSettings();
    var settings = new Store("settings", defaultSettings);
    settings.fromObject(defaultSettings);
    window.location.reload();
}

window.onbeforeunload = function() {
    store.set('in_config', false);
};
