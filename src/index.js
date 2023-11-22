import {
  initMixin
} from './init.js'
import {
  initLifeCycle,
} from './lifecycle.js'
import {
  Watcher,
  nextTick
} from './observe/watcher.js'
import { initGlobalApi } from './gloablAPI.js'
import { compileToFunction } from './complier/index.js'
import { createElm } from './vdom/patch.js'
function Vue(options) {
  // 初始化用户传递进来的选项
  this._init(options)
}
Vue.prototype.$nextTick = nextTick
Vue.prototype.$watch = function (exprOrfn, cb) {
  new Watcher(this,exprOrfn , {user: true}, cb)
}
// 给Vue的原型添加初始化的方法
initMixin(Vue)
initLifeCycle(Vue)
initGlobalApi(Vue)
export default Vue
let vm1 = new Vue({
  data() {
    return {
      name: 'wl'
    }
  },
  template: `<div>{{name}}</div>`
})
let render1 = compileToFunction(vm1.$options.template)
let vnode1 = render1.call(vm1)
let ele1 = createElm(vnode1)
console.log("ele1--->", ele1)