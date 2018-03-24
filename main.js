// ==UserScript==
// @name         唱吧歌曲下载助手
// @namespace    http://tampermonkey.net/
// @version      0.21
// @description  免费导出唱吧歌曲。在个人主页的歌曲列表中嵌入“解析/下载按钮”，在歌曲播放页拦截默认“导出”按钮的功能，直接提供音频下载功能。
// @author       dingtian
// @match        http://changba.com/u/*
// @match        http://changba.com/s/*
// @grant        none
// @License        GPL
// ==/UserScript==

(function() {
    'use strict';
    //代码开始


//判断当前页面的位置，加载不同的函数
var a = window.location.href,
    rule1 = /http(|s):\/\/changba.com\/u\/\d+/, //changba.com/u/*,
    rule2 = /http(|s):\/\/changba.com\/s\/\w+/, //changba.com/s/*
    b1 = rule1.exec(a),
    b2 = rule2.exec(a);

if (b1) {
    //console.log("http://changba.com/u*");
    listPage();
} else if (b2) {
    //console.log("http://changba.com/s*");
    palyerPage();
}


//函数开始
//整体封装 http://changba.com/u/*


function listPage() {
    //监听加载更多的click事件
    $("#loadWork").on("click", function () {
        var nowListsNum = getLists().length;
        //console.log(nowListsNum);
        checkOut(nowListsNum);
    });
    //参数：页面初始化完成时候的歌曲列表数目
    var originListsNum = getLists().length;
    //页面首次加载时执行xx函数
    addDownload(originListsNum);

    /***页面函数集合 */
    /***页面函数集合 */
    //***函数：获取歌曲列表
    function getLists() {
        return $('#work_list >.userPage-work-li'); //获取歌曲列表
    }
    //***函数：添加下载Button
    //参数：increment（列表增加的数量）
    function addDownload(increment) {
        var lists = getLists();
        //console.log(lists.length);
        //调整css，便于增加button
        lists.css("position", "relative");
        lists.each(function (i) {
            var href = $("a", this).attr("href"); //取得播放页的地址，后续增加到a标签，便于解析
            var text = $(this).children().text().replace(/(\d+|\s+)/g, ""); //取得歌曲名称并整理
            var download = $("<a></a>");
            download.css({
                "position": "absolute",
                "top": "0",
                "right": "20px",
                "color": "#ff734e"
            });
            //console.log(text);

            download.text("解析");
            download.css({
                "position": "absolute",
                "top": "0",
                "right": "20px",
                "color": "#ff734e"
            });
            download.attr({
                "href": "none",
                "title": href,
                "target": "blank"
            });
            if (i > lists.length - 1 - increment && i < lists.length) {
                if ($(this).find("img").length == 0) {
                    //console.log(lists[i]);
                    download.attr("download", text);
                    stopOpenLink(download);
                    download.appendTo(this);
                } else {
                    download.text("播放页导出");
                    download.attr({
                        "href": href,
                        "target": "blank",
                        "title": "请到播放页导出 MV 文件"
                    });
                    download.appendTo(this);
                }
            } else {
                return "没有更多的歌曲";
            }
        });
    }
    //***函数：循环检查是否有新的歌曲加入列表
    function checkOut(nowListsNum) {
        setTimeout(function () {
            compare(nowListsNum);
        }, 10);
    }
    //***比较函数开始
    function compare(nowListsNum) {
        //比较函数开始运行时的歌曲数目
        var nowListsNum1 = getLists().length;
        if (nowListsNum1 > nowListsNum) {
            //当有新歌曲列表时
            //console.log(nowListsNum1);
            var increment = nowListsNum1 - nowListsNum; //增加的歌曲数目
            //console.log(increment);
            addDownload(increment); //执行添加下载button
            return 1;
        } else if ($("#load_work").css("dispaly") === "none") {
            //console.log("没有更多歌曲了");
            return "0";
        } else {
            checkOut(nowListsNum);
            return "2";
        }
    }
    //***拦截下载按钮的click事件，并解析下载链接
    function stopOpenLink(domObj) {
        $(domObj).on("click", function () {
            if (this.href === "http://changba.com/u/none") {
                var url = this.title;
                var href = getLink(url);
                this.href = href;
                this.innerHTML = "已解析/导出";
                return false;
            } else {
                return true;
            }
        });
    }
    //***函数：解析歌曲链接
    function getLink(url) {
        //console.log(url);
        var result;
        $.ajax({
            async: false,
            type: "get",
            url: url,
            timeout: 5000,
            success: function (html) {
                result = html.match(/http(|s):\/\/.+\.mp3(?=",b=\/userwork)/g);
                result = resolveUrl(result); //调用唱吧页面原始解析函数进行转换，符合条件即转换，不符合条件返回原始url
                //console.log(result);
            }
        });
        //console.log(result);
        return result;
    }

    //***函数：唱吧源文件自带解析函数，将符合条件的url进行转换，目的不明。不转换链接不可用
    function resolveUrl(url) {
        var a = url,
            b = /userwork\/([abc])(\d+)\/(\w+)\/(\w+)\.mp3/,
            c = b.exec(a);
        if (c) {
            var d = c[1],
                e = c[2],
                f = c[3],
                g = c[4];
            e = parseInt(e, 8),
                f = parseInt(f, 16) / e / e,
                g = parseInt(g, 16) / e / e,
                "a" == d && g % 1e3 == f ?
                a = "http://a" + e + "mp3.ch" + "angba." + "com/user" + "data/user" + "work/" + f + "/" + g + ".mp3" : "c" == d && (a = "http://aliuwmp3.changba.com/userdata/userwork/" + g + ".mp3");
            return a;
        } else {
            return url;
        }
    }
}


//整体封装 http://changba.com/s/*
function palyerPage() {
    $("#export_song").off();
    var href;
    //判断当前页面是音频/视频
    if ($("#audio").length == 0) {
        //视频导出
        //暂时出现两类视频，解析方法不同
        if (jwplayer.utils.qn) {
            href = exportVideo_B();
            console.log(href);
            appendUrl(href);
        } else {
            checkParamEle();
        }
    } else {
        //音频导出
        href = $("audio").attr("src");
        console.log(href);
        appendUrl(href);
    }

    function appendUrl(href) {
        var songName = $(".widget-player > .title").text(),
            download = $("<a>");
        download.attr({
            "href": href,
            "id": "download",
            "title": "点击<导出>直接下载歌曲(来自唱吧歌曲导出助手)",
            "download": songName
        });
        $("#export_song").wrap(download);
    }


    //解析函数开始
    //解析函数开始
    //解析函数开始


    function checkParamEle() {
        setTimeout(function () {
            var playerElement = $(".wrapper param[name='movie']"); //播放地址&&参数
            if (!playerElement.length == 0) {
                //console.log(playerElement[0]);
                exportVideo_A();
            } else {
                checkParamEle();
            }
        });
    }

    function exportVideo_A() {
        //videoUrl 最简参数 "https: //p.bokecc.com/servlet/getvideofile?vid=FB811EF061C7E4849C33DC5901307461&siteid=2745FC107AA7B1F3&useragent=iPad&callback=cc"

        //解析video参数
        var playerElement = $(".wrapper param[name='movie']")[0]; //播放地址&&参数
        var playerUrl = playerElement.value;
        var splitParams = playerUrl.split("?")[1]; //取得参数部分
        var params = splitParams.split("&");
        var divid = playerUrl.name;
        var vid = params[0];
        var siteid = params[1];
        //拼接url
        var domain = "https://p.bokecc.com/servlet/getvideofile";
        var getVideoFileUrl = domain + "?" + vid + "&" + siteid + "&useragent=iPad&version=20140214&hlssupport=1&vc=";
        //console.log(getVideoFileUrl);

        //跨域请求jsonp协议
        var videoFileUrl = getUrl(getVideoFileUrl);

        function getUrl(jsonpUrl) {
            var videoFileUrl;
            $.ajax({
                async: false,
                url: jsonpUrl,
                type: "get",
                dataType: "jsonp",
                jsonp: "callback",
                success: function (json) {
                    //视频链接
                    videoFileUrl = json.copies[0].playurl;
                    console.log(videoFileUrl);
                    appendUrl(videoFileUrl);
                }
            });
            return videoFileUrl;
        }
    }

    function exportVideo_B() {
        var videoFileUrl;
        //唱吧自带函数 来自 user_work.min.js
        var l = new Array(-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 62, -1, -1, -1, 63, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, -1, -1, -1, -1, -1, -1, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, -1, -1, -1, -1, -1, -1, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, -1, -1, -1, -1, -1);

        function o(A) {
            var z, y, w, u;
            var x, t, v;
            t = A.length;
            x = 0;
            v = "";
            while (x < t) {
                do {
                    z = l[A.charCodeAt(x++) & 255];
                } while (x < t && z == -1);
                if (z == -1) {
                    break;
                }
                do {
                    y = l[A.charCodeAt(x++) & 255];
                } while (x < t && y == -1);
                if (y == -1) {
                    break;
                }
                v += String.fromCharCode((z << 2) | ((y & 48) >> 4));
                do {
                    w = A.charCodeAt(x++) & 255;
                    if (w == 61) {
                        return v;
                    }
                    w = l[w];
                } while (x < t && w == -1);
                if (w == -1) {
                    break;
                }
                v += String.fromCharCode(((y & 15) << 4) | ((w & 60) >> 2));
                do {
                    u = A.charCodeAt(x++) & 255;
                    if (u == 61) {
                        return v;
                    }
                    u = l[u];
                } while (x < t && u == -1);
                if (u == -1) {
                    break;
                }
                v += String.fromCharCode(((w & 3) << 6) | u);
            }
            return v; //返回值是视频链接
        }
        videoFileUrl = o(jwplayer.utils.qn);
        return videoFileUrl;
    }

    //解析函数结束
    //解析函数结束
    //解析函数结束
}

    //代码结束
})();