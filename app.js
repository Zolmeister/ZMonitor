var PSUtil = require('node-psutil').PSUtil;
var psutil = new PSUtil()
var fs = require('fs');
var sys = require('sys')
var exec = require('child_process').exec;
var express = require('express'), http = require('http'), path = require('path');

var app = express();
var server = http.createServer(app);
io = require('socket.io').listen(server);
io.configure('development', function() {
    io.set('log level', 1);
});

app.configure(function() {
    app.set('port', process.env.PORT || 3003);
    app.set('views', __dirname + '/views');
    app.set('view engine', 'dust');
    //dust.js default
    app.set('view options', {
        layout : false
    });
    //disable layout default
    app.locals({
        layout : false
    });
    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(express.static(path.join(__dirname, 'public')));
})

app.configure('development', function() {
    app.use(express.errorHandler());
});

app.get('/', function(req, res) {
    res.sendfile('index.html')
});

io.sockets.on('connection', function(socket) {
    function updateCPU() {
        psutil.cpu_percent(0.05, true, function(err, res) {
            socket.emit("cpu", res)
        });
    }

    function updateNet() {
        psutil.network_io_counters(false, function(err, res) {
            socket.emit("net", res)
        });
    }

    function updateMem() {
        psutil.virtual_memory(function(err, res) {
            socket.emit("mem", res)
        });
    }

    function updateGPU() {
        var cmd = "DISPLAY=:0 /usr/bin/aticonfig --adapter=0 --od-getclocks --od-gettemperature --pplib-cmd \"get fanspeed 0\" | egrep 'GPU load|Fan Speed|Temperature' | gawk '{gsub(/^[ ]*/,\"\",$0) ; print}'"
        exec(cmd, function(err, stdout, stderr) {
console.log(err)
console.log(stderr)
            socket.emit("gpu", stdout)
        })
    }

    function updateCPUTemp() {
        var cmd = "sensors | grep temp1"
        exec(cmd, function(err, stdout, stderr) {
            socket.emit("cpuTemp", stdout)
        })
    }

    var shortInterval = setInterval(function() {
        updateCPU();
        updateNet();
    }, 100)

    var longInterval = setInterval(function() {
        updateMem();
        updateGPU();
        updateCPUTemp();
    }, 5000)
    
    updateMem();
    updateGPU();
    updateCPUTemp();
    
    socket.on("disconnect", function() {
        clearInterval(longInterval)
        clearInterval(shortInterval)
    })
});

server.listen(app.get('port'), function() {
    console.log("Express server listening on port " + app.get('port'));
});
