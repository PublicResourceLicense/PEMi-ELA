jQuery(function($) {
    var sourceImg = $('<img>')[0],
        description = $('#description'),
        sourceCanvas = $('#source')[0],
        sourceCtx = sourceCanvas.getContext('2d'),
        compressedCanvas = $('#compressed')[0],
        compressedCtx = compressedCanvas.getContext('2d'),
        compressedOverlayCanvas = $('#compressedOverlay')[0],
        compressedOverlayCtx = compressedOverlayCanvas.getContext('2d'),
        all = $('canvas'),
        quality = 88,
        scale = 10;

    function analyzeImage(image){
        all.attr('width', image.width);
        all.attr('height', image.height);
        sourceCtx.drawImage(image, 0, 0);
        var sourceData = sourceCtx.getImageData(0, 0, image.width, image.height),
            compressed = $('<img>');
        $('<img>')
            .on('load', function() {
                compressedCtx.drawImage(this, 0, 0);
                var compressedData = compressedCtx.getImageData(0, 0, image.width, image.height),
                    data0 = sourceData.data,
                    data1 = compressedData.data;

                for(var i = 0, l = data0.length; i < l; i+=4) {
                    for(var j = 0; j < 3; j++) {
                        var error = Math.abs(data0[i+j]-data1[i+j]);
                        data0[i+j] = error*scale;
                    }
                }
                compressedCtx.putImageData(sourceData, 0, 0);
                compressedOverlayCtx.drawImage(compressedCanvas, 0, 0);
                $('#description').fadeOut('slow');
                $('#results').show();
            }).attr('src', sourceCanvas.toDataURL('image/jpeg', quality*0.01)); 
    }

    $('html')
        .on('dragover', function(e) {e.preventDefault(); return false;})
        .on('drop', function(e) {
            var files = e.originalEvent.dataTransfer.files;
            handleFiles(files);
            return false;
        });

    function handleFiles(files){
        if (files.length > 0) {
            var file = files[0];
            if (typeof FileReader !== "undefined" && file.type.indexOf("image") != -1) {
                var reader = new FileReader();
                // Note: addEventListener doesn't work in Google Chrome for this event
                reader.onload = function (evt) {
                    sourceImg.src = evt.target.result;
                };
                reader.readAsDataURL(file);
            }
        }
    }

    $('input[type=file]').change(function(e) { handleFiles(this.files); } );

    $('input[type=range]').on('change', function() {
            $(this).next('.value').text($(this).val());
            quality = document.forms[0].quality.value * 1;
            scale = document.forms[0].scale.value * 1;
            if(sourceImg.src) analyzeImage(sourceImg);
        }).change();

    $(sourceImg)
        .on('error', function () { alert('something went wrong when loading the image'); })
        .on('load', function () {
            _gaq.push(['_trackEvent', 'iela', 'imageAnalyzed']);
            analyzeImage(sourceImg);
        });
});
