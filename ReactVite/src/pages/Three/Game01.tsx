import { useRef,useEffect,useState } from 'react';
import * as THREE from 'three';
//import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import Stats from './../../utils/Stats';
import { message } from 'antd';
import './Game01.scss';
import { SOUNDS } from './../../assets/Game01/audio';
import { Flex, Progress } from 'antd';
import type { ProgressProps } from 'antd';

function Game01() {
    const log = console.log;
    interface SFXType {
        jump: HTMLAudioElement | null;
        land: HTMLAudioElement | null;
        fail: HTMLAudioElement | null;
        win: HTMLAudioElement | null;
        bgm: HTMLAudioElement | null;
    }
    // 定义一个音频库
    const SFXRef = useRef<SFXType>({
        jump: null,    // 跳跃
        land: null,    // 落地
        fail: null,    // 失败
        win: null,      // 通关
        bgm: null       // 背景音乐
    });

    function playSound(name: 'jump'|'land'|'fail'|'win'|'bgm') {
        const audio = SFXRef.current[name];
        if (!audio) return;

        // 核心技巧：重置进度到0
        // 这样如果你在落地时疯狂跳跃，声音会立刻重新开始，不会卡顿
        audio.currentTime = 0;
        
        // 播放
        audio.play().catch(() => {
            // 忽略自动播放拦截错误
        });
    }
    function pauseSound(name: 'jump'|'land'|'fail'|'win'|'bgm') {
        const audio = SFXRef.current[name];
        if (!audio) return;

        // 核心技巧：重置进度到0
        // 这样如果你在落地时疯狂跳跃，声音会立刻重新开始，不会卡顿
        
        // 播放
        audio.pause();
    }
    
    const [percent1, setPercent1] = useState(0);
    const [percent2, setPercent2] = useState(Number(localStorage.getItem('gameProgress')) || 0);
    const oneColors: ProgressProps['strokeColor'] = {
        '0%': '#108ee9',
        '100%': '#87d068',
    };

    const twoColors: ProgressProps['strokeColor'] = {
        '0%': '#87d068',
        '50%': '#ffe58f',
        '100%': '#ffccc7',
    };

    const WebGPU = useRef<HTMLDivElement | null>(null);
    const animateId = useRef<number | null>(null);
    useEffect(function(){
        const Width = window.innerWidth;
        const Height = window.innerHeight;
        const webGPUCurrent = WebGPU.current;
        
        const BOX1 = new THREE.Box3();
        const BOX2 = new THREE.Box3();
        const LeveLength = 320;
        
        const audio = {
            jump: new Audio(SOUNDS.JUMP),
            land: new Audio(SOUNDS.LAND),
            fail: new Audio(SOUNDS.FAIL),
            win: new Audio(SOUNDS.WIN),
            bgm: new Audio(SOUNDS.BGM),
        };
        
        // 预处理：设置音量（防止爆炸）
        audio.jump.volume = 0.4;
        audio.land.volume = 0.4;
        audio.fail.volume = 0.6;
        audio.win.volume = 0.6;
        audio.bgm.volume = 0.2;
        audio.bgm.loop = true; // 背景音乐循环
        SFXRef.current = audio;

        let audioPlay = false;
        function Play(){
            if(!audioPlay){
                try{
                    audioPlay = true;
                    playSound('bgm');
                }catch{
                    audioPlay = false;
                }
            }
        }
        function Stop(){
            if(audioPlay){
                audioPlay = false;
                pauseSound('bgm');
            }
        }
        
        //创建键盘是否启动动画
        const keyDownObj: {[key: string]: boolean} = {
            ArrowLeft: false,
            ArrowRight: false,
            ShiftLeft: false,
        }

        //创建场景
        const Scene = new THREE.Scene();

        //创建模型
        const cupGeoHeight = 5;
        const cupGeoInit = cupGeoHeight/2;
        const model = new THREE.BoxGeometry(cupGeoHeight,cupGeoHeight,cupGeoHeight);
        //给模型附加材质
        const material = new THREE.MeshStandardMaterial({
            color: 0xff0000,
            transparent: true,
            opacity: 0.9,
            side: THREE.DoubleSide, // 内壁外壁都能看见
            //depthWrite: false,
        });


        //创建实体模型
        const cup = new THREE.Mesh(model,material);
        Scene.add(cup);
        // 杯子：半径 3.5cm，高 10cm，32边圆滑
        // const cupGeoHeight = 5;
        // const cupGeoInit = cupGeoHeight/2;
        // const cupGeo = new THREE.CylinderGeometry(2.5, 1.5, cupGeoHeight, 32);

        // const cupMaterial = new THREE.MeshStandardMaterial({
        //     color: 0xff0000,
        //     transparent: true,
        //     opacity: 0.9,
        //     side: THREE.DoubleSide, // 内壁外壁都能看见
        //     depthWrite: false,
        // });

        // const cup = new THREE.Mesh(cupGeo, cupMaterial);
        // cup.position.y = cupGeoInit; // 让底部贴地
        // Scene.add(cup);

        //创建障碍
        const obstacles: THREE.Mesh[] = [];
        const modelData={
            shortModel: {
                width: 2,
                height: 2,
                depth: 2,
            },
            longModel: {
                width: 5,
                height: 2,
                depth: 2,
            },
            tallModel: {
                width: 2,
                height: 5,
                depth: 2,
            },
            normalModel: {
                width: 3,
                height: 3,
                depth: 2,
            }
        }
        interface BoxSize {
            width: number;
            height: number;
            depth: number;
        }
        interface MeshConfig{
            x?: number; //x轴
            y?: number; //y轴
            isMove?: boolean;   //是否移动
            direction?: 'left'|'top';   //移动方向
            range?: number; //
            speed?: number;
            type?: string;
            rotate?: number;
            scale?: number;
        }
        function ModelCreate(size: BoxSize,config: MeshConfig = {},color: number = 0x00ff00){
            const model = new THREE.BoxGeometry(size.width,size.height,size.depth);
            const material = new THREE.MeshStandardMaterial({
                color: color,
                roughness: 0.5,
                metalness: 0.1,
            });
            const mesh = new THREE.Mesh(model,material);
            const baseX = config.x ?? 0;
            const baseY = size.height/2 + (config.y ?? 0);
            mesh.position.set(config.x ?? 0,baseY,0);
            if(config.scale){
                mesh.scale.set(config.scale,config.scale,config.scale);
            }
            const isMove = !!config.isMove;
            mesh.userData.info = {
                isMove: isMove,
                direction: config.direction,
                range: config.range,
                speed: config.speed ?? 50,
                originPos: config.direction === 'left'?baseX:baseY,
                rotate: config.rotate,
                scale: config.scale,
            }
            mesh.userData.type = config.type ?? 'obstacle';
            if (typeof obstacles !== 'undefined') {
                obstacles.push(mesh);
            }
            Scene.add(mesh);
            return mesh;
        }

        type ModelType = 'shortModel' | 'longModel' | 'normalModel' | 'tallModel';
        const modelArr: ModelType[] = ['shortModel','longModel','normalModel','tallModel'];
        let modelcount = 0; //游戏总长度
        let gameProgress = 0;//游戏当前进度
        for(let i = 0; i < LeveLength; i++){
            const x = i*30+30;
            modelcount = x;
            const y = Math.max(Math.random() * 10,0);
            const direction = Math.random() >= 0.5?'left' : 'top';
            const range = Math.random() > 0.5 ? -10 + Math.random()*5 : 5 + Math.random()*5;
            const speed = Math.max(Math.random()*25,6);
            const model = modelArr[Math.floor(Math.random() * 4)];  //模型随机生成
            const rotate = Math.random()*2;
            const scale = Math.max(Math.random()*1.5,1);
            ModelCreate(modelData[model],{x: x,y: y,isMove: true,direction: direction,range: range,speed: speed,rotate: rotate,scale: scale});
        }
        modelcount+=50;
        ModelCreate(modelData.tallModel,{x: modelcount,y: 8,type: 'destination'},0xff0000);
        ModelCreate(modelData.tallModel,{x: modelcount,y: 0,type: 'destination'},0xff0000);
        ModelCreate(modelData.tallModel,{x: modelcount,y: 16,type: 'destination'},0xff0000);
        // ModelCreate(modelData.tallModel,{x: 30});
        // ModelCreate(modelData.shortModel,{x: 60,isMove: true,direction: 'left',range: 5});
        // ModelCreate(modelData.tallModel,{x: 90});
        // ModelCreate(modelData.normalModel,{x: 120,isMove: true,direction: 'top',range: 5});
        // ModelCreate(modelData.longModel,{x: 150,y: 10,isMove: true,direction: 'top',range: -5});
        // ModelCreate(modelData.longModel,{x: 180,y: 10});
        // ModelCreate(modelData.longModel,{x: 210,y: 4,isMove: true,direction: 'left',range: 10,speed: 30});
        // ModelCreate(modelData.longModel,{x: 180,y: 10});

        //添加平行光
        const ambientLight = new THREE.AmbientLight(0xffffff,1);
        Scene.add(ambientLight);

        //添加参考线
        const axesHelper = new THREE.AxesHelper(LeveLength*30+50);
        Scene.add(axesHelper);
        
        //创建相机并设置基础参数
        const Camera = new THREE.PerspectiveCamera(50,Width/Height,0.1,1000);
        Camera.position.set(0,16,80);
        Camera.lookAt(cup.position);

        //创建渲染
        const render = new THREE.WebGLRenderer();
        render.setSize(Width,Height);
        render.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        render.setClearColor(0x47484B, 1);

        //添加轨道控制器
        //const Controls = new OrbitControls(Camera,render.domElement);

        webGPUCurrent?.appendChild(render.domElement);

        // 跳跃物理参数
        let velocity = 0;
        let isPhysicsActive = false;
        let isJump = false;
        let JumpHeight = 0;
        const timer = new THREE.Timer();
        let stats: Stats|null = new Stats();
        webGPUCurrent?.appendChild(stats.dom);
        function animate(){
            //Controls.update();
            timer.update();
            stats?.update();
            let dt = timer.getDelta();
            if(dt > .3)dt = 0.05;
            //怪物移动
            for(let [inx,mesh] of obstacles.entries()){
                const meshInfo = mesh.userData.info;
                if(meshInfo.isMove){
                    if(mesh.userData.type === 'obstacle'){
                        if(checkCollision(cup,mesh)){
                            GameInit();
                            Stop();
                            playSound('fail');
                            message.open({
                                type: 'error',
                                content: `本次进度：${gameProgress}%`,
                            });
                        }
                    }
                    if(meshInfo.direction === 'left')mesh.position.x += meshInfo.speed * dt;
                    if(meshInfo.direction === 'top')mesh.position.y += meshInfo.speed * dt;
                    const pos = meshInfo.direction === 'left' ? mesh.position.x *dt: mesh.position.y*dt;
                    let isOut;
                    if(meshInfo.range > 0){
                        isOut = pos > meshInfo.originPos*dt + meshInfo.range*dt || pos < meshInfo.originPos*dt;
                    }else{
                        isOut = pos < meshInfo.originPos*dt + meshInfo.range*dt || pos > meshInfo.originPos*dt;
                    }
                    if(isOut)meshInfo.speed = -meshInfo.speed;

                    if(meshInfo.rotate){
                        mesh.rotation.x += meshInfo.rotate*dt;
                        mesh.rotation.y += meshInfo.rotate*dt;
                    }
                };
            }
            
            //左右移动
            if(keyDownObj.ArrowLeft){
                cupOperate('x',(keyDownObj.ShiftLeft?-60:-30)*dt);
            }else if(keyDownObj.ArrowRight){
                cupOperate('x',(keyDownObj.ShiftLeft?60:30)*dt);
            }

            //跳跃
            if(isPhysicsActive){
                // 重力
                if(isJump){
                    if(cup.position.y < JumpHeight){
                        log(0.8 * dt);
                        velocity -= 0.8 * dt;
                        cupOperate('y', velocity);
                    }else{
                        isJump = false;
                        velocity = 0;
                    }
                }else{
                    velocity -= 1.6 * dt;
                    cupOperate('y', velocity);
                }
                // 落地检测
                if (cup.position.y <= cupGeoInit) {
                    cup.position.y = cupGeoInit;
                    log('触发了')
                    playSound('land');
                    isPhysicsActive = false;
                    velocity = 0;
                }
            }
            Camera.lookAt(cup.position.x,cupGeoInit,0);
            render.render(Scene,Camera);
            animateId.current = requestAnimationFrame(animate);
        }
        animateId.current = requestAnimationFrame(animate);

        function cupOperate(xy: 'x'|'y',num: number){
            cup.position[xy] += num;
            if(xy === 'x'){
                if(cup.position.x < 0)cup.position.x=0;
                cup.position.x = cup.position.x < 0?0:cup.position.x;
                Camera.position[xy] = cup.position[xy];
                gameProgress = Number((cup.position.x/modelcount*100).toFixed(1));
                setPercent1(gameProgress);
                if(Number(localStorage.getItem('gameProgress')) < gameProgress){
                    setPercent2(gameProgress);
                    localStorage.setItem('gameProgress', String(gameProgress))
                }
            }
            for(let mesh of obstacles){
                if(mesh.userData.type === 'obstacle'){
                    if(checkCollision(cup,mesh)){
                        GameInit();
                        Stop();
                        playSound('fail');
                        setPercent1(0);
                        message.open({
                            type: 'error',
                            content: `本次进度：${gameProgress}%`,
                        });
                    }
                }else if(mesh.userData.type === 'destination'){
                    if(checkCollision(cup,mesh)){
                        GameInit();
                        Stop();
                        playSound('win');
                        setPercent2(100);
                        localStorage.setItem('gameProgress', String(100))
                        message.open({
                            type: 'success',
                            content: '恭喜你过关了，你好棒哟！',
                        });
                    }
                }
            }
        }
        
        function GameInit(){
            cup.position.set(0,cupGeoInit,0); // 让底部贴地
            for(let i in keyDownObj){
                keyDownObj[i] = false;
            }
            isPhysicsActive = false; 
            isJump = false;
            velocity = 0;
            Camera.position.set(0,16,80);
        } 
        GameInit();

        function checkCollision(mesh1: THREE.Mesh, mesh2: THREE.Mesh) {
            BOX1.setFromObject(mesh1);
            BOX2.setFromObject(mesh2);
            return BOX1.intersectsBox(BOX2);
        }

        function handleKeyDown(event: KeyboardEvent){
            if(event.code === 'ArrowUp' || event.code === 'Space'){
                log(isPhysicsActive);
                if (!isPhysicsActive) {
                    playSound('jump');
                    isPhysicsActive = true;
                    isJump = true;
                    JumpHeight = keyDownObj.ShiftLeft?25:20;
                    velocity = 0.5;
                }
            }
            if(keyDownObj.hasOwnProperty(event.code)){
                Play();
                keyDownObj[event.code] = true;
            }
            log(event.code);
        }
        function handleKeyUp(event: KeyboardEvent){
            if(event.code === 'ArrowUp' || event.code === 'Space'){
                if (isPhysicsActive&&isJump) {
                    isJump = false;
                    velocity = 0;
                    log('提前松手了');
                }
            }
            if(keyDownObj.hasOwnProperty(event.code)){
                keyDownObj[event.code] = false;
            }
        }

        window.addEventListener('keydown',handleKeyDown);
        window.addEventListener('keyup',handleKeyUp);

        return () => {
            Object.values(SFXRef.current).forEach((audio) => {
                try {
                    audio.pause();
                    audio.src = "";
                    audio.load();
                } catch {}
            });
            // 清空引用
            SFXRef.current = {
                jump: null,
                land: null,
                fail: null,
                win: null,
                bgm: null,
            };
            window.removeEventListener('keydown',handleKeyDown);
            window.removeEventListener('keyup',handleKeyUp);
            if(animateId.current){
                cancelAnimationFrame(animateId.current);
            }
            
            if(webGPUCurrent && render.domElement){
                webGPUCurrent.removeChild(render.domElement);
            }
            render.dispose();
            render.forceContextLoss();
            stats?.dom.remove();
            stats = null;
        }
    },[])

    return (
        <>
            <div className="game01" ref={WebGPU}></div>
            <ul className="game01-ul">
                <li>游戏操作：</li>
                <li>键盘↑/空格 = 跳跃（可提前松开）</li>
                <li>键盘←→控制移动</li>
                <li>键盘左shift加速（加速可小幅增加跳跃高度）</li>
            </ul>
            <Flex className="game-progress" gap="small" wrap>
                {/* 动态绑定百分比 */}
                <Progress 
                    type="circle" 
                    percent={percent1}
                    strokeColor={oneColors}
                    format={(percent) => `当前:${percent}%`} 
                />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                <Progress 
                    type="circle"
                    percent={percent2}
                    strokeColor={twoColors}
                    format={(percent) => `最高:${percent}%`} 
                />
            </Flex>
        </>
    );
}

export default Game01;