;(function(){
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
	var playPrev = element.byId("play-prev"),
		playNext = element.byId("play-next"),
		playStatus = element.byId("play-status"),
		playMode = element.byId("play-mode"),
		modeSingle = element.byId("mode-single"),
		modeRandom = element.byId("mode-random"),
		modeList = element.byId("mode-list"),
		isPlay = false,
		isSingle = false,
		isRandom = false;

	// 歌词格式规则
	var lrcBox = element.byId("lrc-box"),
		lrcUl = element.byClass('.lrc-list', lrcBox)[0],
		regClear = /\[\d{2}:\d{2}\.\d{0,2}\].+|\[\d{2}:\d{2}\.\d{0,2}\]/g,
		regTime = /\[\d{2}:\d{2}\.\d{0,2}\]/g,// 时间正则（结果[00:00.00]）
		regMatchTime = /\d{2}:\d{2}/g, // 比较时间格式
		regWord = /[^\[\d{2}:\d{2}.\d{2}\]]/g,// 歌词正则（结果为单个字或者空白）
		lrcTime = [],   // 最后时间数组
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
					element.addClass(this, "hoverLi");
				}
				songItem[n].onmouseout = function() {
					element.removeClass(this, "hoverLi");
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
			songPic.setAttribute('src', 'images/' + songData.info[iNow].brief + '.jpg');
			audio.setAttribute('src', 'music/' + songData.info[iNow].brief + '.mp3');
			songName.innerHTML = songData.info[iNow].name;
			songer.innerHTML = songData.info[iNow].songer;
			album.innerHTML = '《' + songData.info[iNow].album + '》';

			// 进度条、时间、歌词都重置
			progressIcon.style.left = progressVal.style.width = time.curMin = time.curSec = 0;
			progressCurTime.innerHTML = progressTotalTime.innerHTML = '00:00';

			lrcUl.innerHTML = '';

			for(var n = 0; n < songItem.length; n += 1){
				element.removeClass(songItem[n], 'cur-song');
			}

			isPlay && element.addClass(songItem[iNow], 'cur-song');

			ajaxFn({
				url: 'lrc/' + songData.info[iNow].brief + '.txt',
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
			document.body.style['background-image'] = 'url("images/' + songData.info[iNow].brief + '.jpg")';
		}
	}

	var play = {
		// 暂停或播放
		status: function() {
			if(playStatus.className === "status status-stop"){
				play.continue();
				isPlay = true;
			}else{
				play.pause();
				isPlay = false;
			}
		},
		// 上一曲
		prev: function() {
			if(isRandom){
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
		// 下一曲
		next: function() {
			if(isRandom){
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
		// 暂停播放
		pause: function() {
			playStatus.className = "status status-stop";
			songPic.className = "rorate-pic rorate-pic-stop";
			time.total = parseInt(audio.duration);
			time.cur = audio.currentTime;
			audio.pause();
			clearInterval(timer.progress);
			element.removeClass(songItem[iNow], "cur-song");
			element.addClass(songItem[iNow], "cur-song-stop");
		},
		// 重新给audio赋值src，会使continueTime = audio.currentTime=0;则歌曲从头播放
		continue: function(continueTime) {
			time.total = parseInt(audio.duration);
			playStatus.className = "status status-play";
			songPic.className = "rorate-pic";
			audio.startTime = continueTime;
			audio.play();
			clearInterval(timer.progress);
			timer.progress = setInterval(progress.update, 100);
			element.removeClass(songItem[iNow], "cur-song-stop");
			element.addClass(songItem[iNow],"cur-song");
		},
		// 播放模式
		mode: {
			switch: function(){
				var nowPlayMode = playMode.getAttribute('data-mode');
				if(nowPlayMode === 'list'){
					play.mode.change({
						type: 'random',
						playModeRemoveClass: 'play-mode-list',
						playModeAddClass: 'play-mode-random',
						isSingle: false,
						isRandom: true,
						loop: false
					})
				}else if(nowPlayMode === 'random'){
					play.mode.change({
						type: 'single',
						playModeRemoveClass: 'play-mode-random',
						playModeAddClass: 'play-mode-single',
						isSingle: true,
						isRandom: false,
						loop: true
					})
				}else{
					play.mode.change({
						type: 'list',
						playModeRemoveClass: 'play-mode-single',
						playModeAddClass: 'play-mode-list',
						isSingle: false,
						isRandom: false,
						loop: false
					})
				}
			},
			change: function(opt){
				playMode.setAttribute('data-mode', opt.type);
				element.removeClass(playMode, opt.playModeRemoveClass);
				element.addClass(playMode, opt.playModeAddClass);
				isSingle = opt.isSingle;
				isRandom = opt.isRandom;
				opt.loop ? audio.setAttribute('loop', 'loop') : audio.removeAttribute('loop');
			}
		}
	}

	var progress = {
		update: function() {

			time.total = parseInt(audio.duration);
			time.cur = parseInt(audio.currentTime);

			if(!time.total){
				progressCurTime.innerHTML = '00:00';
				progressTotalTime.innerHTML = '00:00';
				return;
			}

			progressScale = time.cur/time.total;

			progressIcon.style.left = progressVal.style.width = parseInt(progressScale*progressMoveWidth) + "px";

			// 自动下一曲
			if(progressCurTime.innerHTML === progressTotalTime.innerHTML && progressCurTime.innerHTML !== "00:00"){
				clearInterval(timer.progress);
				// 检测当前播放模式
				if(isSingle){
					timer.playNext = setTimeout(function(){
						play.continue();
					}, 1000);
				}else if(isRandom){
					timer.playNext = setTimeout(function(){
						iNow = parseInt(Math.random()*songData.total);
						song.change(iNow);
						play.continue();
					}, 1000);
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
			progressCurTime.innerHTML = fillZero(time.curMin, 2) + ":" + fillZero(time.curSec, 2);

			if(time.curSec > 0){
				return;
			}

			time.totalMin = parseInt(time.total/60);
			time.totalSec = parseInt(time.total%60);
			progressTotalTime.innerHTML = fillZero(time.totalMin, 2) + ":" + fillZero(time.totalSec, 2);
		}
	}

	var lrc = {
		get: function(songLrc) { // 处理歌词，得到歌词数组
			var oldLrc = songLrc.replace(/^\s+|\s+$/g, ''); // ajax lrc返回的歌词，对该字符串首尾删除空白
				oldShowLrcArr = [], //每次切歌，将旧时间歌词数组清空
				newShowLrcArr = [], // 新生成的数组（因有多个时间对于一句歌词，故需要重新生成歌词数组）
				repeatLrcTime = [],
				repeatLrcWord = [],  // 临时数组
				newLrc = oldLrc.match(regClear);  //清除无时间标示的信息，只剩[00:00.00]xxx 的形式。 每行都有时间（可能多个时间）对应歌词
			for(var i = 0; i < newLrc.length; i++){
				repeatLrcTime = newLrc[i].match(regTime); //得到数组项的时间
				repeatLrcWord = newLrc[i].match(regWord); //得到数组项的歌词
				if(repeatLrcTime.length === 1){
					if(!repeatLrcWord){  //如果该行歌词为空，则不能使用join. 把改行歌词设为 &nbsp;
						repeatLrcWord=["&nbsp;"];
					}
					oldShowLrcArr.push(repeatLrcTime[0] + "-" + repeatLrcWord.join(""));
				}
				else if(repeatLrcTime.length > 1){  //副歌部分，多个时间对于一行歌词
					for(var t = 0; t < repeatLrcTime.length; t++){
						oldShowLrcArr.push(repeatLrcTime[t] + "-" + repeatLrcWord.join(""));
					}
				}
			}
			newShowLrcArr = oldShowLrcArr.sort();

			//获取最后时间数组和歌词数组，一一对应
			function getLrcTimeWord(){
				lrcTime = [];  //每次切歌，将旧时间歌词数组清空。
				lrcWord = [];
				for(var show = 0; show < newShowLrcArr.length; show++){
					lrcTime.push(newShowLrcArr[show].match(regMatchTime)[0]);
					lrcWord.push(newShowLrcArr[show].split("-")[1]);
				}
			}
			getLrcTimeWord();
		},
		show: function() { // 显示歌词
			var oFragment = document.createDocumentFragment();
			for(var i = 0; i < lrcWord.length; i++){
				var lrcItem = document.createElement("li");
				lrcItem.innerHTML = lrcWord[i];
				oFragment.appendChild(lrcItem);
			}
			lrcUl.appendChild(oFragment);
		},
		scroll: function() { // 歌词滚动
			if(progressCurTime.innerHTML === '00:00'){
				move(lrcBox, 0);   // 单曲播放，或者起始播放。歌词返回顶部
			}
			for(var t = 0; t < lrcTime.length; t++){
				if(lrcTime[t] === progressCurTime.innerHTML){
					var aLrcShowLi = lrcUl.getElementsByTagName("li");
					for(var l = 0; l < aLrcShowLi.length; l++){
						aLrcShowLi[l].className = '';
						aLrcShowLi[t].className = 'curLrc';
					}
					if(t > 3){ // 如果大于第三行，则开始滚动
						move(lrcBox,aLrcShowLi[t].offsetTop - 80); // aLrcLi[t].offsetTop-lrcBox.scrollTop=4*20; 当前歌词与顶部固定位置80px
					}
				}
			}
		}
	}

	function drag(opt){
		var mPanBox = new Hammer(opt.controlEle);

		mPanBox.startX = 0;
		mPanBox.maxW = opt.barEle.offsetWidth - opt.controlEle.offsetWidth;

		mPanBox.on("panstart", function(e) {
			timer.progress && clearInterval(timer.progress);

		    mPanBox.startX = opt.controlEle.offsetLeft;

		});

		mPanBox.on("panmove", function(e) {
			var moveDisX = mPanBox.startX + e.deltaX;

		    if(moveDisX < 0){
		    	moveDisX = 0;
		    }
		    else if(moveDisX >= mPanBox.maxW){
		    	moveDisX = mPanBox.maxW;
		    }

		    opt.controlEle.style.left = moveDisX + "px";
		    opt.valEle.style.width = moveDisX + "px";

		    progressScale = moveDisX / mPanBox.maxW;

		    if(opt.type === "volume"){
				audio.volume = progressScale;
				if(progressScale === 0){
					volumeIcon02.className = "abs volume-icon03";
				}else{
					volumeIcon02.className = "abs volume-icon02";
				}
			}

			progress.updateTime(time, progressScale);
		});

		mPanBox.on("panend", function(e) {
			if(opt.type === "progress"){
				time.cur = audio.currentTime = progressScale*time.total;
				play.continue(time.cur);
			}
		});

	}

	function fillZero(str, n) {
		var str = str + '';
		while(str.length < n){
			str = '0' + str;
		}
		return str;
	}

	function move(obj, iTarget){
		clearInterval(obj.moveTimer);
		obj.moveTimer = setInterval( function() {
			var iSpeed = (iTarget-obj.scrollTop)/8;
			iSpeed = iSpeed > 0 ? Math.ceil(iSpeed) : Math.floor(iSpeed);
			if(obj.scrollTop === iTarget){
				clearInterval(obj.moveTimer);
			}else{
				obj.scrollTop += iSpeed;
			}
		}, 30);
	}

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
	eventUtil.addHandler(listBtn, "click", song.listSwitch);

	// 播放、暂停，上一曲、下一曲
	eventUtil.addHandler(playStatus, 'click', play.status);
	eventUtil.addHandler(playPrev, 'click', play.prev);
	eventUtil.addHandler(playNext, 'click', play.next);

	// 播放模式
	eventUtil.addHandler(playMode, 'click', play.mode.switch);

	// 初始化
	song.list();
	song.change(0);

})()
//  1 歌曲时间
//  2 音量控制
//  3 拖动控制歌曲进度
//  4 单曲循环，或者列表，随机循环
//  5 歌曲列表
//  6 歌词
