$(function() {

    $("[data-carousel-video-container*='true']")
        .on('slide.bs.carousel', function (e) {

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
});