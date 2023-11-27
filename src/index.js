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
import { createElm, patch } from './vdom/patch.js'
function Vue(options) {
  // 初始化用户传递进来的选项
  this._init(options)
}
Vue.prototype.$nextTick = nextTick
Vue.prototype.$watch = function (exprOrfn, cb) {
  new Watcher(this, exprOrfn, { user: true }, cb)
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
  template: `<ul style="color: red">
  <li key="a">a</li>
  <li key="b">b</li>
  <li key="c">c</li>
  <li key="d">d</li>
  </ul>`
})
let render1 = compileToFunction(vm1.$options.template)
let preVnode = render1.call(vm1)
let ele1 = createElm(preVnode)
document.body.appendChild(ele1)

let vm2 = new Vue({
  data() {
    return {
      name: 'ls'
    }
  },
  template: `<ul style="color: red">
  <li key="b">b</li>
  <li key="m">m</li>
  <li key="a">a</li>
  <li key="p">p</li>
  <li key="c">c</li>
  <li key="q">q</li>
  </ul>`
})
let render2 = compileToFunction(vm2.$options.template)
let nextVnode = render2.call(vm2)

setTimeout(() => {
  patch(preVnode, nextVnode)
}, 5000)