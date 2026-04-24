import React from 'react';
import { message, Form, Input, Button } from 'antd';
import { HashRouter as Router, Switch, Redirect, Route } from 'react-router-dom';
import App from './App';
import './css/Login.css';
import Paho from 'paho-mqtt';
import Md5 from 'js-md5';

const formItemLayout = {
    labelCol: { span: 4 },
    wrapperCol: { span: 23 },
};
const formTailLayout = {
    labelCol: { span: 10 },
    wrapperCol: { span: 23},
};
let that;
sessionStorage.clientId = sessionStorage.clientId?sessionStorage.clientId:'mqttjs_' + Math.random().toString(16).substr(2, 8);
//sessionStorage.getUrl = '127.0.0.1';
//sessionStorage.getUrl = 'jk.igrsservice.com';
//sessionStorage.getUrl = 'ck.hdjky.org.cn';
sessionStorage.getUrl = '58.119.9.169';
let client = new Paho.Client(sessionStorage.getUrl, 8083, '/mqtt', sessionStorage.clientId);
function LoginPage(){
    const [form] = Form.useForm();
    async function onCheck (){
        try {
            const values = await form.validateFields();
            //mqtt发起连接
            client.connect({
                useSSL: false,
                onSuccess: onConnect,
                onFailure:(e)=>{ console.log('失败'); console.log(e); }
            });
            //连接成功后触发事件
            function onConnect(){
                //,"client_id":"${sessionStorage.clientId}"
                client.subscribe('/dashboard/1.0/res/login');
                // 推送给主题
                client.publish('/dashboard/1.0/post/login',`{"account":"${values.userName}","password":"${Md5(values.userPass)}","client_id":"${sessionStorage.clientId}"}`,2);
            }
            //接收消息事件
            client.onMessageArrived = onMessageArrived;
            function onMessageArrived (Message) {
                console.log(JSON.parse(Message.payloadString));
                if(JSON.parse(Message.payloadString).error === 0){
                    message.success('登录成功');
                    sessionStorage.userInfo = JSON.stringify(JSON.parse(Message.payloadString).result[0]);
                    sessionStorage.selectKey = '1';
                    setTimeout(function(){
                        that.setState({
                            historyS:'',
                        })
                    })
                    that.setState({
                        historyS: <Redirect push to="/app/data_view" />
                    })
                    onConnectionLost();
                }else if(JSON.parse(Message.payloadString).error === 10){
                    message.error(`您的${values.userName}账号已被禁用，无法登录，请联系管理员`);
                    onConnectionLost();
                }else{
                    message.error('账号或密码不正确');
                    onConnectionLost();
                }
            }
            //断开连接
            client.onConnectionLost = onConnectionLost;
            function onConnectionLost (responseObject) {
                if (!responseObject.errorCode) {
                    console.log('onConnectionLost:' + responseObject.errorMessage);
                }
            }
        } catch (errorInfo) {
            console.log('Failed:', errorInfo);
        }
    }
    return <div className="Login">
        <p>海淀智慧教育触控一体机远程集控云平台</p>
        <Form form={form} label="Field" name="field">
            <Form.Item
                {...formItemLayout}
                name="userName"
                label=""
                rules={[
                    {
                        required: true,
                        message: '请输入账号',
                    },
                ]}
            >
                <Input style={{height: '40px'}} placeholder="请输入账号" />
            </Form.Item>
            <Form.Item
                {...formItemLayout}
                name="userPass"
                label=""
                rules={[
                    {
                        required: true,
                        message: '请输入密码',
                    },
                ]}
            >
                <Input.Password style={{height: '40px'}} suggested="current-password" placeholder="请输入密码" />
            </Form.Item>
            <Form.Item {...formTailLayout}>
                {/*<Link to="./app/data_view">跳转</Link>*/}
                {that.state.historyS}
                <Button type="primary" block={true} onClick={onCheck}>
                    登录
                </Button>
            </Form.Item>
        </Form>
    </div>
}

class Login extends React.Component{
    state = {
        historyS: ''
    }
    render() {
        that = this;
        return (
            <Router>
                <Switch>
                    <Route path="/app" component={App}/>
                    <LoginPage/>
                </Switch>
            </Router>
        );
    }
}

export default Login;