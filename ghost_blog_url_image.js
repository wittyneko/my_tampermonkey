// ==UserScript==
// @name         Ghost URL Image
// @namespace    https://tutoo.xyz
// @version      0.1
// @description  Ghost博客输入URL直接修改封面
// @author       wittyneko

// @require      https://cdn.jsdelivr.net/npm/jquery@2.2.4/dist/jquery.min.js
// @match        https://blog.tutoo.xyz/ghost/*
// @grant        none
// @updateURL    https://raw.githubusercontent.com/wittyneko/my_tampermonkey/main/ghost_blog_url_image.js
// ==/UserScript==

(function () {
    'use strict';


    // 函数：等待元素加载成功或消失
    // 示例1: waitElement(".ivu-notice-desc", 6, 1000).then(function(){
    //     console.log("succ");
    // }).catch(function(){
    //     console.log("fail")
    // });
    // 示例2: waitElement(".ivu-notice-desc").then(
    //     function(){console.log("succ");
    //     return waitElement(".ivu-notice-desc", null, null, false)
    // }).then(function(){
    //     console.log("clear")
    // })
    function waitElement(selector, times, interval, flag = true) {
        var _times = times || -1, // 默认不限次数
            _interval = interval || 500, // 默认每次间隔500毫秒
            _selector = selector, //选择器
            _iIntervalID,
            _flag = flag; //定时器id
        return new Promise(function (resolve, reject) {
            _iIntervalID = setInterval(function () {
                if (!_times) { //是0就退出
                    clearInterval(_iIntervalID);
                    reject();
                }
                _times <= 0 || _times--; //如果是正数就 --
                var _self = $(_selector); //再次选择
                if ((_flag && _self.length) || (!_flag && !_self.length)) { //判断是否取到
                    clearInterval(_iIntervalID);
                    resolve(_iIntervalID);
                }
            }, _interval);
        });
    }

    function upadtePostFeatureImage(post) {
        var url = prompt("修改封面后会刷新页面，请先保存内容再输入URL确定修改");
        if (url != null) {
            if (!url.startsWith('http')) {
                alert(`请输入正确URL`)
                return
            }

            var xhr = new XMLHttpRequest()
            xhr.open('get', `/ghost/api/v3/admin/posts/${post}/`, false)
            xhr.setRequestHeader('content-type', 'application/json; charset=UTF-8');
            xhr.send();
            var result = JSON.parse(xhr.responseText);
            result.posts[0].feature_image = url

            xhr = new XMLHttpRequest()
            xhr.open('put', `/ghost/api/v3/admin/posts/${post}/`, true)
            xhr.setRequestHeader('accept', 'application/json, text/javascript, */*; q=0.01')
            xhr.setRequestHeader('content-type', 'application/json; charset=UTF-8');
            xhr.send(JSON.stringify({
                "posts": [{
                    "id": post,
                    "feature_image": url,
                    "updated_at": result.posts[0].updated_at
                }]
            }));
            //xhr.send(JSON.stringify(result))
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4 && xhr.status === 200) {
                    alert(`封面修改为 ${url}`)
                    console.log(xhr.responseText)
                    window.location.reload()
                }
            }
        }
    }

    function addPostDOM() {
        var url = location.href
        var post = location.href.split('/').pop()
        var isEdit = url.search('ghost/#/editor/post/') != -1
        console.log(`${isEdit}, ${post}`);
        if (isEdit) {
            waitElement("header", 20, 1000).then(function () {
                console.log("find header success");
                var dev = $('<dev class="flex items-center pl4 pr4 f8 nudge-left--1 h9 br2 br--right bg-white"></dev>').click(function () {
                    upadtePostFeatureImage(post)
                });
                var text = $('<span class="fw4 blue"></span>').text("修改封面");
                dev.append(text)
                $('header').children(".view-actions").prepend(dev)

            })

        }
    }

    function upadteTagsFeatureImage(tag) {
        var url = prompt("修改封面后会刷新页面，请先保存内容再输入URL确定修改");
        if (url != null) {
            if (!url.startsWith('http')) {
                alert(`请输入正确URL`)
                return
            }

            var xhr = new XMLHttpRequest()
            xhr.open('get', `/ghost/api/v3/admin/tags/slug/${tag}/`, false)
            xhr.setRequestHeader('content-type', 'application/json; charset=UTF-8');
            xhr.send();
            var result = JSON.parse(xhr.responseText);
            result.tags[0].feature_image = url

            var id = result.tags[0].id
            xhr = new XMLHttpRequest()
            xhr.open('put', `/ghost/api/v3/admin/tags/${id}/`, true)
            xhr.setRequestHeader('accept', 'application/json, text/javascript, */*; q=0.01')
            xhr.setRequestHeader('content-type', 'application/json; charset=UTF-8');
            xhr.send(JSON.stringify({
                "tags": [{
                    "id": id,
                    "feature_image": url,
                    "updated_at": result.tags[0].updated_at
                }]
            }));
            //xhr.send(JSON.stringify(result))
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4 && xhr.status === 200) {
                    alert(`封面修改为 ${url}`)
                    console.log(xhr.responseText)
                    window.location.reload()
                }
            }
        }
    }

    function addTagsDOM() {
        var url = location.href
        var tag = location.href.split('/').pop()
        var isEdit = url.search('ghost/#/tags/') != -1
        console.log(`${isEdit}, ${tag}`);
        if (isEdit) {
            waitElement("header", 10, 1000).then(function () {
                console.log("find header success");
                var dev = $('<dev class="flex items-center pl4 pr4 f8 nudge-left--1 h9 br2 br--right"></dev>').click(function () {
                    upadteTagsFeatureImage(tag)
                });
                var text = $('<span class="fw4 blue"></span>').text("修改封面");
                dev.append(text)
                $('header').children(".view-actions").prepend(dev)

            })

        }
    }

    window.onload = function () {
        console.log('onload');
        addPostDOM()
        addTagsDOM()
    }

    window.addEventListener('popstate', function (event) {
        console.log(event);
        addPostDOM()
        addTagsDOM()
    })

})();