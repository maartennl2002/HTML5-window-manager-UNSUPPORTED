var editor;

var sok;
var dir = 'test.js';
var sendChange = false;
var skipChangeEvent = 0;

function initEditor() {
    editor = ace.edit("editor");
    editor.setTheme("ace/theme/dawn");
    editor.getSession().setMode("ace/mode/javascript");
    editor.$blockScrolling = Infinity;

    connect("ws://localhost:23456");

    editor.on("change", function(e) {
        if (skipChangeEvent <= 0) {
            if (sendChange) {
                var editDocument = editor.getSession().getDocument();

                if (e.lines.length <= 1) {
                    sok.send('changeLinePos');
                    sok.send(e.start.row);
                    sok.send('changeLineText');
                    sok.send(editDocument.getLine(e.start.row));
                } else {
                    sok.send('setLength');
                    sok.send(editDocument.getLength());
                    for (var i = 0; i < editDocument.getLength(); i++) {
                        sok.send('changeLinePos');
                        sok.send(i);
                        sok.send('changeLineText');
                        sok.send(editDocument.getLine(i));
                    }
                }
            }
        } else {
            skipChangeEvent = skipChangeEvent - 1;
        }
    });
}

function connect(url) {
    sok = new WebSocket(url, 'edit');
    sok.onopen = function() {
        console.log('connected');
        sok.send('setDir');
        sok.send(dir);
        setTimeout(function() {
            sok.send('sync');
        }, 100);
    };

    var lastMessage = '';
    var editRow = 0;
    sok.onmessage = function(event) {
        var editDocument = editor.getSession().getDocument();
        if (lastMessage == 'newLine') {
            editDocument.insertFullLines(editDocument.getLength() - 1, [event.data]);
        } else if (event.data == 'clear') {
            editDocument.removeFullLines(0, editDocument.getLength());
        } else if (event.data == 'endSync') {
            editDocument.removeFullLines(editDocument.getLength(), editDocument.getLength());
            sendChange = true;
        } else if (event.data == 'startSync') {
            sendChange = false;
        } else if (lastMessage == 'changeLinePos') {
            editRow = Number(event.data);
        } else if (lastMessage == 'changeLineText') {
            console.log('change: ' + event.data);
            if(editRow <= editDocument.getLength()){
                skipChangeEvent += 2;
                editDocument.removeFullLines(editRow, editRow);
                editDocument.insertFullLines(editRow, [event.data]);
            }
        } else if (lastMessage == 'setLength'){
            if(editDocument.getLength() >= Number(event.data)){
                for(var i = editDocument.getLength(); i <= Number(event.data); i++){
                    editDocument.insertFullLines(i, ['']);
                }
            }else{
                for(var j = Number(event.data); j > editDocument.getLength(); j--){
                    editDocument.removeFullLines(j, j);
                }
            }
        }
        lastMessage = event.data;
    };

    sok.onclose = function() {
        connect("ws://localhost:23456");
    };

    sok.onerror = function() {
        //connect("ws://rubikscraft.ml:23456");
    };
}