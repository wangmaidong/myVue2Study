import {
  newArrayPrototype
} from './array.js'
import { Dep } from './dep.js'
class Observer {
  constructor(data) {
    this.dep = new Dep()
    // 将Observe的实例挂载到每个被观测的数据上
    // 并且能通过此标记知道该属性已经被观测过了
    Object.defineProperty(data, '__ob__', {
      value: this,
      enumerable: false
    })
    // 如果data是一个数组那么不能直接进行响应式的劫持
    // 给每个索引进行响应式的劫持浪费性能
    // 对数组方法中能改变数组本身的方法进行重写
    if (Array.isArray(data)) {
      // 改变数组的原型
      data.__proto__ = newArrayPrototype
      // 如果数组的某一项是对象那么要对该项进行劫持
      this.observeArray(data)
    } else {
      this.walk(data)
    }
  }
  observeArray(arr) {
    arr.forEach(data => observe(data))
  }
  walk(data) {
    Object.keys(data).forEach(key => {
      defineReactive(data, key, data[key])
    })
  }
}
export function observe(data) {
  // 对这个对象进行劫持
  if (typeof data !== 'object' || data == null) {
    return; // 只对对象进行劫持
  }
  if (data.__ob__ instanceof Observer) { // 说明这个对象被代理过了
    return data.__ob__;
  }
  // 如果一个对象被劫持过了，那就不需要再被劫持了 (要判断一个对象是否被劫持过，可以增添一个实例，用实例来判断是否被劫持过)

  return new Observer(data);
}
export function dependArray(value) {
  for(let i =0; i < value.length; i++) {
    const current = value[i]
    current.__ob__ && current.__ob__.dep.depend()
    if(Array.isArray(current)) {
      dependArray(current)
    }
  }
}
export function defineReactive(data, key, value) {
  // 如果value也是一个对象那么也要把对象里面的数据变为响应式
  let childOb =  observe(value)
  // 每个被添加了响应式的数据都有一个自己的依赖实力
  const dep = new Dep()
  Object.defineProperty(data, key, {
    get() {
      if (Dep.target) {
        dep.depend()
        if(childOb) {
          childOb.dep.depend() // 让对象本身也要记住当前的渲染watcher
          // 如果值是数组，那么就要遍历数组的每一项
          if(Array.isArray(value)) {
            dependArray(value)
          }
        }
      }
      console.log('取值操作')
      return value
    },
    set(newVal) {
      if (newVal === value) return // 如果新值旧值一样那直接退出
      // 如果设置的值是一个对象那么也要进行响应式的劫持
      observe(newVal)
      value = newVal
      dep.notify()
    }
  })
}