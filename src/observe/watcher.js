import { Dep, pushTarget, popTarget} from './dep'
let id = 0
export class Watcher {
    constructor(vm, exprOrfn, options, cb) {
        // $watch函数的第一个参数可能是一个字符串或者一个函数表达式 () => vm.xxx
        if(typeof exprOrfn === 'string') {
            this.getter = function () {
                return vm[exprOrfn]
            }
        } else {
            this.getter = exprOrfn
        }
        this.vm = vm
        this.id = id++ // 每一个watcher都有一个自己的id
        this.renderwatcher = options // 表示是否是一个渲染watcher
        // this.getter = fn // 保存的 vm._update(vm._render()) 就是dom生成或者更新的回调
        
        this.deps = [] // 记录哪些依赖记录了我自己
        this.depsId = new Set()
        // this.get()
        this.lazy = options.lazy
        this.dirty = this.lazy

        this.cb = cb
        this.user = options.user // 标识是否是用户自己的watcher

        this.value = this.lazy ? undefined : this.get()
    }
    // get方法核心就是执行vm._update(vm._render()) 
    get() {
        // 执行的时候把该watcher实例保存到Dep上
        // 等下取值操作的时候就可以拿到这个watcher实例
        // Dep.target = this
        pushTarget(this)
        // this.getter() 
        let value = this.getter.call(this.vm)
        // Dep.target = null
        popTarget()
        return value
    }
    evaluate() {
        this.value = this.get()
        this.dirty = false
    }
    depend() {
        let i =  this.deps.length;
        while(i--){
            // dep.depend()
            this.deps[i].depend(); // 让计算属性watcher 也收集渲染watcher
        }
    }
    adddep(dep) {
        // 如果没有添加过这个dep
        if (!this.depsId.has(dep.id)) {
            this.depsId.add(dep.id)
            this.deps.push(dep)
            dep.addsub(this)
        }
    }
    update() {
        if(this.lazy){
            // 如果是计算属性  依赖的值变化了 就标识计算属性是脏值了
            this.dirty = true;
        }else{
            queueWatcher(this); // 把当前的watcher 暂存起来
            // this.get(); // 重新渲染
        }
    }
    run() {
        let oldValue = this.value
        let newValue = this.value = this.get()
        console.log('更新了watcher--->', this.id)
        if(this.user) {
            this.cb.call(this, oldValue, newValue)
        }
    }
}
// 异步更新策略就是把dom的更新和用户调用$nextTick传入的回调函数都维护到一个队列中
// 然后等同步代码执行完毕之后,开启一个异步任务,然后遍历队列中的每个任务去执行
let has = {}
let queue = []
let pending = false
function flushSchedulerQueue() {
    let flushQueue = queue.slice(0)
    flushQueue.forEach(q => q.run())
    pending = false
    queue = []
    has = {}
}
function queueWatcher(watcher) {
    if (!has[watcher.id]) {
        queue.push(watcher)
        has[watcher.id] = true
    }
    if (!pending) {
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
function flushCallBacks() {
    let cbs = callBacks.slice(0)
    callBacks = []
    waiting = false
    cbs.forEach(cb => cb())
}
export function nextTick(cb) {
    callBacks.push(cb)
    if (!waiting) {
        Promise.resolve().then(flushCallBacks)
        waiting = true
    }
}