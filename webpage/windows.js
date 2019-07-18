var resizing = false;
var moving = false;
var usingWindow;
var xOffset = 0;
var yOffset = 0;
var windowWidth = 0;
var windowHeight = 0;
var mouseX = 0;
var mouseY = 0;
var lastId = 0;
var minimumWindowZIndex = 10;
var isfullscreen = false;
var stickList = [];
var stickAll = false;
var stickHideAttribute = 'stickHide';
var stickCodeAttribute = 'stickCode';

initWindowResize();

function startResizeWindow(resizingWindow) {
    this.usingWindow = resizingWindow;

    xOffset = mouseX - resizingWindow.getBoundingClientRect().left;
    yOffset = mouseY - resizingWindow.getBoundingClientRect().top;
    windowWidth = resizingWindow.getBoundingClientRect().width;
    windowHeight = resizingWindow.getBoundingClientRect().height;

    resizing = true;
}

function stopResizeWindow() {
    resizing = false;
}

function startMoveWindow(movingWindow) {
    this.usingWindow = movingWindow;

    xOffset = mouseX - movingWindow.getBoundingClientRect().left;
    yOffset = mouseY - movingWindow.getBoundingClientRect().top;
    windowWidth = movingWindow.getBoundingClientRect().width;
    windowHeight = movingWindow.getBoundingClientRect().height;

    moving = true;
}

function stopMoveWindow() {
    moving = false;
}

function initWindowResize() {
    document.addEventListener('mousemove', mouseMove);
    document.addEventListener('mouseup', mouseUp);
}

function addIframeToWindowResize(iframe) {
    iframe.contentWindow.addEventListener('mouseup', mouseUp);
    iframe.contentWindow.addEventListener('mousemove', mouseMoveIframe);
}

function mouseUp(e) {
    stopResizeWindow();
    stopMoveWindow();
}

function mouseMove(e) {
    mouseX = e.clientX;
    mouseY = e.clientY;

    if (resizing) {
        resizeWindow(e.clientX, e.clientY, usingWindow);
        deselectAll();
    }

    if (moving) {
        moveWindow(e.clientX, e.clientY, usingWindow);
        deselectAll();
    }
}

function mouseMoveIframe(e) {
    var targetElement = e.target || e.srcElement;
    var targetDocument = targetElement.ownerDocument;
    var iFrames = document.getElementsByTagName("iframe");

    var offsetX = 0;
    var offsetY = 0;

    for (var i = 0; i < iFrames.length; i++) {
        if (iFrames[i].contentDocument === targetDocument) {
            offsetX = iFrames[i].getBoundingClientRect().left + document.documentElement.scrollLeft;
            offsetY = iFrames[i].getBoundingClientRect().top + document.documentElement.scrollTop;
        }
    }

    if (resizing) {
        resizeWindow(e.clientX + offsetX, e.clientY + offsetY, usingWindow);
    }

    if (moving) {
        moveWindow(e.clientX + offsetX, e.clientY + offsetY, usingWindow);
    }
}

function resizeWindow(x, y, windowDiv) {
    var newWindowWidth = (x + document.documentElement.scrollLeft) - (windowDiv.getBoundingClientRect().left + document.documentElement.scrollLeft) - xOffset + windowWidth;
    var newWindowHeight = (y + document.documentElement.scrollTop) - (windowDiv.getBoundingClientRect().top + document.documentElement.scrollTop) - yOffset + windowHeight;
    resizeWindowHW(windowDiv, newWindowWidth, newWindowHeight, false);
}

function resizeWindowHWId(id, windowWidth, windowHeight, force) {
    var windowDiv = document.getElementById("window" + id.toString());
    return resizeWindowHW(windowDiv, windowWidth, windowHeight, force);
}

function resizeWindowHW(windowDiv, windowWidth, windowHeight, force) {
    if ((!isStuck(windowDiv) && !stickAll) || force) {
        windowDiv.style.width = Math.floor(windowWidth).toString() + "px";
        windowDiv.style.height = Math.floor(windowHeight).toString() + "px";
        return true;
    } else {
        return false;
    }
}



function moveWindow(x, y, windowDiv) {
    var windows = document.getElementById("windows");
    var windowX = (x + document.documentElement.scrollLeft) - (windowDiv.parentNode.getBoundingClientRect().left) - xOffset;
    var windowY = (y + document.documentElement.scrollTop) - (windowDiv.parentNode.getBoundingClientRect().top) - yOffset;
    var windowWidth = windowDiv.clientWidth;
    var windowHeight = windowDiv.clientHeight;
    var windowsWidth = windows.clientWidth;
    var windowsHeight = windows.clientHeight;

    if (windowX < 0) {
        windowX = 0;
    }
    if (windowX > windowsWidth - windowWidth) {
        windowX = windowsWidth - windowWidth;
    }
    if (windowY < 0) {
        windowY = 0;
    }
    if (windowY > windowsHeight - windowHeight) {
        windowY = windowsHeight - windowHeight;
    }
    moveWindowXY(windowDiv, windowX, windowY, false);
}

function moveWindowXYId(id, x, y, force) {
    var windowDiv = document.getElementById("window" + id.toString());
    return moveWindowXY(windowDiv, x, y, force);
}

function moveWindowXY(windowDiv, x, y, force) {
    if ((!isStuck(windowDiv) && !stickAll) || force) {
        windowDiv.style.left = x.toString() + "px";
        windowDiv.style.top = y.toString() + "px";
        return true;
    } else {
        return false;
    }
}

function deselectAll() {
    if (document.selection) {
        document.selection.empty();
    } else {
        window.getSelection().removeAllRanges();
    }
}

function addWindow(template, title, url) {
    var id = lastId + 1;

    var windows = document.getElementById("windows");
    var windowput = "";
    var client = new XMLHttpRequest();
    client.open('GET', template, true);
    client.onreadystatechange = function() {
        windowput = client.responseText;
    };
    client.send();

    client.onload = function() {
        var windowDiv = document.createElement("div");
        windows.appendChild(windowDiv);
        windowput = windowput.split('[url]').join(url);
        windowput = windowput.split('[title]').join(title);
        windowput = windowput.split('[id]').join(id.toString());
        windowDiv.outerHTML = windowput;
        focusWindow(id, true);
    };


    lastId = id;

}

var lastWindowPos = {
    x: 0,
    y: 0,
    height: 0,
    width: 0
};

function fullscreen(id) {
    var all = document.getElementById("windows");
    var bottom = document.getElementById("buttonsBottomDiv" + id.toString());
    var edit = document.getElementById("iframe" + id.toString());
    var windowDiv = document.getElementById("window" + id.toString());
    if (!isfullscreen) {
        isfullscreen = true;

        lastWindowPos = {
            x: windowDiv.getBoundingClientRect().left - all.getBoundingClientRect().left - document.documentElement.scrollLeft,
            y: windowDiv.getBoundingClientRect().top - all.getBoundingClientRect().top - document.documentElement.scrollTop,
            width: windowDiv.getBoundingClientRect().width,
            height: windowDiv.getBoundingClientRect().height
        };

        //bottom.style.height = "0px";
        edit.style.height = "calc(100% - 30px)";
        bottom.style.display = "none";

        moveWindowXYId(id, 0, 0, true);
        resizeWindowHWId(id, all.clientWidth, all.clientHeight, true);
        focusWindow(id, true);
    } else {
        isfullscreen = false;
        //bottom.style.height = "30px";
        if (!stickAll && !stickList.contains(id)) {
            bottom.style.display = "block";
            edit.style.height = "calc(100% - 60px)";
        }
        moveWindowXYId(id, lastWindowPos.x, lastWindowPos.y, true);
        resizeWindowHWId(id, lastWindowPos.width, lastWindowPos.height, true);
        focusWindow(id, true);
    }
}

function closeWindow(id) {
    document.getElementById("window" + id.toString()).outerHTML = "";
    sortZIndexWindows();
}

function focusWindow(id, force) {
    if (force || ((!stickAll) && (!stickList.contains(id)))) {
        var windowDiv = document.getElementById("window" + id.toString());
        setWindowToFront(windowDiv);
    }
}

function setWindowToFront(windowDiv) {
    var windows = document.getElementById("windows");
    var defaultz = Number(windowDiv.style.zIndex);
    var front = 0;

    for (var i = 0; i < windows.children.length; i++) {
        if (Number(windows.children[i].style.zIndex) > front) {
            front = Number(windows.children[i].style.zIndex);
        }

    }
    windowDiv.style.zIndex = (Math.max(minimumWindowZIndex, (front + 1))).toString();
    sortZIndexWindows();
}

function sortZIndexWindows() {
    var windows = document.getElementById("windows");
    var taken = [];

    for (var i = 0; i < windows.children.length; i++) {
        var smallestZ = 1000; //maak meer future proof
        var smallest;

        for (var j = 0; j < windows.children.length; j++) {
            if ((!taken.contains(j)) && Number(windows.children[j].style.zIndex) <= smallestZ) {
                smallestZ = Number(windows.children[j].style.zIndex);
                smallest = j;
            }
        }
        windows.children[smallest].style.zIndex = (i + minimumWindowZIndex).toString();
        taken[taken.length] = smallest;
    }
}

function stickToggle(id) {
    if (stickList.contains(id)) {
        stickList.splice(stickList.indexOf(id), 1);
        if (!stickAll) {
            stickHide(document.getElementById('window' + id.toString()), false);
            stickCode(document.getElementById('window' + id.toString()), false);
        }
    } else {
        stickList[stickList.length] = id;
        if (!stickAll) {
            stickHide(document.getElementById('window' + id.toString()), true);
            stickCode(document.getElementById('window' + id.toString()), true);
        }
    }
}

function stickAllToggle() {
    var windows = document.getElementById('windows').children;
    if (stickAll === true) {
        stickAll = false;
        for (var i = 0; i < windows.length; i++) {
            if (!stickList.contains(Number(windows[i].id.split('window').join('')))) {
                stickHide(windows[i], false);
                stickCode(windows[i], false);
            }
        }
    } else {
        stickAll = true;
        for (var i = 0; i < windows.length; i++) {
            if (!stickList.contains(Number(windows[i].id.split('window').join('')))) {
                stickHide(windows[i], true);
                stickCode(windows[i], true);
            }
        }
    }
}

function isStuckId(id) {
    if ((stickAll && stickList.contains(id)) || (stickAll || stickList.contains(id))) {
        return true;
    } else {
        return false;
    }
}

function isStuck(windowDiv) {
    var id = Number(windowDiv.id.split('window').join(''));
    return isStuckId(id);
}

function stickHide(elem, hide) {
    var elements = elem.getElementsByTagName('*');
    for (var i = 0; i < elements.length; i++) {
        if (elements[i].hasAttribute(stickHideAttribute) && elements[i].getAttribute(stickHideAttribute) == 'true') {
            if (hide) {
                elements[i].style.display = "none";
            } else {
                elements[i].style.display = "block";
            }
        }
    }
}

function stickCode(elem, hide) {
    var elements = elem.getElementsByTagName('*');
    for (var i = 0; i < elements.length; i++) {
        if (elements[i].hasAttribute(stickCodeAttribute)) {
            var code = elements[i].getAttribute(stickCodeAttribute);

            var thisElement = elements[i];
            eval(code);
        }
    }
}





Array.prototype.contains = function(obj) {
    for (var i = 0; i < this.length; i++) {
        if (this[i] == obj) {
            return true;
        }
    }
    return false;
};