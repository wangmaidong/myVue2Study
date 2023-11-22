export function patchProps(el, props) {
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
        patchProps(vnode.el, data)
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
        // 这是比较更新的逻辑
    }
}