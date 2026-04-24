//const chromeVersion = /Chrome\/([0-9.]+)/.exec(window.navigator.userAgent)[1].split('.')[0];
const chromeVersion = 90;

if (chromeVersion && parseInt(chromeVersion, 10) >= 88 && !wm.isPhone()) {
  const videoDom = document.createElement('video');
  const hiddenCanvas = document.createElement('canvas');

  videoDom.setAttribute('style', 'display:none');
  videoDom.setAttribute('muted', '');
  videoDom.muted = true;
  videoDom.setAttribute('autoplay', '');
  videoDom.autoplay = true;
  videoDom.setAttribute('playsinline', '');
  hiddenCanvas.setAttribute('style', 'display:none');
  hiddenCanvas.setAttribute('width', '1');
  hiddenCanvas.setAttribute('height', '1');
  hiddenCanvas.getContext('2d').fillRect(0, 0, 1, 1);
  videoDom.srcObject = hiddenCanvas.captureStream();
}

let thatData = objMonitor(wm.thatData);
//导入多语言翻译文案
for(let i in dataObj.main){
    thatData[i] = dataObj.main[i];
}

// const netWorkDownlink = navigator.connection.downlink; // 预估下载速度m/s

// if (navigator.connection && navigator.connection.onchange === null) {
//     navigator.connection.onchange=() => {
//       if (netWorkDownlink !== navigator.connection.downlink || navigator.connection.rtt === 0) {
//          //网络断开
//          log('网络断开');
//       } else if (netWorkDownlink === navigator.connection.downlink || navigator.connection.rtt !== 0) {
//          //连接到网络
//          log('连接到网络');
//       }
//    }
// }

//用户没有加入过房间则返回首页
if(!sessionStorage.userId){
    window.location.href = 'index.html';
}

//会议信息二维码生成
let qrcode = new QRCode("info_item_ewm", {
    //text: "https://testcw.igrsservice.com?roomId=" + sessionStorage.roomId,
    //text: "https://cloudboard.lenovo.com?roomId=" + sessionStorage.roomId,
    text: wm.URL + "?roomId=" + sessionStorage.roomId + (sessionStorage.roomPass=='****'?'&pwd='+sessionStorage.roomPassKey:''),
    width: 100,
    height: 100,
    correctLevel: QRCode.CorrectLevel.L,
});

if(language == 'en'){
    c('sticker_p')[0].style.fontSize = '1.4rem';
}

let isWrite = true; //是否可编辑全局状态设定，默认为可写
let isResize = true; //窗口大小改变时是否刷新，默认变化
let textSelect = false; //插入文本是否默认选中
let canvasPointX = 0;   //画布缩放时设置中心
let canvasPointY = 0;   //画布缩放时设置中心
let insertTextNum = 0;
let insertTextTop = 0;

function start(){
    thatData.upDate({
        brushShow: false,   //画笔工具显示隐藏
        infoShow: false,    //会议信息显示隐藏
        infoTitle: sessionStorage.roomName,   //会议信息title展示
        infoUrl: wm.URL,
        backColor: '#515355',//画布背景色
        backIndex: 4,   //画布层级位置
        backImage: 'url("src/back/1.png")',//画布背景图
        backImageShow: false,   //背景图是否显示音符
        roomId: sessionStorage.roomId,
        roomPass: sessionStorage.roomPass,
        devShow: false,     //设备列表显示隐藏
        devList: [],        //设备列表
        usingShow: false,   //正在使用云白板顶部文案显示
        usingColor: '#158CFF',
        joinShow: true, //正在加入loading显示
        reconnectShow: false,   //主持人断网重连提示框
        stickerShow: false, //加入、结束会议提示栏
        stickerImage: 'src/success.png',    //提示栏图片
        stickerText: dataObj.main.stickerSuccess,//提示栏文本
        tipsShow: false,    //tips通知提示显示隐藏
        tipsImage: 'src/succ.png',  //tips提示图片显示类型
        dragScreenShow: false,  //拖动模式
        circlSelectShow: false,  //圈选模式
        circScaleRotateShow: false, //圈选缩放旋转显示隐藏
        circRotateShow: true,       //圈选旋转显示隐藏
        circControllerShow: false,  //圈选复制删除修改文本颜色显示隐藏
        circTextColorShow: false,   //圈选后是否展示修改文本颜色选项
        circEditTextShow: true,     //圈选后编辑文本是否展示
        circControllerTempBottomShow: false,    //点击修改文本颜色则展示颜色选择框
        handArr: [],    //指针合集
        maskShow: true,         //跟随主持人视角则显示大屏演示区域
        circTextColorSelectObj: {   //当前选中颜色
            color: '#FF9CB00',
            border: '#CDCDCD',
        },
        circTextColorArr: [ //圈选后文本改变颜色
            {
                color: '#ffffffff',
                border: '#CDCDCD',
                selectImage: 'src/group/selectBrush.png',
                select: true,
                click: wm.selectTextColor,
            },
            {
                color: '#ff9b00ff',
                border: '#FF9B00',
                selectImage: 'src/group/selectedBrush.png',
                select: false,
                click: wm.selectTextColor,
            },
            {
                color: '#935affff',
                border: '#935AFF',
                selectImage: 'src/group/selectedBrush.png',
                select: false,
                click: wm.selectTextColor,
            },
            {
                color: '#ff4e55ff',
                border: '#FF4E55',
                selectImage: 'src/group/selectedBrush.png',
                select: false,
                click: wm.selectTextColor,
            },
            {
                color: '#1088ffff',
                border: '#1088FF',
                selectImage: 'src/group/selectedBrush.png',
                select: false,
                click: wm.selectTextColor,
            },
            {
                color: '#00d45cff',
                border: '#00D45C',
                selectImage: 'src/group/selectedBrush.png',
                select: false,
                click: wm.selectTextColor,
            },
        ],
        controllerLeftShow: true,   //是否跟随主持人，默认跟随
        editUserNameShow: false,    //是否显示修改用户名称窗口
        editUserName20: false,      //超过20个字符则提示
        editUserNameConfirmClick: function(){//修改用户名称确认
            let value = c('editUserNameInput')[0].value;
            // if(value.length > 20){
            //     thatData.editUserNameLength = dataObj.main.editUserNameLength;
            //     thatData.editUserName20 = true;
            if(value.length == 0){
                thatData.editUserName20 = true;
                thatData.editUserNameLength = dataObj.main.editUserNameEmpty;
            }else{
                thatData.editUserName20 = false;
                thatData.editUserNameShow = false;
                sessionStorage.userName = value;
                drawArrObject.header.fromUserName = value;
                drawArrObject.header.command = 'updateRoomInfo';
                drawArrObject.header.opTime = new Date().getTime();
                drawArrObject.header.opId = ULID.ulid();
                drawArrObject.body = {
                    content: value,
                    type: 2,
                }
                for(let i of thatData.devList){
                    if(i.userEditShow){
                        i.userName = value;
                    }
                }
                ajax({
                    url: wm.URLS + '/board-center/boardUserController/modifyUserName',
                    data: {
                        userId: sessionStorage.userId,
                        userName: value,
                    },
                })
                try {
                    ws.send(JSON.stringify(drawArrObject));
                } catch (error) {
                    log(error);
                    ws.send(JSON.stringify(drawArrObject));
                }
                thatData.devList = thatData.devList;
            }
        },
        controllerLeftClick: function(e,obj){
            thatData.upDate({
                controllerLeftShow: true,
                maskShow: true,
                tipsImage: 'src/succ.png',
                tipsText: thatData.returnUsered,
                tipsShow: true,
            })
            setTimeout(function(){thatData.tipsShow = false;},1500);
            wm.pagesArr[wm.pageIndex].canvasGlobal.scale = wm.pagesArr[wm.pageIndex].canvasGlobal.scales;
            wm.pagesArr[wm.pageIndex].canvasGlobal.transX = wm.pagesArr[wm.pageIndex].canvasGlobal.transXs;
            wm.pagesArr[wm.pageIndex].canvasGlobal.transY = wm.pagesArr[wm.pageIndex].canvasGlobal.transYs;
            ctx.clearRect(0,0,wm.pagesArr[wm.pageIndex].canvasGlobal.width,wm.pagesArr[wm.pageIndex].canvasGlobal.height);
            for(let i of wm.pagesArr[wm.pageIndex].brushArr){
                startDraw(ctx,i);
            }
        },
        infoCopy: function(){
            let infoArr = c('info_item_bottom')[0].innerText.split('\n'),meetNum = '',meetLink = '',meetPass = '';
            for(let i = 0; i < infoArr.length; i++){
                if(i%2 == 0){
                    if(i == 0||i == 6){
                        meetNum += infoArr[i];
                    }else if(i == 2|| i == 8){
                        meetLink += infoArr[i];
                    }else if(i == 4|| i == 10){
                        meetPass += infoArr[i];
                    }
                }
            }
            let textarea = create('textarea');
            textarea.value += thatData.infoTitle + '\n';
            textarea.value += meetNum + '\n';
            textarea.value += meetLink + '?roomId=' + sessionStorage.roomId + (sessionStorage.roomPass=='****'?'&pwd='+sessionStorage.roomPassKey:'') + '\n';
            textarea.value += meetPass;
            n('body')[0].appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            n('body')[0].removeChild(textarea);
            thatData.tipsShow = true;
            thatData.tipsText = thatData.copySuccess;
            setTimeout(function(){thatData.tipsShow = false;},1500);   
        },
        textArray: [],
        //imageArray: [],
        brushColorArr: [{   //画笔颜色选择器
            color: '#FFFFFFFF',
            image: 'src/group/selectBrush.png',
            select: true,
            click: wm.selectBrush,
        },{
            color: '#FF9A01FF',
            image: 'src/group/selectedBrush.png',
            select: false,
            click: wm.selectBrush,
        },{
            color: '#925AFFFF',
            image: 'src/group/selectedBrush.png',
            select: false,
            click: wm.selectBrush,
        },{
            color: '#FF4E55FF',
            image: 'src/group/selectedBrush.png',
            select: false,
            click: wm.selectBrush,
        },{
            color: '#1088FFFF',
            image: 'src/group/selectedBrush.png',
            select: false,
            click: wm.selectBrush,
        },{
            color: '#00D45CFF',
            image: 'src/group/selectedBrush.png',
            select: false,
            click: wm.selectBrush,
        }],
        brushThicknessArr: [{   //画笔粗细选择器
            num: 6,
            thickness: '.6rem',
            select: true,
            click: wm.selectThickness,
        },{
            num: 10,
            thickness: '1rem',
            select: false,
            click: wm.selectThickness,
        }],
        // btnLeft: [
        //     {//视角跟随
        //         image: 'src/controller/view.png',
        //         selectImage: 'src/controller/views.png',
        //         disabledImage: '',
        //         select: false,
        //         disabled: false,
        //         click: function(e,obj){
        //             obj.select = !obj.select;
        //             thatData.btnLeft = thatData.btnLeft;
        //             thatData.openPopup();
        //         },
        //     }
        // ],
        insertText: function(textObj){  //插入文本
            let textArrayObj = {};
            let offlineLeft = window.innerWidth/3 - 70 + insertTextTop*150 + insertTextNum*30;
            let offlineTop = window.innerHeight/3 - 20 + insertTextNum*30;
            insertTextNum ++;
            if(wm.scaleTransform(offlineTop - wm.pagesArr[wm.pageIndex].canvasGlobal.repairTop) > 1800){
                insertTextNum = 0;
                insertTextTop ++;
            }
            textArrayObj.index = thatData.textArray.length;
            textArrayObj.text = textObj?textObj.mText:'';
            textArrayObj.lableText = textObj?textObj.mText:'';
            textArrayObj.textInfo = textObj?textObj.mText.replace(/\n/g, "<br>"):thatData.insertTextTips;
            textArrayObj.left = textObj?wm.backScaleTransform(textObj.mLocation.x) + wm.pagesArr[wm.pageIndex].canvasGlobal.repairLeft + 'px':offlineLeft + 'px';
            //log(wm.scaleTransform(offlineLeft - wm.pagesArr[wm.pageIndex].canvasGlobal.repairLeft),wm.scaleTransform(offlineTop - wm.pagesArr[wm.pageIndex].canvasGlobal.repairTop));
            textArrayObj.top = textObj?wm.backScaleTransform(textObj.mLocation.y) + wm.pagesArr[wm.pageIndex].canvasGlobal.repairTop + 'px':offlineTop + 'px';
            textArrayObj.color = textObj?parseHex(textObj.mColor.mColor):'#FFFFFFFF';
            textArrayObj.show = true;
            textArrayObj.location = true;
            textArrayObj.size = '20px';
            textArrayObj.blur = function(e,obj){
                textSelect = true;
                isResize = true;
                obj.show = false;
                if(this.value){
                    drawArrObject.header.command = 'opDoodle';
                    drawArrObject.header.opTime = new Date().getTime();
                    drawArrObject.header.opId = ULID.ulid();
                    drawArrObject.body = {
                        ids: [],
                        type: 1,
                        x: wm.scaleTransform(parseFloat(obj.left) - wm.pagesArr[wm.pageIndex].canvasGlobal.repairLeft) - wm.pagesArr[wm.pageIndex].canvasGlobal.transX / wm.pagesArr[wm.pageIndex].canvasGlobal.scale,
                        y: wm.scaleTransform(parseFloat(obj.top) - wm.pagesArr[wm.pageIndex].canvasGlobal.repairTop) - wm.pagesArr[wm.pageIndex].canvasGlobal.transY / wm.pagesArr[wm.pageIndex].canvasGlobal.scale,
                    };
                    if(textObj){
                        textObj.mText = this.value;
                        let lines = textObj.mText.split("\n");
                        let max = 0;
                        ctx.font = textObj.mTextSize + 'px OzCaramel';//OzCaramel
                        for (var i = 0; i < lines.length; i++) {
                            if(ctx.measureText(lines[i]).width > max){
                                max = ctx.measureText(lines[i]).width;
                            }
                        }
                        textObj.mMaxWidth = max;
                        textObj.mOriginBound.right = textObj.mOriginBound.left + max;
                        textObj.globalId = ULID.ulid();
                        textObj.selected = 0;
                        drawArrObject.body.data = [];
                        drawArrObject.body.data.push(textObj);
                        whiteSum.resetLocationBounds(drawArrObject.body.data[0],2);
                        wm.calculateBound(textObj);
                    }else{
                        drawArrObjectDataBound = {
                            top: wm.scaleTransform(parseFloat(obj.top) - wm.pagesArr[wm.pageIndex].canvasGlobal.repairTop) - wm.pagesArr[wm.pageIndex].canvasGlobal.transY / wm.pagesArr[wm.pageIndex].canvasGlobal.scale,
                            left: wm.scaleTransform(parseFloat(obj.left) - wm.pagesArr[wm.pageIndex].canvasGlobal.repairLeft) - wm.pagesArr[wm.pageIndex].canvasGlobal.transX / wm.pagesArr[wm.pageIndex].canvasGlobal.scale,
                            right: wm.scaleTransform((parseFloat(obj.left) + this.parentNode.clientWidth - wm.pagesArr[wm.pageIndex].canvasGlobal.repairLeft)) - wm.pagesArr[wm.pageIndex].canvasGlobal.transX / wm.pagesArr[wm.pageIndex].canvasGlobal.scale,
                            bottom: wm.scaleTransform((parseFloat(obj.top) + this.parentNode.clientHeight - wm.pagesArr[wm.pageIndex].canvasGlobal.repairTop)) - wm.pagesArr[wm.pageIndex].canvasGlobal.transY / wm.pagesArr[wm.pageIndex].canvasGlobal.scale,
                        };

                        // let lines = this.value.split("\n");
                        // let max = 0;
                        // ctx.font = wm.scaleTransform(parseFloat(textArrayObj.size)) + 'px OzCaramel';//OzCaramel
                        // for (var i = 0; i < lines.length; i++) {
                        //     if(ctx.measureText(lines[i]).width > max){
                        //         max = ctx.measureText(lines[i]).width;
                        //     }
                        // }
                        drawArrObjectDataBound.right = drawArrObjectDataBound.left + wm.scaleTransform(this.clientWidth);
                        drawArrObject.body.data = [
                            {
                                className: 'DoodleText',
                                mBound: {},
                                mOriginBound: {
                                    top: drawArrObjectDataBound.top,
                                    left: drawArrObjectDataBound.left,
                                    right: drawArrObjectDataBound.right,
                                    bottom: drawArrObjectDataBound.bottom,
                                },
                                mOriginLocation: {},
                                mRect: {},
                                id: -1,
                                globalId: ULID.ulid(),
                                mBaseScale: 1,
                                mColor: {   //颜色对象，仅需修改mColor即可，其他不动
                                    type: 'DoodleColor',
                                    mColor: intHex(obj.color), //该次涂鸦数值
                                    mColorType: 'COLOR',
                                    mLevel: 1,
                                    mOriginalColor: 0,
                                    mTileX: "MIRROR",
                                    mTileY: "MIRROR",
                                },
                                mItemRotate: 0,
                                mLocation: {},
                                mOverturnX: 1,
                                mOverturnY: 1,
                                mPen: 'TEXT',
                                mPivotX: 0,
                                mPivotY: 0,
                                mShape: "HAND_WRITE",
                                mSize: 0,
                                type: 0,
                                mMaxWidth: wm.scaleTransform(this.clientWidth),
                                mText: this.value,
                                mTextSize: wm.scaleTransform(parseFloat(textArrayObj.size)),
                            },
                        ];
                        whiteSum.resetLocationBounds(drawArrObject.body.data[0],2);
                    }
                    startDraw(ctx,drawArrObject.body.data[0]);
                    //wm.pagesArr[wm.pageIndex].currentStep.push(drawArrObject.body.data[0].globalId);
                    addSend(drawArrObject);
                    //selectObject.bool = true;
                    //selectArr.push(drawArrObject.body.data[0]);
                    //circReset(selectArr);
                }
                thatData.textArray = thatData.textArray;
            }
            textArrayObj.input = function(e,obj){
                this.prev().innerHTML = this.value == ''?thatData.insertTextTips:this.value.replace(/\n/g, "<br>");
                // d('h1').innerHTML = obj.top;
                // d('h1').innerHTML += obj.left;
                // this.onchange = function(){
                    
                // }
            }
            thatData.textArray.push(textArrayObj);
            thatData.textArray = thatData.textArray;
            //渲染输入框时默认给予选中效果与拖动效果
            isResize = false;
            c('insertText')[c('insertText').length - 1].focus();
            c('insertText')[c('insertText').length - 1].addDrag(false,false,function(e,ex,ey,mx,my,x,y){
                for(let j of thatData.textArray){
                    if(j.index == JSON.parse(this.getAttribute('wm-forlist')).index){
                        if(Math.abs(ex - x) > 5||Math.abs(ey - y) > 5){
                            j.left = parseInt(j.left) + ex - x + 'px';
                            j.top = parseInt(j.top) + ey - y + 'px';
                        }
                    }
                }
            });
        },
        btnCenter: [
            {//移动画布
                image: 'src/controller/move.png',
                selectImage: 'src/controller/moves.png',
                disabledImage: '',
                select: false,
                disabled: false,
                click: function(e,obj){
                    wm.btnCenterClose();
                    obj.select = true;
                    thatData.dragScreenShow = obj.select;
                    thatData.circlSelectShow = false;
                    thatData.btnCenter = thatData.btnCenter;
                    clearCircl();
                    thatData.openPopup();
                },
            },
            {//选择工具
                image: 'src/controller/select.png',
                selectImage: 'src/controller/selects.png',
                disabledImage: 'src/controller/selectd.png',
                select: false,
                disabled: false,
                click: function(e,obj){
                    if(!isWrite){return false;};
                    wm.btnCenterClose();
                    obj.select = true;
                    thatData.dragScreenShow = false;
                    thatData.circlSelectShow = obj.select;
                    thatData.btnCenter = thatData.btnCenter;
                    ctxc.clearRect(0,0,wm.pagesArr[wm.pageIndex].canvasGlobal.width,wm.pagesArr[wm.pageIndex].canvasGlobal.height);
                    thatData.openPopup();
                },
            },{//画笔
                image: 'src/controller/brush.png',
                selectImage: 'src/controller/brushs.png',
                disabledImage: 'src/controller/brushd.png',
                select: true,
                disabled: false,
                click: function(e,obj){
                    if(!isWrite){return false;};
                    brushType = 1;
                    wm.btnCenterClose();
                    obj.select = !obj.select;
                    thatData.upDate({
                        dragScreenShow: false,
                        circlSelectShow: false,
                        btnCenter: thatData.btnCenter,
                    })
                    clearCircl();
                    thatData.openPopup('brushShow');
                },
            },{//橡皮擦
                image: 'src/controller/eraser.png',
                selectImage: 'src/controller/erasers.png',
                disabledImage: 'src/controller/eraserd.png',
                select: false,
                disabled: false,
                click: function(e,obj){
                    if(!isWrite){return false;};
                    brushType = 2;
                    wm.btnCenterClose();
                    obj.select = !obj.select;
                    thatData.upDate({
                        dragScreenShow: false,
                        circlSelectShow: false,
                        circScaleRotateShow: false,
                        circControllerShow: false,
                        btnCenter: thatData.btnCenter,
                    })
                    clearCircl();
                    thatData.openPopup();
                },
            },/*{//撤销
                image: 'src/controller/revoke.png',
                selectImage: 'src/controller/revokes.png',
                disabledImage: 'src/controller/revoked.png',
                select: false,
                disabled: false,
                click: function(){
                    if(!isWrite){return false;};
                    prevStep();
                },
            },{//返回
                image: 'src/controller/return.png',
                selectImage: 'src/controller/returns.png',
                disabledImage: 'src/controller/returnd.png',
                select: false,
                disabled: false,
                click: function(){
                    if(!isWrite){return false;};
                    nextStep();
                },
            },*/{//插入文本
                image: 'src/controller/text.png',
                selectImage: 'src/controller/texts.png',
                disabledImage: 'src/controller/textd.png',
                select: false,
                disabled: false,
                click: function(){
                    if(!isWrite){return false;};
                    if(!imageMax(1,0)){
                        return false;
                    };
                    thatData.insertText();
                    //thatData.dragScreenShow = false;
                    //thatData.circlSelectShow = false;
                    //clearCircl();
                    
                    // for(let i of c('insertText')){
                    //     i.addDrag(false,false,function(e,x,y,mx,my,ex,ey){
                    //         for(let j of thatData.textArray){
                    //             if(j.index == JSON.parse(this.getAttribute('wm-forlist')).index){
                    //                 j.left = parseInt(j.left) + x - ex + 'px';
                    //                 j.top = parseInt(j.top) + y - ey + 'px';
                    //             }
                    //         }
                    //     })
                    // }
                },
            },{//插入图片
                image: 'src/controller/image.png',
                selectImage: '',
                disabledImage: 'src/controller/imaged.png',
                select: false,
                disabled: false,
                click: function(){
                    if(!isWrite){return false;};
                    if(!imageMax(1,21)){
                        return false;
                    };
                    // thatData.dragScreenShow = false;
                    // thatData.circlSelectShow = false;
                    // clearCircl();
                    d('insetImage').click();
                    d('insetImage').onchange = function(){
                        let reader = new FileReader(),u8Arr,globalId = ULID.ulid();
                        reader.readAsDataURL(this.files[0]);
                        reader.onload = function(data){
                            d('insetImage').value = '';
                            let insetImage = new Image();
                            insetImage.src = data.currentTarget.result;
                            insetImage.onload = function(){
                                if(this.width > 2000 || this.height > 2000){    //大于2000px的图片将被强制压缩到2000px
                                    let thisWidth = this.width / 2000;
                                    let thisHeight = this.height / 2000;
                                    let thisScale = thisWidth > thisHeight?thisWidth:thisHeight;
                                    thisWidth = this.width / thisScale;
                                    thisHeight = this.height / thisScale;
                                    let canvasImageCompress = create('canvas'),
                                    canvasImageCompressContext = canvasImageCompress.getContext('2d');
                                    canvasImageCompress.width = thisWidth;
                                    canvasImageCompress.height = thisHeight;
                                    canvasImageCompressContext.drawImage(insetImage,0,0,thisWidth,thisHeight);
                                    insetImageSend(canvasImageCompress.toDataURL('image/jpeg'));
                                }else{
                                    insetImageSend(data.currentTarget.result);
                                }
                            };
                            function insetImageSend(dataSrc){
                                let utf8 = atob(dataSrc.split(',')[1]);
                                u8Arr = '';
                                u8Arr = new Int8Array(utf8.length + 48 + globalId.length);
                                let i = 0;
                                for(i;i<16; i++){   //发送端的用户ID
                                    u8Arr[i] = 0;
                                }
                                for(i;i<32; i++){   //接收端的用户ID
                                    u8Arr[i] = 0;
                                }
                                for(i;i<36; i++){   //类型
                                    u8Arr[i] = i==35?1:0;
                                }
                                for(i;i<40; i++){   // 保留字段
                                    u8Arr[i] = 0;
                                }
                                for(i;i<48; i++){   //全局ID长度表示
                                    u8Arr[i] = i == 47?globalId.length:0;
                                }
                                for(i;i<(48 + globalId.length); i++){   //对应的全局ID流
                                    u8Arr[i] = globalId.charCodeAt(i - 48);
                                }
                                for(let j = 0; j < utf8.length; j++){   //图片流
                                    u8Arr[j+i] = utf8.charCodeAt(j);
                                }
                                let utf8Blob = URL.createObjectURL(new Blob([u8Arr.slice(i)], { type: 'image/jpeg' }));
                                let images = new Image();
                                images.src = utf8Blob;
                                images.onload = function(){
                                    let that = this,obj = {};
                                    let thatWidth = that.width * wm.pagesArr[wm.pageIndex].canvasGlobal.mobileScale,
                                        thatHeight = that.height * wm.pagesArr[wm.pageIndex].canvasGlobal.mobileScale;
                                    that.style.width = thatWidth + 'px';
                                    obj.top = window.innerHeight/3 - 20 + wm.pagesArr[wm.pageIndex].canvasGlobal.imageOffset;
                                    obj.left = window.innerWidth/3 - 70 + wm.pagesArr[wm.pageIndex].canvasGlobal.imageOffset;
                                    wm.pagesArr[wm.pageIndex].canvasGlobal.imageOffset += 50;
                                    drawArrObject.header.command = 'opDoodle';
                                    drawArrObject.header.opTime = new Date().getTime();
                                    drawArrObject.header.opId = ULID.ulid();
                                    drawArrObject.body = {
                                        ids: [],
                                        type: 1,
                                        x: wm.scaleTransform(parseFloat(obj.left) - wm.pagesArr[wm.pageIndex].canvasGlobal.repairLeft),
                                        y: wm.scaleTransform(parseFloat(obj.top) - wm.pagesArr[wm.pageIndex].canvasGlobal.repairTop),
                                    };
                                    drawArrObject.body.data = [
                                        {
                                            className: 'DoodleBitmap',
                                            mOriginBound: {
                                                top: wm.scaleTransform(parseFloat(obj.top) - wm.pagesArr[wm.pageIndex].canvasGlobal.repairTop) - wm.pagesArr[wm.pageIndex].canvasGlobal.transY / wm.pagesArr[wm.pageIndex].canvasGlobal.scale,
                                                left: wm.scaleTransform(parseFloat(obj.left) - wm.pagesArr[wm.pageIndex].canvasGlobal.repairLeft) - wm.pagesArr[wm.pageIndex].canvasGlobal.transX / wm.pagesArr[wm.pageIndex].canvasGlobal.scale,
                                                right: wm.scaleTransform(parseFloat(obj.left) + thatWidth - wm.pagesArr[wm.pageIndex].canvasGlobal.repairLeft) - wm.pagesArr[wm.pageIndex].canvasGlobal.transX / wm.pagesArr[wm.pageIndex].canvasGlobal.scale,
                                                bottom: wm.scaleTransform(parseFloat(obj.top) + thatHeight - wm.pagesArr[wm.pageIndex].canvasGlobal.repairTop) - wm.pagesArr[wm.pageIndex].canvasGlobal.transY / wm.pagesArr[wm.pageIndex].canvasGlobal.scale,
                                            },
                                            mBound: {
                                                top: wm.scaleTransform(parseFloat(obj.top) - wm.pagesArr[wm.pageIndex].canvasGlobal.repairTop) - wm.pagesArr[wm.pageIndex].canvasGlobal.transY / wm.pagesArr[wm.pageIndex].canvasGlobal.scale,
                                                left: wm.scaleTransform(parseFloat(obj.left) - wm.pagesArr[wm.pageIndex].canvasGlobal.repairLeft) - wm.pagesArr[wm.pageIndex].canvasGlobal.transX / wm.pagesArr[wm.pageIndex].canvasGlobal.scale,
                                                right: wm.scaleTransform(parseFloat(obj.left) + thatWidth - wm.pagesArr[wm.pageIndex].canvasGlobal.repairLeft) - wm.pagesArr[wm.pageIndex].canvasGlobal.transX / wm.pagesArr[wm.pageIndex].canvasGlobal.scale,
                                                bottom: wm.scaleTransform(parseFloat(obj.top) + thatHeight - wm.pagesArr[wm.pageIndex].canvasGlobal.repairTop) - wm.pagesArr[wm.pageIndex].canvasGlobal.transY / wm.pagesArr[wm.pageIndex].canvasGlobal.scale,
                                            },
                                            mDstRect: { //实际渲染尺寸
                                                top: 0,
                                                left: 0,
                                                right: wm.scaleTransform(thatWidth),
                                                bottom: wm.scaleTransform(thatHeight),
                                            },
                                            mSrcRect: { //原始尺寸
                                                top: 0,
                                                left: 0,
                                                right: that.width,
                                                bottom: that.height,
                                            },
                                            mOriginLocation: {},
                                            mRect: {},
                                            id: -1,
                                            globalId: globalId,
                                            mBaseScale: 1,
                                            mScale: 1,
                                            mItemRotate: 0,
                                            mLocation: {
                                                x: wm.scaleTransform(parseFloat(obj.left) - wm.pagesArr[wm.pageIndex].canvasGlobal.repairLeft) - wm.pagesArr[wm.pageIndex].canvasGlobal.transX / wm.pagesArr[wm.pageIndex].canvasGlobal.scale,
                                                y: wm.scaleTransform(parseFloat(obj.top) - wm.pagesArr[wm.pageIndex].canvasGlobal.repairTop) - wm.pagesArr[wm.pageIndex].canvasGlobal.transY / wm.pagesArr[wm.pageIndex].canvasGlobal.scale,
                                                // x: wm.scaleTransform(parseFloat(obj.left) - wm.pagesArr[wm.pageIndex].canvasGlobal.repairLeft) - wm.pagesArr[wm.pageIndex].canvasGlobal.transY / wm.pagesArr[wm.pageIndex].canvasGlobal.scale,
                                                // y: wm.scaleTransform(parseFloat(obj.top) - wm.pagesArr[wm.pageIndex].canvasGlobal.repairTop) - wm.pagesArr[wm.pageIndex].canvasGlobal.transY / wm.pagesArr[wm.pageIndex].canvasGlobal.scale,
                                            },
                                            mOverturnX: 1,
                                            mOverturnY: 1,
                                            mPen: 'BITMAP',
                                            mPivotX: wm.scaleTransform(parseFloat(obj.left) + thatWidth/2 - wm.pagesArr[wm.pageIndex].canvasGlobal.repairLeft) - wm.pagesArr[wm.pageIndex].canvasGlobal.transX / wm.pagesArr[wm.pageIndex].canvasGlobal.scale,
                                            mPivotY: wm.scaleTransform(parseFloat(obj.top) + thatHeight/2 - wm.pagesArr[wm.pageIndex].canvasGlobal.repairTop) - wm.pagesArr[wm.pageIndex].canvasGlobal.transY / wm.pagesArr[wm.pageIndex].canvasGlobal.scale,
                                            mShape: "HAND_WRITE",
                                            mSize: 0,
                                            type: 21,
                                        },
                                    ];
                                    //wm.pagesArr[wm.pageIndex].currentStep.push(drawArrObject.body.data[0].globalId);
                                    addSend(drawArrObject);
                                    drawArrObject.body.data[0].srcUrl = that;
                                    startDraw(ctx,drawArrObject.body.data[0]);
                                    try {
                                        ws.send(u8Arr);
                                    } catch (error) {
                                        log(error);
                                        ws.send(u8Arr);
                                    }
                                }
                            }
                        }
                        // let src = window.URL.createObjectURL(this.files[0]);
                        // let imageArrayObj = {};
                        // imageArrayObj.src = src;
                        // imageArrayObj.left = window.innerWidth/3 - 70 + thatData.textArray.length*10 + 'px';
                        // imageArrayObj.top = window.innerHeight/3 - 20 + thatData.textArray.length*10 + 'px';
                        // imageArrayObj.show = true;
                        // imageArrayObj.load = function(e,obj){
                            
                            // function transferBytes(){
                            //     byte []data = new byte[16];
                            //     long msb = mostSigBits;
                            //     long lsb = leastSigBits;
                            //    for (int i=0;i<8;i++){
                            //        data[i] = (byte) ((msb >> 8*(7-i)) & 0xff);
                            //    }
                            //     for (int i=8;i<16;i++){
                            //         int j = i-8;
                            //         data[i] = (byte) ((lsb >> 8*(7-j)) & 0xff);
                            //     }
                            //    return data;
                            // }
                        //}
                        //     let countWidth = wm.canvasGlobal.width * .6;
                        //     let countHeight = wm.canvasGlobal.height * .6;
                        //     if(image.clientWidth / countWidth > image.clientHeight / countHeight){
                        //         if(image.clientWidth > countWidth){
                        //             image.style.width = countWidth/10 + 'rem';
                        //         }
                        //     }else{
                        //         if(image.clientHeight > countHeight){
                        //             image.style.height = countHeight/10 + 'rem';
                        //         }
                        //     }
                        //     image.style.top = 'calc(50% - ' + (image.clientHeight / 2 + 'px)');
                        //     image.style.left = 'calc(50% - ' + (image.clientWidth / 2 + 'px)');
                        //thatData.imageArray.push(imageArrayObj);
                        //thatData.imageArray = thatData.imageArray;
                    }
                },
            }
        ],
        btnRight: [
            // {//语音
            //     image: 'src/controller/voice.png',
            //     selectImage: '',
            //     disabledImage: '',
            //     select: false,
            //     disabled: false,
            //     click: function(){
            //         log(10);
            //     },
            // },
            {//用户列表
                image: 'src/controller/user.png',
                selectImage: '',
                disabledImage: '',
                select: false,
                disabled: false,
                click: function(){
                    //用户加入房间获取用户列表接口
                    if(!thatData.devShow){
                        getUserList();
                    }
                    thatData.openPopup('devShow');
                },
            },{//信息
                image: 'src/controller/info.png',
                selectImage: '',
                disabledImage: '',
                select: false,
                disabled: false,
                click: function(){
                    thatData.openPopup('infoShow');
                },
            },{//收起工具条
                image: 'src/controller/stow.png',
                selectImage: 'src/controller/stows.png',
                disabledImage: '',
                select: false,
                disabled: false,
                click: function(e,obj){
                    if(wm.controllerOff){
                        obj.select = true;
                        c('controller')[0].style.width = '4.7rem';
                        c('controller')[0].style.overflow = 'hidden';
                        c('controller_temp')[2].style.transitionDelay = '.3s';
                        c('controller_temp')[2].style.left = -4.3*(thatData.btnCenter.length + thatData.btnRight.length-1) - 1.8 +'rem';
                        this.style.transform = 'rotate(180deg)';
                    }else{
                        obj.select = false;
                        c('controller')[0].style.width = 'calc(100% - 1.6rem)';
                        c('controller')[0].style.overflow = 'visible';
                        c('controller_temp')[2].style.transitionDelay = '0s';
                        c('controller_temp')[2].style.left = '0';
                        this.style.transform = 'rotate(0deg)';
                    }
                    wm.controllerOff = !wm.controllerOff;
                    thatData.btnRight = thatData.btnRight;
                    thatData.openPopup();
                },
            },
        ],
    });
}
start();

function getUserList(){ //获取加入房间的用户列表
    ajax({
        url: wm.URLS + '/board-center/boardUserController/getUserByRoom',
        data: {
            roomId: sessionStorage.roomId,
        },
        dataType: 'json',
        success: function(data){
            if(data.code == 200){
                thatData.devList = [];
                for(let i of data.data){
                    switch(i.deviceType){   //设备类型判断
                        case 0:
                            i.user = 'src/dev/phone.png';
                            break;
                        case 2:
                            i.user = 'src/dev/pc.png';
                            break;
                        case 3:
                            i.user = 'src/dev/screen.png';
                            break;
                        default:
                            break;
                    }
                    i.color = '#333333';
                    //判断用户是否为自己
                    if(i.userId == sessionStorage.userId){
                        i.userEditShow = true;
                        i.userTextShow = true;
                        i.userText = thatData.devListMe;
                        i.color = '#378FD8';
                        log(i.enWrite);
                        if(i.enWrite == 0){
                            isWrite = false;
                            for(let i of thatData.btnCenter){
                                if(i.image != 'src/controller/move.png'){
                                    i.select = false;
                                    i.disabled = true;
                                }
                            }
                            thatData.btnCenter = thatData.btnCenter;
                        }
                        thatData.devList.splice(1,0,i);
                        continue;
                    }else{
                        i.userEditShow = false;
                    }
                    if(i.isLandlord == 1){  //如果是主持人则显示为主持人
                        i.userText = thatData.devListHost;
                        i.user = 'src/dev/user.png';
                        i.userTextShow = true;
                        thatData.devList.unshift(i);
                        continue;
                    }
                    thatData.devList.push(i);
                }
                thatData.devList = thatData.devList;
            }
       }
    })
}

//上限判断
function imageMax(type,dataType){
    let imageNum = 0;
    if(type == 1){
        imageNum++;
    }
    for(let i of wm.pagesArr[wm.pageIndex].brushArr){
        if(i.type == dataType){
            imageNum++;
        }
    }
    for(let i of selectArr){
        if(i.type == dataType){
            if(type == 2){
                imageNum+=2;
            }else{
                imageNum++;
            }
        }
    }
    let tipsText,tipsMax;
    if(dataType == 21){
        tipsMax = 10;
        tipsText = thatData.imageLimit;
    }else if(dataType == 0){
        tipsMax = 50;
        tipsText = thatData.textLimit;
    }else if(dataType == 15){
        tipsMax = 4000;
        tipsText = thatData.brushLimit;
    }else if(dataType == 14){
        tipsMax = 4;
        tipsText = thatData.mindLimit;
    }else if(dataType == 18){
        tipsMax = 100;
        tipsText = thatData.planeLimit;
    }else if(dataType == 17){
        tipsMax = 40;
        tipsText = thatData.solidLimit;
    }
    if(imageNum > tipsMax){
        log(imageNum,tipsText);
        tipsShowHide(tipsText,'src/waring.png');
        return false;
    }else{
        return true;
    }
}

function addSend(data,bool){
    wm.pagesArr[wm.pageIndex].brushTotalArr.push(data.body.data[0]);
    bool?false:wm.pagesArr[wm.pageIndex].brushArr.push(data.body.data[0]);
    wm.pagesArr[wm.pageIndex].currentStep.push(data.body.data[0].globalId);
    addStep();
    try {
        ws.send(JSON.stringify(data));
    } catch (error) {
        log(error);
        ws.send(JSON.stringify(data));
    }
}

//移动画布
c('dragScreen')[0].Add('touchstart mousedown',function(e){
    let x = e.touches?e.touches[0].clientX:e.clientX,
    y = e.touches?e.touches[0].clientY:e.clientY,
    transX = wm.pagesArr[wm.pageIndex].canvasGlobal.transX,
    transY = wm.pagesArr[wm.pageIndex].canvasGlobal.transY;
    thatData.maskShow = false;
    document.Add('touchmove mousemove',dragMove);
    document.Add('touchend mouseup',dragEnd);
    function dragMove(even){
        if(thatData.controllerLeftShow){
            thatData.controllerLeftShow = false;
        }
        let mx = even.touches?even.touches[0].clientX:even.clientX,
        my = even.touches?even.touches[0].clientY:even.clientY;
        wm.pagesArr[wm.pageIndex].canvasGlobal.transX = transX + mx - x;
        wm.pagesArr[wm.pageIndex].canvasGlobal.transY = transY + my - y;
        ctx.clearRect(0,0,wm.pagesArr[wm.pageIndex].canvasGlobal.width,wm.pagesArr[wm.pageIndex].canvasGlobal.height);
        for(let i of wm.pagesArr[wm.pageIndex].brushArr){
            startDraw(ctx,i);
        }
    }
    function dragEnd(){
        document.Remove('touchmove mousemove',dragMove);
        document.Remove('touchend mouseup',dragEnd);
    }
})

//圈选算法
let selectObject = {    //圈选区域对象
    x: 0,   //圈选区域的X属性
    y: 0,   //圈选区域的Y属性
    pivotX: 0,  //圈选区域的X轴重心
    pivotY: 0,  //圈选区域的Y轴重心
    bool: false,    //判断用户是移动还是圈选指令
    ids: [],    //圈选Id集合
    offset: 100,   //复制时偏移位置，每次圈选复原，每次复制累加
};

let opcacheArr = new Map();    //最近操作数据缓存
//清除圈选内容
function clearCircl(){
    thatData.circScaleRotateShow = false;
    thatData.circControllerShow = false;
    
    if(selectArr.length != 0){
        drawArrObject.header.command = 'updateData';
        drawArrObject.header.opTime = new Date().getTime();
        drawArrObject.header.opId = ULID.ulid();
        drawArrObject.body = {};
        drawArrObject.body.data = JSON.parse(JSON.stringify(selectArr instanceof Array?selectArr:[]));
        for(let i of drawArrObject.body.data){
            if(i.className == "DoodlePath"){
                i.mPath.savePoints = [];
                i.mPath.widths = [];
                i.mPath.mMasters = [];
                if(i.mOriginPath){
                    i.mOriginPath.savePoints = [];
                    i.mOriginPath.widths = [];
                    i.mOriginPath.mMasters = [];
                }
            }
            // if(i.className == 'DoodleBitmap' || i.className == 'DoodleMindBitmap'){
            //     i.mBaseScale = 1;
            // }
        }
        try {
            ws.send(JSON.stringify(drawArrObject));
        } catch (error) {
            ws.send(JSON.stringify(drawArrObject));
        }
        for(let i of selectArr){
            i.updateTime = drawArrObject.header.opTime;
            opcacheArr.set(i.globalId,i);
        }
        if(opcacheArr.size > 300){
            let keysToDelete = Array.from(opcacheArr.keys()).slice(0, opcacheArr.size - 300);
            keysToDelete.forEach(key => opcacheArr.delete(key));
        }
    }

    //开始圈选
    for(let i of selectArr){
        i.selected = 0;
    }
    ctx.clearRect(0,0,wm.pagesArr[wm.pageIndex].canvasGlobal.width,wm.pagesArr[wm.pageIndex].canvasGlobal.height);
    for(let i of wm.pagesArr[wm.pageIndex].brushArr){
        startDraw(ctx,i);
    }
    selectArr = [];
    selectObject.bool = false;
}

//圈选工具
c('circlSelect')[0].addDrag(function(e,x,y){
    if(!isWrite){return false;};
    drawArrObject.header.command = 'opDoodle';
    drawArrObject.header.opTime = new Date().getTime();
    drawArrObject.header.opId = ULID.ulid();
    x = wm.scaleTransform(x - wm.pagesArr[wm.pageIndex].canvasGlobal.repairLeft) - wm.pagesArr[wm.pageIndex].canvasGlobal.transX / wm.pagesArr[wm.pageIndex].canvasGlobal.scale;
    y = wm.scaleTransform(y - wm.pagesArr[wm.pageIndex].canvasGlobal.repairTop) - wm.pagesArr[wm.pageIndex].canvasGlobal.transY / wm.pagesArr[wm.pageIndex].canvasGlobal.scale;
    if(selectObject.bool&&selectObject.left - wm.scaleTransform(24) < x&&selectObject.right + wm.scaleTransform(24) > x&&selectObject.top - wm.scaleTransform(24) < y&&selectObject.bottom + wm.scaleTransform(24) > y){
        circStart(x,y);
        drawArrObject.body = {
            ids: selectObject.ids,
            type: 3,
            x: selectObject.right,
            y:  selectObject.bottom,
        };
        drawArrObject.body.data = {
            toX: selectObject.left,
            toY: selectObject.top,
            moveState: 0, //moveState 0 开始移动
        };
        try {
            ws.send(JSON.stringify(drawArrObject));
        } catch (error) {
            log(error);
            ws.send(JSON.stringify(drawArrObject));
        }
    }else{
        //开始圈选
        clearCircl();
    }
},function(e,mx,my,x,y){
    x = wm.scaleTransform(x - wm.pagesArr[wm.pageIndex].canvasGlobal.repairLeft) - wm.pagesArr[wm.pageIndex].canvasGlobal.transX / wm.pagesArr[wm.pageIndex].canvasGlobal.scale;
    y = wm.scaleTransform(y - wm.pagesArr[wm.pageIndex].canvasGlobal.repairTop) - wm.pagesArr[wm.pageIndex].canvasGlobal.transY / wm.pagesArr[wm.pageIndex].canvasGlobal.scale;
    mx = wm.scaleTransform(mx - wm.pagesArr[wm.pageIndex].canvasGlobal.repairLeft) - wm.pagesArr[wm.pageIndex].canvasGlobal.transX / wm.pagesArr[wm.pageIndex].canvasGlobal.scale;
    my = wm.scaleTransform(my - wm.pagesArr[wm.pageIndex].canvasGlobal.repairTop) - wm.pagesArr[wm.pageIndex].canvasGlobal.transY / wm.pagesArr[wm.pageIndex].canvasGlobal.scale;
    if(selectObject.bool){  //移动选中的内容
        circMove(mx,my);
        drawArrObject.header.opId = "";
        drawArrObject.body.x = selectObject.right;
        drawArrObject.body.y = selectObject.bottom;
        drawArrObject.body.data = {
            toX: selectObject.left,
            toY: selectObject.top,
            moveState: 1, //moveState 0 开始移
        };
        //circController();
        try {
            ws.send(JSON.stringify(drawArrObject));
        } catch (error) {
            log(error);
            ws.send(JSON.stringify(drawArrObject));
        }
    }else{  //圈选逻辑
        ctxc.clearRect(0,0,wm.pagesArr[wm.pageIndex].canvasGlobal.width,wm.pagesArr[wm.pageIndex].canvasGlobal.height);
        ctxc.beginPath();
        contextRect(ctxc,x,y,mx,my);
    }
},function(e,ex,ey,mx,my,x,y){
    // if(textSelect){
    //     textSelect = false;
    //     return false;
    // }
    if(!selectObject.bool){//判断用户该次操作为圈选还是移动
        thatData.circScaleRotateShow = false;
        thatData.circControllerShow = false;
        thatData.circControllerTempBottomShow = false;
        x = wm.scaleTransform(x - wm.pagesArr[wm.pageIndex].canvasGlobal.repairLeft) - wm.pagesArr[wm.pageIndex].canvasGlobal.transX / wm.pagesArr[wm.pageIndex].canvasGlobal.scale;
        y = wm.scaleTransform(y - wm.pagesArr[wm.pageIndex].canvasGlobal.repairTop) - wm.pagesArr[wm.pageIndex].canvasGlobal.transY / wm.pagesArr[wm.pageIndex].canvasGlobal.scale;
        mx = wm.scaleTransform(mx - wm.pagesArr[wm.pageIndex].canvasGlobal.repairLeft) - wm.pagesArr[wm.pageIndex].canvasGlobal.transX / wm.pagesArr[wm.pageIndex].canvasGlobal.scale;
        my = wm.scaleTransform(my - wm.pagesArr[wm.pageIndex].canvasGlobal.repairTop) - wm.pagesArr[wm.pageIndex].canvasGlobal.transY / wm.pagesArr[wm.pageIndex].canvasGlobal.scale;
        mx=mx?mx:x;
        my=my?my:y;
        if(mx < x){let sx = mx;mx = x;x = sx;};
        if(my < y){let sy = my;my = y;y = sy;};
        selectArr = [];
        selectObject.ids = [];
        ctxc.clearRect(0,0,wm.pagesArr[wm.pageIndex].canvasGlobal.width,wm.pagesArr[wm.pageIndex].canvasGlobal.height);
        for(let i = wm.pagesArr[wm.pageIndex].brushArr.length - 1; i >= 0; i--){
            if(x < wm.pagesArr[wm.pageIndex].brushArr[i].mBound.right&&mx > wm.pagesArr[wm.pageIndex].brushArr[i].mBound.left&&y < wm.pagesArr[wm.pageIndex].brushArr[i].mBound.bottom&&my > wm.pagesArr[wm.pageIndex].brushArr[i].mBound.top){
                selectArr.unshift(wm.pagesArr[wm.pageIndex].brushArr[i]);
                selectObject.ids.push(wm.pagesArr[wm.pageIndex].brushArr[i].globalId);
                wm.pagesArr[wm.pageIndex].brushArr[i].selected = 1;
                //wm.pagesArr[wm.pageIndex].brushArr.splice(i,1);
                selectObject.bool = true;
            }
        }
        if(selectObject.bool){
            if(selectArr.length !== 0){ //圈选为画笔或文本时展示更换颜色按钮
                thatData.circTextColorShow = true;
                for(let i of selectArr){
                    if(i.className !== 'DoodlePath'&&i.className !== 'DoodleText'){
                        thatData.circTextColorShow = false;
                    }
                }
            }
            if(selectArr.length == 1){    //圈选单个文本时展示编辑按钮
                thatData.circEditTextShow = true;
                if(selectArr[0].className !== 'DoodleText'){
                    thatData.circEditTextShow = false;
                }
            }else{
                thatData.circEditTextShow = false;
            }
            circReset(selectArr,false,1);
            ctx.clearRect(0,0,wm.pagesArr[wm.pageIndex].canvasGlobal.width,wm.pagesArr[wm.pageIndex].canvasGlobal.height);
            for(let i of wm.pagesArr[wm.pageIndex].brushArr){
                startDraw(ctx,i);
            }
        }
    }else{
        drawArrObject.header.opId = ULID.ulid();
        drawArrObject.body.data = {
            toX: selectObject.left,
            toY: selectObject.top,
            moveState: 2, //moveState 0 开始移
        };
        try {
            ws.send(JSON.stringify(drawArrObject));
        } catch (error) {
            log(error);
            ws.send(JSON.stringify(drawArrObject));
        }
    }
},true);

function circStart(x,y,selectedCtx){
    selectObject.x = x;
    selectObject.y = y;
    circReset(selectArr,selectedCtx,2);
}

function circMove(mx,my,selectedCtx){
    let offsetX = (mx - selectObject.x),
        offsetY = (my - selectObject.y);
    for(let i of selectArr){
        i.mLocation.x += offsetX;
        i.mLocation.y += offsetY;
        i.mPivotX += offsetX;
        i.mPivotY += offsetY;
        if(!isNaN(i.pivotX)&&!isNaN(i.pivotY)){
            i.pivotX += offsetX;
            i.pivotY += offsetY;
        }
        if(!isNaN(i.locationX)&&!isNaN(i.locationY)){
            i.locationX += offsetX;
            i.locationY += offsetY;
        }
        if(i.xy){
            i.xy.x += offsetX;
            i.xy.y += offsetY;
        }
        if(i.mOriginBound){
            i.mOriginBound.left += offsetX;
            i.mOriginBound.right += offsetX;
            i.mOriginBound.top += offsetY;
            i.mOriginBound.bottom += offsetY;
            wm.calculateBound(i);
        }
    }
    circReset(selectArr,selectedCtx,3);
    selectObject.x = mx;
    selectObject.y = my;
}

//初始化圈选工具
function circReset(selectArrObj,selectedCtx,num){
    let minX = 9999999,maxX = -9999999,minY = 9999999,maxY = -9999999;
    if(selectArrObj.length != 0){
        for(let i of selectArrObj){
            if(i.mBound.left < minX){
                minX = i.mBound.left;
            }
            if(i.mBound.right > maxX){
                maxX = i.mBound.right;
            }
            if(i.mBound.top < minY){
                minY = i.mBound.top;
            }
            if(i.mBound.bottom > maxY){
                maxY = i.mBound.bottom;
            }
        }
        selectObject.left = minX;
        selectObject.right = maxX;
        selectObject.top = minY;
        selectObject.bottom = maxY;
        selectObject.width = selectObject.right - selectObject.left;
        selectObject.height = selectObject.bottom - selectObject.top;
        selectObject.initWidth = selectObject.width;
        selectObject.initHeight = selectObject.height;
        //selectObject.scale = num == 2?selectObject.scale:1;
        selectObject.scale = selectObject.scale;
        selectObject.pivotX = selectObject.left + selectObject.width / 2;
        selectObject.pivotY = selectObject.top + selectObject.height / 2;
        if(selectedCtx){
            selectedCtx.clearRect(0,0,wm.pagesArr[wm.pageIndex].canvasGlobal.width,wm.pagesArr[wm.pageIndex].canvasGlobal.height);
            selectedCtx.beginPath();
        }else{
            ctxc.clearRect(0,0,wm.pagesArr[wm.pageIndex].canvasGlobal.width,wm.pagesArr[wm.pageIndex].canvasGlobal.height);
            ctxc.beginPath();
        }
        //log(ctxc,selectObject.left - wm.scaleTransform(24),selectObject.top - wm.scaleTransform(24),selectObject.right + wm.scaleTransform(24),selectObject.bottom + wm.scaleTransform(24));
        contextRect(selectedCtx?selectedCtx:ctxc,selectObject.left - wm.scaleTransform(24),selectObject.top - wm.scaleTransform(24),selectObject.right + wm.scaleTransform(24),selectObject.bottom + wm.scaleTransform(24));
        for(let i of selectArr){
            startDraw(selectedCtx?selectedCtx:ctxc,i,1);
        }
        thatData.circScaleRotateShow = true;
        thatData.circControllerShow = true;
        circController();
    }
}

//圈选后缩放
let iScale = {};
c('circScale')[0].addDrag(function(e){
    isDrawScale = true;
    iScale.initScale = 1;
    if(e.touches){
        if(e.touches.length >= 2){
            isDrawScale = false;
            return false;
        }
    }
    if(!isWrite){return false;};
},function(e,mx,my,x,y){
    if(isDrawScale){
        mx = (mx - x) / 4;
        my = (my - y) / 4;
        let diffScale = Math.abs(mx) > Math.abs(my)?mx:my;
        diffScale = (selectObject.width + diffScale) / selectObject.width;
        let max = -999999,min = 999999;
        for(let i of selectArr){
            max = i.mBaseScale > max?i.mBaseScale:max;
            min = i.mBaseScale < min?i.mBaseScale:min;
        }
        if(diffScale * (diffScale>1?max:min) > 4){
            diffScale = 4/(diffScale>1?max:min);
        }
        if(diffScale * (diffScale>1?max:min) < 0.25){
            diffScale = 0.25/(diffScale>1?max:min);
        }
        iScale.pivotX = selectObject.left + selectObject.width / 2;
        iScale.pivotY = selectObject.top + selectObject.height / 2;
        iScale.initScale *= diffScale;
        for(let i of selectArr){
            iScale.scale = diffScale;
            //iScale.scale = i.mBaseScale * diffScale;
            wm.setItemRotate(i,iScale,2);
        }
        circReset(selectArr,false,4);
    }
},function(){
    if(isDrawScale){
        drawArrObject.header.command = 'opDoodle';
        drawArrObject.header.opTime = new Date().getTime();
        drawArrObject.header.opId = ULID.ulid();
        drawArrObject.body = {
            ids: selectObject.ids,
            type: 6,
            x: 0,
            y: 0,
        };
        drawArrObject.body.data = {
            pivotX: iScale.pivotX,
            pivotY: iScale.pivotY,
            scale: iScale.initScale,
        };
        try {
            ws.send(JSON.stringify(drawArrObject));
        } catch (error) {
            log(error);
            ws.send(JSON.stringify(drawArrObject));
        }
    }
});

//圈选后旋转
let iRotate,iRotateTotal;
c('circRotate')[0].addDrag(function(){
    if(!isWrite){return false;};
    iRotate = {};
    iRotate.pivotX = selectObject.left + selectObject.width / 2;
    iRotate.pivotY = selectObject.top + selectObject.height / 2;
    iRotate.mx = 0;
    iRotate.my = 0;
    iRotate.rotate = 0;
    iRotateTotal = 0;
},function(e,mx,my,x,y){
    let tx = mx,ty = my;
    mx = mx - x - iRotate.mx;
    my = my - y - iRotate.my;
    let diffRotate = Math.abs(mx) > Math.abs(my)?mx:my;
    // 计算旋转角度
    // let deltaX = tx - x;
    // let deltaY = ty - y;
    // log(deltaY, deltaX);
    // let diffRotate = Math.atan2(deltaY, deltaX);     
    // log(diffRotate);
    iRotate.mx = tx - x;
    iRotate.my = ty - y;
    iRotateTotal +=  diffRotate;
    iRotate.rotate = diffRotate;  
    //contextRect(ctxc,selectObject.left - wm.scaleTransform(24),selectObject.top - wm.scaleTransform(24),selectObject.right + wm.scaleTransform(24),selectObject.bottom + wm.scaleTransform(24));
    //ctxc.clearRect(0,0,wm.canvasGlobal.width,wm.canvasGlobal.height);
    //ctxc.beginPath();
    for(let i of selectArr){
        if(i.type !== 14){
            wm.setItemRotate(i,iRotate,1);
        }
        //startDraw(ctxc,i);
    }
    circReset(selectArr,false,5);
},function(){
    drawArrObject.header.command = 'opDoodle';
    drawArrObject.header.opTime = new Date().getTime();
    drawArrObject.header.opId = ULID.ulid();
    drawArrObject.body = {
        ids: selectObject.ids,
        type: 5,
        x: 0,
        y: 0,
    };
    drawArrObject.body.data = {
        pivotX: iRotate.pivotX,
        pivotY: iRotate.pivotY,
        rotate: iRotateTotal,
        //(Math.abs(iRotate.mx) > Math.abs(iRotate.my)?iRotate.mx:iRotate.my) % 360
    };
    try {
        ws.send(JSON.stringify(drawArrObject));
    } catch (error) {
        log(error);
        ws.send(JSON.stringify(drawArrObject));
    }
});
function circController(){
    let iType = true;
    for(let i of selectArr){
        if(i.type == 14){
            iType = false;
        }
    }

    if(selectArr.length == 1){  //只选中一个内容的时候默认选中该文案的颜色
        if(selectArr[0].className == 'DoodlePath'||selectArr[0].className == 'DoodleText'){
            for(let i of thatData.circTextColorArr){
                if(i.color == parseHex(selectArr[0].mColor.mColor)){
                    i.select = true;
                    thatData.circTextColorSelectObj.color = i.color;
                    thatData.circTextColorSelectObj.border = i.border;
                }else{
                    i.select = false;
                }
            }
            thatData.circTextColorArr = thatData.circTextColorArr;
            thatData.circTextColorSelectObj = thatData.circTextColorSelectObj;
        }
    }
    thatData.circRotateShow = iType;
    c('circScaleRotate')[0].style.top = wm.backScaleTransform(selectObject.bottom) + wm.backScaleTransform(wm.pagesArr[wm.pageIndex].canvasGlobal.transY / wm.pagesArr[wm.pageIndex].canvasGlobal.scale) + wm.pagesArr[wm.pageIndex].canvasGlobal.repairTop + 10 + 'px';
    c('circScaleRotate')[0].style.left = wm.backScaleTransform(selectObject.right) + wm.backScaleTransform(wm.pagesArr[wm.pageIndex].canvasGlobal.transX / wm.pagesArr[wm.pageIndex].canvasGlobal.scale) + wm.pagesArr[wm.pageIndex].canvasGlobal.repairLeft + 10 + 'px';
    c('circController')[0].style.top = wm.backScaleTransform(selectObject.bottom) + 44 + wm.backScaleTransform(wm.pagesArr[wm.pageIndex].canvasGlobal.transY / wm.pagesArr[wm.pageIndex].canvasGlobal.scale) + wm.pagesArr[wm.pageIndex].canvasGlobal.repairTop + 'px';
    c('circController')[0].style.left = wm.backScaleTransform(selectObject.right - selectObject.width/2) - c('circController')[0].clientWidth/2 + wm.backScaleTransform(wm.pagesArr[wm.pageIndex].canvasGlobal.transX / wm.pagesArr[wm.pageIndex].canvasGlobal.scale) + wm.pagesArr[wm.pageIndex].canvasGlobal.repairLeft + 'px';
}

//圈选后编辑文本
c('circEditText')[0].Click(function(){
    if(!isWrite){return false;};
    thatData.insertText(selectArr[0]);
    circDelete();
})

//圈选后复制
c('circCopy')[0].Click(function(){
    if(!isWrite){return false;};
    if(!imageMax(2,21)||!imageMax(2,0)||!imageMax(2,15)||!imageMax(2,14)||!imageMax(2,18)||!imageMax(2,17)){
        return false;
    };
    drawArrObject.header.command = 'opDoodle';
    drawArrObject.header.opTime = new Date().getTime();
    drawArrObject.header.opId = ULID.ulid();
    drawArrObject.body = {
        ids: [],
        type: 10,
        x: 0,
        y: 0,
    };
    drawArrObject.body.data = {};
    drawArrObject.body.data.ids = [];
    selectObject.ids = [];
    for(let i = 0; i < selectArr.length; i++){
        let selectArrObj = JSON.parse(JSON.stringify(selectArr[i]));
        selectArrObj.id = -1;
        selectArrObj.selected = 1;
        selectArrObj.globalId = ULID.ulid();
        drawArrObject.body.ids.push(selectArr[i].globalId);
        drawArrObject.body.data.ids.push(selectArrObj.globalId);
        selectObject.ids.push(selectArrObj.globalId);
        selectArrObj.mLocation.x += selectObject.offset;
        selectArrObj.mLocation.y += selectObject.offset;
        selectArrObj.mPivotX += selectObject.offset;
        selectArrObj.mPivotY += selectObject.offset;
        if(!isNaN(selectArrObj.pivotX)&&!isNaN(selectArrObj.pivotY)){
            selectArrObj.pivotX += selectObject.offset;
            selectArrObj.pivotY += selectObject.offset;
        }
        if(!isNaN(selectArrObj.locationX)&&!isNaN(selectArrObj.locationY)){
            selectArrObj.locationX += selectObject.offset;
            selectArrObj.locationY += selectObject.offset;
        }
        if(selectArrObj.xy){
            selectArrObj.xy.x += selectObject.offset;
            selectArrObj.xy.y += selectObject.offset;
        }
        if(selectArrObj.mOriginBound){
            selectArrObj.mOriginBound.left += selectObject.offset;
            selectArrObj.mOriginBound.right += selectObject.offset;
            selectArrObj.mOriginBound.top += selectObject.offset;
            selectArrObj.mOriginBound.bottom += selectObject.offset;
            wm.calculateBound(selectArrObj);
        }
        if(selectArr[i].srcUrl){
            selectArrObj.srcUrl = selectArr[i].srcUrl;
        }
        wm.pagesArr[wm.pageIndex].brushArr.push(selectArrObj);
        wm.pagesArr[wm.pageIndex].brushTotalArr.push(selectArrObj);
        selectArr[i].selected = 0;
        selectArr[i] = selectArrObj;
        wm.pagesArr[wm.pageIndex].currentStep.push(selectArrObj.globalId);
    }
    circReset(selectArr,false,6);
    addStep();
    ctx.clearRect(0,0,wm.pagesArr[wm.pageIndex].canvasGlobal.width,wm.pagesArr[wm.pageIndex].canvasGlobal.height);
    for(let i of wm.pagesArr[wm.pageIndex].brushArr){
        startDraw(ctx,i);
    }
    try {
        ws.send(JSON.stringify(drawArrObject));
    } catch (error) {
        log(error);
        ws.send(JSON.stringify(drawArrObject));
    }
});
//圈选后删除
c('circDelete')[0].Click(function(){
    circDelete();
});

function circDelete(){
    if(!isWrite){return false;};
    drawArrObject.header.command = 'opDoodle';
    drawArrObject.header.opTime = new Date().getTime();
    drawArrObject.header.opId = ULID.ulid();
    drawArrObject.body = {
        ids: [],
        type: 2,
        x: 0,
        y: 0,
    };
    for(let i of selectArr){
        drawArrObject.body.ids.push(i.globalId);
        for(let j = wm.pagesArr[wm.pageIndex].brushArr.length - 1; j >= 0; j--){
            if(i.globalId == wm.pagesArr[wm.pageIndex].brushArr[j].globalId){
                wm.pagesArr[wm.pageIndex].brushArr.splice(j,1);
                wm.pagesArr[wm.pageIndex].currentStep.splice(i,1);
            }
        }
    }
    // wm.pagesArr[wm.pageIndex].currentStep = [];
    // for(let i of wm.pagesArr[wm.pageIndex].brushArr){
    //     wm.pagesArr[wm.pageIndex].currentStep.push(i.globalId);
    // }
    addStep();
    try {
        ws.send(JSON.stringify(drawArrObject));
    } catch (error) {
        log(error);
        ws.send(JSON.stringify(drawArrObject));
    }
    selectArr = [];
    selectObject.bool = false;
    ctxc.clearRect(0,0,wm.pagesArr[wm.pageIndex].canvasGlobal.width,wm.pagesArr[wm.pageIndex].canvasGlobal.height);
    thatData.circScaleRotateShow = false;
    thatData.circControllerShow = false;
}

//板擦相交计算
function eraserAlgo(obj,data){
    let drawArrObjectObjText = {}; 
    drawArrObjectObjText.header = {
        command: "opDoodle",    //命令类型
        fromDeviceType: wm.isPhone()?0:2,  //设备类型(0手机、1平板、2电脑、3大屏)
        fromUserId: sessionStorage.userId, //用户ID
        fromUserName: sessionStorage.userName,   //用户名称
        isHomeOwners: false,    //是否创建者
        opTime: new Date().getTime(),
        opId: ULID.ulid(),  //操作ID
    }
    drawArrObjectObjText.body = {
        ids: [],
        type: 2,
        x: 0,
        y: 0,
    };
    for(let i of wm.pagesArr[wm.pageIndex].brushArr){
        if(i.className != 'DoodleBitmap' && i.className != 'DoodleMindBitmap'){
            if(i.type == 2 || i.type == 0 || i.type == 15||i.type == 34){
                if(i.mBound){
                    if(obj.left < i.mBound.right && i.mBound.left < obj.right && obj.top < i.mBound.bottom && i.mBound.top < obj.bottom){
                        if(i.className == 'DoodleText'){
                            drawArrObjectObjText.body.ids.push(i.globalId);
                            for(let j = wm.pagesArr[wm.pageIndex].brushArr.length - 1; j >= 0; j--){
                                if(i.globalId == wm.pagesArr[wm.pageIndex].brushArr[j].globalId){
                                    wm.pagesArr[wm.pageIndex].brushArr.splice(j,1);
                                    wm.pagesArr[wm.pageIndex].currentStep.splice(j,1);
                                };
                            }
                            addStep();
                            ctx.clearRect(0,0,wm.pagesArr[wm.pageIndex].canvasGlobal.width,wm.pagesArr[wm.pageIndex].canvasGlobal.height);
                            for(let i of wm.pagesArr[wm.pageIndex].brushArr){
                                startDraw(ctx,i);
                            }
                        }else{
                            data.push(i);
                        }
                    }
                }else{
                    if(obj.left < i.mDstRect.right && i.mDstRect.left < obj.right && obj.top < i.mDstRect.bottom && i.mDstRect.top < obj.bottom){
                        data.push(i);
                    }
                }
            }
        }
    }
    if(drawArrObjectObjText.body.ids.length > 0){
        try {
            ws.send(JSON.stringify(drawArrObjectObjText));
        } catch (error) {
            log(error);
            ws.send(JSON.stringify(drawArrObjectObjText));
        }
    }
}

function contextRect(context,left,top,right,bottom){    //圈选渲染
    context.save();
    context.translate(wm.pagesArr[wm.pageIndex].canvasGlobal.transX,wm.pagesArr[wm.pageIndex].canvasGlobal.transY);
    context.scale(wm.pagesArr[wm.pageIndex].canvasGlobal.scale,wm.pagesArr[wm.pageIndex].canvasGlobal.scale);
    context.translate(wm.scaleTransform(wm.pagesArr[wm.pageIndex].canvasGlobal.repairLeft),wm.scaleTransform(wm.pagesArr[wm.pageIndex].canvasGlobal.repairTop));
    context.strokeStyle = 'red';
    context.rect(left,top,right-left,bottom-top);
    context.stroke();
    context.restore();
}

let whiteSum = {
    resetLocationBounds (data,type){ //计算涂鸦区域算法 type=2(插入文本)
        let {mRect,mOriginBound,mBound,mPath,mLocation,mOriginLocation} = data;
        if(type == 1){  //画笔绘制计算
            let minX = 9999999;
            let maxX = -9999999;
            let minY = 9999999;
            let maxY = -9999999;
            for(let i = 0; i < mPath.savePoints.length;){
                let value = mPath.savePoints[i];
                switch(value){
                    case -1:    //moveType开始绘制 beginPath
                            mPath.savePoints[i + 1]
                            mPath.savePoints[i + 2]
                            if(mPath.savePoints[i + 1] < minX){
                                minX = mPath.savePoints[i + 1];
                            }
                            if(mPath.savePoints[i + 2] < minY){
                                minY = mPath.savePoints[i + 2];
                            }
                            if(mPath.savePoints[i + 1] > maxX){
                                maxX = mPath.savePoints[i + 1];
                            }
                            if(mPath.savePoints[i + 2] > maxY){
                                maxY = mPath.savePoints[i + 2];
                            }
                        i += 3;
                        break;
                    case -2:    //lineType普通绘制 lineTo
                            mPath.savePoints[i + 1]
                            mPath.savePoints[i + 2]
                            if(mPath.savePoints[i + 1] < minX){
                                minX = mPath.savePoints[i + 1];
                            }
                            if(mPath.savePoints[i + 2] < minY){
                                minY = mPath.savePoints[i + 2];
                            }
                            if(mPath.savePoints[i + 1] > maxX){
                                maxX = mPath.savePoints[i + 1];
                            }
                            if(mPath.savePoints[i + 2] > maxY){
                                maxY = mPath.savePoints[i + 2];
                            }
                        i += 3;
                        break;
                    default:
                        break;
                }
            };
            mOriginBound.top = minY;
            mOriginBound.left = minX;
            mOriginBound.right = maxX;
            mOriginBound.bottom = maxY;
            if (mOriginBound.top == mOriginBound.bottom) { //防止某些path没有高度
                mOriginBound.top = mOriginBound.top - 30;
                mOriginBound.bottom = mOriginBound.bottom + 30;
            }
            if (mOriginBound.left == mOriginBound.right) {
                mOriginBound.left -= 30;
                mOriginBound.right += 30;
            }
        }
        
        for(let i in mOriginBound){
            mBound[i] = mOriginBound[i];
            mRect[i] = mOriginBound[i];
        }
        
        data.mPivotX = mRect.left + (mRect.right - mRect.left) / 2;
        data.mPivotY = mRect.top + (mRect.bottom - mRect.top) / 2;
        mLocation.x = mRect.left;
        mLocation.y = mRect.top;
        data.mOriginLocation = {};
        data.mOriginLocation.x = mRect.left;
        data.mOriginLocation.y = mRect.top;
    },
}

//初始化绘制工具
let canvas,canvasActual,canvasDraw,circlSelect,ctx,ctxa,ctxd,ctxc;
function initCanvas(){
    canvas = d('canvas');
    canvasActual = d('canvas_actual');
    canvasDraw = d('canvas_draw');
    circlSelect = c('circlSelect')[0];
    let canvasWidth = wm.pagesArr[wm.pageIndex].canvasGlobal.width * wm.pagesArr[wm.pageIndex].canvasGlobal.mobileScale,
    canvasHeight = wm.pagesArr[wm.pageIndex].canvasGlobal.height * wm.pagesArr[wm.pageIndex].canvasGlobal.mobileScale,
    canvasScale = wm.pagesArr[wm.pageIndex].canvasGlobal.mobileScale;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    canvasActual.width = canvasWidth;
    canvasActual.height = canvasHeight;
    canvasDraw.width = canvasWidth;
    canvasDraw.height = canvasHeight;
    circlSelect.width = canvasWidth;
    circlSelect.height = canvasHeight;
    ctx = canvas.getContext('2d');      //底层最终画布
    ctxa = canvasActual.getContext('2d'); //实时绘制层画布
    ctxd = canvasDraw.getContext('2d'); //绘制层画布
    ctxc = circlSelect.getContext('2d');//圈选层画布
    ctx.scale(canvasScale,canvasScale);
    ctxa.scale(canvasScale,canvasScale);
    ctxd.scale(canvasScale,canvasScale);
    ctxc.scale(canvasScale,canvasScale);
}
let selectArr = []; //创建圈选对象，判断是否点击在选中的内容上
let brushType = 1;  //画笔类型 1：普通画笔 2：板擦功能

let enc,crypt = new JSEncrypt();
crypt.setKey(sessionStorage.publicKey);
enc = crypt.encrypt(sessionStorage.userId);
let ws;// + '?userId=' + sessionStorage.userId
let wws;

function tipsShowHide(text,src){
    thatData.tipsShow = true;
    thatData.tipsText = text;
    thatData.tipsImage = src;
    setTimeout(function(){thatData.tipsShow = false;},1500);   
}

//监听用户手势
let drawArrObject = {},mMasters = []; //drawArrObject传递信息数据集合   mMasters关键点
drawArrObject.header = {    //传递信息header部分用户信息
    command: "",    //命令类型
    fromDeviceType: wm.isPhone()?0:2,  //设备类型(0手机、1平板、2电脑、3大屏)
    fromUserId: sessionStorage.userId, //用户ID
    fromUserName: sessionStorage.userName,   //用户名称
    opTime: new Date().getTime(),
    isHomeOwners: false,    //是否创建者
    opId: ULID.ulid(),  //操作ID
};

let eraserWidth = {};
let isDrawScale = true;
function canvasAddEvent(){
    let ctxWidth = wm.pagesArr[wm.pageIndex].canvasGlobal.width,
    ctxHeight = wm.pagesArr[wm.pageIndex].canvasGlobal.height;
    canvasDraw.Add('touchstart mousedown',function(e){  //开始绘制
        if(!isWrite){return false};
        if(brushType === 1&&!imageMax(1,15)){
            return false;
        }
        isDrawScale = true;
        if(e.touches){
            if(e.touches.length >= 2){
                isDrawScale = false;
                return false;
            }
        }
        let x,y,cricX,cricY,mx,my,ox,oy,eraserX,eraserY,mMastersi = 0,that = this,eraser,isDraw = false,isCirc = false,globalId,drawArr,pointArr,pointObj;
        x = e.touches?e.touches[0].clientX:e.clientX;
        y = e.touches?e.touches[0].clientY:e.clientY;
        cricX = wm.scaleTransform(x - wm.pagesArr[wm.pageIndex].canvasGlobal.repairLeft) - wm.pagesArr[wm.pageIndex].canvasGlobal.transX / wm.pagesArr[wm.pageIndex].canvasGlobal.scale;
        cricY = wm.scaleTransform(y - wm.pagesArr[wm.pageIndex].canvasGlobal.repairTop) - wm.pagesArr[wm.pageIndex].canvasGlobal.transY / wm.pagesArr[wm.pageIndex].canvasGlobal.scale;
        if(selectObject.bool&&selectObject.left - wm.scaleTransform(24) < cricX&&selectObject.right + wm.scaleTransform(24) > cricX&&selectObject.top - wm.scaleTransform(24) < cricY&&selectObject.bottom + wm.scaleTransform(24) > cricY){
            circStart(cricX,cricY,ctxd);
            isCirc = true;
        }else{
            if(thatData.brushShow){
                thatData.brushShow = false;
            }
            if(brushType === 2){
                // ctxd.strokeStyle = thatData.backColor;  //thatData.backColor
                // ctxd.fillStyle = thatData.backColor;
                ctx.strokeStyle = '#00000000';  //thatData.backColor
                ctx.fillStyle = '#00000000';
                eraserWidth.initWidth = 48 / wm.pagesArr[wm.pageIndex].canvasGlobal.scale;
                eraserWidth.scaleWidth = 48;
                eraserWidth.width = wm.scaleTransform(48);
                eraserWidth.left = x - eraserWidth.scaleWidth/2;
                eraserWidth.top = y - eraserWidth.scaleWidth/2;
                ctx.lineWidth = 1;
                eraser = create('div');
                eraser.className = 'eraser';
                n('body')[0].appendChild(eraser);
                eraser.setCss({
                    width: eraserWidth.scaleWidth + 'px',
                    height: eraserWidth.scaleWidth + 'px',
                    left: x - eraserWidth.scaleWidth/2 + 'px',
                    top: y - eraserWidth.scaleWidth/2 + 'px',
                })
            }
            ox = wm.scaleTransRealform(x);
            oy = wm.scaleTransRealform(y);
            x = wm.scaleTransform(x - wm.pagesArr[wm.pageIndex].canvasGlobal.transX * wm.pagesArr[wm.pageIndex].canvasGlobal.mobileScale);
            y = wm.scaleTransform(y - wm.pagesArr[wm.pageIndex].canvasGlobal.transY * wm.pagesArr[wm.pageIndex].canvasGlobal.mobileScale);
            eraserWidth.prevX = ox;
            eraserWidth.prevY = oy;
            ctxd.save();
            ctxd.translate(wm.pagesArr[wm.pageIndex].canvasGlobal.transX,wm.pagesArr[wm.pageIndex].canvasGlobal.transY);
            ctxd.scale(wm.pagesArr[wm.pageIndex].canvasGlobal.scale,wm.pagesArr[wm.pageIndex].canvasGlobal.scale);
            ctxd.beginPath();
            if(brushType == 1){
                ctxd.lineTo(x, y);
            }
            if(brushType == 2){
                ctx.save();
                ctx.translate(wm.canvasGlobal.transX,wm.canvasGlobal.transY);
                ctx.scale(wm.canvasGlobal.scale,wm.canvasGlobal.scale);
                //ctxd.rect(eraserWidth.left,eraserWidth.top,eraserWidth.width,eraserWidth.height);
                //ctxd.rect(x - eraserWidth.width/2,y - eraserWidth.width/2,eraserWidth.width,eraserWidth.width);
                //ctxd.fill();
            }
            //ctxd.beginPath((x, y));
            drawArrObject.header.command = 'opDoodle';
            drawArrObject.header.opTime = new Date().getTime();
            drawArrObject.header.opId = ULID.ulid();
            drawArrObject.body = {
                ids: [],
                type: 1,
                x: x,
                y: y,
            };
            globalId = ULID.ulid();
            if(brushType == 1){
                let u8Arr = new Int8Array(50);
                let i = 0;
                for(i;i<1; i++){   //画笔的类型，开始为1 中间为2 结束为3
                    u8Arr[i] = 1;
                }
                for(i;i<27; i++){   //画笔的全局ID
                    u8Arr[i] = globalId.charCodeAt(i-1);
                }
                let toUserId = fromString(sessionStorage.userId);
                for(i;i<43; i++){   //用户ID
                    u8Arr[i] = toUserId[i-27];
                }
                for(i;i<44; i++){   // 画笔大小size
                    u8Arr[i] = wm.pagesArr[wm.pageIndex].canvasGlobal.brushWidth;
                }
                //画笔的颜色
                u8Arr[44] = (intHex(wm.pagesArr[wm.pageIndex].canvasGlobal.brushColor) >> 24) & 0xff;
                u8Arr[45] = (intHex(wm.pagesArr[wm.pageIndex].canvasGlobal.brushColor) >> 16) & 0xff;
                u8Arr[46] = (intHex(wm.pagesArr[wm.pageIndex].canvasGlobal.brushColor) >> 8) & 0xff;
                u8Arr[47] = intHex(wm.pagesArr[wm.pageIndex].canvasGlobal.brushColor) & 0xff;
                // let colorsss = u8Arr.slice(44,48);  //点的x轴
                // log(colorsss);
                // log(u8Arr[44],u8Arr[45],u8Arr[46],u8Arr[47]);
                // log(toInt16(colorsss));
                // function toUInt16(bytes) {
                //    return ((bytes[0] & 0xFF) << 8) | (bytes[1] & 0xFF);
                // }
                // function toInt16(bytes) {
                //     return bytes[0] >> 7 == 0 ? toUInt16(bytes) : toUInt16(bytes) - 65536;
                // }
                i = 48;
                for(i;i<49; i++){   //画笔的种类
                    u8Arr[i] = 1;
                }
                for(i;i<50; i++){   //画笔的笔锋
                    u8Arr[i] = 0;
                }
                try {
                    wws.send(u8Arr);
                } catch (error) {
                    log(error);
                    wws.send(u8Arr);
                }
            }
            drawArr = [];
            pointArr = [];
            pointObj = {};
            if(brushType === 1){
                ctxd.strokeStyle = wm.pagesArr[wm.pageIndex].canvasGlobal.brushColor;
                ctxd.lineWidth = wm.pagesArr[wm.pageIndex].canvasGlobal.brushWidth * wm.pagesArr[wm.pageIndex].canvasGlobal.mobileScale * wm.pagesArr[wm.pageIndex].canvasGlobal.scale;
            }
            drawArr.push(-1);
            drawArr.push(x - wm.scaleTransform(wm.pagesArr[wm.pageIndex].canvasGlobal.repairLeft));
            drawArr.push(y - wm.scaleTransform(wm.pagesArr[wm.pageIndex].canvasGlobal.repairTop));
            pointObj.x = x - wm.scaleTransform(wm.pagesArr[wm.pageIndex].canvasGlobal.repairLeft);
            pointObj.y = y - wm.scaleTransform(wm.pagesArr[wm.pageIndex].canvasGlobal.repairTop);
            pointArr.push(pointObj);
            mMasters = [];
            mMasters.push(true);
        }
        document.Add('touchmove mousemove',canvasDrawMove);
        document.Add('touchend mouseup',canvasDrawEnd);
        function canvasDrawMove(even){
            if(isDrawScale){
                isDraw = true;
                mMastersi++;
                mMasters.push(mMastersi%3 == 0?true:false);
                mx = even.touches?even.touches[0].clientX:even.clientX;
                my = even.touches?even.touches[0].clientY:even.clientY;
                if(brushType == 2 && !isCirc){
                    eraser.style.left = mx - eraserWidth.scaleWidth/2 + 'px';
                    eraser.style.top = my - eraserWidth.scaleWidth/2 + 'px';
                    // 在Canvas上绘制转换后的元素
                    //ctxd.drawImage(canvas, mx - eraserWidth.scaleWidth/2, my - eraserWidth.scaleWidth/2);
                }
                //let mxx = wm.scaleTransRealform(mx - wm.pagesArr[wm.pageIndex].canvasGlobal.repairLeft);
                //let myy = wm.scaleTransRealform(my - wm.pagesArr[wm.pageIndex].canvasGlobal.repairTop);
                if(isCirc){
                    cricX = wm.scaleTransform(mx - wm.pagesArr[wm.pageIndex].canvasGlobal.repairLeft) - wm.pagesArr[wm.pageIndex].canvasGlobal.transX / wm.pagesArr[wm.pageIndex].canvasGlobal.scale;
                    cricY = wm.scaleTransform(my - wm.pagesArr[wm.pageIndex].canvasGlobal.repairTop) - wm.pagesArr[wm.pageIndex].canvasGlobal.transY / wm.pagesArr[wm.pageIndex].canvasGlobal.scale;
                    circMove(cricX,cricY,ctxd);
                }else{
                    //ox = wm.scaleTransRealform(mx) - (wm.pagesArr[wm.pageIndex].canvasGlobal.transX - wm.pagesArr[wm.pageIndex].canvasGlobal.transXs);
                    //oy = wm.scaleTransRealform(my) - (wm.pagesArr[wm.pageIndex].canvasGlobal.transY - wm.pagesArr[wm.pageIndex].canvasGlobal.transYs);
                    eraserX = wm.scaleTransRealform(mx);
                    eraserY = wm.scaleTransRealform(my);
                    ox = wm.scaleTransRealform(mx - wm.pagesArr[wm.pageIndex].canvasGlobal.repairLeft);
                    oy = wm.scaleTransRealform(my - wm.pagesArr[wm.pageIndex].canvasGlobal.repairTop);
                    mx = wm.scaleTransform((mx - wm.pagesArr[wm.pageIndex].canvasGlobal.transX * wm.pagesArr[wm.pageIndex].canvasGlobal.mobileScale));
                    my = wm.scaleTransform((my - wm.pagesArr[wm.pageIndex].canvasGlobal.transY * wm.pagesArr[wm.pageIndex].canvasGlobal.mobileScale));
                    if(brushType == 1){
                        let u8Arr = new Int8Array(31);
                        let i = 0;
                        for(i;i<1; i++){   //画笔的类型，开始为1 中间为2 结束为3
                            u8Arr[i] = 2;
                        }
                        for(i;i<27; i++){   //画笔的全局ID
                            u8Arr[i] = globalId.charCodeAt(i-1);
                        }
                        let mxx = mx - wm.scaleTransform(wm.pagesArr[wm.pageIndex].canvasGlobal.repairLeft);
                        let myy = my - wm.scaleTransform(wm.pagesArr[wm.pageIndex].canvasGlobal.repairTop);
                        mxx = toTouchX(mxx);
                        myy = toTouchY(myy);

                        function toTouchX(x) {
                            return x * wm.pagesArr[wm.pageIndex].canvasGlobal.scales + wm.pagesArr[wm.pageIndex].canvasGlobal.transXs;
                        }
                        function toTouchY(y) {
                            return y * wm.pagesArr[wm.pageIndex].canvasGlobal.scales + wm.pagesArr[wm.pageIndex].canvasGlobal.transYs;
                        }

                        // let mxx = parseInt(ox);
                        // let myy = parseInt(oy);
                        // log('触摸初始值',mxx,myy);
                        // mxx = toX(mxx);
                        // myy = toY(myy);
                        // log('触摸转换值',mxx,myy);
                        // function toX(touchX) {
                        //     //log('触摸算法数据',touchX,wm.pagesArr[wm.pageIndex].canvasGlobal.transX,wm.pagesArr[wm.pageIndex].canvasGlobal.transXs)
                        //     return (touchX / (wm.pagesArr[wm.pageIndex].canvasGlobal.scale/wm.pagesArr[wm.pageIndex].canvasGlobal.scales) - (wm.pagesArr[wm.pageIndex].canvasGlobal.transX / wm.pagesArr[wm.pageIndex].canvasGlobal.scale - wm.pagesArr[wm.pageIndex].canvasGlobal.transXs / wm.pagesArr[wm.pageIndex].canvasGlobal.scales));
                        // }
                        // function toY(touchY) {
                        //     return (touchY / (wm.pagesArr[wm.pageIndex].canvasGlobal.scale/wm.pagesArr[wm.pageIndex].canvasGlobal.scales) - (wm.pagesArr[wm.pageIndex].canvasGlobal.transY / wm.pagesArr[wm.pageIndex].canvasGlobal.scale - wm.pagesArr[wm.pageIndex].canvasGlobal.transYs / wm.pagesArr[wm.pageIndex].canvasGlobal.scales));
                        // }
                        //画笔的x轴
                        u8Arr[27] = mxx >> 8;
                        u8Arr[28] = mxx & 0xff;
                        //画笔的y轴
                        u8Arr[29] = myy >> 8;
                        u8Arr[30] = myy & 0xff;
                        try {
                            wws.send(u8Arr);
                        } catch (error) {
                            log(error);
                            wws.send(u8Arr);
                        }
                        ctxd.lineTo(mx, my);
                        ctxd.stroke();
                    }else if(brushType == 2){
                        eraserWidth.x = eraserX;
                        eraserWidth.y = eraserY;
                        ctx.save();
                        ctx.beginPath();
                        ctx.arc(eraserWidth.x,eraserWidth.y,eraserWidth.width/2,0,2*Math.PI);
                        ctx.fill();
                        ctx.clip();
                        ctx.clearRect(0, 0, ctxWidth, ctxHeight);
                        ctx.restore();
                        ctx.save();
                        ctx.beginPath();
                        if(Math.abs(eraserWidth.x - eraserWidth.prevX) < Math.abs(eraserWidth.y - eraserWidth.prevY)){
                            ctx.moveTo(eraserWidth.prevX - eraserWidth.width/2,eraserWidth.prevY);
                            ctx.lineTo(eraserWidth.prevX + eraserWidth.width/2,eraserWidth.prevY);
                            ctx.lineTo(eraserWidth.x + eraserWidth.width/2,eraserWidth.y);
                            ctx.lineTo(eraserWidth.x - eraserWidth.width/2,eraserWidth.y);
                        }else{
                            ctx.moveTo(eraserWidth.prevX,eraserWidth.prevY - eraserWidth.width/2);
                            ctx.lineTo(eraserWidth.prevX,eraserWidth.prevY + eraserWidth.width/2);
                            ctx.lineTo(eraserWidth.x,eraserWidth.y + eraserWidth.width/2);
                            ctx.lineTo(eraserWidth.x,eraserWidth.y - eraserWidth.width/2);
                        }
                        ctx.closePath();
                        ctx.fill();
                        //ctx.rect(eraserWidth.x + 20,eraserWidth.y,eraserWidth.x,eraserWidth.y)
                        ctx.clip();
                        ctx.clearRect(0, 0, ctxWidth, ctxHeight);
                        ctx.restore();
                        eraserWidth.prevX = eraserX;
                        eraserWidth.prevY = eraserY;
                        //ctx.clearRect(mx - eraserWidth.width/2, my - eraserWidth.width/2,eraserWidth.width,eraserWidth.width);
                    }
                    drawArr.push(-2);
                    //log('正式',mx - wm.scaleTransform(wm.pagesArr[wm.pageIndex].canvasGlobal.repairLeft),my - wm.scaleTransform(wm.pagesArr[wm.pageIndex].canvasGlobal.repairTop))
                    drawArr.push(mx - wm.scaleTransform(wm.pagesArr[wm.pageIndex].canvasGlobal.repairLeft));
                    drawArr.push(my - wm.scaleTransform(wm.pagesArr[wm.pageIndex].canvasGlobal.repairTop));
                    pointObj = {};
                    pointObj.x = mx - wm.scaleTransform(wm.pagesArr[wm.pageIndex].canvasGlobal.repairLeft);
                    pointObj.y = my - wm.scaleTransform(wm.pagesArr[wm.pageIndex].canvasGlobal.repairTop);
                    pointArr.push(pointObj)
                }
            }   
        };
        function canvasDrawEnd(){
            document.Remove('touchmove mousemove',canvasDrawMove);
            document.Remove('touchend mouseup',canvasDrawEnd);
            if(brushType == 2){
                n('body')[0].removeChild(eraser);
                //ctxd.clearRect(0,0,wm.canvasGlobal.width,wm.canvasGlobal.height);
            }
            if(isCirc){
                return false;
            }
            if(e.touches){
                if(e.touches.length >= 2){
                    return false;
                }
            }
            if(brushType == 1){
                let u8Arr = new Int8Array(31);
                let i = 0;
                for(i;i<1; i++){   //画笔的类型，开始为1 中间为2 结束为3
                    u8Arr[i] = 3;
                }
                for(i;i<27; i++){   //画笔的全局ID
                    u8Arr[i] = globalId.charCodeAt(i-1);
                }
                //画笔的x轴
                u8Arr[27] = parseInt(ox - wm.scaleTransform(wm.pagesArr[wm.pageIndex].canvasGlobal.repairTop)) >> 8;
                u8Arr[28] = parseInt(ox - wm.scaleTransform(wm.pagesArr[wm.pageIndex].canvasGlobal.repairTop)) & 0xff;
                //画笔的y轴
                u8Arr[29] = parseInt(oy - wm.scaleTransform(wm.pagesArr[wm.pageIndex].canvasGlobal.repairTop)) >> 8;
                u8Arr[30] = parseInt(oy - wm.scaleTransform(wm.pagesArr[wm.pageIndex].canvasGlobal.repairTop)) & 0xff;
                try {
                    wws.send(u8Arr);
                } catch (error) {
                    log(error);
                    wws.send(u8Arr);
                }
            }
            if(textSelect){
                textSelect = false;
                return false;
            }
            ctxd.restore();
            if(!isDraw){    //没有移动则为无效绘制
                ctxd.clearRect(0,0,wm.pagesArr[wm.pageIndex].canvasGlobal.width,wm.pagesArr[wm.pageIndex].canvasGlobal.height);
                return false;
            }
            drawArrObject.header.opId = ULID.ulid();
            drawArrObject.body.data = [
                {
                    className: 'DoodlePath',
                    mBound: {},
                    mOriginBound: {},
                    mOriginLocation: {},
                    id: -1,
                    globalId: globalId,
                    mPath: {
                        mMasters: mMasters,    //根据点的数据来，三组数据为一个 第一个true之后每隔三个false显示true
                        mToolType: 1 ,   //手写笔绘还是毛笔，默认2为手写
                        savePoints: drawArr,    //画笔绘制数据
                        widths: [],     //笔锋算法宽度
                    },
                    mRect: {},
                    mBaseScale: 1,
                    mColor: {   //颜色对象，仅需修改mColor即可，其他不动
                        type: 'DoodleColor',
                        mColor: intHex(wm.pagesArr[wm.pageIndex].canvasGlobal.brushColor), //该次涂鸦数值
                        mColorType: 'COLOR',
                        mLevel: 1,
                        mOriginalColor: 0,
                        mTileX: "MIRROR",
                        mTileY: "MIRROR",
                    },
                    mItemRotate: 0,
                    mLocation: {},
                    mOverturnX: 1,
                    mOverturnY: 1,
                    mPen: 'BRUSH',
                    mPivotX: 0,
                    mPivotY: 0,
                    mShape: "HAND_WRITE",
                    mSize: wm.pagesArr[wm.pageIndex].canvasGlobal.brushWidth,
                    type: 15,
                },
            ];
            whiteSum.resetLocationBounds(drawArrObject.body.data[0],1);
            drawArrObject.body.x = drawArrObject.body.data[0].mBound.right;
            drawArrObject.body.y = drawArrObject.body.data[0].mBound.bottom;
            if(brushType == 1){
                startDraw(ctx,drawArrObject.body.data[0]);
                addSend(drawArrObject);
                ctxd.clearRect(0,0,wm.pagesArr[wm.pageIndex].canvasGlobal.width,wm.pagesArr[wm.pageIndex].canvasGlobal.height);
            }else if(brushType == 2){
                drawArrObject.header.command = 'eraser';
                drawArrObject.header.opTime = new Date().getTime();
                drawArrObject.body.points = pointArr;
                let drawArrObjectEraserAlgo = JSON.parse(JSON.stringify(drawArrObject.body.data[0]));
                drawArrObject.body.data = [];
                eraserAlgo(drawArrObjectEraserAlgo.mBound,drawArrObject.body.data);
                drawArrObject.body.mSize = eraserWidth.width * 1.1;
                let drawArrObjectIS = JSON.parse(JSON.stringify(drawArrObject));
                ajax({
                    type: 'post',
                    url: wm.URLS + '/board-center/roomController/eraser',
                    header: 'application/json',
                    data: JSON.stringify(drawArrObject),
                    dataType: 'json',
                    success: function(data){
                        if(data.code == 200){
                            var data = JSON.parse(data.data);
                            data.header.opId = ULID.ulid();
                            dataRender(data);
                            ws.send(JSON.stringify(data));
                        }else{
                            thatData.joinShow = false;
                            for(let i of wm.pagesArr[wm.pageIndex].brushArr){
                                startDraw(ctx,i);
                            }
                        }
                    },error: function(){
                        thatData.joinShow = false;
                        for(let i of wm.pagesArr[wm.pageIndex].brushArr){
                            startDraw(ctx,i);
                        }
                    }
                })
                // try {
                //     ws.send(JSON.stringify(drawArrObject));
                // } catch (error) {
                //     log(error);
                //     ws.send(JSON.stringify(drawArrObject));
                // }
                thatData.joinShow = true;
            }
        };
    });
}
let total = [];
let dangqian = [];

//log(whiteObj.body.data.mPath.savePoints);
//startDraw(whiteObj.body.data.mPath.savePoints);
//mPath.savePoints涂鸦的点的坐标集合
//mColor.mColor该涂鸦的颜色值
//mLocation画布绘制前的x,y画布偏移量
//mRect涂鸦基于画布四边的位置
//mItemRotate涂鸦旋转需要的角度
//mPivotX涂鸦基于画布的旋转X重心
//mPivotY涂鸦基于画布的旋转Y重心

// ctx.moveTo(160,0);
// ctx.lineTo(320,320);
// ctx.lineTo(0,320);
// ctx.closePath();
// ctx.fillStyle = 'red';
// ctx.fill();
// ctxa.strokeStyle = '#FF0';
// ctxa.lineWidth = 3;
// ctxa.ellipse(241.3534, 927.3236, 1029.7223, 487.48926,0,0,Math.PI*2);
// ctxa.arc(1847.3184, 976.9203, 128.83862,0, 2 * Math.PI, false);
// ctxa.stroke();
function wrapText(context, text, x, y, maxWidth, lineHeight) {  //canvas绘制文本自动换行
    var words = text.split('');
    var line = '';
    for(var n = 0; n < words.length; n++) {
      var testLine = line + words[n] + '';
      var metrics = context.measureText(testLine);
      var testWidth = metrics.width;
  
      if (testWidth > maxWidth && n > 0) {
        context.fillText(line, x, y);
        line = words[n] + '';
        y += lineHeight;
      }
      else {
        line = testLine;
      }
    }
    context.fillText(line, x, y);
    //let len;
    // for(var i=0;i<text.length;i++){
    //   len+=  context.measureText(text[i])
    //   if()
    // }
  }

function startDraw(context,e,num){  //开始绘制
    if(e.selected == 1&&num!=1){
        return false;
    }
    context.save();
    context.translate(wm.pagesArr[wm.pageIndex].canvasGlobal.transX,wm.pagesArr[wm.pageIndex].canvasGlobal.transY);
    context.scale(wm.pagesArr[wm.pageIndex].canvasGlobal.scale,wm.pagesArr[wm.pageIndex].canvasGlobal.scale);
    context.translate(wm.scaleTransform(wm.pagesArr[wm.pageIndex].canvasGlobal.repairLeft),wm.scaleTransform(wm.pagesArr[wm.pageIndex].canvasGlobal.repairTop));
    let {mPath,mColor,mLocation,mRect,mSize,mItemRotate,mPivotX,mPivotY,mBaseScale,mOverturnX,mOverturnY,className,type,mText,mTextSize,srcUrl,mSrcRect,mDstRect,boardColor,solidColor,fileName} = e;
    let ox = mPivotX - mLocation.x,oy = mPivotY - mLocation.y;
    // context.strokeStyle = '#FFFFFF';
    // context.rect(mBound.left,mBound.top,mBound.right - mBound.left,mBound.bottom - mBound.top);
    // context.stroke();
    context.translate(mLocation.x,mLocation.y);
    context.translate(ox,oy);
    if(className != 'DoodleBitmap' && className != 'DoodleMindBitmap'){
        context.scale(mBaseScale * mOverturnX , mBaseScale * mOverturnY);
    }
    context.rotate(mItemRotate * Math.PI/180);
    context.translate(-ox,-oy);
    if(type == 19){
        context.save();
        context.font = mTextSize + 'px sans-serif';
        context.fillStyle = parseHex(mColor.mColor);
        if(e.lineType == 0){ //教学工具直尺长度文字渲染
            context.rotate(e.rotateDegree * Math.PI/180);
            context.translate(e.lineLength/2,0);
            context.fillText(e.text, 0, e.rotateDegree?-12:18);
            context.translate(-e.lineLength/2,0);
            context.rotate(-e.rotateDegree * Math.PI/180);
        }else if(e.lineType == 1){ //教学工具量角器长度文字渲染
            context.save();
            context.translate(-e.locationX,-e.locationY);
            context.rotate(e.rotateDegree,e.pivotX,e.pivotY);
            context.lineWidth = e.mSize;
            context.strokeStyle = parseHex(e.mColor.mColor);
            context.beginPath();
            if(e.isSwitchAngle){
                context.arc(e.pivotX,e.pivotY,50,180/180*Math.PI,180/180*Math.PI + e.lineAngle/180*Math.PI,false);
            }else{
                context.arc(e.pivotX,e.pivotY,50,(360-e.lineAngle)/180*Math.PI,(360-e.lineAngle)/180*Math.PI + e.lineAngle/180*Math.PI,false);
            }
            context.stroke();
            context.fillText(e.text, e.xy.x, e.xy.y);
            context.restore();

            //context.rotate(e.rotateDegree * Math.PI/180);
            //const dx = e.pointFList[1].x - e.pointFList[0].x;
            //const dy = e.pointFList[1].y - e.pointFList[0].y;
            //const lineWidth = Math.sqrt(dx*dx + dy*dy) / 2;
            //let offset;

            // if(e.lineAngle/90 > 1){
            //     if(180-e.lineAngle > 45){
            //         offset = 180-e.lineAngle != 0?90/(180-e.lineAngle)*50:0;
            //     }else{
            //         offset = 180-e.lineAngle != 0?90/(180-e.lineAngle)*(180/e.lineAngle - 1)*50:0;
            //     }
            // }
            //e.lineAngle/90 > 1?((e.lineAngle/90-1)*lineWidth + offset):50
            // context.translate(e.lineAngle/90 > 1?((e.lineAngle/90-1)*lineWidth + offset):50,(e.mOriginBound.bottom - e.mOriginBound.top - e.lineAngle/90*50 + mSize));
            // context.fillText(e.text, 0, 0);
            // context.translate(e.lineAngle/90 > 1?-((e.lineAngle/90-1)*lineWidth + offset):-50,-(e.mOriginBound.bottom - e.mOriginBound.top - e.lineAngle/90*50 + mSize));
            // context.beginPath();
            // if(e.isSwitchAngle){
            //     context.arc(e.pivotX - e.mLocation.x,e.pivotY - e.mLocation.y,50,(e.rotateDegree+180 + e.lineAngle)/180*Math.PI,(e.rotateDegree - e.lineAngle + 180 + e.lineAngle)/180*Math.PI,true);
            // }else{
            //     context.arc(e.pivotX - e.mLocation.x,e.pivotY - e.mLocation.y,50,e.rotateDegree/180*Math.PI,(e.rotateDegree - e.lineAngle)/180*Math.PI,true);
            // }
            // context.strokeStyle = parseHex(mColor.mColor);
            // context.lineWidth = mSize;
            // context.stroke();
            //context.rotate(-e.rotateDegree * Math.PI/180);
        }
        context.beginPath();
        if(e.lineType == 0||e.lineType == 1||e.lineType == 2){
            for(let i = 0; i < mPath.savePoints.length;){
                let value = mPath.savePoints[i];
                switch(value){
                    case -1:    //moveType开始绘制 beginPath
                        context.moveTo(mPath.savePoints[i + 1] - mRect.left, mPath.savePoints[i + 2] - mRect.top);
                        i += 3;
                        break;
                    case -2:    //lineType普通绘制 lineTo
                        context.lineTo(mPath.savePoints[i + 1] - mRect.left, mPath.savePoints[i + 2] - mRect.top);
                        i += 3;
                        break;
                    case -8:
                        // if(!e.mLocationS){
                        //     e.mLocationS = {
                        //         x: mLocation.x,
                        //         y: mLocation.y,
                        //     }
                        // }
                        context.translate(-e.mLocation.x,-e.mLocation.y);
                        //context.translate(-wm.pagesArr[wm.pageIndex].canvasGlobal.transX,-wm.pagesArr[wm.pageIndex].canvasGlobal.transY);
                        context.arc(e.pivotX,e.pivotY,e.radius,e.startAngle / 360 * 2 * Math.PI,(e.startAngle + e.sweepAngle) / 360 * 2 * Math.PI,e.sweepAngle >= 0?false:true);
                        i += 7;
                        break;
                }
            }
            context.strokeStyle = parseHex(mColor.mColor);
            context.lineWidth = mSize;
            context.stroke();
            context.restore();
        }
    }
    if(className == 'DoodleText'){  //文字渲染
        context.font = mTextSize + 'px OzCaramel';//OzCaramel
        //context.textAlign = "center";
        context.fillStyle = parseHex(mColor.mColor);
        var lines = mText.split("\n");
        // context.strokeStyle = 'red';
        // context.rect(0,0,e.mBound.right - e.mBound.left,e.mBound.bottom - e.mBound.top);
        // context.stroke();
        //context.save();
        //context.translate((e.mBound.right - e.mBound.left)/2,0);
        //context.fillText(mText, 0,0,500);
        for (var i = 0; i < lines.length; i++) {
            wrapText(context,lines[i], (e.mMaxWidth - context.measureText(lines[i]).width)/2,mTextSize + i*mTextSize*1.2,e.mMaxWidth,60);
            //context.fillText(lines[i], 0, mTextSize + i*mTextSize*1.2,500);
        }
        //context.restore();
        //context.fillText(mText,0,mTextSize);
    }else if(className == 'DoodleMindBitmap' || className === "DoodleBitmap"||type == 20){  //图片渲染
        if(srcUrl){
            context.drawImage(srcUrl,0,0,mDstRect.right - mDstRect.left,mDstRect.bottom - mDstRect.top);
        }
    }else if(type == 17){   //3d图形渲染
        e.mOriginBound = {
            left: mLocation.x,
            right: mLocation.x + mDstRect.right,
            top: mLocation.y,
            bottom: mLocation.y + mDstRect.bottom,
        };
        e.mBound = {
            left: mLocation.x,
            right: mLocation.x + mDstRect.right,
            top: mLocation.y,
            bottom: mLocation.y + mDstRect.bottom,
        };
        wm.calculateBound(e);
        if(srcUrl){
            context.drawImage(srcUrl,0,0,mDstRect.right - mDstRect.left,mDstRect.bottom - mDstRect.top);
        }
    }else if(className == 'DoodlePath'||type == 18||type == 34){    //笔画渲染
        //context.strokeStyle = parseHex(mColor.mColor);
        context.beginPath();
        for(let i = 0; i < mPath.savePoints.length;){
            let value = mPath.savePoints[i];
            switch(value){
                case -1:    //moveType开始绘制 beginPath
                    context.moveTo(mPath.savePoints[i + 1] - mRect.left, mPath.savePoints[i + 2] - mRect.top);
                    i += 3;
                    break;
                case -2:    //lineType普通绘制 lineTo
                    context.lineTo(mPath.savePoints[i + 1] - mRect.left, mPath.savePoints[i + 2] - mRect.top);
                    i += 3;
                    break;
                case -3:    //quadType二次贝塞尔曲线 quadraticCurveTo
                    context.quadraticCurveTo(mPath.savePoints[i + 1], mPath.savePoints[i + 2], mPath.savePoints[i + 3], mPath.savePoints[i + 4]);
                    i += 5; 
                    break;
                case -4:    //rectType绘制矩阵 Rect
                    context.rect(mPath.savePoints[i + 1], mPath.savePoints[i + 2], mPath.savePoints[i + 3], mPath.savePoints[i + 4]);
                    i += 5;
                    break;
                case -5:    //circleType绘制圆形  arc
                    // -5
                    // 1847.3184
                    // 976.9203
                    // 128.83862
                    //context.restore();
                    //context.save();
                    //context.translate(wm.scaleTransform(wm.canvasGlobal.repairLeft),wm.scaleTransform(wm.canvasGlobal.repairTop));
                    if(type !== 18){
                        if(!e.mLocationS){
                            e.mLocationS = {
                                x: mLocation.x,
                                y: mLocation.y,
                            }
                        }
                        context.translate(-e.mLocationS.x,-e.mLocationS.y);
                    }
                    context.arc(mPath.savePoints[i + 1], mPath.savePoints[i + 2], mPath.savePoints[i + 3],0, 2 * Math.PI, false);
                    //context.restore();
                    i += 4;
                    break;
                case -6:    //ovalType绘制椭圆  ellipse
                    context.ellipse(((mPath.savePoints[i + 3] - mPath.savePoints[i + 1])/2), ((mPath.savePoints[i + 4] - mPath.savePoints[i + 2])/2), (mPath.savePoints[i + 3] - mPath.savePoints[i + 1])/2, (mPath.savePoints[i + 4] - mPath.savePoints[i + 2])/2,0,0,Math.PI*2);
                    i += 5;
                    break;
                case -7:    //arcType绘制弧线  arc
                    if(!e.mLocationS){
                        e.mLocationS = {
                            x: mLocation.x,
                            y: mLocation.y,
                        }
                    }
                    context.translate(-e.mLocationS.x,-e.mLocationS.y);
                    context.arc(mPath.savePoints[i + 1], mPath.savePoints[i + 2], mPath.savePoints[i + 3], mPath.savePoints[i + 4], mPath.savePoints[i + 5], mPath.savePoints[i + 6]);
                    i += 7;
                    break;
                case -8:    //arcToType
                    //log(mPath.savePoints);
                    //context.translate(-mLocation.x,-mLocation.y);
                    //var rect = {x: mPath.savePoints[i + 1], y: mPath.savePoints[i + 2], width: mPath.savePoints[i + 3], height: mPath.savePoints[i + 4]};
                    //context.arcTo(rect.x + rect.width, rect.y, rect.x + rect.width, rect.y + rect.height, rect.width/2);
                    //context.arcTo(mPath.savePoints[i + 3], mPath.savePoints[i + 2], mPath.savePoints[i + 3], mPath.savePoints[i + 4], (mPath.savePoints[i + 3] - mPath.savePoints[i + 1])/2);
                    //context.arc(mPath.savePoints[i + 1], mPath.savePoints[i + 2],mPath.savePoints[i + 3] - mPath.savePoints[i + 1], mPath.savePoints[i + 5], mPath.savePoints[i + 5] + mPath.savePoints[i + 6],false);
                    //context.add(new ActionArcTo(savePoints.get(index + 1), savePoints.get(index + 2), savePoints.get(index + 3), savePoints.get(index + 4), savePoints.get(index + 5), savePoints.get(index + 6)));
                    i += 7;
                    break;
                case -9:    //closeType关闭绘制 closePath
                    i ++;
                    context.closePath();
                    break;
                default:
                    break;
            }
        }
        if(type == 18){
            context.closePath();
            context.strokeStyle = parseHex(boardColor);
            context.fillStyle = parseHex(solidColor);
            context.fill();
            context.lineWidth = mSize;
            context.stroke();
        }else{
            context.strokeStyle = parseHex(mColor.mColor);
            context.lineWidth = mSize;
            context.stroke();
        }
    }
    context.restore();
}



// ctx.beginPath();
// ctx.moveTo(pointArr[0].x,pointArr[0].y);
// ctx.strokeStyle = '#FFFFFF';
// for(let i of pointArr){
//     ctx.lineWidth = i.r;
//     ctx.lineTo(i.x,i.y);
// }
// ctx.stroke();

//监听移动端横屏竖屏
window.addEventListener('orientationchange',resize,false);
//监听页面放大缩小
window.onresize = resize;
function resize(){
    if(isResize){
        for(let i of wm.pagesArr){
            wm.initScale(i);
        }
        initCanvas();      //初始化画布属性
        // let width = wm.pagesArr[wm.pageIndex].canvasGlobal.width * wm.pagesArr[wm.pageIndex].canvasGlobal.mobileScale;
        // let height = wm.pagesArr[wm.pageIndex].canvasGlobal.height * wm.pagesArr[wm.pageIndex].canvasGlobal.mobileScale;
        // let scale = wm.pagesArr[wm.pageIndex].canvasGlobal.mobileScale;
        // canvas.width = width;
        // canvas.height = height;
        // canvasActual.width = width;
        // canvasActual.height = height;
        // canvasDraw.width = width;
        // canvasDraw.height = height;
        // circlSelect.width = width;
        // circlSelect.height = height;
    
        // ctx = canvas.getContext('2d');
        // ctxa = canvasActual.getContext('2d');
        // ctxd = canvasDraw.getContext('2d');
        // ctxc = circlSelect.getContext('2d');
        // ctx.scale(scale,scale);
        // ctxa.scale(scale,scale);
        // ctxd.scale(scale,scale);
        // ctxc.scale(scale,scale);
        clearCircl();
        for(let i of wm.pagesArr[wm.pageIndex].brushArr){
            startDraw(ctx,i);
        }
    }
}

let actualTimeArr = []; //实时绘制数组
let handShowIs = true;
connectWebSocket();
function connectWebSocket(){
    ws = new ReconnectingWebSocket(wm.URLW + '?userId=' + enc);
    let timoer,count;
    ws.onopen = function(){
        log('我连上了');
        thatData.tipsShow = false;
        timoer?clearInterval(timoer):false;
        function initSync(){
            let i = 0,u8Arr = new Int8Array(48);
            let u8ArrUserId = fromString(sessionStorage.userId);
            for(i;i < u8ArrUserId.length; i++){   //发送端的用户ID
                u8Arr[i] = u8ArrUserId[i];
            }
            let userId = u8Arr.slice(0,16); //获取16位源用户ID
            for(i;i<32; i++){   //接收端的用户ID
                u8Arr[i] = i==31?1:0;
            }
            for(i;i<36; i++){   //类型
                u8Arr[i] = i==35?3:0;
            }
            try {
                ws.send(u8Arr);
            } catch (error) {
                log(error);
                ws.send(u8Arr);
            }
        }
        initSync();
        let drawArrObjectJoinRoom = {};
        drawArrObjectJoinRoom.header = {    //传递信息header部分用户信息
            command: "joinRoom",    //命令类型
            fromDeviceType: wm.isPhone()?0:2,  //设备类型(0手机、1平板、2电脑、3大屏)
            fromUserId: sessionStorage.userId, //用户ID
            fromUserName: sessionStorage.userName,   //用户名称
            isHomeOwners: false,    //是否创建者
            opTime: new Date().getTime(),
            opId: ULID.ulid(),  //操作ID
        };
        try {
            ws.send(JSON.stringify(drawArrObjectJoinRoom));
        } catch (error) {
            ws.send(JSON.stringify(drawArrObjectJoinRoom));
        }
        let drawArrObjectHeart = {};
        drawArrObjectHeart.header = {    //传递信息header部分用户信息
            command: "heartBeat",    //命令类型
            fromDeviceType: wm.isPhone()?0:2,  //设备类型(0手机、1平板、2电脑、3大屏)
            fromUserId: sessionStorage.userId, //用户ID
            fromUserName: sessionStorage.userName,   //用户名称
            isHomeOwners: false,    //是否创建者
            opTime: new Date().getTime(),
            opId: ULID.ulid(),  //操作ID
        };
        setInterval(function (){
            if(ws.readyState == 1){
                try {
                    ws.send(JSON.stringify(drawArrObjectHeart));
                    wws.send(JSON.stringify(drawArrObjectHeart));
                } catch (error) {
                    ws.send(JSON.stringify(drawArrObjectHeart));
                    wws.send(JSON.stringify(drawArrObjectHeart));
                }
            }
        }, 5000);


        //实时绘制同步接口
        wws = new ReconnectingWebSocket(wm.URLWS + '?userId=' + enc);// + '?userId=' + sessionStorage.userId

        wws.onopen = function(){
            log('我也连上了');
        }

        wws.onclose = function(){
            log('我也断开了');
        }

        wws.onerror = function(){
            log('我也出错了');
        }
        wws.onmessage = function(data){
            if(typeof(data.data) == 'object'){
                let file =  new FileReader();
                file.readAsArrayBuffer(data.data);
                let actualTimore;
                file.onload = function(g){
                    let utf8 = new Int8Array(g.currentTarget.result);
                    let globalId = Uint8ArrayToString(utf8.slice(1,27)); //画笔全局ID
                    function Uint8ArrayToString(fileData){
                        var dataString = "";
                        for (var i = 0; i < fileData.length; i++) {
                        dataString += String.fromCharCode(fileData[i]);
                        }
                        return dataString;
                    }
                    if(utf8[0] == 1){
                        let userId = utf8.slice(27,43);//获取16位目的用户ID
                        let size = utf8.slice(43,44)[0];   //画笔的大小
                        let color = utf8.slice(44,48);   //画笔的颜色
                        //let paintId = utf8.slice(48,49);   //画笔的种类（初版默认笔）
                        //let brushId = utf8.slice(49,50);   //是否有笔锋（初版默认无笔锋）
                        function toInt32(bytes) {
                        return ((bytes[0] & 0xFF) << 24) | ((bytes[1] & 0xFF) << 16) | ((bytes[2] & 0xFF) << 8) | (bytes[3] & 0xFF);
                        }
                        let actualTimeObj = {
                            className: 'DoodlePath',
                            globalId: globalId,
                            mColor: {mColor: toInt32(color)},
                            mSize: size,
                            userId: getSelfUUID(userId),
                            savePoints: [],
                            isPush: true,
                        };
                        //drawStart(ctxa,parseHex(actualTimeObj.color),size);
                        actualTimeArr.push(actualTimeObj);
                    }else if(utf8[0] == 2){
                        for(let i of actualTimeArr){
                            if(i.globalId == globalId&&i.isPush){
                                if(actualTimore){
                                    clearTimeout(actualTimore);
                                }
                                let x = toInt16(utf8.slice(27,29)) + (wm.pagesArr[wm.pageIndex].canvasGlobal.transX - wm.pagesArr[wm.pageIndex].canvasGlobal.transXs);  //点的x轴
                                let y = toInt16(utf8.slice(29,31)) + (wm.pagesArr[wm.pageIndex].canvasGlobal.transY - wm.pagesArr[wm.pageIndex].canvasGlobal.transYs);  //点的y轴
                                //x = x / wm.pagesArr[wm.pageIndex].canvasGlobal.scale;
                                //y = y / wm.pagesArr[wm.pageIndex].canvasGlobal.scale;
                                //let width = utf8.slice(31,32);  //点的宽度（初版默认无笔锋）  笔锋才会用到
                                i.savePoints.push({x: x,y: y});
                                for(let j of thatData.devList){ //检测操作用户实时显示指针
                                    if(j.userId == i.userId&&handShowIs){
                                        handShowIs = false;
                                        handShow(j.userId,j.userName,j.deviceType,wm.backScaleTransRealform(x) + wm.pagesArr[wm.pageIndex].canvasGlobal.repairLeft,wm.backScaleTransRealform(y) + wm.pagesArr[wm.pageIndex].canvasGlobal.repairTop);
                                    }
                                }
                                function toUInt16(bytes) {
                                return ((bytes[0] & 0xFF) << 8) | (bytes[1] & 0xFF);
                                }
                                function toInt16(bytes) {
                                    return bytes[0] >> 7 == 0 ? toUInt16(bytes) : toUInt16(bytes) - 65536;
                                }
                                let length = i.savePoints.length;
                                if(length >= 2){
                                    ctxa.save();
                                    //ctxa.translate(wm.pagesArr[wm.pageIndex].canvasGlobal.transX,wm.pagesArr[wm.pageIndex].canvasGlobal.transY);
                                    //ctxa.scale(wm.pagesArr[wm.pageIndex].canvasGlobal.scale,wm.pagesArr[wm.pageIndex].canvasGlobal.scale);
                                    ctxa.translate(wm.scaleTransRealform(wm.pagesArr[wm.pageIndex].canvasGlobal.repairLeft),wm.scaleTransRealform(wm.pagesArr[wm.pageIndex].canvasGlobal.repairTop));
                                    ctxa.strokeStyle = parseHex(i.mColor.mColor);
                                    ctxa.lineWidth = i.mSize;
                                    ctxa.beginPath();
                                    ctxa.moveTo(i.savePoints[length-1].x,i.savePoints[length-1].y);
                                    ctxa.lineTo(i.savePoints[length-2].x,i.savePoints[length-2].y);
                                    ctxa.stroke();
                                    ctxa.restore();
                                }
                            }
                        }
                    }else if(utf8[0] == 3){
                        for(let i of actualTimeArr){
                            if(i.globalId == globalId){
                                let x = utf8.slice(27,29);  //点的x轴
                                let y = utf8.slice(29,31);  //点的y轴
                                i.savePoints.push({x: toInt16(x),y: toInt16(y)});
                                i.isPush = false;
                                function toUInt16(bytes) {
                                return ((bytes[0] & 0xFF) << 8) | (bytes[1] & 0xFF);
                                }
                                function toInt16(bytes) {
                                    return bytes[0] >> 7 == 0 ? toUInt16(bytes) : toUInt16(bytes) - 65536;
                                }
                                setTimeout(function(){
                                    ctxa.clearRect(0,0,wm.pagesArr[wm.pageIndex].canvasGlobal.width,wm.pagesArr[wm.pageIndex].canvasGlobal.height);
                                },50)
                                //drawMove(ctxa);
                                //drawEnd(ctxa,toInt16(x),toInt16(y))
                            }
                        }
                    }
                }
            }
        }
    }

    ws.onclose = function(e){
        log(e);
        // count = 10;
        // thatData.tipsImage = 'src/waring.png';
        // thatData.tipsText = thatData.connectionBroken + '('+count+'s)';
        // thatData.tipsShow = true;
        // ws.close();
        // connectWebSocket();
        // timoer = setInterval(function(){
        //     count--;
        //     if(count <= 0){
        //         thatData.tipsText = thatData.connectionError;
        //         sessionStorage.userId = '';
        //         isWrite = false;
        //     }else{
        //         thatData.tipsText = thatData.connectionBroken + '('+count+'s)';
        //     }
        // },1000)
    }

    ws.isReconnect = function(){
        log(123);
    }

    ws.onerror = function(e){
        log('连接发生了错误');
        log(e);
    }
}

// function drawStart(cxt,color,width){
//     //cxt.strokeStyle = color;
//     //cxt.lineWidth = wm.backScaleTransform(width);
// }
// function drawMove(cxt){
//     cxt.clearRect(0,0,wm.pagesArr[wm.pageIndex].canvasGlobal.width,wm.pagesArr[wm.pageIndex].canvasGlobal.height);
//     cxt.save();
//     cxt.translate(wm.pagesArr[wm.pageIndex].canvasGlobal.transX,wm.pagesArr[wm.pageIndex].canvasGlobal.transY);
//     cxt.scale(wm.pagesArr[wm.pageIndex].canvasGlobal.scale,wm.pagesArr[wm.pageIndex].canvasGlobal.scale);
//     cxt.translate(wm.scaleTransform(wm.pagesArr[wm.pageIndex].canvasGlobal.repairLeft),wm.scaleTransform(wm.pagesArr[wm.pageIndex].canvasGlobal.repairTop));
//     for(let i of actualTimeArr){
//         let length = i.savePoints.length;
//         if(length >= 2){
//             cxt.strokeStyle = parseHex(i.mColor.mColor);
//             cxt.lineWidth = wm.backScaleTransform(i.mSize);
//             cxt.beginPath();
//             for(let j of i.savePoints){
//                 cxt.lineTo(j.x,j.y);
//             }
//             cxt.stroke();
//         }
//     }
//     cxt.restore();
// }
// function drawEnd(cxt){
// }

let initX = 0,initY = 0;  //初始涂鸦坐标纪录
//let stepArr = [];       //步骤总记录
//let currentStep = [];   //当前展示步骤
//let stepInx = 0;        //当前步骤索引
let idsMap = new Map(); //涂鸦操作时需要此map来做遍历
//addStep();
//stepPrevDisabled(true);
function addStep(){
    wm.pagesArr[wm.pageIndex].stepInx = wm.pagesArr[wm.pageIndex].stepArr.length;
    wm.pagesArr[wm.pageIndex].stepArr.push(JSON.parse(JSON.stringify((wm.pagesArr[wm.pageIndex].currentStep))));
    stepPrevDisabled(false);
    stepNextDisabled(true);
}
function stepPrevDisabled(bool){
    thatData.btnCenter[4].disabled = bool;
    thatData.btnCenter = thatData.btnCenter;
}
function stepNextDisabled(bool){
    thatData.btnCenter[5].disabled = bool;
    thatData.btnCenter = thatData.btnCenter;
}

function prevStep(obj){
    if(wm.pagesArr[wm.pageIndex].stepInx > 0){
        wm.pagesArr[wm.pageIndex].stepInx--;
        moveStep(wm.pagesArr[wm.pageIndex].stepInx);
        recallStep();
    }
}
function nextStep(obj){
    if(wm.pagesArr[wm.pageIndex].stepInx < wm.pagesArr[wm.pageIndex].stepArr.length-1){
        wm.pagesArr[wm.pageIndex].stepInx++;
        moveStep(wm.pagesArr[wm.pageIndex].stepInx);
        recallStep();
    }else{
        stepNextDisabled(true);
    }
}

function moveStep(inx){
    stepPrevDisabled(inx > 0?false:true);
    stepNextDisabled(inx < wm.pagesArr[wm.pageIndex].stepArr.length - 1?false:true);
    wm.pagesArr[wm.pageIndex].currentStep = JSON.parse(JSON.stringify(wm.pagesArr[wm.pageIndex].stepArr[inx]));
    brushStep();
}

function recallStep(){
    drawArrObject.header.command = 'opDoodle';
    drawArrObject.header.opTime = new Date().getTime();
    drawArrObject.header.opId = ULID.ulid();
    drawArrObject.body = {
        ids: wm.pagesArr[wm.pageIndex].currentStep,
        type: 9,
        x: 0,
        y: 0,
    };
    drawArrObject.body.data = {step: wm.pagesArr[wm.pageIndex].stepInx};
    try {
        ws.send(JSON.stringify(drawArrObject));
    } catch (error) {
        log(error);
        ws.send(JSON.stringify(drawArrObject));
    }
}

function brushStep(){
    ctx.clearRect(0,0,wm.pagesArr[wm.pageIndex].canvasGlobal.width,wm.pagesArr[wm.pageIndex].canvasGlobal.height);
    wm.pagesArr[wm.pageIndex].brushArr = [];
    for(let i of wm.pagesArr[wm.pageIndex].brushTotalArr){
        if(i){
            for(let j of wm.pagesArr[wm.pageIndex].currentStep){
                if(j == i.globalId){
                    wm.pagesArr[wm.pageIndex].brushArr.push(i);
                    startDraw(ctx,i);
                }
            }
        }
    }
}

let roomExit = true;
let needAckMap = new Map();
let syncEnd = false;    //是否同步完成
let syncArr = [];       //同步完成前保留数据
ws.onmessage = function(data){
    if(typeof(data.data) == 'object'){
        log(data);
        //解析图片
        let file =  new FileReader();
        file.readAsArrayBuffer(data.data);
        file.onload = function(g){
            let utf8 = new Int8Array(g.currentTarget.result);
            let userId = utf8.slice(0,16); //获取16位源用户ID
            let userToId = utf8.slice(16,32);//获取16位目的用户ID
            let type = utf8.slice(32,36);//获取4位类型
            let idLength = utf8.slice(40,48);//获取8位ID长度
            function uint8Array(uint8Arrays) {   //uint8转10进制数字
                return Array.prototype.map
                  .call(uint8Arrays, (x) => ('00' + x.toString(10)).slice(-2))
                  .join('');
            }
            let globalID = utf8.slice(48,48 + Number(uint8Array(idLength)));//获取globalID
            function Uint8ArrayToString(fileData){
                var dataString = "";
                for (var i = 0; i < fileData.length; i++) {
                  dataString += String.fromCharCode(fileData[i]);
                }
                return dataString;
            }
            let dataTotal = utf8.slice(48 + Number(uint8Array(idLength)));//剩余的部分为图片信息
            if(utf8[35] == 1){      //接收插入图片
                let utf8Blob = URL.createObjectURL(new Blob([dataTotal], { type: 'image/jpeg' }));
                for(let i of wm.pagesArr[wm.pageIndex].brushArr){
                    if(i.globalId == Uint8ArrayToString(globalID)){
                        i.mOriginBound = {
                            left: i.mLocation.x,
                            right: i.mLocation.x + i.mDstRect.right,
                            top: i.mLocation.y,
                            bottom: i.mLocation.y + i.mDstRect.bottom,
                        };
                        i.mBound = {
                            left: i.mLocation.x,
                            right: i.mLocation.x + i.mDstRect.right,
                            top: i.mLocation.y,
                            bottom: i.mLocation.y + i.mDstRect.bottom,
                        };
                        let image = new Image();
                        image.src = utf8Blob;
                        i.srcUrl = image;
                        image.onload = function(){
                            startDraw(ctx,i);
                        }
                    }
                }
            }else if(utf8[35] == 3){    //加入房间接收信息
                getUserList();
                let uint8 = new Uint8Array(g.currentTarget.result);
                uint8 = uint8.slice(48 + Number(uint8Array(idLength)));
                let new_zip = new JSZip();
                new_zip.loadAsync(uint8).then(function(msg) {
                    log(msg);
                    msg.file('work/data/whiteboard.lwfx').async('string').then(function(data){
                        data = JSON.parse(data);
                        log(data);
                        wm.pagesArr = [];
                        wm.pageIndex = data.currentPageIndex;
                        for(let k of data.pageList){
                            let stepArrs = [];
                            for(let i = 0;i < k.doodleData.stepData.length; i++){   //获取步骤全局ID
                                idsMap.clear();
                                let stepObj = [];
                                for(let j of k.doodleData.stepData[i].ids){
                                    idsMap.set(j,1);
                                }
                                for(let j of k.doodleData.indexData){
                                    if(j&&j.globalId){
                                        if(idsMap.has(j.id)){
                                            stepObj.push(j.globalId);
                                        }
                                    }
                                }
                                stepArrs.push(stepObj);
                            }
                            let pageObj = {
                                brushTotalArr: k.doodleData.indexData,	//总数据记录
                                brushArr: [],		//当前数据记录
                                bgColor: k.doodleState.bgColor,
                                bgGrid: k.doodleState.bgGrid,
                                backImageShow: k.doodleState.bgGrid == 7?true:false,
                                stepArr: JSON.parse(JSON.stringify(stepArrs)),       	//步骤总记录
                                currentStep: JSON.parse(JSON.stringify(stepArrs[k.doodleData.currentStep])),   	//当前展示步骤
                                stepInx: k.doodleData.currentStep,        	//当前步骤索引
                                canvasGlobal: JSON.parse(JSON.stringify(wm.canvasGlobal)),	//当前页面数据
                            }
                            wm.initScale(pageObj);    //初始化页面缩放
                            for(let i of pageObj.currentStep){  //获取当前渲染数据
                                for(let j of k.doodleData.indexData){
                                    if(j){
                                        if(i == j.globalId){
                                            pageObj.brushArr.push(j);
                                        }
                                    };
                                }
                            }
                            pageObj.canvasGlobal.scale = k.doodleState.scale;
                            pageObj.canvasGlobal.transX = k.doodleState.transX;
                            pageObj.canvasGlobal.transY = k.doodleState.transY;
                            pageObj.canvasGlobal.scales = k.doodleState.scale;
                            pageObj.canvasGlobal.transXs = k.doodleState.transX;
                            pageObj.canvasGlobal.transYs = k.doodleState.transY;
                            wm.pagesArr.push(pageObj);
                        }
                        thatData.backColor = wm.pagesArr[wm.pageIndex].bgColor?wm.pagesArr[wm.pageIndex].bgColor:'#515355';
                        thatData.backImage = wm.pagesArr[wm.pageIndex].bgGrid?'url("src/back/' + wm.pagesArr[wm.pageIndex].bgGrid + '.png")':'';
                        thatData.backImageShow = wm.pagesArr[wm.pageIndex].backImageShow;
                        //画笔总数据同步
                        // for(let i of pageListJson.doodleData.indexData){
                        //     if(i){
                        //         wm.brushTotalArr.push(i);
                        //     }
                        // }
                        initCanvas();      //初始化画布属性
                        canvasAddEvent();  //初始绑定画布绘制对象
                        ctx.clearRect(0,0,wm.pagesArr[wm.pageIndex].canvasGlobal.width,wm.pagesArr[wm.pageIndex].canvasGlobal.height);

                        //获取图片srcURL资源
                        let pageSrcInx = 0;
                        for(let i of  wm.pagesArr){
                            pageSrcInx++;
                            for(let j of i.brushTotalArr){
                                if(j&&j.type == 17){
                                    ajax({
                                        type: 'get',
                                        url: 'src/3d/' + j.fileName,
                                        success: function(svgFile){
                                            //svgFile = svgFile.substring(svgFile.lastIndexOf("<svg"),svgFile.length);
                                            d('h2').innerHTML = svgFile;
                                            //log(j.fileName);
                                            let title = d('h2').children[0].children[0].innerHTML;
                                            //log(d('base-color').s0tyle.fill);
                                            //log(d('outline'));
                                            if(title == '圆锥-Blue'){
                                                d('base-color').style.fill = j.graphicColorStr;
                                                d('outline').style.stroke = j.outlineColorStr;
                                            }else if(title == '圆台-Blue'){
                                                d('base-color').style.fill = j.graphicColorStr;
                                                d('routes').style.stroke = j.outlineColorStr;
                                                d('route').style.stroke = j.outlineColorStr;
                                                d('border').style.stroke = j.outlineColorStr;
                                            }else{
                                                d('base-color').style.fill = j.graphicColorStr;
                                                d('outline').style.fill = j.outlineColorStr;
                                            }
                                            //log(d('h2').innerHTML);
                                            let blob = new Blob([d('h2').innerHTML], {type: 'image/svg+xml'});
                                            //生成 url
                                            let url = URL.createObjectURL(blob);
                                            let image = new Image();
                                            image.src = url;
                                            j.srcUrl = image;
                                            image.onload = function(){
                                                for(let k of wm.pagesArr[wm.pageIndex].brushArr){
                                                    if(k.globalId == j.globalId){
                                                        startDraw(ctx,j);
                                                    }
                                                }
                                            }
                                        }
                                    })
                                    // let image = new Image();
                                    // image.src = 'src/3d/' + j.fileName;
                                    // j.srcUrl = image;
                                    // // for(let k of wm.pagesArr[wm.pageIndex].brushArr){
                                    // //     if(k.globalId == j.globalId){
                                    // //         k.srcUrl = image;
                                    // //     }
                                    // // }
                                    // image.onload = function(){
                                    //     for(let k of wm.pagesArr[wm.pageIndex].brushArr){
                                    //         if(k.globalId == j.globalId){
                                    //             startDraw(ctx,j);
                                    //         }
                                    //     }
                                    // }
                                }else if(j&&(j.type == 21||j.type == 14)){
                                    j.mOriginBound = {
                                        left: j.mLocation.x,
                                        right: j.mLocation.x + j.mDstRect.right,
                                        top: j.mLocation.y,
                                        bottom: j.mLocation.y + j.mDstRect.bottom,
                                    };
                                    j.mBound = {};
                                    try{    //如果获取图片报错，将直接跳过获取图片逻辑
                                        msg.file('work/page'+ [pageSrcInx] +'/file/'+j.id+'.png').async('uint8array').then(function(datas){
                                            let utf8Blob = URL.createObjectURL(new Blob([datas], { type: 'image/jpeg' }));
                                            let image = new Image();
                                            image.src = utf8Blob;
                                            j.srcUrl = image;
                                            // for(let k of wm.pagesArr[wm.pageIndex].brushArr){
                                            //     if(k.globalId == j.globalId){
                                            //         k.srcUrl = image;
                                            //     }
                                            // }
                                            image.onload = function(){
                                                for(let k of wm.pagesArr[wm.pageIndex].brushArr){
                                                    if(k.globalId == j.globalId){
                                                        startDraw(ctx,j);
                                                    }
                                                }
                                            }
                                        });
                                        wm.calculateBound(j);
                                    }catch{
                                        wm.calculateBound(j);
                                    }
                                }
                                if((j&&(j.className == 'DoodleBitmap' || j.className == 'DoodleMindBitmap'))){
                                    j.mBaseScale = j.mScale;
                                }
                            }
                        }
                        for(let i of wm.pagesArr[wm.pageIndex].brushArr){
                            if(i.type == 19&&i.lineType == 1){
                                PROTRACTOR(i);
                                function PROTRACTOR(e){
                                    //let cos =  Math.cos((Math.atan2((e.pointFList[0].y-e.pivotY),(e.pointFList[0].x - e.pivotX))-Math.atan2((e.pointFList[1].y-e.pivotY),e.pointFList[1].x - e.pivotX))/2);
                                    let DISTANCE = 100;
                                    e.xy = {}
                                    e.xy.x = e.pivotX+e.cos*DISTANCE;
                                    e.xy.y = getCircleY(e.xy.x,1);
                                    ctx.font = "16px";//设置字体大小和字体，这一步很重要，直接影响了测量结果，因为14px和16px的字体的宽度是不一样的
                                    let metrics = ctx.measureText(e.text);
                                    let width = metrics.width;
                                    let height = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
                                    e.xy.x = e.xy.x - width/2;
                                    e.xy.y = e.xy.y + height/2;
        
                                    function getCircleY(moveX, shaft){
                                        let y;
                                        if (shaft == 1||shaft == 2){
                                            y =  -(Math.sqrt(( DISTANCE*DISTANCE-(moveX-e.pivotX)* (moveX-e.pivotX)))) + e.pivotY;
                                        }else {
                                            y =  (Math.sqrt(( DISTANCE*DISTANCE-(moveX-e.pivotX)* (moveX-e.pivotX)))) + e.pivotY;
                                        }
                                        return y;
                                    }
                                }
                            }
                            startDraw(ctx,i);
                        }
                        syncEnd = true;
                        for(let i of syncArr){
                            dataRender(i);
                        }
                        thatData.joinShow = false;
                        thatData.joinText = '';
                        thatData.stickerShow = true;
                        thatData.stickerImage = 'src/success.png';
                        thatData.stickerText = dataObj.main.stickerSuccess;
                        setTimeout(function(){
                            thatData.stickerShow = false;
                            thatData.usingShow = true;
                        },1500);
                    })
                });
                // zip.loadAsync(dataZip).then(function (msg) {
                //     log(msg.files);
                //     msg.files[Object.keys(msg.files)['111']].async("string").then(res=>{
                //         log(res);
                //     })
                // });
                // JSZip.loadAsync(dataZip).then(function (msg) {
                //     msg.files[Object.keys(msg.files)[0]].async("string").then(res=>{
                //         log(res);
                //     })
                // });
                // let render =  new FileReader();
                // render.readAsText(,'utf-8');
                // render.onload = function(){
                //     log(render.result);
                // }
            }
        }
        return;
    }else{
        data = data.data?JSON.parse(data.data):null;
    }
    if(!data){return;};
    if(data.body){
        if(data.body.code === 10400){
            thatData.joinShow = false;
            thatData.reconnectShow = true;
        }
    }
    if(data.header.command !== 'heartAck'){
        log(data);
        if(syncEnd){
            dataRender(data);
        }else{
            syncArr.push(data);
        }
    }
}

let isMove = false; //是否接受移动
function dataRender(data){
    let needAck = true;
    if(data.header.opId){
        if(needAckMap.has(data.header.opId)){
            return false;
        }else{
            needAckMap.set(data.header.opId,1);
            if (needAckMap.size > 10) {
                // 获取Map中第一个键值对的键
                const firstKey = needAckMap.keys().next().value;
                // 删除第一个键值对
                needAckMap.delete(firstKey);
            }
        }
    }
    switch(data.header.command){
        case 'opDoodle':
            switch(data.body.type){
                case 1: //涂鸦添加一组数据
                    for(let i of data.body.data){
                        wm.pagesArr[wm.pageIndex].brushArr.push(i);
                        wm.pagesArr[wm.pageIndex].brushTotalArr.push(i);
                        if(i.type == 19&&i.lineType == 1){
                            PROTRACTOR(i);
                            function PROTRACTOR(e){
                                //let cos =  Math.cos((Math.atan2((e.pointFList[0].y-e.pivotY),(e.pointFList[0].x - e.pivotX))-Math.atan2((e.pointFList[1].y-e.pivotY),e.pointFList[1].x - e.pivotX))/2);
                                let DISTANCE = 100;
                                e.xy = {}
                                e.xy.x = e.pivotX+e.cos*DISTANCE;
                                e.xy.y = getCircleY(e.xy.x,1);
                                ctx.font = "16px";//设置字体大小和字体，这一步很重要，直接影响了测量结果，因为14px和16px的字体的宽度是不一样的
                                let metrics = ctx.measureText(e.text);
                                let width = metrics.width;
                                let height = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
                                e.xy.x = e.xy.x - width/2;
                                e.xy.y = e.xy.y + height/2;
    
                                function getCircleY(moveX, shaft){
                                    let y;
                                    if (shaft == 1||shaft == 2){
                                        y =  -(Math.sqrt(( DISTANCE*DISTANCE-(moveX-e.pivotX)* (moveX-e.pivotX)))) + e.pivotY;
                                    }else {
                                        y =  (Math.sqrt(( DISTANCE*DISTANCE-(moveX-e.pivotX)* (moveX-e.pivotX)))) + e.pivotY;
                                    }
                                    return y;
                                }
                            }
                        }
                        // if(i.type == 0){
                        //     log(i.mText = i.mText.replace(/\n/g, "<br>"));
                        // }
                        if(i.type == 17){
                            let image = new Image();
                            image.src = 'src/3d/' + i.fileName;
                            i.srcUrl = image;
                            image.onload = function(){
                                startDraw(ctx,i);
                                wm.pagesArr[wm.pageIndex].currentStep.push(i.globalId);
                            }
                        }else{
                            for(let j = 0; j < actualTimeArr.length; j++){
                                if(i.globalId == j.globalId){
                                    actualTimeArr[j].splice(j,1);
                                }
                            }
                            //actualTimeArr.length;
                            //drawMove(ctxa);
                            wm.pagesArr[wm.pageIndex].currentStep.push(i.globalId);
                            startDraw(ctx,i);
                        }
                        // for(let j = actualTimeArr.length - 1; j >=0 ; j--){
                        //     if(i.globalId == actualTimeArr[j].globalId){
                        //         actualTimeArr.splice(j,1);
                        //     }
                        // }
                    }
                    addStep();
                    break;
                case 2: //涂鸦删除一组数据
                    idsMap.clear();
                    for(let i of data.body.ids){
                        idsMap.set(i,1);
                    }
                    for(let i = wm.pagesArr[wm.pageIndex].brushArr.length - 1; i >= 0; i--){
                        if(idsMap.has(wm.pagesArr[wm.pageIndex].brushArr[i].globalId)){
                            wm.pagesArr[wm.pageIndex].brushArr.splice(i,1);
                            wm.pagesArr[wm.pageIndex].currentStep.splice(i,1);
                        };
                    }
                    // for(let i = selectArr.length - 1; i >= 0; i--){
                    //     if(idsMap.has(selectArr[i].globalId)){
                    //         selectArr.splice(i,1);
                    //         for(let j = 0; j < wm.pagesArr[wm.pageIndex].currentStep.length; j++){
                    //             if(wm.pagesArr[wm.pageIndex].currentStep[j].globalId == selectArr[i].globalId){
                    //                 wm.pagesArr[wm.pageIndex].currentStep.splice(j,1);
                    //             }
                    //         }
                    //     };
                    // }
                    addStep();
                    ctx.clearRect(0,0,wm.pagesArr[wm.pageIndex].canvasGlobal.width,wm.pagesArr[wm.pageIndex].canvasGlobal.height);
                    for(let i of wm.pagesArr[wm.pageIndex].brushArr){
                        startDraw(ctx,i);
                    }
                    break;
                case 3: //涂鸦移动一组数据
                    if(data.body.data.moveState == 1){
                        needAck = false;
                    }
                    if(data.body.data.moveState == 0){
                        isMove = true;
                        idsMap.clear();
                        for(let i of data.body.ids){
                            idsMap.set(i,1);
                        }
                        initX = data.body.data.toX;
                        initY = data.body.data.toY;
                        for(let i of wm.pagesArr[wm.pageIndex].brushArr){
                            if(idsMap.has(i.globalId)){
                                i.mLocation.ox = i.mLocation.x;
                                i.mLocation.oy = i.mLocation.y;
                                i.mPivotOx = i.mPivotX;
                                i.mPivotOy = i.mPivotY;
                                if(!isNaN(i.pivotX)&&!isNaN(i.pivotY)){
                                    i.pivotOx = i.pivotX;
                                    i.pivotOy = i.pivotY;
                                }
                                if(!isNaN(i.locationX)&&!isNaN(i.locationY)){
                                    i.locationOx = i.locationX;
                                    i.locationOy = i.locationY;
                                }
                                if(i.xy){
                                    i.xy.ox = i.xy.x;
                                    i.xy.oy = i.xy.y;
                                }
                                if(i.mOriginBound){
                                    i.mOriginBoundO = i.mOriginBound;
                                }
                            }
                        }
                        for(let i of selectArr){
                            if(idsMap.has(i.globalId)){
                                i.mLocation.ox = i.mLocation.x;
                                i.mLocation.oy = i.mLocation.y;
                                i.mPivotOx = i.mPivotX;
                                i.mPivotOy = i.mPivotY;
                                if(!isNaN(i.pivotX)&&!isNaN(i.pivotY)){
                                    i.pivotOx = i.pivotX;
                                    i.pivotOy = i.pivotY;
                                }
                                if(!isNaN(i.locationX)&&!isNaN(i.locationY)){
                                    i.locationOx = i.locationX;
                                    i.locationOy = i.locationY;
                                }
                                if(i.xy){
                                    i.xy.ox = i.xy.x;
                                    i.xy.oy = i.xy.y;
                                }
                                if(i.mOriginBound){
                                    i.mOriginBoundO = i.mOriginBound;
                                }
                            }
                        }
                    }
                    if(isMove){
                        ctx.clearRect(0,0,wm.pagesArr[wm.pageIndex].canvasGlobal.width,wm.pagesArr[wm.pageIndex].canvasGlobal.height);
                        for(let i of wm.pagesArr[wm.pageIndex].brushArr){
                            if(idsMap.has(i.globalId)){
                                if(!i.mOriginBoundO){
                                    i.mOriginBoundO = i.mOriginBound;
                                }
                                //log(idsMap.get(i.globalId).data,initX,initY);
                                i.mLocation.x = i.mLocation.ox + data.body.data.toX - initX;
                                i.mLocation.y = i.mLocation.oy + data.body.data.toY - initY;
                                i.mPivotX = i.mPivotOx + data.body.data.toX - initX;
                                i.mPivotY = i.mPivotOy + data.body.data.toY - initY;
                                if(!isNaN(i.pivotX)&&!isNaN(i.pivotY)){
                                    i.pivotX = i.pivotOx + data.body.data.toX - initX;
                                    i.pivotY = i.pivotOy + data.body.data.toY - initY;
                                }
                                if(!isNaN(i.locationX)&&!isNaN(i.locationY)){
                                    i.locationX = i.locationOx + data.body.data.toX - initX;
                                    i.locationY = i.locationOy + data.body.data.toY - initY;
                                }
                                if(i.xy){
                                    i.xy.x = i.xy.ox + data.body.data.toX - initX;
                                    i.xy.y = i.xy.oy + data.body.data.toY - initY;
                                }
                                if(i.mOriginBound){
                                    i.mOriginBound.left = i.mOriginBoundO.left + data.body.data.toX - initX;
                                    i.mOriginBound.right = i.mOriginBoundO.right + data.body.data.toX - initX;
                                    i.mOriginBound.top = i.mOriginBoundO.top + data.body.data.toY - initY;
                                    i.mOriginBound.bottom = i.mOriginBoundO.bottom + data.body.data.toY - initY;
                                    wm.calculateBound(i);
                                }
                            }
                            startDraw(ctx,i);
                        }
                        if(selectArr.length > 0){
                            for(let i of selectArr){
                                if(idsMap.has(i.globalId)){
                                    if(!i.mOriginBoundO){
                                        i.mOriginBoundO = i.mOriginBound;
                                    }
                                    //log(idsMap.get(i.globalId),initX,initY);
                                    i.mLocation.x = i.mLocation.ox + data.body.data.toX - initX;
                                    i.mLocation.y = i.mLocation.oy + data.body.data.toY - initY;
                                    i.mPivotX = i.mPivotOx + data.body.data.toX - initX;
                                    i.mPivotY = i.mPivotOy + data.body.data.toY - initY;
                                    if(!isNaN(i.pivotX)&&!isNaN(i.pivotY)){
                                        i.pivotX = i.pivotOx + data.body.data.toX - initX;
                                        i.pivotY = i.pivotOy + data.body.data.toY - initY;
                                    }
                                    if(!isNaN(i.locationX)&&!isNaN(i.locationY)){
                                        i.locationX = i.locationOx + data.body.data.toX - initX;
                                        i.locationY = i.locationOy + data.body.data.toY - initY;
                                    }
                                    if(i.xy){
                                        i.xy.x = i.xy.ox + data.body.data.toX - initX;
                                        i.xy.y = i.xy.oy + data.body.data.toY - initY;
                                    }
                                    if(i.mOriginBound){
                                        i.mOriginBound.left = i.mOriginBoundO.left + data.body.data.toX - initX;
                                        i.mOriginBound.right = i.mOriginBoundO.right + data.body.data.toX - initX;
                                        i.mOriginBound.top = i.mOriginBoundO.top + data.body.data.toY - initY;
                                        i.mOriginBound.bottom = i.mOriginBoundO.bottom + data.body.data.toY - initY;
                                        wm.calculateBound(i);
                                    }
                                }
                            }
                            circReset(selectArr,false,7);
                        }
                    }
                    if(data.body.data.moveState == 2){
                        isMove = false;
                    }
                    break;
                case 4: //涂鸦颜色变更
                    idsMap.clear();
                    for(let i of data.body.ids){
                        idsMap.set(i,data.body.data);
                    }
                    for(let i of wm.pagesArr[wm.pageIndex].brushArr){
                        if(idsMap.has(i.globalId)){
                            if(i.type == 18){
                                if(idsMap.get(i.globalId).colorModule == 2){
                                    i.solidColor = idsMap.get(i.globalId).color;
                                }else if(idsMap.get(i.globalId).colorModule == 3){
                                    i.boardColor = idsMap.get(i.globalId).color;
                                }
                            }else if(i.type == 17){
                                ajax({
                                    type: 'get',
                                    url: 'src/3d/' + i.fileName,
                                    success: function(svgFile){
                                        d('h2').innerHTML = svgFile;
                                        let title = d('h2').children[0].children[0].innerHTML;
                                        if(idsMap.get(i.globalId).colorModule == 2){
                                            i.graphicColorStr = parseHex(idsMap.get(i.globalId).color);
                                        }else if(idsMap.get(i.globalId).colorModule == 3){
                                            i.outlineColorStr = parseHex(idsMap.get(i.globalId).color);
                                        }
                                        if(title == '圆锥-Blue'){
                                            d('base-color').style.fill = i.graphicColorStr;
                                            d('outline').style.stroke = i.outlineColorStr;
                                        }else if(title == '圆台-Blue'){
                                            d('base-color').style.fill = i.graphicColorStr;
                                            d('routes').style.stroke = i.outlineColorStr;
                                            d('route').style.stroke = i.outlineColorStr;
                                            d('border').style.stroke = i.outlineColorStr;
                                        }else{
                                            d('base-color').style.fill = i.graphicColorStr;
                                            d('outline').style.fill = i.outlineColorStr;
                                        }
                                        let blob = new Blob([d('h2').innerHTML], {type: 'image/svg+xml'});
                                        //生成 url
                                        let url = URL.createObjectURL(blob);
                                        let image = new Image();
                                        image.src = url;
                                        i.srcUrl = image;
                                        image.onload = function(){
                                            for(let k of wm.pagesArr[wm.pageIndex].brushArr){
                                                if(k.globalId == i.globalId){
                                                    startDraw(ctx,i);
                                                }
                                            }
                                        }
                                    }
                                })
                            }else{
                                i.mColor.mColor = idsMap.get(i.globalId).color;
                            }
                        }
                        startDraw(ctx,i);
                    }
                    if(selectArr.length > 0){
                        for(let i of selectArr){
                            if(idsMap.has(i.globalId)){
                                i.mColor.mColor = idsMap.get(i.globalId).color;
                            }
                        }
                        circReset(selectArr,false,8);
                    }
                    break;
                case 5: //涂鸦旋转一组数据
                    idsMap.clear();
                    for(let i of data.body.ids){
                        idsMap.set(i,data.body.data);
                    }
                    ctx.clearRect(0,0,wm.pagesArr[wm.pageIndex].canvasGlobal.width,wm.pagesArr[wm.pageIndex].canvasGlobal.height);
                    for(let i of wm.pagesArr[wm.pageIndex].brushArr){
                        if(idsMap.has(i.globalId)){
                            wm.setItemRotate(i,idsMap.get(i.globalId),1); 
                        }
                        startDraw(ctx,i);
                    }
                    if(selectArr.length > 0){
                        for(let i of selectArr){
                            if(idsMap.has(i.globalId)){
                                wm.setItemRotate(i,idsMap.get(i.globalId),1);
                            }
                        }
                        circReset(selectArr,false,9);
                    }
                    break;
                case 6: //涂鸦缩放
                    idsMap.clear();
                    for(let i of data.body.ids){
                        idsMap.set(i,data.body.data);
                    }
                    ctx.clearRect(0,0,wm.pagesArr[wm.pageIndex].canvasGlobal.width,wm.pagesArr[wm.pageIndex].canvasGlobal.height);
                    for(let i of wm.pagesArr[wm.pageIndex].brushArr){
                        if(idsMap.has(i.globalId)){
                            wm.setItemRotate(i,idsMap.get(i.globalId),2);
                        }
                        startDraw(ctx,i);
                    }

                    if(selectArr.length > 0){
                        for(let i of selectArr){
                            if(idsMap.has(i.globalId)){
                                wm.setItemRotate(i,idsMap.get(i.globalId),2);
                            }
                        }
                        circReset(selectArr,false,10);
                    }
                    break;
                case 7: //涂鸦反转
                    idsMap.clear();
                    for(let i of data.body.ids){
                        idsMap.set(i,data.body.data);
                    }
                    ctx.clearRect(0,0,wm.pagesArr[wm.pageIndex].canvasGlobal.width,wm.pagesArr[wm.pageIndex].canvasGlobal.height);
                    for(let i of wm.pagesArr[wm.pageIndex].brushArr){
                        if(idsMap.has(i.globalId)){
                            wm.setItemRotate(i,idsMap.get(i.globalId),3);
                        }
                        startDraw(ctx,i);
                    }
                    if(selectArr.length > 0){
                        for(let i of selectArr){
                            if(idsMap.has(i.globalId)){
                                wm.setItemRotate(i,idsMap.get(i.globalId),3);
                            }
                        }
                        circReset(selectArr,false,11);
                    }
                    break;
                case 8: //替换（板擦擦除）
                    thatData.joinShow = false;
                    idsMap.clear();
                    for(let i of data.body.ids){
                        idsMap.set(i,data.body.data);
                    }
                    ctxd.clearRect(0,0,wm.pagesArr[wm.pageIndex].canvasGlobal.width,wm.pagesArr[wm.pageIndex].canvasGlobal.height);
                    ctx.clearRect(0,0,wm.pagesArr[wm.pageIndex].canvasGlobal.width,wm.pagesArr[wm.pageIndex].canvasGlobal.height);
                    for(let i = wm.pagesArr[wm.pageIndex].brushArr.length - 1; i >= 0; i--){
                        if(idsMap.has(wm.pagesArr[wm.pageIndex].brushArr[i].globalId)){
                            wm.pagesArr[wm.pageIndex].brushArr.splice(i,1);
                            wm.pagesArr[wm.pageIndex].currentStep.splice(i,1);
                        };
                    }
                    for(let i of data.body.data){
                        wm.pagesArr[wm.pageIndex].brushArr.push(i);
                        wm.pagesArr[wm.pageIndex].brushTotalArr.push(i);
                        wm.pagesArr[wm.pageIndex].currentStep.push(i.globalId);
                    }
                    addStep();
                    for(let i of wm.pagesArr[wm.pageIndex].brushArr){
                        startDraw(ctx,i);
                    }
                    break;
                case 9: //回溯（进一步与退一步）
                    moveStep(data.body.data.step);
                    break;
                case 10:   //复制
                    let selectArrCopy = [];
                    for(let i of data.body.ids){
                        for(let j of wm.pagesArr[wm.pageIndex].brushTotalArr){
                            if(j){
                                if(j.globalId == i){
                                    selectArrCopy.push(j);
                                }
                            }
                        }
                    }
                    for(let i = 0; i < selectArrCopy.length; i++){
                        let selectArrObj = JSON.parse(JSON.stringify(selectArrCopy[i]));
                        selectArrObj.id = -1;
                        selectArrObj.selected = 0;
                        selectArrObj.globalId = data.body.data.ids[i];
                        selectArrObj.mLocation.x += selectObject.offset;
                        selectArrObj.mLocation.y += selectObject.offset;
                        selectArrObj.mPivotX += selectObject.offset;
                        selectArrObj.mPivotY += selectObject.offset;
                        if(!isNaN(selectArrObj.pivotX)&&!isNaN(selectArrObj.pivotY)){
                            selectArrObj.pivotX += selectObject.offset;
                            selectArrObj.pivotY += selectObject.offset;
                        }
                        if(!isNaN(selectArrObj.locationX)&&!isNaN(selectArrObj.locationY)){
                            selectArrObj.locationX += selectObject.offset;
                            selectArrObj.locationY += selectObject.offset;
                        }
                        if(selectArrObj.xy){
                            selectArrObj.xy.x += selectObject.offset;
                            selectArrObj.xy.y += selectObject.offset;
                        }
                        if(selectArrObj.mOriginBound){
                            selectArrObj.mOriginBound.left += selectObject.offset;
                            selectArrObj.mOriginBound.right += selectObject.offset;
                            selectArrObj.mOriginBound.top += selectObject.offset;
                            selectArrObj.mOriginBound.bottom += selectObject.offset;
                            wm.calculateBound(selectArrObj);
                        }
                        if(selectArrCopy[i].srcUrl){
                            selectArrObj.srcUrl = selectArrCopy[i].srcUrl;
                        }
                        wm.pagesArr[wm.pageIndex].brushArr.push(selectArrObj);
                        wm.pagesArr[wm.pageIndex].brushTotalArr.push(selectArrObj);
                        wm.pagesArr[wm.pageIndex].currentStep.push(selectArrObj.globalId);
                    }
                    addStep();
                    ctx.clearRect(0,0,wm.pagesArr[wm.pageIndex].canvasGlobal.width,wm.pagesArr[wm.pageIndex].canvasGlobal.height);
                    for(let i of wm.pagesArr[wm.pageIndex].brushArr){
                        startDraw(ctx,i);
                    }
                    break;
                default:
                    break;
            }
            if(data.body.type == 3||data.body.type == 5||data.body.type == 6||data.body.type == 7||data.body.type == 10||data.body.type == 4){ //操作指针显示
                //handShow(data.header.fromUserId,data.header.fromUserName,data.header.fromDeviceType,wm.backScaleTransform(data.body.x) + wm.pagesArr[wm.pageIndex].canvasGlobal.repairLeft,wm.backScaleTransform(data.body.y) + wm.pagesArr[wm.pageIndex].canvasGlobal.repairTop);
                handShow(data.header.fromUserId,data.header.fromUserName,data.header.fromDeviceType,wm.backScaleTransform(data.body.x) + wm.backScaleTransform(wm.pagesArr[wm.pageIndex].canvasGlobal.transX / wm.pagesArr[wm.pageIndex].canvasGlobal.scale) + wm.pagesArr[wm.pageIndex].canvasGlobal.repairLeft,wm.backScaleTransform(data.body.y) + wm.backScaleTransform(wm.pagesArr[wm.pageIndex].canvasGlobal.transY / wm.pagesArr[wm.pageIndex].canvasGlobal.scale) + wm.pagesArr[wm.pageIndex].canvasGlobal.repairTop);
            }
            break;
        case 'updateData':  //圈选取消更新数据
            log('我接收到数据更新了');
            let opTime = data.header.opTime;
            if (data.body.data != null){
                for (let item of data.body.data){
                    if (item == null){
                        continue;
                    }
                    let iDoodleItem = opcacheArr.get(item.globalId);
                    if (iDoodleItem != null){
                        log("可能出现冲突");
                        if (iDoodleItem.updateTime<opTime){
                            log("时间不对，更新数据！");
                            replaceAttribute(iDoodleItem,item);
                            iDoodleItem.updateTime = opTime;
                            circReset(selectArr,false,1);
                            ctx.clearRect(0,0,wm.pagesArr[wm.pageIndex].canvasGlobal.width,wm.pagesArr[wm.pageIndex].canvasGlobal.height);
                            for(let i of wm.pagesArr[wm.pageIndex].brushArr){
                                startDraw(ctx,i);
                            }
                        }else {
                            log("时间是有序的");
                        }
                    }else {
                        log("没有冲突");
                    }
                    let idsMapClear = new Map();
                    for(let i of selectArr){
                        idsMapClear.set(i.globalId,i);
                    }
                    for(let i of wm.pagesArr[wm.pageIndex].brushArr){
                        idsMapClear.set(i.globalId,i);
                    }
                    if(idsMapClear.has(item.globalId)){
                        let idsMapSelect = idsMapClear.get(item.globalId);
                        idsMapSelect.updateTime = data.header.opTime;
                        opcacheArr.set(idsMapSelect.globalId,idsMapSelect);
                    }
                    if(opcacheArr.size > 300){
                        let keysToDelete = Array.from(opcacheArr.keys()).slice(0, opcacheArr.size - 300);
                        keysToDelete.forEach(key => opcacheArr.delete(key));
                    }
                }
            }
            break;
        case 'canvasClear': //清空画布
            //wm.pagesArr[]
            wm.pagesArr[wm.pageIndex].brushArr = [];
            selectArr = [];
            wm.pagesArr[wm.pageIndex].currentStep = [];
            addStep();
            thatData.circScaleRotateShow = false;
            thatData.circControllerShow = false;
            ctx.clearRect(0,0,wm.pagesArr[wm.pageIndex].canvasGlobal.width,wm.pagesArr[wm.pageIndex].canvasGlobal.height);
            ctxc.clearRect(0,0,wm.pagesArr[wm.pageIndex].canvasGlobal.width,wm.pagesArr[wm.pageIndex].canvasGlobal.height);
            ctxa.clearRect(0,0,wm.pagesArr[wm.pageIndex].canvasGlobal.width,wm.pagesArr[wm.pageIndex].canvasGlobal.height);
            break;
        case 'canvasScale': //缩放or移动画布
            if(data.body.scale < 0.25){
                data.body.scale = 0.25;
            }
            if(data.body.scale > 4){
                data.body.scale = 4;
            }
            if(thatData.controllerLeftShow){
                wm.pagesArr[wm.pageIndex].canvasGlobal.scales = data.body.scale;
                wm.pagesArr[wm.pageIndex].canvasGlobal.transXs = data.body.transX;
                wm.pagesArr[wm.pageIndex].canvasGlobal.transYs = data.body.transY;
                wm.pagesArr[wm.pageIndex].canvasGlobal.scale = data.body.scale;
                wm.pagesArr[wm.pageIndex].canvasGlobal.transX = data.body.transX;
                wm.pagesArr[wm.pageIndex].canvasGlobal.transY = data.body.transY;
                ctx.clearRect(0,0,wm.pagesArr[wm.pageIndex].canvasGlobal.width,wm.pagesArr[wm.pageIndex].canvasGlobal.height);
                for(let i of wm.pagesArr[wm.pageIndex].brushArr){
                    startDraw(ctx,i);
                }
            }else{
                wm.pagesArr[wm.pageIndex].canvasGlobal.scales = data.body.scale;
                wm.pagesArr[wm.pageIndex].canvasGlobal.transXs = data.body.transX;
                wm.pagesArr[wm.pageIndex].canvasGlobal.transYs = data.body.transY;
            }
            break;
        case 'opPage': //切换页面
            for(let i of selectArr){
                wm.pagesArr[wm.pageIndex].brushArr.push(i);
            }
            selectArr = [];
            if(data.body.type == 1){    //切换页面
                wm.pageIndex = data.body.index;
                ctx.clearRect(0,0,wm.pagesArr[wm.pageIndex].canvasGlobal.width,wm.pagesArr[wm.pageIndex].canvasGlobal.height);
                ctxc.clearRect(0,0,wm.pagesArr[wm.pageIndex].canvasGlobal.width,wm.pagesArr[wm.pageIndex].canvasGlobal.height);
                for(let i of wm.pagesArr[wm.pageIndex].brushArr){  
                    startDraw(ctx,i);
                }
                //thatData.backColor = pageObj.bgColor;
                //thatData.backImage = 'url("src/back/'+pageObj.bgGrid+'.png")';
            }else if(data.body.type == 0){  //新建页面
                let pageObj = {
                    //bgColor: wm.pagesArr[0].bgColor,
                    //bgGrid: wm.pagesArr[0].bgGrid,
                    brushTotalArr: [],	//总数据记录
                    brushArr: [],		//当前数据记录
                    stepArr: [],       	//步骤总记录
                    currentStep: [],   	//当前展示步骤
                    stepInx: 0,        	//当前步骤索引
                    canvasGlobal: JSON.parse(JSON.stringify(wm.pagesArr[wm.pageIndex].initCanvasGlobal)),	//当前页面数据
                    initCanvasGlobal: JSON.parse(JSON.stringify(wm.pagesArr[wm.pageIndex].initCanvasGlobal)),
                }
                wm.pagesArr.push(pageObj);
                wm.pageIndex = wm.pagesArr.length - 1;
                ctx.clearRect(0,0,wm.pagesArr[wm.pageIndex].canvasGlobal.width,wm.pagesArr[wm.pageIndex].canvasGlobal.height);
                ctxc.clearRect(0,0,wm.pagesArr[wm.pageIndex].canvasGlobal.width,wm.pagesArr[wm.pageIndex].canvasGlobal.height);
                for(let i of wm.pagesArr[wm.pageIndex].brushArr){  
                    startDraw(ctx,i);
                }
            }else{  // == 2 删除页面
                wm.pagesArr.splice(data.body.index,1);
            }
            break;
        case 'updateBg':    //改换背景色与背景图
            thatData.backColor = data.body.bgColor;
            wm.pagesArr[wm.pageIndex].bgColor = data.body.bgColor;
            wm.pagesArr[wm.pageIndex].bgGrid = data.body.bgGrid;
            if(data.body.bgGrid !== 0){
                thatData.backImage = 'url("src/back/'+data.body.bgGrid+'.png")';
            }else{
                thatData.backImage = 'none';
            }
            break;
        case 'exitRoom': //房主退出了房间
            for(let i of thatData.devList){
                if(i.isLandlord == 1){
                    if(i.userId == data.header.fromUserId){
                        roomExit = false;
                        sessionStorage.userId = '';
                        thatData.stickerShow = true;
                        thatData.stickerImage = 'src/end.png';
                        thatData.stickerText = dataObj.main.stickerEnd;
                        setTimeout(function(){
                            window.location.href = 'index.html';
                        },2000)
                    }
                }
            }
            break;
        case 'offline': //房主异常退出房间
            if(roomExit){
                for(let i of thatData.devList){
                    if(i.isLandlord == 1){
                        if(i.userId == data.header.fromUserId){
                            thatData.joinShow = false;
                            thatData.reconnectShow = true;
                        }
                    }
                }
            }
            break;
        case 'updateRoomInfo':  //更新房间信息调用
            if(data.body.type == 0){    //更新房间名称
                thatData.infoTitle = data.body.content;
                sessionStorage.roomName = data.body.content;
            }else if(data.body.type == 1){  //更新房间密码
                thatData.roomPass = data.body.content;
                sessionStorage.roomPass = data.body.content;
                let roomIdArr = JSON.parse(localStorage.roomIdArr);
                for(let i of roomIdArr){
                    if(i.value == sessionStorage.roomId){
                        i.pass = data.body.content;
                    }
                }
                localStorage.roomIdArr = JSON.stringify(roomIdArr);
            }else if(data.body.type == 2){  //更新用户名称
                for(let i of thatData.devList){
                    if(i.userId == data.header.fromUserId){
                        i.userName = data.body.content;
                    }
                }
                thatData.devList = thatData.devList;
            }
            break;
        case 'bannedWrite': //主持人禁写
            if(data.body.type == 2){    //单体禁写
                for(let i of thatData.devList){
                    if(i.userId == data.body.toUserId){
                        i.enWrite = data.body.enable;
                        break;
                    }
                }
                if(data.body.toUserId == sessionStorage.userId){    //如果被禁写的是自己则更新自己书写状态
                    isWrite = data.body.enable;
                    if(data.body.enable){
                        for(let i of thatData.btnCenter){
                            if(i.image != 'src/controller/move.png'){
                                i.select = false;
                                i.disabled = false;
                            }
                        }
                        thatData.btnCenter = thatData.btnCenter;
                        thatData.tipsImage = 'src/succ.png';
                        thatData.tipsText = thatData.relieveWriting;
                    }else{
                        for(let i of thatData.btnCenter){
                            if(i.image != 'src/controller/move.png'){
                                i.disabled = true;
                            }
                        }
                        thatData.btnCenter = thatData.btnCenter;
                        thatData.tipsImage = 'src/waring.png';
                        thatData.tipsText = thatData.bannedWriting;
                    }
                    thatData.tipsShow = true;
                    setTimeout(function(){thatData.tipsShow = false;},1500);
                }
            }else if(data.body.type == 1){  //群体禁写
                for(let i = 1; i < thatData.devList.length; i++){
                    thatData.devList[i].enWrite = data.body.enable;
                }
                if(data.body.enable){
                    for(let i of thatData.btnCenter){
                        if(i.image != 'src/controller/move.png'){
                            i.select = false;
                            i.disabled = false;
                        }
                    }
                    thatData.btnCenter = thatData.btnCenter;
                    thatData.tipsImage = 'src/succ.png';
                    thatData.tipsText = thatData.relieveWritingAll;
                }else{
                    for(let i of thatData.btnCenter){
                        if(i.image != 'src/controller/move.png'){
                            i.disabled = true;
                        }
                    }
                    thatData.btnCenter = thatData.btnCenter;
                    thatData.tipsImage = 'src/waring.png';
                    thatData.tipsText = thatData.bannedWritingAll;
                }
                isWrite = data.body.enable;
                thatData.tipsShow = true;
                setTimeout(function(){thatData.tipsShow = false;},1500);
            }
            thatData.devList = thatData.devList;
            break;
        case 'bannedSpeak': //主持人禁语音
            if(data.body.type == 2){    //单体禁语音
                for(let i of thatData.devList){
                    if(i.userId == data.body.toUserId){
                        i.enSpeak = data.body.enable;
                        if(data.body.enable){
                            thatData.tipsImage = 'src/succ.png';
                            thatData.tipsText = thatData.relieveVoice;
                        }else{
                            thatData.tipsImage = 'src/waring.png';
                            thatData.tipsText = thatData.bannedVoice;
                        }
                        thatData.tipsShow = true;
                        setTimeout(function(){thatData.tipsShow = false;},1500);
                        break;
                    }
                }
            }else if(data.body.type == 1){  //群体禁语音
                for(let i = 1; i < thatData.devList.length; i++){
                    thatData.devList[i].enSpeak = data.body.enable;
                }
                if(data.body.enable){
                    thatData.tipsImage = 'src/succ.png';
                    thatData.tipsText = thatData.relieveVoiceAll;
                }else{
                    thatData.tipsImage = 'src/waring.png';
                    thatData.tipsText = thatData.bannedVoiceAll;
                }
                thatData.tipsShow = true;
                setTimeout(function(){thatData.tipsShow = false;},1500);
            }
            thatData.devList = thatData.devList;
            break;
        case 'joinRoom': //用户加入了房间
            getUserList();
            if(data.header.isHomeOwners){
                thatData.reconnectShow = false;
            }
            // for(let i of thatData.devList){
            //     if(i.userId == data.header.fromUserId){
            //         if(i.isLandlord == 1){
            //             thatData.reconnectShow = false;
            //         }
            //     }
            // }
            // switch(data.header.deviceType){   //设备类型判断
            //     case 0:
            //         i.user = 'src/dev/phone.png';
            //         break;
            //     case 2:
            //         i.user = 'src/dev/pc.png';
            //         break;
            //     case 3:
            //         i.user = 'src/dev/screen.png';
            //         break;
            //     default:
            //         break;
            // }
            // //判断用户是否为自己
            // if(i.userId == sessionStorage.userId){
            //     i.userEditShow = true;
            //     i.userText = '我';
            //     thatData.devList.splice(1,0,i);
            //     return;
            // }else{
            //     i.userEditShow = false;
            // }
            // if(i.isLandlord == 1){  //如果是主持人则显示为主持人
            //     i.userText = '(主持人)';
            //     i.user = 'src/dev/user.png';
            //     thatData.devList.unshift(i);
            //     return;
            // }
            // thatData.devList.push(i);
            break;
        default: 
            break;
    }
    if(needAck&&data.header.opId){
        let drawArrObjectAck = {};
        drawArrObjectAck.header = {    //传递信息header部分用户信息
            command: "ack",    //命令类型
            fromDeviceType: wm.isPhone()?0:2,  //设备类型(0手机、1平板、2电脑、3大屏)
            fromUserId: sessionStorage.userId, //用户ID
            fromUserName: sessionStorage.userName,   //用户名称
            isHomeOwners: false,    //是否创建者
            opId: data.header.opId,  //操作ID
        };
        try {
            ws.send(JSON.stringify(drawArrObjectAck));
        } catch (error) {
            ws.send(JSON.stringify(drawArrObjectAck));
        }
    }
}

function replaceAttribute(brushObj,item){//属性替换
    brushObj.mOriginLocation = item.mOriginLocation;
    brushObj.mLocation = item.mLocation;
    brushObj.mPivotX = item.mPivotX;
    brushObj.mPivotY = item.mPivotY;
    brushObj.mBaseScale = item.mBaseScale;
    brushObj.mColor = item.mColor;
    brushObj.mOverturnY = item.mOverturnY;
    brushObj.mOverturnX = item.mOverturnX;
    brushObj.mSize = item.mSize;
    brushObj.mItemRotate = item.mItemRotate;

    if(brushObj.className == 'DoodleText'){   //文本数据处理
        brushObj.mOriginBound = item.mOriginBound;
        brushObj.mBound = item.mBound;
        brushObj.mRect = item.mRect;
        brushObj.mTextSize = item.mTextSize;
    }
    if(brushObj.type == 15||brushObj.type == 34){   //笔画数据处理
        brushObj.mBound = item.mBound;
        brushObj.mOriginBound = item.mOriginBound;
    }
    if(brushObj.className == 'DoodleBitmap' || brushObj.className == 'DoodleMindBitmap'){  //图片数据处理
        brushObj.mBound = item.mBound;
        brushObj.mSrcRect = item.mSrcRect;
        brushObj.mDstRect = item.mDstRect;
        brushObj.mBaseScale = item.mScale;
        brushObj.mScale = item.mScale;
    }
}

//指针显示方法
function handShow(fromUserId,fromUserName,fromDeviceType,x,y){
    setTimeout(function(){
        handShowIs = true;
    },30)
    let handObj = {};
    // <div class="hand" wm-for="handArr" for-style="backgroundImage: image;left: left;top: top;">
    //     <span for-style="backgroundColor: color;" for-bind="text"></span>
    // </div>
    handObj.bool = false;
    for(let i of c('hand')){
        if(i.dataset.user == fromUserId){
            i.setAttribute('user','');
            i.style.display = 'none';
            handObj.oLeft = i.style.left;
            handObj.oTop = i.style.top;
            handObj.bool = true;
        };
    }
    let handDiv = create('div');
    let handSpan = create('span');
    handDiv.className = 'hand';
    handObj.text = fromUserName;
    handObj.left = x + 'px';
    handObj.top = y + 'px';
    if(parseInt(handObj.left) < 0){
        handObj.left = '0px';
    }else if(parseInt(handObj.left) > (window.innerWidth - 100)){
        handObj.left = window.innerWidth - 100 + 'px';
    }
    if(parseInt(handObj.top) < 0){
        handObj.top = '0px';
    }else if(parseInt(handObj.top) > (window.innerHeight - 44)){
        handObj.top = window.innerHeight - 44 + 'px';
    }
    handObj.userId = fromUserId;
    handDiv.setAttribute('data-user',handObj.userId);
    if(fromDeviceType == 3){
        let isLandlord = false;
        for(let i of thatData.devList){
            if(i.isLandlord == 1){
                if(i.userId == fromUserId){
                    isLandlord = true;
                }
            }
        }
        if(isLandlord){ //是主持人
            handObj.image = 'url("src/icon/hand/1.png")';
            handObj.color = '#F3AA53';
        }else{
            handObj.image = 'url("src/icon/hand/2.png")';
            handObj.color = '#5A9CE4';
        }
    }else if(fromDeviceType == 2){
        handObj.image = 'url("src/icon/hand/3.png")';
        handObj.color = '#9B7CF8';
    }else if(fromDeviceType == 0){
        handObj.image = 'url("src/icon/hand/4.png")';
        handObj.color = '#6C88F5';
    }
    // let handIsRepeat = true;
    // for(let i of thatData.handArr){
    //     if(i.userId == handObj.userId){
    //         handIsRepeat = false;
    //         i.left = handObj.left;
    //         i.top = handObj.top;
    //     }
    // }
    // if(handIsRepeat){
    //     thatData.handArr.push(handObj);
    // }
    //thatData.handArr = thatData.handArr;
    handSpan.innerHTML = handObj.text;
    handSpan.style.backgroundColor = handObj.color;
    handDiv.appendChild(handSpan);
    handDiv.style.backgroundImage = handObj.image;
    if(handObj.bool){
        handDiv.style.left = handObj.oLeft;
        handDiv.style.top = handObj.oTop;
    }
    n('body')[0].appendChild(handDiv);
    setTimeout(function(){
        handDiv.style.left = handObj.left;
        handDiv.style.top = handObj.top;
    })
    setTimeout(function(){
        n('body')[0].removeChild(handDiv);
    },3000);
}

//将颜色值转换为int数值
function intHex(string){
    let num = string.split('#')[1];
    num = Number('0x' + (num.substring(6,8) + num.substring(0,6)));
    if(num > Math.pow(2,8*4-1)){
        num =  num - Math.pow(2,8*4);
    }
    return num;
}

//将数字转换为颜色
function parseHex(val,length){   //val为数字,length为转换后的两位数
    length = length?length:4; 
	var num = parseInt(val);
	var hex_str = '';
	var hex_str_length = length*2;//1个字节=2个16进制字符
	var min = -1*Math.pow(2,8*length-1);
	var max = Math.pow(2,8*length-1)-1;
    if(num<min || num>max){//数字超出转换范围
        console.warn(`out of range,min is ${min},max is ${max},but val is ${num}.`)
    }else if(num<0){//传入合法负数
        //计算补码
        hex_str = (Math.pow(2,8*length)+num).toString(16);
        if(hex_str.length<hex_str_length){
            hex_str = 'f'.repeat(hex_str_length-hex_str.length)+ hex_str;
        }
    }else{//传入合法正数
        hex_str = num.toString(16);
        if(hex_str.length<hex_str_length){
            hex_str = '0'.repeat(hex_str_length-hex_str.length) + hex_str;
        }
    }
    hex_str = hex_str.substring(2) + hex_str.substring(0,2);
	return '#' + hex_str;
}

//缩放画布事件
let windowIsRemove = false;
window.ontouchstart = function(e){
    if(e.touches.length == 2){
        e.stopPropagation();
        let x1 = e.touches[0].clientX,x2 = e.touches[1].clientX,
        y1 = e.touches[0].clientY,y2 = e.touches[1].clientY,
        realScale = wm.pagesArr[wm.pageIndex].canvasGlobal.scale;
        let tx = x2-x1;
        let ty = y2-y1;
        windowIsRemove = true;
        thatData.maskShow = false;
        document.Add('touchmove',touchMove);
        document.Add('touchend',touchEnd);
        function touchMove(even){
            if(thatData.controllerLeftShow){
                thatData.controllerLeftShow = false;
            }
            let mx1 = even.touches[0].clientX,mx2 = even.touches[1].clientX,
            my1 = even.touches[0].clientY,my2 = even.touches[1].clientY;
            let ox = mx2 - mx1;
            let oy = my2 - my1;
            let oxTxScale = (((Math.abs(ox / tx) - 1) + (Math.abs(oy / ty) - 1))/2) + realScale;

            let eClientX = (wm.scaleTransRealform((mx2 + mx1)/2 - wm.pagesArr[wm.pageIndex].canvasGlobal.repairLeft) - wm.pagesArr[wm.pageIndex].canvasGlobal.transX) / wm.pagesArr[wm.pageIndex].canvasGlobal.scale;
            let eClientY = (wm.scaleTransRealform((my2 + my1)/2 - wm.pagesArr[wm.pageIndex].canvasGlobal.repairTop) - wm.pagesArr[wm.pageIndex].canvasGlobal.transY) / wm.pagesArr[wm.pageIndex].canvasGlobal.scale;
            if(oxTxScale > 0.25 && oxTxScale < 4){
                // if(window.innerWidth/wm.canvasGlobal.initWidth <= window.innerHeight/wm.canvasGlobal.initHeight){
                //     wm.canvasGlobal.repairTop = wm.canvasGlobal.initRepairTop / wm.canvasGlobal.initScale;
                // }else{
                //     wm.canvasGlobal.repairLeft = wm.canvasGlobal.initRepairLeft / wm.canvasGlobal.initScale;
                // }
                canvasScales(oxTxScale,eClientX ,eClientY);
                //wm.pagesArr[wm.pageIndex].canvasGlobal.scale = oxTxScale;
            }
            if(oxTxScale <= 0.25){
                canvasScales(0.25,eClientX ,eClientY);
                //wm.pagesArr[wm.pageIndex].canvasGlobal.scale = 0.25;
            }
            if(oxTxScale >= 4){
                canvasScales(4,eClientX ,eClientY);
                //wm.pagesArr[wm.pageIndex].canvasGlobal.scale = 4;
            }
            ctx.clearRect(0,0,wm.pagesArr[wm.pageIndex].canvasGlobal.width,wm.pagesArr[wm.pageIndex].canvasGlobal.height);
            for(let i of wm.pagesArr[wm.pageIndex].brushArr){
                startDraw(ctx,i);
            }
        };
        function touchEnd(){
            if(windowIsRemove){
                document.Remove('touchmove',touchMove);
                document.Remove('touchend',touchEnd);
                windowIsRemove = false;
            }
        };
    }
}
let touchend = true,transX,transY,isTrans;
window.onkeydown = function(data){
    if(data.keyCode == 17){
        document.Add('mousewheel',mouseweel);
        isTrans = true;
        transX = wm.pagesArr[wm.pageIndex].canvasGlobal.transX - (wm.pagesArr[wm.pageIndex].canvasGlobal.width - wm.pagesArr[wm.pageIndex].canvasGlobal.width * wm.pagesArr[wm.pageIndex].canvasGlobal.scale) / 2;
        transY = wm.pagesArr[wm.pageIndex].canvasGlobal.transY - (wm.pagesArr[wm.pageIndex].canvasGlobal.height - wm.pagesArr[wm.pageIndex].canvasGlobal.height * wm.pagesArr[wm.pageIndex].canvasGlobal.scale) / 2;
    }else if(data.keyCode == 32){
        thatData.dragScreenShow = true;
    }
}
window.onkeyup = function(data){
    if(data.keyCode == 17){
        document.Remove('mousewheel',mouseweel);
    }else if(data.keyCode == 32){
        thatData.dragScreenShow = false;
    }
}
function mouseweel(e){
    isTrans = false;
    if(thatData.controllerLeftShow){
        thatData.controllerLeftShow = false;
    }
    thatData.maskShow = false;
    let eClientX = (wm.scaleTransRealform(e.clientX - wm.pagesArr[wm.pageIndex].canvasGlobal.repairLeft) - wm.pagesArr[wm.pageIndex].canvasGlobal.transX) / wm.pagesArr[wm.pageIndex].canvasGlobal.scale;
    let eClientY = (wm.scaleTransRealform(e.clientY - wm.pagesArr[wm.pageIndex].canvasGlobal.repairTop) - wm.pagesArr[wm.pageIndex].canvasGlobal.transY) / wm.pagesArr[wm.pageIndex].canvasGlobal.scale;
    if(e.wheelDelta/360 + wm.pagesArr[wm.pageIndex].canvasGlobal.scale < 0.25){
        //wm.pagesArr[wm.ageIndex].canvasGlobal.scale = 0.25;
        canvasScales(0.25,eClientX ,eClientY);
    }else if(e.wheelDelta/360 + wm.pagesArr[wm.pageIndex].canvasGlobal.scale > 4){
        canvasScales(4,eClientX ,eClientY);
        //wm.pagesArr[wm.pageIndex].canvasGlobal.scale = 4;
    }else{
        canvasScales(e.wheelDelta/360 + wm.pagesArr[wm.pageIndex].canvasGlobal.scale,eClientX ,eClientY);
        //wm.pagesArr[wm.pageIndex].canvasGlobal.scale = e.wheelDelta/360 + wm.pagesArr[wm.pageIndex].canvasGlobal.scale;
    }
    //wm.pagesArr[wm.pageIndex].canvasGlobal.transScaleX = -wm.scaleTransRealform(e.clientX - wm.pagesArr[wm.pageIndex].canvasGlobal.repairLeft);
    //wm.pagesArr[wm.pageIndex].canvasGlobal.transScaleY = -wm.scaleTransRealform(e.clientY - wm.pagesArr[wm.pageIndex].canvasGlobal.repairTop);
    // wm.pagesArr[wm.pageIndex].canvasGlobal.transScaleX = (wm.pagesArr[wm.pageIndex].canvasGlobal.initWidth - wm.pagesArr[wm.pageIndex].canvasGlobal.initWidth * wm.pagesArr[wm.pageIndex].canvasGlobal.scale) / 2;
    // wm.pagesArr[wm.pageIndex].canvasGlobal.transScaleY = (wm.pagesArr[wm.pageIndex].canvasGlobal.initHeight - wm.pagesArr[wm.pageIndex].canvasGlobal.initHeight * wm.pagesArr[wm.pageIndex].canvasGlobal.scale) / 2;
    // wm.pagesArr[wm.pageIndex].canvasGlobal.transScaleX -= wm.scaleTransRealform(e.clientX - wm.pagesArr[wm.pageIndex].canvasGlobal.repairLeft);
    // wm.pagesArr[wm.pageIndex].canvasGlobal.transScaleY -= wm.scaleTransRealform(e.clientY - wm.pagesArr[wm.pageIndex].canvasGlobal.repairTop);
    // log(wm.pagesArr[wm.pageIndex].canvasGlobal.transScaleX,wm.pagesArr[wm.pageIndex].canvasGlobal.transScaleY);
    // if(wm.pagesArr[wm.pageIndex].canvasGlobal.scale > 1){
    //     wm.pagesArr[wm.pageIndex].canvasGlobal.transScaleX = (wm.pagesArr[wm.pageIndex].canvasGlobal.width - wm.pagesArr[wm.pageIndex].canvasGlobal.width * wm.pagesArr[wm.pageIndex].canvasGlobal.scale) / 2;
    //     wm.pagesArr[wm.pageIndex].canvasGlobal.transScaleY = (wm.pagesArr[wm.pageIndex].canvasGlobal.height - wm.pagesArr[wm.pageIndex].canvasGlobal.height * wm.pagesArr[wm.pageIndex].canvasGlobal.scale) / 2;
    // }else{
    //     wm.pagesArr[wm.pageIndex].canvasGlobal.transScaleX = (wm.pagesArr[wm.pageIndex].canvasGlobal.width - wm.pagesArr[wm.pageIndex].canvasGlobal.width / wm.pagesArr[wm.pageIndex].canvasGlobal.scale) / 2;
    //     wm.pagesArr[wm.pageIndex].canvasGlobal.transScaleY = (wm.pagesArr[wm.pageIndex].canvasGlobal.height - wm.pagesArr[wm.pageIndex].canvasGlobal.height / wm.pagesArr[wm.pageIndex].canvasGlobal.scale) / 2;
    // }
    // wm.pagesArr[wm.pageIndex].canvasGlobal.transX = wm.pagesArr[wm.pageIndex].canvasGlobal.transScaleX;
    // wm.pagesArr[wm.pageIndex].canvasGlobal.transY = wm.pagesArr[wm.pageIndex].canvasGlobal.transScaleY;

    // function toTouchX(x) {
    //     return x * wm.canvasGlobal.scale + wm.canvasGlobal.initRepairLeft;
    // }
    // /**
    //  * 将画布坐标y转换成屏幕触摸坐标
    //  */
    // function toTouchY(y) {
    //     return y * wm.canvasGlobal.scale + wm.canvasGlobal.initRepairTop;
    // }

    // function toTransX(touchX, doodleX) {
    //     return -doodleX * wm.canvasGlobal.scale + touchX;
    // }
    
    // function toTransY(touchY, doodleY) {
    //     return -doodleY * wm.canvasGlobal.scale + touchY;
    // }
    // function setDoodleScaleX() {
    //     let touchX = toTouchX(0);
    //     let touchY = toTouchY(0);

    //     // 缩放后，偏移图片，以产生围绕某个点缩放的效果
    //     wm.canvasGlobal.repairLeft = toTransX(touchX, 0);//pivotX * getAllScale() + getAllTranX() - privotX * getAllScale();
    //     wm.canvasGlobal.repairTop = toTransY(touchY, 0);
    //     log(wm.canvasGlobal.repairLeft);
    // }
    // if(window.innerWidth/wm.canvasGlobal.initWidth <= window.innerHeight/wm.canvasGlobal.initHeight){
    //     wm.canvasGlobal.repairTop = wm.canvasGlobal.initRepairTop / wm.canvasGlobal.scale;
    // }else{
    //     wm.canvasGlobal.repairLeft = wm.canvasGlobal.initRepairLeft / wm.canvasGlobal.scale;
    // }
    ctx.clearRect(0,0,wm.pagesArr[wm.pageIndex].canvasGlobal.width,wm.pagesArr[wm.pageIndex].canvasGlobal.height);
    for(let i of wm.pagesArr[wm.pageIndex].brushArr){
        startDraw(ctx,i);
    }
}

function canvasScales(scale,pivotX,pivotY){
    //如果需要在变动前刷新且有新增则先刷新sss
    let touchX = toTouchX(pivotX);
    let touchY = toTouchY(pivotY);
    wm.pagesArr[wm.pageIndex].canvasGlobal.scale = scale;

    // 缩放后，偏移图片，以产生围绕某个点缩放的效果
    wm.pagesArr[wm.pageIndex].canvasGlobal.transX = toTransX(touchX, pivotX);//pivotX * getAllScale() + getAllTranX() - privotX * getAllScale();
    wm.pagesArr[wm.pageIndex].canvasGlobal.transY = toTransY(touchY, pivotY);

    function toTouchX(x) {
        return x * wm.pagesArr[wm.pageIndex].canvasGlobal.scale + wm.pagesArr[wm.pageIndex].canvasGlobal.transX;
    }
    function toTouchY(y) {
        return y * wm.pagesArr[wm.pageIndex].canvasGlobal.scale + wm.pagesArr[wm.pageIndex].canvasGlobal.transY;
    }

    function toTransX(touchX, doodleX) {
        return -doodleX * wm.pagesArr[wm.pageIndex].canvasGlobal.scale + touchX;
    }
    
    function toTransY(touchY, doodleY) {
        return -doodleY * wm.pagesArr[wm.pageIndex].canvasGlobal.scale + touchY;
    }
}

//关闭PC端浏览器默认ctrl+鼠标滚轮缩放页面事件
document.body.addEventListener('wheel', (e) => {
    if (e.ctrlKey) {
        if (e.deltaY < 0) {
            e.preventDefault();
            return false;
        }
        if (e.deltaY > 0) {
            e.preventDefault();
            return false;
        }
    }
}, { passive: false });

document.body.addEventListener('mousemove', function (e) {
    if(wm.pagesArr[0]&&isTrans){
        canvasPointX = wm.scaleTransRealform(e.clientX) - wm.pagesArr[wm.pageIndex].canvasGlobal.width/2;
        canvasPointY = wm.scaleTransRealform(e.clientY) - wm.pagesArr[wm.pageIndex].canvasGlobal.height/2;
    }
}, {passive: false})

document.body.addEventListener('touchmove', function (e) {
    //如果设备列表与会议信息滑动则生效，屏蔽移动端其他滚动条事件
    if(e.target.className !== 'dev_temp'&&e.target.className !== 'info_temp'){
        e.preventDefault();
    };
}, {passive: false})

window.onoffline = function(){
    log('我离线了');
}
window.ononline = function(){
    window.location.reload();
}

//初始为页面添加初始数据
// let pageObj = {
//     brushTotalArr: wm.brushTotalArr,	//总数据记录
//     brushArr: wm.brushArr,		//当前数据记录
//     stepArr: stepArr,       	//步骤总记录
//     currentStep: currentStep,   	//当前展示步骤
//     stepInx: stepInx,        	//当前步骤索引
//     selectArr: selectArr,       //当前选中数据
//     canvasGlobal: JSON.parse(JSON.stringify(wm.initCanvasGlobal)),	//当前页面数据
// }
// wm.pagesArr.push(pageObj);

// window.onkeydown = function(data){
//     if(data.keyCode == 32){
//     }
// }
// window.onkeyup = function(data){
//     if(data.keyCode == 32){

//     }
// }

//创建房间
// ajax({
//     url: http://39.106.69.42:9500/board-center/roomController/createRoom',
//     dataType: 'json',
//     success: function(data){
//         log(data);
//     }
// })//13265284

//删除房间
// ajax({
//     url: 'http://20.1.30.31:9500/board-center/roomController/deleteRoom',
//     data: {
//         roomId: '66254175',
//     },
//     dataType: 'json',
//     success: function(data){
//         log(data);
//     }
// })

//根据房间号获取房间最新数据
// ajax({
//     url: 'http://20.1.30.31:9500/board-center/boardController/findBoardByRoomNewData',
//     data: {
//         roomId: '13265284',
//     },
//     dataType: 'json',
//     success: function(data){
//         log(data);
//     },
// })

//插入白板轨迹
// ajax({
//     url: 'http://20.1.30.31:9500/board-center/boardController/insertBoard',
//     header: 'application/json',
//     data: JSON.stringify(jsonText),
//     dataType: 'json',
//     success: function(data){
//         log(data);
//     }
// })

//获取设备倍率
// window.getDevicePixelRatio = function () {
//     var ratio = 1;
//     // To account for zoom, change to use deviceXDPI instead of systemXDPI
//     if (window.screen.systemXDPI !== undefined && window.screen.logicalXDPI       !== undefined && window.screen.systemXDPI > window.screen.logicalXDPI) {
//         // Only allow for values > 1
//         ratio = window.screen.systemXDPI / window.screen.logicalXDPI;
//     }
//     else if (window.devicePixelRatio !== undefined) {
//         ratio = window.devicePixelRatio;
//     }
//     log(ratio);
//     return ratio;
// };
// window.getDevicePixelRatio();