import React from 'react';
import { EditOutlined } from '@ant-design/icons';
import {Modal, Input, Form, Table, Popover, message, Button, notification} from "antd";
import Paho from "paho-mqtt";

const columns = [
    {
        title: '事件ID',
        dataIndex: 'log_id',
    },
    {
        title: '类型',
        dataIndex: 'type',
    },
    {
        title: '日期和时间',
        dataIndex: 'time',
    },
    {
        title: '来源',
        dataIndex: 'source',
    },
    {
        title: '详情',
        dataIndex: 'message',
        render: (message,item) => {
            return(
                <div>{message.substring(0,10)}<Popover placement="topRight" content={(<div>
                    <p style={{padding: '10px 15px',maxWidth: '650px',marginBottom: '0'}}>{message}</p>
                    </div>)} className="messageTitle" title={item.type} arrowPointAtCenter>...</Popover></div>
            )
        }
    },
];

let that,client;
let onSoftManageCont = 1;
let GbCompany = ['B','KB','MB','G','TB'];
function Gb(num,count){
    if(num > 1024){
        count++;
        num = num/1024;
        if(num > 1024){
            return Gb(num,count);
        }else{
            let obj = {};
            obj.num = num;
            obj.count = count;
            return obj;
        }
    }else{
        let obj = {};
        obj.num = num;
        obj.count = count;
        return obj;
    }
}

class Dev_details extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            isModalVisible: false,
            modalTitle: '',
            modalText: '',
            modalPlaceholder: '',
            modalValue: '', //实时监听弹窗输入的内容
            modalType: 0,
            name: '',           //设备名称
            talk_id: '',        //设备ID
            ip: '',             //设备IP&IP地址
            group: '',          //设备分组
            desc: '',           //备注
            os: '',             //操作系统
            os_version: '',     //操作系统内部版本
            free_space: '',     //可用空间
            total_space: '',    //总空间
            on_time: '',        //使用时长
            on_count: '',       //开机次数
            off_count: '',      //关机次数
            data: [],           //大屏日志数据
            dataLoading: true,
        }
    }
    componentWillUnmount(){
        console.log(client);
        client.disconnect();
    }
    componentDidMount(){
        if(!sessionStorage.userInfo){
            sessionStorage.clientId = '';
            window.location.href = '';
        }
        client = new Paho.Client(sessionStorage.getUrl, 8083, '/mqtt', sessionStorage.clientId);
        detailsStart(this.props.location.state?this.props.location.state.talk_id:'');
        function detailsStart(topId){
            topId = topId?topId:sessionStorage.talk_id;
            sessionStorage.talk_id = topId;
            //mqtt发起连接
            client.connect({
                useSSL: false,
                onSuccess: onConnect,
                onFailure:(e)=>{ console.log('失败'); console.log(e);}
            });
        //连接成功后触发事件
            function onConnect(){
                //获取设备详情
                client.subscribe('/dashboard/1.0/res/device_detail/'+JSON.parse(sessionStorage.userInfo).account);
                // 推送给主题
                //console.log(`{"talk_ids":[${topId}],"cmd":"dashboard_device_detail","from":"${JSON.parse(sessionStorage.userInfo).account}","to":"","token":""}`);
                client.publish('/dashboard/1.0/get/device_detail',`{"talk_ids":[${topId}],"cmd":"dashboard_device_detail","from":"${JSON.parse(sessionStorage.userInfo).account}","to":"","token":""}`,2);
                //获取硬件信息
                client.subscribe(`/dashboard/1.0/res/update/device_status/${topId}`);
                //获取大屏日志
                client.subscribe(`/dashboard/1.0/res/log/${topId}/${JSON.parse(sessionStorage.userInfo).account}`);
                // 推送给主题
                client.publish(`/dashboard/1.0/get/log/${topId}`,`{"from":"${JSON.parse(sessionStorage.userInfo).account}","to":"","token":""}`,2);
                //订阅踢人监听
                client.subscribe('/dashboard/1.0/res/login_somewhere/'+sessionStorage.clientId);
            }
        //接收消息事件
            client.onMessageArrived = onMessageArrived;
            function onMessageArrived (Message) {
                let data = JSON.parse(Message.payloadString);
                console.log(data);
                if(data.error === 0){
                    if(data.response_to_cmd === 'dashboard_device_detail'){
                        that.setState({
                            name: data.result[0].name,   //设备名称
                            talk_id: data.result[0].talk_id,//设备ID
                            ip: data.result[0].ip,     //设备IP&&IP地址
                            group: data.result[0].group_name,  //设备分组
                            desc: data.result[0].desc,   //备注 
                            os: data.result[0].os,     //操作系统
                            os_version: data.result[0].os_version,     //操作系统内部版本
                            on_time: (data.result[0].on_time/3600).toFixed(1),        //使用时长
                            on_count: data.result[0].on_count,      //开机次数
                            off_count: data.result[0].off_count,    //关机次数
							address: data.result[0].address,   //设备地址
                        })
                    }else if(data.response_to_cmd === 'dashboard_update_device_status'){
                        let freeSpace = 0;
                        let totalSpace = 0;
                        data.drivers.forEach(item => {
                            freeSpace += item.free_space;
                            totalSpace += item.total_space;
                        })
                        freeSpace = Gb(freeSpace,0);
                        totalSpace = Gb(totalSpace,0);
                        that.setState({
                            free_space: freeSpace.num.toFixed(2) + GbCompany[freeSpace.count],  //可用空间
                            total_space: totalSpace.num.toFixed(2) + GbCompany[totalSpace.count],//总空间
                        })
                    }else if(data.response_to_cmd === 'dashboard_get_log'){
                        let journalArr = [],journalObjct;
                        data.result.forEach((item,index) => {
                            journalObjct = item;
                            journalObjct.key = index;
                            journalArr.push(journalObjct);
                        })
                        that.setState({
                            data: journalArr,
                            dataLoading: false,
                        })
                    }else if(data.response_to_cmd === 'dashboard_update_device'){
                        message.success('修改成功');
                        client.publish('/dashboard/1.0/get/device_detail',`{"talk_ids":[${topId}],"cmd":"dashboard_device_detail","from":"${JSON.parse(sessionStorage.userInfo).account}","to":"","token":""}`,2);
                        client.unsubscribe('/dashboard/1.0/res/update/device/'+JSON.parse(sessionStorage.userInfo).account);
                    }else if(data.response_to_cmd === 'dashboard_login_somewhere_res'){//收到其他的登录讯息，退出登录
                        sessionStorage.userInfo = '';
                        sessionStorage.clientId = '';
                        window.location.href = '';
                    }else{
                        message.error('获取信息有误');
                    }
                }else{
                    message.error('请求失败');
                }
            }
        }
    }
    EditDevName(){
        this.setState({
            isModalVisible: true,
            modalTitle: '修改设备名称',
            modalText: '设备名称',
            modalPlaceholder: '请输入设备名称',
            modalType: 1,
        })
    }
    EditRemark(){
        this.setState({
            isModalVisible: true,
            modalTitle: '添加备注',
            modalText: '备注信息',
            modalPlaceholder: '请输入备注信息',
            modalType: 2,
        })
    }
    editName(values){
        let value = stripscript(values.target.value);
        function stripscript(value) {
            var pattern = new RegExp("[`~!@#$^&*().=|{}':;',\\[\\]<>/?~！@#￥……&*（）——|{}【】‘；：”“'。，、？]") 
            var rs = ""; 
            for (var i = 0; i < value.length; i++) {
                rs = rs+value.substr(i, 1).replace(pattern, ''); 
            } 
            return rs;
        }
        this.setState({
            modalValue: value.substring(0,20),
        })
    }
    handleOk(){
        client.subscribe('/dashboard/1.0/res/update/device/'+JSON.parse(sessionStorage.userInfo).account);
        if(this.state.modalType === 1){
            // 推送给主题
            client.publish('/dashboard/1.0/update/device',`{"talk_id":"${this.state.talk_id}","device_name":"${this.state.modalValue}","cmd":"dashboard_update_device","from":"${JSON.parse(sessionStorage.userInfo).account}","to":"","token":""}`,2);
        }else{
            // 推送给主题
            client.publish('/dashboard/1.0/update/device',`{"talk_id":"${this.state.talk_id}","desc":"${this.state.modalValue}","cmd":"dashboard_update_device","from":"${JSON.parse(sessionStorage.userInfo).account}","to":"","token":""}`,2);
        }
        this.setState({
            isModalVisible: false,
            modalValue: '',
        })
    }
    handleCancel(){
        this.setState({
            isModalVisible: false,
        })
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
    render(){
        that = this;
        return <div className="Dev_details">
            {/*确认弹窗*/}
            <Modal title={this.state.modalTitle} visible={this.state.isModalVisible} onOk={this.handleOk.bind(this)} onCancel={this.handleCancel.bind(this)}>
                <Form.Item label={this.state.modalText}><Input onChange={this.editName.bind(this)} value={this.state.modalValue} placeholder={this.state.modalPlaceholder}/></Form.Item>
            </Modal>
            <div className="Dev_details_box Dev_details_top">
                <p className="Dev_details_box_title">设备信息</p>
                <div className="Dev_details_temp">
                    <table>
                        <tbody>
                            <tr>
                                <td>设备名称：<span>{this.state.name}</span><EditOutlined onClick={this.EditDevName.bind(this)} style={{fontSize: '20px',color:'#2AA9FF',position: 'relative',top: '4px'}}/></td>
                                <td>设备ID：<span>{this.state.talk_id}</span></td>
                                <td>设备IP：<span>{this.state.ip}</span></td>
                            </tr>
                            <tr>
                                <td>设备分组：<span>{this.state.group}</span></td>
								<td>设备地址：<span>{this.state.address}</span></td>
                                <td colSpan="2">备注：{this.state.desc}<EditOutlined onClick={this.EditRemark.bind(this)} style={{fontSize: '20px',color:'#2AA9FF',position: 'relative',top: '4px'}}/></td>
							</tr>
                        </tbody>
                    </table>
                </div>
            </div>
            <div className="Dev_details_box Dev_details_center">
                <p className="Dev_details_box_title">操作系统信息</p>
                <div className="Dev_details_temp">
                    <table>
                        <tbody>
                        <tr>
                            <td>操作系统：<span>{this.state.os}</span></td>
                            <td>可用空间：<span>{this.state.free_space}</span></td>
                            <td>总空间：<span>{this.state.total_space}</span></td>
                        </tr>
                        <tr>
                            <td>IP地址：<span>{this.state.ip}</span></td>
                            <td colSpan="2">操作系统内部版本：<span>{this.state.os_version}</span> &nbsp;&nbsp;<Button onClick={this.onSoftManage}>版本升级</Button></td>
                        </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            <div className="Dev_details_box Dev_details_bottom">
                <p className="Dev_details_box_title">相关数据信息</p>
                <div className="Dev_details_temp">
                    <table>
                        <tbody>
                        <tr>
                            <td>总开机时长：<span>{this.state.on_time}小时</span></td>
                            <td>开机次数：<span>{this.state.on_count}次</span></td>
                            <td>关机次数：<span>{this.state.off_count}次</span></td>
                        </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            <div className="Dev_details_box Dev_details_footer">
                <p className="Dev_details_box_title">大屏日志</p>
                <div className="Dev_details_temp">
                    <Table columns={columns} dataSource={this.state.data} loading={this.state.dataLoading}/>
                </div>
            </div>
        </div>
    }
}

export default Dev_details;