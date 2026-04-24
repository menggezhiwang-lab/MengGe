import React from 'react';
import {Popover, Input, Button, Space, Form, Menu, Tree, Table, Tag, Pagination, Dropdown, Image, message, notification, Modal} from 'antd';
import { DownOutlined, BarsOutlined, AppstoreOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import './css/Dev.css';
import {Link} from "react-router-dom";
import Paho from "paho-mqtt";
const { Search } = Input;
const { TreeNode } = Tree;

let that,client,pageType = false;
let devDataUn = [];
let onSoftManageCont = 1;
let rightListHeadPivewClick = '';

function TreeDataModalLogout(){ //初始化弹窗方法
    if(that.state.treeDataModalVisibleInput){
        that.formRef.current.setFieldsValue({
            name: '',
        })
    }
    that.setState({
        treeDataClickType: 0,
        treeDataClickItem: '',
        treeDataModalTitle: '',
        treeDataModalText: '',
        treeDataModalPlaceholder: '',
        treeDataModalValue: '',
        treeDataModalVisible: false,
        treeDataModalVisibleInput: false,
    })
}

const onClick = () => {
    if(onSoftManageCont === 1){
        onSoftManageCont = 2;
        setTimeout(function(){
            onSoftManageCont = 1;
        },2000)
        notification.open({
            message: '温馨提示：',
            description:
                '功能开发中，敬请期待～',
            duration: 2,
        });
    }
};

const menu = (
    <div className="moreManageList" onClick={onClick}>
        <Button>系统备份</Button>
        <Button>系统恢复</Button>
        <Button>系统升级</Button>
        <Button>关机管理</Button>
    </div>
);

class  Dev extends React.Component{
    formRef = React.createRef();
    state = {
        devAll: 0,        //全部设备数量
        devOn: 0,          //在线设备数量
        devOff: 0,         //离线设备数量
        rightTemp: sessionStorage.devData?JSON.parse(sessionStorage.devData).slice(0,10):[],    //卡片分页渲染数据
        rightTempPivew: '',
        data: sessionStorage.devData?JSON.parse(sessionStorage.devData):[],           //右边主体数据部分
        treeData: sessionStorage.treeDataArr?JSON.parse(sessionStorage.treeDataArr):[],
        treeDataClickType: 0,               //当前操作的类型
        treeDataClickItem: '',              //弹窗操的数据集
        treeDataModalTitle: '',             //弹窗展示的标题
        treeDataModalText: '',              //弹窗展示的文本
        treeDataModalPlaceholder: '',       //弹窗input展示的预留文本
        treeDataModalVisible: false,        //常规弹窗
        treeDataModalVisibleInput: false,   //带输入框的弹窗
        treeDataModalValue: '',             //弹窗输入框所填写的内容
        current: 1,                         //卡片分页记录
        pattern: true,                     //false为卡片模式 true为列表模式
        rightListHeadLoadingShowBack: false,//图片加载原图时控制加载动画的背景显示与隐藏
        rightListHeadLoadingShow: [],       //图片加载原图时控制加载动画的显示与隐藏
        checkedKeys: [],
        columns: [
            {
                title: '设备名称',
                dataIndex: 'name',
                render: (name,item) => {
                    return(
                        <Tag className="table_name">
                            {item.group}{name}
                        </Tag>
                    )
                },
            },
            {
                title: '备注',
                dataIndex: 'desc',
                align: 'center',
            },
            {
                title: '设备状态',
                dataIndex: 'state',
                align: 'center',
                sorter: (a, b) => b.state - a.state,
                render: state => {
                    const color = state ? '#0077FF' : '#9B9C9E';
                    const text = state ? '在线' : '离线';
                    return(
                        <Tag className="table_state" color={color}>
                            {text}
                        </Tag>
                    )
                },
            },
            {
                title: '操作',
                dataIndex: 'operation',
                render: (operation,item) => {
                    return(
                        <Tag className="table_operation">
                            <Button type="primary" onClick={this.powerOn}>开机</Button>&nbsp;&nbsp;
                            <Button onClick={this.powerOff}>关机</Button>&nbsp;&nbsp;
                            <Link to={{pathname: './dev_details',state: {item:item,talk_id: item.talk_id,}}}>详情</Link>
                        </Tag>
                    )
                },
            },
        ],
    }
    componentDidMount(){
        if(!sessionStorage.userInfo){
            sessionStorage.clientId = '';
            window.location.href = '';
        }
        client = new Paho.Client(sessionStorage.getUrl, 8083, '/mqtt', sessionStorage.clientId);
        //mqtt发起连接
        client.connect({
            useSSL: false,
            onSuccess: onConnect,
            onFailure:(e)=>{ console.log('失败'); console.log(e);}
        });
        //连接成功后触发事件
        function onConnect(){
            client.subscribe('/dashboard/1.0/res/device_summary/'+JSON.parse(sessionStorage.userInfo).account);
            // 推送给主题(获取设备)
            client.publish('/dashboard/1.0/get/device_summary',"{cmd:'dashboard_device_summary',name_like:'',status:2,organization:'',page_index:0,page_size:10,start_time:'',end_time: '',from:'"+JSON.parse(sessionStorage.userInfo).account+"',to:'',token:''}",2);
            client.subscribe('/dashboard/1.0/res/device_in_org_group/'+JSON.parse(sessionStorage.userInfo).account);
            // 推送给主题(获取树结构数据)
            client.publish('/dashboard/1.0/get/device_in_org_group',"{organization_id:1,cmd:'dashboard_get_device_in_org_group',from:'"+JSON.parse(sessionStorage.userInfo).account+"',to:'',token:''}",2);
            //订阅踢人监听
            client.subscribe('/dashboard/1.0/res/login_somewhere/'+sessionStorage.clientId);
        }

        //接收消息事件
        client.onMessageArrived = onMessageArrived;
        function onMessageArrived (Message) {
            let data = JSON.parse(Message.payloadString);
            if(data.error === 0){
                switch (data.response_to_cmd){
                    case 'dashboard_get_snapshot_res':
                        var rightListHeadLoadingShowArray = [];
                        for(let i = 0; i > that.state.rightListHeadLoadingShow.length; i++){
                            rightListHeadLoadingShowArray.push(false);
                        }
                        that.setState({
                            rightListHeadLoadingShow: rightListHeadLoadingShowArray,
                            rightListHeadLoadingShowBack: false,
                            rightTempPivew: data.img_data,
                        })
                        for(let i of document.getElementsByClassName('right_list_head_pivew')){
                           if(i.parentNode.dataset.talk === rightListHeadPivewClick){
                               i.click();
                               break;
                           };
                        }
                        break;
                    case 'dashboard_device_summary':
                        let dataArr1 = [];
                        data.result.forEach((item,index) => {
                            let dataObj = {};
                            dataObj.key = index;
                            dataObj.desc = item.desc;
                            dataObj.group = item.group;
                            dataObj.talk_id = item.talk_id;
                            dataObj.name = item.name;
                            dataObj.address = item.device_address;
                            dataObj.state = Boolean(item.status);
                            dataArr1.push(dataObj);
                            //item.status?devOnCount++:devOffCount++;
                        })
                        sessionStorage.devData = JSON.stringify(dataArr1);
                        // let onCount = devOnCount,offCount = devOffCount, total= data.total_count;
                        let onCount1 = data.dev_on,offCount1 = data.dev_off, total1= data.total_count;

                        // for(let i of dataArr){
                        //     i.state?onCount++:offCount++;
                        // }
                        let rightListHeadLoadingShowArr1 = [];
                        dataArr1.slice(0,10).forEach(()=>{
                            rightListHeadLoadingShowArr1.push(false);
                        })
                        that.setState({
                            devAll: onCount1+offCount1,   //全部设备数量
                            devOn: onCount1,             //在线设备数量
                            devOff: offCount1,           //离线设备数量
                            data: dataArr1,
                            rightTemp: dataArr1.slice(0,10),
                            current: 1,
                            rightListHeadLoadingShow: rightListHeadLoadingShowArr1,
                            total: total1,
                        })
                        that.state.rightTemp.forEach(items => {
                            if(items.state){
                                client.subscribe(`/dashboard/1.0/res/thumbnail/${items.talk_id}`);
                                //获取硬件信息
                                client.subscribe(`/dashboard/1.0/res/update/device_status/${items.talk_id}`);
                                // 获取设备的缩略图
                                client.publish(`/dashboard/1.0/get/thumbnail/${items.talk_id}`,`{"talk_id":${items.talk_id},"need":1,"cmd":"dashboard_get_thumbnail","from":"${JSON.parse(sessionStorage.userInfo).account}","to":"","token":""}`,2);
                                devDataUn.push(items.talk_id);
                            }
                        })
                        client.unsubscribe('/dashboard/1.0/res/device_summary/'+JSON.parse(sessionStorage.userInfo).account);
                        break;
                    case 'dashboard_device_summary_school':
                        let dataArr = [];
                        let devOnCount = 0;
                        let devOffCount = 0; 
                        data.result.forEach((item,index) => {
                            let dataObj = {};
                            dataObj.key = index;
                            dataObj.desc = item.desc;
                            dataObj.group = item.group;
                            dataObj.talk_id = item.talk_id;
                            dataObj.name = item.name;
                            dataObj.address = item.device_address;
                            dataObj.state = Boolean(item.status);
                            dataArr.push(dataObj);
                            item.status?devOnCount++:devOffCount++;
                        })
                        sessionStorage.devData = JSON.stringify(dataArr);
                        // let onCount = devOnCount,offCount = devOffCount, total= data.total_count;
                        let onCount = devOnCount,offCount = devOffCount, total= devOnCount + devOffCount;

                        // for(let i of dataArr){
                        //     i.state?onCount++:offCount++;
                        // }
                        let rightListHeadLoadingShowArr = [];
                        dataArr.slice(0,10).forEach(()=>{
                            rightListHeadLoadingShowArr.push(false);
                        })
                        that.setState({
                            devAll: onCount+offCount,   //全部设备数量
                            devOn: onCount,             //在线设备数量
                            devOff: offCount,           //离线设备数量
                            data: dataArr,
                            rightTemp: dataArr.slice(0,10),
                            current: 1,
                            rightListHeadLoadingShow: rightListHeadLoadingShowArr,
                            total: total,
                        })
                        that.state.rightTemp.forEach(items => {
                            if(items.state){
                                client.subscribe(`/dashboard/1.0/res/thumbnail/${items.talk_id}`);
                                //获取硬件信息
                                client.subscribe(`/dashboard/1.0/res/update/device_status/${items.talk_id}`);
                                // 获取设备的缩略图
                                client.publish(`/dashboard/1.0/get/thumbnail/${items.talk_id}`,`{"talk_id":${items.talk_id},"need":1,"cmd":"dashboard_get_thumbnail","from":"${JSON.parse(sessionStorage.userInfo).account}","to":"","token":""}`,2);
                                devDataUn.push(items.talk_id);
                            }
                        })
                        client.unsubscribe('/dashboard/1.0/res/device_summary_school/'+JSON.parse(sessionStorage.userInfo).account);
                        break;
                    case 'dashboard_get_thumbnail':     //获取设备缩略图
                        let devDataArr = that.state.rightTemp;
                        for(let i of devDataArr){
                            if(i.talk_id === data.from){
                                i.image = data.thumnail_data;
                            }
                        }
                        that.setState({
                            rightTemp: devDataArr,
                        })
                        break;
                    case 'dashboard_update_device_status':  //获取CPU温度并计算
                        let devCpu = 0;
                        let count = 0;
                        for(let i in data.cpu_tempreture){
                            count++;
                            devCpu += data.cpu_tempreture[i];
                        }
                        devCpu = devCpu/count;
                        for(let i of that.state.rightTemp){
                            if(i.talk_id === data.talk_id){
                                i.cpu = devCpu;
                            }
                        }
                        break;
                    case 'dashboard_get_device_in_org_group':
                        let treeDataArr = [{         //左边树状图数据
                            title: '全部设备',
                            key: '0',
                            pattern: true,
                            children: [],
                        }];
                        treeDataArr[0].children = data.result;
                        sessionStorage.treeDataArr = JSON.stringify(treeDataArr);
                        that.setState({
                            treeData: treeDataArr,
                        })
                        break;
                    case 'dashboard_add_group':
                        message.success('新建分组成功');
                        TreeDataModalLogout();
                        client.publish('/dashboard/1.0/get/device_in_org_group',"{organization_id:1,cmd:'dashboard_get_device_in_org_group',from:'"+JSON.parse(sessionStorage.userInfo).account+"',to:'',token:''}",2);
                        client.unsubscribe('/dashboard/1.0/res/add/group/'+JSON.parse(sessionStorage.userInfo).account);
                        break;
                    case 'dashboard_update_group':
                        message.success('重命名分组成功');
                        TreeDataModalLogout();
                        client.publish('/dashboard/1.0/get/device_in_org_group',"{organization_id:1,cmd:'dashboard_get_device_in_org_group',from:'"+JSON.parse(sessionStorage.userInfo).account+"',to:'',token:''}",2);
                        client.unsubscribe('/dashboard/1.0/res/update/group/'+JSON.parse(sessionStorage.userInfo).account);
                        break;
                    case 'dashboard_remove_group_res':
                        message.success('删除分组成功');
                        TreeDataModalLogout();
                        client.publish('/dashboard/1.0/get/device_in_org_group',"{organization_id:1,cmd:'dashboard_get_device_in_org_group',from:'"+JSON.parse(sessionStorage.userInfo).account+"',to:'',token:''}",2);
                        client.unsubscribe('/dashboard/1.0/res/remove/group/'+JSON.parse(sessionStorage.userInfo).account);
                        break;
                    case 'dashboard_update_device':
                        message.success('重命名设备成功');
                        TreeDataModalLogout();
                        client.publish('/dashboard/1.0/get/device_in_org_group',"{organization_id:1,cmd:'dashboard_get_device_in_org_group',from:'"+JSON.parse(sessionStorage.userInfo).account+"',to:'',token:''}",2);
                        client.unsubscribe('/dashboard/1.0/res/update/device/'+JSON.parse(sessionStorage.userInfo).account);
                        break;
                    case 'dashboard_remove_device':
                        message.success('移除设备成功');
                        TreeDataModalLogout();
                        client.publish('/dashboard/1.0/get/device_in_org_group',"{organization_id:1,cmd:'dashboard_get_device_in_org_group',from:'"+JSON.parse(sessionStorage.userInfo).account+"',to:'',token:''}",2);
                        client.unsubscribe('/dashboard/1.0/res/delete/device/'+JSON.parse(sessionStorage.userInfo).account);
                        break;
                    case "dashboard_login_somewhere_res":   //收到其他的登录讯息，退出登录
                        sessionStorage.userInfo = '';
                        sessionStorage.clientId = '';
                        window.location.href = '';
                        break;
                    default:
                        message.error('获取信息有误');
                        client.unsubscribe('/dashboard/1.0/res/device_summary/'+JSON.parse(sessionStorage.userInfo).account);
                        client.unsubscribe('/dashboard/1.0/res/add/group/'+JSON.parse(sessionStorage.userInfo).account);
                        client.unsubscribe('/dashboard/1.0/res/update/group/'+JSON.parse(sessionStorage.userInfo).account);
                        client.unsubscribe('/dashboard/1.0/res/remove/group/'+JSON.parse(sessionStorage.userInfo).account);
                        client.unsubscribe('/dashboard/1.0/res/update/device/'+JSON.parse(sessionStorage.userInfo).account);
                        client.unsubscribe('/dashboard/1.0/res/delete/device/'+JSON.parse(sessionStorage.userInfo).account);
                }
            }else if(data.msg === "item_exists"){
                message.warning('分组已存在');
                client.unsubscribe('/dashboard/1.0/res/add/group/'+JSON.parse(sessionStorage.userInfo).account);
            }else{
                message.error('请求失败');
                client.unsubscribe('/dashboard/1.0/res/device_summary/'+JSON.parse(sessionStorage.userInfo).account);
                client.unsubscribe('/dashboard/1.0/res/add/group/'+JSON.parse(sessionStorage.userInfo).account);
                client.unsubscribe('/dashboard/1.0/res/update/group/'+JSON.parse(sessionStorage.userInfo).account);
                client.unsubscribe('/dashboard/1.0/res/remove/group/'+JSON.parse(sessionStorage.userInfo).account);
                client.unsubscribe('/dashboard/1.0/res/update/device/'+JSON.parse(sessionStorage.userInfo).account);
                client.unsubscribe('/dashboard/1.0/res/delete/device/'+JSON.parse(sessionStorage.userInfo).account);
            }
        }
    }
    //页面卸载时触发
    componentWillUnmount(){
        console.log(client);
        client.disconnect()
        // devDataUn.forEach(item => {
        //     client.unsubscribe(`/dashboard/1.0/res/thumbnail/${item}`);
        // })
    }
    onSelect(info){
        console.log(info);
    };
    powerOn(){
        client.publish('/dashboard/1.0/post/power_on',`{"ips":["192.168.20.162"],"cmd":"power_on","from":"${JSON.parse(sessionStorage.userInfo).account}","to":"","token":""}`,2);
    }
    powerOff(){
        client.publish('/dashboard/1.0/post/power_off',`{"ips":["192.168.20.162"],"cmd":"power_off","from":"${JSON.parse(sessionStorage.userInfo).account}","to":"","token":""}`,2);
    }

    onSearch(value){
        client.subscribe('/dashboard/1.0/res/device_summary/'+JSON.parse(sessionStorage.userInfo).account);
        // 推送给主题(获取设备)
        client.publish('/dashboard/1.0/get/device_summary',`{cmd:'dashboard_device_summary',name_like:'${value}',status:2,organization:'',page_index:0,page_size:300,start_time:'2021-02-23 15:23:50',end_time: '2021-03-02 15:23:50',from:'${JSON.parse(sessionStorage.userInfo).account}',to:'',token:''}`,2);
    }
    handleClick(even){
        switch(even.key){
            case 'card':
                this.setState({
                    pattern: false
                })
                break;
            case 'list':
                this.setState({
                    pattern: true
                })
                break;
            default:
                console.log(even);
        }
    }
    switchClick(e){
        pageType = false;
        this.setState({
            checkedKeys: [],
        })
        client.subscribe('/dashboard/1.0/res/device_summary/'+JSON.parse(sessionStorage.userInfo).account);
        // 推送给主题(获取设备)
        client.publish('/dashboard/1.0/get/device_summary',`{cmd:'dashboard_device_summary',name_like:'',status:'${Number(e.key)}',organization:'',page_index:0,page_size:10,start_time:'',end_time: '',from:'${JSON.parse(sessionStorage.userInfo).account}',to:'',token:''}`,2);
    }
    operation(index){
        console.log(123);
    }
    leftTempB(e){
        e.stopPropagation();
    }
    rightTemp(value,item){
        this.setState({
            rightTemp: this.state.data.slice(item*(value-1),item*value),
            current: value,
        })
        if(devDataUn.length !== 0){
            devDataUn.forEach(items => {
                client.unsubscribe(`/dashboard/1.0/res/thumbnail/${items}`);
                client.unsubscribe(`/dashboard/1.0/res/update/device_status/${items}`);
            })
        }
        devDataUn = [];
        this.state.rightTemp.forEach(items => {
            if(items.state){
                client.subscribe(`/dashboard/1.0/res/thumbnail/${items.talk_id}`);
                client.subscribe(`/dashboard/1.0/res/update/device_status/${items.talk_id}`);
                // 获取设备的缩略图
                client.publish(`/dashboard/1.0/get/thumbnail/${items.talk_id}`,`{"talk_id":${items.talk_id},"need":1,"cmd":"dashboard_get_thumbnail","from":"${JSON.parse(sessionStorage.userInfo).account}","to":"","token":""}`,2);
                devDataUn.push(items.talk_id);
            }
        })
    }
    treeCheck(value){
        this.setState({
            checkedKeys: value,
        })
        pageType = true;
        let treeCheckArr = [];
        for(let i of value){
            treeCheckArr.push(Number(i.split('-')[1]));
        }
        console.log(treeCheckArr);

        client.subscribe('/dashboard/1.0/res/device_summary_school/'+JSON.parse(sessionStorage.userInfo).account);
        // 推送给主题(获取设备)
        client.publish('/dashboard/1.0/get/device_summary_school',`{cmd:'dashboard_device_summary_school',name_like:'',status:'2',vendor_id:0, group_id:0, group_id_list: [${treeCheckArr}],organization:'',page_index:0,page_size:100000,start_time:'',end_time: '',from:'${JSON.parse(sessionStorage.userInfo).account}',to:'',token:''}`,2);
    }
    TreeContent(value){
        return (<div className="TreeContentItem">
            <p onClick={this.TreePClick.bind(this,value,1,'新建分组','分组名称','请输入分组名称',false)}>新建分组</p>
        </div>)
    }
    TreeGroupContent(value){
        return (<div className="TreeContentItem">
            <p onClick={this.TreePClick.bind(this,value,2,'分组重命名','分组名称',value.group_name,false)}>分组重命名</p>
            <p onClick={this.TreePClick.bind(this,value,3,'删除分组','是否确认删除选中的分组和分组下的设备？','',true)}>删除分组</p>
        </div>)
    }
    TreeDevContent(value){
        return (<div className="TreeContentItem">
            <p onClick={this.TreePClick.bind(this,value,4,'设备重命名','设备名称',value.device_name,false)}>设备重命名</p>
            <p onClick={this.TreePClick.bind(this,value,5,'移除设备','是否确认移除选中的设备','',true)}>移除设备</p>
        </div>)
    }
    TreeModalClickOk(){
        switch(this.state.treeDataClickType){
            case 1: //点击新建分组触发
                if(this.state.treeDataModalValue){
                    client.subscribe('/dashboard/1.0/res/add/group/'+JSON.parse(sessionStorage.userInfo).account);
                    // 推送给主题
                    client.publish('/dashboard/1.0/add/group',`{'group_name':'${this.state.treeDataModalValue}','orangization_id':1,cmd:'dashboard_add_group',from:'${JSON.parse(sessionStorage.userInfo).account}',to:'',token:''}`,2);
                }else{
                    message.error('未输入分组名称');
                }
                break;
            case 2: //点击分组重命名触发
                if(this.state.treeDataModalValue){
                    client.subscribe('/dashboard/1.0/res/update/group/'+JSON.parse(sessionStorage.userInfo).account);
                    // 推送给主题
                    client.publish('/dashboard/1.0/update/group',`{'group_id':${this.state.treeDataClickItem.group_id},'group_name':'${this.state.treeDataModalValue}','orangization_id':1,cmd:'dashboard_update_group',from:'${JSON.parse(sessionStorage.userInfo).account}',to:'',token:''}`,2);
                }else{
                    message.error('未输入分组名称');
                }
                break;
            case 3: //点击删除分组触发
                client.subscribe('/dashboard/1.0/res/remove/group/'+JSON.parse(sessionStorage.userInfo).account);
                // 推送给主题
                client.publish('/dashboard/1.0/remove/group',`{'group_id':${this.state.treeDataClickItem.group_id},cmd:'dashboard_remove_group_res',from:'',to:'${JSON.parse(sessionStorage.userInfo).account}',token:''}`,2);
                break;
            case 4: //点击设备重命名触发
                if(this.state.treeDataModalValue){
                    client.subscribe('/dashboard/1.0/res/update/device/'+JSON.parse(sessionStorage.userInfo).account);
                    // 推送给主题
                    client.publish('/dashboard/1.0/update/device',`{'talk_id':"${this.state.treeDataClickItem.talk_id}",'device_name':'${this.state.treeDataModalValue}',cmd:'dashboard_update_device',from:'${JSON.parse(sessionStorage.userInfo).account}',to:'',token:''}`,2);
                }else{
                    message.error('未输入设备名称');
                }
                break;
            case 5: //点击移除设备触发
                client.subscribe('/dashboard/1.0/res/delete/device/'+JSON.parse(sessionStorage.userInfo).account);
                // 推送给主题
                client.publish('/dashboard/1.0/delete/device',`{'talk_id':"${this.state.treeDataClickItem.talk_id}",cmd:'dashboard_remove_device',from:'${JSON.parse(sessionStorage.userInfo).account}',to:'',token:''}`,2);
                break;
            default:
                console.log('error');
                return false;
        }
    }
    TreeModalClickCancel(){
        TreeDataModalLogout();
    }
    TreePClick(item,type,title,text,tips,bool,e){
        e.stopPropagation();
        for(let i of document.getElementsByClassName('ant-popover ant-popover-placement-top')){
            i.className = "ant-popover ant-popover-placement-top ant-popover-hidden";
        };
        this.setState({
            treeDataClickType: type,
            treeDataClickItem: item,
            treeDataModalTitle: title,
            treeDataModalText: text,
            treeDataModalPlaceholder: tips,
            treeDataModalValue: '',
            treeDataModalVisible: bool,
            treeDataModalVisibleInput: !bool,
        })
    }
    treeDataModalInput(values){
        let value = stripscript(values.target.value);
        function stripscript(value) {
            var pattern = new RegExp("[`~!@#$^&*().=|{}':;',\\[\\]<>/?~！@#￥……&*（）——|{}【】‘；：”“'。，、？]") 
            var rs = ""; 
            for (var i = 0; i < value.length; i++) {
                rs = rs+value.substr(i, 1).replace(pattern, ''); 
            } 
            return rs;
        }
        this.formRef.current.setFieldsValue({
            name: value.substring(0,20),
        })
        this.setState({
            treeDataModalValue: value.substring(0,20),
        })
    }
    imageClick(even,index){
        rightListHeadPivewClick = even;
        let rightListHeadLoadingShowArr = this.state.rightListHeadLoadingShow;
        rightListHeadLoadingShowArr[index] = true;
        this.setState({
            rightListHeadLoadingShow: rightListHeadLoadingShowArr,
            rightListHeadLoadingShowBack: true,
        })
        client.subscribe(`/dashboard/1.0/res/snapshot/${even}/${JSON.parse(sessionStorage.userInfo).account}`);
        // 获取设备的界面图
        client.publish(`/dashboard/1.0/get/snapshot/${even}`,`{"talk_id":"${even}","bound":1920,"cmd":"dashboard_get_snapshot","from":"${JSON.parse(sessionStorage.userInfo).account}","to":"","token":""}`,2);
    }
    onSoftManage(){
        if(onSoftManageCont === 1){
            onSoftManageCont = 2;
            setTimeout(function(){
                onSoftManageCont = 1;
            },2000)
            notification.open({
                message: '温馨提示：',
                description:
                    '功能开发中，敬请期待～',
                duration: 2,
            });
        }
    }
    onChange(pagination, filters, sorter, extra) {
        console.log('params', pagination, filters, sorter, extra);
        // pageSize = pagination.pageSize;
        // this.setState({
        //     pageSize: pageSize,
        // })
        let p_current = Number(pagination.current);
        // let p_defaultPageSize = pagination.defaultPageSize;
        let p_pageSize = Number(pagination.pageSize);
        // let p_showQuickJumper = pagination.showQuickJumper;
        // let p_total = pagination.total;
        // 推送给主题
        //client.publish('/dashboard/1.0/get/device_summary',`{cmd:'dashboard_device_summary',name_like:'',status:2,organization:'',page_index:0,page_size:300,start_time:'2021-02-23 15:23:50',end_time: '2021-03-02 15:23:50',from:'',to:'',token:''}`,2);
        // console.log(`{cmd:'dashboard_device_summary',name_like:'${devName}',status:${devState},group_id:${schoolName},page_index:0,page_size:100000,start_time:'${startTime}',end_time: '${endTime}',from:'',to:'',token:''}`);
        if(pageType){
            return false;
        }
        client.subscribe('/dashboard/1.0/res/device_summary/'+JSON.parse(sessionStorage.userInfo).account);
        client.publish('/dashboard/1.0/get/device_summary',`{cmd:'dashboard_device_summary',address_like:'',status:2, vendor_id:0,group_id:0, page_index: ${p_current - 1},page_size:${p_pageSize}, start_time:'',end_time: '', from:'${JSON.parse(sessionStorage.userInfo).account}',to:'',token:''}`,2);
        
    }
    render () {
        that = this;
        return <div className="Manage">
            <Modal title={this.state.treeDataModalTitle} visible={this.state.treeDataModalVisible} onOk={this.TreeModalClickOk.bind(this)} onCancel={this.TreeModalClickCancel.bind(this)}>
                <p>{this.state.treeDataModalText}</p>
            </Modal>
            <Modal title={this.state.treeDataModalTitle} visible={this.state.treeDataModalVisibleInput} onOk={this.TreeModalClickOk.bind(this)} onCancel={this.TreeModalClickCancel.bind(this)}>
                <Form ref={this.formRef}>
                    <Form.Item label={this.state.treeDataModalText} initialValue={this.state.treeDataModalValue} name="name">
                        <Input placeholder={this.state.treeDataModalPlaceholder} onChange={this.treeDataModalInput.bind(this)}/>
                    </Form.Item>
                </Form>
            </Modal>
            <div className="manage_left">
                <Space direction="vertical">
                    <Form.Item label="设备名称：">
                        <Search placeholder="请输入" onSearch={this.onSearch} />
                    </Form.Item>
                </Space>
                <div className="left_box">
                    {
                        this.state.treeData.length !== 0?(<Tree className="left_temp" selectable={false} switcherIcon={<DownOutlined/>} defaultExpandedKeys={['0']} checkable checkedKeys={this.state.checkedKeys} onCheck={this.treeCheck.bind(this)}>
                        {
                            this.state.treeData.map(item => (
                                <TreeNode title={<p className="left_temp_p">
                                        {item.title}
                                        <Popover content={this.TreeContent.bind(this,item)} trigger="click">
                                            <b onClick={this.leftTempB}>···</b>
                                        </Popover>
                                    </p>} key={item.key} icon={<ExclamationCircleOutlined />}>
                                    {
                                        item.children.map(items =>(
                                            <TreeNode title={<p className="left_temp_p" title={items.group_name}>
                                                {items.group_name}
                                                <Popover content={this.TreeGroupContent.bind(this,items)} trigger="click">
                                                    <b onClick={this.leftTempB}>···</b>
                                                </Popover>
                                            </p>} key={'0-'+items.group_id}>
                                                {
                                                    items.hasOwnProperty('devices')?items.devices.map(itemZ => (<TreeNode checkable={false} title={<p className="left_temp_p" title={itemZ.device_name}>
                                    {/* {console.log('itemZ.device_address', itemZ.device_address)}
                                    {console.log('itemZ.device_name', itemZ.device_name)}                     */}
                                     - {itemZ.device_address ? itemZ.device_address : itemZ.device_name}
                                    <Popover content={this.TreeDevContent.bind(this,itemZ)} trigger="click">
                                        <b onClick={this.leftTempB}>···</b>
                                    </Popover>
                                </p>} key={'0-0-'+itemZ.talk_id}/>)):false
                                                    }
                                                </TreeNode>
                                            ))
                                        }
                                    </TreeNode>
                                ))
                            }
                        </Tree>):false
                    }
                </div>
            </div>
            <div className="manage_right">
                <div className="right_head">
                    <Menu className="right_head_menu" onClick={this.switchClick.bind(this)} mode="horizontal">
                        <Menu.Item key="2">全部设备（{this.state.devAll}）</Menu.Item>
                        <Menu.Item key="1">在线（{this.state.devOn}）</Menu.Item>
                        <Menu.Item key="0">离线（{this.state.devOff}）</Menu.Item>
                    </Menu>
                    <Menu className="right_head_icon" defaultSelectedKeys={['list']} onClick={this.handleClick.bind(this)} mode="horizontal">
                        {/* <Menu.Item key="btn"><Button onClick={this.onSoftManage}>系统升级</Button>&nbsp;&nbsp;&nbsp;<Button onClick={this.onSoftManage}>关机管理</Button></Menu.Item> */}
                        <Menu.Item key="btn">
                            <Dropdown overlay={menu} placement="bottomCenter">
                                <Button className="moreManage">更多管理<DownOutlined /></Button>
                            </Dropdown>
                        </Menu.Item>
                        <Menu.Item key="card"><AppstoreOutlined/></Menu.Item>
                        <Menu.Item key="list"><BarsOutlined/></Menu.Item>
                    </Menu>
                </div>
                <div className="right_box">
                        {this.state.pattern?<Table columns={this.state.columns} dataSource={this.state.data} pagination={{showQuickJumper: true,defaultPageSize: 10,pageSizeOptions: [10,20,50],total: this.state.total,showTotal: total => `共${total}条`}} onChange={this.onChange.bind(this)} />:<div className="right_temp">{this.state.rightTemp.map((item,index) => (
                                <div className="right_list" key={index}>
                                    {
                                        item.state?<div className="right_list_head">
                                            {item.image?<Image src={item.image}/>:<Image src="../image/dev.png"/>}
                                            <Image className="right_list_head_pivew" data-talk={item.talk_id} src={this.state.rightTempPivew?this.state.rightTempPivew:'../image/dev.png'} style={{cursor: 'pointer'}} alt="在线"/>
                                            {this.state.rightListHeadLoadingShowBack?<div className="right_list_head_loading_show">{this.state.rightListHeadLoadingShow[index]?<Image className="right_list_head_loading" preview={false} src="../image/loading.svg"/>:null}</div>:<div className="right_list_head_loading_hide" onClick={this.imageClick.bind(this,item.talk_id,index)}></div>}
                                            {item.cpu >= 85?<span className="right_list_head_tips" >CPU温度已达到{Math.round(item.cpu)}度</span>:false}
                                        </div>:<div className="right_list_head">
                                            <div>
                                                <Image className="img_off" src="error" fallback="../image/liXian.png" alt="离线"/>
                                            </div>
                                        </div>
                                    }
                                    <div className="right_list_content">
                                        <Link to={{pathname:'./dev_details',state:{item: item,talk_id:item.talk_id}}}>
                                        {console.log('item.address', item.address)}
                                        {console.log('item.name', item.name)}
                                            {item.group}{item.address ? item.address : item.name}
                                            </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    }
                    {this.state.pattern?false:<Pagination showQuickJumper className="right_page" onChange={this.rightTemp.bind(this)} current={this.state.current} total={this.state.total} showTotal={total => `共 ${total} 条`}/>}
                </div>
            </div>
        </div>
    };
}

export default Dev;