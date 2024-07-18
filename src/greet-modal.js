import { Modal } from "bootstrap";
import { effect } from "@vue/reactivity";
import $ from "jquery"; import { greetModalShown, role } from "./stores";


export default function() {
  const $greet = $('#greetModal');
  const greetModal = new Modal($greet[0]);

  document.addEventListener('hidden.bs.modal', () => {
    greetModalShown.value = false;
  });

  $('#btnSignatory').click(function() {
    role.value = 'signatory';
  });

  $('#btnDisplay').click(function() {
    role.value = 'display';
  });

  effect(() => {
    if (greetModalShown.value) {
      document.documentElement.requestFullscreen();
      if (screen.orientation.lock) {
        screen.orientation.lock('landscape');
      }
      greetModal.show();
    }
    else greetModal.hide();
  });
}
