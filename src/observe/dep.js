let id = 0
export class Dep {
    constructor () {
        this.id = id++
        // 用来存储相关的watcher, 每个被劫持的数据可能会对应到到多个watcher
        // 比如一个数据被多个组件使用，每个组件有一个自己的渲染watcher
        this.subs = [] 
    }
    depend() {
        // 依赖添加watcher时不直接调用addsub
        // 先让watcher记住dep,dep和watcher是互记的
        Dep.target.adddep(this)
    }
    addsub(wathcer) {
        this.subs.push(wathcer)
    }
    notify() {
        this.subs.forEach(watcher => watcher.update())
    }
}
Dep.target = null