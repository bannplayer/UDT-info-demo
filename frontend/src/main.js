import Vue from 'vue'
import App from './App.vue'

Vue.config.productionTip = false

import axios from "./axios.js"
Vue.prototype.$http = axios

import transaction from "./transaction/transaction.js";
Vue.prototype.$transaction = transaction

import cell from "./transaction/cell.js";
Vue.prototype.$cell = cell

import utils from "./transaction/utils.js";
Vue.prototype.$utils = utils

import wallet from "./transaction/wallet.js";
Vue.prototype.$wallet = wallet

import config from "./transaction/config.js";
Vue.prototype.$config = config

new Vue({
    render: h => h(App),
}).$mount('#app')
