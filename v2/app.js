
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , http = require('http')
  , path = require('path');
  
var PSUtil = require('node-psutil').PSUtil;
var fs = require('fs');
var sys = require('sys')
var exec = require('child_process').exec;
var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', routes.index);

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

psutil = new PSUtil();


function updateCPU() {
    psutil.cpu_percent(0.05, true, function(err, res) {
        //console.log(res)
        setTimeout(updateCPU,10)
    });
}

function updateNet() {
    psutil.network_io_counters(false, function(err, res) {
        //console.log(res)
        setTimeout(updateNet, 10)
    });
}

var firstMem = true
function updateMem() {
    psutil.virtual_memory(function(err, res) {
        var used = bToGB(res.used - res.cached)
        //console.log(used)
        setTimeout(updateMem, 50)
    });
}

function updateGPU() {
    var cmd = "aticonfig --adapter=0 --od-getclocks --od-gettemperature --pplib-cmd \"get fanspeed 0\" | egrep 'GPU load|Fan Speed|Temperature' | gawk '{gsub(/^[ ]*/,\"\",$0) ; print}'"
    exec(cmd, function(err, stdout, stderr) {
        stdout = stdout.split("\n")
        var load = parseInt(stdout[0].split(" ").pop())
        var temp = parseFloat(stdout[1].split("-")[1].trim().split(" ")[0])
        //console.log(load)
        //console.log(temp)
        setTimeout(updateGPU, 50)
    })
}

function updateCPUTemp() {
    var cmd = "sensors | grep temp1"
    exec(cmd, function(err, stdout, stderr) {
        stdout = stdout.split("\n")
        var temp = parseFloat(stdout[0].split("+")[1].split(" ")[0])
        //console.log(temp)
        setTimeout(updateCPUTemp, 50)
    })
}

updateCPU();
updateNet();
updateMem();
updateGPU();
updateCPUTemp();

function smoothNum(data, num, factor) {
    factor = factor || 3;
    var sum = 0;
    var cnt = 0;
    for (var i = data.length - 1; i >= 0 && i >= data.length - 1 - factor; i--) {
        sum += data[i];
        cnt++;
    }
    return (num + sum) / (cnt + 1)
}

function blankData(length) {
    var blank = [[]];
    for (var i = 0; i < length; i++) {
        var tmp = [i, 0];
        blank[0].push(tmp)
    }
    return blank
}

function bToGB(b) {
    return parseFloat((b / 1000 / 1000 / 1000).toFixed(1))//byetes - kb - mb - gb
}

function bytesToSpeed(current, prev, timeDiff) {
    var bytePerSec = (current - prev) / timeDiff * 1000
    return Math.round(bytePerSec / 1000)
}

function addX(data) {
    var resM = [];
    for (var i = 0; i < data.length; i++) {
        var res = [];
        for (var x = 0; x < data[i].length; x++) {
            res.push([x, data[i][x]])
        }

        resM.push(res);
    }
    return resM;
}
