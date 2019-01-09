//获取当前光标位置
const getCursorPosition = function (element) {
  var caretOffset = 0;
  var doc = element.ownerDocument || element.document;
  var win = doc.defaultView || doc.parentWindow;
  var sel;
  if (typeof win.getSelection != "undefined") {//谷歌、火狐
    sel = win.getSelection();
    if (sel.rangeCount > 0) {//选中的区域
      var range = win.getSelection().getRangeAt(0);
      var preCaretRange = range.cloneRange();//克隆一个选中区域
      preCaretRange.selectNodeContents(element);//设置选中区域的节点内容为当前节点
      preCaretRange.setEnd(range.endContainer, range.endOffset);  //重置选中区域的结束位置
      caretOffset = preCaretRange.toString().length;
    }
  } else if ((sel = doc.selection) && sel.type != "Control") {//IE
    var textRange = sel.createRange();
    var preCaretTextRange = doc.body.createTextRange();
    preCaretTextRange.moveToElementText(element);
    preCaretTextRange.setEndPoint("EndToEnd", textRange);
    caretOffset = preCaretTextRange.text.length;
  }
  console.log(caretOffset)
  return caretOffset;
}

//输入框获取光标
const getPosition = function (element) {
    let cursorPos = 0;
    if (document.selection) {//IE
        var selectRange = document.selection.createRange();
        selectRange.moveStart('character', -element.value.length);
        cursorPos = selectRange.text.length;
    } else if (element.selectionStart || element.selectionStart == '0') {
        cursorPos = element.selectionStart;
    }
    return cursorPos;
}

//设置光标位置
const setCursorPosition = function (element, pos) {
  var range, selection;
  if (document.createRange)//Firefox, Chrome, Opera, Safari, IE 9+
  {
    range = document.createRange();//创建一个选中区域
    range.selectNodeContents(element);//选中节点的内容
    if(element.innerHTML.length > 0) {
      range.setStart(element.childNodes[0], pos); //设置光标起始为指定位置
    }
    range.collapse(true);       //设置选中区域为一个点
    selection = window.getSelection();//获取当前选中区域
    selection.removeAllRanges();//移出所有的选中范围
    selection.addRange(range);//添加新建的范围
  }
  else if (document.selection)//IE 8 and lower
  {
    range = document.body.createTextRange();//Create a range (a range is a like the selection but invisible)
    range.moveToElementText(element);//Select the entire contents of the element with the range
    range.collapse(false);//collapse the range to the end point. false means collapse to end rather than the start
    range.select();//Select the range (make it the visible selection
  }
}


// 设置光标位置
function setPosition(textDom, pos){
    if(textDom.setSelectionRange) {
        // IE Support
        textDom.focus();
        textDom.setSelectionRange(pos, pos);
    }else if (textDom.createTextRange) {
        // Firefox support
        var range = textDom.createTextRange();
        range.collapse(true);
        range.moveEnd('character', pos);
        range.moveStart('character', pos);
        range.select();
    }
}

function getSelectedContents(){
    if (window.getSelection) { //chrome,firefox,opera
        var range=window.getSelection().getRangeAt(0);
        var container = document.createElement('div');
        container.appendChild(range.cloneContents());
        return container.innerHTML;
        //return window.getSelection(); //只复制文本
    }
    else if (document.getSelection) { //其他
        var range=window.getSelection().getRangeAt(0);
        var container = document.createElement('div');
        container.appendChild(range.cloneContents());
        return container.innerHTML;
        //return document.getSelection(); //只复制文本
    } // by www.jquerycn.cn
    else if (document.selection) { //IE特有的
        return document.selection.createRange().htmlText;
        //return document.selection.createRange().text; //只复制文本
    }
}
export default {
  getCursorPosition,
  getPosition,
  setCursorPosition,
  setPosition,
  getSelectedContents
}

    // handleCopy(e){
    //   // console.log(window.getSelection().toString())
    //   e.clipboardData.setData('text',window.getSelection().toString())
    //   return false
    //   // .focusNode.innerHTML
    // },
    // getCursorPosition(ele){
    //   util.getCursorPosition(ele)
    // },
    // tell(e){
    //   var that = this;
    //   var startPosition = util.getCursorPosition(e.target);
    //   var header = e.target.innerHTML.slice(0,startPosition);
    //   var footer = e.target.innerHTML.slice(startPosition,-1);
    //   for (var i = 0; i < e.clipboardData.items.length; i++) {
    //      var item = e.clipboardData.items[i]
    //      if (item.kind === "string") {
    //         item.getAsString(function (str) {
    //             // str 是获取到的字符串
    //             var text = that.HTML2Text(str),
    //             len = text.length
    //             e.target.innerHTML = header + text + footer
    //             util.setCursorPosition(e.target,(header + text).length)

    //         })
    //     } else if (item.kind === "file") {
    //         var pasteFile = item.getAsFile();
    //         // pasteFile就是获取到的文件
    //     }
    //   }
      // return false
    // },