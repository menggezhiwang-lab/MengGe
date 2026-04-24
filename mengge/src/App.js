import './css/App.css';


let userData = [
    {name:"张三", age:18},
    {name:"李四", age:30},
    {name:"王五", age:32},
    {name:"钱六", age:32},
    {name:"赵七", age:28},
    {name:"黄", age:32}
]
for(let i in userData){
    userData[i].id=i;
}

function Ulli({data}){
    return (
        <ul>
            {data.map(user =>(
                <li key={user.name} style={{ color: user.age > 30 ? 'green' : 'black' }}>
                    姓名：{user.name},年龄：{user.age};
                </li>
            ))}
        </ul>
    );
}

function App() {
    return (
        <div className="App">
            <header className="App-header">
                <Ulli data={userData}/>
            </header>
        </div>
    );
}

export default App;
