(function () {
  var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

  players.forEach(function (box) {
    var video = box.querySelector('video');
    var overlay = box.querySelector('.player-overlay');
    var mediaUrl = box.getAttribute('data-media');
    var started = false;
    var hls = null;

    function begin() {
      if (!video || !mediaUrl) {
        return;
      }

      box.classList.add('is-playing');

      if (!started) {
        started = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = mediaUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(mediaUrl);
          hls.attachMedia(video);
        } else {
          video.src = mediaUrl;
        }
      }

      var request = video.play();
      if (request && typeof request.catch === 'function') {
        request.catch(function () {});
      }
    }

    if (overlay) {
      overlay.addEventListener('click', begin);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (!started || video.paused) {
          begin();
        }
      });
    }

    window.addEventListener('pagehide', function () {
      if (hls) {
        hls.destroy();
        hls = null;
      }
    });
  });
})();
