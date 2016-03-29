function ajaxFn(opt) {
    opt.type = opt.type || 'GET';

    var xhr = null;

    if(window.XMLHttpRequest){
        xhr = new XMLHttpRequest();
    }else if(window.ActiveXObject){
        xhr = new ActiveXObject("Microsoft.XMLHTTP");
    }

    if(xhr){
        if(opt.paraData && opt.type == 'POST'){
            xhr.open(opt.type, opt.url, true);
            xhr.setRequestHeader("Content-Type" , "application/x-www-form-urlencoded");
            xhr.send(opt.paraData);
        }else{
            xhr.open(opt.type, opt.url + '?' + opt.paraData, true);
            xhr.send();
        }
        xhr.onreadystatechange = function()
        {
            if(xhr.readyState === 4){
                if (xhr.status === 200 || xhr.status == 0)
                {
                   // var data = eval(xhr.responseText);如果是json，则需要使用eval
                   // var data = JSON.parse(xhr.responseText);如果是json,可通过 data.code 判断状态，data.msg 返回对应的信息
                   opt.callback && opt.callback( xhr.responseText );
                }else{
                    alert( "发生错误：" + xhr.status );
                }
            }
        }
        // xhr.onerror = function(){ // ie6 不支持
        //     alert("没有网络！");
        // }
    }else{
        alert("不支持ajax");
    }
}