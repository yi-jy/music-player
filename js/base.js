var element = {
	byId : function(tagId){
		return document.getElementById(tagId.replace("#",""));
	},
	byClass : function(tagClass,par){
		var result = [] , d = par || document;
		if(d.querySelectorAll){
			result = d.querySelectorAll(tagClass);
			return result;	
		}
		else{
			var allEle = this.byTag("*",d);
			for(var i=0 ; i<allEle.length ; i++){
				if(this.hasClass(allEle[i],tagClass.replace(".",""))){
					result.push(allEle[i]);   	
				} 
			}
			return result;
		}
	},
	byTag : function(tagName,par){
		return (par || document).getElementsByTagName(tagName);
	},
	byName : function(attrName,par){
		return (par || document).getElementsByName(attrName);
	},
	show : function (ele){
		ele.style.display = "block";
	},
	hide : function (ele){
		ele.style.display = "none";
	},
	addClass : function (ele,tagClass){
		if(ele.className){
			var aClass = ele.className.split(" "),
				bAdd = true;
			for(var i=0,len=aClass.length ; i<len ; i++){
				if(aClass[i] === tagClass){
					bAdd=false;
					break;
				}
			}
			bAdd && (ele.className +=" "+ tagClass);
		}
		else{
			ele.className = tagClass;
		}
	},
	removeClass : function(ele,tagClass){
		if(!ele.className) return;
		var aClass = ele.className.split(" ");
		for(var i=0,len=aClass.length;i<len;i++){
			if(aClass[i] === tagClass){
				aClass.splice(i,1);
				ele.className=aClass.join(" ");
				return;
			}
		}
	},
	hasClass : function(ele,tagClass){
		if(!ele.className) return false;
		var aClass = ele.className.split(" "),
			bHas = false;
		for(var i=0,l = aClass.length;i<l;i++){
			if(aClass[i] === tagClass){
				bHas = true;
				break;
			}
		}
		return bHas;
	}
}

var eventUnit = {
	addEvent : function(ele,type,handler){
		if(ele.addEventListener){
			ele.addEventListener(type,handler,false);
		}
		else if(ele.attachEvent){
			ele.attachEvent("on"+type,function(){
				handler.call(ele,arguments);
			});
		}
		else{
			ele["on"+type]=handler;
		}
	}
}

var getStyle = function(ele,attr){
	return ele.currentStyle ? ele.currentStyle[attr] : getComputedStyle(ele,false)[attr];
}