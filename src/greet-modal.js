import { Modal } from "bootstrap";
import { effect } from "@vue/reactivity";
import $ from "jquery"; import { greetModalShown, role } from "./stores";

async function fullScreen() {
  try {
    await document.documentElement.requestFullscreen();
  } catch (e) {
    console.log(e);
  }
  try {
    await window.screen.orientation.lock('landscape')
  } catch (e) {
    console.log(e);
  }
}

export default function() {
  const $greet = $('#greetModal');
  const greetModal = new Modal($greet[0]);

  document.addEventListener('hidden.bs.modal', () => {
    greetModalShown.value = false;
  });

  $('#btnSignatory').click(function() {
    role.value = 'signatory';
    fullScreen();
  });

  $('#btnDisplay').click(function() {
    role.value = 'display';
    fullScreen();
  });

  effect(() => {
    if (greetModalShown.value) {
      greetModal.show();
    }
    else {
      greetModal.hide();
    }
  });
}
