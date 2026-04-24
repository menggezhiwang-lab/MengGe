import React from 'react';
import { Select,Button,message } from 'antd';
import './css/Dev_entry.css';
import Paho from "paho-mqtt";
let client;
class Dev_entry extends React.Component{
    state = {
        FixedLeft: '100%',
        schoolList: [],
        hardwareVlaue: '',
        deviceName:'',
        schoolValue: '',
        addValue: '',
        vendorValue: '',
    };
    onChange(value) {
        this.setState({
            schoolValue: value
        })
    }
    onVendorChange(value) {
        this.setState({
            vendorValue: value
        })
    }
    AddChange(value){
        this.setState({
            addValue: value.target.value
        })
    }
    onSubmit(){
        client.subscribe('/dashboard/1.0/res/add/device');
        // 推送给主题
        //${JSON.parse(sessionStorage.userInfo).account}
        client.publish('/dashboard/1.0/add/device',`{hardware_info:'${this.state.hardwareVlaue}', name:'${this.state.deviceName}', address:'${this.state.addValue}',group_id:${this.state.schoolValue}, vendor_id:${this.state.vendorValue},org_id:1,cmd:'dashboard_add_device',from:'admin',to:'',token:''}`,2);
    }
    // onSuccess(){
    //     this.setState({
    //         FixedLeft: '100%',
    //     })
    // }
    componentDidMount(){
        let that = this;
        function getUrlToken(name,str){
            const reg = new RegExp(`(^|&)${ name}=([^&]*)(&|$)`);
            const r = str.substr(1).match(reg);
            if (r != null) return  decodeURIComponent(r[2]); return null;
        }
        that.setState({
            hardwareVlaue: getUrlToken('hw',this.props.location.search),
        })
        that.setState({
            deviceName: getUrlToken('dname',this.props.location.search),
        })
        client = new Paho.Client(sessionStorage.getUrl, 8083, '/mqtt', sessionStorage.clientId);
        //mqtt发起连接
        client.connect({
            useSSL: false,
            onSuccess: onConnect,
            onFailure:(e)=>{ console.log('失败'); console.log(e);}
        });
        //连接成功后触发事件
        function onConnect(){   
            // console.log('Connected'); 
            // client.subscribe('/dashboard/1.0/res/device_in_org_group/admin');
            client.subscribe('/dashboard/1.0/res/device_entry_group_vendor/admin');
            // 推送给主题 hardware_info:'${this.state.hardwareVlaue}'
            // client.publish('/dashboard/1.0/get/device_in_org_group',"{organization_id:1,cmd:'dashboard_get_device_in_org_group',from:'admin',to:'',token:''}",2);
            client.publish('/dashboard/1.0/get/device_entry_group_vendor',`{organization_id:1, cmd:'dashboard_get_device_entry_group_vendor',from:'admin',to:'',token:''}`,2);
            //client.publish('/dashboard/1.0/get/device_in_org_group',"{organization_id:1,cmd:'dashboard_get_device_in_org_group',from:'"+JSON.parse(sessionStorage.userInfo).account+"',to:'',token:''}",2);
        }
        client.onMessageArrived = onMessageArrived;
        function onMessageArrived (Message) {
            let data = JSON.parse(Message.payloadString);
            if(data.response_to_cmd === "dashboard_get_device_entry_group_vendor"){
                // console.log('data.response_to_cmd=',data.response_to_cmd);
                if(data.error === 0){
                    let schoolListArr = [];
                    let vendorListArr = [];
                    for(let i of data.group_result){
                        schoolListArr.push({
                            label: i.group_name,
                            value: i.group_id
                        })
                    }
                    for(let i of data.vendor_result){
                        vendorListArr.push({
                            label: i.vendor_name,
                            value: i.vendor_id
                        })
                    }
                    // console.log('vendorListArr=',vendorListArr, 'schoolListArr', schoolListArr);
                    schoolListArr.sort((a, b) => {
                        return a.label.localeCompare(b.label, 'zh-Hans-CN', { sensitivity: 'base' });
                    });
                    that.setState({
                        schoolList: schoolListArr,
                        vendorList: vendorListArr,
                    })
                }else{
                    message.error('请求失败');
                }
                client.unsubscribe('/dashboard/1.0/res/device_entry_group_vendor/admin');
            }else if(data.response_to_cmd === "dashboard_add_device"){
                if(data.error === 0){
                    message.success('添加成功');
                    that.setState({
                        FixedLeft: 0,
                    })
                }else{
                    if(data.msg === "item_exists"){
                        message.error('设备已存在');
                    }else{
                        message.error('添加失败');
                    }
                }
            }
        }
        
    }
    render(){
        let metaDom = document.createElement('meta');
        metaDom.name = 'viewport';
        metaDom.content = 'maximum-scale=1.0,minimum-scale=1.0,user-scalable=0,width=device-width,initial-scale=1.0';
        document.querySelector('head').appendChild(metaDom);
        return (
            <div className="dev_entry">
                <div className="dev_entry_head">
                    <img src="image/dev_entry_head.png" alt="tile图"/>
                </div>
                <p className="dev_entry_p">录入设备的详细地址</p>
                <table className="dev_entry_table">
                    <tbody>
                        <tr>
                            <td>硬件标志</td>
                            <td>
                                <input className="dev_id" type="text" value={this.state.hardwareVlaue} disabled/>
                            </td>
                        </tr>
                        <tr>
                            <td>学校名称</td>
                            <td>
                            <Select
                                showSearch
                                style={{width:'100%',fontSize: '1.7rem'}}
                                bordered={false}
                                placeholder="选择学校"
                                optionFilterProp="children"
                                onChange={this.onChange.bind(this)}
                                options={this.state.schoolList}
                                filterOption={(input, option) =>
                                    option.label.indexOf(input.toLowerCase()) >= 0
                                }
                            >
                            </Select>
                            </td>
                        </tr>

                        <tr>
                            <td>设备地址</td>
                            <td>
                                <input onChange={this.AddChange.bind(this)} placeholder="如:教室房间号码 (必填)" type="text"/>
                            </td>
                        </tr>
                        <tr>
                            <td>设备品牌</td>
                            <td>
                            <Select
                                showSearch
                                style={{width:'100%',fontSize: '1.7rem'}}
                                bordered={false}
                                placeholder="选择大屏品牌"
                                optionFilterProp="children"
                                onChange={this.onVendorChange.bind(this)}
                                options={this.state.vendorList}
                                filterOption={(input, option) =>
                                    option.label.indexOf(input.toLowerCase()) >= 0
                                }
                            >
                            </Select>
                            </td>
                        </tr>
                    </tbody>
                </table>
                <Button type="primary" onClick={this.onSubmit.bind(this)} style={{
                    width: '20rem',
                    height: '4.8rem',
                    fontSize: '1.7rem',
                    marginTop: '6rem',
                }}>确定</Button>
                <div className="dev_entry_fixed" style={{left: this.state.FixedLeft}}>
                    <img src="../image/success.svg" alt="成功"/>
                    <p>提交成功</p>
                    {/* <Button type="primary" onClick={this.onSuccess.bind(this)} style={{
                        width: '20rem',
                        height: '4.8rem',
                        fontSize: '1.7rem',
                    }}>完成</Button> */}
                </div>
            </div>
        )
    }
}

export default Dev_entry;