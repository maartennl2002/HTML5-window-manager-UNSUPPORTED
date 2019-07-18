
var mouseX = 0;
var mouseY = 0;

function initInput(){
    document.addEventListener('mousemove', mouseMove, false);
}

function mouseMove(e){
    var tempX = Math.floor((e.clientX - gameCanvas[gameCanvas.length-1].offsetLeft));
    var tempY = Math.floor((e.clientY - gameCanvas[gameCanvas.length-1].offsetTop));
    if(tempX >= 0 && 
        tempX <= (gameCanvas[gameCanvas.length-1].width * scale) && 
        tempY >= 0 && 
        tempY <= (gameCanvas[gameCanvas.length-1].height*scale)){
            mouseX = Math.floor(tempX / scale);
            mouseY = Math.floor(tempY / scale);
    }
}

function getMousePos(){
    return {x:mouseX, y:mouseY};
}

