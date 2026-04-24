import React from 'react';
import { Switch,Route } from 'react-router-dom';
import { Layout } from 'antd';
import Sidebar from './Sidebar';
import Headers from './Headers';
import Data_view from './Data_view';
import Report from './Report';
import Dev from './Dev';
import Dev_details from './Dev_details';
import Operation from './Operation';
import Operation_details from './Operation_details';
import User from './User';
import './css/App.css';
import {DesktopOutlined, ContainerOutlined, TeamOutlined, ControlOutlined, BarChartOutlined} from "@ant-design/icons";

const { Content } = Layout;

class  App extends React.Component{
    state = {
        list: [
            {text: '数据监测',id:'1',icon: <BarChartOutlined />,url:'/app/data_view'},
            {text: '基础数据',id:'2',icon: <DesktopOutlined />,url:'/app/report'},
            {text: '设备管理',id:'3',icon: <ControlOutlined />,url:'/app/dev'},
            {text: '操作日志',id:'4',icon: <ContainerOutlined />,url:'/app/operation'},
            {text: '账号管理',id:'5',icon: <TeamOutlined />,url:'/app/user'},
        ],
        collapsed: false,
        title: `海淀智慧教育`,
        titleTwo: '触控一体机远程集控云平台',
        selectKey: sessionStorage.selectKey?sessionStorage.selectKey:'1',
    };

    toggle = () => {
        console.log(this);
        this.setState({
            collapsed: !this.state.collapsed,
            title: this.state.collapsed?`海淀智慧教育`:`智慧`,
            titleTwo: this.state.collapsed?`触控一体机远程集控云平台`:`教育`,
        });
    };
    componentWillReceiveProps(nextProps){
        let key = nextProps.match.params.key;
        this.setState({
            key:key
        })
    }
    render() {
        return (
            <Layout className="App">
                <Sidebar collapsed={this.state.collapsed} title={this.state.title} titleTwo={this.state.titleTwo} keywords={this}/>
                <Layout className="site-layout">
                    <Headers state={this.state} selectKey={this.state.selectKey} click={this.toggle}/>
                    <Content className="site-layout-background content">
                        <Switch>
                            <Route path="/app/data_view" component={Data_view}/>
                            <Route path="/app/report" component={Report}/>
                            <Route path="/app/dev" component={Dev}/>
                            <Route path="/app/dev_details" component={Dev_details}/>
                            <Route path="/app/operation" component={Operation}/>
                            <Route path="/app/operation_details" component={Operation_details}/>
                            <Route path="/app/user" component={User}/>
                        </Switch>
                    </Content>
                </Layout>
            </Layout>
        );
    }
}

export default App;