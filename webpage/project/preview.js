function updatePreview(){
    var previewIframe = document.getElementById('preview');
    previewIframe = ifrm.contentWindow || ifrm.contentDocument.document || ifrm.contentDocument;
    previewIframe.document.open();
    previewIframe.document.write('');
    previewIframe.document.close();
}




