(function(){
	//播放器主体
	var audio = document.createElement("audio");

	// 歌曲信息
	var songPic = element.byId("#song-pic"),
		songDes = element.byId("#song-des"),
		songName = element.byClass('.song-name', songDes)[0],
		songer = element.byClass('.songer', songDes)[0],
		album = element.byClass('.album', songDes)[0],
		iNow = 0;

	// 播放进度与时间
	var progressBar = element.byId("#progress-bar"),
		progressIcon = element.byId("#progress-icon"),
		progressVal = element.byId("#progress-val"),
		progressTime = element.byId("#progress-time"),
		progressCurTime = element.byClass('.cur-time', progressTime)[0],
		progressTotalTime = element.byClass('.total-time', progressTime)[0],
		progressMoveWidth = progressBar.offsetWidth - progressIcon.offsetWidth,
		progressScale = 0,
		time = {
			curMin: 0,
			curSec: 0,
			totalMin: 0,
			totalSec: 0,
			cur: 0,
			total: 0
		},
		timer = {
			progress: null,
			playSelect: null,
			playNext: null
		};

	// 音量键
	var volumeBar = element.byId("volume-bar"),
		volumeControl = element.byClass('.volume-control', volumeBar)[0],
		volumeVal = element.byClass('.volume-val', volumeBar)[0],
		volumeIcon02 = element.byId("volume-icon02");

	// 歌曲列表
	var listBtn = element.byId("list-btn"),
		songBox = element.byId("song-box"),
		listBd = element.byId("list-bd"),
		listGroup = element.byId("list-group"),
		songItem = null;

	// 播放与模式键
	var playPrev = $("play-prev"),
		playNext = $("play-next"),
		playStatus = $("play-status"),
		singleMode = $("single-mode"),
		randomMode = $("random-mode"),
		listMode = $("list-mode"),
		isPlay = false,
		iSingle = iRandom = false;  // 默认列表循环

	// 歌词格式规则
	var lrcBox = $("lrc-box"),
		lrcUl = lrcBox.getElementsByTagName("ul")[0],
		regClear = /\[\d{2}:\d{2}\.\d{0,2}\].+|\[\d{2}:\d{2}\.\d{0,2}\]/g,
		regTime = /\[\d{2}:\d{2}\.\d{0,2}\]/g,// 时间正则（结果[00:00.00]）
		regMatchTime = /\d{2}:\d{2}/g, // 比较时间格式
		regWord = /[^\[\d{2}:\d{2}.\d{2}\]]/g,// 歌词正则（结果为单个字或者空白）
		lrcLrc = oldLrc = newLrc = null,
		oldShowLrcArr = newShowLrcArr = [],   // 新生成的数组（因有多个时间对于一句歌词，故需要重新生成歌词数组）
		repeatLrcTime = repeatLrcWord = [],  // 临时数组 
		lrcTime = [],   // 最后时间数组 存在着对象引用
		lrcWord = [];  //  最后歌词数组

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

	var song = {
		list: function() { // 加载歌曲列表
			var oFragment = document.createDocumentFragment();
			for(var i = 0; i < songData.total; i += 1){
				var tempSongItem = document.createElement("li"),
					tempHtml = '';
				tempHtml += '<span class="list-song-tracks">';
				tempHtml += ' <span class="tracks-val">' + (i+1) + '</span>';
				tempHtml += '</span>';
				tempHtml += '<span class="list-song-name">' + songData.info[i].name + '</span>';
				tempHtml += '<span class="list-song-songer">' + songData.info[i].songer + '</span>';
				tempSongItem.innerHTML = tempHtml;
				oFragment.appendChild(tempSongItem);
			}
			listGroup.appendChild(oFragment);
			songItem = listGroup.getElementsByTagName("li");

			for(var n = 0; n < songItem.length; n += 1){
				if(n%2 !== 0){
					songItem[n].className = "bg-song";
				}
				else{
					songItem[n].removeAttribute("class");
				}

				songItem[n].onmouseover = function() {
					addClassN(this, "hoverLi");
				}
				songItem[n].onmouseout = function() {
					removeClassN(this, "hoverLi");
				}

				songItem[n].index = n;
				songItem[n].ondblclick = function() {
					iNow = this.index;
					clearTimeout(timer.playSelect);
					timer.playSelect = setTimeout( function() {  // 防止歌曲刚被点击播放，再次点击（即双击）列表时，歌曲又从0开始播放。
						song.change(iNow);
						play.continue();
					}, 200);
				}
			}
		},
		listSwitch: function() { // 歌曲列表切换
			var action = function(opt) {
				opt.btn.className = opt.className;
				opt.btn.innerHTML = opt.html;
				opt.btn.setAttribute("title", opt.title);
				opt.box.className = opt.boxClassName;
			}
			if(element.hasClass(listBtn, 'unfold-list')){
				action({
					btn: listBtn,
					className: 'abs list-btn fold-list',
					html: '<',
					title: '关闭歌曲列表',
					box: songBox,
					boxClassName: 'abs song-box song-box-fold'
				});
			}else{
				action({
					btn: listBtn,
					className: 'abs list-btn unfold-list',
					html: '>',
					title: '展开歌曲列表',
					box: songBox,
					boxClassName: 'abs song-box song-box-unfold'
				});
			}
		},
		change: function(iNow) {  // 切歌
			songPic.setAttribute("src","images/"+ songData.info[iNow].brief + ".jpg");
			audio.setAttribute("src","music/"+ songData.info[iNow].brief + ".mp3");
			songName.innerHTML= songData.info[iNow].name;
			songer.innerHTML= songData.info[iNow].songer;
			album.innerHTML="《" + songData.info[iNow].album + "》";
			progressIcon.style.left=progressVal.style.width=time.curMin = time.curSec =0; //换歌清0
			progressCurTime.innerHTML=progressTotalTime.innerHTML="00:00";

			lrcUl.innerHTML="";

			for(var n = 0; n < songItem.length; n += 1){
				removeClassN(songItem[n], "cur-song");
			}

			isPlay && addClassN(songItem[iNow], "cur-song");

			ajaxFn({
				url: "lrc/" + songData.info[iNow].brief + ".txt",
				callback: function(data) {
		            lrc.get(data);  //处理获取的歌词
				    lrc.show();
					lrc.scroll();
		        }
			});

			if(iNow > 4){
				move(listBd, songItem[iNow].offsetTop-150);
			}else{
				move(listBd, 0);
			}

			document.title= songData.info[iNow].name;
			document.body.style["background-image"] = "url('images/" + songData.info[iNow].brief + ".jpg')";
		}
	}

	var play = {
		status: function() { // 暂停或播放
			if(playStatus.className === "status status-stop"){
				play.continue();
				isPlay = true;
			}else{
				play.pause();
				isPlay = false;
			}
		},
		prev: function() { // 上一曲
			if(iRandom){
				clearTimeout(timer.playNext);
				iNow = parseInt(Math.random()*songData.total);
			}
			else{
				iNow--;
				if(iNow == -1){
					iNow = songData.total - 1;
				}
			}
			song.change(iNow);
			play.continue();
		},
		next: function() { // 下一曲
			if(iRandom){
				clearTimeout(timer.playNext);
				iNow = parseInt(Math.random()*songData.total);
			}
			else{
				iNow++;
				if(iNow == songData.total){
					iNow = 0;
				}
			}
			song.change(iNow);
			play.continue();
		},
		pause: function() { // 暂停播放
			playStatus.className = "status status-stop";
			songPic.className = "rorate-pic rorate-pic-stop";
			time.total = parseInt(audio.duration);
			time.cur = audio.currentTime;
			audio.pause();
			clearInterval(timer.progress);
			removeClassN(songItem[iNow], "cur-song");
			addClassN(songItem[iNow], "cur-song-stop");
		},
		continue: function(continueTime) { // 重新给audio赋值src，会使continueTime = audio.currentTime=0;则歌曲从头播放
			time.total = parseInt(audio.duration);
			playStatus.className = "status status-play";
			songPic.className = "rorate-pic";
			audio.startTime = continueTime;
			audio.play();
			clearInterval(timer.progress);
			timer.progress = setInterval(progress.update, 100);
			removeClassN(songItem[iNow], "cur-song-stop");
			addClassN(songItem[iNow],"cur-song");
		},
		mode: {
			list: function() {
				iSingle = iRandom = false;
				addClassN(listMode, "cur-mode");
				removeClassN(singleMode, "cur-mode");
				removeClassN(randomMode, "cur-mode");
				audio.removeAttribute("loop");
			},
			random: function() {
				iSingle = false;
				iRandom = true;
				addClassN(randomMode, "cur-mode");
				removeClassN(singleMode, "cur-mode");
				removeClassN(listMode, "cur-mode");
				audio.removeAttribute("loop");
			},
			single: function() {
				iSingle = true;
				iRandom = false;
				addClassN(singleMode, "cur-mode");
				removeClassN(randomMode, "cur-mode");
				removeClassN(listMode, "cur-mode");
				audio.setAttribute("loop", "loop");
			}
		}
	}

	var progress = {
		update: function() {

			time.total = parseInt(audio.duration);
			time.cur = parseInt(audio.currentTime);

			if(!time.total){
				progressTotalTime.innerHTML = '00:00';
				return;
			}

			progressScale = time.cur/time.total;

			progressIcon.style.left = progressVal.style.width = parseInt(progressScale*progressMoveWidth) + "px";

			// 自动下一曲
			if(progressCurTime.innerHTML === progressTotalTime.innerHTML && progressCurTime.innerHTML !== "00:00"){
				clearInterval(timer.progress);
				// 检测当前播放模式
				if(iSingle){
					clearTimeout(timer.playNext);
					play.continue();
				}else if(iRandom){
					clearTimeout(timer.playNext);
					iNow = parseInt(Math.random()*songData.total);
					song.change(iNow);
					play.continue();
				}else{
					timer.playNext = setTimeout(function(){
						iNow++;
						if(iNow == songData.total){
							iNow = 0;
						}
						song.change(iNow);
						play.continue();
					}, 1000);
				}
			}

			progress.updateTime(time, progressScale);

			lrc.scroll();
		},
		updateTime: function(time, progressScale) {
			time.curMin = parseInt(time.total*progressScale/60);
			time.curSec = Math.ceil(time.total*progressScale%60);
			if(time.curMin < 1){
				time.curMin = 0;
			}
			progressCurTime.innerHTML=fillZero(time.curMin, 2) + ":" + fillZero(time.curSec, 2);

			if(time.curSec > 0){
				return;
			}

			time.totalMin = parseInt(time.total/60);
			time.totalSec = parseInt(time.total)%60;
			progressTotalTime.innerHTML = fillZero(time.totalMin, 2) + ":" + fillZero(time.totalSec, 2);
		}
	}

	var lrc = {
		get: function(songLrc) { // 处理歌词，得到歌词数组
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
		},
		show: function() { // 显示歌词
			var oFragment=document.createDocumentFragment();
			for(var w=0;w<lrcWord.length;w++){ 
				var oLi=document.createElement("li");
				oLi.innerHTML=lrcWord[w];
				oFragment.appendChild(oLi);
			}
			lrcUl.appendChild(oFragment);
		},
		scroll: function() { // 歌词滚动
			if(progressCurTime.innerHTML=="00:00"){
				move(lrcBox,0);   // 单曲播放，或者起始播放。歌词返回顶部
			}
			for(var t=0;t<lrcTime.length;t++){
				if(lrcTime[t]==progressCurTime.innerHTML){
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
	}

	function drag(opt){
		opt.controlEle.onmousedown = function(ev){
			timer.progress && clearInterval(timer.progress);

			var oEvent = ev || event,
				disX = oEvent.clientX - opt.controlEle.offsetLeft - opt.controlEle.offsetWidth/2;
			if(opt.controlEle.setCapture){
				opt.controlEle.onmousemove = fnMove;
				opt.controlEle.onmouseup = fnUp;
				opt.controlEle.setCapture();
			}else{
				document.onmousemove = fnMove;
				document.onmouseup = fnUp;
			}
			function fnMove(ev){
				var oEvent = ev || event,
					l = oEvent.clientX - disX;

				if(l >= opt.barEle.offsetWidth - opt.controlEle.offsetWidth){
					l = opt.barEle.offsetWidth-opt.controlEle.offsetWidth;
				}else if(oEvent.clientX - disX < 0){
					l = 0;
				}

				opt.controlEle.style.left = l + "px";
				opt.valEle.style.width = l + "px";
				progressScale = l / (opt.barEle.offsetWidth - opt.controlEle.offsetWidth);

				if(opt.type === "volume"){
					audio.volume = progressScale;
					if(progressScale === 0){
						volumeIcon02.className = "abs volume-icon03";
					}
					else{
						volumeIcon02.className = "abs volume-icon02";
					}
				}

				progress.updateTime(time, progressScale);
			}
			function fnUp(){
				this.onmousemove = null;
				this.onmouseup = null;

				if(this.releaseCapture){
					this.releaseCapture();
				}

				if(opt.type === "progress"){
					time.cur = audio.currentTime = progressScale*time.total;
					play.continue(time.cur);
				}
			}
			return false;
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
	song.list();
	song.change(0);

	// 进度条拖动
	drag({
		controlEle: progressIcon,
		barEle: progressBar,
		valEle: progressVal,
		type: 'progress'
	});

	// 音量调整
	drag({
		controlEle: volumeControl,
		barEle: volumeBar,
		valEle: volumeVal,
		type: 'volume'
	});

	// 列表展开与折叠
	addEvent(listBtn, "click", song.listSwitch);

	// 播放、暂停，上一曲、下一曲
	addEvent(playStatus, "click", play.status);
	addEvent(playPrev, "click", play.prev);
	addEvent(playNext, "click", play.next);

	// 播放模式
	addEvent(listMode, "click", play.mode.list);
	addEvent(randomMode, "click", play.mode.random);
	addEvent(singleMode, "click", play.mode.single);

})()
//  1 歌曲时间
//  2 音量控制
//  3 拖动控制歌曲进度
//  4 单曲循环，或者列表，随机循环
//  5 歌曲列表
//  6 歌词
