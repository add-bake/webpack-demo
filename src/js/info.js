require("../jquery-weui/lib/weui.min");
require("../jquery-weui/css/jquery-weui.min");
require("../css/info");
import weui from "../jquery-weui/js/jquery-weui.min";
import FastClick from "../jquery-weui/lib/fastclick";

$(function() {
    var phone = getQueryString("phone");
    var iccid = getQueryString("iccid");
    $("#phone").html(phone);
    $("#iccid").html(iccid);

    // 复制iccid实现
    $(".btn-copy").on("click", function() {
        var text = document.querySelector("#iccid");
        if ($.trim(text.textContent) == "") {
            $.toast("内容为空", "text");
        } else {
            copyToClipboard(text);
        }
    });

    //获取浏览器地址栏参数
    function getQueryString(name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
        var r = window.location.search.substr(1).match(reg);
        if (r != null) return unescape(r[2]);
        return null;
    }

    /**
     * 复制到剪切板
     * @param elem example: var text = document.querySelector('#copy');
     * @returns {*} 返回成功或失败
     */
    function copyToClipboard(elem) {
        var targetId = "_hiddenCopyText_";
        var isInput = elem.tagName === "INPUT" || elem.tagName === "TEXTAREA";
        var origSelectionStart, origSelectionEnd;
        if (isInput) {
            // 如果是input标签或textarea，则直接指定该节点
            target = elem;
            origSelectionStart = elem.selectionStart;
            origSelectionEnd = elem.selectionEnd;
        } else {
            // 如果不是，则使用节点的textContent
            target = document.getElementById(targetId);
            if (!target) {
                //如果不存在，则创建一个
                var target = document.createElement("textarea");
                target.style.position = "absolute";
                target.style.left = "-9999px";
                target.style.top = "0";
                target.id = targetId;
                document.body.appendChild(target);
            }
            target.textContent = elem.textContent;
        }
        // 聚焦目标节点，选中它的内容
        var currentFocus = document.activeElement;
        target.focus();
        target.setSelectionRange(0, target.value.length);

        // 进行复制操作
        var succeed;
        try {
            succeed = document.execCommand("copy");
            $.toast("复制成功", "text");
        } catch (e) {
            succeed = false;
            $.toast("请长按点击复制", "text");
        }
        // 不再聚焦
        // if (currentFocus && typeof currentFocus.focus === "function") {
        //     currentFocus.focus();
        // }

        if (isInput) {
            // 清空临时数据
            elem.setSelectionRange(origSelectionStart, origSelectionEnd);
        } else {
            // 清空临时数据
            target.textContent = "";
        }
        return succeed;
    }
});
