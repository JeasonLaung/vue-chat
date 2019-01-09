import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)
// str转json
let json = str => {
    return (new Function('return '+str))()
}
//json转str
let str = json =>{
    return JSON.stringify(json)
}
export default new Vuex.Store({
  state: {
    WS:false,//websocket对象
    WS_URL:'ws://127.0.0.1:8001',
    WS_RECONNECT:false,//自动重连
    // HEART_BEAT:5,//每50秒心跳一次
    HEART_MSG:'hello',
  },
  mutations: {
    SOCKET_INIT(state,config={}){
      if (!state.WS) {
        state.WS = new WebSocket(state.WS_URL)
      }
      for(var i in config){
        state[i] = config[i]
      }
    },
    SOCKET_MESSAGE(state,func){
      return new Promise((resolve,reject)=>{
        state.WS.onmessage=(data)=>{
          // data = (new Function('return '+data))()
          resolve(func(json(data.data)))
        }
        //这个有问题，虽然很方便，但还是搁置
        // state.WS.addEventListener('message',data=>{resolve(func(data))})
      })
    },
    SOCKET_SEND(msg){
    	state.WS.send(str(msg))
    },
    SOCKET_HEART(state){
      //设置心跳
      if (state.HEART_BEAT > 0) {
        let timer = setInterval(()=>{
          state.WS.send(state.HEART_MSG)
          //如果已经关闭就停止
          if([2,3].indexOf(state.WS.readyState) !== -1){
            clearInterval(timer)
          }
        },parseInt(state.HEART_BEAT)*1000)
      }
    }
  },
  getters:{

  },
  actions: {
    SOCKET_INIT({state,commit},func){
      return new Promise((resolve,reject)=>{
        commit('SOCKET_INIT')
        state.WS.onerror = function (msg) {
          reject(msg)
        }

        let timer = setInterval(()=>{
          //不是正在连接状态
          if(state.WS.readyState!==0){
            clearInterval(timer)
            //正在关闭,关闭
            if([2,3].indexOf(state.WS.readyState) !== -1){
              state.WS = false
            }
            //连接
            if(state.WS.readyState===1){
              resolve(state.WS)
              commit('SOCKET_HEART')
              commit('SOCKET_MESSAGE',func)
            }
          }
        },100)
      })
    },
    // SOCKET_MESSAGE({state,commit},func){
    //   commit('SOCKET_MESSAGE',func)
    // }
  }
})
