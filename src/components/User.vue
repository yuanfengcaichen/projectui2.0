<template>
  <q-page class="q-pa-sm">
    <el-button-group style="margin-bottom: 10px">
      <el-button type="primary" icon="el-icon-document" @click="newmodal()">新建</el-button>
      <el-button type="primary" icon="el-icon-delete" @click="deleteitem()">删除</el-button>
      <el-button type="primary" icon="el-icon-refresh" @click="refresh()">刷新</el-button>
    </el-button-group>
    <el-table
            :data="userList"
            border
            style="width: 100%"
            @selection-change="handleSelectionChange">
      <el-table-column
              type="selection"
              width="55">
      </el-table-column>
      <el-table-column
              fixed
              prop="id"
              label="用户编号"
              width="150">
      </el-table-column>
      <el-table-column
              prop="username"
              label="用户名称"
              width="120">
      </el-table-column>
      <el-table-column
              prop="phone"
              label="手机号码"
              width="200">
      </el-table-column>
      <el-table-column
              prop="role.roleName"
              label="角色"
              width="120">
      </el-table-column>
      <el-table-column
              fixed="right"
              label="操作">
        <template slot-scope="scope">
          <el-button type="text" size="small" @click="update(scope.row)">编辑</el-button>
          <el-button type="text" size="small" @click="resetpass(scope.row)">重置密码</el-button>
<!--          <el-button type="text" size="small" @click="getroleperes(scope.row.id)">修改角色</el-button>-->
        </template>
      </el-table-column>
    </el-table>
    <div class="block" style="margin-top: 10px">
      <el-pagination
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
              :current-page="pageNum"
              :page-sizes="[5, 10, 20, 30, 40]"
              :page-size="pageSize"
              layout="total, sizes, prev, pager, next, jumper"
              :total="total">
      </el-pagination>
    </div>
    <el-drawer title="用户信息" :visible.sync="editdrawer" :with-header="false" :before-close="edithandleClose" ref="editdrawer" :title="drawerTitle">
      <el-form style="margin-top: 30px">
        <el-form-item label="用户id" :label-width="'100px'" v-if="false">
          <el-input v-model="id" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="用户姓名" :label-width="'90px'">
          <el-input v-model="username" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="用户密码" v-if="showpassinput" :label-width="'90px'">
          <el-input type="password" autocomplete="off" v-model="password" show-password></el-input>
        </el-form-item>
        <el-form-item label="手机号" :label-width="'90px'">
          <el-input v-model="phone" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="角色信息" :label-width="'90px'">
          <el-select v-model="roleId" clearable placeholder="请选择角色" size="small">
            <el-option
                    v-for="item in Allroles"
                    :key="item.id"
                    :label="item.roleName"
                    :value="item.id"
            >
            </el-option>
          </el-select>
        </el-form-item>

      </el-form>
      <div class="demo-drawer__footer">
        <el-button @click="canceleditForm">取 消</el-button>
        <el-button type="primary" @click="$refs.editdrawer.closeDrawer()" :loading="loading">{{ loading ? '提交中 ...' : '确 定' }}</el-button>
      </div>
    </el-drawer>
  </q-page>
</template>

<script>
  import {request4} from '../network/request.js'
  export default {
    name: "User",
    data() {
      return {
        userList: [],
        multipleSelection: [],
        pageNum: 1,
        pageSize: 5,
        total: 1,
        editdrawer: false,
        loading: false,
        timer: null,
        drawerTitle:'',
        showpassinput:true,
        id:0,
        username:'',
        password:'',
        phone:'',
        roleId:'',
        Allroles: [],
      }
    },
    computed: {
      user(){
        return this.$store.state.user
      }
    },
    methods: {
      getuserlist(){
        let that = this;
        request4({
          method: 'get',
          url: '/users',
          params: {
            pageNum: this.pageNum,
            pageSize: this.pageSize,
          }
        }).then(res=>{
          //console.log(res)
          that.userList = res.data.list
          that.total = res.data.total
        }).catch(err=>{
          console.log(err)
          this.error = true
        });
      },
      getrolelist(){
        let that = this;
        request4({
          method: 'get',
          url: '/allroles'
        }).then(res=>{
          //console.log(res)
          that.Allroles = res.data.roleList
        }).catch(err=>{
          console.log(err)
          this.error = true
        });
      },
      handleSelectionChange(val) {
        this.multipleSelection = val;
      },
      handleClick(row) {
        console.log(row);
      },
      handleSizeChange(val) {
        //console.log(`每页 ${val} 条`);
        this.pageSize = val
        this.getuserlist()
      },
      handleCurrentChange(val) {
        //console.log(`当前页: ${val}`);
        this.pageNum = val
        this.getuserlist()
      },
      newmodal(){
        this.drawerTitle="新建用户";
        this.showpassinput=true;
        this.id=0;
        this.username="";
        this.password=null;
        this.phone="";
        this.roleId=null;
        this.editdrawer = true;
      },
      update(row){
        this.drawerTitle="修改用户";
        this.showpassinput=false;
        this.id=row.id;
        this.username=row.username;
        this.password="********";
        this.phone=row.phone;
        this.roleId=row.roleId;
        this.editdrawer = true;
      },
      deleteitem(){
        if(this.multipleSelection.length!=0){
          let that = this;
          let uids = [];
          for(let i=0;i<this.multipleSelection.length;i++){
            uids.push(this.multipleSelection[i].id)
          }
          this.$confirm('确认删除？')
              .then(() => {
                request4({
                  method: 'delete',
                  url: '/user',
                  data: {"uids" : uids}
                }).then(res=>{
                  if(res.data.result==200&&res.data.type=='delete'){
                    that.$message({message: '用户删除成功',type: 'success'});
                  }
                  that.getuserlist()
                }).catch(err=>{
                  console.log(err)
                  that.$message({  message: '操作失败', type: 'error' });
                })
                that.multipleSelection = []
              })
              .catch(() => {});
        }
      },
      edithandleClose(){
        let that = this;
        this.$confirm('确定要提交表单吗？')
            .then(() => {
              this.loading = true;
              this.timer = setTimeout(() => {
                request4({
                  method: 'post',
                  url: '/user',
                  data: {
                    id:this.id,
                    username:this.username,
                    password:this.password,
                    phone:this.phone,
                    roleId:this.roleId,
                  }
                }).then(res=>{
                  if(res.data.result==200&&res.data.type=='add'){
                    that.$message({message: '用户添加成功',type: 'success'});
                  }
                  else if(res.data.result==200&&res.data.type=='edit'){
                    that.$message({message: '用户信息修改成功',type: 'success'});
                  }
                  that.getuserlist()
                }).catch(err=>{
                  console.log(err)
                  that.$message({
                    message: '操作失败',
                    type: 'error'
                  });
                });
                this.editdrawer = false;
                // 动画关闭需要一定的时间
                setTimeout(() => {
                  this.loading = false;
                }, 400);
              }, 500);
            })
      },
      resetpass(row){
        this.$confirm('确定要重置'+row.username+'的密码吗？')
            .then(() => {
              let that = this
              request4({
                method: 'post',
                url: '/resetpass/'+row.id,
              }).then(res=>{
                if(res.data.result==200&&res.data.type=='resetpassword'){
                  that.$message({message: '密码重置成功',type: 'success'});
                }
              }).catch(err=>{
                console.log(err)
                that.$message({
                  message: '密码重置成功失败',
                  type: 'error'
                });
              });
            })
      },
      canceleditForm(){
        this.editdrawer = false;
      },
      refresh(){
        this.getuserlist()
        this.$message({ message: '刷新成功', type: 'success' });
      }
    },
    created() {
      this.getuserlist()
      this.getrolelist()
    },
    mounted() {

    }
  }
</script>

<style scoped>

</style>