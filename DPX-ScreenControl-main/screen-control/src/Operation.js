import React from 'react';
import {Form, Input, Select, DatePicker, Button, Table, notification, message} from 'antd';
//import { Link } from 'react-router-dom';
import './css/Operation.css';
import Paho from "paho-mqtt";
const { Option } = Select;
const { RangePicker } = DatePicker;

let that,client;

const columns = [
    {
        title: '操作时间',
        dataIndex: 'time',
        render: item=>{
            return item.replace(/T/, ' ');
        }
    },
    {
        title: '操作者',
        dataIndex: 'people',
        align: 'center',
    },
    {
        title: '操作账号',
        dataIndex: 'account',
        align: 'center',
    },
    {
        title: '操作命令',
        dataIndex: 'order',
        align: 'center',
    },
    {
        title: '操作设备',
        dataIndex: 'dev',
        align: 'center',
        render: (dev,item)=>{
            return dev?item.group+dev:'';
        }
    },
    {
        title: '操作结果',
        dataIndex: 'result',
        align: 'center',
    },
    // {
    //     title: '操作',
    //     dataIndex: '',
    //     render: (item)=> {
    //         return(
    //             <div className="table_states">
    //                 <Link to={{pathname: './operation_details',state: {item: item}}}>详情</Link>
    //             </div>
    //         )
    //     },
    // },
];

class  Operation extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            peopleList: sessionStorage.peopleList?JSON.parse(sessionStorage.peopleList):[],
            data: sessionStorage.operationData?JSON.parse(sessionStorage.operationData):[],
            reportTableLoading: false,
        }

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
            client.subscribe('/dashboard/1.0/res/operation_log/'+JSON.parse(sessionStorage.userInfo).account);
            // 推送给主题
            client.publish('/dashboard/1.0/get/operation_log',`{"device_like":"","account":"","operation":"","result":"","page_index":0,"page_size":300,"start_time":"","end_time": "","cmd":"dashboard_get_operation_log","from":"${JSON.parse(sessionStorage.userInfo).account}","to":"","token":""}`,2);
            client.subscribe('/dashboard/1.0/res/user/'+JSON.parse(sessionStorage.userInfo).account);
            client.publish('/dashboard/1.0/get/user',`{"name_like":"","permission":"","page_index":0,"page_size":10,"cmd":"dashboard_get_user","from":"${JSON.parse(sessionStorage.userInfo).account}","to":"","token":""}`,2);
            //订阅踢人监听
            client.subscribe('/dashboard/1.0/res/login_somewhere/'+sessionStorage.clientId);
        }
        //接收消息事件
        client.onMessageArrived = onMessageArrived;
        function onMessageArrived (Message) {
            let data = JSON.parse(Message.payloadString);
            console.log(data);
            if(data.error === 0){
                if(data.response_to_cmd === "dashboard_get_operation_log"){
                    let operationDataArr = [];
                    let operationDataObj = {};
                    data.result.forEach((item,index) => {
                        operationDataObj = {};
                        operationDataObj.key = index;
                        operationDataObj.time = item.time;
                        operationDataObj.people = item.name;
                        operationDataObj.order = item.operation;
                        operationDataObj.dev = item.device_name;
                        operationDataObj.group = item.group;
                        operationDataObj.result = item.result;
                        operationDataObj.internet_ip = item.internet_ip;
                        operationDataObj.intranet_ip = item.intranet_ip;
                        operationDataObj.account = item.account;
                        operationDataObj.device_name = item.device_name;
                        operationDataObj.device_type = item.device_type;
                        operationDataObj.device_group = item.device_group;
                        operationDataArr.push(operationDataObj);
                    })
                    sessionStorage.operationData = JSON.stringify(operationDataArr);
                    that.setState({
                        data: operationDataArr,
                        reportTableLoading: false,
                    })
                }else if(data.response_to_cmd === "dashboard_get_user"){
                    sessionStorage.peopleList = JSON.stringify(data.result);
                    that.setState({
                        peopleList: data.result,
                    })
                    client.unsubscribe('/dashboard/1.0/res/user/'+JSON.parse(sessionStorage.userInfo).account);
                }else if(data.response_to_cmd === 'dashboard_login_somewhere_res'){//收到其他的登录讯息，退出登录
                    sessionStorage.userInfo = '';
                    sessionStorage.clientId = '';
                    window.location.href = '';
                }else{
                    message.error('获取信息有误');
                }
            }else{
                message.error('请求失败');
                client.unsubscribe('/dashboard/1.0/res/user/'+JSON.parse(sessionStorage.userInfo).account);
            }
        }
    }
    formRef = React.createRef()
    //选择下拉框触发
    handleChange(value) {
        console.log(`selected ${value}`);
    }
    //重置表单事件
    onReset(){
        this.formRef.current.resetFields();
        this.onFinish({dev_name: '',dev_state: '',dev_order: '',dev_result: '',time_select:''});
    };
    //提交表单成功触发
    onFinish(values){
        that.setState({
            reportTableLoading: true,
        })
        // 推送给主题
        let devName = values.dev_name?values.dev_name:"";
        let devUser = values.dev_state?values.dev_state:"";
        let devOrder = values.dev_order?values.dev_order:"";
        let devResult = values.dev_result?values.dev_result:"";
        let startTime = values.time_select?values.time_select[0].format('YYYY-MM-DD 00:00:00'):"";
        let endTime = values.time_select?values.time_select[1].format('YYYY-MM-DD 23:59:59'):"";

        // 推送给主题
        client.publish('/dashboard/1.0/get/operation_log',`{"device_like":"${devName}","account":"${devUser}","operation":"${devOrder}","result":"${devResult}","page_index":0,"page_size":300,"start_time":"${startTime}","end_time": "${endTime}","cmd":"dashboard_get_operation_log","from":"${JSON.parse(sessionStorage.userInfo).account}","to":"","token":""}`,2);
    };
    //提交表单失败触发
    onFinishFailed(errorInfo){
        console.log('Failed:', errorInfo);
    };
    //点击导出报表实现
    onExport(){
        notification.open({
            message: '温馨提示：',
            description:
                '功能开发中，敬请期待～',
            duration: 2,
        });
    }
    //表单变化事件
    onChange(pagination, filters, sorter, extra) {
        console.log('params', pagination, filters, sorter, extra);
    }
    render () {
        that = this;
        return <div className="Report">
            <div className="report_head">
                <Form className="report_form" ref={this.formRef} name="basic" layout="vertical" initialValues={{ remember: true }} onFinish={this.onFinish} onFinishFailed={this.onFinishFailed}>
                    <Form.Item label="操作设备" name="dev_name">
                        <Input className="dev_name" placeholder="请输入"/>
                    </Form.Item>
                    <Form.Item label="操作者" name="dev_state" style={{marginRight: '16px'}}>
                        <Select className="dev_user dev_select" placeholder="请选择" onChange={this.handleChange}>
                            {
                                this.state.peopleList.map((item)=>{
                                    return <Option key={item.account} value={item.account}>{item.name}</Option>
                                })
                            }
                        </Select>
                    </Form.Item>
                    <Form.Item label="操作命令" name="dev_order" style={{marginRight: '16px'}}>
                        <Select className="dev_order dev_select" placeholder="请选择" onChange={this.handleChange}>
                            <Option value="">全部</Option>
                            <Option value="修改设备名称">修改设备名称</Option>
                            <Option value="修改设备备注">修改设备备注</Option>
                            <Option value="修改设备所属组">修改设备所属组</Option>
                            <Option value="修改设备地址">修改设备地址</Option>
                            <Option value="移除设备">移除设备</Option>
                            <Option value="添加分组">添加分组</Option>
                            <Option value="删除分组">删除分组</Option>
                            <Option value="重命名分组">重命名分组</Option>
                            <Option value="登录">登录</Option>
                            <Option value="退出">退出</Option>
                            <Option value="启用账号">启用账号</Option>
                            <Option value="禁用账号">禁用账号</Option>
                            <Option value="更新密码">更新密码</Option>
                            <Option value="更改昵称">更改昵称</Option>
                            <Option value="修改用户备注">修改用户备注</Option>
                            <Option value="修改用户权限">修改用户权限</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item label="操作结果" name="dev_result" style={{marginRight: '16px'}}>
                        <Select className="dev_result dev_select" placeholder="请选择" onChange={this.handleChange}>
                            <Option value="">全部</Option>
                            <Option value="Success">Success</Option>
                            <Option value="Failed">operation_failed</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item label="时间查询" name="time_select">
                        <RangePicker />
                    </Form.Item>
                    <Button className="report_search" type="primary" htmlType="submit">
                        查询
                    </Button>
                    <Button className="report_reset" htmlType="button" onClick={this.onReset.bind(this)}>
                        重置
                    </Button>
                </Form>
            </div>
            <div className="report_content">
                <Table className="report_table" columns={columns} loading={this.state.reportTableLoading} dataSource={this.state.data} pagination={{showQuickJumper: true,defaultPageSize: 10,pageSizeOptions: [10,20,50],total: this.state.data.length,showTotal: total => `共${total}条`}} onChange={this.onChange} />
            </div>
        </div>
    };
}

export default Operation;