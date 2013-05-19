var info = {
        "poke"    :   3,              // poke version 3
        "width"   :   2,              // 406 px default width
        "height"  :   1,              // 200 px default height
        "path"    :   "aNTP.html",
        "v2"      :   {
                        "resize"    :   false,  // Set to true ONLY if you create a range below.
                                               // Set to false to disable resizing
                        "min_width" :   1,     // 200 px min width
                        "max_width" :   2,     // 406 px max width
                        "min_height":   1,     // 200 px min height
                        "max_height":   1      // 200 px max height
        },
        "v3"      :   {
                        "multi_placement": false // Allows the widget to be placed more than once
                                                // Set to false unless you allow users to customize each one
                      }
};

//Below is the required poke listener
//DO NOT MODIFY ANY OF THE BELOW CODE
chrome.extension.onMessageExternal.addListener(function(request, sender, sendResponse) {
if(request === "mgmiemnjjchgkmgbeljfocdjjnpjnmcg-poke") {
 chrome.extension.sendMessage(
   sender.id,
   {
     head: "mgmiemnjjchgkmgbeljfocdjjnpjnmcg-pokeback",
     body: info
   }
 );
}
});
//Above is the required poke listener
//DO NOT MODIFY ANY OF THE ABOVE CODE