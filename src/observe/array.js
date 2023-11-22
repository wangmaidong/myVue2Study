// Array 的原型对象
let oldArrayPrototype = Array.prototype
// 创造一个新的数组原型 ，然后新的数组原型的原型是oldArrayPrototype 
// newArrayPrototype.__proto__ = oldArrayPrototype
export const newArrayPrototype = Object.create(oldArrayPrototype)
// push数组末尾追加一项  
// unshift数组头部追加一项  
// pop数组尾部删除一个  
// shift数组头部删除一个
// splice可以删除  可以插入
// reverse反转数组
// sort排序数组
// 这7个方法都会改变原数组本身
let methods = ['push', 'unshift', 'pop', 'shift', 'splice', 'reverse', 'sort']
methods.forEach(key => {
  newArrayPrototype[key] = function (...args) {
    console.log('数组方法的劫持')
    // 这里的this,就是指调用该方法的数组
    let result = oldArrayPrototype[key].call(this, ...args)
    let inserted
    // Observe实例
    let o = this.__ob__
    // push unshift  splice都会向原数组追加数据，追加的数据要进行响应式的劫持
    switch (key) {
      case 'push':
      case 'unshift':
        inserted = args
        break
      case 'splice':
        inserted = args.slice(2)
        break
      default:
        break
    }
    if (inserted) {
      o.observeArray(inserted)
    }
    o.dep.notify()
    return result
  }
})