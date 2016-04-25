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

var eventUtil = {
	addHandler: function(element,type,handler){
		if(element.addEventListener){
			element.addEventListener(type,handler,false);
		}
		else if(element.attachEvent){
			element.attachEvent("on"+type,handler);
		}
		else{
			element["on"+type]=handler;
		}
	},
	removeHandler: function(element,type,handler){
		if(element.removeEventListener){
			element.removeEventListener(type,handler,false);
		}
		else if(element.detachEvent){
			element.detachEvent("on"+type,handler);
		}
		else{
			element["on"+type]=null;
		}
	},
	getEvent: function(event){
		return event?event:window.event;
	},
	getTarget: function(event){
		return event.target||event.srcElement;
	},
	preventDefault: function(event){
		if(event.preventDefault){
			event.preventDefault();
		}
		else{
			event.returnValue=false;
		}
	},
	stopPropagation: function(event){
		if(event.stopPropagation){
			event.stopPropagation();
		}
		else{
			event.cancelBubble=true;
		}
	},
	getRelatedTarget: function(event){
		if(event.relatedTarget){
			return event.relatedTarget;
		}
		else if(event.toElement){
			return event.toElement;
		}
		else if(event.fromElement){
			return event.fromElement;
		}
		else{
			return null;
		}
	}
}

var getStyle = function(ele,attr){
	return ele.currentStyle ? ele.currentStyle[attr] : getComputedStyle(ele,false)[attr];
}