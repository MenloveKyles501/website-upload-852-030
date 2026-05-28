(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    function normalize(value) {
        return (value || "").toString().trim().toLowerCase();
    }

    ready(function () {
        var toggle = document.querySelector(".menu-toggle");
        var panel = document.querySelector(".mobile-panel");
        if (toggle && panel) {
            toggle.addEventListener("click", function () {
                panel.classList.toggle("open");
            });
        }

        var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
        var current = 0;
        var timer = null;

        function showSlide(next) {
            if (!slides.length) {
                return;
            }
            current = (next + slides.length) % slides.length;
            slides.forEach(function (slide, index) {
                slide.classList.toggle("active", index === current);
            });
            dots.forEach(function (dot, index) {
                dot.classList.toggle("active", index === current);
            });
        }

        function playSlides() {
            if (timer) {
                window.clearInterval(timer);
            }
            if (slides.length > 1) {
                timer = window.setInterval(function () {
                    showSlide(current + 1);
                }, 5000);
            }
        }

        var prev = document.querySelector(".hero-prev");
        var next = document.querySelector(".hero-next");
        if (prev) {
            prev.addEventListener("click", function () {
                showSlide(current - 1);
                playSlides();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                showSlide(current + 1);
                playSlides();
            });
        }
        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                showSlide(index);
                playSlides();
            });
        });
        showSlide(0);
        playSlides();

        var params = new URLSearchParams(window.location.search);
        var searchValue = params.get("search") || "";
        var searchInput = document.querySelector("[data-filter-search]");
        var regionSelect = document.querySelector("[data-filter-region]");
        var yearSelect = document.querySelector("[data-filter-year]");
        var typeSelect = document.querySelector("[data-filter-type]");
        var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card[data-title]"));

        function applyFilters() {
            var q = normalize(searchInput ? searchInput.value : "");
            var region = normalize(regionSelect ? regionSelect.value : "");
            var year = normalize(yearSelect ? yearSelect.value : "");
            var type = normalize(typeSelect ? typeSelect.value : "");
            cards.forEach(function (card) {
                var haystack = normalize([
                    card.getAttribute("data-title"),
                    card.getAttribute("data-region"),
                    card.getAttribute("data-year"),
                    card.getAttribute("data-genre"),
                    card.getAttribute("data-tags"),
                    card.getAttribute("data-line")
                ].join(" "));
                var ok = true;
                if (q && haystack.indexOf(q) === -1) {
                    ok = false;
                }
                if (region && normalize(card.getAttribute("data-region")) !== region) {
                    ok = false;
                }
                if (year && normalize(card.getAttribute("data-year")) !== year) {
                    ok = false;
                }
                if (type && normalize(card.getAttribute("data-type")) !== type) {
                    ok = false;
                }
                card.classList.toggle("hidden-card", !ok);
            });
        }

        if (searchInput) {
            if (searchValue) {
                searchInput.value = searchValue;
            }
            [searchInput, regionSelect, yearSelect, typeSelect].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", applyFilters);
                    control.addEventListener("change", applyFilters);
                }
            });
            applyFilters();
        }
    });

    window.attachMoviePlayer = function (video, overlay, source) {
        if (!video || !source) {
            return;
        }
        var attached = false;
        var hls = null;

        function bindSource() {
            if (attached) {
                return;
            }
            attached = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
            } else {
                video.src = source;
            }
        }

        function start() {
            bindSource();
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
            video.controls = true;
            var action = video.play();
            if (action && action.catch) {
                action.catch(function () {});
            }
        }

        if (overlay) {
            overlay.addEventListener("click", start);
        }
        video.addEventListener("click", function () {
            if (!attached || video.paused) {
                start();
            }
        });
        video.addEventListener("play", function () {
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
        });
        window.addEventListener("beforeunload", function () {
            if (hls) {
                hls.destroy();
            }
        });
    };
})();
