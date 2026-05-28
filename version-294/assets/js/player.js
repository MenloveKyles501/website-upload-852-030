(function () {
  function startPlayer(shell) {
    var video = shell.querySelector('.js-hls-player');
    if (!video) {
      return;
    }
    var source = video.getAttribute('data-hls');
    if (!source) {
      return;
    }
    shell.classList.add('is-started');

    if (video.getAttribute('data-ready') === '1') {
      video.play().catch(function () {});
      return;
    }

    video.setAttribute('data-ready', '1');

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
        video.play().catch(function () {});
      });
      hls.on(window.Hls.Events.ERROR, function (event, data) {
        if (!data || !data.fatal) {
          return;
        }
        if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
          hls.startLoad();
        } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
          hls.recoverMediaError();
        } else {
          hls.destroy();
        }
      });
      video._hls = hls;
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      video.addEventListener('loadedmetadata', function () {
        video.play().catch(function () {});
      }, { once: true });
      video.load();
    }
  }

  document.querySelectorAll('.player-shell').forEach(function (shell) {
    var video = shell.querySelector('.js-hls-player');
    var button = shell.querySelector('[data-player-button]');
    if (button) {
      button.addEventListener('click', function () {
        startPlayer(shell);
      });
    }
    if (video) {
      video.addEventListener('play', function () {
        shell.classList.add('is-started');
      });
    }
  });
})();
