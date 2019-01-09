export default class socket{
	constructor(url,reconnect=false) {
		this.url = url
		this.ws = null
		this.config = {
			closeByHand:false,
			//自动重连
			reconnect,

		}
	}
	open(){
		return new Promise((resolve,reject) => {
			// console.log(this.ws)
			if (this.ws === null) {
				this.ws = new WebSocket(this.url)
				// resolve(this.ws)
				// console.log(this.ws)
				this.ws.open = (e) => {
	                resolve(this);
	            }
	            this.ws.onerror = (e) => {
	                reject(e);
	            }
	            this.ws.onclose = (e) => {
					this.ws = null
	                if (!this.closeConfig.closing) {
	                    console.log('reconnect')
	                    if (this.config.reconnect) {
	                    	this.open()
	                    }  
	                }
	                // 若手动close，恢复初始状态
	                this.config.closeByHand = false;
	            }
			}
		})
		 
	}


	close(){
		this.config.closeByHand = true
		this.ws.close()
		this.ws = null
	}
	send(content){
		this.ws.send(content)
	}
}