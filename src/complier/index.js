import {
  parseHTML
} from './parse.js'
export function compileToFunction(template) {
  // 1.第一步需要将模板转换成ast语法树
  const ast = parseHTML(template)
}