let thatData = objMonitor(wm.thatData);

if(!sessionStorage.userId){
    window.location.href = 'index.html';
}

//导入多语言翻译文案
for(let i in dataObj.history){
    thatData[i] = dataObj.history[i];
}

thatData.upDate({
    imageBack: '',
    downFixed: false,
    prev: 'src/history/prev.png',
    next: 'src/history/next.png',
    currentPage: 1,
    totalPage: 0,
})

let imageArray = [];

ajax({
    url: wm.URLS + '/board-center/roomController/getCloudShareBackup',
    data: {
        roomId: sessionStorage.roomId,
    },
    dataType: 'json',
    success: function(data){
        log(data);
        log(data.data.imgUrls);
        data.data.imgUrls = data.data.imgUrls;
        if(data.code == 200){
            for(let i of data.data.imgUrls.split(',')){
                imageArray.push(i.replace("http://","https://"));
            }
            thatData.imageBack = imageArray[0];
            thatData.totalPage = imageArray.length;
        }
    }
})

c('controller_prev')[0].Click(function(){
    if(thatData.currentPage > 1){
        thatData.currentPage--;
        thatData.prev = 'src/history/prevs.png';
    }
},function(){
    thatData.prev = 'src/history/prev.png';
    thatData.imageBack = imageArray[thatData.currentPage-1];
},true)
c('controller_next')[0].Click(function(){
    if(thatData.currentPage < imageArray.length){
        thatData.currentPage++;
        thatData.next = 'src/history/nexts.png';
    }
},function(){
    thatData.next = 'src/history/next.png';
    //thatData.imageBack = 'url(' + imageArray[thatData.currentPage-1] + ')';
    thatData.imageBack = imageArray[thatData.currentPage-1];
},true)

c('controller_down')[0].Click(function(){
    thatData.downFixed = true;
    //d('download').href = imageArray[thatData.currentPage-1];
    //d('download').click();
});
d('downLoad').Click(function(){
    if(document.querySelector('input[name="imageSelect"]:checked').value == 'jpeg'){
        ajax({
            type: 'get',
            url: imageArray[thatData.currentPage-1],
            responseType: 'arraybuffer',
            response: true,
            success: function(data,xhr){
                var imageType = xhr.getResponseHeader("Content-Type");
                var blob = new Blob([data], { type: imageType });
                var imageUrl = (window.URL || window.webkitURL).createObjectURL(blob);
                let image = new Image();
                image.src = imageUrl;
                image.onload = function(){// 创建Canvas元素
                    var canvas = create('canvas');
                    canvas.width = image.width;
                    canvas.height = image.height;
                    
                    // 将PNG图像绘制到Canvas中
                    var ctx = canvas.getContext('2d');
                    ctx.drawImage(image, 0, 0);
                    
                    // 将Canvas转换为JPEG格式
                    var jpegUrl = canvas.toDataURL('image/jpeg');
                    
                    // 创建下载链接
                    var downloadLink = create('a');
                    downloadLink.href = jpegUrl;
                    downloadLink.download = 'download.jpeg';
                    // 触发下载
                    downloadLink.click();
                }
            }
        });
    }else if(document.querySelector('input[name="imageSelect"]:checked').value == 'png'){
        var downloadLink = create('a');
        downloadLink.href = imageArray[thatData.currentPage-1];
        // 触发下载
        downloadLink.click();
    }else{
        //let inxArray = [];
        // for(let i of imageArray){
        //     ajax({
        //         type: 'get',
        //         url: i,
        //         success: function(data,xhr){
        //             inx++;
        //             var imageType = xhr.getResponseHeader("Content-Type");
        //             var blob = new Blob([data], { type: imageType });
        //             var imageUrl = (window.URL || window.webkitURL).createObjectURL(blob);
        //             inxArray.push(imageUrl);
        //             imageToPdf();
        //         }
        //     });
        // }
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        for(let i = 0; i < imageArray.length;i++){
            doc.addImage(imageArray[i],'png',20,20,100,56.25);
            if(i != imageArray.length - 1){
                doc.addPage();
            }
        }
        doc.save("download.pdf");
    }
})