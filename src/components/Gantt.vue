<template>
  <q-page class="q-pa-sm" >
    <el-row type="flex" justify="end" align="middle">
<!--      <el-button-->
<!--              type="primary"-->
<!--              @click="openFullScreen1"-->
<!--              >-->
<!--        指令方式-->
<!--      </el-button>-->
      <el-tooltip class="item" effect="dark" content="仅添加单个项目" placement="bottom">
        <el-button v-if="checkPre('insert')" @click="addTask" icon="el-icon-plus" size="small">添加项目</el-button>
      </el-tooltip>
      <el-tooltip class="item" effect="dark" content="将为项目添加五个子阶段" placement="bottom">
        <el-button v-if="checkPre('insert')" @click="addConsultTask" icon="el-icon-plus" size="small">添加咨询项目</el-button>
      </el-tooltip>
      <el-button v-if="checkPre('update')" @click="updateTask" icon="el-icon-edit" type="primary" size="small">修改项目</el-button>
      <el-button @click="setday(new Date().getTime())" type="primary" size="small" style="margin-right: 20px">今天</el-button>
      <el-date-picker style="margin-right: 20px"
                      v-model="selectday"
                      type="date"
                      placeholder="选择日期"
                      format="yyyy 年 MM 月 dd 日"
                      @change="setday(selectday)"
                      size="small"
                      value-format="timestamp">
      </el-date-picker>
      <el-select v-if="checkPre('selectAll')" v-model="task_userselect" clearable placeholder="请选择人员" @change="selectUserChange" size="small" style="margin-right: 20px" v-loading.fullscreen.lock="fullscreenLoading">
        <el-option
                v-for="item in userList"
                :key="item.id"
                :label="item.username"
                :value="item.username"
        >
        </el-option>
      </el-select>
      <div class="block">
        <span class="demonstration">缩放级别</span>
        <el-input-number style="margin-right: 20px" v-model="timeZoom" size="small" :min="21" :max="26" @change="changeTimeZoom"></el-input-number>
      </div>
      <el-switch style="margin-right: 20px" active-text="展示任务列表" v-model="taskdisplay" @change="showList" >
      </el-switch>
    </el-row>
    <div style="margin-top: 10px;" />
    <el-tabs v-model="activeName">
      <el-tab-pane label="项目信息" name="first">
        <gantt-elastic
                ref="gantt"
                :options="options"
                :tasks="tasks"
                @tasks-changed="tasksUpdate"
                @options-changed="optionsUpdate"
                @dynamic-style-changed="styleUpdate"
                v-if="checkPre('select')"
        >
          <!--      <gantt-header slot="header"></gantt-header>-->
        </gantt-elastic>
        <div class="q-mt-md" />
      </el-tab-pane>
      <el-tab-pane label="汇总信息" name="second">
        <!--汇总信息开始-->
        <el-row justify="center" align="middle" type="flex" v-if="checkPre('totalInfo')">
          <el-col :span="12">
            <h3 style="font-size: 22px;">
              项目汇总信息
            </h3>
            <el-table :data="parents" stripe border style="width: 60%" size="mini">
              <el-table-column prop="label" label="地区" width="180" align="center">
              </el-table-column>
              <el-table-column prop="children.length" label="项目数量" align="center">
              </el-table-column>
            </el-table>
          </el-col>
          <el-col :span="12">
            <h3 style="font-size: 22px;">
              人员出差信息
            </h3>
            <el-table :data="userinfos" stripe border style="width: 60%" size="mini">
              <el-table-column prop="user.username" label="姓名"  width="180" align="center">
              </el-table-column>
              <el-table-column prop="location" label="出差地点" align="center">
              </el-table-column>
            </el-table>
          </el-col>
        </el-row>
        <!--汇总信息结束-->
      </el-tab-pane>
    </el-tabs>
    <el-drawer
            :title="drawerTitle"
            :before-close="handleClose"
            :visible.sync="dialog"
            direction="rtl"
            custom-class="demo-drawer"
            ref="drawer"
    >
      <div class="demo-drawer__content">
        <el-form :model="form" label-width="80px" size="mini">
          <el-form-item label="项目选择" :label-width="formLabelWidth" v-if="drawerTitle == '修改项目'">
            <el-cascader
                    v-model="update_Taskids"
                    :options="parents"
                    :props="{ checkStrictly: true }"
                    @change="updateChange"
                    clearable></el-cascader>
          </el-form-item>
          <el-form-item label="项目名称" :label-width="formLabelWidth">
            <el-input v-model="form.label" autocomplete="off"></el-input>
          </el-form-item>
          <el-form-item label="项目负责人" :label-width="formLabelWidth">
            <el-input v-if="!checkPre('insertAll')" v-model="form.user" autocomplete="off" :disabled="true"></el-input>
            <el-select v-if="checkPre('insertAll')" v-model="form.user" clearable placeholder="请选择" size="small">
              <el-option
                      v-for="item in userList"
                      :key="item.id"
                      :label="item.username"
                      :value="item.username"
              >
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="开始时间" :label-width="formLabelWidth">
            <el-date-picker
                    v-model="form.startTime"
                    align="right"
                    type="date"
                    placeholder="选择日期"
                    :picker-options="pickerOptions">
            </el-date-picker>
          </el-form-item>
          <el-form-item label="结束时间" :label-width="formLabelWidth">
            <el-date-picker
                    v-model="form.endTime"
                    align="right"
                    type="date"
                    placeholder="选择日期"
                    :picker-options="pickerOptions">
            </el-date-picker>
          </el-form-item>
          <el-form-item label="项目进度" :label-width="formLabelWidth">
            <el-input-number v-model="form.percent" :min="0" :max="100" label="项目进度"></el-input-number>
          </el-form-item>
          <el-form-item label="任务类型" :label-width="formLabelWidth">
            <el-select v-model="form.type" placeholder="请选择任务类型">
              <el-option label="项目" value="project"></el-option>
              <el-option label="任务" value="task"></el-option>
              <el-option label="出差" value="milestone"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="父节点" :label-width="formLabelWidth">
            <el-cascader
                    v-model="taskParentList"
                    :options="parents"
                    :props="{ checkStrictly: true }"
                    @change="parentChange"
                    clearable></el-cascader>
<!--            <el-input v-model="form.parentId" autocomplete="off"></el-input>-->
          </el-form-item>
          <el-form-item label="是否折叠" :label-width="formLabelWidth">
            <el-switch v-model="collState" @change="collStateChange"></el-switch>
          </el-form-item>
          <el-form-item label="已完成颜色" :label-width="formLabelWidth">
            <el-color-picker v-model="form.fill"></el-color-picker>
          </el-form-item>
          <el-form-item label="未完成颜色" :label-width="formLabelWidth">
            <el-color-picker v-model="form.stroke"></el-color-picker>
          </el-form-item>

<!--          <el-form-item label="活动区域" :label-width="formLabelWidth">-->
<!--            <el-select v-model="form.region" placeholder="请选择活动区域">-->
<!--              <el-option label="区域一" value="shanghai"></el-option>-->
<!--              <el-option label="区域二" value="beijing"></el-option>-->
<!--            </el-select>-->
<!--          </el-form-item>-->
        </el-form>
        <div class="demo-drawer__footer">
          <el-button @click="cancelForm">取 消</el-button>
          <el-button type="primary" @click="$refs.drawer.closeDrawer()" :loading="loading">{{ loading ? '提交中 ...' : '确 定' }}</el-button>
        </div>
      </div>
    </el-drawer>
  </q-page>
</template>

<style>
  .gantt-elastic__main-container-wrapper{
    height: 90%;
  }
  h2{
    line-height: 24px!important;
  }
  .el-drawer__body {
    padding: 20px;
    padding-top: 0px;
  }
  .demo-drawer__footer{
    display: flex;
  }
  .demo-drawer__footer button {
    flex: 1;
  }
</style>

<script>
import GanttElastic from "gantt-elastic";
import GanttHeader from "gantt-elastic-header";
import dayjs from "dayjs";
import {request4} from '../network/request.js'
// just helper to get current dates
function getDate(hours) {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  const currentDay = currentDate.getDate();
  const timeStamp = new Date(
    currentYear,
    currentMonth,
    currentDay,
    0,
    0,
    0
  ).getTime();
  return new Date(timeStamp + hours * 60 * 60 * 1000).getTime();
}
function getdays(){
  return Math.ceil(( new Date() - new Date(new Date().getFullYear().toString()))/(24*60*60*1000))+1;
}
let tasks = [
  {
    id: 0,
    label: "初始化中...",
    user: "",
    start: getDate(-24 * 5),
    duration: 15 * 24 * 60 * 60 * 1000,
    percent: 85,
    type: "project"
    //collapsed: true,
  }

];
let options = {
  taskMapping: {
    progress: "percent"
  },
  maxRows: 100,
  maxHeight: 500,
  title: {
    label: "Your project title as html (link or whatever...)",
    html: false
  },
  row: {
    height: 24,
    width: 10
  },
  calendar: {
    hour: {
      display: false
    }
  },
  chart: {
    progress: {
      bar: false
    },
    expander: {
      display: true
    },
  },
  taskList: {
    display: true,
    expander: {
      straight: false
    },
    columns: [
      {
        id: 0,
        label: "ID",
        value: "id",
        width: 40
      },
      {
        id: 1,
        label: "项目名称",
        value: "label",
        width: 240,
        expander: true,
        html: true,
        events: {
          click({ data, column }) {
            let message="";
            message=message+"项目ID："+data.id+"\n"
            message=message+"项目名称："+data.label+"\n"
            message=message+"负责人："+data.user+"\n"
            message=message+"开始时间："+dayjs(data.startTime).format("YYYY-MM-DD")+"\n"
            message=message+"结束时间："+dayjs(data.endTime).format("YYYY-MM-DD")+"\n"
            message=message+"进度："+data.percent+"%\n"
            alert(message);
            //console.log(data);
            //console.log(column);
          }
        }
      },
      {
        id: 2,
        label: "项目负责人",
        value: "user",
        width: 80,
        html: true,
        events: {
          /*mousemove({ data, column }) {
            console.log(data)
            data.style={
              'task-list-header-label': {
                'text-align': 'center',
                width: '100%',
                'background':'red',

              },
              'task-list-item-value-container': {
                'text-align': 'right',
                'color':'red',
                width: '100%',
              },
            }
            console.log(data)
          },*/
          // mouseout({ data, column }) {
          //   data.style={
          //   }
          // }
        }
      },
      {
        id: 3,
        label: "开始时间",
        value: task => dayjs(task.startTime).format("YYYY-MM-DD"),
        width: 78
      },
      {
        id: 4,
        label: "结束时间",
        value: task => dayjs(task.endTime).format("YYYY-MM-DD"),
        width: 78
      },
      {
        id: 5,
        label: "进度%",
        value: "progress",
        width: 70,
        style: {
          "task-list-header-label": {
            "text-align": "center",
            width: "100%",
          },
          "task-list-item-value": {
            "text-align": "center",
            width: "100%",
            //"background" : "red"
          }
        }
      }
    ]
  },
  locale: {
    name: "en",
    Now: "Now",
    "X-Scale": "Zoom-X",
    "Y-Scale": "Zoom-Y",
    "Task list width": "Task list",
    "Before/After": "Expand",
    "Display task list": "Task list",
    weekdays: ["周日", "周一", "周二", "周三", "周四", "周五", "周六"],
    months: [
      "一月",
      "二月",
      "三月",
      "四月",
      "五月",
      "六月",
      "七月",
      "八月",
      "九月",
      "十月",
      "十一月",
      "十二月",
    ],
  },
  times: {
    timeZoom: 22,
    timeScale: 60 * 1000,
  },
  // scope: {
  //   before:getdays(),
  //   after:366-getdays()
  // }
};

export default {
  name: "Gantt",
  components: {
    GanttElastic,
    GanttHeader
  },
  computed:{
    user(){
      return this.$store.state.user
    }
  },
  data() {
    return {
      fullscreenLoading: false,
      tasks:tasks,
      parents:[],
      taskParentList:[],
      update_Taskids:[],
      selectday:'',
      options,
      taskdisplay:true,
      timeZoom:22,
      dynamicStyle: {},
      typeList:{},
      userList:[],
      task_userselect:'',
      dialog: false,
      collState: true,
      form: {
        id: '',
        label: '',
        user: '',
        startTime: '',
        endTime: '',
        percent: 0,
        type: '',
        parentId: '',
        collapsed : 1,
        fill:'#0287D0',
        stroke:'#0077C0',
      },
      drawerTitle: '',
      formLabelWidth: '100px',
      timer: null,
      loading: false,
      activeName: 'first',
      userinfos:[],
      pickerOptions: {
        disabledDate(time) {
          //return time.getTime() > Date.now();
          time.getTime() > Date.now();
          return false
        },
        shortcuts: [{
          text: '今天',
          onClick(picker) {
            picker.$emit('pick', new Date());
          }
        }, {
          text: '昨天',
          onClick(picker) {
            const date = new Date();
            date.setTime(date.getTime() - 3600 * 1000 * 24);
            picker.$emit('pick', date);
          }
        }, {
          text: '一周前',
          onClick(picker) {
            const date = new Date();
            date.setTime(date.getTime() - 3600 * 1000 * 24 * 7);
            picker.$emit('pick', date);
          }
        }]
      },
    };
  },
  methods: {
    initData(){
      this.form.id='';
      this.form.label='';
      this.form.user=this.user.username;
      this.form.startTime='';
      this.form.endTime='';
      this.form.percent=0;
      this.form.type='task';
      this.form.parentId='';
      this.form.collapsed=1;
      this.form.fill='#0287D0';
      this.form.stroke='#0077C0';
      this.taskParentList=[];
      this.update_Taskids=[];
    },
    collStateChange(value){
      if(value==true){
        this.form.collapsed=1;
      }
      else{
        this.form.collapsed=0;
      }
    },
    addTask() {
      this.$message('仅添加单个项目');
      this.drawerTitle = "添加项目";
      this.initData();
      this.dialog = true;
    },
    addConsultTask() {
      this.$message('将为项目添加五个子阶段');
      this.drawerTitle = "添加咨询项目";
      this.initData();
      this.dialog = true;
    },
    deleteTask(){},
    updateTask(){
      this.drawerTitle = "修改项目";
      this.initData();
      this.dialog = true
    },
    selectusers(){//获取全部用户
      request4({
        method: 'get',
        url: '/Allusers',
      }).then(res=>{
        if(res.data.code=="200"){
          //console.log(res)
          for(let i=0;i<res.data.data.length;i++){
            this.userList.push(res.data.data[i])
          }
        }
      }).catch(err=>{
        this.notify("提示","用户数据加载失败",'error')
      });
    },
    selectTaskByUsername(username){//获取某用户的全部任务
      request4({
        method: 'get',
        url: '/task/taskByname/'+username
      }).then(res=>{
        if(res.data.code=="200"){
          //console.log(res)
          if(res.data.data.length!=0){
            let length = this.tasks.length
            this.tasks.splice(0,length);
            for(let index in res.data.data){
              let task = res.data.data[index]
              this.tasks.push({
                id: task.id,
                label: task.label,
                user: task.user,
                startTime: task.startTime,
                endTime: task.endTime,
                percent: task.percent,
                type: task.type,
                parentId: task.parentId,
                collapsed : task.collapsed==1?true:false,
                style:task.style
              })
            }
          }
          else{
            this.notify("提示","当前用户没有任何任务",'warning')
          }
          //console.log(res)
          //console.log(this.tasks)
        }
        else{
          this.notify("提示","数据加载失败",'error')
        }
      }).catch(err=>{
        this.notify("提示","数据加载失败",'error')
      });
    },
    selectTask(time){//获取全部任务
      if(time==null||time==undefined){
        time=new Date().getTime()
      }
      request4({
        method: 'get',
        url: '/task/tasks',
        params:{
          time: time
        }
      }).then(res=>{
        if(res.data.code=="200"){
          //console.log(res)
          if(res.data.data.length!=0){
            let length = this.tasks.length
            this.tasks.splice(0,length);
            for(let index in res.data.data){
              let task = res.data.data[index]
              this.tasks.push({
                id: task.id,
                label: task.label,
                user: task.user,
                startTime: task.startTime,
                endTime: task.endTime,
                percent: task.percent,
                type: task.type,
                parentId: task.parentId,
                collapsed : task.collapsed==1?true:false,
                style:task.style
              })
            }
          }
        else{
            this.notify("提示","当前用户没有任何任务",'warning')
          }
           //console.log(res)
           //console.log(this.tasks)
        }
        else{
          this.notify("提示","数据加载失败",'error')
        }
      }).catch(err=>{
        this.notify("提示","请重新登录",'error')
      });
    },
    selectParents(){
      request4({
        method: 'get',
        url: '/task/parents'
      }).then(res=>{
        if(res.data.code=="200"){
          this.parents = res.data.data
          //console.log(this.parents)
        }
        else{
          //this.notify("提示","数据加载失败",'error')
        }
      }).catch(err=>{
        //this.notify("提示",err,'error')
      });
    },
    tasksUpdate(tasks) {
      this.tasks = tasks;
    },
    optionsUpdate(options) {
      this.options = options;
    },
    styleUpdate(style) {
      this.dynamicStyle = style;
    },
    selectUserChange(username){
      //console.log(username)
      if(username!=""&&username!=undefined){
        this.selectTaskByUsername(username)
      }
      else{
        this.selectTask()
      }
    },
    setday(time){
      this.$refs.gantt.scrollToTime(time)
      this.selectTask(time)
      let that = this
      request4({
        method: 'get',
        url: '/task/travel',
        params: {
          time: time
        }
      }).then(res=>{
        //console.log(res)
        that.userinfos=res.data.data
      }).catch(err=>{
        console.log(err)
      });
      //console.log(this.$refs.gantt)
    },
    changeTimeZoom(value){
      this.$refs.gantt.onTimeZoomChange(value)
    },
    showList(value){
      this.$refs.gantt.options.taskList.display=value
    },
    //添加项目时选择父节点时执行
    parentChange(value) {
      this.form.parentId=value[value.length-1]
      //console.log(this.form.parentId);
    },
    //修改项目时选择项目节点时执行
    updateChange(value){
      this.form.id=value[value.length-1]
      let task;
      for(let index in this.tasks){
        if(this.tasks[index].id==this.form.id){
          task = this.tasks[index]
          break;
        }
      }
      if(task!=undefined){
        this.form.label=task.label;
        this.form.user=task.user;
        this.form.startTime=task.startTime;
        this.form.endTime=task.endTime;
        this.form.percent=task.percent;
        this.form.type=task.type;
        this.form.parentId=task.parentId;
        this.taskParentList = this.findParentids(task.id);
        this.collState=task.collapsed;
        //this.form.collapsed=task.collapsed?1:0;
        this.form.fill=task.style.base.fill;
        this.form.stroke=task.style.base.stroke;
      }
    },
    findParentids(idx){
      let ParentList=[];
      let pid=this.findParentid(idx)
      while(pid!=undefined){
        ParentList.splice(0,0,pid)
        pid=this.findParentid(pid)
      }
      return ParentList;
    },
    findParentid(idx){
      for(let index in this.tasks){
        if(this.tasks[index].id==idx){
          return this.tasks[index].parentId
        }
      }
    },
    //关闭添加侧边栏之前执行
    handleClose(done) {
      if (this.loading) {
        return;
      }
      this.$confirm('确定要提交表单吗？')
          .then(_ => {
            this.loading = true;
            if(this.drawerTitle=="添加项目"){
              this.doAddOne()
            }
            else if(this.drawerTitle=="添加咨询项目"){
              this.doAddConsult()
            }
            else if(this.drawerTitle=="修改项目"){
              //console.log(this.form)
              this.doUpdate()
            }
            done();
          })
          .catch(_ => {});
    },
    doAddOne(){
      request4({
        method: 'post',
        url: '/task/task',
        data:{
          label: this.form.label,
          user: this.form.user,
          startTime: this.form.startTime,
          endTime: this.form.endTime,
          percent: this.form.percent,
          type: this.form.type,
          parentId: this.form.parentId,
          collapsed : this.form.collapsed,
          fill:this.form.fill,
          stroke:this.form.stroke,
        }
      }).then(res=>{
        if(res.data.code=="200"){
          this.loading = false;
          this.notify("提示","添加成功",'success')
          this.selectTask();
          this.selectParents();
          this.setday(new Date().getTime())
        }
        else{
          this.notify("提示","添加项目失败",'error')
        }
      }).catch(err=>{
        this.notify("提示",err,'error')
      });
    },
    doAddConsult(){
      //console.log(this.form)
      request4({
        method: 'post',
        url: '/task/consultTask',
        data:{
          label: this.form.label,
          user: this.form.user,
          startTime: this.form.startTime,
          endTime: this.form.endTime,
          percent: this.form.percent,
          type: this.form.type,
          parentId: this.form.parentId,
          collapsed : this.form.collapsed,
          fill:this.form.fill,
          stroke:this.form.stroke,
        }
      }).then(res=>{
        if(res.data.code=="200"){
          this.loading = false;
          this.notify("提示","添加成功",'success')
          this.selectTask();
          this.selectParents();
          this.setday(new Date().getTime())
        }
        else{
          this.notify("提示","添加项目失败",'error')
        }
      }).catch(err=>{
        this.notify("提示",err,'error')
      });
    },
    doUpdate(){
      request4({
        method: 'put',
        url: '/task/task',
        data:{
          id: this.form.id,
          label: this.form.label,
          user: this.form.user,
          startTime: this.form.startTime,
          endTime: this.form.endTime,
          percent: this.form.percent,
          type: this.form.type,
          parentId: this.form.parentId,
          collapsed : this.form.collapsed,
          fill:this.form.fill,
          stroke:this.form.stroke,
        }
      }).then(res=>{
        if(res.data.code=="200"){
          this.loading = false;
          this.notify("提示","更新成功",'success')
          this.selectTask();
          this.selectParents();
          this.setday(new Date().getTime())
        }
        else{
          this.notify("提示","添加项目失败",'error')
        }
      }).catch(err=>{
        this.notify("提示",err,'error')
      });
    },
    cancelForm() {
      this.loading = false;
      this.dialog = false;
      clearTimeout(this.timer);
    },checkPre(precode){
      let permissions=this.user.permissions;
      for(let i=0;i<permissions.length;i++){
        if(precode==permissions[i].permissionCode){
          return true
        }
      }
      return false
    },
    notify(title,message,type) {
      this.$notify({
        title: title,
        message: message,
        type: type
      });
    },
    openFullScreen1() {
      this.fullscreenLoading = true;
      setTimeout(() => {
        this.fullscreenLoading = false;
      }, 2000);
    },
    load2s(){
      const loading = this.$loading({
        lock: true,
        text: 'Loading',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.4)'
      });
      setTimeout(() => {
        loading.close();
      }, 2000);
    }
  },
  created() {
  },
  mounted(){
    this.selectTask();
    this.selectParents();
    this.selectusers();
    setTimeout(() => {
      this.setday(new Date().getTime())
    }, 2000);
  }
};
</script>
