


function ProfileManager()
{
    
}

ProfileManager.prototype.store = new Store('settings');

ProfileManager.prototype.count = function(){
    return Object.size(this.store.get( 'profiles' ));
}

ProfileManager.prototype.add = function( profileName, values ){
    var profiles = this.store.get( 'profiles' );
    if( profiles.hasOwnProperty( profileName ) ) {
        throw 'already_exists';
    }
    
    profiles[profileName] = values;
    this.store.set( 'profiles', profiles );
}

ProfileManager.prototype.edit = function( profileName, values, newProfileName ){
    console.log("profiles edit",profileName, values, newProfileName)
    
    
    var profiles = this.store.get( 'profiles' );
    if( !profiles[profileName] ) {
        throw 'profile_missing';
    }
    
    if(typeof newProfileName !== "undefined"){
        if( profileName != newProfileName ) {
            if( profiles.hasOwnProperty( newProfileName ) ) {
                throw 'renamed_exists';
            }
            
            delete profiles[profileName];
            profileName = newProfileName;
        }
    }
    
    profiles[profileName] = values;
    this.store.set( 'profiles', profiles );
}

ProfileManager.prototype.remove = function( profileName )
{
    var profiles = store.get( 'profiles' );
    if( !profiles.hasOwnProperty( profileName ) ) {
        throw 'profile_missing';
    }
    
    delete profiles[profileName];
    this.store.set( 'profiles', profiles );
    
    var newActive = this.getFirstProfile();
    this.setActiveProfile( newActive.name );
    return newActive;
}

ProfileManager.prototype.setProfile = function( profileData )
{
    var profiles = this.store.get( 'profiles' );
    profiles[profileData.name] = profileData.values;
    this.store.set( 'profiles', profiles );
}

ProfileManager.prototype.getProfile = function( profileName )
{
    if( !profileName ) {
        return null;
    }
    
    var profiles = this.store.get( 'profiles' );
    var profile = profiles[profileName];
    
    if( !profile ) {
        return null;
    }
    
    return {
        'name': profileName,
        'values': profiles[profileName]
    };
}

ProfileManager.prototype.getActiveProfile = function()
{
    var profileName = this.store.get( 'profile_name' );
    return this.getProfile( profileName );
}

ProfileManager.prototype.getFirstProfile = function()
{
    for (var first in this.store.get( 'profiles' )) break;
    
    var profileName = first;
    return this.getProfile( profileName );
}

ProfileManager.prototype.setActiveProfile = function( profileName )
{
    this.store.set( 'profile_name', profileName );
}

ProfileManager.prototype.contains = function( profileName )
{
    var profiles = this.store.get( 'profiles' );
    return profiles.hasOwnProperty( profileName );
}


ProfileManager.prototype.getAll = function(){
    return this.store.get( 'profiles' );
}

ProfileManager.prototype.syncProfile = function(pName, newName){
    console.log("syncing profile '"+ pName+"' newName '"+newName+"'");
    var curProfile = this.getProfile(pName);
    var values = curProfile.values;
    values.sb_url = this.store.get('sb_url');
    values.sb_api_key = this.store.get('sb_api_key');
    values.sb_username = this.store.get('sb_username');
    values.sb_password = this.store.get('sb_password');
    values.profile_priority = this.store.get('profile_priority');
    console.log("saving",curProfile.name,values)
    this.edit(curProfile.name, values, newName);

}

ProfileManager.prototype.syncActive = function(){
    var activeP = this.getActiveProfile();
    this.syncProfile(activeP.name);
}

Object.size = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};
