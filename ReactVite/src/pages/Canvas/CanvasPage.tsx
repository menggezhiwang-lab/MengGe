import { useEffect,useRef } from "react";

interface userDataType {
    name: string,
    age: number,
    id: number,
}

const userData :userDataType[] = [];

const userDataName = ['唐三','小舞','戴沐白','朱竹青','奥斯卡','宁荣荣','马红俊','白沉香'];
let userDataObjAge = 0;
let currentId = 1; // 初始ID
for(let i of userDataName){
    const userDataObj = {
        name: i,
        age: userDataObjAge += 2,
        id: currentId++,
    }
    userData.push(userDataObj);
}

function CanvasPage(){
    const windowSizeRef = useRef({
        width: window.innerWidth,
        height: window.innerHeight,
    });
    //const [count, setCount] = useState(0)
    const AppCanv = useRef<HTMLCanvasElement | null>(null);
    
    const mouseInitX = useRef<number>(-1000);     //鼠标初始X数值
    const mouseInitY = useRef<number>(-1000);     //鼠标初始Y数值
    const mouseClickStatus = useRef<number>(0);   //鼠标点击状态（0未点击，1点击）
    const mouseMoveOffset = useRef<{x:number,y:number}>({x:0,y:0});   //记录鼠标移动距离
    
    interface BallProps {
        x: number;      // 横坐标
        y: number;      // 纵坐标
        r: number;      // 半径
        colorIndex: number; // 颜色
        offsetX: number;    // X轴速度
        offsetY: number;    // Y轴速度
        status: number;     //是否鼠标选中 0为未选中  1为选中
        name: string;   //用户的姓名
        age: number;    //用户的年龄
        id: number;     //用户的ID（唯一）
    }
    const ballListRef = useRef<BallProps[]>([]);

    //点击事件
    function ctxStart(x:number,y:number){
        mouseClickStatus.current = 1;
        for(let i of ballListRef.current){
            if(i.status){
                i.x = x;
                i.y = y;
            }
        }
    }

    //移动事件
    function ctxMove(x:number,y:number){
        mouseInitX.current = x;
        mouseInitY.current = y;

        if(Math.abs(mouseMoveOffset.current.x - x) <= 10){
            if(Math.abs(mouseMoveOffset.current.y - y) <= 10){
                mouseInitX.current = -1000;
                mouseInitY.current = -1000;
            }
        }
        for(let i of ballListRef.current){
            if(mouseClickStatus.current){
                if(i.status){
                    i.x = x;
                    i.y = y;
                }
            }else{
                if(x < i.x + i.r&&x > i.x - i.r){
                    if(y < i.y + i.r&&y > i.y - i.r){
                        i.status = 1;
                    }else{
                        i.status = 0;
                    }
                }else{
                    i.status = 0;
                }
            }
        }
    }
    
    //释放事件
    function ctxEnd(x:number,y:number){
        mouseClickStatus.current = 0;
        mouseInitX.current = -1000;
        mouseInitY.current = -1000;
        mouseMoveOffset.current.x = x;
        mouseMoveOffset.current.y = y;
        
        for(let i of ballListRef.current){
            i.status = 0;
        }
    }

    //鼠标点击事件
    function ctxMouseDown(event: React.MouseEvent<HTMLCanvasElement>){
        ctxStart(event.clientX,event.clientY);
    }


    //鼠标移动事件
    function ctxMouseMove(event: React.MouseEvent<HTMLCanvasElement>){
        ctxMove(event.clientX,event.clientY);
    }

    //鼠标释放事件
    function ctxMouseUp(event: React.MouseEvent<HTMLCanvasElement>){
        ctxEnd(event.clientX,event.clientY);
    }

    //手势点击
    function ctxTouchStart(event: React.TouchEvent<HTMLCanvasElement>){
        ctxStart(event.nativeEvent.changedTouches[0].clientX,event.nativeEvent.changedTouches[0].clientY);
    }


    //手势移动事件
    function ctxTouchMove(event: React.TouchEvent<HTMLCanvasElement>){
        ctxMove(event.nativeEvent.changedTouches[0].clientX,event.nativeEvent.changedTouches[0].clientY);
    }

    //手势离开事件
    function ctxTouchEnd(event: React.TouchEvent<HTMLCanvasElement>){
        ctxEnd(event.nativeEvent.changedTouches[0].clientX,event.nativeEvent.changedTouches[0].clientY);
    }

    const requestIdRef = useRef<number | null>(null); //创建动画持久化变量

    useEffect(()=>{
        window.addEventListener('resize', handleResize);
        const windowSize = windowSizeRef.current;
        const ballList = ballListRef.current;

        const canvas = AppCanv.current;
        if(!canvas)return;
        const ctx2 = canvas.getContext('2d');
        if(!ctx2)return;
        const ctx = ctx2 as CanvasRenderingContext2D;

        let Width = windowSize.width;
        let Height = windowSize.height;
        canvas.width = Width;
        canvas.height = Height;
        
        function handleResize(){
            if(!canvas)return;
            windowSize.width = window.innerWidth;
            windowSize.height = window.innerHeight;
            Width = windowSize.width;
            Height = windowSize.height;
            canvas.width = Width;
            canvas.height = Height;
        };
        const ballColors = [
            '#F8A7B8', // 柔雾粉
            '#F9B872', // 杏子橙
            '#F9E87C', // 嫩鹅黄
            '#9BE888', // 青柠绿
            '#68D8C8', // 薄荷青
            '#72B8F9', // 天青蓝
            '#A798E8', // 风铃紫
            '#D8889B'  // 豆沙红
        ];

        //初始化赋值
        for(let i=0; i < 30;i++){
            let MathRoundColor = Math.round(Math.random() * 7);
            let ballListObj = {
                x: Math.round(Math.random() * Width),
                y: Math.round(Math.random() * Height),
                r: Math.round(Math.random() * 30 + 30),
                offsetX: Number((Math.random()- 0.5).toFixed(2)) || 0.1,
                offsetY: Number((Math.random()- 0.5).toFixed(2)) || 0.1,
                colorIndex: MathRoundColor,
                status: 0,
                name: userData[MathRoundColor].name,
                age: userData[MathRoundColor].age,
                id: userData[MathRoundColor].id,
            };
            ballList.push(ballListObj);
        }
        
        //动画写入
        function animate(){
            ctx.clearRect(0,0,Width,Height);
            for(let ball of ballList){
                
                if(mouseInitX.current < ball.x + ball.r&&mouseInitX.current > ball.x - ball.r){
                    if(mouseInitY.current < ball.y + ball.r&&mouseInitY.current > ball.y - ball.r){
                        ball.status = 1;
                    }else{
                        ball.status = 0;
                    }
                }else{
                    ball.status = 0;
                }
                ctx.beginPath();
                const gradient = ctx.createRadialGradient(  //创建渐变圆
                    ball.x, ball.y, 0,        // 起始圆：圆心，半径0
                    ball.x, ball.y, ball.r    // 结束圆：圆心，半径=小球半径
                );
                gradient.addColorStop(0, ballColors[ball.colorIndex]); // 圆心色
                if(!ball.status){
                    const ballNewX = ball.x + ball.offsetX;
                    const ballNewY = ball.y + ball.offsetY;
                    ball.x = ballNewX > Width ? 0 : (ballNewX < 0 ? Width : ballNewX);
                    ball.y = ballNewY > Height ? 0 : (ballNewY < 0 ? Height : ballNewY);
                    gradient.addColorStop(1, '#666666');   // 边缘色
                }else{
                    gradient.addColorStop(1, '#DDDDDD');   // 边缘色
                }
                ctx.arc(ball.x,ball.y,ball.r,0,Math.PI * 2);
                ctx.fillStyle = gradient;
                ctx.fill();
                ctx.fillStyle = ball.status?'green':'red';
                ctx.font = "24px 楷体";
                ctx.textAlign = "center";
                ctx.fillText(ball.name,ball.x,ball.y);
                ctx.fillText(String(ball.age) + '岁',ball.x,ball.y + 24);
            }
            requestIdRef.current = requestAnimationFrame(animate);  //重复调用动画
        }
        requestIdRef.current = requestAnimationFrame(animate);  //调用动画
        return () => {
            ballListRef.current = [];

            if(requestIdRef.current !== null){
                cancelAnimationFrame(requestIdRef.current); //画布卸载时清空动画
                requestIdRef.current = null;
            }
            window.removeEventListener('resize', handleResize);
        };
    },[])
    return (
        <>
            {/* <div className="logo">
                <a className="react" href="https://react.dev" target="_blank">
                    <img src={reactSvg} alt="" />
                </a>
                <h1>Vite + React</h1>
                <button onClick={() => setCount((count) => count + 1)}>
                    count is {count}
                </button>
                <p>
                    Edit <code>src/App.tsx</code> and save to test HMR
                </p>
                <p className="read-the-docs">
                    Click on the Vite and React logos to learn more
                </p>
            </div> */}
            <div className="card">
                <canvas id="AppCanv" onMouseMove={ctxMouseMove} onMouseDown={ctxMouseDown} onMouseUp={ctxMouseUp} onMouseOut={ctxMouseUp}  onTouchMove={ctxTouchMove} onTouchStart={ctxTouchStart} onTouchEnd={ctxTouchEnd} onTouchCancel={ctxTouchEnd} ref={AppCanv}>该浏览器暂不支持Canvas</canvas>
                {/* <button id="Three" onClick={() => {navigate('/three')}}>Three</button> */}
            </div>
        </>
    )
}

export default CanvasPage;