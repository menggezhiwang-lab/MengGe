import { useRef,useEffect } from 'react'
import * as THREE from 'three'
import Stats from './../../utils/Stats'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import Athena from './assets/model/athena.glb?url'
import Monster from './assets/model/monster.glb?url'

function DNF(){
    const log = console.dir;
    const WebGL = useRef<HTMLDivElement | null>(null);
    const animateId = useRef<number | null>(null);

    useEffect(() =>{
        const Width = window.innerWidth;
        const Height = window.innerHeight;
        const WebGLCurrent = WebGL.current;
        const Box1 = new THREE.Box3();
        const Box2 = new THREE.Box3();
        
        const scene = new THREE.Scene();

        //模型框架展示
        const dummy = new THREE.Object3D();
        const boxHelper1 = new THREE.BoxHelper(dummy,0xff0000);
        const boxHelper2 = new THREE.BoxHelper(dummy,0x0000ff);
        scene.add(boxHelper1);
        scene.add(boxHelper2);

        //碰撞检测
        function checkCollision(mesh1: THREE.Object3D, mesh2: THREE.Object3D) {
            Box1.setFromObject(mesh1,true);
            Box2.setFromObject(mesh2,true);
            return Box1.intersectsBox(Box2);
        }
        
        
        const groundWidth = 100;
        const groundHeight = 12;
        const groundGeo = new THREE.PlaneGeometry(groundWidth, groundHeight);

        // 石灰地面材质：浅灰水泥色、哑光、轻微粗糙度、无强烈反光
        const groundMat = new THREE.MeshStandardMaterial({
            color: 0xb8b8b8,    // 石灰原生浅灰色
            roughness: 0.85,    // 哑光水泥，不发亮
            metalness: 0.02,    // 几乎无金属感
            side: THREE.DoubleSide
        });

        const ground = new THREE.Mesh(groundGeo, groundMat);
        ground.position.x = groundWidth / 2;
        ground.rotation.x = -Math.PI / 2; // 放平
        ground.receiveShadow = true; // 接收所有物体阴影
        scene.add(ground);
        
        interface heroActionsWay {
            idle: string; //待机
            attack1: string; //出拳
            attack2: string; //双手推
            attack3: string; //旋转腿
            attack4: string; //反弹力球
            attack5: string; //反弹力球（不知道有何区别）
            dead: string;   //失败（阵亡）
            run: string; //跑步
            skill1: string;   //魔法波
            skill2: string;   //凤凰剑
            skill2_2: string;   //升龙
            skill2_3: string;   //心灵传送术（开始）
            skill2_4: string;   //心灵传送术（飞行）
            skill3: string;   //超必杀，旋转水晶
            verigo: string;   //眩晕
        }

        const heroAnimMap:heroActionsWay = {
            idle: 'fight_idle', //待机
            attack1: 'attack1', //出拳
            attack2: 'attack2', //双手推
            attack3: 'attack3', //旋转腿
            attack4: 'attack4', //反弹力球
            attack5: 'attack5', //反弹力球（不知道有何区别）
            dead: 'dead',   //失败（阵亡）
            run: 'run', //跑步
            skill1: 'skill1',   //魔法波
            skill2: 'skill2',   //凤凰剑
            skill2_2: 'skill2_2',   //升龙
            skill2_3: 'skill2_3',   //心灵传送术（开始）
            skill2_4: 'skill2_4',   //心灵传送术（飞行）
            skill3: 'skill3',   //超必杀，旋转水晶
            verigo: 'verigo',   //眩晕
        };

        const heroActions: Partial<Record<keyof heroActionsWay, THREE.AnimationAction>> = {};

        //添加主角
        let heroMixer:THREE.AnimationMixer | null = null;
        let heroModel:THREE.Object3D | null = null;
        let heroAction = 'idle';
        let heroHand:THREE.Bone | null = null;
        let hitBox: THREE.Mesh | null = null;
        const hero = new GLTFLoader().load(Athena,(gltf)=>{
            heroModel = gltf.scene;
            heroModel.position.x = 1;
            heroModel.rotation.y = Math.PI / 2;
            scene.add(heroModel);
            camera.lookAt(heroModel.position);
            heroMixer = new THREE.AnimationMixer(heroModel);
            // 攻击碰撞体
            const hitBoxGeometry = new THREE.SphereGeometry(0.3, 8, 8);
            const hitBoxMaterial = new THREE.MeshBasicMaterial({
                color: 0xff0000,
                transparent: true,
                opacity: 0.3,
            });
            hitBox = new THREE.Mesh(hitBoxGeometry, hitBoxMaterial);
            scene.add(hitBox);
            heroModel.traverse((child)=>{
                if(child.name === 'Bip001_L_Hand_019'){
                    heroHand = child as THREE.Bone;
                }
            })
            for(let i in heroAnimMap){
                const key = i as keyof heroActionsWay;
                const clipName = heroAnimMap[key];
                const clip = THREE.AnimationClip.findByName(gltf.animations, clipName);
                if (clip) heroActions[key] = heroMixer?.clipAction(clip);
            }
        });

        interface mobActionsWay {
            idle: string;   //待机
            stand: string;  //站立
            walk: string;   //行走
            attack: string; //攻击
            jump: string;   //跳
            fall: string;   //下落
            land: string;   //落地
            leftWalk: string;   //左行走
            rightWalk: string;  //右行走
            pose: string;   //摆pose
            retreat: string;//后退
        }

        const mobAnimMap:mobActionsWay = {
            idle: 'Idle', //待机
            stand: 'Standing', //站立
            walk: 'Walk',   //行走
            attack: 'Attack', //攻击
            jump: 'Jump',   //跳
            fall: 'Fall',   //下落
            land: 'Land',   //落地
            leftWalk: 'Strafe.L',   //左行走
            rightWalk: 'Strafe.R',   //右行走
            pose: 'T-Pose',   //摆pose
            retreat: 'Walk Backwards',   //后退
        };
        const mobActions: Partial<Record<keyof mobActionsWay, THREE.AnimationAction>> = {};

        //添加怪物
        let mobMixer:THREE.AnimationMixer | null = null;
        let mobModel:THREE.Object3D | null = null;
        let mobAction = 'retreat';
        const monster = new GLTFLoader().load(Monster,(gltf)=>{
            log(gltf.animations);
            mobModel = gltf.scene;
            mobModel.position.x = 5;
            const box = new THREE.Box3().setFromObject(mobModel);
            // 模型底部到原点的距离
            const bottom = box.min.y;
            // 整体抬升，让底部刚好在 y=0 地面
            mobModel.position.y -= bottom;
            mobModel.traverse((obj) => {
                if(obj.type === 'SkinnedMesh'){
                    if(obj.name === "Object_21"){
                        obj.visible = false;
                    }
                }
            })
            scene.add(mobModel);
            mobMixer = new THREE.AnimationMixer(mobModel);
            for(let i in mobAnimMap){
                const key = i as keyof mobActionsWay;
                const clipName = mobAnimMap[key];
                const clip = THREE.AnimationClip.findByName(gltf.animations, clipName);
                if (clip) mobActions[key] = mobMixer?.clipAction(clip);
            }
        });
        window.addEventListener('keydown',handleKeyDown);
        window.addEventListener('keyup',handleKeyUp);

        //按键被按下提示
        const keyDownCode: {[key: string]: boolean} = {
            KeyW: false,    //上
            KeyA: false,    //下
            KeyS: false,    //左
            KeyD: false,    //右
            KeyJ: false,    //攻击1
            KeyK: false,    //攻击2
            KeyL: false,    //攻击3
        }

        //按下按键
        function handleKeyDown(event: KeyboardEvent){
            if(keyDownCode.hasOwnProperty(event.code)){
                keyDownCode[event.code] = true;
            }
            if((event.code === 'KeyJ'||event.code === 'KeyK') && !isAttackPlaying){
                isAttackPlaying = true;
                isAttackStatus = true;
            }
        }

        //抬起按键
        function handleKeyUp(event: KeyboardEvent){
            if(keyDownCode.hasOwnProperty(event.code)){
                keyDownCode[event.code] = false;
            }
            if(event.code === 'KeyJ'||event.code === 'KeyK'){
                isAttackStatus = false;
                isAttackPlaying = false;
            }
            log(event.code);
        }

        //添加平行光
        const ambientLight = new THREE.AmbientLight(0xffffff,1);
        scene.add(ambientLight);

        const axesHelper = new THREE.AxesHelper(1000);
        scene.add(axesHelper);
        
        const camera = new THREE.PerspectiveCamera(30,Width/Height,1,1000);
        camera.position.set(0,10,15);

        const render = new THREE.WebGLRenderer({
            antialias: true
        });
        render.setSize(Width,Height);
        render.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        render.setClearColor(0x47484B, 1);

        const controls = new OrbitControls(camera,render.domElement);

        let stats: Stats|null = new Stats();
        WebGLCurrent?.appendChild(stats.dom);
        WebGLCurrent?.appendChild(render.domElement);

        // 攻击是否正在硬直、动画未播完
        let isAttackPlaying = false;
        let isAttackStatus = false;   //是否攻击状态中
        // 攻击结束回调

        let previousTime = 0;
        function animate(currentTime: number){
            stats?.update();
            
            const delta = Math.min((currentTime - previousTime) / 1000,0.2);
            previousTime = currentTime;

            //主角行动
            if(heroModel){
                const modelSpeed = 3;
                switch(true){
                    case keyDownCode.KeyW:
                        if(heroModel.position.z > -groundHeight/2){
                            heroModel.position.z -= modelSpeed * delta;
                        }
                        break;
                    case keyDownCode.KeyS:
                        if(heroModel.position.z < groundHeight/2){
                            heroModel.position.z += modelSpeed * delta;
                        }
                        break;
                    case keyDownCode.KeyA:
                        if(heroModel.position.x > 0){
                            heroModel.position.x -= modelSpeed * delta;
                        }
                        heroModel.rotation.y = -Math.PI / 2;
                        break;
                    case keyDownCode.KeyD:
                        if(heroModel.position.x < groundWidth){
                            heroModel.position.x += modelSpeed * delta;
                        }
                        heroModel.rotation.y = Math.PI / 2;
                        break;
                }
                let heroActionLoop = true;
                if(keyDownCode.KeyJ){
                    heroAction = 'attack1';
                    heroActionLoop = false;
                }else if(keyDownCode.KeyK){
                    heroAction = 'attack2';
                    heroActionLoop = false;
                }else if(keyDownCode.KeyL){
                    heroAction = 'skill2_2';
                    heroActionLoop = false;
                }else if(keyDownCode.KeyW||keyDownCode.KeyS||keyDownCode.KeyA||keyDownCode.KeyD){
                    heroAction = 'run';
                }else{
                    heroAction = 'idle'
                }

                //Object.values(actions).forEach((action) => action?.stop());
                
                rolePlay(heroAction,heroActions,heroActionLoop);
                camera.position.x = heroModel.position.x;
            }
            heroMixer?.update(delta);

            //怪物行动
            if(mobModel){
                rolePlay(mobAction,mobActions)
            }
            mobMixer?.update(delta);

            if(heroHand && hitBox && mobModel){
                heroHand.getWorldPosition(hitBox.position);
                heroHand.getWorldQuaternion(hitBox.quaternion);
                if(checkCollision(hitBox,mobModel) && isAttackStatus){
                    mobAction = 'land';
                    rolePlay(mobAction,mobActions);
                    isAttackStatus = false;
                    log('打到了');
                }
            }

            render.render(scene,camera);
            animateId.current = requestAnimationFrame(animate);
        }
        animateId.current = requestAnimationFrame(animate);

        //角色状态切换 acation要切换的动画名称
        function rolePlay(acation: string,Acations: Partial<Record<keyof mobActionsWay, THREE.AnimationAction>>,loop: boolean = true){
            for (const key in Acations) {
                const action = Acations[key as keyof typeof Acations];
                if (!action) continue;
                if (key === acation) {
                    // 设置播放模式
                    action.loop = loop ? THREE.LoopRepeat : THREE.LoopOnce;
                    // 播放一次时：播放完回到第一帧（不回弹）
                    action.play();
                }else{
                    action.stop();
                }
                
            }
        }

        return(()=>{
            if(animateId.current){
                cancelAnimationFrame(animateId.current);
                animateId.current = null;
            }
            WebGLCurrent?.removeChild(render?.domElement);
            render?.dispose();
            render?.forceContextLoss();
            window.removeEventListener('keydown',handleKeyDown);
            window.removeEventListener('keyup',handleKeyUp);
            heroMixer?.stopAllAction();
            stats?.dom.remove();
            stats = null;
        })
    },[])

    return(
        <>
            <div className="DNF" ref={WebGL}></div>
        </>
    )
}

export default DNF;