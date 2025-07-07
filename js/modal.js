jQuery(document).ready(function ($) {
    var $modal = $("#documentModal");
    var $modalImage = $("#modalImage");
    var $modalShimmer = $("#modalShimmer");
    var clearSrcTimeout = null;

    bindEventHandlers();

    // =====================
    // Event Handlers
    // =====================
    function bindEventHandlers() {
        $(".awards-container").on("click", function () {
            var imageSrc = $(this).data("document");

            if (imageSrc) {
                if (clearSrcTimeout) {
                    clearTimeout(clearSrcTimeout);
                    clearSrcTimeout = null;
                }

                showModalWithImage(imageSrc);
            }
        });

        $(".modal-backdrop").on("click", function () {
            closeModal();
        });

        $(document).on("keydown", function (e) {
            if (e.key === "Escape" && $modal.hasClass("show")) {
                closeModal();
            }
        });
    }

    // =====================
    // Modal State Functions
    // =====================
    function openModal() {
        $modal.addClass("show");
        $("body").css("overflow", "hidden"); // Prevent background scrolling
    }

    function closeModal() {
        $modal.removeClass("show");
        $("body").css("overflow", ""); // Restore scrolling
        clearSrcTimeout = setTimeout(function () {
            $modalImage.attr("src", "");
            clearSrcTimeout = null;
        }, 300);
    }

    // =====================
    // Shimmer & Image Logic
    // =====================
    function showShimmerForImage(imageSrc) {
        $modalImage.hide();
        $modalShimmer.show();
        // Preload image to get natural size
        var img = new window.Image();

        img.onload = function () {
            var maxSize = getMaxModalImageSize();
            var fitted = calculateFittedImageSize(
                img.naturalWidth,
                img.naturalHeight,
                maxSize.width,
                maxSize.height,
                imageSrc
            );

            $modalShimmer.css({
                width: fitted.width + "px",
                height: fitted.height + "px"
            });
        };

        img.onerror = function () {
            $modalShimmer.css({ width: "300px", height: "180px" });
        };

        img.src = imageSrc;
    }

    function showModalWithImage(imageSrc) {
        openModal();
        showShimmerForImage(imageSrc);
        $modalImage.attr("src", imageSrc);
        $modalImage.off("load").on("load", function () {
            $modalShimmer.hide();
            $modalImage.show();
        });
    }

    // =====================
    // Utility Functions
    // =====================
    function getMaxModalImageSize() {
        var isMobile = $(window).width() <= 667;

        return {
            width: $(window).width() * (isMobile ? 0.85 : 0.75),
            height: $(window).height() * 0.9
        };
    }

    function calculateFittedImageSize(naturalWidth, naturalHeight, maxWidth, maxHeight, imageSrc) {
        var width = naturalWidth;
        var height = naturalHeight;

        var isWiderImage = imageSrc.includes("TOEFL");

        if (isWiderImage) {
            // Image is wider than the container
            width = Math.min(width, maxWidth);
            height = width * (naturalHeight / naturalWidth);
        } else {
            // Image is taller than the container
            height = Math.min(height, maxHeight);
            width = height * (naturalWidth / naturalHeight);
        }

        return { width: width, height: height };
    }
});
