import Vue from 'vue'
import Vuex from 'vuex'

import { Loading } from 'element-ui';

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    user: {
      islogin: false,
    }
  },
  mutations: {
    login(state,user){
      state.user = user
    },
  },
  actions: {
    checklogin(){
      return this.state.user.islogin
    }
  },
  modules: {
  }
})
