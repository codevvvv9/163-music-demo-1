window.eventHub = {
  events: {
    // '遗憾': [fn],
    // '追光者': [],
  },
  /**
   * 发布
   * @param {*事件名字} eventName 
   * @param {*数据} data 
   */
  emit(eventName, data) {
    for(let key in this.events) {
      if(key === eventName) {
        let fnList = this.events[key]
        fnList.map((fn) => {
          fn.call(undefined, data)
        })
      }
    }
  },
  /**
   * 
   * @param {*订阅的事件名字} eventName 
   * @param {*订阅事件之后执行的函数} fn 
   */
  on(eventName, fn) {
    if (this.events[eventName] === undefined) {
      this.events[eventName] = []
    }
    this.events[eventName].push(fn)    
  }
}
