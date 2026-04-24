import React from 'react';
import {Button, Form, Input, notification, Select, Table, Tag, Switch, Modal, message} from "antd";
import Paho from "paho-mqtt";
import Md5 from 'js-md5';
const { Option } = Select;

let that,client;
let onExportCont = 1;

class User extends React.Component{
    formRef = React.createRef()
    state = {
        isModalVisible: false,      //账号禁用弹窗是否可见
        ModalText: '',              //弹窗正文内容
        ModalIndex: 0,              //弹窗索引（用于确认弹出的是哪个窗口）
        selectIndex: 0,             //当前操作开关
        isModalUser: false,         //添加/编辑人员弹窗是否可见
        ModalUserTitle: '',         //添加/编辑人员弹窗标题
        ModalUserEditTitle: '',     //添加/编辑人员弹窗标题
        reportTableLoading: false,  //搜索显示加载效果
        userid: '',
        columns: [
            {
                title: '账号',
                dataIndex: 'name',
                render: name => {
                    return(
                        <Tag style={{color: '#1890FF',border: 'none',backgroundColor: 'rgba(0,0,0,0)',fontSize: '14px'}}>
                            {name}
                        </Tag>
                    )
                }
            },
            {
                title: '账号权限',
                dataIndex: 'permission',
                align: 'center',
            },
            {
                title: '创建时间',
                dataIndex: 'time',
                align: 'center',
            },
            {
                title: '禁用开关',
                dataIndex: 'state',
                align: 'center',
                render: (state,index) => {
                    return(
                        <Tag style={{border: 'none',backgroundColor: 'rgba(0,0,0,0)'}}>
                            <Switch checked={state} onClick={this.stateClick.bind(this,index)} />
                        </Tag>
                    )
                }
            },
            {
                title: '操作',
                dataIndex: '',
                align: 'center',
                render: (item) => {
                    return(
                        <Tag style={{color: '#1890FF',border: 'none',backgroundColor: 'rgba(0,0,0,0)',fontSize: '14px',userSelect: 'none'}}>
                            <span style={{cursor: 'pointer'}} onClick={this.userEdit.bind(this,item)}>编辑</span>
                            &nbsp;&nbsp;&nbsp;
                            <span style={{cursor: 'pointer'}} onClick={this.userDelete.bind(this,item)}>删除</span>
                        </Tag>
                    )
                }
            },
        ],
        data: sessionStorage.userData?JSON.parse(sessionStorage.userData):[],
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
            client.subscribe('/dashboard/1.0/res/user/'+JSON.parse(sessionStorage.userInfo).account);
            // 推送给主题
            client.publish('/dashboard/1.0/get/user',`{"name_like":"","permission":"","page_index":0,"page_size":10000,"cmd":"dashboard_get_user","from":"${JSON.parse(sessionStorage.userInfo).account}","to":"","token":""}`,2);
            //订阅踢人监听
            client.subscribe('/dashboard/1.0/res/login_somewhere/'+sessionStorage.clientId);
        }
        //接收消息事件
        client.onMessageArrived = onMessageArrived;
        function onMessageArrived (Message) {
            let data = JSON.parse(Message.payloadString);
            console.log(data);
            if(data.error === 0){
                if(data.response_to_cmd === "dashboard_get_user"){
                    let userDataArr = [];
                    let userDataObj = {};
                    data.result.forEach((item,index) => {
                        userDataObj = {};
                        userDataObj.key = index;
                        userDataObj.id = item.id;
                        userDataObj.name = item.name;
                        userDataObj.account = item.account;
                        userDataObj.state = Boolean(item.status);
                        userDataObj.time = item.create_time;
                        userDataObj.permission = item.permission;
                        userDataObj.desc = item.desc;
                        userDataArr.push(userDataObj);
                    })
                    sessionStorage.userData = JSON.stringify(userDataArr);
                    that.setState({
                        data: userDataArr,
                        reportTableLoading: false,
                    })
                }else if(data.response_to_cmd === "dashboard_update_user"){
                    that.setState({
                        isModalUser: false,
                        ModalUserTitle: '',
                        isModalVisible: false,
                    })
                    message.success('编辑用户信息成功');
                    if(data.user_status.account === JSON.parse(sessionStorage.userInfo).account){
                        sessionStorage.clientId = '';
                        window.location.href = '';
                    }
                    client.publish('/dashboard/1.0/get/user',`{"name_like":"","permission":"","page_index":0,"page_size":10000,"cmd":"dashboard_get_user","from":"${JSON.parse(sessionStorage.userInfo).account}","to":"","token":""}`,2);
                    client.unsubscribe('/dashboard/1.0/res/update_user/'+JSON.parse(sessionStorage.userInfo).account);
                }else if(data.response_to_cmd === 'dashboard_remove_usr'){
                    message.success('删除用户成功');
                    if(data.user_status.account === JSON.parse(sessionStorage.userInfo).account){
                        sessionStorage.clientId = '';
                        window.location.href = '';
                    }
                    client.publish('/dashboard/1.0/get/user',`{"name_like":"","permission":"","page_index":0,"page_size":10000,"cmd":"dashboard_get_user","from":"${JSON.parse(sessionStorage.userInfo).account}","to":"","token":""}`,2);
                    client.unsubscribe('/dashboard/1.0/res/remove/user/'+JSON.parse(sessionStorage.userInfo).account);
                }else if(data.response_to_cmd === 'dashboard_login_somewhere_res'){//收到其他的登录讯息，退出登录
                    sessionStorage.userInfo = '';
                    sessionStorage.clientId = '';
                    window.location.href = '';
                }else{
                    message.error('获取信息不符');
                    client.unsubscribe('/dashboard/1.0/res/user/'+JSON.parse(sessionStorage.userInfo).account);
                    client.unsubscribe('/dashboard/1.0/res/update_user/'+JSON.parse(sessionStorage.userInfo).account);
                    client.unsubscribe('/dashboard/1.0/res/remove/user/'+JSON.parse(sessionStorage.userInfo).account);
                }
            }else{
                message.error('获取信息失败');
                client.unsubscribe('/dashboard/1.0/res/user/'+JSON.parse(sessionStorage.userInfo).account);
                client.unsubscribe('/dashboard/1.0/res/update_user/'+JSON.parse(sessionStorage.userInfo).account);
            }
        }
    }
    stateClick(inx,value){ //人员禁用启用开关触发事件
        if(!value){
            this.setState({ 
                isModalVisible: true,
                ModalText: '是否确认禁用该账号？关闭该账号后用户将无法登录。',
                ModalUserEditTitle: '确认禁用',
                selectIndex: Number(inx.key),
                ModalIndex: 1,
            })
        }else{
            let thisStateData = this.state.data;
            client.subscribe('/dashboard/1.0/res/update_user/'+JSON.parse(sessionStorage.userInfo).account);
            // 推送给主题
            client.publish('/dashboard/1.0/post/update_user',`{"id":"${thisStateData[inx.key].id}","status":"1","page_index":0,"page_size":10000,"cmd":"dashboard_update_user","from":"${JSON.parse(sessionStorage.userInfo).account}","to":"","token":""}`,2);
        }
    }
    userEdit(info){
        this.setState({
            isModalUser: true,
            ModalUserTitle: '编辑管理员',
            userid: info.id,
        })
        this.formRefS = React.createRef();
        let that = this;
        setTimeout(function(){
            that.formRefS.current.setFieldsValue({
                name: info.name,               //编辑姓名
                auto: info.permission,         //编辑权限
                account: info.account,         //编辑账号
                remark: info.desc,         //编辑账号
            })
        })
    }
    userDelete(info){
        this.setState({
            isModalVisible: true,
            ModalText: '是否确认删除该账号？删除该账号后用户将无法使用。',
            ModalUserEditTitle: '确认删除',
            ModalIndex: 2,
            userid: info.id,
        })
    }
    //选择下拉框触发
    handleChange(value) {
        console.log(`selected ${value}`);
    }
    //输入密码触发
    passChange(values){
        let value = values.target.value.replace(/[^a-zA-Z0-9._-]/g,'')
        this.formRefS.current.setFieldsValue({
            pass: value.substring(0,20),
        })
    }
    //重置表单事件
    onReset(){
        this.formRef.current.resetFields();
    };
    //提交表单成功触发
    onFinish(values){
        that.setState({
            reportTableLoading: true,
        })
        let devName = values.dev_name?values.dev_name:"";
        let devState = values.dev_state?values.dev_state:"";
        client.subscribe('/dashboard/1.0/res/user/'+JSON.parse(sessionStorage.userInfo).account);
        // 推送给主题
        client.publish('/dashboard/1.0/get/user',`{"name_like":"${devName}","permission":"${devState}","page_index":0,"page_size":10000,"cmd":"dashboard_get_user","from":"${JSON.parse(sessionStorage.userInfo).account}","to":"","token":""}`,2); 
    };
    //提交表单失败触发
    onFinishFailed(errorInfo){
        console.log('Failed:', errorInfo);
    };
    //点击导出报表实现
    onExport(){
        if(onExportCont === 1){
            onExportCont = 2;
            setTimeout(function(){
                onExportCont = 1;
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
    }
    handleOk(){     //确认弹窗点击确认
        if(this.state.ModalIndex === 1){
            let thisStateData = this.state.data;
            //thisStateData[this.state.selectIndex].state = false;
            client.subscribe('/dashboard/1.0/res/update_user/'+JSON.parse(sessionStorage.userInfo).account);
            // 推送给主题
            client.publish('/dashboard/1.0/post/update_user',`{"id":"${thisStateData[this.state.selectIndex].id}","status":"0","page_index":0,"page_size":10000,"cmd":"dashboard_update_user","from":"${JSON.parse(sessionStorage.userInfo).account}","to":"","token":""}`,2);
        }else if(this.state.ModalIndex === 2){
            client.subscribe('/dashboard/1.0/res/remove/user/'+JSON.parse(sessionStorage.userInfo).account);
            // 推送给主题
            client.publish('/dashboard/1.0/remove/user',`{"id":${this.state.userid},"cmd":"dashboard_remove_usr","from":"${JSON.parse(sessionStorage.userInfo).account}","to":"","token":""}`,2);
            this.setState({
                isModalVisible: false,
                tModalText: '',
            })
        }else{
            this.setState({
                isModalVisible: false,
                tModalText: '',
            })
            message.error('不存在的操作');
        }
    }
    handleCancel(){ //确认弹窗点击取消
        this.setState({
            isModalVisible: false,
            ModalText: '',
        })
    }
    userOk(){   //添加/编辑管理员点击确认
        let values = this.formRefS.current.getFieldsValue(true);
        let account = values.account?values.account:"";
        let pwd = values.pass?Md5(values.pass):"";
        let nick_name = values.name?values.name:"";
        let permission = values.auto?values.auto:"";
        let desc = values.remark?values.remark:"";
        client.subscribe('/dashboard/1.0/res/update_user/'+JSON.parse(sessionStorage.userInfo).account);
        // 推送给主题
        client.publish('/dashboard/1.0/post/update_user',`{"id":${this.state.userid},"account":"${account}","pwd":"${pwd}","nick_name":"${nick_name}","desc":"${desc}","permission":"${permission}","cmd":"dashboard_update_user","from":"${JSON.parse(sessionStorage.userInfo).account}","to":"","token":""}`,2);
    }
    userCancel(){   //添加/编辑管理员点击取消
        this.setState({
            isModalUser: false,
            ModalUserTitle: '',
        })
    }
    render(){
        that = this;
        return <div className="Report">
            {/*添加/编辑管理员*/}
            <Modal title={this.state.ModalUserTitle} visible={this.state.isModalUser} onOk={this.userOk.bind(this)} onCancel={this.userCancel.bind(this)} maskClosable={false} width={800}>
                <Form ref={this.formRefS} layout="inline" name="user" labelCol={{offset: 2}} wrapperCol={{offset: 1}} initialValues={{
                    name: '',
                    auto: '',
                    account: '',
                    remark: '',
                    password: '',
                }}>
                    <table width={'100%'} style={{borderCollapse: 'separate',borderSpacing: '0 30px'}}>
                        <tbody>
                            <tr>
                                <td>
                                    <Form.Item label="姓名" name="name">
                                        <Input className="name" placeholder="请输入"/>
                                    </Form.Item>
                                </td>
                                <td>
                                    <Form.Item label="权限" name="auto">
                                        <Select className="auto" placeholder="请选择" onChange={this.handleChange}>
                                            <Option value="浏览">浏览</Option>
                                            <Option value="管理">管理</Option>
                                        </Select>
                                    </Form.Item>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <Form.Item label="账号" name="account">
                                        <Input className="account" disabled placeholder="请输入"/>
                                    </Form.Item>
                                </td>
                                <td>
                                    <Form.Item label="密码" name="pass">
                                        <Input.Password className="pass" onChange={this.passChange.bind(this)} placeholder="请输入"/>
                                    </Form.Item>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <Form.Item label="备注" name="remark">
                                        <Input className="remark" placeholder="请输入"/>
                                    </Form.Item>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </Form>
            </Modal>
            {/*确认弹窗*/}
            <Modal title={this.state.ModalUserEditTitle} visible={this.state.isModalVisible} onOk={this.handleOk.bind(this)} onCancel={this.handleCancel.bind(this)}>
                <p>{this.state.ModalText}</p>
            </Modal>
            <div className="report_head">
                <Form className="report_form" ref={this.formRef} name="basic" layout="vertical" initialValues={{ remember: true }} onFinish={this.onFinish} onFinishFailed={this.onFinishFailed}>
                    <Form.Item label="账号名称" name="dev_name">
                        <Input className="dev_name" placeholder="请输入"/>
                    </Form.Item>
                    <Form.Item label="账号权限" name="dev_state">
                        <Select className="dev_state" placeholder="请选择" onChange={this.handleChange}>
                            <Option value="浏览">浏览</Option>
                            <Option value="管理">管理</Option>
                        </Select>
                    </Form.Item>
                    <Button className="report_search" type="primary" htmlType="submit">
                        查询
                    </Button>
                    <Button className="report_reset" htmlType="button" onClick={this.onReset.bind(this)}>
                        重置
                    </Button>
                    <Button className="report_export" onClick={this.onExport}>
                        添加
                    </Button>
                </Form>
            </div>
            <div className="report_content">
                <Table className="report_table" loading={this.state.reportTableLoading} columns={this.state.columns} dataSource={this.state.data} pagination={{showQuickJumper: true,defaultPageSize: 6,pageSizeOptions: [6,10,20,50,100],total: this.state.data.length,showTotal: total => `共${total}条`}} onChange={this.onChange} />
            </div>
        </div>
    }
}

export default User;