import { reactive, ref } from "@vue/reactivity";

export const greetModalShown = ref(true);
export const commitModalShown = ref(false);
export const role = ref(null);
export const id = ref(Math.floor(Math.random() * 1000000))
export const signatures = reactive({});
