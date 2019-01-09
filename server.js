// npm i nodejs-websocket
let ws = require("nodejs-websocket")

//str转json
let json = str => {
    return (new Function('return '+str))()
}
//json转str
let str = json =>{
    return JSON.stringify(json)
}

// 实时聊天人数数组，通过随机数生成
let conns      = [],
    message_welcome    = {},
    message_member     = {},
    message_between    = {},
    heart_beat = 9999, //每8秒心跳一次，否则短线
    message_last = ''

let server = ws.createServer(function (conn) {
    //计算心跳时间
    conn.heart_time = 0
    let timer = setInterval(()=>{
        if (conn.heart_time > heart_beat) {
            clearInterval(timer);
            conn.close()
        }
        conn.heart_time++
    },1000)
    //根据时间戳生成用户id uid
    let uid = str((new Date()).getTime()).slice(-6)
    //保存用户id在全局数组conns中方便我们处理聊天对象信息
    conns[uid] = conn
    message_welcome = {'my_id':uid,type:'welcome'}
    conn.sendText(str(message_welcome))

    //如果有新的人员加入，广播数据给全部人
    message_member = {'members':Object.keys(conns),type:'member'}
    // if (message) {}
    for(var i in conns){
        conns[i].sendText(str(message_member))
    }
    
    //接受到发过来的信息
    conn.on("text", function (text) {
        //重置心跳
        conn.heart_time = 0
        //判断发给谁
        console.log(text)
        let data = json(text),
        to = data['to'],
        from = uid,
        msg = data['msg']
        //存在发送的对象
        console.log(str(Object.keys(conns)),to)
        if (Object.keys(conns).indexOf(to) != -1) {
            message_between = {type:'chat','from':from,'to':to,'msg':msg}
            console.log(str(message_between))
            //发给别人
            conns[from].sendText(str(message_between))
            //发给自己
            conns[to].sendText(str(message_between))
        }
    })   
    //断开连接的回调
    conn.on("close", function (code, reason) {
        //删除成员信息
        delete conns[uid]
        //广播
        message = {'members':Object.keys(conns),type:'member'}
        for(var i in conns){
            conns[i].sendText(str(message_member))
        }
    })  

    //处理错误事件信息
    conn.on('error', function (err) {
        //异常conn就直接删除
        conn.close()
        delete conns[uid]
    })
}).listen(8001);//8001端口

