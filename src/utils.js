let strate = {

}
let LIFECYCLE = ['beforeCreate', 'created', 'beforeMount', 'mounted', 'beforeUpdate', 'updated', 'activated', 'beforeDestroy', 'destroyed']
LIFECYCLE.forEach(key => {
    strate[key] = function (p, c) {
        if (c) {
            if (p) {
                return p.concat(c)
            } else {
                return [c]
            }
        } else {
            return p
        }
    }
})
export function mergeOptions(parent, child) {
    let options = {}
    function mergeFields(key) {
        if (strate[key]) {
            options[key] = strate[key](parent[key], child[key])
        } else {
            options[key] = child[key] || parent[key] // 优先使用儿子的
        }
    }
    for (let key in parent) {
        // 如果key在合并策略中,就按合并策略执行
        mergeFields(key)
    }
    for (let key in child) {
        if (!parent.hasOwnProperty(key)) {
            mergeFields(key)
        }
    }
    return options

}