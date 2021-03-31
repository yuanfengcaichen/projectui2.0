import Vue from 'vue'
import VueRouter from 'vue-router'

//避免出现重复路由问题
const originalPush = VueRouter.prototype.push

// VueRouter.prototype.push = function push(location) {
//   return originalPush.call(this, location).catch(err => console.log(err))
// }

Vue.use(VueRouter)

import Layout from "../Layout";
import login from "../components/login.vue";
import Gantt from '../components/Gantt.vue';
const Role = () => import('../components/Role.vue')
const User = () => import('../components/User.vue')
const routes = [
  {
    path: '/login',
    component: login
  },
  {
    path:'/',
    component:Layout,
    children:[
      { path:'/', component: Gantt},
      { path: '/Gantt', component: Gantt },
      { path: '/Role', component: Role },
      { path: '/User', component: User }
    ]
  },

]

const router = new VueRouter({
  mode: 'history',
  routes
})

export default router
