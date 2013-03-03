var totalPoints = 600;
var updateInterval = 40;

// setup plot
var cpuSmooth = new SmoothieChart({
  grid: { strokeStyle:'rgba(0, 0, 0,0)', fillStyle:'rgba(0, 0, 0,0)', },
  labels: { fillStyle:'rgba(0, 0, 0,0)' },
  maxValue:100,
  minValue:0
})

cpuSmooth.streamTo($("#cpu-smooth")[0], 2000)
var cpuCanv = $("#cpu-smooth")[0]
cpuCanv.width = window.innerWidth
cpuCanv.height = 100

var netSmooth = new SmoothieChart({
  grid: { strokeStyle:'rgba(0, 0, 0,0)', fillStyle:'rgba(0, 0, 0,0)', }
})
netSmooth.streamTo($("#net-smooth")[0], 2000)
var netCanv = $("#net-smooth")[0]
netCanv.width = window.innerWidth
netCanv.height = 100

var cpuLines = []
var cpuColors=[
    [255,152,64],
    [191,114,48],
    [255,69,64],
    [191,51,48],
    [38,151,45],
    [57,228,68],
    [52,198,205],
    [29,112,116]
    
]
for(var i=0;i<8;i++){
    var s = new TimeSeries()
    cpuLines[i] = s
    var c = cpuColors[i]
    cpuSmooth.addTimeSeries(s, {
        lineWidth: 1,
        strokeStyle : 'rgb('+c[0]+','+c[1]+','+c[2]+')',
        fillStyle : 'rgba('+c[0]+','+c[1]+','+c[2]+', .01)'
    })
}
    
function updateCPU(res) {
    var time = new Date().getTime()
    for(var i =0;i<res.length;i++){
        cpuLines[i].append(time, res[i])
    }
}

var netLines = []
var netColors=[
    [255,152,64],
    [29,112,116]
]
for(var i=0;i<2;i++){
    var s = new TimeSeries()
    netLines[i] = s
    var c = netColors[i]
    netSmooth.addTimeSeries(s, {
        lineWidth: 1,
        strokeStyle : 'rgb('+c[0]+','+c[1]+','+c[2]+')',
        fillStyle : 'rgba('+c[0]+','+c[1]+','+c[2]+', .02)'
    })
}

var prevUp = -1;
var prevDown = -1;
var prevTime = Date.now();

function updateNet(res) {
    var time = new Date().getTime()
    
    if (prevUp == -1) {
        prevUp = res.bytes_sent;
        prevDown = res.bytes_recv;
    }

    var timeDiff = time - prevTime;
    prevTime = time;

    var down = bytesToSpeed(res.bytes_recv, prevDown, timeDiff)
    var up = bytesToSpeed(res.bytes_sent, prevUp, timeDiff)

    prevUp = res.bytes_sent;
    prevDown = res.bytes_recv;
    
    netLines[0].append(time, down)
    netLines[1].append(time, up)
}

var firstMem = true
function updateMem(res) {
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
}

function updateGPU(stdout) {
    stdout = stdout.split("\n")
    var load = parseInt(stdout[0].split(" ").pop())
    var temp = parseFloat(stdout[1].split("-")[1].trim().split(" ")[0])
    $("#gpuLoad").val(load).trigger('change')
    $("#gpuTemp").val(temp).trigger('change')
}

function updateCPUTemp(stdout) {
    stdout = stdout.split("\n")
    var temp = parseFloat(stdout[0].split("+")[1].split(" ")[0])
    $("#cpuTemp").val(temp).trigger('change')
}


$(function() {
    knobConfig.max = 100
    $("#gpuLoad").knob(knobConfig)
    knobConfig.max = 90
    $("#gpuTemp").knob(knobConfig)
    knobConfig.max = 90
    $("#cpuTemp").knob(knobConfig)
    var socket = io.connect();
    socket.on("cpu", updateCPU)
    socket.on("net", updateNet)
    socket.on("cpuTemp", updateCPUTemp)
    socket.on("gpu", updateGPU)
    socket.on("mem", updateMem)
});
