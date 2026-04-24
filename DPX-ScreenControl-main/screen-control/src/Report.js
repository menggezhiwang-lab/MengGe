import React from 'react';
import {Form, Input, Select, DatePicker, Button, Table, Tag, notification, message} from 'antd';
import './css/Report.css';
import {Link} from "react-router-dom";
import Paho from 'paho-mqtt';
var XLSX = require("xlsx");
//var {saveAs} = require('file-saver');

let that,client;
const { Option } = Select;
const { RangePicker } = DatePicker;
let onExportCont = 1;
let excelExportData = [];
let formData = {};

const columns = [
    {
        title: '设备名称',
        dataIndex: 'name',
        render: (name,item) => {
            // console.log('item.address', item.address);
            // console.log('item.name', item.name);
            return(
                <Tag className="table_name">
                    <img src="../image/dev_name.png" alt="图标" className="table_name_icon"/>
                    <Link className="table_name_text" to={{pathname:'./dev_details',state:{item: item,talk_id:item.talk_id}}}>
                        {item.group}{item.address? item.address: name}
                        </Link>
                </Tag>
            )
        }
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
        title: '总开机时长',
        dataIndex: 'time',
        align: 'center',
        sorter: (a, b) => parseInt(a.time) - parseInt(b.time),
    },
    {
        title: '开机次数',
        dataIndex: 'onNumber',
        align: 'center',
        sorter: (a, b) => a.onNumber - b.onNumber,
    },
    {
        title: '关机次数',
        dataIndex: 'offNumber',
        align: 'center',
        sorter: (a, b) => a.offNumber - b.offNumber,
    },
    {
        title: '设备添加时间',
        dataIndex: 'addTime',
        align: 'center',
        sorter: (a, b) => new Date(a.addTime) - new Date(b.addTime),
    },
];
class Report extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            schoolList: sessionStorage.schoolList?JSON.parse(sessionStorage.schoolList):[],
            data: sessionStorage.reportData?JSON.parse(sessionStorage.reportData):[],
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
            client.subscribe('/dashboard/1.0/res/device_summary/'+JSON.parse(sessionStorage.userInfo).account);
            client.subscribe('/dashboard/1.0/res/device_summary_excel/'+JSON.parse(sessionStorage.userInfo).account);
            // 推送给主题
            client.publish('/dashboard/1.0/get/device_summary',`{cmd:'dashboard_device_summary',address_like:'', status:0,organization:'', 
                            vendor_id:0, group_id:0, 
                            page_index:0, page_size:10,start_time:'',end_time: '',
                            from:'${JSON.parse(sessionStorage.userInfo).account}',to:'',token:''}`,2);
            client.subscribe('/dashboard/1.0/res/device_in_org_group/'+JSON.parse(sessionStorage.userInfo).account);
            // 推送给主题
            client.publish('/dashboard/1.0/get/device_in_org_group',"{organization_id:1,cmd:'dashboard_get_device_in_org_group',from:'"+JSON.parse(sessionStorage.userInfo).account+"',to:'',token:''}",2);
            //订阅踢人监听
            client.subscribe('/dashboard/1.0/res/login_somewhere/'+sessionStorage.clientId);
        }
        //接收消息事件
        client.onMessageArrived = onMessageArrived;
        function onMessageArrived (Message) {
            let data = JSON.parse(Message.payloadString);
            if(data.error === 0){
                if(data.response_to_cmd === "dashboard_device_summary"){
                    let dataArr = [];
                    let total_count = data.total_count ? data.total_count: 0;
                    console.log(data);
                    //console.log('Data result dashboard_device_summary', data.result.length);
                    data.result.forEach((item,index) => {
                        console.log(item);
                        let dataObj = {};
                        dataObj.key = index;
                        dataObj.talk_id = item.talk_id;
                        dataObj.name = item.name;
                        dataObj.address = item.device_address;
                        dataObj.group = item.group;
                        dataObj.state = Boolean(item.status);
                        dataObj.time = (item.used_time/3600).toFixed(1) + 'h';
                        dataObj.onNumber = item.on_time;
                        dataObj.offNumber = item.off_time;
                        dataObj.addTime = item.regist_time;
                        dataObj.vendorName = item.vendor_name?item.vendor_name:'';
                        dataArr.push(dataObj);
                    })
                    sessionStorage.reportData = '';
                    sessionStorage.reportData = JSON.stringify(dataArr);
                    that.setState({
                        data: dataArr,
                        reportTableLoading: false,
                        excelReportTableLoading: false,
                        total: total_count,
                    })
                }else if(data.response_to_cmd === "dashboard_device_summary_excel"){
                    console.log(data.response_to_cmd);
                    console.log(data);
                    let excelDataArr = [];
                    let excel_total_count = data.total_count ? data.total_count: 0;
                    // console.log(data);
                    console.log('Data result dashboard_device_summary_excel', data.result.length);
                    data.result.forEach((item,index) => {
                        console.log(item);
                        let dataObj = {};
                        dataObj.key = index;
                        dataObj.talk_id = item.talk_id;
                        dataObj.name = item.name;
                        dataObj.address = item.device_address;
                        dataObj.group = item.group;
                        dataObj.state = Boolean(item.status);
                        dataObj.time = (item.used_time/3600).toFixed(1) + 'h';
                        dataObj.onNumber = item.on_time;
                        dataObj.offNumber = item.off_time;
                        dataObj.addTime = item.regist_time;
                        dataObj.vendorName = item.vendor_name?item.vendor_name:'';
                        excelDataArr.push(dataObj);
                    })
                    sessionStorage.excelReportData = '';
                    sessionStorage.excelReportData = JSON.stringify(excelDataArr);
                    
                    that.setState({
                        excelData: excelDataArr,
                        excelReportTableLoading: false,
                        excelTotal: excel_total_count,
                    })
                    excelExportData = [];
                    excelExportData.push(['ID', '设备名称', '教室名称', '学校名称', '设备状态', '使用时间(小时)', '开机次数', '关机次数', '设备添加时间', '设备品牌']);
                    JSON.parse(sessionStorage.excelReportData).forEach((item,index) => {
                        let dataArray = [];
                        dataArray = [item.talk_id, item.name, item.address, item.group, item.state?'在线':'离线',  item.time, item.onNumber, item.offNumber, item.addTime, item.vendorName ]
                        excelExportData.push(dataArray);
                    });
                    //const currentDateTimeStringUTC = new Date().toISOString().replace(/[-T:]/g, '').split('.')[0];
                    // worksheet 
                    const ws = XLSX.utils.aoa_to_sheet(excelExportData);
                    // workbook 
                    const wb = XLSX.utils.book_new();
                    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
                    // Generating a blob from the workbook and save it 
                    
                    let xlsxDate = new Date();
                    XLSX.writeFile(wb, '基础数据报表' +String(xlsxDate.getFullYear())+String(new Date().getMonth() + 1)+String(new Date().getDay())+String(new Date().getHours())+String(new Date().getMinutes())+String(new Date().getSeconds())+'.xlsx');
                    //saveAs(blob, `Report_${currentDateTimeStringUTC}`);
                    // excelExportData = [];
                    // excelExportData.push(['Index', 'Talk ID', 'Name', 'Address', 'School', 'Status', 'Usage(H)', 'On(Count)', 'Off(Count)', 'Registration Time', 'Vendor Name']);
                    // data.result.forEach((item,index) => {
                    //     let dataArray = [];
                    //     dataArray = [index, item.talk_id, item.name, item.device_address, item.group, Boolean(item.status),  (item.used_time/3600).toFixed(1) + 'h', item.on_time, item.off_time, item.regist_time, item.vendor_name ]
                    //     excelExportData.push(dataArray);
                    // });
                    // const currentDateTimeStringUTC = new Date().toISOString().replace(/[-T:]/g, '').split('.')[0];
                    // // worksheet 
                    // const ws = XLSX.utils.aoa_to_sheet(excelExportData);
                    // // workbook 
                    // const wb = XLSX.utils.book_new();
                    // XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
                    // // Generating a blob from the workbook and save it 
                    // const blob = XLSX.write(wb, {bookType: 'xlsx', type: 'blob'});
                    // saveAs(blob, `Report_${currentDateTimeStringUTC}`);

                    // client.unsubscribe('/dashboard/1.0/res/device_in_org_group_excel/'+JSON.parse(sessionStorage.userInfo).account);
                }else if(data.response_to_cmd === 'dashboard_login_somewhere_res'){//收到其他的登录讯息，退出登录
                    sessionStorage.userInfo = '';
                    sessionStorage.clientId = '';
                    window.location.href = '';
                }else if(data.response_to_cmd === "dashboard_get_device_in_org_group"){
                    sessionStorage.schoolList = JSON.stringify(data.result);
                    that.setState({
                        schoolList: data.result,
                    })
                    client.unsubscribe('/dashboard/1.0/res/device_in_org_group/'+JSON.parse(sessionStorage.userInfo).account);
                }else{
                    message.error('获取信息有误');
                    client.unsubscribe('/dashboard/1.0/res/device_in_org_group/'+JSON.parse(sessionStorage.userInfo).account);
                }
            }else{
                message.error('请求失败');
                client.unsubscribe('/dashboard/1.0/res/device_in_org_group/'+JSON.parse(sessionStorage.userInfo).account);
            }
        }
    }
    formRef = React.createRef();
    //选择下拉框触发
    handleChange(value) {
        console.log(`selected ${value}`);
    }
    handleAddressChange(value) {
        console.log(`handleAddressChange selected ${value}`);
        formData.dev_address = value;
        console.log(`handleAddressChange selected ${value}`);
    }
    handleStateChange(value) {
        console.log(`handleStateChange selected ${value}`);
        formData.dev_state = value;
    }
    handleSchoolChange(value) {
        console.log(`handleSchoolChange selected ${value}`);
        formData.school_name = value;
    }
    handleTimeChange(value) {
        console.log(`time_select selected ${value}`);
        formData.time_select = value;
    }
    handleVendorChange(value) {
        console.log(`handleVendorChange selected ${value}`);
        formData.dev_brand = value;
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
        // 推送给主题
        let devAddress = values.dev_address?values.dev_address:"";
        let devState = values.dev_state?Number(values.dev_state):2;
        let schoolName = values.school_name?values.school_name:0;
        let startTime = values.time_select?values.time_select[0].format('YYYY-MM-DD') + ' 00:00:00':"";
        let endTime = values.time_select?values.time_select[1].format('YYYY-MM-DD') + ' 23:59:59':"";
        let devBrand = values.dev_brand?Number(values.dev_brand):0;

        // pagination stuffs 
        // let p_current = 1;
        // let p_defaultPageSize = 10;
        // let p_pageSize = 10;
        // let p_showQuickJumper = 10;
        // let p_total = pagination.total;

        // 推送给主题
        //client.publish('/dashboard/1.0/get/device_summary',`{cmd:'dashboard_device_summary',name_like:'',status:2,organization:'',page_index:0,page_size:300,start_time:'2021-02-23 15:23:50',end_time: '2021-03-02 15:23:50',from:'',to:'',token:''}`,2);
        // console.log(`{cmd:'dashboard_device_summary',name_like:'${devName}',status:${devState},group_id:${schoolName},page_index:0,page_size:10000,start_time:'${startTime}',end_time: '${endTime}',from:'',to:'',token:''}`);
        // client.publish('/dashboard/1.0/get/device_summary',`{cmd:'dashboard_device_summary',address_like:'${devAddress}',status:${devState},dev_brand:${devBrand},group_id:${schoolName},page_index:0,page_size:10000,start_time:'${startTime}',end_time: '${endTime}',from:'${JSON.parse(sessionStorage.userInfo).account}',to:'',token:''}`,2);
        client.publish('/dashboard/1.0/get/device_summary',`{cmd:'dashboard_device_summary',address_like:'${devAddress}',status:${devState}, vendor_id:${devBrand},group_id:${schoolName}, page_index:0,page_size:10,
        start_time:'${startTime}',end_time: '${endTime}', 
        from:'${JSON.parse(sessionStorage.userInfo).account}',to:'',token:''}`,2);
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
            // notification.open({
            //     message: '温馨提示：',
            //     description:
            //         '功能开发中，敬请期待～',
            //     duration: 2,
            // });
            console.log('Formdata', formData);
            let devAddress = formData.dev_address?formData.dev_address:"";
            let devState = formData.dev_state?Number(formData.dev_state):2;
            let schoolName = formData.school_name?formData.school_name:0;
            let startTime = formData.time_select?formData.time_select[0].format('YYYY-MM-DD') + ' 00:00:00':"";
            let endTime = formData.time_select?formData.time_select[1].format('YYYY-MM-DD') + ' 23:59:59':"";
            let devBrand = formData.dev_brand?Number(formData.dev_brand):0;
            client.publish('/dashboard/1.0/get/device_summary_excel',`{cmd:'dashboard_device_summary_excel',address_like:'${devAddress}',status:${devState}, vendor_id:${devBrand},group_id:${schoolName},
                            page_index: 0,page_size:5000,
                            start_time:'${startTime}',end_time: '${endTime}', 
                            from:'${JSON.parse(sessionStorage.userInfo).account}',to:'',token:''}`,2);
        }
    }
    //表单变化事件
    onChange(pagination, filters, sorter, extra) {
        console.log('params', pagination, filters, sorter, extra);
        // 推送给主题
        let devAddress = filters.dev_address?filters.dev_address:"";
        let devState = filters.dev_state?Number(filters.dev_state):2;
        let schoolName = filters.school_name?filters.school_name:0;
        let startTime = filters.time_select?filters.time_select[0].format('YYYY-MM-DD') + ' 00:00:00':"";
        let endTime = filters.time_select?filters.time_select[1].format('YYYY-MM-DD') + ' 23:59:59':"";
        let devBrand = filters.dev_brand?Number(filters.dev_brand):0;
        // current
        // defaultPageSize
        // pageSize
        // pageSizeOptions
        // showQuickJumper
        // total
        let p_current = Number(pagination.current);
        // let p_defaultPageSize = pagination.defaultPageSize;
        let p_pageSize = Number(pagination.pageSize);
        // let p_showQuickJumper = pagination.showQuickJumper;
        // let p_total = pagination.total;
        // 推送给主题
        // sorter 
        let colname_val = '';
        let orderval = '';
        
        if (Object.entries(sorter).length > 0){
            colname_val = sorter.field;
            orderval = sorter.order;
        }
        //client.publish('/dashboard/1.0/get/device_summary',`{cmd:'dashboard_device_summary',name_like:'',status:2,organization:'',page_index:0,page_size:300,start_time:'2021-02-23 15:23:50',end_time: '2021-03-02 15:23:50',from:'',to:'',token:''}`,2);
        // console.log(`{cmd:'dashboard_device_summary',name_like:'${devName}',status:${devState},group_id:${schoolName},page_index:0,page_size:10000,start_time:'${startTime}',end_time: '${endTime}',from:'',to:'',token:''}`);
        client.publish('/dashboard/1.0/get/device_summary',`{cmd:'dashboard_device_summary',address_like:'${devAddress}',status:${devState}, vendor_id:${devBrand},group_id:${schoolName},
                        page_index: ${p_current - 1},page_size:${p_pageSize},
                        start_time:'${startTime}',end_time: '${endTime}', 
                        sort_col_name:'${colname_val}', order_val:'${orderval}',
                        from:'${JSON.parse(sessionStorage.userInfo).account}',to:'',token:''}`,2);
    }
    render () {
        that = this;
        return <div className="Report">
            <div className="report_head">
                <Form className="report_form" ref={this.formRef} name="basic" layout="vertical" onFinish={this.onFinish} onFinishFailed={this.onFinishFailed}>
                    <Form.Item label="设备状态" name="dev_state">
                        <Select className="dev_state" placeholder="请选择" onChange={this.handleStateChange}>
                            <Option value="2">全部</Option>
                            <Option value="1">在线</Option>
                            <Option value="0">离线</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item label="学校名称" name="school_name" style={{width: '250px'}}>
                        <Select className="school_name" placeholder="请选择" showSearch optionFilterProp="children" onChange={this.handleSchoolChange}>
                            {
                                this.state.schoolList.map((item)=>{
                                    return <Option key={item.group_id} value={item.group_id}>{item.group_name}</Option>
                                })
                            }
                        </Select>
                    </Form.Item>
                    <Form.Item label="教室名称" name="dev_address" style={{right: '25px'}}>
                        <Input className="dev_address" placeholder="请输入" onChange= {this.handleAddressChange}/>
                    </Form.Item>

                    <Form.Item label="时间查询" name="time_select" style={{right: '25px',paddingLeft: '40px'}}>
                            <RangePicker className="dev_time" onChange={this.handleTimeChange}/>
                    </Form.Item>

                    <Form.Item label="设备品牌" name="dev_brand" >
                        <Select className="dev_brand" placeholder="请选择" onChange={this.handleVendorChange}>
                            <Option value="0">全部</Option>
                            <Option value="1">联想</Option>
                            <Option value="2">希沃</Option>
                            <Option value="3">鸿合</Option>
                            <Option value="4">其它</Option>
                        </Select>
                    </Form.Item>
                    <Button className="report_search" type="primary" htmlType="submit">
                        查询
                    </Button>
                    <Button className="report_reset" htmlType="button" onClick={this.onReset.bind(this)}>
                        重置
                    </Button>
                    <Button className="report_export" htmlType="button" onClick={this.onExport}>
                        导出报表
                    </Button>
                </Form>
            </div>
            <div className="report_content">
                <Table className="report_table" columns={columns} loading={this.state.reportTableLoading} dataSource={this.state.data} pagination={{showQuickJumper: true,defaultPageSize: 10,pageSizeOptions: [10,20,50],total: this.state.total,showTotal: total => `共${total}条`}} onChange={this.onChange} />
            </div>
            <div className="report_content_hidden" style={{display: 'none'}}>
                <Table className="report_table_hidden" columns={columns} loading={this.state.excelReportTableLoading} dataSource={this.state.excelData} pagination={{showQuickJumper: true,defaultPageSize: 10000,pageSizeOptions: [10000,20000,50000],total: this.state.excelTotal,showTotal: total => `共${total}条`}} />
            </div>
        </div>
    };
}

export default Report;