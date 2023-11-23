export function createElementVnode (vm, tag,data, ...children) {
    if(data == null) {
        data = {}
    }
    // key值就是每个虚拟元素dom节点的唯一标识
    // 后续可用于diff算法
    let key = data.key
    if(key) {
        delete data.key
    }
    return vnode(vm, tag, key, data, children)
}
export function createTextVnode(vm, text) {
    return vnode(vm, undefined, undefined, undefined, undefined, text)
}
// 创建虚拟dom节点
function vnode (vm, tag, key, data, children, text) {
    return {
        vm,
        tag, 
        key,
        data,
        children,
        text
    }
}

export function isSameVnode(vnode1, vnode2){
    // 两个虚拟节点得标签名一样且key值一样就是相同的虚拟dom节点
    // 如果没有传key那么就是undefined ，也认为相等
    return vnode1.tag === vnode2.tag && vnode1.key === vnode2.key
}