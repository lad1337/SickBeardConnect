var chrome2growlReconect;

var chrome2growl = { ws : null, opened : false, queue : [], icon : false, host : "127.0.0.1:8000", proxy : function(func) {
    var ctx = this;
    return function() {
        func.apply(ctx, arguments);
    };
}

, init : function(host, icon) {
    if (!window.webkitNotifications.__overrided)
        overrideNotifications();

    if (!host)
        host = this.host;
    else
        this.host = host;
    if (icon)
        this.setIcon(icon);

    this.host = host;
    this.ws = new WebSocket("ws://" + host);
    this.ws.onopen = this.proxy(this.onOpen);
    this.ws.onmessage = this.proxy(this.onMessage);
    this.ws.onclose = this.proxy(this.onClose);

    var ctx = this;
    chrome2growlReconect = setInterval(function() {
        ctx.reconnect();
    }, 30000);

}, setIcon : function(path) {
    this.icon = path;
}, delIcon : function(path) {
    this.icon = false;
}, reconnect : function(host) {
    if (this.host)
        host = this.host;
    if (!this.opened)
        this.init(host);
}, setHost : function(host) {
    this.init(host);
}
// Websocket::onopen
, onOpen : function() {
    this.opened = true;
    console && console.log && console.log('[CONNECION OK]');
    this.sendNotify();
}

// Websocket::onmessage
, onMessage : function(evt) {
    // console.debug(evt.data);
}

// Websocket::onclose
, onClose : function() {
    if (!this.opened) {
        window.webkitNotifications.__pageTest && alert('NodeJS is not accesable');
    }

    console && console.log && console.log('[CONNECTION CLOSED]');
    this.opened = false;

}

// Appel depuis l'API
, notify : function(icon, title, body) {
    if (this.icon)
        icon = this.icon;
    this.queue.push( { icon : icon, title : title, body : body });
    console.log(this.queue);
    if (!this.opened) {
        return;
    }

    this.sendNotify();
}

// Envoi les notifications
, sendNotify : function() {
    var i = this.queue.length;
    while (i--) {
        console && console.log && console.log('[SENDING] ' + this.queue[i]);
        this.ws.send(JSON.stringify(this.queue[i]));
    }

    this.queue = [];
} };

// overwrite createNotification
// http://www.chromium.org/developers/design-documents/desktop-notifications/api-specification
var ctxWebkitNotif = window.webkitNotifications;
var oldCreateNotification = ctxWebkitNotif.createNotification;
var oldCreateNotificationHTML = ctxWebkitNotif.createHTMLNotification;

function overrideNotifications() {
    window.webkitNotifications.createNotification = function(iconUrl, title, body) {
        console.log("creating notification ", iconUrl, title, body)
        var n = oldCreateNotification.call(ctxWebkitNotif, iconUrl, title, body);

        if (!chrome2growl.opened) {
            return n;
        }

        n.show = function() {
            console.log(n);
            chrome2growl.notify(iconUrl, title, body);
        };
        return n;
    };

    // Fallback
    window.webkitNotifications.createHTMLNotification = function(url) {
        if (!chrome2growl.opened) {
            return oldCreateNotificationHTML.call(ctxWebkitNotif, url);
        }

        var linkIcon = document.querySelectorAll('link[rel*=icon]');

        if (linkIcon.length) {
            linkIcon = linkIcon[0].getAttribute('href');
        }
        return window.webkitNotifications.createNotification(linkIcon || '', document.querySelector('title').text, '');
    };

    window.webkitNotifications.__overrided = true;
}

// chrome2growl.init();

