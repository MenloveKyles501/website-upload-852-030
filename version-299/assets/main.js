(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
            return;
        }
        document.addEventListener("DOMContentLoaded", fn);
    }

    function normalize(value) {
        return (value || "").toString().trim().toLowerCase();
    }

    ready(function () {
        var toggle = document.querySelector("[data-menu-toggle]");
        var panel = document.querySelector("[data-mobile-panel]");
        if (toggle && panel) {
            toggle.addEventListener("click", function () {
                panel.classList.toggle("is-open");
            });
        }

        var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
        if (slides.length > 1) {
            var current = 0;
            var show = function (index) {
                current = (index + slides.length) % slides.length;
                slides.forEach(function (slide, i) {
                    slide.classList.toggle("is-active", i === current);
                });
                dots.forEach(function (dot, i) {
                    dot.classList.toggle("is-active", i === current);
                });
            };
            dots.forEach(function (dot, i) {
                dot.addEventListener("click", function () {
                    show(i);
                });
            });
            window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card-item"));
        var searchInput = document.querySelector("[data-search-input]");
        var regionSelect = document.querySelector("[data-region-filter]");
        var yearSelect = document.querySelector("[data-year-filter]");
        var typeSelect = document.querySelector("[data-type-filter]");
        var resetButton = document.querySelector("[data-filter-reset]");
        var noResult = document.querySelector("[data-no-result]");

        if (searchInput && cards.length) {
            var params = new URLSearchParams(window.location.search);
            var query = params.get("q");
            if (query) {
                searchInput.value = query;
            }

            var applyFilters = function () {
                var q = normalize(searchInput.value);
                var region = regionSelect ? normalize(regionSelect.value) : "";
                var year = yearSelect ? normalize(yearSelect.value) : "";
                var type = typeSelect ? normalize(typeSelect.value) : "";
                var visible = 0;

                cards.forEach(function (card) {
                    var haystack = normalize([
                        card.dataset.title,
                        card.dataset.tags,
                        card.dataset.region,
                        card.dataset.year,
                        card.dataset.type,
                        card.dataset.genre
                    ].join(" "));
                    var matched = true;
                    if (q && haystack.indexOf(q) === -1) {
                        matched = false;
                    }
                    if (region && normalize(card.dataset.region) !== region) {
                        matched = false;
                    }
                    if (year && normalize(card.dataset.year) !== year) {
                        matched = false;
                    }
                    if (type && normalize(card.dataset.type) !== type) {
                        matched = false;
                    }
                    card.style.display = matched ? "" : "none";
                    if (matched) {
                        visible += 1;
                    }
                });

                if (noResult) {
                    noResult.classList.toggle("is-visible", visible === 0);
                }
            };

            searchInput.addEventListener("input", applyFilters);
            [regionSelect, yearSelect, typeSelect].forEach(function (select) {
                if (select) {
                    select.addEventListener("change", applyFilters);
                }
            });
            if (resetButton) {
                resetButton.addEventListener("click", function () {
                    searchInput.value = "";
                    if (regionSelect) {
                        regionSelect.value = "";
                    }
                    if (yearSelect) {
                        yearSelect.value = "";
                    }
                    if (typeSelect) {
                        typeSelect.value = "";
                    }
                    applyFilters();
                });
            }
            applyFilters();
        }
    });
})();
