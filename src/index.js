import {
  initMixin
} from './init.js'
import {
  initLifeCycle
} from './lifecycle.js'
import {
  nextTick
} from './observe/watcher.js'
import { initGlobalApi } from './gloablAPI.js'
function Vue(options) {
  // 初始化用户传递进来的选项
  this._init(options)
}
Vue.prototype.$nextTick = nextTick
// 给Vue的原型添加初始化的方法
initMixin(Vue)
initLifeCycle(Vue)
initGlobalApi(Vue)
export default Vue