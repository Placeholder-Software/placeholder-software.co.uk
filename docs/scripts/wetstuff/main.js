$(function() {

    $("[data-carousel-video-container*='true']")
        .on("slide.bs.carousel", function (e) {

            //Find all videos in carousel and unset their src attribute
            $(this)
                .find("[data-carousel-video='true']")
                .each(function() {
                    this.setAttribute("src", "");
                    console.log("Unloaded video");
                });

            //Find video frames in the incoming object and set their src attribute
            $(e.relatedTarget)
                .find("[data-carousel-video='true']")
                .each(function() {
                    const dSrc = this.getAttribute("data-carousel-src");
                    this.setAttribute("src", dSrc);
                    console.log("Loaded video");
                });
        });

    //make the .cd-handle element draggable and modify .cd-resize-img width according to its position
    $('.cd-image-container').each(function(){
        var actual = $(this);
        gallery_drags(actual.find('.cd-handle'), actual.find('.cd-resize-img'), actual);
    });
        
});

//draggable funtionality - credits to http://css-tricks.com/snippets/jquery/draggable-without-jquery-ui/
function gallery_drags(dragElement, resizeElement, container)
{
    dragElement.on("mousedown vmousedown", function(e) {
        dragElement.addClass('draggable');
        resizeElement.addClass('resizable');
    
        var dragWidth = dragElement.outerWidth();
        var xPosition = dragElement.offset().left + dragWidth - e.pageX;
        var containerOffset = container.offset().left;
        var containerWidth = container.outerWidth();
        var minLeft = containerOffset + 40;
        var maxLeft = containerOffset + containerWidth - dragWidth - 40;
            
        dragElement.parents().on("mousemove vmousemove", function(e) {
            leftValue = e.pageX + xPosition - dragWidth;
                
            //constrain the draggable element to move inside its container
            if(leftValue < minLeft ) {
                leftValue = minLeft;
            } else if ( leftValue > maxLeft) {
                leftValue = maxLeft;
            }
    
            widthValue = (leftValue + dragWidth/2 - containerOffset)*100/containerWidth+'%';
    
            $('.draggable').css('left', widthValue).on("mouseup vmouseup", function() {
                $(this).removeClass('draggable');
                resizeElement.removeClass('resizable');
            });
    
            $('.resizable').css('width', widthValue); 
    
            //function to upadate images label visibility here
            // ...
    
        }).on("mouseup vmouseup", function(e){
            dragElement.removeClass('draggable');
            resizeElement.removeClass('resizable');
        });

        e.preventDefault();

    }).on("mouseup vmouseup", function(e) {
       dragElement.removeClass('draggable');
       resizeElement.removeClass('resizable');
    });
 }