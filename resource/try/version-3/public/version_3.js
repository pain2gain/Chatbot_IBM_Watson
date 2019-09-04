/*
  1. 输入框中添加文字时，加号变成发送，
      检测输入框是否有文字
      将加号变成发送按键

  2. 点击加号，出现菜单

  3.菜单的图片，二维码，地址的实现

  4. 点击上菜单出现 菜单栏，实现菜单栏里面的功能

  5. 点击语音按打字框变成语音按键 如微信
      speech to text
  */

var getTime = function(){
    var myDate = new Date();
    var hour = myDate.getHours();
    var minutes = myDate.getMinutes();
    return (hour<10 ? "0"+hour: hour) +":" +(minutes<10? "0"+minutes:minutes);
  }


function httpMsg(){
  var userMsg = document.getElementById("msg").value;
  if ( userMsg != "") {
    document.getElementById("msg").value = "";
    var ul = document.getElementById("parentUl");
    var li = document.createElement('li');
    li.className = "user";
    li.innerHTML = '<p>'+userMsg+'</p>'+'<time>'+getTime()+'</time>';
    ul.appendChild(li);
    ul.scrollTop = ul.scrollHeight;
    ajaxSend(userMsg);
  }
}


function ajaxSend(userMsg) {

  $.ajax({
		url: './',
		type: 'POST',
		dataType: 'json',
    data:{jsonDatas:userMsg},
		success:function(data){
			alert(data);
		},
		error:function(data){
			alert('cuole !!!');
		}
	});
}
