let thatData = objMonitor(wm.thatData);

//导入多语言翻译文案
for(let i in dataObj.index){
    thatData[i] = dataObj.index[i];
}
//页面初始化
function start(){
    //初始化页面文案
    thatData.upDate({
        warning: '',
        tipsShow: false,
        meetNumSelect: false,
        tipsText: '',
        roomIdArr: [],
    });
    if(localStorage.roomIdArr){
        // for(let i = 0; i < 4; i ++){
        //     for(let j of JSON.parse(localStorage.roomIdArr)){
        //         thatData.roomIdArr.push(j);
        //     }
        // }
        // thatData.roomIdArr = thatData.roomIdArr;
        thatData.roomIdArr = JSON.parse(localStorage.roomIdArr);
        let isNull = true;
        for(let i of thatData.roomIdArr){
            if(!i.value){
                isNull = false;
            }
        }
        if(isNull){
            if(thatData.roomIdArr.length !== 0){
                thatData.roomIdArr.push({name: thatData.emptyAll,value: ''});
                c('meetNumSelect')[0].style.visibility = 'visible';
            }else{
                c('meetNumSelect')[0].style.visibility = 'hidden';
            }
        }
        thatData.roomIdArr = thatData.roomIdArr;
    }
}
start();