import $ from "jquery";
import App from './src/index.js';

$(function() {
  App();

  function toggleFullScreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      if (screen.orientation.lock) {
        screen.orientation.lock('landscape');
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }

  document.addEventListener('dblclick', toggleFullScreen);
});
