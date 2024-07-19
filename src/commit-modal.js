import { Modal } from "bootstrap";
import { effect, ref } from "@vue/reactivity";
import $ from "jquery"; import { commitModalShown, id, signatures, } from "./stores";
import socket from "./socket";


export default function() {
  const autoCommit = ref(0);

  setInterval(() => {
    if (autoCommit.value <= 0) return;
    autoCommit.value = Math.max(autoCommit.value - 100, 0);
  }, 100)

  const $commit = $('#commitModal');
  const commitModal = new Modal($commit[0]);

  document.addEventListener('hidden.bs.modal', () => {
    commitModalShown.value = false;
  });

  $('#btnCommit').on('click', function() {
    socket.emit('commit', id.value);
    signatures[id.value].commited = true;
    id.value = Math.floor(Math.random() * 1000000);
  });

  $('#btnCancel').on('click', function() {
    socket.emit('delete', id.value);
    delete signatures[id.value];
  });

  effect(() => {
    if (commitModalShown.value) {
      autoCommit.value = 5000;
      commitModal.show();
    }
    else {
      commitModal.hide();
    }
  });

  const $progress = $('#commit-progress');
  effect(() => {
    $progress.width((autoCommit.value / 5000 * 100) + "%")
  });

  effect(() => {
    if (commitModalShown.value && autoCommit.value <= 0) {
      socket.emit('commit', id.value);
      signatures[id.value].commited = true;
      id.value = Math.floor(Math.random() * 1000000);
      commitModal.hide();
    }
  });
}
