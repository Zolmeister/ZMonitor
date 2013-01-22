// load appjs

var appjs = require('appjs');
var PSUtil = require('node-psutil').PSUtil;
var fs = require('fs');
var sys = require('sys')
var exec = require('child_process').exec;
// serve static files from a directory
appjs.serveFilesFrom(__dirname + '/public');

// handle requests from the browser
appjs.router.get('/', function(request, response, next){
  response.send(fs.readFileSync("index.html"));
})
// create a window
var window = appjs.createWindow({
  width: 700,
  height: 600,
  alpha: false,
});

// prepare the window when first created
window.on('create', function(){
  console.log("Window Created");
  // window.frame controls the desktop window
  window.frame.show()//.center();
});

// the window is ready when the DOM is loaded
window.on('ready', function(){
  console.log("Window Ready");
  // directly interact with the DOM
  //window.process = process;
  //window.module = module;
  window.psutil = new PSUtil();
  window.exec = exec;
  //window.frame.openDevTools();
  window.addEventListener('keydown', function(e){
    // show chrome devtools on f12 or commmand+option+j
    if (e.keyIdentifier === 'F12' || e.keyCode === 74 && e.metaKey && e.altKey) {
      window.frame.openDevTools();
    }
  });
});

// cleanup code when window is closed
window.on('close', function(){
  console.log("Window Closed");
});