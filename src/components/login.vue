<template>
  <div>
    <div class="main-box">
      <div class="content-box">
        <div class="form_div">
          <el-card class="box-card">
            <div slot="header">
              <span>亚龙展旗-项目管理</span>
            </div>
            <el-form ref="form" status-icon label-width="80px">
              <el-form-item label="用户名">
                <el-input v-model="une" autofocus></el-input>
              </el-form-item>
              <el-form-item label="用户密码">
                <el-input type="password" autocomplete="off" v-model="pwd" @keyup.enter.native="login" show-password></el-input>
              </el-form-item>
              <el-alert style="margin-top: 5px" v-if="error" title="用户名或密码错误" type="error"></el-alert>
                <el-button size="medium" type="primary" @click="login">登 录</el-button>
            </el-form>
          </el-card>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import {request4} from "../network/request";
  import {Loading} from "element-ui";

  export default {
    name: "login",
    data(){
      return{
        une:'',
        pwd:'',
        error:false,
      }
    },
    methods:{
      login(){
        request4({
          method: 'post',
          url: '/login',
          data: {
            username: this.une,
            password: this.pwd,
          }
        }).then(res=>{
          //console.log(res)
          localStorage.setItem('token', res.data.token)
          this.$router.push("/")
        }).catch(err=>{
          //console.log(err)
          this.error = true
        });
      },

    }
  }
</script>

<style>
  *{padding: 0px; margin: 0px;}
  .main-box{height: 100vh; background-color: #000; background-image: url(../assets/login/img/bg.jpg);background-size: 100% 110%; animation: changes 15s 0.2s linear infinite alternate;}
  .main-box{display: flex; align-items: center; text-align: center;}
  .content-box{flex: 1;width: 300px}
  .form_div{width: 450px;margin: auto}
  .foot{position: absolute; width: 100%; bottom: 1.5em; text-align: center;}
  .foot a{color: #EEE;}
  @keyframes changes {
    from {background-position: 0% 0%;}
    to {background-position: 0% 100%;}
  }
</style>