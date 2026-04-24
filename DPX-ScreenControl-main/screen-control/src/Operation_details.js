import React from 'react';
import { Table } from 'antd';
import { ClockCircleOutlined,UserOutlined } from '@ant-design/icons';

const columns = [
    {
        title: '设备名称',
        dataIndex: 'name',
        key: 'name',
    },
    {
        title: '设备型号',
        dataIndex: 'model',
        key: 'model',
    },
    {
        title: '所属分组',
        dataIndex: 'group',
        key: 'group',
    },
    {
        title: '操作结果',
        key: 'result',
        dataIndex: 'result',
    },
];

class  Operation_details extends React.Component{
    constructor(props) {
        super(props);
        if(props.location.state){
            sessionStorage.oDetailsItem = JSON.stringify(props.location.state.item);
            let oDetailsArr = [];
            let oDetailsObj = {};
            oDetailsObj.key = '1';
            oDetailsObj.name = props.location.state.item.device_name;
            oDetailsObj.model = props.location.state.item.device_type;
            oDetailsObj.group = props.location.state.item.device_group;
            oDetailsObj.result = props.location.state.item.result;
            oDetailsArr.push(oDetailsObj);
            sessionStorage.oDetailsData = JSON.stringify(oDetailsArr);
        }
        this.state = {
            item: JSON.parse(sessionStorage.oDetailsItem),
            data: JSON.parse(sessionStorage.oDetailsData),
        }
    }
    render(){
        console.log(this.state.item);
        return <div className="Operation_details">
            <div className="Operation_details_head">
                <div className="Operation_details_head_item">
                    <p className="Operation_details_head_item_top"><ClockCircleOutlined style={{color: '#1890FF'}} />操作时间</p>
                    <p className="Operation_details_head_item_content">{this.state.item.time}</p>
                </div>
                <div className="Operation_details_head_item">
                    <p className="Operation_details_head_item_top"><img src="../image/wrench.svg" alt="ip"/>操作指令</p>
                    <p className="Operation_details_head_item_content">{this.state.item.order}</p>
                </div>
                <div className="Operation_details_head_item">
                    <p className="Operation_details_head_item_top"><UserOutlined style={{color: '#1890FF'}} />操作人员</p>
                    <p className="Operation_details_head_item_content">姓名：{this.state.item.people}</p>
                    <p className="Operation_details_head_item_content">账号：{this.state.item.account}</p>
                </div>
                <div className="Operation_details_head_item">
                    <p className="Operation_details_head_item_top"><img src="../image/ip.svg" alt="ip"/>操作人员IP</p>
                    <p className="Operation_details_head_item_content">内网：{this.state.item.intranet_ip}</p>
                    <p className="Operation_details_head_item_content">外网：{this.state.item.internet_ip}</p>
                </div>
            </div>
            <div className="Operation_details_box">
                <Table columns={columns} dataSource={this.state.data} pagination={false} />
            </div>
        </div>
    }
}

export default Operation_details;