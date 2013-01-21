$(function() {

    var totalPoints = 600;
    var updateInterval = 40;

    // setup plot
    var options = {
        series : {
            shadowSize : 0,
            lines : {
                lineWidth : 1
            }
        }, // drawing is faster without shadows
        yaxis : {
            min : 0,
            max : 100
        },
        xaxis : {
            show : false
        }
    };

    var cpuData = [[]];

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
        var resM = [];
        for (var i = 0; i < cpuData.length; i++) {
            var res = [];
            for (var x = 0; x < cpuData[i].length; x++) {
                res.push([x, cpuData[i][x]])
            }

            resM.push(res);
        }
        return resM;
    }

    function updateCPU() {
        psutil.cpu_percent(0.05, true, function(err, res) {
            var data = addCPUData(res)
            plotCPU.setData(data);
            plotCPU.draw();

            setTimeout(updateCPU, 30)
        });
    }

    function blankData(length) {
        var blank = [[]];
        for (var i = 0; i < length; i++) {
            var tmp = [i, 0];
            blank[0].push(tmp)
        }
        return blank
    }
    var plotCPU = $.plot($("#cpu"), blankData(totalPoints), options);
    function start() {
        if ( typeof psutil !== "undefined") {
            updateCPU();
        } else {
            setTimeout(start, 300);
        }
    }

    start();
});
