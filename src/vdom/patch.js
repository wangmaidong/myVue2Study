import { isSameVnode } from './index.js'
export function patchProps(el, oldProps = {}, props = {}) {
    let oldStyle = oldProps.style || {}
    let newStyle = props.style || {}
    for (let key in oldStyle) {
        // 如果新的style里面不包含这个属性
        if (!newStyle[key]) {
            el.style[key] = ''
        }
    }
    // 删除老的里面有的属性新的里面没有的
    for (let key in oldProps) {
        if (!props[key]) {
            el.removeAttribute(key)
        }
    }
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
export function createElm(vnode) {
    let { vm, tag, data, children, text } = vnode
    if (typeof tag === 'string') {
        vnode.el = document.createElement(tag)
        patchProps(vnode.el, {}, data)
        children.forEach(child => {
            vnode.el.appendChild(createElm(child))
        })
    } else {
        vnode.el = document.createTextNode(text)
    }
    return vnode.el
}
export function patch(oldVNode, vnode) {
    let isRealElement = oldVNode.nodeType
    // oldVNode如果是一个真实的dom元素节点
    // 说明是初次渲染
    if (isRealElement) {
        const elm = oldVNode
        // 获取真实dom节点的父节点
        let parentElm = elm.parentNode
        // 根据虚拟dom创建真实的dom
        let newElm = createElm(vnode)
        // 不能直接删除elm然后在父节点添加newElm
        // 应该是现在elm的下一个节点去插入然后再移除elm
        parentElm.insertBefore(newElm, elm.nextSibling);
        parentElm.removeChild(elm); // 删除老节点
        return newElm
    } else {
        return patchVnode(oldVNode, vnode)
    }
}

function patchVnode(oldVNode, vnode) {
    // 这是比较更新的逻辑
    // 如果两个节点不是相同的,那么父节点直接替换掉原有的子节点
    if (!isSameVnode(oldVNode, vnode)) {
        let newEl = createElm(vnode)
        // 老的虚拟dom上保存了相应的真实dom
        let oldEl = oldVNode.el
        oldEl.parentNode.replaceChild(newEl, oldEl)
        return newEl
    }
    // 下面就是相同虚拟节点 的逻辑 即tag 一样  key一样
    // 首先复用老虚拟节点的真实dom
    let el = vnode.el = oldVNode.el
    // tag为undefined表示是一个文本节点
    if (!oldVNode.tag) {
        if (oldVNode.text !== vnode.text) {
            el.textContent = vnode.text
        }
    }

    // 更新节点属性
    patchProps(el, oldVNode.data, vnode.data)

    // 更新虚拟dom的子节点
    let oldChildren = oldVNode.children || []
    let newChildren = vnode.children || []
    // 三种情况 ①老的有儿子 新的有儿子 ②老的有儿子，新的没有儿子 ③老的没有儿子，新的有儿子
    if (oldChildren.length > 0 && newChildren.length > 0) {
        updateChildren(el, oldChildren, newChildren)
    } else if (!oldChildren.length && newChildren.length > 0) {
        mountChildren(el, newChildren)
    } else if (oldChildren.length && !newChildren.length) {
        unmountChildren(el)
    }
}
function mountChildren(el, children) {
    for (let i = 0; i < children.length; i++) {
        let childEl = createElm(children[i])
        el.appendChild(childEl)
    }
}
function unmountChildren(el) {
    let childList = [...el.childNodes] 
    console.log(childList)
    for(let i =0; i < childList.length; i++) {
        el.removeChild(childList[i])
    }
}
function updateChildren(el, oldChildren,newChildren) {
    // 新旧节点列表的开头
    let oldStartIndex = 0
    let newStartIndex = 0
    // 新旧节点列表的结尾
    let oldEndIndex = oldChildren.length - 1
    let newEndIndex = newChildren.length - 1
    // 新旧节点列表的头部虚拟节点
    let oldStartVnode = oldChildren[0]
    let newStartVnode = newChildren[0]
    // 新旧节点列表的尾部虚拟节点
    let oldEndVnode = oldChildren[oldEndIndex]
    let newEndVnode = newChildren[newEndIndex]
    // 进行比对 ，条件是新旧节点列表的头部指针要小于等于尾部指针
    while(oldStartIndex <= oldEndIndex && newStartIndex <= newEndIndex) {
        // 旧 a b c  新  a  b  c  d  e  就是标签名相同且key值相同
        // 这种让他们从头开始比对
        if(isSameVnode(oldStartVnode, newStartVnode)) {
            // 比对 oldStartVnode newStartVnode 更新节点的属性和内容
            patchVnode(oldStartVnode, newStartVnode)
            // 然后让头部指针向后移动
            oldStartVnode = oldChildren[++oldStartIndex]
            newStartVnode = newChildren[++newStartIndex]
        } else if(isSameVnode(oldEndVnode, newEndVnode)) {
            // 旧 a  b  c  新   d  e  a  b  c
            // 这种情况需要从尾部开始对比
            patchVnode(oldEndVnode, newEndVnode)
            oldEndVnode = oldChildren[--oldEndIndex]
            newEndVnode = newChildren[--newEndIndex]
        }
    }

    // 跳出while循环之后一定是旧子节点列表的头尾指针或者新子节点列表的头尾指针越界了
    // 新的多了，那就要追加
    if(newStartIndex <= newEndIndex) {
        for(let i = newStartIndex; i <= newEndIndex ; i++) {
            let childEl = createElm(newChildren[i])
            // 不能直接向后插入了，第二种情况就不行了
            // el.appendChild(childEl)
            // 需要一个插入锚点
            let anchor = oldChildren[oldEndIndex + 1] ? oldChildren[oldEndIndex + 1].el : null
            el.insertBefore(childEl, anchor)
        }
    }
    // 老的多了，就要删除
    if(oldStartIndex <= oldEndIndex) {
        for(let i = oldStartIndex; i <= oldEndIndex; i++) {
            el.removeChild(oldChildren[i].el)
        }
    }
}