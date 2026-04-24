import React from 'react';
import ReactDOM from 'react-dom';
import { HashRouter as Router, Switch, Route } from 'react-router-dom';
import Login from './Login';
import Dev_entry from './Dev_entry';
import zhCN from 'antd/lib/locale/zh_CN';
import { ConfigProvider } from 'antd';

ReactDOM.render(
    <ConfigProvider locale={zhCN}>
        <Router>
            <Switch>
                <Route path="/dev_entry" component={Dev_entry}/>
                <Route path="/" component={Login}/>
            </Switch>
        </Router>
    </ConfigProvider>,
    document.getElementById('root')
);