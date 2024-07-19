import canvas from "./canvas";
import commitModal from "./commit-modal";
import display from "./display";
import greetModal from "./greet-modal";

export default function App() {
  greetModal();
  commitModal();
  canvas();
  display();
}
