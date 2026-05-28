(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
            return;
        }
        document.addEventListener("DOMContentLoaded", fn);
    }

    ready(function () {
        var boxes = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
        boxes.forEach(function (box) {
            var video = box.querySelector("video");
            var trigger = box.querySelector("[data-play-trigger]");
            var stream = box.getAttribute("data-stream");
            var started = false;
            var hls = null;

            if (!video || !stream) {
                return;
            }

            var prepare = function () {
                if (started) {
                    return;
                }
                started = true;
                if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(stream);
                    hls.attachMedia(video);
                } else {
                    video.src = stream;
                }
            };

            var play = function () {
                prepare();
                video.controls = true;
                if (trigger) {
                    trigger.classList.add("is-hidden");
                }
                var action = video.play();
                if (action && action.catch) {
                    action.catch(function () {});
                }
            };

            if (trigger) {
                trigger.addEventListener("click", function (event) {
                    event.preventDefault();
                    play();
                });
            }

            video.addEventListener("click", function () {
                if (video.paused) {
                    play();
                }
            });

            video.addEventListener("play", function () {
                if (trigger) {
                    trigger.classList.add("is-hidden");
                }
            });

            window.addEventListener("pagehide", function () {
                if (hls && hls.destroy) {
                    hls.destroy();
                }
            });
        });
    });
})();
