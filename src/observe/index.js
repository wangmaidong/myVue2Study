import {
  newArrayPrototype
} from './array.js'
class Observe {
  constructor(data) {
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
  // 如果data不是对象或者是null那直接退出
  if (typeof data !== 'object' || data == null) return

  if (data.__ob__ instanceof Observe) return
  new Observe(data)
}

export function defineReactive(data, key, value) {
  // 如果value也是一个对象那么也要把对象里面的数据变为响应式
  observe(value)
  Object.defineProperty(data, key, {
    get() {
      console.log('取值操作')
      return value
    },
    set(newVal) {
      if (newVal === value) return // 如果新值旧值一样那直接退出
      // 如果设置的值是一个对象那么也要进行响应式的劫持
      observe(newVal)
      value = newVal
    }
  })
}