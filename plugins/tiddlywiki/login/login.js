/*\
title: $:/plugins/tiddlywiki/login/login.js
type: application/javascript
module-type: widget

\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

var CONFIG_COOKIE_TIDDLER = "$:/config/tiddlyweb/cookie",
  DEFAULT_COOKIE_TIDDLER = "UserName"

function Cookies() { 
  var self = this; 
  self.__parsed__ = false;
  self.parse();
}
Cookies.prototype.parse = function() {
  var self = this;
  self.__parsed__ = true;
  var cookies = document.cookie.split(/\s*;\s*/g);
  console.log("cookies: "+document.cookie);
  var cookie;
  for(var c = 0; c<cookies.length; c++) {
    console.log("cookie: "+cookies[c]);
    cookie = cookies[c].split("=");
    self[cookie[0]] = cookie[1];
    //if (cookie[0]=='expires') self.__persist__ = true;
  }    
}
Cookies.prototype.set = function(name, value, days) {
  var self = this;
  self[name] = value;
  //var str = name+"="+value+";path=/";
  var str = name+"="+value;
  if (days) {
    var d = new Date();
    d.setTime(d.getTime() + (days*24*60*60*1000));
    str += ";expires="+d.toUTCString();
  }
  if (days==0) {
    str += ";expires=Thu, 01 Jan 1970 00:00:00 GMT";
    self[name]=null;
    delete self[name];
  }
  document.cookie = str;
  console.log("setting cookie: "+str);
}

var logger = new $tw.utils.Logger("Login");
logger.log("Hi from login-plugin!");	
if ($tw.node) {
	var logger = new $tw.utils.Logger("Login:node");
	logger.log($tw.wiki.getTiddlerText("$:/SiteTitle"));
}
if ($tw.browser) {
	var logger = new $tw.utils.Logger("Login:browser");
	logger.log($tw.wiki.getTiddlerText("$:/SiteTitle"));
  $tw.wiki.addEventListener('change', function(data) {
    for(var a in data) {
      //console.log("changed: "+a);
      var matcher = /^\$:\/status\/UserName$/.exec(a);
      if (matcher) {
        var cookies = new Cookies();
        //console.log(""+$tw.wiki.getTiddler(a).getFieldString('text'));
        var userName = $tw.wiki.getTiddlerText(a);
        var cookie = $tw.wiki.getTiddlerText(CONFIG_COOKIE_TIDDLER,DEFAULT_COOKIE_TIDDLER);
        cookies.set(cookie, userName, userName?100:0);
        if (!userName) $tw.wiki.addTiddler(new $tw.Tiddler("$:/status/IsLoggedIn", { text: "no"}));
      }
    }
  });

  /*var cookies = new Cookies();
  if (cookies['UserName']) {
    console.log("UserName found: "+cookies['UserName']);
    $tw.wiki.addTiddler(new $tw.Tiddler("$:/status/UserName", { "text": cookies['UserName'] }));
  }*/
}

})();
