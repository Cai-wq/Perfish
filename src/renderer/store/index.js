import Vue from 'vue'
import Vuex from 'vuex'
import app from './modules/app'
import user from './modules/user'
import performance from './modules/performance'
import getters from './getters'
import VuexPersistence from 'vuex-persist'

Vue.use(Vuex)

// 持久化缓存
const vuexLocal = new VuexPersistence({
  storage: window.localStorage
})

const store = new Vuex.Store({
  plugins: [vuexLocal.plugin],
  modules: {
    app,
    user,
    performance
  },
  getters
})

export default store
