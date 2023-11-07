export function initLifeCycle(Vue) {
    Vue.prototype._c = function () {

    }
    Vue.prototype._v = function () { }
    Vue.prototype._s = function () { }
    Vue.prototype._render = function () { }
    Vue.prototype._update = function () {
        const vm = this
        vm.$options.render.call(vm)
    }
}
export function mountComponent(vm, el) {
    vm.$el = el
    vm._update(vm._render())
}