(function () {
    // Removing Apple emojis on other platforms
    const isAppleDevice =
        /Mac|iPhone|iPad|iPod/.test(navigator.platform) ||
        (/Mac/.test(navigator.userAgent) && "ontouchend" in document);

    if (isAppleDevice) {
        document.documentElement.classList.add("apple-device");
    }

    // Custom fontSize for Inter
    document.addEventListener("DOMContentLoaded", function () {
        const ps = document.querySelectorAll(".horizontal-timeline .events-content p");

        ps.forEach(function (p) {
            const computedFont = window.getComputedStyle(p).fontFamily;

            if (computedFont && computedFont.toLowerCase().includes("inter")) {
                p.style.fontSize = "0.85rem";
            }
        });
    });

    // Force Safari to recalculate layout on resize
    window.addEventListener("resize", function () {
        var el = document.querySelector(".sidebar-horizontal-container");

        if (el) {
            el.style.display = "none";
            el.offsetHeight;
            el.style.display = "";
        }
    });
})();
