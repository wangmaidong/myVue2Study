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