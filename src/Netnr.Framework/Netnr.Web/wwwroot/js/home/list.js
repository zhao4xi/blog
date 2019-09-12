var lsar = localStorage.getItem('AnonymousReply');
try {
    lsar = lsar == null ? {} : JSON.parse(lsar);
    $('#WrAnonymousName').val(lsar.name || "");
    $('#WrAnonymousMail').val(lsar.mail || "");
    $('#WrAnonymousLink').val(lsar.link || "");
} catch (e) { }

//初始化MarkDown
require(['vs/editor/editor.main'], function () {
    window.nmd = new netnrmd('#replyeditor', {
        storekey: "md_autosave_reply",

        //渲染前回调
        viewbefore: function () {
            this.items.splice(0, 0, { title: '表情', cmd: 'emoji', svg: "M512 1024A512 512 0 1 0 512 0a512 512 0 0 0 0 1024zM512 96a416 416 0 1 1 0 832 416 416 0 0 1 0-832zM256 320a64 64 0 1 1 128 0 64 64 0 0 1-128 0z m384 0a64 64 0 1 1 128 0 64 64 0 0 1-128 0z m64.128 307.264l82.304 49.408C730.496 769.728 628.544 832 512 832s-218.432-62.272-274.432-155.328l82.304-49.408C359.04 692.416 430.4 736 512 736s152.896-43.584 192.128-108.736z" });
        },
        //命令回调
        cmdcallback: function (cmd) {
            var that = this;
            switch (cmd) {
                case "emoji":
                    {
                        if (!that.emojipopup) {
                            //构建弹出内容
                            var htm = [], epath = "https://cdn.jsdelivr.net/gh/netnr/emoji@master/emoji/wangwang/", emojis = ["微笑", "害羞", "吐舌头", "偷笑", "爱慕", "大笑", "跳舞", "飞吻", "安慰", "抱抱", "加油", "胜利", "强", "亲亲", "花痴", "露齿笑", "查找", "呼叫", "算账", "财迷", "好主意", "鬼脸", "天使", "再见", "流口水", "享受", "色情狂", "呆", "思考", "迷惑", "疑问", "没钱了", "无聊", "怀疑", "嘘", "小样", "摇头", "感冒", "尴尬", "傻笑", "不会吧", "无奈", "流汗", "凄凉", "困了", "晕", "忧伤", "委屈", "悲伤", "大哭", "痛哭", "I服了U", "对不起", "再见（舍不得）", "皱眉", "好累", "生病", "吐", "背", "惊讶", "惊愕", "闭嘴", "欠扁", "鄙视", "大怒", "生气", "财神", "学习雷锋", "恭喜发财", "小二", "老大", "邪恶", "单挑", "CS", "忍者", "炸弹", "惊声尖叫", "漂亮MM", "帅GG", "招财猫", "成绩", "鼓掌", "握手", "红唇", "玫瑰", "残花", "爱心", "心碎", "钱", "购物", "礼物", "收邮件", "电话", "举杯庆祝", "时钟", "等待", "很晚了（晚安）", "飞机（空运）", "支付宝"];
                            for (var i = 0; i < emojis.length; i++) {
                                htm.push('<img class="netnrmd-emoji" title="' + emojis[i] + '" src="' + epath + i + '.gif" />');
                            }
                            //弹出
                            that.emojipopup = netnrmd.popup("表情", htm.join(''));
                            //选择表情
                            $(that.emojipopup).click(function (e) {
                                e = e || window.event;
                                var target = e.target || e.srcElement;
                                if (target.nodeName == "IMG") {
                                    netnrmd.insertAfterText(that.obj.me, '![emoji](' + target.src + ' "' + target.title + '")\n');
                                    $(that.emojipopup).hide();
                                }
                            })
                        }
                        $(that.emojipopup).show();
                    }
                    break;
            }
        }
    });

});

var uid = $('#hid_uid').val();
var wid = $('#hid_wid').val();

//保存
$('#btnReply').click(function () {
    var contentMd = nmd.getmd();
    if (contentMd.length < 1) {
        jz.msg("先写点什么...");
        return false;
    }
    var rname, rlink, rmail;
    if (document.getElementById('WrAnonymousName')) {
        rname = $('#WrAnonymousName').val().trim();
        rlink = $('#WrAnonymousLink').val().trim();
        rmail = $('#WrAnonymousMail').val().trim();
        if (rname.trim() == "") {
            jz.msg("请输入昵称")
            return false;
        }
        if (rmail.trim() == "") {
            jz.msg("请输入邮箱")
            return false;
        }
        if (rlink != "" && rlink.toLowerCase().indexOf('http') != 0) {
            jz.msg("链接地址以 http 开头")
            return false;
        }
    }
    var content = nmd.gethtml();

    $.ajax({
        url: "/home/lsitreplysave",
        type: "type",
        data: {
            Uid: uid,
            UrTargetId: wid,
            UrContent: content,
            UrContentMd: contentMd,
            UrAnonymousName: rname,
            UrAnonymousLink: rlink,
            UrAnonymousMail: rmail
        },
        success: function (data) {
            if (data.code == 200) {
                localStorage.setItem('AnonymousReply', JSON.stringify({
                    name: rname,
                    mail: rmail,
                    link: rlink
                }));
                nmd.clear();
                jz.confirm({
                    content: "操作成功",
                    time: 6,
                    cancel: false,
                    remove: function () {
                        location.reload(false);
                    }
                })
            } else {
                jz.msg("操作失败");
            }
        },
        error: function () {
            jz.msg("网络错误");
        }
    });
});


//点赞
$('#btnLaud').click(function () {
    ListUserConn(1)
})
//收藏
$('#btnMark').click(function () {
    ListUserConn(2)
})
function ListUserConn(action) {
    if (window.RA) {
        console.log('The operation is too fast, try again later（' + window.RA + '）');
        return;
    }
    window.RA = 'Laud||Mark';
    $.ajax({
        url: "/home/ListUserConn/" + wid + "?a=" + action,
        dataType: 'json',
        success: function (data) {
            if (data.code == 200) {
                if (action == 1) {
                    var btnlaud = $('#btnLaud');
                    var btnnum = btnlaud.next();
                    if (data.data == 1) {
                        btnlaud[0].className = btnlaud[0].className.replace("btn-outline-", "btn-");
                        btnlaud.attr('title', '取消点赞');
                        btnnum.html(parseInt(btnnum.html()) + 1);
                    } else {
                        btnlaud[0].className = btnlaud[0].className.replace("btn-", "btn-outline-");
                        btnlaud.attr('title', '点赞');
                        btnnum.html(parseInt(btnnum.html()) - 1);
                    }
                } else {
                    var btnmark = $('#btnMark');
                    var btnnum = btnmark.next();
                    if (data.data == 1) {
                        btnmark[0].className = btnmark[0].className.replace("btn-outline-", "btn-");
                        btnmark.attr('title', '取消收藏');
                        btnnum.html(parseInt(btnnum.html()) + 1);
                    } else {
                        btnmark[0].className = btnmark[0].className.replace("btn-", "btn-outline-");
                        btnmark.attr('title', '收藏');
                        btnnum.html(parseInt(btnnum.html()) - 1);
                    }
                }
            }
        },
        error: function (ex) {
            if (ex.status == 401) {
                jz.alert('请先<a href="/account/login">登录</a>')
            } else {
                jz.alert("网络错误");
            }
        },
        complete: function () {
            window.RA = null;
        }
    })
}

//阅读量
if (sessionStorage.getItem("wid") != wid) {
    sessionStorage.setItem("wid", wid);
    $.get("/home/ListReadPlus/" + wid);
}