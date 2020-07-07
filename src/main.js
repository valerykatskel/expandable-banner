import Vue from "vue";
import App from "./App.vue";
import Vue2TouchEvents from "vue2-touch-events";
import VueResizeObserver from "vue-resize-observer";
import "./assets/scss/main.scss";

Vue.use(VueResizeObserver);
Vue.use(Vue2TouchEvents);

Vue.config.productionTip = false;
new Vue({
  render: (h) => h(App),
}).$mount("#app");
