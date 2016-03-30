(function(){
	//播放器主体
	var audio = document.createElement("audio");

	// 歌曲信息
	var songPic = $("song-pic"),
		songDes = $("song-des"),
		songName = songDes.getElementsByTagName("h2")[0],
		songer = songDes.getElementsByTagName("span")[0],
		album = songDes.getElementsByTagName("span")[1];

	// 播放进度与时间
	var proBar = $("progress-bar"),
		proIcon = $("progress-icon"),
		iW = proBar.offsetWidth-proIcon.offsetWidth,
		proVal = $("progress-val"),
		time = $("time"),
		curTimeSpan = time.getElementsByTagName("span")[0],
		totalTimeSpan = time.getElementsByTagName("span")[1],
		i=curTimeMin=curTimeSec=allTimeMin=allTimeSec=curTime=allTime=scale=0,
		barTimer=playTimer=modeTimer=moveTimer=null;

	// 音量键
	var volumeBar=$("volume-bar"),
		volumeControl=volumeBar.getElementsByTagName("b")[0],
		volumeVal=volumeBar.getElementsByTagName("b")[1],
		volumeIcon02=$("volume-icon02");

	// 歌曲列表
	var listBtn=$("list-btn"),
		songBox=$("song-box"),
		listBd=$("list-bd"),
		songUl=listBd.getElementsByTagName("ul")[0],
		aLi=null;

	// 播放与模式键
	var playPrev = $("play-prev"),
		playNext = $("play-next"),
		playStatus = $("play-status"),
		singleMode = $("single-mode"),
		randomMode = $("random-mode"),
		listMode = $("list-mode"),
		iSingle = iRandom = false;  // 默认列表循环

	// 歌词格式规则
	var lrcBox=$("lrc-box"),
		lrcUl=lrcBox.getElementsByTagName("ul")[0],
		regClear=/\[\d{2}:\d{2}\.\d{0,2}\].+|\[\d{2}:\d{2}\.\d{0,2}\]/g,
		regTime=/\[\d{2}:\d{2}\.\d{0,2}\]/g,// 时间正则（结果[00:00.00]）
		regMatchTime=/\d{2}:\d{2}/g, // 比较时间格式
		regWord=/[^\[\d{2}:\d{2}.\d{2}\]]/g,// 歌词正则（结果为单个字或者空白）
		lrcLrc=oldLrc=newLrc=null,
		oldShowLrcArr=newShowLrcArr=[],   // 新生成的数组（因有多个时间对于一句歌词，故需要重新生成歌词数组）
		repeatLrcTime=repeatLrcWord=[],  // 临时数组 
		lrcTime=[],   // 最后时间数组 存在着对象引用
		lrcWord=[];  //  最后歌词数组

	// 可播放歌曲
	var songData = {
		total: 10,
		info: [
			{
				brief: 'nndj',
				name: '难念的经',
				songer: '周华健',
				album: '天龙八部主题曲'
			},
			{
				brief: 'wcyxazn',
				name: '我曾用心爱着你',
				songer: '葛泓语',
				album: '中国好声音第二季'
			},
			{
				brief: 'fk',
				name: '浮夸',
				songer: '陈奕迅',
				album: 'U87'
			},
			{
				brief: 'ywaq',
				name: '因为爱情',
				songer: '陈奕迅/王菲',
				album: '因为爱情'
			},
			{
				brief: 'sjdqnl',
				name: '时间都去哪了',
				songer: '王铮亮',
				album: '2014春晚'
			},
			{
				brief: 'axdyj',
				name: '爱笑的眼睛',
				songer: '徐若瑄',
				album: '狠狠爱'
			},
			{
				brief: 'yayng',
				name: '越爱越难过',
				songer: '吴克羣',
				album: '为你写诗'
			},
			{
				brief: 'gyy',
				name: '过雨云',
				songer: '张敬轩',
				album: '过云雨'
			},
			{
				brief: 'ts',
				name: '她说',
				songer: '林俊杰',
				album: '她说'
			},
			{
				brief: 'allmylife',
				name: 'All My Life',
				songer: 'Shayne Ward',
				album: 'All My Life'
			}
		]
	}

	//加载歌曲列表
	function songList(){
		var oFragment = document.createDocumentFragment();
		for(var i = 0; i < songData.total; i += 1){
			var oLi = document.createElement("li");
			oLi.innerHTML  = '<span class="list-song-tracks">';
			oLi.innerHTML += '	<span class="tracks-val">' + (i+1) + '</span>';
			oLi.innerHTML += '</span>';
			oLi.innerHTML += '<span class="list-song-name">' + songData.info[i].name + '</span>';
			oLi.innerHTML += '<span class="list-song-songer">' + songData.info[i].songer + '</span>';
			oFragment.appendChild(oLi);
		}
		songUl.appendChild(oFragment);
		aLi = songUl.getElementsByTagName("li");
	}

	// 暂停与播放
	function songPlayStatus() {
		if(this.className == "status status-stop"){
			play();
		}else{
			pause();
		}
	}

	// 上一曲
	function prevSong(){
		if(iRandom){
			clearTimeout(modeTimer);
			i = parseInt(Math.random()*songData.total);
		}
		else{
			i--;
			if(i == -1){
				i = songData.total - 1;
			}
		}
		changeSong(i);
		play();
	}

	// 下一曲
	function nextSong(){
		if(iRandom){
			clearTimeout(modeTimer);
			i = parseInt(Math.random()*songData.total);
		}
		else{
			i++;
			if(i == songData.total){
				i=0;
			}
		}
		changeSong(i);
		play();
	}

	addEvent(playStatus, "click", songPlayStatus);
	addEvent(playPrev, "click", prevSong);
	addEvent(playNext, "click", nextSong);

	//换歌
	function changeSong(i){
		songPic.setAttribute("src","images/"+ songData.info[i].brief + ".jpg");
		audio.setAttribute("src","music/"+ songData.info[i].brief + ".mp3");
		songName.innerHTML= songData.info[i].name;
		songer.innerHTML= songData.info[i].songer;
		album.innerHTML="《" + songData.info[i].album + "》";
		proIcon.style.left=proVal.style.width=curTimeMin=curTimeSec=0; //换歌清0
		curTimeSpan.innerHTML=totalTimeSpan.innerHTML="00:00";
		liBg();
		lrcUl.innerHTML="";

		ajaxFn({
			url: "lrc/" + songData.info[i].brief + ".txt",
			callback: function(data) {
	            getLrc(data);  //处理获取的歌词
			    lrcShow();
				lrcScroll();
	        }
		});

		if(i>4){
			move(listBd,aLi[i].offsetTop-150);
		}
		else if(i==0){
			move(listBd,0);
		}
		document.title= songData.info[i].name;
		document.body.style["background-image"] = "url('images/" + songData.info[i].brief + ".jpg')";
	}

	// 播放
	function play(curTime){   // changeSong 与  play  合并，因为重新给audio赋值src，会使curTime=audio.currentTime=0;则歌曲从头播放
		allTime=parseInt(audio.duration);
		playStatus.className="status status-play";
		songPic.className="rorate-pic";
		audio.startTime=curTime;
		audio.play();
		clearInterval(barTimer);
		barTimer=setInterval(progress,100);
		removeClassN(aLi[i],"cur-song-stop");
		addClassN(aLi[i],"cur-song");
	}

	// 暂停播放
	function pause(curTime){
		playStatus.className="status status-stop";
		songPic.className="rorate-pic rorate-pic-stop";
		allTime=parseInt(audio.duration);
		curTime=audio.currentTime;
		audio.pause();
		clearInterval(barTimer);
		removeClassN(aLi[i],"cur-song");
		addClassN(aLi[i],"cur-song-stop");
 	}

	// 进度条和时间
	function progress(){
		allTime=parseInt(audio.duration);
		curTime=parseInt(audio.currentTime);
		proIcon.style.left=parseInt((curTime/allTime)*iW)+"px";
		proVal.style.width=parseInt((curTime/allTime)*iW)+"px";
		// 自动下一曲
		if(curTimeSpan.innerHTML==totalTimeSpan.innerHTML&&curTimeSpan.innerHTML!="00:00"){
			clearInterval(barTimer);
			if(iSingle){
				clearTimeout(modeTimer);
				play();
			}
			else if(iRandom){
				clearTimeout(modeTimer);
				i=parseInt(Math.random()*songData.total);
				changeSong(i);
				play();
			}
			else{
				modeTimer=setTimeout(function(){
					i++;
					if(i == songData.total){
						i=0;
					}
					changeSong(i);
					play();
				},1000)
			}
		}
		// 现在播放时间与总时间
		curTimeMin=parseInt(curTime/60);
		curTimeSec=curTime%60;
		if(curTimeMin<1){
			curTimeMin=0;
		}
		curTimeSpan.innerHTML=fillZero(curTimeMin,2)+":"+fillZero(curTimeSec,2);

		allTimeMin=parseInt(allTime/60);
		allTimeSec=parseInt(allTime)%60;
		totalTimeSpan.innerHTML=fillZero(allTimeMin,2)+":"+fillZero(allTimeSec,2);

		lrcScroll();
	}

	function drag(obj,elem01,elem02,option){
		obj.onmousedown=function(ev){
			var oEvent=ev||event,
				disX=oEvent.clientX-obj.offsetLeft-obj.offsetWidth/2;
			if(obj.setCapture){
				obj.onmousemove=fnMove;
				obj.onmouseup=fnUp;
				obj.setCapture();
			}
			else{
				document.onmousemove=fnMove;
				document.onmouseup=fnUp;
			}
			function fnMove(ev){
				var oEvent=ev||event;
				var l=oEvent.clientX-disX;
				if(l>=elem01.offsetWidth-obj.offsetWidth){
					l=elem01.offsetWidth-obj.offsetWidth;
				}
				else if(oEvent.clientX-disX<0){
					l=0;
				}
				obj.style.left=l+"px";
				elem02.style.width=l+"px";
				scale=l/(elem01.offsetWidth-obj.offsetWidth);
				if(option=="volume"){
					audio.volume=scale;
					if(scale==0){
						volumeIcon02.className="abs volume-icon03";
					}
					else{
						volumeIcon02.className="abs volume-icon02";
					}
				}
			}
			function fnUp(){
				this.onmousemove=null;
				this.onmouseup=null;
				if(this.releaseCapture){
					this.releaseCapture();
				}

				if(option=="progress"){
					curTime=audio.currentTime=scale*allTime;
					play(curTime);
				}
			}
			return false;
		}
	}

	// 列表展开与折叠
	addEvent(listBtn,"click",listBtnFn);
	function listBtnFn(){
		if(listBtn.className=="abs list-btn unfold-list"){
			listAction(listBtn,"abs list-btn fold-list","<","关闭歌曲列表","abs song-box song-box-fold");
		}
		else{
			listAction(listBtn,"abs list-btn unfold-list",">","展开歌曲列表","abs song-box song-box-unfold");
		}
		function listAction(obj,btnClass,btnHtml,btnTitle,songBoxClass){
			obj.className=btnClass;
			obj.innerHTML=btnHtml;
			obj.setAttribute("title",btnTitle);
			songBox.className=songBoxClass;
		}
	}

	function liBg(){
		for(var a=0;a<aLi.length;a++){
			if(a%2!=0){
				aLi[a].className="bg-song";
			}
			else{
				aLi[a].removeAttribute("class");
			}
		}
	}

	function actionLi(){
		for(var a=0;a<aLi.length;a++){
			aLi[a].onmouseover=function(){
				addClassN(this,"hoverLi");
			}
			aLi[a].onmouseout=function(){
				removeClassN(this,"hoverLi");
			}
			aLi[a].index=a;
			aLi[a].onclick=function(){
				i=this.index;
				clearTimeout(playTimer);
				playTimer=setTimeout(function(){  // 防止歌曲刚被点击播放，再次点击（即双击）列表时，歌曲又从0开始播放。
					changeSong(i);
					play();
				},500);
			}
		}
	}

	function playMode(){
		addEvent(singleMode,"click",singleFn);
		addEvent(randomMode,"click",randomFn);
		addEvent(listMode,"click",listFn);
		function singleFn(){
			iSingle=true;
			iRandom=false;
			addClassN(singleMode,"cur-mode");
			removeClassN(randomMode,"cur-mode");
			removeClassN(listMode,"cur-mode");
			audio.setAttribute("loop","loop");
		}
		function randomFn(){
			iSingle=false;
			iRandom=true;
			addClassN(randomMode,"cur-mode");
			removeClassN(singleMode,"cur-mode");
			removeClassN(listMode,"cur-mode");
			audio.removeAttribute("loop");
		}
		function listFn(){
			iSingle=iRandom=false;
			addClassN(listMode,"cur-mode");
			removeClassN(singleMode,"cur-mode");
			removeClassN(randomMode,"cur-mode");
			audio.removeAttribute("loop");
		}
	}

	// 处理歌词，得到歌词数组
	function getLrc(songLrc){
		oldLrc=songLrc.replace(/^\s+|\s+$/g,""); // ajax lrc返回的歌词，对该字符串首尾删除空白
		newLrc=oldLrc.match(regClear);  //清除无时间标示的信息，只剩[00:00.00]xxx 的形式。 每行都有时间（可能多个时间）对应歌词
		oldShowLrcArr=[];  //每次切歌，将旧时间歌词数组清空。
		for(var i=0;i<newLrc.length;i++){
			repeatLrcTime=newLrc[i].match(regTime); //得到数组项的时间
			repeatLrcWord=newLrc[i].match(regWord); //得到数组项的歌词
			if(repeatLrcTime.length==1){
				if(!repeatLrcWord){  //如果该行歌词为空，则不能使用join. 把改行歌词设为 &nbsp;
					repeatLrcWord=["&nbsp;"];
				}
				oldShowLrcArr.push(repeatLrcTime[0]+"-"+repeatLrcWord.join(""));
			}
			else if(repeatLrcTime.length>1){  //副歌部分，多个时间对于一行歌词
				for(var r=0;r<repeatLrcTime.length;r++){
					oldShowLrcArr.push(repeatLrcTime[r]+"-"+repeatLrcWord.join(""));
				}
			}
		}
		newShowLrcArr=oldShowLrcArr.sort();

		//获取最后时间数组和歌词数组，一一对应
		function getLrcTimeWord(){
			lrcTime=[];  //每次切歌，将旧时间歌词数组清空。
			lrcWord=[];
			for(var show=0;show<newShowLrcArr.length;show++){
				lrcTime.push(newShowLrcArr[show].match(regMatchTime)[0]);
				lrcWord.push(newShowLrcArr[show].split("-")[1]);
			}
		}
		getLrcTimeWord();
	}

	// 显示歌词
	function lrcShow(){
		var oFragment=document.createDocumentFragment();
		for(var w=0;w<lrcWord.length;w++){ 
			var oLi=document.createElement("li");
			oLi.innerHTML=lrcWord[w];
			oFragment.appendChild(oLi);
		}
		lrcUl.appendChild(oFragment);
	}

	// 歌词滚动
	function lrcScroll(){
		if(curTimeSpan.innerHTML=="00:00"){
			move(lrcBox,0);   // 单曲播放，或者起始播放。歌词返回顶部
		}
		for(var t=0;t<lrcTime.length;t++){
			if(lrcTime[t]==curTimeSpan.innerHTML){
				var aLrcShowLi=lrcUl.getElementsByTagName("li");
				for(var w=0;w<aLrcShowLi.length;w++){
					aLrcShowLi[w].className="";
					aLrcShowLi[t].className="curLrc";
				}
				if(t>3){ // 如果大于第三行，则开始滚动	
					move(lrcBox,aLrcShowLi[t].offsetTop-80); // aLrcLi[t].offsetTop-lrcBox.scrollTop=4*20; 当前歌词与顶部固定位置80px
				}
			}
		}
	}

	function $(id){
		return document.getElementById(id);
	}

	function addEvent(obj,sEvent,fn){
		if(obj.attachEvent){
			obj.attachEvent("on"+sEvent,fn);
		}
		else{
			obj.addEventListener(sEvent,fn,false);
		}
	}

	function addClassN(obj,sClass){
	   if(obj.className){
			var aClass=obj.className.split(" "),bAdd=true;
			for(var i=0,len=aClass.length;i<len;i++){
				if(aClass[i]===sClass){
					bAdd=false;
					break;
				}
			}
			if(bAdd){
				obj.className+=" "+sClass;
			}
		}
		else{
			obj.className=sClass;
		}
	}

	function removeClassN(obj,sClass){
		if(obj.className){
			var aClass=obj.className.split(" ");
			for(var i=0,len=aClass.length;i<len;i++){
				if(aClass[i]==sClass){
					aClass.splice(i,1);
					obj.className=aClass.join(" ");
					return;
				}
			}
		}
	}

	function fillZero(str,n){
		var str=str+"";
		while(str.length<n){
			str="0"+str;
		}
		return str;
	}

	function move(obj,iTarget){
		clearInterval(obj.moveTimer);
		obj.moveTimer=setInterval(function(){
			var iSpeed=(iTarget-obj.scrollTop)/8;
			iSpeed=iSpeed>0?Math.ceil(iSpeed):Math.floor(iSpeed);
			if(obj.scrollTop==iTarget){
				clearInterval(obj.moveTimer);
			}
			else{
				obj.scrollTop+=iSpeed;
			}
		},30);
	}

	// 初始化
	songList();
	changeSong(0);
	drag(proIcon,proBar,proVal,"progress");
	drag(volumeControl,volumeBar,volumeVal,"volume");
	actionLi();
	playMode();

})()
//  1 歌曲时间
//  2 音量控制
//  3 拖动控制歌曲进度
//  4 单曲循环，或者列表，随机循环
//  5 歌曲列表
//  6 歌词
