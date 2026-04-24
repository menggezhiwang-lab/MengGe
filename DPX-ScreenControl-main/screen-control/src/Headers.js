import React from 'react';
import Md5 from 'js-md5';
import {
    Breadcrumb,
    Layout,
    Button,
    notification,
    Tag,
    Modal,
    Menu,
    Dropdown,
    Form,
    Input,
    message
} from 'antd';
import { CheckCircleOutlined, ExclamationCircleOutlined, MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import { withRouter,Route } from "react-router-dom";
import Paho from "paho-mqtt";

const { Header } = Layout;
//let count = 1;

class Headers extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            isModalVisible: false,
            isModalPass: false,
            isModalLogOut: false,
            password: '',
        }
    }
    ButtonClick(){
        notification.open({
            message: '温馨提示：',
            description:
                '功能开发中，敬请期待～',
            duration: 2,
        });
    }
    headButton(text){
        return <Button onClick={this.ButtonClick}>{text}</Button>
    }
    headCrumbs(text){
        return <Breadcrumb.Item className="header-two-select-title">{text}</Breadcrumb.Item>
    }
    devDelete(){
        this.setState({
            isModalVisible: true,
        })
    }
    showHeader(){
        const state = this.props.location.state || {name:'上地实验中学教学楼301',state: true};
        const color = state.state ? '#01BDE8' : '#F5483F';
        const text = state.state ? '在线' : '离线';
        const icon = state.state ? <CheckCircleOutlined/> : <ExclamationCircleOutlined/>
        return <p>
            {state.name}
            <Tag className="table_state_all" icon={icon} color={color}>{text}</Tag>
            <Button onClick={this.devDelete.bind(this)}>删除</Button>
        </p>
    }
    showViewHeader(){
        return <div className="show_view_header">
            <div className="show_view_header_left">
                <img src="./../logo192.png" alt="头像"/>
            </div>
            <div className="show_view_header_right">
                <p></p>{/*上午好，海淀教委，祝你开心每一天*/}
                <span></span>{/*超级管理员*/}
            </div>
        </div>;
    }
    handleOk(){
        this.setState({
            isModalVisible: false,
        })
    }
    handleCancel(){
        this.setState({
            isModalVisible: false,
        })
    }
    devViewSearch(){
        return (1
            // <div className="Data_view_top">
            //     <Button style={{backgroundColor: 'rgba(0,0,0,.65)', color: '#fff',marginRight: '34px'}} onClick={this.$top}>近一周</Button>
            //     <Button disabled>全部学校</Button>
            //     <Button disabled>昨天</Button>
            //     <Button disabled>今天</Button>
            //     <Button disabled style={{marginRight: '17px'}}>近一个月</Button>
            //     <RangePicker disabled style={{marginRight: '17px'}}/>
            //     <Button disabled>查询</Button>
            //     <Button disabled>重置</Button>
            // </div>
        )
    }
    userHeadMenu() {
        return (<Menu>
            <Menu.Item onClick={this.editPass.bind(this)}>
                修改密码
            </Menu.Item>
            <Menu.Item onClick={this.logOut.bind(this)}>
                退出
            </Menu.Item>
        </Menu>);
    };
    editPass() {
        this.setState({
            isModalPass: true
        })
    }
    logOut(){
        this.setState({
            isModalLogOut: true,
        })
    }
    logOutOk(){
        sessionStorage.clientId = '';
        sessionStorage.userInfo = '';
        window.location.href = '';
    }
    logOutCancel(){
        this.setState({
            isModalLogOut: false,
        })
    }
    passOk(){
        let passInputValue = this.passInput.state.value;
        let client = new Paho.Client(sessionStorage.getUrl, 8083, '/mqtt', sessionStorage.clientId);
        if(passInputValue){
//mqtt发起连接
            client.connect({
                useSSL: false,
                onSuccess: onConnect,
                onFailure:(e)=>{ message.error('连接服务器失败'); console.log(e);}
            });
//连接成功后触发事件
            function onConnect(){
                client.subscribe('/dashboard/1.0/res/update_user/'+JSON.parse(sessionStorage.userInfo).account);
                // 推送给主题
                client.publish('/dashboard/1.0/post/update_user',`{"id":${JSON.parse(sessionStorage.userInfo).id},"pwd":"${Md5(passInputValue)}","cmd":"dashboard_update_user","from":"${JSON.parse(sessionStorage.userInfo).account}","to":"","token":""}`,2);
                //client.subscribe('/dashboard/1.0/res/update_pwd/'+JSON.parse(sessionStorage.userInfo).account);
                // 推送给主题
                //console.log(Md5(passInputValue));
                //client.publish('/dashboard/1.0/post/update_pwd',`{"id":12,"old_pwd":"${Md5(passInputValue)}","new_pwd":"${Md5(passInputValue)}","captha":"","cmd":"dashboard_update_user_pwd","from":"${JSON.parse(sessionStorage.userInfo).account}","to":"","token":""}`,2);
            }
            client.onMessageArrived = onMessageArrived;
            function onMessageArrived (Message) {
                let data = JSON.parse(Message.payloadString);
                console.log(data);
                if(data.error === 0){
                    message.success('修改密码成功');
                    if(data.user_status.account === JSON.parse(sessionStorage.userInfo).account){
                        sessionStorage.clientId = '';
                        window.location.href = '';
                    }
                }else{
                    message.error('修改密码失败');
                }
                client.unsubscribe('/dashboard/1.0/res/update_pwd/'+JSON.parse(sessionStorage.userInfo).account);
            }
        }else{
            message.error('没有输入密码');
        }
        this.setState({
            isModalPass: false
        })
    }
    passCancel(){
        this.setState({
            isModalPass: false
        })
    }
    passChange(values){
        console.log(values.target.value);
        let value = values.target.value.replace(/[^a-zA-Z0-9._-]/g,'');
        this.setState({
            password: value.substring(0,20),
        })
    }
    render() {
        const {list} = this.props.state;
        //const {pathname} = this.props.location;
        //count = pathname === '/app/dev'||pathname === '/app/dev_details'?2:1;
        return (
            <div>
                <Modal title="修改密码" visible={this.state.isModalPass} onOk={this.passOk.bind(this)} onCancel={this.passCancel.bind(this)}>
                    <Form.Item label="新密码"><Input.Password ref={(input)=>{this.passInput = input}} onChange={this.passChange.bind(this)} value={this.state.password} placeholder="请输入新密码"/></Form.Item>
                </Modal>
                <Modal title="删除设备" visible={this.state.isModalVisible} onOk={this.handleOk.bind(this)} onCancel={this.handleCancel.bind(this)}>
                    <p>是否确认删除该设备？删除设备后不可恢复。</p>
                </Modal>
                <Modal title="退出登录" visible={this.state.isModalLogOut} onOk={this.logOutOk.bind(this)} onCancel={this.logOutCancel.bind(this)}>
                    <p>确认退出登录吗？</p>
                </Modal>
                <Header className="site-layout-background" style={{padding: 0}}>
                    {React.createElement(this.props.state.collapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
                        className: 'trigger',
                        onClick: this.props.click,
                    })}
                    <span className="site-layout-title">
                        <Breadcrumb>
                            <Breadcrumb.Item className="header-two-select-title">
                                <a href={'#'+list[Number(this.props.selectKey)-1].url}>{list[Number(this.props.selectKey)-1].text}</a>
                            </Breadcrumb.Item>
                            <Route path="/app/operation_details" component={this.headCrumbs.bind(this,'详情页')}/>
                            <Route path="/app/dev_details" component={this.headCrumbs.bind(this,'详情页')}/>
                        </Breadcrumb>
                    </span>
                    {/* <Route path="/app/data_view" component={this.devViewSearch.bind(this)}/> */}
                    <Dropdown overlay={this.userHeadMenu()} placement="bottomLeft" arrow overlayStyle={{top:'-40px'}}>
                        <span className="site-layout-people"><img src="./../logo192.png" alt="头像"/>{sessionStorage.userInfo?JSON.parse(sessionStorage.userInfo).account:'请登录'}</span>
                    </Dropdown>
                </Header>
                {/*<div className="header-two" style={{height: count === 2?'95px':'55px'}}>*/}
                {/*    <div className="header-two-title">*/}
                {/*        <Route path="/app/dev_details" component={this.showHeader.bind(this)}/>*/}
                {/*        /!*<Route path="/app/data_view" component={this.showViewHeader.bind(this)}/>*!/*/}
                {/*        /!*<span>{pathname !== '/app/dev_details'&&pathname !== '/app/data_view'?list[Number(this.props.selectKey)-1].text:''}</span>*!/*/}
                {/*        <Route path="/app/dev" component={this.headButton.bind(this,'软件管理')}/>*/}
                {/*        <Route path="/app/dev" component={this.headButton.bind(this,'关机')}/>*/}
                {/*        <span style={{clear: "both"}}> </span>*/}
                {/*    </div>*/}
                {/*</div>*/}
            </div>
        )
    }
}

export default withRouter(Headers);