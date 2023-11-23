import {
  parseHTML
} from './parse.js'
const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g; // {{ asdsadsa }}  匹配到的内容就是我们表达式的变量
const newDefaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g;
function genProps(attrs) {
  let str = ''
  for (let i = 0; i < attrs.length; i++) {
    let attr = attrs[i]
    if (attr.name == 'style') {
      let obj = {}
      attr.value.split(';').forEach(item => {
        let [key, value] = item.split(':')
        obj[key.trim()] = value
      })
      attr.value = obj
    }
    str += `${attr.name}:${JSON.stringify(attr.value)},`
  }
  return `{${str.slice(0, -1)}}`
}
function gen(node) {
  // 如果是一个元素节点
  if (node.type === 1) {
    return codegen(node)
  } else { // 如果是一个文本节点
    let text = node.text
    // 如果是一个{{name}} hello  {{name}} hello这样的字符串，defaultTagRE.test()会返回true
    // 这时候defaultTagRE的lastIndex值就不再是0了，所以到了else分支需要重新把lastIndex值重置为0
    // lastIndex值就是下一次匹配时开始的位置
    if (!defaultTagRE.test(text)) {
      return `_v(${JSON.stringify(text)})`
    } else {
      //_v( _s(name)+'hello' + _s(name))
      let tokens = [];
      let match;
      defaultTagRE.lastIndex = 0; // defaultTagRE.test(text)为真的时候也会改变lastIndex的值
      let lastIndex = 0;
      while (match = defaultTagRE.exec(text)) {
        // 匹配到的{{xxx}}在字符串中出现的位置
        let index = match.index
        if (lastIndex < index) { // 说明可能'    {{ aaaa}}    {{bbbbb}}  '这段文本的开头与{{ aaaaa}}的内容
          tokens.push(`${JSON.stringify(text.slice(lastIndex, index))}`)
        }
        lastIndex = index + match[0].length
        tokens.push(`_s(${match[1].trim()})`)
      }
      if (lastIndex < text.length) {
        tokens.push(`${JSON.stringify(text.slice(lastIndex))}`)
      }
      return `_v(${tokens.join('+')})`
    }
  }
}
function genChildren(children) {
  return children.map(child => gen(child)).join(',')
}
function codegen(ast) {
  let children = genChildren(ast.children)
  // 要返回一个如下的内容
  //  _c('div',{id:'app'},_c('div',{style:{color:'red'}},  _v(_s(vm.name)+'hello'),_c('span',undefined,  _v(_s(age))))
  return `_c('${ast.tag}',
    ${ast.attrs.length > 0 ? genProps(ast.attrs) : null}
    ${ast.children.length > 0 ? `,${children}` : ''})`
}
export function compileToFunction(template) {
  // 1.第一步需要将模板转换成ast语法树
  const ast = parseHTML(template)
  // 2.将抽象语法树生成render函数 ，render函数的执行结果就是虚拟dom
  console.log(ast)
  let code = codegen(ast)
  console.log(code)
  code = `with(this){ return ${code}}`
  let render = new Function(code)
  return render
}