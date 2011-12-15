var info = {
        poke:   1,
        width:  2,
        height: 2,
        path:   "aNTP.html"
};

// This listener is essential to building a widget.
chrome.extension.onRequestExternal.addListener(function(request, sender, sendResponse) {
  // The NTP extension will "poke" all installed extensions. Only extensions listening
  // will respond with the necessary information (entered above). Changing this value
  // will cause your widget to not display within the NTP widget manager.
  if(request === "mgmiemnjjchgkmgbeljfocdjjnpjnmcg-poke") {
    // Now let's respond with our details. I decided to go with this method instead of
    // the sendResponse function for security. Responses carry no identification, but
    // luckily, normal sendRequests do.
    chrome.extension.sendRequest(
      sender.id,
      {
        head: "mgmiemnjjchgkmgbeljfocdjjnpjnmcg-pokeback",
        body: info
      }
    );
  }
});