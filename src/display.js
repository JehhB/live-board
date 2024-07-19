import { effect } from "@vue/reactivity";
import socket from "./socket"
import $ from "jquery";
import { role } from "./stores";

export default function() {
  const canvas = document.getElementById('drawingCanvas');
  const tempCanvas = document.createElement('canvas');
  const tempCtx = tempCanvas.getContext('2d');

  const bgImage = new Image();
  bgImage.src = '/bg.png';
  bgImage.onload = () => {
    tempCanvas.width = bgImage.width;
    tempCanvas.height = bgImage.height;
  };

  const $buttons = $('.display-button');
  effect(() => {
    if (role.value == 'display') $buttons.show();
    else $buttons.hide();
  });

  $('#btnClear').on('click', () => {
    socket.emit('clear', 0);
  });

  $('#btnSave').on('click', () => {
    tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
    tempCtx.drawImage(bgImage, 0, 0, tempCanvas.width, tempCanvas.height);
    tempCtx.drawImage(canvas, 0, 0, tempCanvas.width, tempCanvas.height);

    const link = tempCanvas.toDataURL('image/png').replace('image/png', 'image/octet-stream');
    const $link = $('<a>')
      .attr('download', 'commitment-wall.png')
      .attr('href', link)
      .addClass('sr-only')
      .appendTo('body');
    $link[0].click();
    $link.remove();
  });
}
