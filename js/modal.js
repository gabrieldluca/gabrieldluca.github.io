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

        // Preload image to get natural size
        var img = new window.Image();
        var maxSize = getMaxModalImageSize();

        img.onload = function () {
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
            $modalShimmer.show();
            $modalImage.attr("src", imageSrc);
        };

        img.onerror = function () {
            // Fallback dimensions
            var fallbackHeight = maxSize.height;
            var fallbackWidth = fallbackHeight * (img.naturalWidth / img.naturalHeight);

            $modalShimmer.css({ width: fallbackWidth + "px", height: fallbackHeight + "px" });
            $modalShimmer.show();
            $modalImage.attr("src", imageSrc);
        };

        img.src = imageSrc;
    }

    function showModalWithImage(imageSrc) {
        openModal();
        resetShimmerDimensions();
        showShimmerForImage(imageSrc);

        // Set up image load handler
        $modalImage.off("load").on("load", function () {
            $modalShimmer.hide();
            $modalImage.show();
        });
    }

    // =====================
    // Utility Functions
    // =====================

    function resetShimmerDimensions() {
        $modalShimmer.css({
            width: "0px",
            height: "0px"
        });
    }

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
