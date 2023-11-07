import {
  initState
} from './state.js'
import {
  compileToFunction
} from './complier/index.js'
import {
  mountComponent
} from './lifecycle.js'
// 此方法就是给vue的原型增加方法
export function initMixin(Vue) {
  // Vue原型添加_init初始化方法
  Vue.prototype._init = function (options) {
    const vm = this
    // 在vue实力上添加一个$options,就是用户new Vue传递的对象
    vm.$options = options
    // 初始化状态
    initState(vm)
    // 初始化完数据就可以将模板-->ast语法树--->render函数----->虚拟dom----->真实dom
    if (options.el) {
      vm.$mount(options.el)
    }
  }
  Vue.prototype.$mount = function (el) {
    const vm = this
    const ops = vm.$options
    el = document.querySelector(el)
    let template
    // 如果用户自己没有传render函数
    if (!ops.render) {
      // 用户没有传template
      if (el && !ops.template) {
        template = el.outerHTML
      } else {
        if (el) {
          template = ops.template
        }
      }
      // 如果 挂载的容器和模板都存在
      if (el && template) {
        const render = compileToFunction(template)
        console.log(render)
        ops.render = render
      }
    }
    mountComponent(vm, el)
  }
}