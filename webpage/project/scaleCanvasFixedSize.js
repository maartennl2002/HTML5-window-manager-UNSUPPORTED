var gameCanvas;
var scale = 1;

var changeCanvasSizeEvent;

function initCanvas() {
    gameCanvas = document.getElementsByClassName("gameCanvas");
    
    for(var i = 0; i < gameCanvas.length; i++){
        gameCanvas[i].width = canvasWidth;
        gameCanvas[i].height = canvasHeight;
        
        gameCanvas[i].getContext("2d").imageSmoothingEnabled = false;
        gameCanvas[i].getContext("2d").mozImageSmoothingEnabled = false;
        gameCanvas[i].getContext("2d").webkitImageSmoothingEnabled = false;
        gameCanvas[i].getContext("2d").msImageSmoothingEnabled = false;
        gameCanvas[i].getContext("2d").oImageSmoothingEnabled = false;
    }
    
    addEvents();
    changeCanvasSize();
}

function changeCanvasSize() {
    for(var i = 0; i < gameCanvas.length; i++){
        var canvasScale = Math.min((gameCanvas[gameCanvas.length-1].parentElement.clientWidth - gameCanvas[gameCanvas.length-1].offsetLeft) / gameCanvas[i].width, (gameCanvas[gameCanvas.length-1].parentElement.clientHeight - gameCanvas[gameCanvas.length-1].offsetTop) / gameCanvas[i].height);
        
        gameCanvas[i].style.transformOrigin = "0 0";
        gameCanvas[i].style.transform = "scale(" + canvasScale + ")";
        gameCanvas[i].dispatchEvent(changeCanvasSizeEvent);
    }
    
    scale = Math.min((gameCanvas[gameCanvas.length-1].parentElement.clientWidth - gameCanvas[gameCanvas.length-1].offsetLeft) / canvasWidth, (gameCanvas[gameCanvas.length-1].parentElement.clientHeight - gameCanvas[gameCanvas.length-1].offsetTop) / canvasHeight);
}

function addEvents(){
    changeCanvasSizeEvent = new Event('onChangeCanvasSize');
}

window.onresize = function(event) {
    changeCanvasSize();
};


