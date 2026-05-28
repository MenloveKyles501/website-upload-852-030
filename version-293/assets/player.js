import { H as Hls } from './hls.js';

const shells = Array.from(document.querySelectorAll('.player-shell'));

shells.forEach(function (shell) {
  const video = shell.querySelector('.movie-video');
  const trigger = shell.querySelector('.play-layer');
  const stream = shell.getAttribute('data-stream');
  let started = false;
  let hls = null;

  async function startPlayback() {
    if (!video || !stream) {
      return;
    }

    if (!started) {
      started = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else if (Hls.isSupported()) {
        hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
      } else {
        video.src = stream;
      }
    }

    if (trigger) {
      trigger.classList.add('is-hidden');
    }

    try {
      await video.play();
    } catch (error) {
      if (trigger) {
        trigger.classList.remove('is-hidden');
      }
    }
  }

  if (trigger) {
    trigger.addEventListener('click', startPlayback);
  }

  if (video) {
    video.addEventListener('click', function () {
      if (!video.src || video.paused) {
        startPlayback();
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
