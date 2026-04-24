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
    text: "http://mengge-wechat.oss-cn-shanghai.aliyuncs.com/test/cloudBoard32/index.html?roomId=" + sessionStorage.roomId,
    width: 100,
    height: 100,
});

if(language == 'en'){
    c('sticker_p')[0].style.fontSize = '1.4rem';
}

let isWrite = true; //是否可编辑全局状态设定，默认为可写
let isResize = true; //窗口大小改变时是否刷新，默认变化
let imageOffset = 0; //插入图片偏移计算

function start(){
    thatData.upDate({
        brushShow: false,   //画笔工具显示隐藏
        infoShow: false,    //会议信息显示隐藏
        infoTitle: sessionStorage.roomName,   //会议信息title展示
        backColor: '#515355',//画布背景色
        backIndex: 4,   //画布层级位置
        backImage: 'url("src/back/1.png")',//画布背景图
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
        circControllerShow: false,  //圈选复制删除修改文本颜色显示隐藏
        circTextColorShow: false,    //全选后是否展示修改文本颜色选项
        circControllerTempBottomShow: false,    //点击修改文本颜色则展示颜色选择框
        handArr: [],    //指针合集
        maskShow: true,         //跟随主持人视角则显示大屏演示区域
        circTextColorSelectObj: {   //当前选中颜色
            color: '#FF9CB00',
            border: '#CDCDCD',
        },
        circTextColorArr: [ //圈选后文本改变颜色
            {
                color: '#FFFFFFFF',
                border: '#CDCDCD',
                selectImage: 'src/group/selectBrush.png',
                select: true,
                click: wm.selectTextColor,
            },
            {
                color: '#FF9B00FF',
                border: '#FF9B00',
                selectImage: 'src/group/selectedBrush.png',
                select: false,
                click: wm.selectTextColor,
            },
            {
                color: '#935AFFFF',
                border: '#935AFF',
                selectImage: 'src/group/selectedBrush.png',
                select: false,
                click: wm.selectTextColor,
            },
            {
                color: '#FF4E55FF',
                border: '#FF4E55',
                selectImage: 'src/group/selectedBrush.png',
                select: false,
                click: wm.selectTextColor,
            },
            {
                color: '#1088FFFF',
                border: '#1088FF',
                selectImage: 'src/group/selectedBrush.png',
                select: false,
                click: wm.selectTextColor,
            },
            {
                color: '#00D45CFF',
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
                drawArrObject.header.fromUserName = sessionStorage.userName;
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
            wm.canvasGlobal.scale = wm.canvasGlobal.scales;
            wm.canvasGlobal.transX = wm.canvasGlobal.transXs;
            wm.canvasGlobal.transY = wm.canvasGlobal.transYs;
            ctx.clearRect(0,0,wm.canvasGlobal.width,wm.canvasGlobal.height);
            for(let i of wm.brushArr){
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
            textarea.value += meetLink + '?roomId=' + sessionStorage.roomId + '\n';
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
                    ctxc.clearRect(0,0,wm.canvasGlobal.width,wm.canvasGlobal.height);
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
            },{//撤销
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
            },{//插入文本
                image: 'src/controller/text.png',
                selectImage: 'src/controller/texts.png',
                disabledImage: 'src/controller/textd.png',
                select: false,
                disabled: false,
                click: function(){
                    if(!isWrite){return false;};
                    //thatData.dragScreenShow = false;
                    //thatData.circlSelectShow = false;
                    //clearCircl();
                    let textArrayObj = {};
                    textArrayObj.index = thatData.textArray.length;
                    textArrayObj.text = '';
                    textArrayObj.textInfo = thatData.insertTextTips;
                    textArrayObj.left = window.innerWidth/3 - 70 + thatData.textArray.length*30 + 'px';
                    textArrayObj.top = window.innerHeight/3 - 20 + thatData.textArray.length*30 + 'px';
                    textArrayObj.show = true;
                    textArrayObj.size = '20px';
                    textArrayObj.blur = function(e,obj){
                        obj.show = false;
                        thatData.textArray = thatData.textArray;
                    }
                    textArrayObj.input = function(e,obj){
                        this.prev().innerHTML = this.value == ''?thatData.insertTextTips:this.value;
                        this.onchange = function(){
                            isResize = true;
                            obj.show = false;
                            drawArrObject.header.command = 'opDoodle';
                            drawArrObject.body = {
                                ids: [],
                                type: 1,
                                x: wm.scaleTransform(parseFloat(obj.left) + 8 - wm.canvasGlobal.repairLeft) - wm.canvasGlobal.transX,
                                y: wm.scaleTransform(parseFloat(obj.top) + 8 - wm.canvasGlobal.repairTop) - wm.canvasGlobal.transY,
                            };
                            drawArrObject.body.data = [
                                {
                                    className: 'DoodleText',
                                    mBound: {},
                                    mOriginBound: {
                                        top: wm.scaleTransform(parseFloat(obj.top) + 8 - wm.canvasGlobal.repairTop) - wm.canvasGlobal.transY,
                                        left: wm.scaleTransform(parseFloat(obj.left) + 8 - wm.canvasGlobal.repairLeft) - wm.canvasGlobal.transX,
                                        right: wm.scaleTransform((parseFloat(obj.left) + 8 + this.prev().offsetWidth - wm.canvasGlobal.repairLeft)) - wm.canvasGlobal.transX,
                                        bottom: wm.scaleTransform((parseFloat(obj.top) + 20 + 8 - wm.canvasGlobal.repairTop)) - wm.canvasGlobal.transY,
                                    },
                                    mOriginLocation: {},
                                    mRect: {},
                                    globalId: ULID.ulid(),
                                    mBaseScale: 1,
                                    mColor: {   //颜色对象，仅需修改mColor即可，其他不动
                                        type: 'DoodleColor',
                                        mColor: -1, //该次涂鸦数值
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
                            startDraw(ctx,drawArrObject.body.data[0]);
                            currentStep.push(drawArrObject.body.data[0].globalId);
                            addSend(drawArrObject);
                            thatData.textArray = thatData.textArray;
                        }
                    }
                    thatData.textArray.push(textArrayObj);
                    thatData.textArray = thatData.textArray;
                    //渲染输入框时默认给予选中效果与拖动效果
                    isResize = false;
                    c('insertText')[c('insertText').length - 1].children[1].focus();
                    c('insertText')[c('insertText').length - 1].addDrag(false,false,function(e,ex,ey,mx,my,x,y){
                        for(let j of thatData.textArray){
                            if(j.index == JSON.parse(this.getAttribute('wm-forlist')).index){
                                j.left = parseInt(j.left) + ex - x + 'px';
                                j.top = parseInt(j.top) + ey - y + 'px';
                            }
                        }
                    });
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
                    if(!imageMax(1)){
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
                                    let thatWidth = that.width * wm.canvasGlobal.mobileScale,
                                        thatHeight = that.height * wm.canvasGlobal.mobileScale;
                                    that.style.width = thatWidth + 'px';
                                    obj.top = window.innerHeight/3 - 20 + imageOffset;
                                    obj.left = window.innerWidth/3 - 70 + imageOffset;
                                    imageOffset += 50;
                                    drawArrObject.header.command = 'opDoodle';
                                    drawArrObject.body = {
                                        ids: [],
                                        type: 1,
                                        x: wm.scaleTransform(parseFloat(obj.left) - wm.canvasGlobal.repairLeft),
                                        y: wm.scaleTransform(parseFloat(obj.top) - wm.canvasGlobal.repairTop),
                                    };
                                    drawArrObject.body.data = [
                                        {
                                            className: 'DoodleBitmap',
                                            mOriginBound: {
                                                top: wm.scaleTransform(parseFloat(obj.top) - wm.canvasGlobal.repairTop) - wm.canvasGlobal.transY,
                                                left: wm.scaleTransform(parseFloat(obj.left) - wm.canvasGlobal.repairLeft) - wm.canvasGlobal.transX ,
                                                right: wm.scaleTransform(parseFloat(obj.left) + thatWidth - wm.canvasGlobal.repairLeft) - wm.canvasGlobal.transX,
                                                bottom: wm.scaleTransform(parseFloat(obj.top) + thatHeight - wm.canvasGlobal.repairTop) - wm.canvasGlobal.transY,
                                            },
                                            mBound: {
                                                top: wm.scaleTransform(parseFloat(obj.top) - wm.canvasGlobal.repairTop) - wm.canvasGlobal.transY,
                                                left: wm.scaleTransform(parseFloat(obj.left) - wm.canvasGlobal.repairLeft) - wm.canvasGlobal.transX ,
                                                right: wm.scaleTransform(parseFloat(obj.left) + thatWidth - wm.canvasGlobal.repairLeft) - wm.canvasGlobal.transX,
                                                bottom: wm.scaleTransform(parseFloat(obj.top) + thatHeight - wm.canvasGlobal.repairTop) - wm.canvasGlobal.transY,
                                            },
                                            mDstRect: {
                                                top: 0,
                                                left: 0,
                                                right: wm.scaleTransform(thatWidth),
                                                bottom: wm.scaleTransform(thatHeight),
                                            },
                                            mSrcRect: {
                                                top: 0,
                                                left: 0,
                                                right: wm.scaleTransform(thatWidth),
                                                bottom: wm.scaleTransform(thatHeight),
                                            },
                                            mOriginLocation: {},
                                            mRect: {},
                                            globalId: globalId,
                                            mBaseScale: 1,
                                            mScale: 1,
                                            mItemRotate: 0,
                                            mLocation: {
                                                x: wm.scaleTransform(parseFloat(obj.left) - wm.canvasGlobal.repairLeft),
                                                y: wm.scaleTransform(parseFloat(obj.top) - wm.canvasGlobal.repairTop),
                                            },
                                            mOverturnX: 1,
                                            mOverturnY: 1,
                                            mPen: 'BITMAP',
                                            mPivotX: wm.scaleTransform(parseFloat(obj.left) + thatWidth/2 - wm.canvasGlobal.repairLeft) - wm.canvasGlobal.transX,
                                            mPivotY: wm.scaleTransform(parseFloat(obj.top) + thatHeight/2 - wm.canvasGlobal.repairTop) - wm.canvasGlobal.transY,
                                            mShape: "HAND_WRITE",
                                            mType: 'mind',
                                            mSize: 0,
                                            type: 21,
                                        },
                                    ];
                                    currentStep.push(drawArrObject.body.data[0].globalId);
                                    addSend(drawArrObject);
                                    drawArrObject.body.data[0].srcUrl = that;
                                    log(drawArrObject.body.data[0]);
                                    startDraw(ctx,drawArrObject.body.data[0]);
                                    //d('h1').innerHTML += u8Arr.length;
                                    ws.send(u8Arr);
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

//图片上限判断
function imageMax(type){
    let imageNum = 0,imageArr = [];
    if(type == 1){
        imageNum++;
    }
    for(let i of wm.brushArr){
        imageArr.push(i);
    }
    for(let i of selectArr){
        if(type == 2){
            imageArr.push(i);
            imageArr.push(i);
        }else{
            imageArr.push(i);
        }
    }
    for(let i of imageArr){
        if(i.type == 21){
            imageNum++;
        }
    }
    if(imageNum > 20){
        log('超过20张图片，复制失败！');
        return false;
    }else{
        return true;
    }
}

function addSend(data){
    wm.brushTotalArr.push(data.body.data[0]);
    wm.brushArr.push(data.body.data[0]);
    currentStep.push(data.body.data[0].globalId);
    addStep();
    ws.send(JSON.stringify(data));
}

//拖动屏幕
c('dragScreen')[0].Add('touchstart mousedown',function(e){
    let x = e.touches?e.touches[0].clientX:e.clientX,
    y = e.touches?e.touches[0].clientY:e.clientY,
    transX = wm.canvasGlobal.transX,
    transY = wm.canvasGlobal.transY;
    thatData.maskShow = false;
    document.Add('touchmove mousemove',dragMove);
    document.Add('touchend mouseup',dragEnd);
    function dragMove(even){
        if(thatData.controllerLeftShow){
            thatData.controllerLeftShow = false;
        }
        let mx = even.touches?even.touches[0].clientX:even.clientX,
        my = even.touches?even.touches[0].clientY:even.clientY;
        wm.canvasGlobal.transX = transX + mx - x;
        wm.canvasGlobal.transY = transY + my - y;
        ctx.clearRect(0,0,wm.canvasGlobal.width,wm.canvasGlobal.height);
        for(let i of wm.brushArr){
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

//清除圈选内容
function clearCircl(){
    thatData.circScaleRotateShow = false;
    thatData.circControllerShow = false;
    //开始圈选
    for(let i of selectArr){
        wm.brushArr.push(i);
    }
    ctx.clearRect(0,0,wm.canvasGlobal.width,wm.canvasGlobal.height);
    for(let i of wm.brushArr){  
        startDraw(ctx,i);
    }
    selectArr = [];
    selectObject.bool = false;
}

//圈选工具
c('circlSelect')[0].addDrag(function(e,x,y){
    if(!isWrite){return false;};
    drawArrObject.header.command = 'opDoodle';
    x = wm.scaleTransform(x - wm.canvasGlobal.repairLeft) - wm.canvasGlobal.transX / wm.canvasGlobal.scale;
    y = wm.scaleTransform(y - wm.canvasGlobal.repairTop) - wm.canvasGlobal.transY / wm.canvasGlobal.scale;
    if(selectObject.bool&&selectObject.left - wm.scaleTransform(24) < x&&selectObject.right + wm.scaleTransform(24) > x&&selectObject.top - wm.scaleTransform(24) < y&&selectObject.bottom + wm.scaleTransform(24) > y){
        selectObject.x = x;
        selectObject.y = y;
        circReset(selectArr);
        drawArrObject.body = {
            ids: selectObject.ids,
            type: 3,
            x: 0,
            y: 0,
        };
        drawArrObject.body.data = {
            toX: selectObject.left,
            toY: selectObject.top,
            moveState: 0, //moveState 0 开始移动
        };
        ws.send(JSON.stringify(drawArrObject));
    }else{
        //开始圈选
        clearCircl();
    }
},function(e,mx,my,x,y){
    x = wm.scaleTransform(x - wm.canvasGlobal.repairLeft) - wm.canvasGlobal.transX / wm.canvasGlobal.scale;
    y = wm.scaleTransform(y - wm.canvasGlobal.repairTop) - wm.canvasGlobal.transY / wm.canvasGlobal.scale;
    mx = wm.scaleTransform(mx - wm.canvasGlobal.repairLeft) - wm.canvasGlobal.transX / wm.canvasGlobal.scale;
    my = wm.scaleTransform(my - wm.canvasGlobal.repairTop) - wm.canvasGlobal.transY / wm.canvasGlobal.scale;
    let offsetX = (mx - selectObject.x),
        offsetY = (my - selectObject.y);
    if(selectObject.bool){  //移动选中的内容
        for(let i of selectArr){
            i.mLocation.x += offsetX;
            i.mLocation.y += offsetY;
            i.mPivotX += offsetX;
            i.mPivotY += offsetY;
            if(i.mOriginBound){
                i.mOriginBound.left += offsetX;
                i.mOriginBound.right += offsetX;
                i.mOriginBound.top += offsetY;
                i.mOriginBound.bottom += offsetY;
                wm.calculateBound(i);
            }
        }
        circReset(selectArr);
        drawArrObject.body.data = {
            toX: selectObject.left,
            toY: selectObject.top,
            moveState: 1, //moveState 0 开始移
        };
        //circController();
        ws.send(JSON.stringify(drawArrObject));
        selectObject.x = mx;
        selectObject.y = my;
    }else{  //圈选逻辑
        ctxc.clearRect(0,0,wm.canvasGlobal.width,wm.canvasGlobal.height);
        ctxc.beginPath();
        contextRect(ctxc,x,y,mx,my);
    }
},function(e,ex,ey,mx,my,x,y){
    if(!selectObject.bool){//判断用户该次操作为圈选还是移动
        thatData.circScaleRotateShow = false;
        thatData.circControllerShow = false;
        thatData.circControllerTempBottomShow = false;
        x = wm.scaleTransform(x - wm.canvasGlobal.repairLeft) - wm.canvasGlobal.transX / wm.canvasGlobal.scale;
        y = wm.scaleTransform(y - wm.canvasGlobal.repairTop) - wm.canvasGlobal.transY / wm.canvasGlobal.scale;
        mx = wm.scaleTransform(mx - wm.canvasGlobal.repairLeft) - wm.canvasGlobal.transX / wm.canvasGlobal.scale;
        my = wm.scaleTransform(my - wm.canvasGlobal.repairTop) - wm.canvasGlobal.transY / wm.canvasGlobal.scale;
        mx=mx?mx:x;
        my=my?my:y;
        if(mx < x){let sx = mx;mx = x;x = sx;};
        if(my < y){let sy = my;my = y;y = sy;};
        selectArr = [];
        selectObject.ids = [];
        ctxc.clearRect(0,0,wm.canvasGlobal.width,wm.canvasGlobal.height);
        for(let i = wm.brushArr.length - 1; i >= 0; i--){
            if(x < wm.brushArr[i].mBound.right&&mx > wm.brushArr[i].mBound.left&&y < wm.brushArr[i].mBound.bottom&&my > wm.brushArr[i].mBound.top){
                selectArr.unshift(wm.brushArr[i]);
                selectObject.ids.push(wm.brushArr[i].globalId);
                wm.brushArr.splice(i,1);
                selectObject.bool = true;
            }
        }
        if(selectObject.bool){
            if(selectArr.length !== 0){
                thatData.circTextColorShow = true;
                for(let i of selectArr){
                    if(i.className !== 'DoodlePath'&&i.className !== 'DoodleText'){
                        thatData.circTextColorShow = false;
                    }
                }
            }
            circReset(selectArr);
            ctx.clearRect(0,0,wm.canvasGlobal.width,wm.canvasGlobal.height);
            for(let i of wm.brushArr){
                startDraw(ctx,i);
            }
        }
    }else{
        drawArrObject.body.data = {
            toX: selectObject.left,
            toY: selectObject.top,
            moveState: 2, //moveState 0 开始移
        };
        ws.send(JSON.stringify(drawArrObject));
    }
},true);

//初始化圈选工具
function circReset(selectArrObj,num){
    let minX = 9999999,maxX = -9999999,minY = 9999999,maxY = -9999999;
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
    selectObject.scale = num == 2?selectObject.scale:1;
    selectObject.pivotX = selectObject.left + selectObject.width / 2;
    selectObject.pivotY = selectObject.top + selectObject.height / 2;
    ctxc.clearRect(0,0,wm.canvasGlobal.width,wm.canvasGlobal.height);
    ctxc.beginPath();
    contextRect(ctxc,selectObject.left - wm.scaleTransform(24),selectObject.top - wm.scaleTransform(24),selectObject.right + wm.scaleTransform(24),selectObject.bottom + wm.scaleTransform(24));
    for(let i of selectArr){
        startDraw(ctxc,i);
    }
    thatData.circScaleRotateShow = true;
    thatData.circControllerShow = true;
    circController();
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
            iScale.scale = i.mBaseScale * diffScale;
            wm.setItemRotate(i,iScale,2);
        }
        circReset(selectArr);
    }
},function(){
    if(isDrawScale){
        drawArrObject.header.command = 'opDoodle';
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
        ws.send(JSON.stringify(drawArrObject));
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
    contextRect(ctxc,selectObject.left - wm.scaleTransform(24),selectObject.top - wm.scaleTransform(24),selectObject.right + wm.scaleTransform(24),selectObject.bottom + wm.scaleTransform(24));
    circReset(selectArr);
    ctxc.clearRect(0,0,wm.canvasGlobal.width,wm.canvasGlobal.height);
    ctxc.beginPath();
    for(let i of selectArr){
        wm.setItemRotate(i,iRotate,1);
        startDraw(ctxc,i);
    }
},function(){
    drawArrObject.header.command = 'opDoodle';
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
    ws.send(JSON.stringify(drawArrObject));
});
function circController(){
    c('circScaleRotate')[0].style.top = wm.backScaleTransform(selectObject.bottom) + wm.backScaleTransform(wm.canvasGlobal.transY / wm.canvasGlobal.scale) + wm.canvasGlobal.repairTop + 10 + 'px';
    c('circScaleRotate')[0].style.left = wm.backScaleTransform(selectObject.right) + wm.backScaleTransform(wm.canvasGlobal.transX / wm.canvasGlobal.scale) + wm.canvasGlobal.repairLeft + 10 + 'px';
    c('circController')[0].style.top = wm.backScaleTransform(selectObject.bottom) + 44 + wm.backScaleTransform(wm.canvasGlobal.transY / wm.canvasGlobal.scale) + wm.canvasGlobal.repairTop + 'px';
    c('circController')[0].style.left = wm.backScaleTransform(selectObject.right - selectObject.width/2) - c('circController')[0].clientWidth/2 + wm.backScaleTransform(wm.canvasGlobal.transX / wm.canvasGlobal.scale) + wm.canvasGlobal.repairLeft + 'px';
}

//圈选后复制
c('circCopy')[0].Click(function(){
    if(!isWrite){return false;};
    if(!imageMax(2)){
        return false;
    };
    drawArrObject.header.command = 'opDoodle';
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
        selectArrObj.globalId = ULID.ulid();
        drawArrObject.body.ids.push(selectArr[i].globalId);
        drawArrObject.body.data.ids.push(selectArrObj.globalId);
        selectObject.ids.push(selectArrObj.globalId);
        selectArrObj.mLocation.x += selectObject.offset;
        selectArrObj.mLocation.y += selectObject.offset;
        selectArrObj.mPivotX += selectObject.offset;
        selectArrObj.mPivotY += selectObject.offset;
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
        wm.brushArr.push(selectArr[i]);
        wm.brushTotalArr.push(selectArrObj);
        selectArr[i] = selectArrObj;
    }
    circReset(selectArr);
    ctx.clearRect(0,0,wm.canvasGlobal.width,wm.canvasGlobal.height);
    for(let i of wm.brushArr){
        startDraw(ctx,i);
    }
    ws.send(JSON.stringify(drawArrObject));
});
//圈选后删除
c('circDelete')[0].Click(function(){
    if(!isWrite){return false;};
    drawArrObject.header.command = 'opDoodle';
    drawArrObject.body = {
        ids: [],
        type: 2,
        x: 0,
        y: 0,
    };
    for(let i of selectArr){
        drawArrObject.body.ids.push(i.globalId);
    }
    currentStep = [];
    for(let i of wm.brushArr){
        currentStep.push(i.globalId);
    }
    addStep();
    ws.send(JSON.stringify(drawArrObject));
    selectArr = [];
    ctxc.clearRect(0,0,wm.canvasGlobal.width,wm.canvasGlobal.height);
    thatData.circScaleRotateShow = false;
    thatData.circControllerShow = false;
});

//板擦相交计算
function eraserAlgo(obj,data){
    let drawArrObjectObjText = {}; 
    drawArrObjectObjText.header = {
        command: "opDoodle",    //命令类型
        fromDeviceType: wm.isPhone()?0:2,  //设备类型(0手机、1平板、2电脑、3大屏)
        fromUserId: sessionStorage.userId, //用户ID
        fromUserName: sessionStorage.userName,   //用户名称
        isHomeOwners: false,    //是否创建者
    }
    drawArrObjectObjText.body = {
        ids: [],
        type: 2,
        x: 0,
        y: 0,
    };
    for(let i of wm.brushArr){
        if(i.className != 'DoodleBitmap' && i.className != 'DoodleMindBitmap'){
            if(i.type == 2 || i.type == 0 || i.type == 15){
                if(i.mBound){
                    if(obj.left < i.mBound.right && i.mBound.left < obj.right && obj.top < i.mBound.bottom && i.mBound.top < obj.bottom){
                        if(i.className == 'DoodleText'){
                            drawArrObjectObjText.body.ids.push(i.globalId);
                            for(let j = wm.brushArr.length - 1; j >= 0; j--){
                                if(i.globalId == wm.brushArr[j].globalId){
                                    wm.brushArr.splice(j,1);
                                    currentStep.splice(j,1);
                                };
                            }
                            addStep();
                            ctx.clearRect(0,0,wm.canvasGlobal.width,wm.canvasGlobal.height);
                            for(let i of wm.brushArr){
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
        ws.send(JSON.stringify(drawArrObjectObjText));
    }
}

function contextRect(context,left,top,right,bottom){    //圈选渲染
    context.save();
    context.translate(wm.canvasGlobal.transX,wm.canvasGlobal.transY);
    context.scale(wm.canvasGlobal.scale,wm.canvasGlobal.scale);
    context.translate(wm.scaleTransform(wm.canvasGlobal.repairLeft),wm.scaleTransform(wm.canvasGlobal.repairTop));
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
        mOriginLocation.x = mRect.left;
        mOriginLocation.y = mRect.top;
    },
}

wm.initScale();    //初始化页面缩放
//开始绘制
let canvas = d('canvas');
let canvasActual = d('canvas_actual');
let canvasDraw = d('canvas_draw');
let circlSelect = c('circlSelect')[0];
canvas.width = wm.canvasGlobal.width * wm.canvasGlobal.mobileScale;
canvas.height = wm.canvasGlobal.height * wm.canvasGlobal.mobileScale;
canvasActual.width = wm.canvasGlobal.width * wm.canvasGlobal.mobileScale;
canvasActual.height = wm.canvasGlobal.height * wm.canvasGlobal.mobileScale;
canvasDraw.width = wm.canvasGlobal.width * wm.canvasGlobal.mobileScale;
canvasDraw.height = wm.canvasGlobal.height * wm.canvasGlobal.mobileScale;
circlSelect.width = wm.canvasGlobal.width * wm.canvasGlobal.mobileScale;
circlSelect.height = wm.canvasGlobal.height * wm.canvasGlobal.mobileScale;
let ctx = canvas.getContext('2d');      //底层最终画布
let ctxa = canvasActual.getContext('2d'); //实时绘制层画布
let ctxd = canvasDraw.getContext('2d'); //绘制层画布
let ctxc = circlSelect.getContext('2d');//圈选层画布
ctx.scale(wm.canvasGlobal.mobileScale,wm.canvasGlobal.mobileScale);
ctxa.scale(wm.canvasGlobal.mobileScale,wm.canvasGlobal.mobileScale);
ctxd.scale(wm.canvasGlobal.mobileScale,wm.canvasGlobal.mobileScale);
ctxc.scale(wm.canvasGlobal.mobileScale,wm.canvasGlobal.mobileScale);
let selectArr = []; //创建圈选对象，判断是否点击在选中的内容上
let brushType = 1;  //画笔类型 1：普通画笔 2：板擦功能

let enc,crypt = new JSEncrypt();
crypt.setKey(sessionStorage.publicKey);
enc = crypt.encrypt(sessionStorage.userId);
let ws = new WebSocket(wm.URLW + '?userId=' + enc);// + '?userId=' + sessionStorage.userId
let wws;

//监听用户手势
let drawArrObject = {},mMasters = []; //drawArrObject传递信息数据集合   mMasters关键点
drawArrObject.header = {    //传递信息header部分用户信息
    command: "",    //命令类型
    fromDeviceType: wm.isPhone()?0:2,  //设备类型(0手机、1平板、2电脑、3大屏)
    fromUserId: sessionStorage.userId, //用户ID
    fromUserName: sessionStorage.userName,   //用户名称
    isHomeOwners: false,    //是否创建者
};

let eraserWidth = {};
let isDrawScale = true;
canvasDraw.Add('touchstart mousedown',function(e){  //开始绘制
    if(!isWrite){return false;};
    isDrawScale = true;
    if(e.touches){
        if(e.touches.length >= 2){
            isDrawScale = false;
            return false;
        }
    }
    let x,y,mx,my,mMastersi = 0,that = this,eraser,isDraw = false;
    x = e.touches?e.touches[0].clientX:e.clientX;
    y = e.touches?e.touches[0].clientY:e.clientY;
    if(thatData.brushShow){
        thatData.brushShow = false;
    }
    if(brushType === 2){
        //ctx.strokeStyle = thatData.backColor;  //thatData.backColor
        //ctx.fillStyle = thatData.backColor;
        ctx.strokeStyle = '#00000000';  //thatData.backColor
        ctx.fillStyle = '#00000000';
        eraserWidth.initWidth = 48 / wm.canvasGlobal.scale;
        eraserWidth.scaleWidth = 48;
        eraserWidth.width = wm.scaleTransform(48);
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
    x = wm.scaleTransform(x - wm.canvasGlobal.transX * wm.canvasGlobal.mobileScale);
    y = wm.scaleTransform(y - wm.canvasGlobal.transY * wm.canvasGlobal.mobileScale);
    eraserWidth.prevX = x;
    eraserWidth.prevY = y;
    ctxd.save();
    ctxd.translate(wm.canvasGlobal.transX,wm.canvasGlobal.transY);
    ctxd.scale(wm.canvasGlobal.scale,wm.canvasGlobal.scale);
    ctxd.beginPath((x, y));
    if(brushType == 2){
        ctx.save();
        ctx.translate(wm.canvasGlobal.transX,wm.canvasGlobal.transY);
        ctx.scale(wm.canvasGlobal.scale,wm.canvasGlobal.scale);
        //ctx.beginPath((x, y));
        //ctx.rect(x - eraserWidth.width/2,y - eraserWidth.width/2,eraserWidth.width,eraserWidth.width);
        //ctx.fill();
        //ctx.beginPath((x, y));
    }
    drawArrObject.header.command = 'opDoodle';
    drawArrObject.body = {
        ids: [],
        type: 1,
        x: x,
        y: y,
    };
    let globalId = ULID.ulid();
    if(brushType == 1){
        let u8Arr = new Int8Array(50);
        let i = 0;
        for(i;i<1; i++){   //画笔的类型，开始为1 中间为2 结束为3
            u8Arr[i] = 1;
        }
        for(i;i<27; i++){   //画笔的全局ID
            u8Arr[i] = globalId.charCodeAt(i-1);
        }
        for(i;i<43; i++){   //用户ID
            u8Arr[i] = 0;
        }
        for(i;i<44; i++){   // 画笔大小size
            u8Arr[i] = wm.canvasGlobal.brushWidth;
        }
        u8Arr[44] = (wm.canvasGlobal.brushColor.replace(/#/g, "0x") >> 24) & 0xFF;
        u8Arr[45] = (wm.canvasGlobal.brushColor.replace(/#/g, "0x") >> 16) & 0xFF;
        u8Arr[46] = (wm.canvasGlobal.brushColor.replace(/#/g, "0x") >> 8) & 0xFF;
        u8Arr[47] = wm.canvasGlobal.brushColor.replace(/#/g, "0x") & 0xFF;
        i = 48;
        for(i;i<49; i++){   //画笔的种类
            u8Arr[i] = 1;
        }
        for(i;i<50; i++){   //画笔的笔锋
            u8Arr[i] = 0;
        }
        wws.send(u8Arr);
    }
    let drawArr = [];
    let pointArr = [];
    let pointObj = {};
    if(brushType === 1){
        ctxd.strokeStyle = wm.canvasGlobal.brushColor;
        ctxd.lineWidth = wm.canvasGlobal.brushWidth * wm.canvasGlobal.mobileScale * wm.canvasGlobal.scale;
    }
    drawArr.push(-1);
    drawArr.push(x - wm.scaleTransform(wm.canvasGlobal.repairLeft));
    drawArr.push(y - wm.scaleTransform(wm.canvasGlobal.repairTop));
    pointObj.x = x - wm.scaleTransform(wm.canvasGlobal.repairLeft);
    pointObj.y = y - wm.scaleTransform(wm.canvasGlobal.repairTop);
    pointArr.push(pointObj)
    mMasters = [];
    mMasters.push(true);
    document.Add('touchmove mousemove',canvasDrawMove);
    document.Add('touchend mouseup',canvasDrawEnd);
    function canvasDrawMove(even){
        if(isDrawScale){
            isDraw = true;
            mMastersi++;
            mMasters.push(mMastersi%3 == 0?true:false);
            mx = even.touches?even.touches[0].clientX:even.clientX;
            my = even.touches?even.touches[0].clientY:even.clientY;
            if(brushType == 2){
                eraser.style.left = mx - eraserWidth.scaleWidth/2 + 'px';
                eraser.style.top = my - eraserWidth.scaleWidth/2 + 'px';
            }
            mx = wm.scaleTransform((mx - wm.canvasGlobal.transX * wm.canvasGlobal.mobileScale));
            my = wm.scaleTransform((my - wm.canvasGlobal.transY * wm.canvasGlobal.mobileScale));
            if(brushType == 1){
                let u8Arr = new Int8Array(31);
                let i = 0;
                for(i;i<1; i++){   //画笔的类型，开始为1 中间为2 结束为3
                    u8Arr[i] = 2;
                }
                for(i;i<27; i++){   //画笔的全局ID
                    u8Arr[i] = globalId.charCodeAt(i-1);
                }
                //画笔的x轴
                u8Arr[27] = parseInt(mx - wm.scaleTransform(wm.canvasGlobal.repairLeft)) >> 8;
                u8Arr[28] = parseInt(mx - wm.scaleTransform(wm.canvasGlobal.repairLeft)) & 0xff;
                //画笔的y轴
                u8Arr[29] = parseInt(my - wm.scaleTransform(wm.canvasGlobal.repairTop)) >> 8;
                u8Arr[30] = parseInt(my - wm.scaleTransform(wm.canvasGlobal.repairTop)) & 0xff;
                wws.send(u8Arr);
                ctxd.lineTo(mx, my);
                ctxd.stroke();
            }else if(brushType == 2){
                eraserWidth.x = mx;
                eraserWidth.y = my;
                ctx.save();
                ctx.beginPath();
                ctx.arc(eraserWidth.x,eraserWidth.y,eraserWidth.width/2,0,2*Math.PI);
                ctx.fill();
                ctx.clip();
                ctx.clearRect(0, 0, 3840, 2460);
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
                ctx.clearRect(0, 0, 3840, 2460);
                ctx.restore();
                eraserWidth.prevX = mx;
                eraserWidth.prevY = my;
                //ctx.clearRect(mx - eraserWidth.width/2, my - eraserWidth.width/2,eraserWidth.width,eraserWidth.width);
            }
            drawArr.push(-2);
            drawArr.push(mx - wm.scaleTransform(wm.canvasGlobal.repairLeft));
            drawArr.push(my - wm.scaleTransform(wm.canvasGlobal.repairTop));
            pointObj = {};
            pointObj.x = mx - wm.scaleTransform(wm.canvasGlobal.repairLeft);
            pointObj.y = my - wm.scaleTransform(wm.canvasGlobal.repairTop);
            pointArr.push(pointObj)
        }
    };
    function canvasDrawEnd(){
        if(e.touches){
            if(e.touches.length >= 2){
                return false;
            }
        }
        if(brushType == 2){
            n('body')[0].removeChild(eraser);
            //ctxd.clearRect(0,0,wm.canvasGlobal.width,wm.canvasGlobal.height);
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
            u8Arr[27] = parseInt(mx - wm.scaleTransform(wm.canvasGlobal.repairTop)) >> 8;
            u8Arr[28] = parseInt(mx - wm.scaleTransform(wm.canvasGlobal.repairTop)) & 0xff;
            //画笔的y轴
            u8Arr[29] = parseInt(my - wm.scaleTransform(wm.canvasGlobal.repairTop)) >> 8;
            u8Arr[30] = parseInt(my - wm.scaleTransform(wm.canvasGlobal.repairTop)) & 0xff;
            wws.send(u8Arr);
        }
        ctxd.restore();
        document.Remove('touchmove mousemove',canvasDrawMove);
        document.Remove('touchend mouseup',canvasDrawEnd);
        if(!isDraw){    //没有移动则为无效绘制
            ctxd.clearRect(0,0,wm.canvasGlobal.width,wm.canvasGlobal.height);
            return false;
        }
        drawArrObject.body.data = [
            {
                className: 'DoodlePath',
                mBound: {},
                mOriginBound: {},
                mOriginLocation: {},
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
                    mColor: intHex(wm.canvasGlobal.brushColor), //该次涂鸦数值
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
                mSize: wm.canvasGlobal.brushWidth,
                type: 0,
            },
        ];
        whiteSum.resetLocationBounds(drawArrObject.body.data[0],1);
        drawArrObject.body.x = drawArrObject.body.data[0].mBound.right;
        drawArrObject.body.y = drawArrObject.body.data[0].mBound.bottom;
        if(brushType == 1){
            startDraw(ctx,drawArrObject.body.data[0]);
            addSend(drawArrObject);
            ctxd.clearRect(0,0,wm.canvasGlobal.width,wm.canvasGlobal.height);
        }else if(brushType == 2){
            drawArrObject.header.command = 'eraser';
            drawArrObject.body.points = pointArr;
            drawArrObject.body.data[0].mSize = eraserWidth.width * 1.1;
            eraserAlgo(drawArrObject.body.data[0].mBound,drawArrObject.body.data);
            thatData.joinShow = true;
            ws.send(JSON.stringify(drawArrObject));
        }
    };
});

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
function startDraw(context,e){
    context.save();
    context.translate(wm.canvasGlobal.transX,wm.canvasGlobal.transY);
    context.scale(wm.canvasGlobal.scale,wm.canvasGlobal.scale);
    context.translate(wm.scaleTransform(wm.canvasGlobal.repairLeft),wm.scaleTransform(wm.canvasGlobal.repairTop));
    let {mPath,mColor,mLocation,mRect,mSize,mItemRotate,mPivotX,mPivotY,mBaseScale,mOverturnX,mOverturnY,className,type,mText,mTextSize,srcUrl,mDstRect,boardColor,solidColor,fileName} = e;
    let ox = mPivotX - mLocation.x,oy = mPivotY - mLocation.y;
    // context.strokeStyle = '#FFFFFF';
    // context.rect(mBound.left,mBound.top,mBound.right - mBound.left,mBound.bottom - mBound.top);
    // context.stroke();
    context.translate(mLocation.x,mLocation.y);
    context.translate(ox,oy);
    context.scale(mBaseScale * mOverturnX , mBaseScale * mOverturnY);
    context.rotate(mItemRotate * Math.PI/180);
    context.translate(-ox,-oy);
    if(className == 'DoodleText'){  //文字渲染
        context.font = mTextSize + 'px sans-serif';
        context.fillStyle = parseHex(mColor.mColor);
        context.fillText(mText,0,mTextSize);
    }else if(className == 'DoodleMindBitmap' || className === "DoodleBitmap"){  //图片渲染
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
        context.strokeStyle = parseHex(mColor.mColor);
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
                    context.arc(mPath.savePoints[i + 1], mPath.savePoints[i + 2], mPath.savePoints[i + 3],0, 2 * Math.PI, false);
                    i += 4;
                    break;
                case -6:    //ovalType绘制椭圆  ellipse
                    context.ellipse(mPath.savePoints[i + 1], mPath.savePoints[i + 2], mPath.savePoints[i + 3], mPath.savePoints[i + 4],0,0,Math.PI*2);
                    i += 5;
                    break;
                case -7:    //arcType绘制弧线  arc
                    context.arc(mPath.savePoints[i + 1], mPath.savePoints[i + 2], mPath.savePoints[i + 3], mPath.savePoints[i + 4], mPath.savePoints[i + 5], mPath.savePoints[i + 6]);
                    i += 7;
                    break;
                case -8:    //arcToType暂未用到
                    //canvas.add(new ActionArcTo(savePoints.get(index + 1), savePoints.get(index + 2), savePoints.get(index + 3), savePoints.get(index + 4), savePoints.get(index + 5), savePoints.get(index + 6)));
                    i += 6;
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
        wm.initScale();
        canvas.width = wm.canvasGlobal.width * wm.canvasGlobal.mobileScale;
        canvas.height = wm.canvasGlobal.height * wm.canvasGlobal.mobileScale;
        canvasActual.width = wm.canvasGlobal.width * wm.canvasGlobal.mobileScale;
        canvasActual.height = wm.canvasGlobal.height * wm.canvasGlobal.mobileScale;
        canvasDraw.width = wm.canvasGlobal.width * wm.canvasGlobal.mobileScale;
        canvasDraw.height = wm.canvasGlobal.height * wm.canvasGlobal.mobileScale;
        circlSelect.width = wm.canvasGlobal.width * wm.canvasGlobal.mobileScale;
        circlSelect.height = wm.canvasGlobal.height * wm.canvasGlobal.mobileScale;
    
        ctx = canvas.getContext('2d');
        ctxa = canvasActual.getContext('2d');
        ctxd = canvasDraw.getContext('2d');
        ctxc = circlSelect.getContext('2d');
        ctx.scale(wm.canvasGlobal.mobileScale,wm.canvasGlobal.mobileScale);
        ctxa.scale(wm.canvasGlobal.mobileScale,wm.canvasGlobal.mobileScale);
        ctxd.scale(wm.canvasGlobal.mobileScale,wm.canvasGlobal.mobileScale);
        ctxc.scale(wm.canvasGlobal.mobileScale,wm.canvasGlobal.mobileScale);
        for(let i of wm.brushArr){
            startDraw(ctx,i);
        }
    }
}

let actualTimeArr = []; //实时绘制数组
ws.onopen = function(){
    log('我连上了');
    timoer?clearInterval(timoer):false;
    thatData.tipsShow = false;
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
        ws.send(u8Arr);
    }
    initSync();
    let drawArrObjectHeart = {};
    drawArrObjectHeart.header = {    //传递信息header部分用户信息
        command: "heartBeat",    //命令类型
        fromDeviceType: wm.isPhone()?0:2,  //设备类型(0手机、1平板、2电脑、3大屏)
        fromUserId: sessionStorage.userId, //用户ID
        fromUserName: sessionStorage.userName,   //用户名称
        isHomeOwners: false,    //是否创建者
    };
    setInterval(function (){
        ws.send(JSON.stringify(drawArrObjectHeart));
    }, 5000);


    //实时绘制同步接口
    wws = new WebSocket(wm.URLWS + '?userId=' + enc);// + '?userId=' + sessionStorage.userId

    wws.onopen = function(){
        log('我也连上了');
    }

    wws.onclose = function(){
        log('我关闭了');
    }

    wws.onerror = function(){
        log('我出错了');
    }
    wws.onmessage = function(data){
        if(typeof(data.data) == 'object'){
            let file =  new FileReader();
            file.readAsArrayBuffer(data.data);
            file.onload = function(g){
                let utf8 = new Int8Array(g.currentTarget.result);
                let globalId = utf8.slice(1,27); //画笔全局ID
                function Uint8ArrayToString(fileData){
                    var dataString = "";
                    for (var i = 0; i < fileData.length; i++) {
                      dataString += String.fromCharCode(fileData[i]);
                    }
                    return dataString;
                }
                globalId = Uint8ArrayToString(globalId);
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
                        userId: userId,
                        savePoints: [],
                        isPush: true,
                    };
                    drawStart(ctxa,parseHex(toInt32(color)),size);
                    actualTimeArr.push(actualTimeObj);
                }else if(utf8[0] == 2){
                    for(let i of actualTimeArr){
                        if(i.globalId == globalId&&i.isPush){
                            let x = utf8.slice(27,29);  //点的x轴
                            let y = utf8.slice(29,31);  //点的y轴
                            //let width = utf8.slice(31,32);  //点的宽度（初版默认无笔锋）  笔锋才会用到
                            i.savePoints.push({x: x,y: y});
                            function toUInt16(bytes) {
                               return ((bytes[0] & 0xFF) << 8) | (bytes[1] & 0xFF);
                            }
                            function toInt16(bytes) {
                                return bytes[0] >> 7 == 0 ? toUInt16(bytes) : toUInt16(bytes) - 65536;
                            }
                            drawMove(ctxa,toInt16(x),toInt16(y))
                        }
                    }
                }else if(utf8[0] == 3){
                    for(let i of actualTimeArr){
                        if(i.globalId == globalId){
                            let x = utf8.slice(27,29);  //点的x轴
                            let y = utf8.slice(29,31);  //点的y轴
                            i.savePoints.push({x: x,y: y});
                            i.isPush = false;
                            function toUInt16(bytes) {
                               return ((bytes[0] & 0xFF) << 8) | (bytes[1] & 0xFF);
                            }
                            function toInt16(bytes) {
                                return bytes[0] >> 7 == 0 ? toUInt16(bytes) : toUInt16(bytes) - 65536;
                            }
                            drawEnd(ctxa,toInt16(x),toInt16(y))
                        }
                    }
                }
            }
        }
    }
}

function drawStart(cxt,color,width){
    cxt.save();
    cxt.translate(wm.canvasGlobal.transX,wm.canvasGlobal.transY);
    cxt.scale(wm.canvasGlobal.scale,wm.canvasGlobal.scale);
    cxt.translate(wm.scaleTransform(wm.canvasGlobal.repairLeft),wm.scaleTransform(wm.canvasGlobal.repairTop));
    cxt.beginPath();
    cxt.strokeStyle = color;
    cxt.lineWidth = wm.backScaleTransform(width);
}
function drawMove(cxt,x,y){
    cxt.lineTo(x, y);
    cxt.stroke();
}
function drawEnd(cxt,x,y){
    cxt.restore();
}

ws.isReconnect = function(){
    log(123);
}

let timoer,count;

ws.onerror = function(e){
    log('连接发生了错误');
    log(e);
    count = 10;
    thatData.tipsImage = 'src/waring.png';
    thatData.tipsText = thatData.connectionBroken + '('+count+'s)';
    thatData.tipsShow = true;
    timoer = setInterval(function(){
        ws = new WebSocket(wm.URLW + '?userId=' + enc);// + '?userId=' + sessionStorage.userId
        count--;
        if(count <= 0){
            clearInterval(timoer);
            thatData.tipsText = thatData.connectionError;
            sessionStorage.userId = '';
            isWrite = false;
        }else{
            thatData.tipsText = thatData.connectionBroken + '('+count+'s)';
        }
    },1000)
}

ws.onclose = function(e){
    log('连接已被断开');
    log(e);
    count = 10;
    thatData.tipsImage = 'src/waring.png';
    thatData.tipsText = thatData.connectionBroken + '('+count+'s)';
    thatData.tipsShow = true;
    timoer = setInterval(function(){
        ws = new WebSocket(wm.URLW + '?userId=' + enc);// + '?userId=' + sessionStorage.userId
        count--;
        if(count <= 0){
            clearInterval(timoer);
            thatData.tipsText = thatData.connectionError;
            sessionStorage.userId = '';
            isWrite = false;
        }else{
            thatData.tipsText = thatData.connectionBroken + '('+count+'s)';
        }
    },1000)
}

let initX = 0,initY = 0;  //初始涂鸦坐标纪录
let stepArr = [];       //步骤总记录
let currentStep = [];   //当前展示步骤
let stepInx = 0;        //当前步骤索引
let idsMap = new Map(); //涂鸦操作时需要此map来做遍历
//addStep();
//stepPrevDisabled(true);
function addStep(){
    stepInx = stepArr.length;
    stepArr.push(JSON.parse(JSON.stringify((currentStep))));
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
    if(stepInx > 0){
        stepInx--;
        moveStep(stepInx);
        recallStep();
    }
}
function nextStep(obj){
    if(stepInx < stepArr.length-1){
        stepInx++;
        moveStep(stepInx);
        recallStep();
    }else{
        stepNextDisabled(true);
    }
}

function moveStep(inx){
    stepPrevDisabled(inx > 0?false:true);
    stepNextDisabled(inx < stepArr.length - 1?false:true);
    currentStep = JSON.parse(JSON.stringify(stepArr[inx]));
    brushStep();
}

function recallStep(){
    drawArrObject.header.command = 'opDoodle';
    drawArrObject.body = {
        ids: currentStep,
        type: 9,
        x: 0,
        y: 0,
    };
    drawArrObject.body.data = {step: stepInx};
    ws.send(JSON.stringify(drawArrObject));
}

function brushStep(){
    ctx.clearRect(0,0,wm.canvasGlobal.width,wm.canvasGlobal.height);
    wm.brushArr = [];
    for(let i of wm.brushTotalArr){
        if(i){
            for(let j of currentStep){
                if(j == i.globalId){
                    wm.brushArr.push(i);
                    startDraw(ctx,i);
                }
            }
        }
    }
}

let roomExit = true;

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
                for(let i of wm.brushArr){
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
            }else if(utf8[35] == 3){    //加入房间接受信息
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
                                stepArr: stepArrs,       	//步骤总记录
                                currentStep: stepArrs[k.doodleData.currentStep],   	//当前展示步骤
                                stepInx: k.doodleData.currentStep,        	//当前步骤索引
                                canvasGlobal: JSON.parse(JSON.stringify(wm.initCanvasGlobal)),	//当前页面数据
                            }
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
                        let pageListJson = data.pageList[data.currentPageIndex],stepObj;
                        wm.canvasGlobal.scale = pageListJson.doodleState.scale;
                        wm.canvasGlobal.scales = pageListJson.doodleState.scale;
                        wm.canvasGlobal.transX = pageListJson.doodleState.transX;
                        wm.canvasGlobal.transY = pageListJson.doodleState.transY;
                        wm.canvasGlobal.transXs = pageListJson.doodleState.transX;
                        wm.canvasGlobal.transYs = pageListJson.doodleState.transY;
                        thatData.backColor = pageListJson.doodleState.bgColor?pageListJson.doodleState.bgColor:'#515355';
                        thatData.backImage = 'url("src/back/'+(pageListJson.doodleState.bgGrid?pageListJson.doodleState.bgGrid:1)+'.png")';

                        //步骤数据同步
                        for(let i = 0;i < pageListJson.doodleData.stepData.length; i++){
                            idsMap.clear();
                            stepObj = [];
                            for(let j of pageListJson.doodleData.stepData[i].ids){
                                idsMap.set(j,1);
                            }
                            for(let j of pageListJson.doodleData.indexData){
                                if(j&&j.globalId){
                                    if(idsMap.has(j.id)){
                                        stepObj.push(j.globalId);
                                    }
                                }
                            }
                            if(i == data.currentPageIndex){
                                currentStep = JSON.parse(JSON.stringify(stepObj));
                                for(let j of pageListJson.doodleData.indexData){
                                    if(j&&j.globalId){
                                        //if(idsMap.has(j.id)){
                                        if(j.className == 'DoodleBitmap'||j.className == 'DoodleMindBitmap'){
                                            j.mOriginBound = {
                                                left: j.mLocation.x,
                                                right: j.mLocation.x + j.mDstRect.right,
                                                top: j.mLocation.y,
                                                bottom: j.mLocation.y + j.mDstRect.bottom,
                                            };
                                            j.mBound = {};
                                            try{    //如果获取图片报错，将直接跳过获取图片逻辑
                                                msg.file('work/page1/file/'+j.id+'.png').async('uint8array').then(function(datas){
                                                    let utf8Blob = URL.createObjectURL(new Blob([datas], { type: 'image/jpeg' }));
                                                    let image = new Image();
                                                    image.src = utf8Blob;
                                                    j.srcUrl = image;
                                                    for(let o of wm.pagesArr){
                                                        for(let y of o.brushArr){
                                                            if(y.globalId == j.globalId){
                                                                y.srcUrl = image;
                                                            }
                                                        }
                                                    }
                                                    image.onload = function(){
                                                        for(let o of wm.brushArr){
                                                            if(o.id == j.id){
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
                                        //wm.pagesArr[data.currentPageIndex].brushArr.push(j);
                                        //}
                                    }
                                }
                            }
                            stepArr.push(stepObj);
                        }

                        //画笔总数据同步
                        // for(let i of pageListJson.doodleData.indexData){
                        //     if(i){
                        //         wm.brushTotalArr.push(i);
                        //     }
                        // }
                        wm.brushArr = wm.pagesArr[data.currentPageIndex].brushArr;
                        wm.brushTotalArr = wm.pagesArr[data.currentPageIndex].brushTotalArr;
                        stepInx = pageListJson.doodleData.currentStep;
                        ctx.clearRect(0,0,wm.canvasGlobal.width,wm.canvasGlobal.height);
                        for(let i of wm.brushArr){
                            if(i.type == 17){
                                let image = new Image();
                                image.src = 'src/3d/' + i.fileName;
                                i.srcUrl = image;
                                image.onload = function(){
                                    startDraw(ctx,i);
                                }
                            }else{
                                startDraw(ctx,i);
                            }
                        }
                        thatData.upDate({
                            joinShow: false,
                            joinText: '',
                            stickerShow: true,
                            stickerImage: 'src/success.png',
                            stickerText: dataObj.main.stickerSuccess,
                        })
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
    if(data.header.command !== 'heartAck'){
        log(data);
    }
    if(!data){return;};
    if(data.body){
        if(data.body.code === 10400){
            thatData.joinShow = false;
            thatData.reconnectShow = true;
        }
    }
    switch(data.header.command){
        case 'opDoodle':
            switch(data.body.type){
                case 1: //涂鸦添加一组数据
                    for(let i of data.body.data){
                        wm.brushArr.push(i);
                        wm.brushTotalArr.push(i);
                        if(i.type == 17){
                            let image = new Image();
                            image.src = 'src/3d/' + i.fileName;
                            i.srcUrl = image;
                            image.onload = function(){
                                startDraw(ctx,i);
                                currentStep.push(i.globalId);
                            }
                        }else{
                            startDraw(ctx,i);
                            currentStep.push(i.globalId);
                        }
                        for(let j = actualTimeArr.length - 1; j >=0 ; j--){
                            if(i.globalId == actualTimeArr[j].globalId){
                                actualTimeArr.splice(j,1);
                            }
                        }
                    }
                    addStep();
                    break;
                case 2: //涂鸦删除一组数据
                    idsMap.clear();
                    for(let i of data.body.ids){
                        idsMap.set(i,1);
                    }
                    for(let i = wm.brushArr.length - 1; i >= 0; i--){
                        if(idsMap.has(wm.brushArr[i].globalId)){
                            wm.brushArr.splice(i,1);
                            currentStep.splice(i,1);
                        };
                    }
                    for(let i = selectArr.length - 1; i >= 0; i--){
                        if(idsMap.has(selectArr[i].globalId)){
                            selectArr.splice(i,1);
                            for(let j = 0; j < currentStep.length; j++){
                                if(currentStep[j].globalId == selectArr[i].globalId){
                                    currentStep.splice(j,1);
                                }
                            }
                        };
                    }
                    addStep();
                    ctx.clearRect(0,0,wm.canvasGlobal.width,wm.canvasGlobal.height);
                    for(let i of wm.brushArr){
                        startDraw(ctx,i);
                    }
                    break;
                case 3: //涂鸦移动一组数据
                    idsMap.clear();
                    for(let i of data.body.ids){
                        idsMap.set(i,data.body);
                    }
                    if(data.body.data.moveState == 0){
                        initX = data.body.data.toX;
                        initY = data.body.data.toY;
                        for(let i of wm.brushArr){
                            if(idsMap.has(i.globalId)){
                                i.mLocation.ox = i.mLocation.x;
                                i.mLocation.oy = i.mLocation.y;
                                i.mPivotOx = i.mPivotX;
                                i.mPivotOy = i.mPivotY;
                                if(i.mOriginBound){
                                    i.mOriginBoundO = i.mOriginBound;
                                }
                            }
                        }
                    }
                    ctx.clearRect(0,0,wm.canvasGlobal.width,wm.canvasGlobal.height);
                    for(let i of wm.brushArr){
                        if(idsMap.has(i.globalId)){
                            if(!i.mOriginBoundO){
                                i.mOriginBoundO = i.mOriginBound;
                            }
                            log(idsMap.get(i.globalId).data,initX,initY);
                            i.mLocation.x = i.mLocation.ox + idsMap.get(i.globalId).data.toX - initX;
                            i.mLocation.y = i.mLocation.oy + idsMap.get(i.globalId).data.toY - initY;
                            i.mPivotX = i.mPivotOx + idsMap.get(i.globalId).data.toX - initX;
                            i.mPivotY = i.mPivotOy + idsMap.get(i.globalId).data.toY - initY;
                            if(i.mOriginBound){
                                i.mOriginBound.left = i.mOriginBoundO.left + idsMap.get(i.globalId).data.toX - initX;
                                i.mOriginBound.right = i.mOriginBoundO.right + idsMap.get(i.globalId).data.toX - initX;
                                i.mOriginBound.top = i.mOriginBoundO.top + idsMap.get(i.globalId).data.toY - initY;
                                i.mOriginBound.bottom = i.mOriginBoundO.bottom + idsMap.get(i.globalId).data.toY - initY;
                                wm.calculateBound(i);
                            }
                        }
                        startDraw(ctx,i);
                    }
                    break;
                case 4: //涂鸦颜色变更
                    idsMap.clear();
                    for(let i of data.body.ids){
                        idsMap.set(i,data.body);
                    }
                    for(let i of wm.brushArr){
                        if(idsMap.has(i.globalId)){
                            i.mColor.mColor = idsMap.get(i.globalId).data.color;
                        }
                        startDraw(ctx,i);
                    }
                    break;
                case 5: //涂鸦旋转一组数据
                    idsMap.clear();
                    for(let i of data.body.ids){
                        idsMap.set(i,data.body);
                    }
                    ctx.clearRect(0,0,wm.canvasGlobal.width,wm.canvasGlobal.height);
                    for(let i of wm.brushArr){
                        if(idsMap.has(i.globalId)){
                            wm.setItemRotate(i,idsMap.get(i.globalId).data,1); 
                        }
                        startDraw(ctx,i);
                    }
                    break;
                case 6: //涂鸦缩放
                    idsMap.clear();
                    for(let i of data.body.ids){
                        idsMap.set(i,data.body);
                    }
                    ctx.clearRect(0,0,wm.canvasGlobal.width,wm.canvasGlobal.height);
                    for(let i of wm.brushArr){
                        if(idsMap.has(i.globalId)){
                            wm.setItemRotate(i,idsMap.get(i.globalId).data,2);
                        }
                        startDraw(ctx,i);
                    }
                    break;
                case 7: //涂鸦反转
                    idsMap.clear();
                    for(let i of data.body.ids){
                        idsMap.set(i,data.body);
                    }
                    ctx.clearRect(0,0,wm.canvasGlobal.width,wm.canvasGlobal.height);
                    for(let i of wm.brushArr){
                        if(idsMap.has(i.globalId)){
                            wm.setItemRotate(i,idsMap.get(i.globalId).data,3);
                        }
                        startDraw(ctx,i);
                    }
                    break;
                case 8: //替换（板擦擦除）
                    idsMap.clear();
                    for(let i of data.body.ids){
                        idsMap.set(i,data.body);
                    }
                    ctxd.clearRect(0,0,wm.canvasGlobal.width,wm.canvasGlobal.height);
                    ctx.clearRect(0,0,wm.canvasGlobal.width,wm.canvasGlobal.height);
                    for(let i = wm.brushArr.length - 1; i >= 0; i--){
                        if(idsMap.has(wm.brushArr[i].globalId)){
                            wm.brushArr.splice(i,1);
                            currentStep.splice(i,1);
                        };
                    }
                    for(let i of data.body.data){
                        wm.brushArr.push(i);
                        wm.brushTotalArr.push(i);
                        currentStep.push(i.globalId);
                    }
                    addStep();
                    for(let i of wm.brushArr){
                        startDraw(ctx,i);
                    }
                    thatData.joinShow = false;
                    break;
                case 9: //回溯（进一步与退一步）
                    moveStep(data.body.data.step);
                    break;
                case 10:   //复制
                    let selectArrCopy = [];
                    for(let i of data.body.ids){
                        for(let j of wm.brushTotalArr){
                            if(j){
                                if(j.globalId == i){
                                    selectArrCopy.push(j);
                                }
                            }
                        }
                    }
                    for(let i = 0; i < selectArrCopy.length; i++){
                        let selectArrObj = JSON.parse(JSON.stringify(selectArrCopy[i]));
                        selectArrObj.globalId = data.body.data.ids[i];
                        selectArrObj.mLocation.x += selectObject.offset;
                        selectArrObj.mLocation.y += selectObject.offset;
                        selectArrObj.mPivotX += selectObject.offset;
                        selectArrObj.mPivotY += selectObject.offset;
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
                        wm.brushArr.push(selectArrObj);
                        wm.brushTotalArr.push(selectArrObj);
                    }
                    addStep();
                    ctx.clearRect(0,0,wm.canvasGlobal.width,wm.canvasGlobal.height);
                    for(let i of wm.brushArr){
                        startDraw(ctx,i);
                    }
                    break;
                default:
                    break;
            }
            if(data.body.type == 1||data.body.type == 3||data.body.type == 5||data.body.type == 6||data.body.type == 7||data.body.type == 10||data.body.type == 4){ //操作指针显示
                let handObj = {};
                // <div class="hand" wm-for="handArr" for-style="backgroundImage: image;left: left;top: top;">
                //     <span for-style="backgroundColor: color;" for-bind="text"></span>
                // </div>
                handObj.bool = false;
                for(let i of c('hand')){
                    if(i.dataset.user == data.header.fromUserId){
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
                handObj.text = data.header.fromUserName;
                handObj.left = wm.backScaleTransform(data.body.x) + wm.backScaleTransform(wm.canvasGlobal.transX / wm.canvasGlobal.scale) + wm.canvasGlobal.repairLeft + 'px';
                handObj.top = wm.backScaleTransform(data.body.y) + wm.backScaleTransform(wm.canvasGlobal.transY / wm.canvasGlobal.scale) + wm.canvasGlobal.repairTop + 'px';
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
                handObj.userId = data.header.fromUserId;
                handDiv.setAttribute('data-user',handObj.userId);
                if(data.header.fromDeviceType == 3){
                    let isLandlord = false;
                    for(let i of thatData.devList){
                        if(i.isLandlord == 1){
                            if(i.userId == data.header.fromUserId){
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
                }else if(data.header.fromDeviceType == 2){
                    handObj.image = 'url("src/icon/hand/3.png")';
                    handObj.color = '#9B7CF8';
                }else if(data.header.fromDeviceType == 0){
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
            break;
        case 'canvasClear': //清空画布
            wm.brushArr = [];
            selectArr = [];
            currentStep = [];
            addStep();
            thatData.circScaleRotateShow = false;
            thatData.circControllerShow = false;
            ctx.clearRect(0,0,wm.canvasGlobal.width,wm.canvasGlobal.height);
            ctxc.clearRect(0,0,wm.canvasGlobal.width,wm.canvasGlobal.height);
            break;
        case 'canvasScale': //缩放or移动画布
            if(thatData.controllerLeftShow){
                wm.canvasGlobal.scales = data.body.scale;
                wm.canvasGlobal.transXs = data.body.transX;
                wm.canvasGlobal.transYs = data.body.transY;
                wm.canvasGlobal.scale = data.body.scale;
                wm.canvasGlobal.transX = data.body.transX;
                wm.canvasGlobal.transY = data.body.transY;
                ctx.clearRect(0,0,wm.canvasGlobal.width,wm.canvasGlobal.height);
                for(let i of wm.brushArr){
                    startDraw(ctx,i);
                }
            }else{
                wm.canvasGlobal.scales = data.body.scale;
                wm.canvasGlobal.transXs = data.body.transX;
                wm.canvasGlobal.transYs = data.body.transY;
            }
            break;
        case 'opPage': //切换页面
            for(let i of selectArr){
                wm.brushArr.push(i);
            }
            ctx.clearRect(0,0,wm.canvasGlobal.width,wm.canvasGlobal.height);
            ctxc.clearRect(0,0,wm.canvasGlobal.width,wm.canvasGlobal.height);
            selectArr = [];
            log(data.body.type);
            if(data.body.type == 1){    //切换页面
                let pageObj = wm.pagesArr[data.body.index];
                log(pageObj);
                wm.brushTotalArr = pageObj.brushTotalArr;
                wm.brushArr = pageObj.brushArr;
                wm.stepArr = pageObj.stepArr;
                wm.currentStep = pageObj.currentStep;
                wm.stepInx = pageObj.stepInx;
                wm.canvasGlobal = pageObj.canvasGlobal;
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
                    canvasGlobal: JSON.parse(JSON.stringify(wm.initCanvasGlobal)),	//当前页面数据
                }
                wm.pagesArr.push(pageObj);
                wm.brushTotalArr = pageObj.brushTotalArr;
                wm.brushArr = pageObj.brushArr;
                wm.stepArr = pageObj.stepArr;
                wm.currentStep = pageObj.currentStep;
                wm.stepInx = pageObj.stepInx;
                wm.canvasGlobal = pageObj.canvasGlobal;
            }else{  // == 2 删除页面
                wm.pagesArr.splice(data.body.index,1);
            }
            for(let i of wm.brushArr){  
                startDraw(ctx,i);
            }
            break;
        case 'updateBg':    //改换背景色与背景图
            thatData.backColor = data.body.bgColor;
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
                log(data.body.toUserId,sessionStorage.userId);
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
            for(let i of thatData.devList){
                if(i.userId == data.header.fromUserId){
                    if(i.isLandlord == 1){
                        thatData.reconnectShow = false;
                    }
                }
            }
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
        realScale = wm.canvasGlobal.scale;
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
            if(oxTxScale > 0.25 && oxTxScale < 4){
                // if(window.innerWidth/wm.canvasGlobal.initWidth <= window.innerHeight/wm.canvasGlobal.initHeight){
                //     wm.canvasGlobal.repairTop = wm.canvasGlobal.initRepairTop / wm.canvasGlobal.initScale;
                // }else{
                //     wm.canvasGlobal.repairLeft = wm.canvasGlobal.initRepairLeft / wm.canvasGlobal.initScale;
                // }
                wm.canvasGlobal.scale = oxTxScale;
            }
            if(oxTxScale <= 0.25){
                wm.canvasGlobal.scale = 0.25;
            }
            if(oxTxScale >= 4){
                wm.canvasGlobal.scale = 4;
            }
            ctx.clearRect(0,0,wm.canvasGlobal.width,wm.canvasGlobal.height);
            for(let i of wm.brushArr){
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
window.onkeydown = function(data){
    if(data.keyCode == 17){
        document.Add('mousewheel',mouseweel);
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
let touchend = true;
function mouseweel(e){
    if(thatData.controllerLeftShow){
        thatData.controllerLeftShow = false;
    }
    thatData.maskShow = false;
    if(touchend){
        touchend = false;
        if(e.wheelDelta/360 + wm.canvasGlobal.scale < 0.25){
            wm.canvasGlobal.scale = 0.25;
        }else if(e.wheelDelta/360 + wm.canvasGlobal.scale > 4){
            wm.canvasGlobal.scale = 4;
        }else{
            wm.canvasGlobal.scale = e.wheelDelta/360 + wm.canvasGlobal.scale;
        }

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
        ctx.clearRect(0,0,wm.canvasGlobal.width,wm.canvasGlobal.height);
        for(let i of wm.brushArr){
            startDraw(ctx,i);
        }
        setTimeout(function(){
            touchend = true;
        },100)
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

document.body.addEventListener('touchmove', function (e) {
    //如果设备列表与会议信息滑动则生效，屏蔽移动端其他滚动条事件
    if(e.target.className !== 'dev_temp'&&e.target.className !== 'info_temp'){
        e.preventDefault();
    };
}, {passive: false})

//初始为页面添加初始数据
let pageObj = {
    brushTotalArr: wm.brushTotalArr,	//总数据记录
    brushArr: wm.brushArr,		//当前数据记录
    stepArr: stepArr,       	//步骤总记录
    currentStep: currentStep,   	//当前展示步骤
    stepInx: stepInx,        	//当前步骤索引
    selectArr: selectArr,       //当前选中数据
    canvasGlobal: JSON.parse(JSON.stringify(wm.initCanvasGlobal)),	//当前页面数据
}
wm.pagesArr.push(pageObj);

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