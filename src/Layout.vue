<template>
  <q-layout>
    <q-header class="bg-grey-2 text-black">
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          @click="leftDrawerOpen = !leftDrawerOpen"
          aria-label="Menu"
          icon="mdi-menu"
        />
        <q-toolbar-title>
          亚龙展旗-项目管理
        </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" bordered content-class="bg-grey-2">
      <q-list>
        <q-item clickable @click="$router.push('/')">
          <q-item-section avatar>
            <q-icon name="mdi-code-tags" />
          </q-item-section>
          <q-item-section>
            <q-item-label>项目管理</q-item-label>
          </q-item-section>
        </q-item>
        <q-item clickable @click="$router.push('/user')" v-if="checkPre('userPage')">
          <q-item-section avatar>
            <q-icon name="mdi-account-box" />
          </q-item-section>
          <q-item-section>
            <q-item-label>用户管理</q-item-label>
          </q-item-section>
        </q-item>
        <q-item clickable @click="$router.push('/role')" v-if="checkPre('rolePage')">
          <q-item-section avatar>
            <q-icon name="mdi-file-document-box-multiple" />
          </q-item-section>
          <q-item-section>
            <q-item-label>角色管理</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import {request4} from "./network/request";

export default {
  name: "Layout",
  data() {
    return {
      leftDrawerOpen: false,
      une:'',
      pwd:'',
      dialogVisible: false,
      error:false,
    };
  },
  computed:{
    user(){
      return this.$store.state.user
    }
  },
  methods:{
    getuserinfo(){
      request4({
        method: 'get',
        url: '/userinfo',
      }).then(res=>{
        //console.log(res)
        if(res.data.userinfo.uid!=0 && res.data.token!=undefined){
          let user={}
          user = res.data.userinfo
          user.login = true
          user.token = res.data.token
          user.expire = res.data.expire
          //console.log(user)
          this.$store.commit('login',user)
        }
        else{
          this.error = true
        }
      }).catch(err=>{
        console.log(err)
        this.error = true
      });
    },
    checkPre(precode){
      let permissions=this.user.permissions;
      for(let i=0;i<permissions.length;i++){
        if(precode==permissions[i].permissionCode){
          return true
        }
      }
      return false
    }
  },
  created() {
    this.getuserinfo()
  }
};
</script>

<style>
  @import "./assets/normalize.css";
</style>
