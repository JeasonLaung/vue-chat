<template>
  <div>
    <h1>我的编号是：{{my_id}}</h1>
  <div class="chat" @mousedown="contextmenu.display = 'none'" >

  <!-- 右键重写 -->
  <ul class="contextmenu" :style="{'top':contextmenu.y+'px','left':contextmenu.x+'px','display':contextmenu.display}">
    <li v-for="(item,index) in contextmenu.type.member" :key="index">
      <div :class="item.class">{{item.title}}</div>
    </li>
  </ul>


  <!-- 成员 -->
  <ul class="member no-select">
   <!--  <li v-for="(item,index) in member" v-if="member!=[]" :key="index" class="item" @contextmenu.prevent="menuRewrite($event)"  :data-index="index" :class="{'active':index==chatWith}" @click="chatWith=index">
      <div class="lf">
        <img src="../assets/logo.png" class="face">        
      </div>
      <div class="rt">{{item.name}}</div>
    </li> -->
    <li v-for="(item,index) in members"  v-if="item !== my_id"  class="item" @contextmenu.prevent="menuRewrite($event)"  :data-index="index" :class="{'active':index==chatWith}" @click="chatWith=index;handleMsg()">
      <div class="lf">
        <img src="../assets/logo.png" class="face">        
      </div>
      <div class="rt">{{item}}</div>
    </li>
  </ul>

  <!-- 聊天窗 -->
  <div class="chat-room">
    <div class="header no-select" @mousedown="move">
	    <!-- 标题 -->
	    {{members[chatWith]}}
	</div>
    <ul class="read" ref="read" @copy.prevent="handleCopy">
    	<!-- 聊天记录 -->
	    <!-- {{member[chatWith].name}} -->
	    <!-- <ul> -->
	    	<li v-for="(item,index) in msgBy" :key="index" :class="{'from':item.to == my_id,'to':item.from== my_id}">
         
	    		<div class="bubble" v-html="item.msg"></div>
	    	</li>
	    <!-- </ul> -->
    </ul>
    <div class="write" contenteditable="true" @keydown.enter.prevent="sendWriting($event)" v-html="writing">

	</div>
	<!-- <button id="a">132</button> -->
  </div> 
  </div>
  </div>
</template>

<script>
import { mapActions,mapState } from 'vuex'
// import Clipboard from 'clipboard'
import util from '../util/cursor.js'
export default {
  name: 'App',
  computed:{
      ...mapState({'WS':'WS'}),

  },
  data(){
    return {
      //联系人
      my_id:'',
      members:[],
      //聊天内容
      msgs:[

      ],
      msgBy:[
      ],
      //正在说什么
      writing:'',
      //正在跟谁聊天
      chatWith:0,//index
      //聊天窗位置
      positionX:0,
      positionY:0,
      //重写右键
      contextmenu:{
      	x:0,
      	y:0,
        display:'',

        //右键菜单种类
        type:{
          member:[
            {
              title:'删除聊天及记录',
              class:'danger-btn'
            }
          ]
        },
      },
      
    }
  },
  methods:{
    handleMsg(){
      var other = this.members[this.chatWith]
      console.log(other)
      var tmp = []
      for(var i in this.msgs){
        if (this.msgs[i].to == other || this.msgs[i].from == other) {
          tmp.push(this.msgs[i])
        }
      }
      this.msgBy = JSON.parse(JSON.stringify(tmp))
      this.toBottom()
    },
    getSelectedContents(){
     return util.getSelectedContents()
    },
    handlePaste(e){
      // e.clipboardData.setData("HTML",this.getSelectedContents())
    },
    handleCopy(e){
      e.clipboardData.setData("text",window.getSelection(0).toString())
    },
    Text2HTML(str){
      var div = document.createElement('div');
      div.innerHTML = str;
      return div;
    },
    HTML2Text(str){
      var div = document.createElement('div');
      div.innerHTML = str.replace(/^\s*/g,'');
      div.innerHTML = str.replace(/\s*$/g,'');
      return div.innerText;
    },
    ...mapActions({
      socket:'SOCKET_INIT',
      // send:'SOCKET_SEND',
    }),

    hadle_message(data){
      console.log(data)
      // {type:'welcome',my_id:''}
      if (data.type=="welcome") {
        this.my_id = data.my_id
      }
      // {type:"member",members:[]}
      if (data.type=="member") {
        this.members = data.members
        if (this.members[0] == this.my_id && this.members.length > 1) {
          this.chatWith = 1;
        }
      }
      // {type:"chat",from:'',to:'',msg:''}
      if (data.type=="chat") {
        this.msgs.push(data)
        this.handleMsg()
      }

      // if (data.msg) {
      //   this.chating.push(data)
      // }
    },
    menuRewrite(event){
    	// console.log(event)
      this.contextmenu.x = event.x
      this.contextmenu.y = event.y
      this.contextmenu.display = 'block'
      //找到对应item，并获取他的index值
      let elements = event.path
      for (var i = 0; i < elements.length; i++) {
      	if(elements[i].className == 'item'){
      		console.log(elements[i].dataset.index)
      	}
      }
    },
    sendWriting(e){
    	if (/^\s+$/.test(e.target.innerHTML)) {
    		e.target.innerHTML = ""
    		return false;
    	}
    	// this.msgs.push({type:'to',content:e.target.innerHTML})
      // console.log(this.members[this.chatWith])
      let send_msg = {'to':this.members[this.chatWith],msg:e.target.innerHTML}
    	e.target.innerHTML = ""
      this.WS.send(JSON.stringify(send_msg))
      // console.log(this.WS)
    	// this.toBottom()
    	return false;
    },
    move(event){
       //获取聊天框
      let chat;
      for (var i = 0; i < event.path.length; i++) {
	      if(event.path[i].className == 'chat'){
	      	chat = event.path[i];
	      }
	  }
      //算出鼠标相对元素的位置
      let disX = event.clientX - chat.offsetLeft;
      let disY = event.clientY - chat.offsetTop;
      document.onmousemove = (e)=>{    //鼠标按下并移动的事件
        //用鼠标的位置减去鼠标相对元素的位置，得到元素的位置
        let left = e.clientX - disX;  
        let top = e.clientY - disY;
         
        //绑定元素位置到positionX和positionY上面
        this.positionX = top;
        this.positionY = left;
         
        //移动当前元素
        chat.style.left = left + 'px'
        chat.style.top = top + 'px'

        //禁止冒泡（禁止选定）
        return false
      };
      document.onmouseup = (e) => {
        document.onmousemove = null
        document.onmouseup = null
      }
    },
    toBottom(){
	  this.$nextTick( () => {
      if (null !== this.$refs.read.lastChild) {
        this.$refs.read.lastChild.scrollIntoView()
      }
	    
	  })
    }
  },
  mounted(){
  	// console.dir(this.$refs.read)
  	  
  	// this.$refs.read.scrollIntoView(false);
  	// this.toBottom()
  	// console.log(Clipboard)
  	// var clipboard = new Clipboard('#a');//可通过任意选择器进行实例化
   //      clipboard.on('success', function(e,text) {//使用on绑定成功
   //          console.log(e,text);
   //      });
   //      clipboard.on('error', function(e) {//使用on绑定失败
   //          console.log(e);
   //      });
  	// this.$refs.read.scrollTop=this.$refs.read.offsetHeight
  	// console.log()
    let that = this
    this.socket((data)=>{
      that.hadle_message(data)
    })
  }

}
</script>

<style lang="scss">
$stand:400px;
.danger-btn{
  background-color: #F56C6C;
  color: #fff;
}
.no-select{
-webkit-touch-callout: none; /* iOS Safari */

-webkit-user-select: none; /* Chrome/Safari/Opera */

-khtml-user-select: none; /* Konqueror */

-moz-user-select: none; /* Firefox */

-ms-user-select: none; /* Internet Explorer/Edge */

user-select: none; /* Non-prefixed version, currently

not supported by any browser */
}
*{
  margin: 0;
  padding: 0;
}
  .chat{
    height: $stand;
    width: $stand*1.2;
    background-color: #aaa;
    position: fixed;
    display: flex;
    border: 2px solid #555;
    .contextmenu{
      list-style: none;
      display: none;
      position: fixed;
      z-index: 999;
      height: 20px;
    }
    .member{
      list-style: none;
      width: $stand/3;
      // overflow: hidden;
      overflow: auto;
      .item{
        height: 50px;
        display: flex;
        align-items:center;
        width: 100%;
        background-color: #aaa;
      border:1px solid #222;
      box-sizing:border-box;
      &:hover{
        background-color: #ccc;
      }
      &.active{
        background-color: #ddd;
      }
        .lf{
        width: 50px;
        // display: flex;
        .face{
          height: 30px;
          border-radius: 100%;
          background-color: #fff;
        }
        }
        .rt{
        flex:1;
        text-align: left;
        }
      }
    }
    .chat-room{
    flex:1;
    background-color: #fff;
    display: flex;
    flex-direction: column;
    .header{
      height: $stand/8;
      cursor: move;
      border-bottom:1px solid #222;
      font-size: 20px;
      font-weight: bold;
      display: flex;
      align-items:center;
      // justify-content:center;
      text-align: left;
      padding-left: 20px;

    }
    .read{
      flex:1;
      list-style: none;
      overflow: auto;
      .bubble{
      	padding: 10px;
      	background-color: #409EFF;
      	max-width: $stand/3;
		display: block;
		margin-bottom: 10px;
		border-radius: 7px;
        position: relative;
        word-wrap:break-word;
        word-break:break-all;
		text-align: left;
    *{
        background-color: transparent !important;
      }
      }
      .from{
      	display: flex;
        justify-content:flex-start;
        .bubble{
			margin-left: 40px;
			&:before{
				content: "";
				display: block;
				position: absolute;
				border-right: 15px solid #409EFF;
				border-top: 2px solid transparent;
				border-bottom: 10px solid transparent;
				left: -15px;
				top: 5px;

			}
        }
      }
      .to{
      	display: flex;
        justify-content:flex-end;

        .bubble{
			margin-right: 40px;
			&:after{
				content: "";
				display: block;
				position: absolute;
				border-left: 15px solid #409EFF;
				border-top: 2px solid transparent;
				border-bottom: 10px solid transparent;
				right: -15px;
				top: 5px;
			}
        }
      }
    }
    .write{
      text-align: left;
      line-height: 1.3;
      background-color: cyan;
      height: $stand/3.5;
      outline: none;
      word-wrap:break-word;
      word-break:break-all;
      vertical-align:middle;
      overflow: auto;
      *{
        background-color: transparent !important;
      }
      img{
        // display: none;
        height: 17px !important;
        width: 17px !important;

      }
    }
    }
  }

</style>