var totalPoints = 600;
var updateInterval = 40;

// setup plot
var optionsCPU = cpuConfig
var optionsNet = netConfig

var cpuData = [[]];

function addCPUData(list) {
    if (cpuData[0].length > totalPoints) {
        for (var i = 0; i < cpuData.length; i++)
            cpuData[i].shift();
    }
    for (var i = 0; i < list.length; i++) {
        if (!cpuData[i]) {
            cpuData[i] = [];
        }
        var smooth = smoothNum(cpuData[i], list[i], 5)
        cpuData[i].push(smooth);

    }
    return addX(cpuData);
}

var netData = [[], []];
var prevUp = -1;
var prevDown = -1;
var prevTime = Date.now();

function addNetData(obj) {
    var time = Date.now();
    if (netData[0].length > totalPoints) {
        for (var i = 0; i < netData.length; i++)
            netData[i].shift();
    }
    if (prevUp == -1) {
        prevUp = obj.bytes_sent;
        prevDown = obj.bytes_recv;
    }

    var timeDiff = time - prevTime;
    prevTime = time;

    var down = smoothNum(netData[0], bytesToSpeed(obj.bytes_recv, prevDown, timeDiff), 5)
    netData[0].push(down);
    var up = smoothNum(netData[1], bytesToSpeed(obj.bytes_sent, prevUp, timeDiff), 5)
    netData[1].push(up);

    prevUp = obj.bytes_sent;
    prevDown = obj.bytes_recv;
    return addX(netData);
}

function updateCPU() {
    psutil.cpu_percent(0.05, true, function(err, res) {
        var data = addCPUData(res)
        plotCPU.setData(data);
        plotCPU.draw();

        //setTimeout(updateCPU, 30)
    });
    setTimeout(updateCPU, 30)
}

function updateNet() {
    psutil.network_io_counters(false, function(err, res) {
        var data = addNetData(res)
        plotNet.setData(data);
        plotNet.draw();

        //setTimeout(updateNet, 30)
    });
    setTimeout(updateNet, 30)
}

var firstMem = true
function updateMem() {
    psutil.virtual_memory(function(err, res) {
        var used = bToGB(res.used - res.cached)
        $("#memory").val(used)
        if (firstMem) {
            var total = bToGB(res.total)
            knobConfig.max = total
            $("#memory").knob(knobConfig)
            firstMem = false
        } else {
            $("#memory").trigger('change')
        }
        //setTimeout(updateMem, 5000)
    });
    setTimeout(updateMem, 5000)
}

function updateGPU() {
    var cmd = "aticonfig --adapter=0 --od-getclocks --od-gettemperature --pplib-cmd \"get fanspeed 0\" | egrep 'GPU load|Fan Speed|Temperature' | gawk '{gsub(/^[ ]*/,\"\",$0) ; print}'"
    exec(cmd, function(err, stdout, stderr) {
        stdout = stdout.split("\n")
        var load = parseInt(stdout[0].split(" ").pop())
        var temp = parseFloat(stdout[1].split("-")[1].trim().split(" ")[0])
        $("#gpuLoad").val(load).trigger('change')
        $("#gpuTemp").val(temp).trigger('change')
        //setTimeout(updateGPU, 5000)
    })
    setTimeout(updateGPU, 5000)
}

function updateCPUTemp() {
    var cmd = "sensors | grep temp1"
    exec(cmd, function(err, stdout, stderr) {
        stdout = stdout.split("\n")
        var temp = parseFloat(stdout[0].split("+")[1].split(" ")[0])
        $("#cpuTemp").val(temp).trigger('change')
        //setTimeout(updateCPUTemp, 5000)
    })
    setTimeout(updateCPUTemp, 5000)
}

var plotCPU = $.plot($("#cpu"), blankData(totalPoints), optionsCPU);
var plotNet = $.plot($("#net"), blankData(totalPoints), optionsNet);
function start() {
    knobConfig.max = 100
    $("#gpuLoad").knob(knobConfig)
    knobConfig.max = 90
    $("#gpuTemp").knob(knobConfig)
    knobConfig.max = 90
    $("#cpuTemp").knob(knobConfig)

    if ( typeof psutil !== "undefined") {
        //updateCPU();
        //updateNet();
        updateMem();
        updateGPU();
        updateCPUTemp();
    } else {
        setTimeout(start, 300);
    }
}

$(function() {
    start();
});
