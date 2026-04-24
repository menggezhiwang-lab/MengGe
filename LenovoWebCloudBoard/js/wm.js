//ID选择器		v1.0.0
function d(id){
	return document.getElementById(id);
}

//class选择器
function c(cls){
	return document.getElementsByClassName(cls);
}

//元素选择器
function n(name){
	return document.getElementsByTagName(name);
}

//创建元素器
function create(string){	//传入需要创建的元素
	return document.createElement(string);
}

//批量创建元素器
function creates(string,num){	//string为要创建的元素 num为要创建的元素数量
	var domArr = [];
	for(var i = 0; i < num; i++){
		domArr.push(document.createElement(string));
	}
	return domArr;	//返回一个包含所有元素的数组集合
}

//元素添加拖动事件
HTMLElement.prototype.addDrag = function(start,move,end,bool){
	let mobile = wm.isPhone(),that = this;
	that.Add(mobile?'touchstart':'mousedown',function(e){
		let x,y,mx,my,ex,ey,ox,oy;
		x = e.changedTouches?e.changedTouches[0].clientX:e.clientX;
		y = e.changedTouches?e.changedTouches[0].clientY:e.clientY;
		ox = that.offsetLeft;
		oy = that.offsetTop;
		if(start){
			if(start.call(that,e,x,y) === false){
				return false;
			};
		}
		document.Add(mobile?'touchmove':'mousemove',dargMove);
		document.Add(mobile?'touchend':'mouseup',dargEnd);
		function dargMove(even){
			mx = even.changedTouches?even.changedTouches[0].clientX:even.clientX;
			my = even.changedTouches?even.changedTouches[0].clientY:even.clientY;
			if(!bool){
				that.style.left = ox + mx - x + 'px';
				that.style.top = oy + my - y + 'px';
			}
			move?move.call(that,even,mx,my,x,y):false;
		};
		function dargEnd(even){
			if(end){
				ex = even.changedTouches?even.changedTouches[0].clientX:even.clientX;
				ey = even.changedTouches?even.changedTouches[0].clientY:even.clientY;
				// ex = even.touches?even.touches.length > 0?even.touches[0].clientX:0:even.clientX;
				// ey = even.touches?even.touches.length > 0?even.touches[0].clientY:0:even.clientY;
				end?end.call(that,even,ex,ey,mx,my,x,y):false;
			}
			document.Remove(mobile?'touchmove':'mousemove',dargMove);
			document.Remove(mobile?'touchend':'mouseup',dargEnd);
		};
	});
}

//添加事件触发器
document.Add = function(even,method){	//even为事件名称 emthod为传入一个方法function(){}
	for(let i of even.split(' ')){
		this.addEventListener(i,method,{passive: true});
	}
}
HTMLElement.prototype.Add = function(even,method){	//even为事件名称 emthod为传入一个方法function(){}
	for(let i of even.split(' ')){
		this.addEventListener(i,method,{passive: true});
	}
}
//移除事件触发器
document.Remove = function(even,method){	//even为事件名称 emthod为传入一个方法function(){}
	for(let i of even.split(' ')){
		this.removeEventListener(i,method);
	}
}
HTMLElement.prototype.Remove = function(even,method){	//even为事件名称 emthod为传入一个方法function(){}
	for(let i of even.split(' ')){
		this.removeEventListener(i,method);
	}
}

//元素添加点击事件
HTMLElement.prototype.Click = function(start,end){
	let mobile = wm.isPhone(),that = this;
	that.Add(mobile?'touchstart':'mousedown',function(){
		start?start.call(that):false;
		document.Add(mobile?'touchend':'mouseup',dargEnd);
		function dargEnd(){
			end?end.call(that):false;
			document.Remove(mobile?'touchend':'mouseup',dargEnd);
		};
	})
}

/*常用的js选择器封装*/

//父元素选择器
HTMLElement.prototype.parent = function(){
	return this.parentNode;
}

//选择所有兄弟元素(不包含自己)
HTMLElement.prototype.siblingAll = function(cls){
	var parent = this.parentNode;
	var chilitem = parent.children;
	var chilArr = [];
	for(var i = 0; i < chilitem.length; i++){
		if(chilitem[i] !== this){
			if(cls){
				if(chilitem[i].className.indexOf(cls) !== -1){
					chilArr.push(chilitem[i]);
				}
			}else{
				chilArr.push(chilitem[i])
			}
		}
	}
	return chilArr;
}

//选择所有兄弟元素(包含自己)
HTMLElement.prototype.siblingsAll = function(cls){
	var parent = this.parentNode;
	var chilitem = parent.children;
	var chilArr = [];
	for(var i = 0; i < chilitem.length; i++){
		if(cls){
			if(chilitem[i].className.indexOf(cls) !== -1){
				chilArr.push(chilitem[i]);
			}
		}else{
			chilArr.push(chilitem[i])
		}
	}
	return chilArr;
}

//选择前面所有兄弟元素
HTMLElement.prototype.prevAll = function(){
	var parent = this.parentNode;
	var chilitem = parent.children;
	var chilArr = [];
	for(var i = 0; i < chilitem.length; i++){
		if(chilitem[i] === this){
			break;
		}
		chilArr.push(chilitem[i]);
	}
	return chilArr;
}
//选择后面所有兄弟元素
HTMLElement.prototype.nextAll = function(){
	var parent = this.parentNode;
	var chilitem = parent.children;
	var chilArr = [];
	var count = 0;
	for(var i = 0; i < chilitem.length; i++){
		if(count === 1){
			chilArr.push(chilitem[i]);
		}
		if(chilitem[i] === this){
			count = 1;
		}
	}
	return chilArr;
}
//选择上一个兄弟元素		e是指想查第几个类似于数组的下标
HTMLElement.prototype.prev = function(e){
	var count = this.previousElementSibling;
	e?e = e:e = 0;
	for(var i = 0; i < e; i++){
		count = count.previousElementSibling;
	}
	return count;
}
//选择下一个兄弟元素		e是指想查第几个类似于数组的下标
HTMLElement.prototype.next = function(e){
	var count = this.nextElementSibling;
	e?e = e:e = 0;
	for(var i = 0; i < e; i++){
		count = count.nextElementSibling;
	}
	return count;
}

//封装获取URL参数方法
function getUrlVal(name){	//name为要获取的URL参数名
	var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)"),
	r = window.location.search.substr(1).match(reg);
	if(r!=null)return  decodeURI(r[2]); return null;
}

//封装log方法
var log = console.log,
	dir = console.dir;

//弹窗
function alern(text,name,btn,btns){	//text为要弹出的提示文字 name为提示窗的标题 btn为确认按钮 btns为取消按钮
	if(wm.isPhone()){
		alert(text);
		return;
	}
	if(text === undefined){
		text = '';
	}
	if(name === undefined||name === ''){
		name = '温馨提醒';
	}
	if(btn === undefined||btn === ''){
		btn = '确定';
	}
	if(btns === ''){
		btns = '取消';
	}
	var body = n('body')[0],
	fixed = create('div'),
	div = create('div');
	if(c('fixed').length > 0){
		c('fixed')[0].parentNode.removeChild(c('fixed')[0]);
	}
	fixed.className = 'fixed';
	fixed.setCss({width: '100%',height: '100%',position: 'fixed',top: '0px',left: '0px',zIndex: '9999999',backgroundColor: 'rgba(0,0,0,0.25)'});

	div.className = 'fixed_body';
	div.setCss({display: 'inline-block',width: 'auto',height: 'auto',minWidth: '300px',maxWidth: '500px',minHeight: '200px',position: 'absolute',top: '50%',left: '50%',backgroundColor: '#ffffff',boxShadow: '0px 0px 3px #a4a4a4'});
	var divHead = create('p'),
	 	divbody = create('div'),
	 	divbtn = create('button'),
	 	divbtns = create('button');
	divHead.innerHTML = name;
	divHead.setCss({width: '97%',height: '39px',lineHeight: '39px',paddingLeft: '3%',borderBottom: '1px #e5e5e5 solid'});

	divbody.innerHTML = text;
	divbody.setCss({width: '90%',height: 'auto',minHeight: '60px',maxHeight: window.innerHeight - 400 + 'px',overflowY: 'auto',marginLeft: '5%',marginTop: '20px',marginBottom: '20px',fontSize: '15px'});

	divbtn.innerHTML = btn;
	divbtn.setCss({width: '100px',height: '40px',textAlign: 'center',lineHeight: '40px',backgroundColor: '#0D6FB8',color: '#ffffff',border: 'none',outline: 'none',cursor: 'pointer',float: 'right',marginBottom: '20px',marginRight: '20px',borderRadius: '5px'});

	divbtns.innerHTML = btns;
	divbtns.setCss({width: '100px',height: '40px',textAlign: 'center',lineHeight: '40px',backgroundColor: '#0D6FB8',color: '#ffffff',border: 'none',outline: 'none',cursor: 'pointer',float: 'right',marginBottom: '20px',marginRight: '20px',borderRadius: '5px'});
	div.appendChild(divHead);
	div.appendChild(divbody);
	div.appendChild(divbtns);
	div.appendChild(divbtn);
	if(btns === undefined){
		divbtns.style.display = 'none';
	}
	fixed.appendChild(div);
	body.appendChild(fixed);
	div.style.marginTop = -div.clientHeight/2 + 'px';
	div.style.marginLeft = -div.clientWidth/2 + 'px';
	divbtn.onmouseover = function(){
		divbtn.style.backgroundColor = '#0E76C6';
	};
	divbtn.onmouseout = function(){
		divbtn.style.backgroundColor = '#0D6FB8';
	};
	divbtn.onmousedown = function(){
		divbtn.style.backgroundColor = '#0D6FB8';
	};
	divbtn.onmouseup = function(){
		fixed.parentNode.removeChild(fixed);
		divbtn.style.backgroundColor = '#0E76C6';
		document.onkeydown = function(){};
	};
	divbtns.onmouseover = function(){
		divbtn.style.backgroundColor = '#0E76C6';
	};
	divbtns.onmouseout = function(){
		divbtn.style.backgroundColor = '#0D6FB8';
	};
	divbtns.onmousedown = function(){
		divbtn.style.backgroundColor = '#0D6FB8';
	};
	divbtns.onmouseup = function(){
		fixed.parentNode.removeChild(fixed);
		divbtn.style.backgroundColor = '#0E76C6';
		document.onkeydown = function(){};
	};
	document.onkeydown = function(e){
		e = e || window.event;
		key = e.keyCode || e.which || e.charCode;
		if(key === 13){
		fixed.parentNode.removeChild(fixed);
			document.onkeydown = function(){};
			if(e && e.preventDefault){
				e.preventDefault();
			}else{//IE阻止默认事件
				window.event.returnValue = false;
				return false;
			}
		}
		if(key === 32){
		fixed.parentNode.removeChild(fixed);
			document.onkeydown = function(){};
			if(e && e.preventDefault){
				e.preventDefault();
			}else{//IE阻止默认事件
				window.event.returnValue = false;
				return false;
			}
		}
	}
}

//加载动画
var loadingTiMore;
function loading(text){	//text为加载提示文字
	if(text === undefined){
		text = "加载中";
	}
	var body = n('body')[0],
		load = create('div');
	load.className = "body_load";
	load.setCss({width: '100%',height: '100%',position: 'fixed',left: '0px',top: '0px',backgroundColor: 'rgba(0,0,0,0.7)',zIndex: '9999999'});
	var loadDiv = create('div');
	loadDiv.setCss({width: '160px',height: '160px',position: 'absolute',top: '50%',left: '50%',marginTop: '-80px',marginLeft: '-80px'});
	var loadDivItem = create('div');
	loadDivItem.setCss({width: '160px',height: '160px',position: 'absolute',top: '0px',left: '0px',textAlign: 'center',fontSize: '12px',lineHeight: '160px',color: '#ffffff'});
	loadDiv.appendChild(loadDivItem);
	loadDivItem.innerHTML = text;
	var loadCount = 0;
	loadingTiMore = setInterval(function(){
		loadCount++;
		if(loadCount === 1){
			loadDivItem.innerHTML = text + '●';
		}
		if(loadCount === 2){
			loadDivItem.innerHTML = text + '●●';
		}
		if(loadCount === 3){
			loadDivItem.innerHTML = text + '●●●';
			loadCount = 0;
		}
	},300);
	var loadDivImg = new Image();
	loadDivImg.src = 'image/loading.png';
	loadDivImg.className = 'body_load_div_image';
	loadDivImg.setCss({width: '100%',height: '100%',position: 'absolute',top: '0px',left: '0px'});
	loadDiv.appendChild(loadDivImg);
	load.appendChild(loadDiv);
	if(body !== undefined){
		body.appendChild(load);
	}
}

//关闭加载动画
function loadingClear(){
	clearInterval(loadingTiMore);
	var body = n('body')[0],
		load = c('body_load')[0];
	if(load){
		body.removeChild(load);
	};
}

//阻止浏览器默认事件
function BlockDefault(e){
	if(e && e.preventDefault){
		e.preventDefault();
	}else{//IE阻止默认事件
		window.event.returnValue = false;
		return false;
	}
}

//ajax请求
function ajax(obj){	//type为设置请求方法 url为请求的地址 data为传递的参数 succ为成功时执行的操作 error为失败时执行的操作 json只能传入一个json字符串，代表将接收到的数据转换为json对象 header为设置请求头部信息 async为是否异步传入默认异步
	var xhr = new XMLHttpRequest();
	obj.async = obj.async?obj.async:true;
	obj.type = obj.type?obj.type:'post';
	xhr.open(obj.type,obj.url,obj.async);
	xhr.setRequestHeader("Content-Type",obj.header?obj.header:"application/x-www-form-urlencoded");
	if(obj.setHeader){
		for(var i in obj.setHeader){
			xhr.setRequestHeader(i,obj.setHeader[i]);
		}
	}
	if(obj.responseType){
		xhr.responseType = obj.responseType;
	}
	var objData = '';
	if(obj.header === 'application/json'){
		objData = obj.data;
	}else{
		for(var i in obj.data){
			objData += i;
			objData += '=';
			objData += obj.data[i];
			objData += '&';
		}
		objData = typeof(obj.data) == 'string'?obj.data:objData.substring(0,objData.length-1);
	}
	xhr.send(objData);
	xhr.onreadystatechange = function(){
		if(xhr.readyState === 4){
			if(xhr.status === 200){
				if(obj.success){
					if(obj.dataType === 'json'){
						obj.success(JSON.parse(xhr.responseText),xhr);
					}else{
						obj.success(obj.response?xhr.response:xhr.responseText,xhr);
					}
				}
			}else{
				obj.error?obj.error(xhr.status):log(xhr.status);
			}
		}
	}
}

//ES6的监听对象变化方法
function objMonitor(object){
	//将wm-style中的字符串转换为对象的提取方法
	function parseStrObjByRegExp(strDes){
		var obj = {};
		strDes.replace(/(\w+)(?::([^;]*))?/g,function(str, key, value){
			value = value.replace(/(^\s*)|(\s*$)/g, "");
			obj[key] = value;
		});
		return obj;
	}
	//渲染元素方法
	function stringBindRender(obj){
		function stringBindText (bindArr,obje,type){
			if(type){
				let text = obje[bindArr[0]];
				bindArr.splice(0,1);
				if(bindArr.length >= 1){
					stringBindText(bindArr,text,type);
				}else{
					if(type === 'if'){
						eval(domString +'="'+(text?'block':'none')+'"');
					}else if(type === 'ifo'){
						eval(domString +'="'+(text?'visible':'hidden')+'"');
					}else if(type === 'else'){
						eval(domString +'="'+(text?'none':'block')+'"');
					}else if(type === 'ifx'){
						eval(domString +'="'+(text?'flex':'none')+'"');
					}else if(type === 'elsex'){
						eval(domString +'="'+(text?'none':'flex')+'"');
					}
				}
			}else{
				let text = obje[bindArr[0]]?obje[bindArr[0]]:'';
				bindArr.splice(0,1);
				if(bindArr.length >= 1){
					stringBindText(bindArr,text);
				}else{
					eval(domString +'="'+(text?text:'')+'"');
				}
			}
		}
		let domString = 'obj.dom.' + obj.typeString;
		if(obj.type === 'if'){
			obj.stringForSlice.length >=2?stringBindText(obj.stringForSlice,obj.obj,'if'):eval(domString + '='+(obj.obj[obj.stringForSlice[0]]?'"block"':'"none"'));
		}else if(obj.type === 'ifo'){
			if(obj.stringForSlice.length >=2){
				stringBindText(obj.stringForSlice,obj.obj,'ifo')
			}else{
				let ifoShow = function(num){
					obj.dom.style.visibility = num?'visible':'hidden';
					obj.dom.style.opacity = num?1:0;
					obj.dom.style.pointerEvents = num?'auto':'none';
				}
				ifoShow(obj.obj[obj.stringForSlice[0]]?1:0);
				//eval(domString + '='+(obj.obj[obj.stringForSlice[0]]?'"visible"':'"hidden"'));
			}
		}else if(obj.type === 'else'){
			obj.stringForSlice.length >=2?stringBindText(obj.stringForSlice,obj.obj,'else'):eval(domString + '='+(obj.obj[obj.stringForSlice[0]]?'"none"':'"block"'));
		}else if(obj.type === 'ifx'){
			obj.stringForSlice.length >=2?stringBindText(obj.stringForSlice,obj.obj,'ifx'):eval(domString + '='+(obj.obj[obj.stringForSlice[0]]?'"flex"':'"none"'));
		}else if(obj.type === 'elsex'){
			obj.stringForSlice.length >=2?stringBindText(obj.stringForSlice,obj.obj,'elsex'):eval(domString + '='+(obj.obj[obj.stringForSlice[0]]?'"none"':'"flex"'));
		}else if(obj.type === 'style'){
			var styleObj = parseStrObjByRegExp(obj.stringForSlice);
			for(let i in styleObj){
				if(styleObj[i].split('.').length > 1){
					//let text = JSON.parse(JSON.stringify(obj.obj));
					let textBlen = true;
					let objObject = obj.obj;
					for(let j of styleObj[i].split('.')){
						if(objObject[j]||objObject[j] === ""){
							objObject = objObject[j];
						}else{
							textBlen = false;
							break;
						}
					}
					textBlen?obj.dom.style[i] = objObject:false;
				}else{
					obj.dom.style[i] = obj.obj[styleObj[i]];
				}
			}
		}else if(obj.type === 'click'){
			obj.obj?obj.dom.setAttribute('wm-list',JSON.stringify(obj.obj)):false;
			obj.dom.onclick = function(e){
				obj.stringForSlice == 'click'?obj.obj[obj.stringForSlice].call(this,e,obj.obj):eval(obj.stringForSlice + '.call(this,e,obj.obj)');
			}
			//obj.dom.onclick = obj.stringForSlice == 'click'?eval(obj.obj[obj.stringForSlice]):eval(obj.stringForSlice);
			//判断为移动设备注册ontouch事件，其他端创建click事件(当前ios端的官方BUG会出现滚动条触发后点击事件失效问题，故先不予采用)
			///Android|webOS|iPhone|iPod|BlackBerry/i.test(navigator.userAgent)?obj.dom.ontouchend = eval(obj.stringForSlice):obj.dom.onclick = eval(obj.stringForSlice);
		}else if(obj.type === 'input'){
			obj.obj?obj.dom.setAttribute('wm-list',JSON.stringify(obj.obj)):false;
			obj.dom.oninput = function(e){
				obj.stringForSlice == 'input'?obj.obj[obj.stringForSlice].call(this,e,obj.obj):obj.stringForSlice.call(this,e,obj.obj);
			};
		}else if(obj.type === 'change'){
			obj.obj?obj.dom.setAttribute('wm-list',JSON.stringify(obj.obj)):false;
			obj.dom.onchange = function(e){
				obj.stringForSlice == 'change'?obj.obj[obj.stringForSlice].call(this,e,obj.obj):obj.stringForSlice.call(this,e,obj.obj);
			};
		}else if(obj.type === 'load'){
			obj.obj?obj.dom.setAttribute('wm-list',JSON.stringify(obj.obj)):false;
			obj.dom.onload = function(e){
				obj.stringForSlice == 'load'?obj.obj[obj.stringForSlice].call(this,e,obj.obj):obj.stringForSlice.call(this,e,obj.obj);
			};
		}else if(obj.type === 'focus'){
			obj.obj?obj.dom.setAttribute('wm-list',JSON.stringify(obj.obj)):false;
			obj.dom.onfocus = function(e){
				obj.stringForSlice == 'focus'?obj.obj[obj.stringForSlice].call(this,e,obj.obj):obj.stringForSlice.call(this,e,obj.obj);
			};
		}else if(obj.type === 'blur'){
			obj.obj?obj.dom.setAttribute('wm-list',JSON.stringify(obj.obj)):false;
			obj.dom.onblur = function(e){
				obj.stringForSlice == 'blur'?obj.obj[obj.stringForSlice].call(this,e,obj.obj):obj.stringForSlice.call(this,e,obj.obj);
			};
		}else if(obj.type === 'for'){
			//log(obj.stringForSlice,obj.obj);
			if(obj.stringForSlice.length >= 2){

			}else{
				let objForslice = obj.obj[obj.stringForSlice[0]];
				//清除上一次复制的元素
				obj.dom.style.display = '';
				// for(let k = c(obj.dom.className).length-1; k > 0; k--){
				// 	c(obj.dom.className)[k].parentNode.removeChild(c(obj.dom.className)[k]);
				// }
				for(let k of objForslice){
					let newK = obj.dom.cloneNode(true);
					newK.removeAttribute('for-for');
					newK.classList.remove("wm");
					//newK.innerHTML = k;
					newK.setAttribute('wm-forList',JSON.stringify(k));
					obj.dom.parentNode.appendChild(newK);
					for(let o of dataBind(newK)){
						let stringForBind = String(o.getAttribute('For-bind')).split('.');
						let stringForSrc = String(o.getAttribute('For-src')).split('.');
						let stringForValue = String(o.getAttribute('For-value')).split('.');
						let stringForPlaceholder = String(o.getAttribute('For-placeholder')).split('.');
						let stringForIf = String(o.getAttribute('For-if')).split('.');
						let stringForElse = String(o.getAttribute('For-else')).split('.');
						let stringForIfx = String(o.getAttribute('For-ifx')).split('.');
						let stringForElsex = String(o.getAttribute('For-elsex')).split('.');
						let stringForStyle = o.getAttribute('For-style');
						let stringForClick = o.getAttribute('For-click');
						let stringForInput = o.getAttribute('For-input');
						let stringForChange = o.getAttribute('For-change');
						let stringForLoad = o.getAttribute('For-load');
						let stringForFocus = o.getAttribute('For-focus');
						if(stringForBind[0] !== 'null'){	//渲染for列表组件
							stringBindRender({
								stringForSlice: stringForBind,
								obj: k,
								dom: o,
								typeString: 'innerHTML',
							})
						}
						if(stringForValue[0] !== 'null'){	//渲染for列表组件的Src资源
							stringBindRender({
								stringForSlice: stringForValue,
								obj: k,
								dom: o,
								typeString: 'value',
							})
						}
						if(stringForPlaceholder[0] !== 'null'){	//渲染for列表组件的placeholder资源
							stringBindRender({
								stringForSlice: stringForPlaceholder,
								obj: k,
								dom: o,
								typeString: 'placeholder',
							})
						}
						if(stringForSrc[0] !== 'null'){	//渲染for列表组件的Src资源
							stringBindRender({
								stringForSlice: stringForSrc,
								obj: k,
								dom: o,
								typeString: 'src',
							})
						}
						if(stringForIf[0] !== 'null'){
							stringBindRender({
								stringForSlice: stringForIf,
								obj: k,
								dom: o,
								typeString: 'style.display',
								type: 'if',
							})
						}
						if(stringForElse[0] !== 'null'){
							stringBindRender({
								stringForSlice: stringForElse,
								obj: k,
								dom: o,
								typeString: 'style.display',
								type: 'else',
							})
						}
						if(stringForIfx[0] !== 'null'){
							stringBindRender({
								stringForSlice: stringForIfx,
								obj: k,
								dom: o,
								typeString: 'style.display',
								type: 'ifx',
							})
						}
						if(stringForElsex[0] !== 'null'){
							stringBindRender({
								stringForSlice: stringForElsex,
								obj: k,
								dom: o,
								typeString: 'style.display',
								type: 'elsex',
							})
						}
						//渲染style组件
						if(stringForStyle !== null){
							stringBindRender({
								stringForSlice: stringForStyle,
								obj: k,
								dom: o,
								type: 'style',
							})
						}
						//渲染Click组件
						if(stringForClick !== null){
							stringBindRender({
								stringForSlice: stringForClick,
								obj: k,
								dom: o,
								type: 'click',
							})
						}
						//渲染Input组件
						if(stringForInput !== null){
							stringBindRender({
								stringForSlice: stringForInput,
								obj: k,
								dom: o,
								type: 'input',
							})
						}
						//渲染Change组件
						if(stringForChange !== null){
							stringBindRender({
								stringForSlice: stringForChange,
								obj: k,
								dom: o,
								type: 'change',
							})
						}
						//渲染load组件
						if(stringForLoad !== null){
							stringBindRender({
								stringForSlice: stringForLoad,
								obj: k,
								dom: o,
								type: 'load',
							})
						}
						//渲染focus组件
						if(stringForFocus !== null){
							stringBindRender({
								stringForSlice: stringForFocus,
								obj: k,
								dom: o,
								type: 'focus',
							})
						}
						//渲染blur组件
						if(stringForBlur !== null){
							stringBindRender({
								stringForSlice: stringForBlur,
								obj: k,
								dom: o,
								type: 'blur',
							})
						}
					};
				}
				obj.dom.style.display = 'none';
			}
			//obj.stringForSlice = obj.stringForSlice.length >= 2?stringBindText(obj.stringForSlice,obj.obj):obj.stringForSlice[0];
			//stringBindText(obj.stringForSlice,obj.obj);
			// let newO = o.cloneNode(true);
			// newO.classList.remove("wm");
			// o.parentNode.appendChild(newO);
			// o.setAttribute('data-for',JSON.stringify(x[j]));
		}else{
			obj.stringForSlice.length >=2?stringBindText(obj.stringForSlice,obj.obj):eval(domString + '="'+(obj.obj[obj.stringForSlice[0]]||obj.obj[obj.stringForSlice[0]]===0?typeof(obj.obj[obj.stringForSlice[0]]) == 'string'?obj.obj[obj.stringForSlice[0]].replace(/\n/g, '\\n'):obj.obj[obj.stringForSlice[0]]:'')+'"');
		}
	}

	//遍历所有的dom元素
	function dataBind(dom){
		let temArr = [];
		temArr.push(dom);
		function getChildren(doms){
			[...doms.children].forEach(v => {
				temArr.push(v);
				getChildren(v);
			})
		}
		getChildren(dom);
		return temArr;
	}
	//每次调用时渲染（类似react的this.setState({})方法）
	object.upDate = function(obj){
		for(let i in obj){
			this[i] = obj[i];
		}
	}
	
	//展示浮窗事件
	object.openPopup = function(string){
		for(let i of wm.closePopupArr){
			this[i] = i!=string?false:!this[i];
		}
	}

	return new Proxy(object,{
		set: (e,txt,x)=>{
			e[txt] = x;
			for(let i of dataBind(n('html')[0])){
				let stringBind = String(i.getAttribute('wm-bind')).split('.');
				let stringBindSrc = String(i.getAttribute('wm-src')).split('.');
				let stringBindValue = String(i.getAttribute('wm-value')).split('.');
				let stringBindPlaceholder = String(i.getAttribute('wm-placeholder')).split('.');
				let stringBindIf = String(i.getAttribute('wm-if')).split('.');
				let stringBindIfO = String(i.getAttribute('wm-ifo')).split('.');
				let stringBindElse = String(i.getAttribute('wm-else')).split('.');
				let stringBindIfx = String(i.getAttribute('wm-ifx')).split('.');
				let stringBindElsex = String(i.getAttribute('wm-elsex')).split('.');
				let stringBindStyle = i.getAttribute('wm-style');
				let stringBindClick = i.getAttribute('wm-click');
				let stringBindInput = i.getAttribute('wm-input');
				let stringBindChange = i.getAttribute('wm-change');
				let stringBindLoad = i.getAttribute('wm-load');
				let stringBindFocus = i.getAttribute('wm-focus');
				let stringBindBlur = i.getAttribute('wm-blur');
				//渲染bind组件
				if(stringBind[0]&&stringBind[0] === txt){
					stringBindRender({
						stringForSlice: stringBind,
						obj: e,
						dom: i,
						typeString: 'innerHTML',
					})
				}
				//渲染Src组件
				if(stringBindSrc[0]&&stringBindSrc[0] === txt){
					stringBindRender({
						stringForSlice: stringBindSrc,
						obj: e,
						dom: i,
						typeString: 'src',
					})
				}
				//渲染value组件
				if(stringBindValue[0]&&stringBindValue[0] === txt){
					stringBindRender({
						stringForSlice: stringBindValue,
						obj: e,
						dom: i,
						typeString: 'value',
					})
				}
				//渲染placeholder组件
				if(stringBindPlaceholder[0]&&stringBindPlaceholder[0] === txt){
					stringBindRender({
						stringForSlice: stringBindPlaceholder,
						obj: e,
						dom: i,
						typeString: 'placeholder',
					})
				}
				//渲染if组件
				if(stringBindIf[0]&&stringBindIf[0] === txt){
					stringBindRender({
						stringForSlice: stringBindIf,
						obj: e,
						dom: i,
						typeString: 'style.display',
						type: 'if',
					})
				}
				//渲染if底部收起组件
				if(stringBindIfO[0]&&stringBindIfO[0] === txt){
					stringBindRender({
						stringForSlice: stringBindIfO,
						obj: e,
						dom: i,
						typeString: 'style.visibility',
						type: 'ifo',
					})
				}
				//渲染else组件
				if(stringBindElse[0]&&stringBindElse[0] === txt){
					stringBindRender({
						stringForSlice: stringBindElse,
						obj: e,
						dom: i,
						typeString: 'style.display',
						type: 'else',
					})
				}
				//渲染ifx组件
				if(stringBindIfx[0]&&stringBindIfx[0] === txt){
					stringBindRender({
						stringForSlice: stringBindIfx,
						obj: e,
						dom: i,
						typeString: 'style.display',
						type: 'ifx',
					})
				}
				//渲染elsex组件
				if(stringBindElsex[0]&&stringBindElsex[0] === txt){
					stringBindRender({
						stringForSlice: stringBindElsex,
						obj: e,
						dom: i,
						typeString: 'style.display',
						type: 'elsex',
					})
				}
				//渲染style组件
				if(stringBindStyle !== null&&stringBindStyle.indexOf(txt) !== -1){
					stringBindRender({
						stringForSlice: stringBindStyle,
						obj: e,
						dom: i,
						type: 'style',
					})
				}
				//渲染click组件
				if(stringBindClick !== null&&stringBindClick.indexOf(txt) !== -1){
					stringBindRender({
						stringForSlice: stringBindClick,
						obj: e,
						dom: i,
						type: 'click',
					})
				}
				//渲染Input组件
				if(stringBindInput !== null&&stringBindInput.indexOf(txt) !== -1){
					stringBindRender({
						stringForSlice: stringBindInput,
						obj: e,
						dom: i,
						type: 'input',
					})
				}
				//渲染Change组件
				if(stringBindChange !== null&&stringBindChange.indexOf(txt) !== -1){
					stringBindRender({
						stringForSlice: stringBindChange,
						obj: e,
						dom: i,
						type: 'change',
					})
				}
				//渲染Load组件
				if(stringBindLoad !== null&&stringBindLoad.indexOf(txt) !== -1){
					stringBindRender({
						stringForSlice: stringBindLoad,
						obj: e,
						dom: i,
						type: 'load',
					})
				}
				//渲染Focus组件
				if(stringBindFocus !== null&&stringBindFocus.indexOf(txt) !== -1){
					stringBindRender({
						stringForSlice: stringBindFocus,
						obj: e,
						dom: i,
						type: 'focus',
					})
				}
				//渲染Blur组件
				if(stringBindBlur !== null&&stringBindBlur.indexOf(txt) !== -1){
					stringBindRender({
						stringForSlice: stringBindBlur,
						obj: e,
						dom: i,
						type: 'blur',
					})
				}
				let stringFor = i.getAttribute('wm-for');
				stringFor = stringFor !== null?stringFor.split('.'):stringFor;
				//渲染for组件
				if(stringFor!==null&&stringFor[0] === txt){
					if(x){
						let xObj = x;
						if(stringFor.length >= 2){
							let count = 1;
							function stringForRe(arr){
								xObj = xObj[arr[count]];
								count++;
								arr[count] !== undefined?stringForRe(arr):false;
							}
							stringForRe(stringFor);
						}
						//清除上一次复制的元素
						c(i.className)[0].style.display = '';
						for(let k = c(i.className.split(" ")[0]).length-1; k > 0; k--){
							c(i.className.split(" ")[0])[k].parentNode.removeChild(c(i.className.split(" ")[0])[k]);
						}
						for(let j = 0; j < xObj.length; j++){
							let newI = i.cloneNode(true);
							newI.removeAttribute('wm-for');
							newI.setAttribute('wm-forList',JSON.stringify(xObj[j]));
							newI.classList.remove("wm");
							i.parentNode.appendChild(newI);
							for(let o of dataBind(newI)){
								let stringForBind = String(o.getAttribute('for-bind')).split('.');
								let stringForSrc = String(o.getAttribute('for-src')).split('.');
								let stringForValue = String(o.getAttribute('for-value')).split('.');
								let stringForPlaceholder = String(o.getAttribute('for-placeholder')).split('.');
								let stringForIf = String(o.getAttribute('for-if')).split('.');
								let stringForElse = String(o.getAttribute('for-else')).split('.');
								let stringForIfx = String(o.getAttribute('for-ifx')).split('.');
								let stringForElsex = String(o.getAttribute('for-elsex')).split('.');
								let stringForFor = String(o.getAttribute('for-for')).split('.');
								let stringForStyle = o.getAttribute('for-style');
								let stringForClick = o.getAttribute('for-click');
								let stringForInput = o.getAttribute('for-input');
								let stringForChange = o.getAttribute('for-change');
								let stringForLoad = o.getAttribute('for-load');
								let stringForFocus = o.getAttribute('for-focus');
								let stringForBlur = o.getAttribute('for-blur');
								if(stringForBind[0] !== 'null'){	//渲染for列表组件
									stringBindRender({
										stringForSlice: stringForBind,
										obj: xObj[j],
										dom: o,
										typeString: 'innerHTML',
									})
								}
								if(stringForValue[0] !== 'null'){	//渲染for列表组件的value资源
									stringBindRender({
										stringForSlice: stringForValue,
										obj: xObj[j],
										dom: o,
										typeString: 'value',
									})
								}
								if(stringForPlaceholder[0] !== 'null'){	//渲染for列表组件的placeholder资源
									stringBindRender({
										stringForSlice: stringForPlaceholder,
										obj: xObj[j],
										dom: o,
										typeString: 'placeholder',
									})
								}
								if(stringForSrc[0] !== 'null'){	//渲染for列表组件的Src资源
									stringBindRender({
										stringForSlice: stringForSrc,
										obj: xObj[j],
										dom: o,
										typeString: 'src',
									})
								}
								if(stringForIf[0] !== 'null'){
									stringBindRender({
										stringForSlice: stringForIf,
										obj: xObj[j],
										dom: o,
										typeString: 'style.display',
										type: 'if',
									})
								}
								if(stringForElse[0] !== 'null'){
									stringBindRender({
										stringForSlice: stringForElse,
										obj: xObj[j],
										dom: o,
										typeString: 'style.display',
										type: 'else',
									})
								}
								if(stringForIfx[0] !== 'null'){
									stringBindRender({
										stringForSlice: stringForIfx,
										obj: xObj[j],
										dom: o,
										typeString: 'style.display',
										type: 'ifx',
									})
								}
								if(stringForElsex[0] !== 'null'){
									stringBindRender({
										stringForSlice: stringForElsex,
										obj: xObj[j],
										dom: o,
										typeString: 'style.display',
										type: 'elsex',
									})
								}
								//log(stringForFor);
								//当dom需要双重for循环时需要该事件
								if(stringForFor[0] !== 'null'){
									stringBindRender({
										stringForSlice: stringForFor,
										obj: xObj[j],
										dom: o,
										typeString: 'txt',
										type: 'for',
									})
									// let newO = o.cloneNode(true);
									// newO.classList.remove("wm");
									// o.parentNode.appendChild(newO);
									// o.setAttribute('data-for',JSON.stringify(x[j]));
								}
								//渲染style组件
								if(stringForStyle !== null){
									stringBindRender({
										stringForSlice: stringForStyle,
										obj: xObj[j],
										dom: o,
										type: 'style',
									})
								}
								//渲染click组件
								if(stringForClick !== null){
									stringBindRender({
										stringForSlice: stringForClick,
										obj: xObj[j],
										dom: o,
										type: 'click',
									})
								}
								//渲染Input组件
								if(stringForInput !== null){
									stringBindRender({
										stringForSlice: stringForInput,
										obj: xObj[j],
										dom: o,
										type: 'input',
									})
								}
								//渲染Change组件
								if(stringForChange !== null){
									stringBindRender({
										stringForSlice: stringForChange,
										obj: xObj[j],
										dom: o,
										type: 'change',
									})
								}
								//渲染Load组件
								if(stringForLoad !== null){
									stringBindRender({
										stringForSlice: stringForLoad,
										obj: xObj[j],
										dom: o,
										type: 'load',
									})
								}
								//渲染Focus组件
								if(stringForFocus !== null){
									stringBindRender({
										stringForSlice: stringForFocus,
										obj: xObj[j],
										dom: o,
										type: 'focus',
									})
								}
								//渲染Blur组件
								if(stringForBlur !== null){
									stringBindRender({
										stringForSlice: stringForBlur,
										obj: xObj[j],
										dom: o,
										type: 'blur',
									})
								}
							};
						}
					}
					i.style.display = 'none';
				}
				if(!i.getAttribute('wm-for')){
					i.classList.remove("wm");
				}
			}
		},
	},)
}

//js中批量给元素添加innerHTML方法封装
function setHTML(domArr,objArr){	//domArr为dom数组集合 objArr为被添加的字符串组成的数组
	for(var i = 0; i < domArr.length; i++){
		domArr[i].innerHTML = objArr[i];
	}
}
//js中批量修改样式的方法封装
HTMLElement.prototype.setCss = function(json){	//json为要更改的样式键值对
	for(var i in json){
		if(!json.hasOwnProperty(i)) continue;
		this.style[i] = json[i];
	}
}
//js中批量设置className方法封装
function setClass(domArr,objArr){
	if(typeof(objArr) != 'string'){
		for(var i = 0; i < domArr.length; i++){
			domArr[i].className = objArr[i];
		}
	}else{
		for(var i = 0; i < domArr.length; i++){
			domArr[i].className = objArr;
		}
	}
}
//js中批量修改样式的方法封装(主要用于页面准备样式添加)
function setStyleX(text){
	var wmHead = n('head')[0];
	if(c('wmStyle')[0] === undefined){
		var wmStyle = create('style');
		wmStyle.type = 'text/css';
		wmStyle.className = 'wmStyle';
		wmHead.appendChild(wmStyle);
	}
	c('wmStyle')[0].innerHTML = c('wmStyle')[0].innerHTML + text;
}

//添加页面需要的样式
setStyleX('/*加载动画Class*/.body_load_div_image{animation: loadDiv 0.8s linear 0s infinite;}@keyframes loadDiv{0%{transform: rotate(0deg)}100%{transform: rotate(-360deg)}}');


//批量append目标
HTMLElement.prototype.setAppend = function(arr){
	for(var i = 0; i < arr.length; i++){
		this.appendChild(arr[i]);
	}
}

let wm = {
	//提示型弹窗
	thatData: {},	//初始化全局数据源
	controllerOff: true,	//工具栏展开收起变量
	closePopupArr: ['brushShow','infoShow','devShow'], //注册关闭弹窗事件
	selectBrush: function(e,obj){	//选择画笔颜色
		for(let i of thatData.brushColorArr){
			if(i.select){
				i.select = false;
			}
		}
		obj.select = true;
		wm.pagesArr[wm.pageIndex].canvasGlobal.brushColor = obj.color;
		thatData.brushColorArr = thatData.brushColorArr;
	},
	selectThickness: function(e,obj){	//选择画笔粗细
		for(let i of thatData.brushThicknessArr){
			if(i.select){
				i.select = false;
			}
		}

		obj.select = true;
		wm.pagesArr[wm.pageIndex].canvasGlobal.brushWidth = obj.num;
		thatData.brushThicknessArr = thatData.brushThicknessArr;
	},
	selectTextColor: function(e,obj){	//圈选选择颜色
		for(let i of thatData.circTextColorArr){
			if(i.select){
				i.select = false;
			}
		}
		ctxc.clearRect(0,0,wm.pagesArr[wm.pageIndex].canvasGlobal.width,wm.pagesArr[wm.pageIndex].canvasGlobal.height);
		ctxc.beginPath();
		contextRect(ctxc,selectObject.left - wm.scaleTransform(24),selectObject.top - wm.scaleTransform(24),selectObject.right + wm.scaleTransform(24),selectObject.bottom + wm.scaleTransform(24));
		for(let i of selectArr){
			i.mColor.mColor = intHex(obj.color);
			startDraw(ctxc,i,1);
		}
		obj.select = true;
		thatData.circTextColorSelectObj.color = obj.color;
		thatData.circTextColorSelectObj.border = obj.border;
		thatData.circTextColorSelectObj = thatData.circTextColorSelectObj;
		thatData.circTextColorArr = thatData.circTextColorArr;

		drawArrObject.header.command = 'opDoodle';
		drawArrObject.header.opId = ULID.ulid();
		drawArrObject.body = {
			ids: selectObject.ids,
			type: 4,
			x: 0,
			y: 0,
		};
		drawArrObject.body.data = {
			colorModule: 1,
			color: intHex(obj.color),
		};
		ws.send(JSON.stringify(drawArrObject));
	},
	btnCenterClose: function(){	//重置所有Center位置的按钮状态
		for(let i of thatData.btnCenter){
			if(i.select){
				i.select = false;
			}
		}
	},
	canvasGlobal: {		//画布全局数据
		scale: 1,		//画布缩放比例
		scales: 1,		//画布缩放比例未跟随实时保留
		initScale: 1,	//手机与PC端画布初始全屏缩放比例
		mobileScale: 1,	//手机与PC端画布实时全屏缩放比例
		transX: 0,		//画布X轴偏移
		transY: 0,		//画布Y轴偏移量
		transXs: 0,		//画布X轴偏移未跟随时实时保留
		transYs: 0,		//画布Y轴偏移未跟随时实时保留
		width: 3840,	//计算后大屏等比缩放尺寸（宽）
		height: 2160,	//计算后大屏等比缩放尺寸（高）
		initWidth: 3840,//大屏画布真实尺寸（宽）
		initHeight: 2160,	//大屏画布真是尺寸（高）
		brushColor: '#ffffffff',	//画笔颜色
		brushWidth: 5,	//画笔粗细
		initRepairLeft: 0,
		initRepairTop: 0,
		imageOffset: 0,
		repairLeft: 0,	//手机端与大屏端尺寸不一致时修补Left值
		repairTop: 0,	//手机端与大屏端尺寸不一致时修补Top值
	},
	scaleTransRealform(num){	//实时绘制将真实物理像素转换为canvas需要绘制的缩放像素
		return num / wm.pagesArr[wm.pageIndex].canvasGlobal.mobileScale;
	},
	backScaleTransRealform(num){	//实时绘制将canvas的缩放像素转换回真实的物理像素（与scaleTransRealform方法相反的算法）
		return num * wm.pagesArr[wm.pageIndex].canvasGlobal.mobileScale;
	},
	scaleTransform(num){	//将真实物理像素转换为canvas需要绘制的缩放像素
		return num / wm.pagesArr[wm.pageIndex].canvasGlobal.mobileScale / wm.pagesArr[wm.pageIndex].canvasGlobal.scale;
	},
	backScaleTransform(num){	//将canvas的缩放像素转换回真实的物理像素（与scaleTransform方法相反的算法）
		return num * wm.pagesArr[wm.pageIndex].canvasGlobal.mobileScale * wm.pagesArr[wm.pageIndex].canvasGlobal.scale;
	},
	initScale(pageObj){	//用户页面每次变化时初始化大屏宽度
		if(pageObj.canvasGlobal){
			if(window.innerWidth/pageObj.canvasGlobal.initWidth <= window.innerHeight/pageObj.canvasGlobal.initHeight){
				pageObj.canvasGlobal.initScale = window.innerWidth/pageObj.canvasGlobal.initWidth;
				pageObj.canvasGlobal.initRepairTop = (window.innerHeight - pageObj.canvasGlobal.initHeight * pageObj.canvasGlobal.initScale)/2;
				pageObj.canvasGlobal.initRepairLeft = 0;
				pageObj.canvasGlobal.repairTop = (window.innerHeight - pageObj.canvasGlobal.initHeight * pageObj.canvasGlobal.initScale)/2;
				pageObj.canvasGlobal.repairLeft = 0;
				pageObj.canvasGlobal.width = pageObj.canvasGlobal.initWidth;
				pageObj.canvasGlobal.height = pageObj.canvasGlobal.initHeight + pageObj.canvasGlobal.repairTop * 2 / pageObj.canvasGlobal.initScale;
				c('prevMask')[0].style.height = pageObj.canvasGlobal.initRepairTop + 'px';
				c('prevMask')[0].style.width = '100%';
				c('nextMask')[0].style.height = pageObj.canvasGlobal.initRepairTop + 'px';
				c('nextMask')[0].style.width = '100%';
			}else{
				pageObj.canvasGlobal.initScale = window.innerHeight/pageObj.canvasGlobal.initHeight;
				pageObj.canvasGlobal.initRepairTop = 0;
				pageObj.canvasGlobal.initRepairLeft = (window.innerWidth - pageObj.canvasGlobal.initWidth * pageObj.canvasGlobal.initScale)/2;
				pageObj.canvasGlobal.repairTop = 0;
				pageObj.canvasGlobal.repairLeft = (window.innerWidth - pageObj.canvasGlobal.initWidth * pageObj.canvasGlobal.initScale)/2;
				pageObj.canvasGlobal.width = pageObj.canvasGlobal.initWidth + pageObj.canvasGlobal.repairLeft * 2 / pageObj.canvasGlobal.initScale;
				pageObj.canvasGlobal.height = pageObj.canvasGlobal.initHeight;
				c('prevMask')[0].style.width = pageObj.canvasGlobal.initRepairLeft + 'px';
				c('prevMask')[0].style.height = '100%';
				c('nextMask')[0].style.width = pageObj.canvasGlobal.initRepairLeft + 'px';
				c('nextMask')[0].style.height = '100%';
			}
			pageObj.canvasGlobal.mobileScale = pageObj.canvasGlobal.initScale;
			pageObj.initCanvasGlobal = JSON.parse(JSON.stringify(pageObj.canvasGlobal));
		}
	},
	// URL: 'http://mengge-wechat.oss-cn-shanghai.aliyuncs.com/test/cloudBoard1.024/index.html',
	// URLS: 'https://testcw.igrsservice.com', //全局http域名
	// URLW: 'wss://testcw.igrsservice.com:8804', //全局wesocket域名
	// URLWS: 'wss://testcw.igrsservice.com:8805', //全局wesocket域名
	// URLS: 'http://192.168.31.84:9500', //全局wesocket域名（徐臻本地服务器）
	// URLW: 'ws://192.168.31.84:8804', //全局wesocket域名（徐臻本地服务器）
	// URLWS: 'ws://192.168.31.84:8805', //全局wesocket域名（徐臻本地服务器）
	URL: 'https://cloudboard.lenovo.com', //全局http域名
	URLS: 'https://cloudboard.lenovo.com', //全局http域名
	URLW: 'wss://cloudboard.lenovo.com/ll1', //全局wesocket域名
	URLWS: 'wss://cloudboard.lenovo.com/ll2', //全局wesocket域名
	//URLWW: 'ws://192.168.31.221:8804', //全局wesocket域名（文龙本地服务器）wss://cloudboard.lenovo.com/ll1 wss://cloudboard.lenovo.com/ll2
	//URLWWWW: 'ws://10.1.60.31:8804', //全局wesocket域名（徐臻本地服务器）
	ver: '1.0',		//项目发布版本号（通用）
	brushTotalArr: [],	//画布总数据合集
	brushArr: [],	//画布当前需渲染数据合集
	pagesArr: [],	//多页面记录器
	pageIndex: 0,	//当前第几页
	// brushTotalArr: [],	//总数据记录
	// brushArr: [],		//当前数据记录
	// stepArr: [],       	//步骤总记录
	// currentStep: [],   	//当前展示步骤
	// stepInx: 0,        	//当前步骤索引
	// canvasGlobal: [],	//当前页面数据
	touchStartMove: function(dom){
		dom.ontouchstart = function(even) {
			wm.isTouch = true;
			wm.touchY = even.targetTouches[0].clientY;
		}
		dom.ontouchmove = function(even){
			wm.touchYs = wm.touchY - even.targetTouches[0].clientY;
			Math.abs(wm.touchYs) > 50?wm.isTouch = false:wm.isTouch = true;
		}
	},
	//更新图片缩放之后的涂鸦坐标信息 type为类型 1是旋转 2是缩放 3是翻转
	setScale(scale, pivotX, pivotY, brushObj){
		let diffScale = scale / brushObj.mScale - 1;
		brushObj.mScale = scale;
		let diffX = (brushObj.mPivotX - pivotX) * diffScale;
		let diffY = (brushObj.mPivotY - pivotY) * diffScale;
		brushObj.mPivotX += diffX;
		brushObj.mPivotY += diffY;
		brushObj.mLocation.x += diffX;
		brushObj.mLocation.y += diffY;
		wm.resetBounds(brushObj);
	},
	resetBounds(brushObj) {
		let {mSrcRect,mScale,mCreateDoodleScale} = brushObj;
		brushObj.mDstRect = {
			left:0, 
			top: 0, 
			right: (mSrcRect.right - mSrcRect.left) * mScale, 
			bottom: (mSrcRect.bottom - mSrcRect.top) * mScale,
		};
		wm.getBound(brushObj);
	},
	getBound(brushObj){
		if(brushObj.mOriginBound){
			//通过中心点回去最新的原区域（适配偏移）
			brushObj.mOriginBound.left = brushObj.mDstRect.left + brushObj.mLocation.x;
			brushObj.mOriginBound.top = brushObj.mDstRect.top + brushObj.mLocation.y;
			brushObj.mOriginBound.right = brushObj.mDstRect.right + brushObj.mLocation.x;
			brushObj.mOriginBound.bottom = brushObj.mDstRect.bottom + brushObj.mLocation.y;
			let rectF = [
				{x: brushObj.mOriginBound.left,y: brushObj.mOriginBound.top},
				{x: brushObj.mOriginBound.right,y: brushObj.mOriginBound.top},
				{x: brushObj.mOriginBound.right,y: brushObj.mOriginBound.bottom},
				{x: brushObj.mOriginBound.left,y: brushObj.mOriginBound.bottom},
			];
			let {scale, rotate, translate, compose, applyToPoint,applyToPoints} = window.TransformationMatrix;
			//log(brushObj.mPivotX,brushObj.mPivotY);
			let matrix = compose(
				rotate(brushObj.mItemRotate * Math.PI / 180,brushObj.mPivotX,brushObj.mPivotY),
			);
			let minX = 9999999;
			let maxX = -9999999;
			let minY = 9999999;
			let maxY = -9999999;
			let rectMF = applyToPoints(matrix,rectF);
			for(let i =0;i<rectMF.length;i++){
				if(rectMF[i].x < minX){
					minX = rectMF[i].x;
				}
				if(rectMF[i].x > maxX){
					maxX = rectMF[i].x;
				}
				if(rectMF[i].y < minY){
					minY = rectMF[i].y;
				}
				if(rectMF[i].y > maxY){
					maxY = rectMF[i].y;
				}
			}
			brushObj.mBound = {};
			brushObj.mBound.left = minX;
			brushObj.mBound.top = minY;
			brushObj.mBound.right = maxX;
			brushObj.mBound.bottom = maxY;
		}
	},
	//更新旋转之后的涂鸦坐标信息 type为类型 1是旋转 2是缩放 3是翻转
	setScaleFun(scale,pivotX,pivotY,brushObj){
		let diffScale = scale / brushObj.mBaseScale - 1;
		brushObj.mBaseScale = scale;
		let diffX = (brushObj.mPivotX - pivotX) * diffScale;
		let diffY = (brushObj.mPivotY - pivotY) * diffScale;
		brushObj.mPivotX += diffX;
		brushObj.mPivotY += diffY;
		brushObj.mLocation.x += diffX;
		brushObj.mLocation.y += diffY;
		if(brushObj.className == 'DoodleBitmap' || brushObj.className == 'DoodleMindBitmap'){
			brushObj.mScale = scale;
			brushObj.mDstRect.right = brushObj.mSrcRect.right * brushObj.mScale;
			brushObj.mDstRect.bottom = brushObj.mSrcRect.bottom * brushObj.mScale;
			brushObj.mLocation.x = brushObj.mPivotX - brushObj.mDstRect.right/2;
			brushObj.mLocation.y = brushObj.mPivotY - brushObj.mDstRect.bottom/2;
		}
		wm.calculateBound(brushObj);
	},
	setItemRotate(brushObj,rotateObj,type){	
		switch(type){
			case 1:	//旋转（需要rotatePoint旋转算法）
				let pivotArray = wm.rotatePoint(brushObj.mPivotX,brushObj.mPivotY,rotateObj.pivotX,rotateObj.pivotY,rotateObj.rotate);
				let hisPivotX = brushObj.mPivotX;
				let hisPivotY = brushObj.mPivotY;
				brushObj.mItemRotate += rotateObj.rotate;
				brushObj.mPivotX = pivotArray.x;
				brushObj.mPivotY = pivotArray.y;
				//MatrixUtils.rotation(getBound(), diffRotate,mPivotX,mPivotY);
				brushObj.mLocation.x += (brushObj.mPivotX - hisPivotX);
				brushObj.mLocation.y += (brushObj.mPivotY - hisPivotY);
				wm.calculateBound(brushObj);
				break;
			case 2:	//缩放
				wm.setScaleFun(rotateObj.scale * brushObj.mBaseScale,rotateObj.pivotX,rotateObj.pivotY,brushObj);
				break;
			case 4: //接收数据缩放方案
				let diffScaleS = rotateObj.scale / brushObj.mBaseScale - 1;
				brushObj.mBaseScale = rotateObj.scale;
				let diffXS = (brushObj.mPivotX - rotateObj.pivotX) * diffScaleS;
				let diffYS = (brushObj.mPivotY - rotateObj.pivotY) * diffScaleS;
				brushObj.mPivotX += diffXS;
				brushObj.mPivotY += diffYS;
				brushObj.mLocation.x += diffXS;
				brushObj.mLocation.y += diffYS;
				wm.calculateBound(brushObj);
				break;
			case 3:	//翻转
				let tmps;
				if(rotateObj.overturnType == 1){
					brushObj.mOverturnX *= -1;
					tmps = wm.overturnPoint(-1,1,brushObj,rotateObj);
				}else{
					brushObj.mOverturnY *= -1
					tmps = wm.overturnPoint(1,-1,brushObj,rotateObj);
				}
				// ctx.rect(tmps.left,tmps.top,tmps.right - tmps.left,tmps.bottom - tmps.top);
				// ctx.fillStyle = 'red';
				// ctx.fill();

				let offsetX = tmps.left - brushObj.mBound.left;
				let offsetY = tmps.top - brushObj.mBound.top;
				brushObj.mPivotX += offsetX;
				brushObj.mPivotY += offsetY;
				brushObj.mLocation.x += offsetX;
				brushObj.mLocation.y += offsetY;
				wm.calculateBound(brushObj);
				//rotateObj.overturnType = 1?brushObj.mOverturnX = brushObj.mOverturnX * -1:brushObj.mOverturnY = brushObj.mOverturnY * -1;
				break;
			default:
				break;
		}
	},
	//获取元素旋转之后的具体数值
	rotatePoint(pointX,pointY,originPointX,originPointY,angle) {	
		let {scale, rotate, translate, compose, applyToPoint} = window.TransformationMatrix;
		let matrix = compose(
			rotate(angle * Math.PI / 180,originPointX,originPointY),
		);
		return applyToPoint(matrix,{x: pointX,y: pointY});
    },
	// ctx.rect(rectF[0].x,rectF[0].y,rectF[1].x - rectF[0].x,rectF[3].y - rectF[0].y);
	// ctx.fillStyle = 'green';
	// ctx.fill();
	//获取元素翻转之后的具体数值
	overturnPoint(turnX,turnY,brushObj,rotateObj) {	
		let {scale, rotate, translate, compose, applyToPoint,applyToPoints} = window.TransformationMatrix;
		let rectF = [
			{x: brushObj.mBound.left,y: brushObj.mBound.top},
			{x: brushObj.mBound.right,y: brushObj.mBound.top},
			{x: brushObj.mBound.right,y: brushObj.mBound.bottom},
			{x: brushObj.mBound.left,y: brushObj.mBound.bottom},
		];
		// let rectF = [
		// 	{x: rotateObj.pivotX - (brushObj.mBound.right - brushObj.mBound.left) / 2,y: rotateObj.pivotY - (brushObj.mBound.bottom - brushObj.mBound.top) / 2},
		// 	{x: rotateObj.pivotX + (brushObj.mBound.right - brushObj.mBound.left) / 2,y: rotateObj.pivotY - (brushObj.mBound.bottom - brushObj.mBound.top) / 2},
		// 	{x: rotateObj.pivotX + (brushObj.mBound.right - brushObj.mBound.left) / 2,y: rotateObj.pivotY + (brushObj.mBound.bottom - brushObj.mBound.top) / 2},
		// 	{x: rotateObj.pivotX - (brushObj.mBound.right - brushObj.mBound.left) / 2,y: rotateObj.pivotY + (brushObj.mBound.bottom - brushObj.mBound.top) / 2},
		// ];
		let matrix = compose(
			scale(turnX,turnY,rotateObj.pivotX,rotateObj.pivotY),
		);
		let minX = 9999999;
		let maxX = -9999999;
		let minY = 9999999;
		let maxY = -9999999;
		let rectMF = applyToPoints(matrix,rectF);
		let rectMFS = {};
		for(let i =0;i<rectMF.length;i++){
            if(rectMF[i].x < minX){
				minX = rectMF[i].x;
			}
			if(rectMF[i].x > maxX){
				maxX = rectMF[i].x;
			}
			if(rectMF[i].y < minY){
				minY = rectMF[i].y;
			}
			if(rectMF[i].y > maxY){
				maxY = rectMF[i].y;
			}
		}
		rectMFS.left = minX;
		rectMFS.top = minY;
		rectMFS.right = maxX;
		rectMFS.bottom = maxY;
		return rectMFS;
    },
	calculateBound(brushObj) {
		if(brushObj.className == 'DoodleBitmap' || brushObj.className == 'DoodleMindBitmap'){
			wm.getBound(brushObj);
			return false;
		} 
		if(brushObj.mOriginBound){
			//通过中心点回去最新的原区域（适配偏移）
			let rectF = [
				{x: brushObj.mPivotX - (brushObj.mOriginBound.right - brushObj.mOriginBound.left) / 2,y: brushObj.mPivotY - (brushObj.mOriginBound.bottom - brushObj.mOriginBound.top) / 2},
				{x: brushObj.mPivotX + (brushObj.mOriginBound.right - brushObj.mOriginBound.left) / 2,y: brushObj.mPivotY - (brushObj.mOriginBound.bottom - brushObj.mOriginBound.top) / 2},
				{x: brushObj.mPivotX + (brushObj.mOriginBound.right - brushObj.mOriginBound.left) / 2,y: brushObj.mPivotY + (brushObj.mOriginBound.bottom - brushObj.mOriginBound.top) / 2},
				{x: brushObj.mPivotX - (brushObj.mOriginBound.right - brushObj.mOriginBound.left) / 2,y: brushObj.mPivotY + (brushObj.mOriginBound.bottom - brushObj.mOriginBound.top) / 2},
			];
			let {scale, rotate, translate, compose, applyToPoint,applyToPoints} = window.TransformationMatrix;
			//log(brushObj.mPivotX,brushObj.mPivotY);
			let matrix = compose(
				scale(brushObj.mBaseScale,brushObj.mBaseScale,brushObj.mPivotX,brushObj.mPivotY),
				rotate(brushObj.mItemRotate * Math.PI / 180,brushObj.mPivotX,brushObj.mPivotY),
			);
			let minX = 9999999;
			let maxX = -9999999;
			let minY = 9999999;
			let maxY = -9999999;
			let rectMF = applyToPoints(matrix,rectF);
			for(let i =0;i<rectMF.length;i++){
				if(rectMF[i].x < minX){
					minX = rectMF[i].x;
				}
				if(rectMF[i].x > maxX){
					maxX = rectMF[i].x;
				}
				if(rectMF[i].y < minY){
					minY = rectMF[i].y;
				}
				if(rectMF[i].y > maxY){
					maxY = rectMF[i].y;
				}
			}
			brushObj.mBound = {};
			brushObj.mBound.left = minX;
			brushObj.mBound.top = minY;
			brushObj.mBound.right = maxX;
			brushObj.mBound.bottom = maxY;
		}
	},
	isPhone() {
		var userAgentInfo = navigator.userAgent;
		var Agents = ["Android",'Model','model', "iPhone","SymbianOS", "Windows Phone","iPad", "iPod"];
		var flagPc = false;
		for (var v = 0; v < Agents.length; v++) {
			if (userAgentInfo.indexOf(Agents[v]) > 0) {
				flagPc = true;
				break;
			}
		}
		return flagPc;
    },
}
// log(Math.cos(360 * Math.PI / 180))
// log(Math.sin(360 * Math.PI / 180))
// log(wm.rotatePoint(50,50,100,100,45));

//项目专属复用插件区域 (每个独立项目都需重新定制，此为云分享专用)
// var Exclusive = {
	//提示型弹窗
	// thatData: {},	//初始化全局数据源
	// controllerOff: true,	//工具栏展开收起变量
	// closePopupArr: ['brushShow','infoShow','devShow'], //注册关闭弹窗事件
	// selectBrush: function(e,obj){	//选择画笔颜色
	// 	for(let i of thatData.brushColorArr){
	// 		if(i.select){
	// 			i.select = false;
	// 		}
	// 	}
	// 	obj.select = true;
	// 	thatData.brushColorArr = thatData.brushColorArr;
	// },
	// selectThickness: function(e,obj){	//选择画笔粗细
	// 	for(let i of thatData.brushThicknessArr){
	// 		if(i.select){
	// 			i.select = false;
	// 		}
	// 	}
	// 	obj.select = true;
	// 	thatData.brushThicknessArr = thatData.brushThicknessArr;
	// },
	// btnCenterClose: function(){	//重置所有Center位置的按钮状态
	// 	for(let i of thatData.btnCenter){
	// 		if(i.select){
	// 			i.select = false;
	// 		}
	// 	}
	// },
	// width: window.innerWidth,
	// height: window.innerHeight,
	// URLS: 'https://testcw.igrsservice.com', //全局http域名
	// URLW: 'ws://testcw.igrsservice.com:8804', //全局wesocket域名
	// URLWW: 'ws://192.168.31.221:8804', //全局wesocket域名
	// ver: '1.0',		//项目发布版本号（通用）
	// isTouch: true,	//是否触发点击事件
	// touchY: 0,		//点击事件触发计算值
	// touchYs: 0,		//点击事件触发实际值（大于制定数字或小于制定数字则禁止触发点击事件）
	// brushTotalArr: [],	//画布总数据合集 
	// brushArr: [],	//画布当前需渲染数据合集
	// touchStartMove: function(dom){
	// 	dom.ontouchstart = function(even) {
	// 		wm.isTouch = true;
	// 		wm.touchY = even.targetTouches[0].clientY;
	// 	}
	// 	dom.ontouchmove = function(even){
	// 		wm.touchYs = wm.touchY - even.targetTouches[0].clientY;
	// 		Math.abs(wm.touchYs) > 50?wm.isTouch = false:wm.isTouch = true;
	// 	}
	// },
// 	successTips: function(text,type,bottom,width){
// 		var body = n('body')[0],
// 			alertTip = create('div');
// 		if(this.tiMore){
// 			c('success_tip')[0]?c('success_tip')[0].parentNode.removeChild(c('success_tip')[0]):false;
// 			clearTimeout(this.tiMore);
// 		}
// 		var color = ['#FFFFFF','#fa5251','#000000'];
// 		var images = ['src/Selected.png','src/warning.png','src/warning.png'];
// 		alertTip.setCss({
// 			width: width?width+'px':'276px',
// 			maxWidth: 'auto',
// 			height: '84px',
// 			backgroundColor: '#353638',
// 			position: 'absolute',
// 			bottom: bottom?bottom+'px':'224px',
// 			left: '0',
// 			right: '0',
// 			borderRadius: '8px',
// 			margin: '0 auto',
// 			zIndex: '9999999',
// 		})
// 		alertTip.className = 'success_tip';
// 		var div3 = create('div');
// 		div3.setCss({
// 			flexGrow: '1',
// 			fontSize: '28px',
// 			lineHeight: '84px',
// 			whiteSpace: 'nowrap',
// 			textAlign: 'center',
// 			color: type?color[type-1]:color[0],
// 			boxSizing: 'border-box',
// 			marginLeft: type === 0?'2rem':0,
// 		})
// 		div3.innerHTML = text?text:'成功';
// 		alertTip.appendChild(div3);
// 		body.appendChild(alertTip);
// 		this.tiMore = setTimeout(function(){
// 			alertTip.parentNode.removeChild(alertTip);
// 		},1500)
// 	},
// 	//页面滑动开关
// 	Switch: function(){
// 		for(var i of c('switch')){
// 			i.ontouchend = function(){
// 				if(this.className.indexOf('checked') === -1){
// 					this.className = 'switch checked';
// 				}else{
// 					this.className = 'switch';
// 				}
// 			}
// 		}
// 	},
// 	//点击空白部分隐藏浮窗方法
// 	Fixed: function(){
// 		c('wm_fixed')[0].ontouchend = function(even){
// 			Exclusive.isTouch = false;
// 			var that = this;
// 			if(even.target === that){
// 				var thatBody = that.children[that.dataset.index];
// 				if(thatBody.dataset.way === 'left'){
// 					thatBody.style.left = -thatBody.offsetWidth / 10 + 'rem';
// 				}else if(thatBody.dataset.way === 'bottom'){
// 					thatBody.style.bottom = -thatBody.offsetHeight / 10 + 'rem';
// 				}else if(thatBody.dataset.way === 'right'){
// 					thatBody.style.right = -thatBody.offsetWidth / 10 + 'rem';
// 				}else if(thatBody.dataset.way === 'top'){
// 					thatBody.style.top = -thatBody.offsetWidth / 10 + 'rem';
// 				}else {
// 					log('该浮窗无需此类型收起事件');
// 					return false;
// 				}
// 				that.style.backgroundColor = 'rgba(0,0,0,0)';
// 				setTimeout(function(){
// 					Exclusive.isTouch = true;
// 					that.style.display = 'none';
// 				},300)
// 			}
// 		}
// 	},
// 	//浮窗取消事件
// 	FixedClose: function(){
// 		for(var i of c('wm_fixed_close')){
// 			i.ontouchend = function(){
// 				Exclusive.isTouch = false;
// 				var that = this;
// 				var fixedBody = that.parentNode.parentNode;
// 				var fixedFixed = that.parentNode.parentNode.parentNode;
// 				if(fixedBody.dataset.way === 'left'){
// 					fixedBody.style.left = -fixedBody.offsetWidth / 10 + 'rem';
// 				}else if(fixedBody.dataset.way === 'bottom'){
// 					fixedBody.style.bottom = -fixedBody.offsetHeight / 10 + 'rem';
// 				}else if(fixedBody.dataset.way === 'right'){
// 					fixedBody.style.right = -fixedBody.offsetWidth / 10 + 'rem';
// 				}else if(fixedBody.dataset.way === 'top'){
// 					fixedBody.style.top = -fixedBody.offsetWidth / 10 + 'rem';
// 				}else{
// 					fixedBody.style.display = 'none';
// 					fixedFixed.style.backgroundColor = 'rgba(0,0,0,0)';
// 					fixedFixed.style.display = 'none';
// 					return false;
// 				}
// 				fixedFixed.style.backgroundColor = 'rgba(0,0,0,0)';
// 				setTimeout(function(){
// 					Exclusive.isTouch = true;
// 					fixedFixed.style.display = 'none';
// 				},300)
// 			}
// 		}
// 	},
// 	//普通&确认弹窗封装
// 	alert: function(content,callback,type,cancel,btn,btnS,image){
// 		callback?Exclusive.alertCallBack = callback:Exclusive.alertCallBack = function(){};
// 		cancel?Exclusive.alertCancel = cancel:Exclusive.alertCancel = function(){};
// 		var color = '#576B95';
// 		if(btn){color='#FA5151'}else{btn = '确定';};
// 		if(!btnS){btnS = '取消'};
// 		var body = n('body')[0];
// 		var div = create('div');
// 		div.setCss({
// 			position: 'fixed',
// 			width: '100%',
// 			height: '100%',
// 			backgroundColor: 'rgba(0,0,0,.3)',
// 			top: 0,
// 			left: 0,
// 			zIndex: '999999',
// 			display: 'flex',
// 			alignItems: 'center',
// 			justifyContent: 'center',
// 			overflow: 'hidden',
// 		})
// 		var _htm = '<div style="position: absolute; width: 32rem; border-radius: 1.2rem; background-color: #fff; text-align: center;">';
// 		_htm += image? '<img src="'+image+'" style="margin: 3rem auto 0; display: block;" alt="提示图"/><div style="display: inline-block; max-width: 26.6rem; margin: 2rem 0 2rem; color: #000; font-size: 1.7rem;">'+content+'</div><div style="width: 100%; height: 5.6rem; box-sizing: border-box; border-top: .1rem rgba(0,0,0,.1) solid; display: flex; font-size: 1.8rem;">':'<div style="display: inline-block; max-width: 26.6rem; margin: 3.2rem 0 5.6rem; color: #000; font-size: 1.7rem; text-align: left;">'+content+'</div><div style="width: 100%; height: 5.6rem; box-sizing: border-box; border-top: .1rem rgba(0,0,0,.1) solid; display: flex; font-size: 1.8rem;">';
// 		_htm += type?'<div style="flex-grow: 1; line-height: 5.5rem; color: #000; border-right: .1rem rgba(0,0,0,.1) solid; box-sizing: border-box;" ontouchend="Exclusive.alertCancel();this.parentNode.parentNode.parentNode.parentNode.removeChild(this.parentNode.parentNode.parentNode);">'+btnS+'</div><div style="flex-grow: 1; line-height: 5.5rem; color: '+color+';" ontouchend="Exclusive.alertCallBack();this.parentNode.parentNode.parentNode.parentNode.removeChild(this.parentNode.parentNode.parentNode);">'+btn+'</div>':'<div style="flex-grow: 1; line-height: 5.5rem; color: '+color+';" ontouchend="Exclusive.alertCallBack();this.parentNode.parentNode.parentNode.parentNode.removeChild(this.parentNode.parentNode.parentNode);">'+btn+'</div>';
// 		_htm += '</div></div>';
// 		div.innerHTML += _htm;
// 		body.appendChild(div);
// 	},
// 	//普通&确认弹窗点击确定触发事件
// 	alertCallBack: function(){},
// 	//确认弹窗点击取消触发事件
// 	alertCancel: function(){},
// 	//输入性弹窗
// 	prompt: function(content,tips,callback,cancel){
// 		callback?Exclusive.promptCallBack = callback:Exclusive.promptCallBack = function(){};
// 		cancel?Exclusive.promptCancel = cancel:Exclusive.promptCancel = function(){};
// 		var body = n('body')[0];
// 		var div = create('div');
// 		div.setCss({
// 			position: 'fixed',
// 			width: '100%',
// 			height: '100%',
// 			backgroundColor: 'rgba(0,0,0,.3)',
// 			top: 0,
// 			left: 0,
// 			zIndex: '999999',
// 			display: 'flex',
// 			alignItems: 'center',
// 			justifyContent: 'center',
// 			overflow: 'hidden',
// 		})
// 		var _htm = '<div style="position: absolute; width: 32rem; border-radius: 1.2rem; background-color: #fff; text-align: center;">\
// 						<div style="display: inline-block; max-width: 17rem; margin: 3.2rem 0 1rem; color: #000000; font-size: 1.6rem; text-align: left;">'+content+'</div>\
// 						<p style="font-size: 1.4rem; color: #747880;">'+tips+'</p>\
// 						<div style="width: 100%; height:6.4rem; box-sizing: border-box; display: flex; font-size: 1.8rem; margin-top: 1.8rem;">';
// 							_htm += '<div style="flex-grow: 1; text-align: center; position: relative;"><button style="width: 12.2rem; color: #2197FF; height: 4rem; border-radius: .6rem; border: 0; background-color: #FFFFFF;" ontouchstart="this.style.backgroundColor = \'#F3F3F3\';" ontouchend="Exclusive.promptCallBack(event);event.preventDefault();this.parentNode.parentNode.parentNode.parentNode.parentNode.removeChild(this.parentNode.parentNode.parentNode.parentNode);">暂不取消</button><b style="display: block; position: absolute; width: .1rem; height: 2.4rem; background-color: #E8E8E8; right: 0; top: .8rem;"></b></div><div style="flex-grow: 1; text-align: center;"><button style="width: 12.2rem; height: 4rem; color: #FF2A21; border-radius: .6rem; border: 0; background-color: #FFFFFF;" ontouchstart="this.style.backgroundColor = \'#F3F3F3\';" ontouchend="Exclusive.promptCancel(event);event.preventDefault();this.parentNode.parentNode.parentNode.parentNode.parentNode.removeChild(this.parentNode.parentNode.parentNode.parentNode);">取消会议</button></div>';
// 		_htm += '</div></div>';
// 		div.innerHTML += _htm;
// 		body.appendChild(div);                                                                                                                    
// 	},
// 	prompts: function(content,tips,callback,cancel,input,type,num){
// 		Exclusive.promptCallBack = callback?callback:function(){};
// 		Exclusive.promptCancel = cancel?cancel:function(){};
// 		type = type?type:'text';
// 		num = num?num:'';
// 		var body = n('body')[0];
// 		var div = create('div');
// 		div.setCss({
// 			position: 'fixed',
// 			width: '100%',
// 			height: '100%',
// 			backgroundColor: 'rgba(0,0,0,.3)',
// 			top: 0,
// 			left: 0,
// 			zIndex: '999999',
// 			display: 'flex',
// 			alignItems: 'center',
// 			justifyContent: 'center',
// 			overflow: 'hidden',
// 		})
// 		var _htm = '<div style="position: absolute; width: 32rem; border-radius: 1.2rem; background-color: #fff; text-align: center;">\
// 						<div style="display: inline-block; max-width: 17rem; margin: 3.2rem 0 1.6rem; color: #000; font-size: 1.6rem; text-align: left;">'+content+'</div>\
// 						<input id="exclusive_prompt" style="display: block; width: 27.2rem; height: 5rem; box-sizing: border-box; border: .1rem #E8E8E8 solid; padding: 1.2rem; border-radius: .4rem; margin: 0 auto 3rem; font-size: 1.4rem;" type="'+type+'" maxlength="'+num+'" placeholder="'+(tips?tips:'请输入')+'" autofocus="autofocus">\
// 						<div style="width: 100%; height: 5.6rem; box-sizing: border-box; display: flex; font-size: 1.6rem;">';
// 							_htm += '<div style="flex-grow: 1; position: relative; color: #747880; padding-top: .6rem; box-sizing: border-box;"ontouchend="Exclusive.promptCancel();this.parentNode.parentNode.parentNode.parentNode.removeChild(this.parentNode.parentNode.parentNode);">取消<b style="display: block; position: absolute; width: .1rem; height: 2.4rem; background-color: #E8E8E8; right: 0; top: .8rem;"></b></div><div style="flex-grow: 1; color: #2197FF; padding-top: .6rem; box-sizing: border-box;" ontouchend="Exclusive.promptCallBack();this.parentNode.parentNode.parentNode.parentNode.removeChild(this.parentNode.parentNode.parentNode);">保存</div>';
// 		_htm += '</div></div>';
// 		div.innerHTML += _htm;
// 		body.appendChild(div);
// 		setTimeout(function(){
// 			d('exclusive_prompt').focus();
// 		})
// 		d('exclusive_prompt').oninput = input?input:function(){};
// 	},
// 	// prompts: function(content,tips,callback,cancel,type,num,btn){
// 	// 	callback?Exclusive.promptCallBack = callback:Exclusive.promptCallBack = function(){};
// 	// 	cancel?Exclusive.promptCancel = cancel:Exclusive.promptCancel = function(){};
// 	// 	if(!type){type = 'text'};
// 	// 	if(!num){num = ''};
// 	// 	var body = n('body')[0];
// 	// 	var div = create('div');
// 	// 	div.setCss({
// 	// 		position: 'fixed',
// 	// 		width: '100%',
// 	// 		height: '100%',
// 	// 		backgroundColor: 'rgba(0,0,0,.3)',
// 	// 		top: 0,
// 	// 		left: 0,
// 	// 		zIndex: '999999',
// 	// 		display: 'flex',
// 	// 		alignItems: 'center',
// 	// 		justifyContent: 'center',
// 	// 		overflow: 'hidden',
// 	// 	})
// 	// 	var _htm = '<div style="position: absolute; width: 32rem; border-radius: 1.2rem; background-color: #fff; text-align: center;">\
// 	// 					<div style="display: inline-block; max-width: 17rem; margin: 3.2rem 0 1.6rem; color: #000; font-size: 1.7rem; text-align: left;">'+content+'</div>\
// 	// 					<input id="exclusive_prompt" style="display: block; width: 27.2rem; height: 5rem; box-sizing: border-box; border: .1rem #bebebe solid; padding: 1.2rem; border-radius: .2rem; margin: 0 auto 3rem; font-size: 1.7rem;" type="'+type+'" maxlength="'+num+'" placeholder="'+(tips?tips:'请输入')+'" autofocus="autofocus">\
// 	// 					<div style="width: 100%; height: 5.6rem; box-sizing: border-box; border-top: .1rem rgba(0,0,0,.1) solid; display: flex; font-size: 1.8rem;">';
// 	// 						_htm += btn?'<div style="flex-grow: 1; line-height: 5.5rem; color: #293A62;" ontouchend="Exclusive.promptCallBack();this.parentNode.parentNode.parentNode.parentNode.removeChild(this.parentNode.parentNode.parentNode);">确定</div>':'<div style="flex-grow: 1; line-height: 5.5rem; color: #000; border-right: .1rem rgba(0,0,0,.1) solid; box-sizing: border-box;"ontouchend="Exclusive.promptCancel();this.parentNode.parentNode.parentNode.parentNode.removeChild(this.parentNode.parentNode.parentNode);">取消</div><div style="flex-grow: 1; line-height: 5.5rem; color: #293A62;" ontouchend="Exclusive.promptCallBack();this.parentNode.parentNode.parentNode.parentNode.removeChild(this.parentNode.parentNode.parentNode);">确定</div>';
// 	// 	_htm += '</div></div>';
// 	// 	div.innerHTML += _htm;
// 	// 	body.appendChild(div);
// 	// 	setTimeout(function(){
// 	// 		d('exclusive_prompt').focus();
// 	// 	})
// 	// 	var strLenVal = '';
// 	// 	d('exclusive_prompt').oninput = function(){
// 	// 		if(strLen(this.value)>16){
// 	// 			this.value = strLenVal;
// 	// 		};
// 	// 		strLenVal = this.value;
// 	// 	}
// 	// 	function strLen(str){
// 	// 		var len = 0;
// 	// 		for (var i=0; i<str.length; i++) {
// 	// 			var c = str.charCodeAt(i);
// 	// 			//单字节加1
// 	// 			if ((c >= 0x0001 && c <= 0x007e) || (0xff60<=c && c<=0xff9f)) {
// 	// 				len++;
// 	// 			}
// 	// 			else {
// 	// 				len+=2;
// 	// 			}
// 	// 		}
// 	// 		return len;
// 	// 	}
// 	// },
// 	//输入性弹窗点击确定触发事件
// 	promptCallBack: function(){},
// 	//输入性弹窗点击取消触发事件
// 	promptCancel: function(){},
// }