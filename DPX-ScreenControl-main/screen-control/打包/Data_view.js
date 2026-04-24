import { Scene,Marker,MarkerLayer,Popup } from '@antv/l7';
import { CountyLayer } from '@antv/l7-district';
import { GaodeMap } from '@antv/l7-maps';
import React from 'react';
import {message,notification} from 'antd';
import { Bar,Column,Pie } from '@ant-design/charts';
import Paho from 'paho-mqtt';
//const AMap = window.AMap;

let that,client,timor;

function dataViewMapStart(){
    // const map = new AMap.Map('map', {
    //     viewMode: '3D',
    //     pitch: 0,
    //     mapStyle: 'amap://styles/darkblue',
    //     center: [ 116.31, 39.956 ],
    //     zoom: 10,
    //     minZoom: 1,
    //     maxZoom: 20,
    // });
    // const scene = new Scene({
    //     id: 'map',
    //     map: new GaodeMap({
    //         mapInstance: map
    //     })
    // });
    let markerLayer;
    const scene = new Scene({
        id: 'map',
        logoVisible: false,
        antialias: false,
        map: new GaodeMap({
            center: [ 116.31, 39.956 ],
            style: 'light',
            pitch: 0,
            zoom: 11,
            plugin: []
        })
    });
    scene.on('loaded', () => {
        new CountyLayer(scene, {
            data: [],
            adcode: ['110108'],
            depth: 3,
            label: {
                field: 'NAME_CHN'
            },
            stroke: '#00eeff',
            fill: {
                color: {
                    field: 'NAME_CHN',
                    values: ['rgba(113,179,225,.2)'],
                }
            },
            popup:{
                enable: false,
            }
        });
        let marker,countBool,onlineDevice,mapLayerMarker;
        function markerLayerJuHe(){
            markerLayer = new MarkerLayer({
                cluster: that.state.cluster,
                clusterOption: {
                    element: function(dom){
                        onlineDevice = 0;
                        if(dom.properties.clusterData){
                            for(let i of dom.properties.clusterData){
                                if(i.properties.online_device !==0){
                                    onlineDevice = i.properties.online_device;
                                    break;
                                }
                            }
                        }else{
                            onlineDevice = dom.properties.online_device;
                        }
                        mapLayerMarker = document.createElement('div');
                        if(!onlineDevice){
                            mapLayerMarker.className = 'map_layer_marker map_layer_marker_off';
                            mapLayerMarker.innerHTML = dom.properties.point_count?dom.properties.point_count:1;
                        }else{
                            mapLayerMarker.className = 'map_layer_marker';
                            mapLayerMarker.innerHTML = `<div class="map_layer_marker_animate"><div>${dom.properties.point_count?dom.properties.point_count:1}</div><img src="../image/map_marker_animate.gif" alt="背景图"/></div>`;
                        }
                        return mapLayerMarker;
                    }
                }
            });
            for(let i of that.state.MapData){
                // el = document.createElement('div');
                // el.className = 'mapMarker';
                // el = document.createElement('div');
                // el.className = 'markerContent';
                // let elDiv = document.createElement('div');
                // elDiv.style.display = 'flex';
                // elDiv.style.alignItems = 'center';
                // elDiv.style.height = '32px';
                // elDiv.style.padding = '0.05rem';
                // elDiv.style.background = '#1677ff';
                // elDiv.style.borderRadius = '44px';
                // let elDivItem = document.createElement('div');
                // elDivItem.style.color = '#fff';
                // elDivItem.style.fontSize = '12px';
                // elDivItem.innerHTML = MapDataObj.group;
                // elDiv.appendChild(elDivItem);
                // let elDivs = document.createElement('div');
                // elDivs.style.display = 'flex';
                // elDivs.style.justifyContent = 'center';
                // let elDivsImg = document.createElement('img');
                // elDivsImg.style.width = '20px';
                // elDivsImg.style.height = '30px';
                // elDivsImg.alt = 'marker';
                // elDivsImg.src = 'https://gw.alipayobjects.com/mdn/rms_855bab/afts/img/A*n6cXTb8R7iUAAAAAAAAAAAAAARQnAQ';
                // elDivs.appendChild(elDivsImg);
                // el.appendChild(elDiv);
                // el.appendChild(elDivs);
                // onlineDevice = i.online_device;
                marker = new Marker({
                    extData: {
                        online_device: i.online_device,
                    },
                }).setLnglat([ i.longitude||0, i.latitude||0]);
                markerLayer.addMarker(marker);
            }
            scene.addMarkerLayer(markerLayer);
        }
        markerLayerJuHe();
        scene.on('zoomchange', () => {
            countBool = scene.getZoom() < 13;
            if(countBool !== that.state.cluster){
                that.setState({
                    cluster: countBool,
                })
                if(countBool){
                    scene.removeAllMakers();
                    markerLayerJuHe();
                }else{
                    scene.removeAllMakers();
                    markerLayerFactory();
                }
            }
            function markerLayerFactory(){
                for(let i of document.getElementsByClassName('markerContent l7-marker l7-marker-anchor-bottom')){
                    i.onclick = false;
                    i.contextmenu = false;
                    i.ondblclick = false;
                    i.onmousedown = false;
                    i.onmousemove = false;
                    i.onmouseup = false;
                    i.onmouseover = false;
                    i.onmouseoout = false;
                }
                for(let i of document.getElementsByClassName('l7-popup l7-popup-anchor-bottom')){
                    i.onclick = false;
                    i.ondblclick = false;
                    i.onmousedown = false;
                    i.onmousemove = false;
                    i.onmouseup = false;
                    i.children[1].children[0].onclick = false;
                }
                for(let i of document.getElementsByClassName('l7-marker-cluster l7-marker l7-marker-anchor-bottom')){
                    i.onclick = false;
                    i.contextmenu = false;
                    i.ondblclick = false;
                    i.onmousedown = false;
                    i.onmousemove = false;
                    i.onmouseup = false;
                    i.onmouseover = false;
                    i.onmouseoout = false;
                }
                let html,el,popup,marker;
                let markerLayers = new MarkerLayer({
                    cluster: that.state.cluster,
                });
                for(let i  of that.state.MapData){
                    html = `<p class="mapTitle">${i.group}</p>
                    <p class="mapValue">在线设备/总设备：${i.online_device}/${i.total_device}</p>`;
                    // el = document.createElement('div');
                    // el.className = 'mapMarker';
                    el = document.createElement('div');
                    el.className = 'markerContent';
                    let elDiv = document.createElement('div');
                    elDiv.style.display = 'flex';
                    elDiv.style.alignItems = 'center';
                    elDiv.style.height = '32px';
                    elDiv.style.padding = '1rem';
                    elDiv.style.background = i.online_device?'#1677ff':'#919295';
                    elDiv.style.borderRadius = '2px';
                    let elDivItem = document.createElement('div');
                    elDivItem.style.color = '#fff';
                    elDivItem.style.fontSize = '12px';
                    elDivItem.innerHTML = i.group;
                    elDiv.appendChild(elDivItem);
                    let elDivs = document.createElement('div');
                    elDivs.style.display = 'flex';
                    elDivs.style.justifyContent = 'center';
                    let elDivsImg = document.createElement('img');
                    elDivsImg.style.width = '20px';
                    elDivsImg.style.height = '30px';
                    elDivsImg.alt = 'marker';
                    elDivsImg.src = i.online_device?'../image/on.png':'../image/off.png';
                    elDivs.appendChild(elDivsImg);
                    el.appendChild(elDiv);
                    el.appendChild(elDivs);
                    popup = new Popup({
                        offsets: [ 0, 65 ],
                    }).setHTML(html);
                    marker = new Marker()
                        .setLnglat([ i.longitude||0, i.latitude||0])
                        .setPopup(popup)
                        .setElement(el);
                    markerLayers.addMarker(marker);
                }
                scene.addMarkerLayer(markerLayers);
            }
        })
    });
}

function appendZero(obj) {
    if(obj<10) return "0" + obj;
    else return obj;
}
function initDateTime(num){
    if (!num) num = 0;
    let dateTime = new Date(new Date().getTime() - num*86400000);
    return dateTime.getFullYear()+'-'+appendZero(dateTime.getMonth()+1)+'-'+appendZero(dateTime.getDate())+' '+appendZero(dateTime.getHours())+':'+appendZero(dateTime.getMinutes())+':'+appendZero(dateTime.getSeconds());
}

//断开连接
//client.onConnectionLost = onConnectionLost;
//function onConnectionLost (responseObject) {
    // if (responseObject.errorCode){
    //     console.log('onConnectionLost:' + responseObject.errorMessage);
    // }
//}

//设备使用排行榜条形图
const DemoBar = () => {
    let config = {
        data: that.state.BarData,
        xField: 'value',
        yField: 'year',
        legend: { position: 'top-left' },
        appendPadding: [0,0,5,0],
        renderer: 'svg',
        label: {
            position: 'left',
            style: {
                fill: '#000',
                opacity: 0.6,
            },
            // formatter: (text)=>{
            //     return text.values;
            // }
        },
        meta: {
            value: {alias: '使用时长'},
        },
        color: '#5AD8A6',
    };
    return <Bar {...config} ComponentAnimateCfg/>;
};
//设备使用时间分布柱状图
const DemoColumn = () => {
    let config = {
        data: that.state.ColumnData,
        xField: 'type',
        yField: 'sales',
        label: {
            position: 'top',
            style: {
                fill: '#000',
                opacity: 0.6,
            },
        },
        limitInPlot: {
            optional: false,
        },
        padding: [26,0,20,30],
        color: '#269A99',
        meta: {
            type: { alias: '类别' },
            sales: { alias: '使用数量' },
        },
    };
    return <Column {...config}/>;
};

//设备应用使用排行榜环形图
const DemoPie = () => {
    let config = {
        appendPadding: 10,
        data: that.state.PieData,
        angleField: 'value',
        colorField: 'type',
        radius: 1,
        innerRadius: 0.6,
        label: {
            type: 'inner',
            offset: '-50%',
            content: '',
            style: {
                textAlign: 'center',
                fontSize: 14,
            },
        },
        legend: {
            itemWidth: 105,
            position: 'right',
        },
        interactions: [{ type: 'element-selected' }, { type: 'element-active' }],
        statistic: {        //隐藏圆环中间的字
            title: false,
            content: false,
            // coutent: {
            //     style: {
            //         whiteSpace: 'pre-wrap',
            //         overflow: 'hidden',
            //         textOverflow: 'ellipsis',
            //     },
            // },
        },
    };
    return <Pie {...config} />;
};
sessionStorage.const = '1';
class Data_view extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            cluster: true,  //地图是否启用聚合
            devTotal: sessionStorage.devTotalObj?JSON.parse(sessionStorage.devTotalObj).devTotal:0, //设备总数量
            devOn: sessionStorage.devTotalObj?JSON.parse(sessionStorage.devTotalObj).devOn:0,       //设备在线数量
            devOff: sessionStorage.devTotalObj?JSON.parse(sessionStorage.devTotalObj).devOff:0,     //设备离线数量
            MapData: sessionStorage.MapData?JSON.parse(sessionStorage.MapData):[],      //地图数据
            BarData: sessionStorage.BarData?JSON.parse(sessionStorage.BarData):[],    //设备使用排行榜数据
            ColumnData: sessionStorage.ColumnData?JSON.parse(sessionStorage.ColumnData):[], //设备使用时间分布数据
            PieData: sessionStorage.PieData?JSON.parse(sessionStorage.PieData):[],    //设备应用排行榜数据
        }
    }
    $top(){
        notification.open({
            message: '温馨提示：',
            description:
                '功能开发中，敬请期待～',
            duration: 2,
        });
    }
    componentDidMount(prevProps){   //当刷新页面时触发
        if(!sessionStorage.userInfo){
            sessionStorage.clientId = '';
            window.location.href = '';
        }
        client = new Paho.Client(sessionStorage.getUrl, 8083, '/mqtt', sessionStorage.clientId)
        //发起连接
        client.connect({
            useSSL: false,
            onSuccess: onConnect,   //连接成功后执行
            onFailure:(e)=>{ console.log('失败'); console.log(e); }
        });
        function onConnect(){
            //获取在线离线设备数据
            client.subscribe('/dashboard/1.0/res/device_online_count/'+JSON.parse(sessionStorage.userInfo).account);
            // 推送给主题
            client.publish('/dashboard/1.0/get/device_online_count',`{"cmd": "dashboard_device_online_count","from": "${JSON.parse(sessionStorage.userInfo).account}","to": "","token":""}`,2);
            //获取地图学校坐标与数据
            client.subscribe('/dashboard/1.0/res/device_distribution/'+JSON.parse(sessionStorage.userInfo).account);
            // 推送给主题
            client.publish('/dashboard/1.0/get/device_distribution',`{"organization_id":1,"cmd": "dashboard_device_distribution","from": "${JSON.parse(sessionStorage.userInfo).account}","to": "","token":""}`,2);
            //获取设备使用时间排行榜接口
            // client.subscribe('/dashboard/1.0/res/device_usage_time');
            client.subscribe('/dashboard/1.0/res/device_usage_time_ranking/'+JSON.parse(sessionStorage.userInfo).account);
            
            // 推送给主题
            client.publish('/dashboard/1.0/get/device_usage_time_ranking',`{'cmd':'dashboard_device_usage_time_ranking','limit_count':10,'from':'${JSON.parse(sessionStorage.userInfo).account}','to':'','token':''}`,2);

            //client.publish('/dashboard/1.0/get/device_usage_time',`{'cmd':'dashboard_device_usage_time','start_time':'2021-02-22 16:09:41','end_time':'2021-03-01 16:09:41','page_size':10,'page_index':0,'talk_ids':[],'from':'','to':'','token':''}`,2);
            //client.publish('/dashboard/1.0/get/device_usage_time',`{'cmd':'dashboard_device_usage_time','start_time':'${initDateTime(7)}','end_time':'${initDateTime()}','page_size':6,'page_index':0,'talk_ids':[],'from':'${JSON.parse(sessionStorage.userInfo).account}','to':'','token':''}`,2);
            //获取设备24小时使用时间分布接口
            client.subscribe('/dashboard/1.0/res/device_usage_time_distribution/'+JSON.parse(sessionStorage.userInfo).account);
            // 推送给主题
            //client.publish('/dashboard/1.0/get/device_usage_time_distribution',`{'cmd':'device_usage_time_distribution','start_time':'2021-3-21 16:9:41','end_time':'2021-3-23 16:9:41','page_size':10,'page_index':0,'talk_ids':[],'from':'','to':'','token':''}`,2);
            //console.log(`{'cmd':'device_usage_time_distribution','start_time':'${initDateTime(1)}','end_time':'${initDateTime()}','page_size':10000,'page_index':0,'talk_ids':[],'from':'${JSON.parse(sessionStorage.userInfo).account}','to':'','token':''}`);
            client.publish('/dashboard/1.0/get/device_usage_time_distribution',`{'cmd':'device_usage_time_distribution','start_time':'${initDateTime(1)}','end_time':'${initDateTime()}','page_size':10,'page_index':0,'talk_ids':[],'from':'${JSON.parse(sessionStorage.userInfo).account}','to':'','token':''}`,2);
            //获取设备应用使用排行榜接口
            client.subscribe('/dashboard/1.0/res/device_app_usage/'+JSON.parse(sessionStorage.userInfo).account);
            // 推送给主题
            //client.publish('/dashboard/1.0/get/device_app_usage',`{"cmd":"dashboard_device_app_usage","start_time":"2021-02-22 17:01:18","end_time":"2021-03-01 17:01:18",'page_size':10,'page_index':0,'from':'','to':'','token':''}`,2);
            client.publish('/dashboard/1.0/get/device_app_usage',`{'cmd':'dashboard_device_app_usage','start_time':'${initDateTime(7)}','end_time':'${initDateTime()}','page_size':10,'page_index':0,'from':'${JSON.parse(sessionStorage.userInfo).account}','to':'','token':''}`,2);
            //订阅踢人监听
            client.subscribe('/dashboard/1.0/res/login_somewhere/'+sessionStorage.clientId);
        }
        //接收消息事件
        client.onMessageArrived = onMessageArrived;
        function onMessageArrived(Message){
            let messageData = JSON.parse(Message.payloadString);
            console.log(messageData);
            if(messageData.error === 0){
                let BarDataArr = [];
                let ColumnDataArr = [];
                let PieDataArr = [];
                switch(messageData.response_to_cmd){
                    case 'dashboard_device_online_count': //获取设备在线离线总台数
                        let devTotalObj = {};
                        devTotalObj.devTotal = messageData.total_count;
                        devTotalObj.devOn = messageData.online_count;
                        devTotalObj.devOff = messageData.offline_count;
                        sessionStorage.devTotalObj = JSON.stringify(devTotalObj);
                        that.setState({
                            devTotal: messageData.total_count, //设备总数量
                            devOn: messageData.online_count,       //设备在线数量
                            devOff: messageData.offline_count,     //设备离线数量
                        })
                        break;
                    case 'dashboard_device_distribution': //获取地图marker坐标数据
                        //百度坐标转高德坐标方法
                        function bd_decrypt(bd_lng, bd_lat) {
                            var X_PI = Math.PI * 3000.0 / 180.0;
                            var x = bd_lng - 0.0065;
                            var y = bd_lat - 0.006;
                            var z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * X_PI);
                            var theta = Math.atan2(y, x) - 0.000003 * Math.cos(x * X_PI);
                            var gg_lng = z * Math.cos(theta);
                            var gg_lat = z * Math.sin(theta);
                            return {lng: gg_lng, lat: gg_lat}
                        }
                        messageData.result.forEach(item=>{
                            item.longitude = bd_decrypt(item.longitude,item.latitude).lng;
                            item.latitude = bd_decrypt(item.longitude,item.latitude).lat;
                        })
                        sessionStorage.MapData = JSON.stringify(messageData.result);
                        that.setState({
                            MapData: messageData.result,
                        })
                        dataViewMapStart();
                        break;
                    case "dashboard_device_usage_time": //获取设备排行榜 Previous
                        let BarDataArrTime = [];
                        BarDataArr = [];
                        messageData.result.forEach((item,index) =>{
                            let itemGroupName = index+1+'.'+item.group + item.name;
                            let BarDataObj = {};
                            BarDataObj.year = itemGroupName.length > 10?itemGroupName.slice(0,5) + '...' + itemGroupName.slice(itemGroupName.length - 5,itemGroupName.length):itemGroupName;
                            BarDataObj.value = Number((parseInt(item.on_time)/3600).toFixed(3));
                            BarDataObj.on_time = item.on_time;
                            BarDataObj.status = item.status;
                            //BarDataObj.values = parseInt(String(item.on_time/3600)) + ':' + parseInt(String(item.on_time/60%60)) + ':' + item.on_time%60;
                            BarDataArr.push(BarDataObj);
                        });
                        BarDataArrTime = BarDataArr;
                        let BarDataArrSort = BarDataArr.sort(function(a, b){return b.value - a.value});
                        sessionStorage.BarData = JSON.stringify(BarDataArrSort);
                        that.setState({
                            BarData: JSON.parse(sessionStorage.BarData),
                        })
                        //BarDataArr.sort(function(a, b){return b.value - a.value}).reverse()
                        function devTimeRank(arr){
                            BarDataArr = [];
                            arr.forEach(item =>{
                                let BarDataObj = {};
                                BarDataObj.year = item.year;
                                BarDataObj.value = Number((parseInt(item.on_time)/3600).toFixed(3));
                                BarDataObj.on_time = item.on_time;
                                BarDataObj.status = item.status;
                                BarDataArr.push(BarDataObj);
                                //BarDataObj.values = parseInt(String(item.on_time/3600)) + ':' + parseInt(String(item.on_time/60%60)) + ':' + item.on_time%60;
                            });
                            BarDataArrTime = BarDataArr;
                            let BarDataArrSort = BarDataArr.sort(function(a, b){return b.value - a.value});
                            sessionStorage.BarData = JSON.stringify(BarDataArrSort);
                            that.setState({
                                BarData: JSON.parse(sessionStorage.BarData),
                            })
                            //BarDataArr.sort(function(a, b){return b.value - a.value}).reverse()
                        }
                        clearInterval(timor);
                        timor = setInterval(function(){
                            BarDataArrTime.forEach(item=>{
                                if(item.status === 1){
                                    item.on_time++;
                                }
                            })
                            devTimeRank(BarDataArrTime);
                        },1000)
                        // that.state.BarData.map(item=>{
                        //     document.getElementById(item.year).innerHTML = item.values;
                        // })
                        break;
                    case "dashboard_device_usage_time_ranking": //获取设备排行榜 Oct 2023
                        console.log(messageData);
                        let BarDataArrTimeRanking = [];
                        BarDataArr = [];
                        messageData.result.forEach((item,index) =>{
                            let itemGroupName = index+1+'.'+item.group_name;
                            let BarDataObj = {};
                            BarDataObj.year = itemGroupName.length > 10?itemGroupName.slice(0,5) + '...' + itemGroupName.slice(itemGroupName.length - 5,itemGroupName.length):itemGroupName;
                            BarDataObj.value = Number((parseInt(item.on_time)/3600).toFixed(3));
                            BarDataObj.on_time = item.on_time;
                            // BarDataObj.status = item.status;
                            //BarDataObj.values = parseInt(String(item.on_time/3600)) + ':' + parseInt(String(item.on_time/60%60)) + ':' + item.on_time%60;
                            BarDataArr.push(BarDataObj);
                        });
                        console.log(`case "dashboard_device_usage_time_ranking"\nmessageData:${messageData}`);
                        console.log(`BarDataArr:${BarDataArr}`);
                        BarDataArrTimeRanking = BarDataArr;
                        let BarDataArrSortRanking = BarDataArr.sort(function(a, b){return b.value - a.value});
                        sessionStorage.BarData = JSON.stringify(BarDataArrSortRanking);
                        that.setState({
                            BarData: JSON.parse(sessionStorage.BarData),
                        })
                        //BarDataArr.sort(function(a, b){return b.value - a.value}).reverse()
                        function devTimeRank2(arr){
                            BarDataArr = [];
                            arr.forEach(item =>{
                                let BarDataObj = {};
                                BarDataObj.year = item.year;
                                BarDataObj.value = Number((parseInt(item.on_time)/3600).toFixed(3));
                                BarDataObj.on_time = item.on_time;
                                // BarDataObj.status = item.status;
                                BarDataArr.push(BarDataObj);
                                //BarDataObj.values = parseInt(String(item.on_time/3600)) + ':' + parseInt(String(item.on_time/60%60)) + ':' + item.on_time%60;
                            });
                            BarDataArrTimeRanking = BarDataArr;
                            let BarDataArrSort = BarDataArr.sort(function(a, b){return b.value - a.value});
                            sessionStorage.BarData = JSON.stringify(BarDataArrSort);
                            that.setState({
                                BarData: JSON.parse(sessionStorage.BarData),
                            })
                            //BarDataArr.sort(function(a, b){return b.value - a.value}).reverse()
                        }
                        // clearInterval(timor);
                        // timor = setInterval(function(){
                        //     BarDataArrTimeRanking.forEach(item=>{
                        //         if(item.status === 1){
                        //             item.on_time++;
                        //         }
                        //     })
                        //     devTimeRank(BarDataArrTimeRanking);
                        // },1000)
                        // that.state.BarData.map(item=>{
                        //     document.getElementById(item.year).innerHTML = item.values;
                        // })
                        break;
                    case "device_usage_time_distribution": //获取设备使用时间分布
                        ColumnDataArr = [];
                        messageData.result.forEach(item =>{
                            let ColumnDataObj = {};
                            ColumnDataObj.type = item.range;
                            ColumnDataObj.sales = item.count;
                            ColumnDataArr.push(ColumnDataObj);
                        });
                        sessionStorage.ColumnData = JSON.stringify(ColumnDataArr);
                        that.setState({
                            ColumnData: ColumnDataArr,
                        })
                        break;
                    case "dashboard_device_app_usage": //获取设备应用使用排行榜
                        PieDataArr = [];
                        messageData.result.forEach(item =>{
                            let PieDataObj = {};
                            PieDataObj.type = item.app.split('.')[0];
                            PieDataObj.value = Number((item.time/3600).toFixed(1));
                            PieDataArr.push(PieDataObj);
                        });
                        sessionStorage.PieData = JSON.stringify(PieDataArr);
                        console.log(`case "dashboard_device_app_usage"\nmessageData:${JSON.stringify(messageData.result)}`);
                        console.log(`PieDataArr:${PieDataArr}`);
                        that.setState({
                            PieData: PieDataArr,
                        })
                        break;
                    case "dashboard_login_somewhere_res":   //收到其他的登录讯息，退出登录
                        sessionStorage.userInfo = '';
                        sessionStorage.clientId = '';
                        window.location.href = '';
                        break;
                    default:
                        console.log(789);
                }
            }else{
                message.error('获取信息失败');
                client.onConnectionLost();
                //client.disconnect();
            }
        }
    }
    //页面卸载时触发
    componentWillUnmount(){
        clearInterval(timor);
        console.log(client);
        client.disconnect();
        // devDataUn.forEach(item => {
        //     client.unsubscribe(`/dashboard/1.0/res/thumbnail/${item}`);
        // })
    }
    render(){
        that = this;
        return <div className="Data_view">
            {/*<div className="Data_view_top">*/}
            {/*    <Button style={{backgroundColor: 'rgba(0,0,0,.65)', color: '#fff',marginRight: '34px'}} onClick={this.$top}>近一周</Button>*/}
            {/*    <Button disabled>全部学校</Button>*/}
            {/*    <Button disabled>昨天</Button>*/}
            {/*    <Button disabled>今天</Button>*/}
            {/*    <Button disabled style={{marginRight: '17px'}}>近一个月</Button>*/}
            {/*    <RangePicker disabled style={{marginRight: '17px'}}/>*/}
            {/*    <Button disabled>查询</Button>*/}
            {/*    <Button disabled>重置</Button>*/}
            {/*</div>*/}
            {/*<div className="Data_view_data">*/}
            {/*    <div className="Data_view_data_item">*/}
            {/*        <p>设备总量（台）</p>*/}
            {/*        <p>100</p>*/}
            {/*    </div>*/}
            {/*    <div className="Data_view_data_item">*/}
            {/*        <p>在线设备（台）</p>*/}
            {/*        <p>50</p>*/}
            {/*    </div>*/}
            {/*    <div className="Data_view_data_item">*/}
            {/*        <p>离线设备（台）</p>*/}
            {/*        <p>50</p>*/}
            {/*    </div>*/}
            {/*</div>*/}
            <div className="Data_view_box">
                <div className="Data_view_list Data_view_box_left">
                    <div className="Data_view_box_left_item">
                        <p>
                            设备教学区域分布
                            <span id="Data_view_item_remark_one" className="Data_view_item_remark Data_view_item_remarks"><b> </b>设备数量（台）</span>
                        </p>
                        <div style={{clear: 'both'}}></div>
                        <div className="Data_view_son" id="map">
                        </div>
                        <div className="data_view_fixed">
                            <div className="data_view_fixed_left">设备总量：{this.state.devTotal}</div>
                            <div className="data_view_fixed_center">在线设备：{this.state.devOn}</div>
                            <div className="data_view_fixed_right">离线设备：{this.state.devOff}</div>
                        </div>
                    </div>
                </div>
                <div className="Data_view_list Data_view_box_right">
                    <div className="Data_view_box_right_item">
                        <p>设备使用排行榜（前十名学校）<span className="Data_view_item_remark"><b></b>设备使用时间（h）</span></p>
                        <div className="Data_view_son">
                            <DemoBar/>
                        </div>
                    </div>
                    <div className="Data_view_box_right_item">
                        <p>设备使用时间分布（前一天数据）<span className="Data_view_item_remark Data_view_item_remarks"><b></b>设备使用数量（台）</span></p>
                        <div className="Data_view_son">
                            <DemoColumn/>
                        </div>
                    </div>
                    <div className="Data_view_box_right_item">
                        <p>软件运行总时长<span className="Data_view_item_remark"><b></b>设备应用统计（h）</span></p>
                        <div className="Data_view_son">
                            <DemoPie/>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    }
}

export default Data_view;