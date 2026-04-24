import React from 'react';
import { NavLink } from 'react-router-dom';
import {Layout, Menu} from 'antd';
const { Sider } = Layout;
class Sidebar extends React.Component{
    urlLink(item){
        sessionStorage.selectKey = item.id;
        this.props.keywords.setState({
            selectKey: item.id,
        })
    }
    render () {
        return <Sider trigger={null} collapsible collapsed={this.props.collapsed}>
            <div className="logo">{this.props.title}<br/>{this.props.titleTwo}</div>
            <Menu theme="dark" mode="inline" defaultSelectedKeys={[this.props.keywords.state.selectKey]}>
                {
                    this.props.keywords.state.list.map((item,index) =>{
                        if(sessionStorage.userInfo){
                            if(JSON.parse(sessionStorage.userInfo).permission === '浏览'&&index === 3){
                                return '';
                            }else if(JSON.parse(sessionStorage.userInfo).permission === '浏览'&&index === 4){
                                return '';
                            }
                        }
                        return <Menu.Item key={item.id} icon={item.icon} style={{userSelect: 'none',textAlign: 'center',}}>
                            <NavLink to={item.url} onClick={this.urlLink.bind(this,item)}>{item.text}&nbsp;&nbsp;&nbsp;</NavLink>
                        </Menu.Item>
                    })
                }
            </Menu>
        </Sider>
    };
}

export default Sidebar;