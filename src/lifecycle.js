import { createElementVnode, createTextVnode } from './vdom/index.js'
import { Watcher } from './observe/watcher.js'
function patchProps(el, props) {
    for (let key in props) {
        let value = props[key]
        if (key === 'style') {
            for (let k in value) {
                el.style[k] = value[k]
            }
        } else {
            el.setAttribute(key, value)
        }
    }
}
function create(vnode) {
    let { vm, tag, data, children, text } = vnode
    if (typeof tag === 'string') {
        vnode.el = document.createElement(tag)
        patchProps(vnode.el, data)
        children.forEach(child => {
            vnode.el.appendChild(create(child))
        })
    } else {
        vnode.el = document.createTextNode(text)
    }
    return vnode.el
}
function patch(oldVNode, vnode) {
    let isRealElement = oldVNode.nodeType
    // oldVNode如果是一个真实的dom元素节点
    // 说明是初次渲染
    if (isRealElement) {
        const elm = oldVNode
        // 获取真实dom节点的父节点
        let parentElm = elm.parentNode
        // 根据虚拟dom创建真实的dom
        let newElm = create(vnode)
        // 不能直接删除elm然后在父节点添加newElm
        // 应该是现在elm的下一个节点去插入然后再移除elm
        parentElm.insertBefore(newElm, elm.nextSibling);
        parentElm.removeChild(elm); // 删除老节点
        return newElm
    } else {
        // 这是比较更新的逻辑
    }
}
export function initLifeCycle(Vue) {
    //  _c('div',{id:'app'},_c('div',{style:{color:'red'}},  _v(_s(vm.name)+'hello'),_c('span',undefined,  _v(_s(age))))
    // 用于创建元素的虚拟节点
    Vue.prototype._c = function () {
        const vm = this
        return createElementVnode(vm, ...arguments)
    }
    // 用于创建文本的虚拟节点
    Vue.prototype._v = function () {
        const vm = this
        return createTextVnode(vm, ...arguments)
    }
    // 直接取值
    Vue.prototype._s = function (value) {
        if (typeof value !== 'object') return value
        return JSON.stringify(value)
    }
    Vue.prototype._render = function () {
        const vm = this
        return vm.$options.render.call(vm)
    }
    Vue.prototype._update = function (vnode) {
        const vm = this
        const el = vm.$el // $el就是真实dom
        // patch方法既可以创建新的真实dom，也可以用于更新
        vm.$el = patch(el, vnode)
    }
}
export function mountComponent(vm, el) {
    vm.$el = el
    // 这里会去执行render函数，执行的时候就会去data里面取值，然后就可以收集依赖
    const updateComponent = () => {
        vm._update(vm._render())
    }
    new Watcher(vm , updateComponent, true)
}

export function callHook(vm, hook) {
    const handlers = vm.$options[hook]
    if(handlers) {
        handlers.forEach( handler => handler.call(vm))
    }
}