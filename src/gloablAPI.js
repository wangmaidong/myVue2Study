import { mergeOptions } from "./utils.js"
export function initGlobalApi (Vue) {
    Vue.options = {}
    Vue.mixin = function(mixin) {
        this.options = mergeOptions(this.options, mixin)
        return this
    }
}