import {
  observe
} from './observe/index.js'
import { Watcher } from './observe/watcher.js'
import { Dep } from './observe/dep.js'
export function initState(vm) {
  const opts = vm.$options
  // 判断用户是否传递了data选项
  if (opts.data) {
    // 初始化data里面的数据
    initData(vm)
  }
  // 判断用户是否传递了computed选项
  if (opts.computed) {
    initComputed(vm)
  }
  // 判断用户是否传递了watch选项
  if(opts.watch) {
    initWatch(vm)
  }
}

function initData(vm) {
  let data = vm.$options.data
  // 判断用户传递的data是一个函数还是一个对象
  // 函数，执行，并使得内部this为vue实例
  data = typeof data === "function" ? data.call(vm) : data
  // 观测对象，进行数据的响应式劫持
  observe(data)
  vm._data = data
  // 代理_data上的数据 使得可以直接通过vm.xxx访问
  for (let key in data) {
    proxy(vm, '_data', key)
  }
}

// 代理方法使得可以直接访问data上的数据
export function proxy(vm, target, key) {
  Object.defineProperty(vm, key, {
    get() {
      return vm[target][key]
    },
    set(newVal) {
      vm[target][key] = newVal
    }
  })
}
// 初始化计算属性
function initComputed(vm) {
  const computed = vm.$options.computed
  const watchers = vm._computedwatchers = {}
  for (let key in computed) {
    const userDef = computed[key]
    // 判断用户写的是一个对象还是函数
    const getter = typeof userDef === 'object' ? userDef.get : userDef
    watchers[key] = new Watcher(vm, getter, { lazy: true })
    defineComputed(vm, key, userDef)
  }
}
// 把计算属性定义到vm上,并重新定义
function defineComputed(target, key, userDef) {
  const setter = userDef.set || (() => {})
  Object.defineProperty(target, key, {
    get: createComputedGetter(key), // createComputedGetter中的this就指向vm
    set: setter
  })
}

function createComputedGetter(key) {
  return function () {
    const watcher = this._computedwatchers[key]
    if(watcher.dirty) {
      watcher.evaluate()
    }
    if(Dep.target) { // 如果dep.target有值就让watcher中收集的依赖再去收集watcher
      watcher.depend()
    }
    return watcher.value
  }
}

function initWatch(vm) {
  const watch = vm.$options.watch
  for(let key in watch) {
    let handler = watch[key]
    if(Array.isArray(handler)) {
      for(let i = 0; i < handler.length; i++) {
        createWatcher(vm, key, handler[i])
      }
    } else {
      createWatcher(vm,key, handler)
    }
  }
}
function createWatcher(vm, key,handler) {
  if(typeof handler === 'string') {
    handler = vm[handler]
  }
  return vm.$watch(key, handler)
}