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
