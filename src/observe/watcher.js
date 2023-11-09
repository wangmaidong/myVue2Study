import { Dep } from './dep'
let id = 0
let num = 0
export class Watcher {
    constructor(vm, fn, options) {
        this.id = id++ // 每一个watcher都有一个自己的id
        this.renderwatcher = options // 表示是否是一个渲染watcher
        this.getter = fn // 保存的 vm._update(vm._render()) 就是dom生成或者更新的回调
        this.deps = [] // 记录哪些依赖记录了我自己
        this.depsId = new Set()
        this.get() // 立即执行
    }
    // get方法核心就是执行vm._update(vm._render()) 
    get() {
        // 执行的时候把该watcher实例保存到Dep上
        // 等下取值操作的时候就可以拿到这个watcher实例
        Dep.target = this
        this.getter()
        Dep.target = null
    }
    adddep(dep) {
        // 如果没有添加过这个dep
        if(!this.depsId.has(dep.id)) {
            this.depsId.add(dep.id)
            this.deps.push(dep)
            dep.addsub(this)
        }
    }
    update() {
        queuewatcher(this)
    }
    run() {
        console.log('更新了watcher--->', this.id)
        this.get()
    }
}
// 异步更新策略就是把dom的更新和用户调用$nextTick传入的回调函数都维护到一个队列中
// 然后等同步代码执行完毕之后,开启一个异步任务,然后遍历队列中的每个任务去执行
let has = {}
let queue = []
let pending = false
function flushSchedulerQueue () {
    let flushQueue = queue.slice(0)
    flushQueue.forEach(q => q.run())
    pending = false
    queue = []
    has = {}
}
function queuewatcher(watcher) {
    if(!has[watcher.id]) {
        queue.push(watcher)
        has[watcher.id] = true
    }
    if(!pending) {
        // setTimeout(() => {
        //     let arr = queue.slice(0)
        //     arr.forEach(wat => wat.run()) 
        //     pending = false
        //     queue = []
        //     has = []
        // }, 0);
        // 不在单独开启一个异步任务,而是把这个异步回调放入到一个队列中
        nextTick(flushSchedulerQueue)
        pending = true
    }
    pending = true
}

let callBacks = []
let waiting = false
function flushCallBacks () {
    let cbs = callBacks.slice(0)
    callBacks = []
    waiting = false
    cbs.forEach(cb => cb())
}
export function nextTick(cb) {
    callBacks.push(cb)
    if(!waiting) {
        Promise.resolve().then(flushCallBacks)
        waiting = true
    }
}