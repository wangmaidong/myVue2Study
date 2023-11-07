const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*`;
const qnameCapture = `((?:${ncname}\\:)?${ncname})`;
const startTagOpen = new RegExp(`^<${qnameCapture}`); // 他匹配到的分组是一个 标签名  <xxx 匹配到的是开始 标签的名字
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`); // 匹配的是</xxxx>  最终匹配到的分组就是结束标签的名字
const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/; // 匹配属性
// 第一个分组就是属性的key value 就是 分组3/分组4/分组五
const startTagClose = /^\s*(\/?)>/; // <div> <br/>
export function parseHTML(html) {
  console.log(html)
  const ELEMENT_TYPE = 1
  const TEXT_TYPE = 3
  const stack = []
  let currentParent
  let root

  function start(tag, attrs) {
    let node = createASTElement(tag, attrs)
    // 如果node没有值，说明是第一次，那就是根节点
    if (!root) {
      root = node
    }
    // 如果父节点有值说明前面有更大一级的开始标签
    if (currentParent) {
      // 父节点和子节点互记
      node.parent = currentParent
      currentParent.children.push(node)
    }
    currentParent = node
    stack.push(node)
  }

  function end(tag) {
    // 如果是结束标签删除栈的最后一个
    let node = stack.pop()
    // 并让删除之后的新的栈的最后一项当作父节点
    currentParent = stack[stack.length - 1]
  }

  function chars(text) {
    text = text.replace(/\s/g, ' ')
    text && currentParent.children.push({
      type: TEXT_TYPE,
      text,
      parent: currentParent
    })
  }

  function createASTElement(tag, attrs) {
    return {
      tag,
      attrs,
      children: [],
      type: ELEMENT_TYPE,
      parent: null
    }
  }

  function advance(length) {
    html = html.substring(length)
  }

  function parseStartTag() {
    const start = html.match(startTagOpen)
    if (start) {
      const match = {
        tagName: start[1],
        attrs: []
      }
      // 截取掉开头 <xxxxx
      advance(start[0].length)
      // 然后如果后面有属性值也要匹配出来
      let attr, end
      // 如果属性一直存在 ，且未匹配到开始标签的结束位置
      // 要先确保没有到开始标签的结束位置 这两个逻辑与条件顺序不能反
      while (!(end = html.match(startTagClose)) && (attr = html.match(attribute))) {
        advance(attr[0].length)
        match.attrs.push({
          name: attr[1],
          // 属性的值依据正则可知是捕获的第三个或者第四个或者第五个
          value: attr[3] || attr[4] || attr[5] || true
        })
      }
      // 如果匹配到了开始标签的结束，就直接删除掉
      if (end) {
        advance(end[0].length)
      }
      return match
    }
    return false
  }
  while (html) {
    let textEnd = html.indexOf('<')
    // 如果textEnd等于0说明是模板是以<xxxxx>开头的
    // 那么可能是一个开始标签或者一个结束标签
    if (textEnd === 0) {
      const startTagMatch = parseStartTag()
      // 如果是匹配到的开始标签
      if (startTagMatch) {
        start(startTagMatch.tagName, startTagMatch.attrs)
        continue
      }
      let endTagMatch = html.match(endTag)
      // 如果是一个结束标签
      if (endTagMatch) {
        // 就删除掉截取标签
        advance(endTagMatch[0].length)
        end(endTagMatch[1])
        continue
      }
    }
    // 如果<的位置不是说0说明前面还有文本
    if (textEnd > 0) {
      let text = html.substring(0, textEnd)
      if (text) {
        chars(text)
        advance(text.length)
      }
      continue
    }
  }
  return root
}