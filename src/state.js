import {
  observe
} from './observe/index.js'
export function initState(vm) {
  const opts = vm.$options
  // 判断用户是否传递了data选项
  if (opts.data) {
    // 初始化data里面的数据
    initData(vm)
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