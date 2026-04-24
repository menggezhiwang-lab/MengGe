function fromString(name) {
    let components = name.split("-");
    for (let  i=0; i<5; i++){
        components[i] = "0x"+components[i];
    }

    let mostSigBits = BigInt(parseInt(components[0]));
    mostSigBits = mostSigBits << 16n;
    mostSigBits |= BigInt(parseInt(components[1]));
    mostSigBits = mostSigBits.toString(2);
    for (let i = 0; i < 16; i++) {
        mostSigBits += '0';
    }
    mostSigBits = twoToComp(mostSigBits.toString(2));
    mostSigBits |= BigInt(parseInt(components[2]));

    let leastSigBits = BigInt(parseInt(components[3]));
    leastSigBits = leastSigBits.toString(2);
    for(let i = 0; i < 48; i++){
        if(i == 47){
            leastSigBits += '0';
        }else{
            leastSigBits += '0';
        }
    }
    let components4 = BigInt(components[4]).toString(2);
    let length = components4.length;
    let leastSigBits2 = '';
    for(let i = 0; i < 64 - length; i++){
        components4 = '0' + components4;
    }
    for(let i = 0; i < components4.length; i++){
        if(components4[i] == '1'||leastSigBits[i] == '1'){
            leastSigBits2 += '1';
        }else{
            leastSigBits2 += '0';
        }
    }
    // leastSigBits = BigInt(leastSigBits2);
    // leastSigBits = String(leastSigBits);
    leastSigBits = leastSigBits2;
    leastSigBits = twoToComp(leastSigBits);
    function transferBytes(mostSigBits,leastSigBits){   //UUID转换为二进制字节方法
        let data = [];
        let msb = mostSigBits;
        let lsb = leastSigBits;
        for (let i=0;i<8;i++){
            data[i] = (msb >> BigInt(8*(7-i))) & 0xffn;
            length = data[i].toString(2).length;
            if(length < 8){
                for(let j = 0; j < 8 - length; j++){
                    data[i] = '0' + data[i];
                }
            };
            data[i] = parseInt(data[i]);
            // if(data[i][0] == '0'){
            //     data[i] = parseInt(data[i]);
            // }else{
            //     let lsbi = '';
            //     data[i] = (parseInt(data[i]) - 1).toString(2);
            //     for(let j of data[i]){
            //         lsbi += j=='1'?0:1;
            //     };
            //     data[i] = -Number('0b' + lsbi);
            // }
        }

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
        for (let i=0;i<8;i++){
            let k = i + 8;
            data[k] =(lsb >> BigInt(8*(7-i))) & 0xffn;
            length = data[k].toString(2).length;
            if(length < 8){
                for(let j = 0; j < 8 - length; j++){
                    data[k] = '0' + data[k];
                }
            };
            data[k] = parseInt(data[k]);
            // if(data[k][0] == '0'){
            //     data[k] = parseInt(data[k]);
            // }else{
            //     //let lsbi = '';
            //     data[k] = parseInt(data[k]);
            //     //data[k] = (parseInt(data[k]) - 1).toString(2);
            //     // for(let j of data[k]){
            //     //     lsbi += j=='1'?0:1;
            //     // };
            //     //data[k] = -Number('0b' + lsbi);
            // }
        }
        //log(getSelfUUID(data));
        return data;
    }
    //log(name);
    //log(mostSigBits, leastSigBits);
    return transferBytes(mostSigBits, leastSigBits);
}

//b04e56fa-e3cc-4369-8c3f-602aacf3da4f
//-5742556839287176343n -8340842248460314033n
//fromString('bf1f13c5-537a-4c2b-8fbb-f4d0aa1b8093');

function getSelfUUID(arr){   //二进制字节转UUID算法 type为1则二进制转uuid type为0则uuid转二进制字节
    function toString(mostSigBits,leastSigBits) {
        return (digits(mostSigBits >> 32n, 8n) + "-" +
                digits(mostSigBits >> 16n, 4n) + "-" +
                digits(mostSigBits, 4n) + "-" +
                digits(leastSigBits >> 48n, 4n) + "-" +
                digits(leastSigBits, 12n));
    }
    function digits(val, digitsX) {
        let hi = 1n << digitsX * 4n;
        hi = hi | (val & (hi - 1n));
        //Long.toHexString(hi | (val & (hi - 1))).substring(1);
        return hi.toString(16).substring(1);
    }
    
    let msb = 0n;
    let lsb = 0n;
    let num = 0n;
    for (let i=0; i<8; i++){
        msb = msb * 256n + BigInt(arr[i] & 0xff);
    };
    for (let i=8; i<16; i++){
        lsb = lsb * 256n + BigInt(arr[i] & 0xff);
        if(lsb.toString(2).length == 64){
            if(lsb.toString(2).charAt(0)=='1'){
                let lsbi = '';
                for(let i of (lsb - 1n).toString(2)){
                    lsbi += i=='1'?0:1;
                };
                let j=0;
                let ss=0;
                for(let i = lsbi.length; i >0; i-=8){
                    let s = lsbi.substring(i-8,i);
                    ss = parseInt(s,2);
                    num += BigInt(ss)*BigInt(Math.pow(2,8*j));
                    // s = s * 256 + lsbi.substring(i,i+8) & 0xff;
                    j++;
                }
            }
        }
    };
    return toString(msb,-num);
}

function twoToComp(string){ //二进制字符串转10进制数字
    let length = string.length;
    for(let i = 0; i < 64 - length; i++){
        string = '0' + string;
    }
    let num = 0n;
    if(string.length == 64){
        if(string.charAt(0)=='1'){
            let lsbi = '';
            for(let i of string){
                lsbi += i=='1'?0:1;
            };
            let j=0;
            let ss=0;
            for(let i = lsbi.length; i >0; i-=8){
                let s = lsbi.substring(i-8,i);
                ss = parseInt(s,2);
                num += BigInt(ss)*BigInt(Math.pow(2,8*j));
                // s = s * 256 + lsbi.substring(i,i+8) & 0xff;
                j++;
            }
            num += 1n;
            num = -num;
        }else{
            let j=0;
            let ss=0;
            for(let i = string.length; i >0; i-=8){
                let s = string.substring(i-8,i);
                ss = parseInt(s,2);
                num += BigInt(ss)*BigInt(Math.pow(2,8*j));
                // s = s * 256 + lsbi.substring(i,i+8) & 0xff;
                j++;
            }
        }
        string = num;
    }
    return num;
}