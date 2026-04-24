import { useEffect,useRef } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import Stats from './../../utils/Stats';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';


const EMPTY_OPTIONS = {} as const;
// 定义相机输出画布的尺寸(单位:像素px)
const Width = window.innerWidth;
const Height = window.innerHeight;

//创建一个3D场景
function Scene(){
    const scene = new THREE.Scene();
    return scene;
}

interface HelperOptions {
    light?: THREE.PointLight;//传入一个点光源，启用光源辅助观察前提是要有点光源
    directional?: THREE.DirectionalLight; //传入一个平行光源
    lightShow?: boolean;//控制光源辅助观察是否显示
    axesShow?: boolean; //控制辅助线是否显示
}
//辅助观察模块
function Helper(options: HelperOptions = EMPTY_OPTIONS){
    const group = new THREE.Group();
    // AxesHelper：辅助观察的坐标系
    if(options.axesShow){
        const axesHelper = new THREE.AxesHelper(200);
        group.add(axesHelper);
    }
    //光源辅助观察
    if(options.lightShow){
        if(options.light){
            const LightHelper = new THREE.PointLightHelper(options.light,10);
            group.add(LightHelper);
        }
        if(options.directional){
            const LightHelper = new THREE.DirectionalLightHelper(options.directional,10);
            group.add(LightHelper);
        }
    }
    return group;
}

interface LightOptions{
    light?: boolean;    //点光源是否开启
    ambient?: boolean;  //环境光是否开启
    directional?: boolean;//平行光是否开启
}
//光照模块
function Light(options: LightOptions = EMPTY_OPTIONS){
    const group = new THREE.Group();
    //点光源
    if(options.light){
        const light = new THREE.PointLight(0xFFFFFF,1.0);
        light.position.set(400,200,300);
        light.intensity = 400000;
        light.name = 'pointLight';
        group.add(light);
    }
    //平行光
    if(options.directional){
        const directional = new THREE.DirectionalLight(0xFFFFFF,1.5);
        directional.position.set(350, 350, -350);
        directional.name = 'directionalLight';
        group.add(directional);
    }
    //环境光
    if(options.ambient){
        const ambient = new THREE.AmbientLight(0xFFFFFF,.7);
        ambient.name = 'ambientLight';
        group.add(ambient);
    }
    return group;
}

//物体模块
function Mesh(count: number,countSize: number){
    const group = new THREE.Group();
    //创建一个长方体
    const geometry = new THREE.BoxGeometry(10,10,10);
    const ballColors = [
        0xF8A7B8, // 柔雾粉
        0xF9B872, // 杏子橙
        0xF9E87C, // 嫩鹅黄
        0x9BE888, // 青柠绿
        0x68D8C8, // 薄荷青
        0x72B8F9, // 天青蓝
        0xA798E8, // 风铃紫
        0xD8889B  // 豆沙红
    ];
    //将长方体与材质打包成长方体3D对象
    const material = new THREE.MeshPhongMaterial();
    const sphereInstanced = new THREE.InstancedMesh(geometry,material,count);
    const matrix = new THREE.Matrix4();
    const color = new THREE.Color();
    let counts = 0;
    for(let i = 0; i < countSize; i++){
        for(let j = 0; j < countSize; j++){
            for(let k = 0; k < countSize; k++){
                if(counts >= count)break;
                // 重置矩阵（必须！！）
                matrix.identity();
                matrix.setPosition(i*20, j*20, k*20);

                // 把矩阵设置给第 i 个实例
                sphereInstanced.setMatrixAt(counts, matrix);
                const randomColorHex = ballColors[Math.floor(Math.random() * ballColors.length)];
                color.set(randomColorHex);
                sphereInstanced.setColorAt(counts, color);
                counts++;
                // //定义材质的颜色
                // const meterial = new THREE.MeshPhongMaterial({
                //     color: ballColors[Math.round(Math.random() * 7)],
                //     specular: 0xffffff,
                //     shininess: 20,
                // });
                // const mesh = new THREE.Mesh(geometry,meterial);
                // mesh.position.set(i * 200,k * 200,j * 200);
                // mesh.rotation.y = Math.random();
                // group.add(mesh);
            }
        }
    }
    //sphereInstanced.instanceMatrix.needsUpdate = true;
    group.add(sphereInstanced);
    group.userData.instancedMesh = sphereInstanced;
    return group;
}

//相机模块
function Camera(){
    //创建一个投影相机
    const camera = new THREE.PerspectiveCamera(30,Width/Height,1,10000);
    //设置相机的初始位置
    camera.position.set(1200,900,1200);
    //设置相机的视角（一般设置为拍摄的目标）

    camera.lookAt(0,0,0);
    return camera;
}

function Three(){
    const containerRef = useRef<HTMLDivElement | null>(null);
    const requestIdRef = useRef<number | null>(null);

    //定义多少个模型
    const countRef = useRef(8000);
    const countSizeRef = useRef(Math.cbrt(countRef.current));
    
    useEffect(()=>{
        interface addGUIOptions {
            name?: string;
            step?: number;
            onChange?: (val: number) => void;
        }
        const addGUI = (obj: any,prop: string,min: number,max: number,options: addGUIOptions = {}) => {
            if (!obj) return;
            const controller = gui.add(obj,prop,min,max).name(options.name||prop).step(options.step||0.01);
            if(options.onChange){
                controller.onChange(options.onChange);
            }
        }
        const scene = Scene();  //场景
        const camera = Camera();//相机
        const lightGroup = Light({
            //light: true,      //点光源
            directional: true,//平行光
            ambient: true,      //环境光
        });  //光照
        const obj = lightGroup.getObjectByName('ambientLight');
        const directionaObj = lightGroup.getObjectByName('directionalLight');
        const ambientLight  = obj instanceof THREE.AmbientLight ? obj : undefined;
        const directionalLight  = directionaObj instanceof THREE.DirectionalLight ? directionaObj : undefined;
        const meshGroup = Mesh(countRef.current,countSizeRef.current);    //物体
        const helperGroup = Helper({
            axesShow: true,
            //light: light,
            directional: directionalLight,
            lightShow: true,
        });//辅助观察
        scene.add(lightGroup,meshGroup,helperGroup);
        //创建渲染器
        const renderer = new THREE.WebGLRenderer({
            antialias: true,
        });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setClearColor(0x47484B, 1);
        renderer.setSize(Width,Height);
        //将3D场景添加到dom文件渲染到浏览器中
        const container = containerRef.current;
        //创建帧率监视器
        let stats: Stats|null = new Stats();

        if (container) {
            container.appendChild(renderer.domElement);
            container.appendChild(stats.dom);
        }
        const controls = new OrbitControls(camera,renderer.domElement);
        const timer = new THREE.Timer();
        const dummyMatrix = new THREE.Matrix4();
        
        let timerSpt = 0;
        let timeSpt = 0;
        // const randomArr = function(){
        //     const Arr = [];
        //     for(let i = 0; i < countRef.current; i++){
        //         Arr.push(Math.random() * Math.PI * 2);
        //     }
        //     return Arr;
        // }();
        function animate(){
            //console.log(Math.random());
            timer.update();
            stats?.update();
            //const delta = timer.getDelta();
            //const spt = Math.round(1/delta);
            timerSpt++;
            if(timerSpt % 120  === 0){
                //console.log('帧率FPS',spt);
            }
            if(objBool.bool){
                //if(delta < 0.3){
                //meshGroup.rotation.y += 1 * delta;
                timeSpt++;
                const instances = meshGroup.userData.instancedMesh;
                for(let i = 0; i < countRef.current; i++){
                    const x = (i % countSizeRef.current) * 20;
                    const y = Math.floor(i / countSizeRef.current) % countSizeRef.current * 20;
                    const z = Math.floor(i / (countSizeRef.current * countSizeRef.current)) * 20;
                    dummyMatrix.identity(); // 👈 必须加！
                    dummyMatrix.makeRotationY(timeSpt / 1000 + i);
                    dummyMatrix.setPosition(x, y, z);
                    instances.setMatrixAt(i, dummyMatrix);
                    //i.rotation.y += 1 * delta;
                }
                instances.instanceMatrix.needsUpdate = true;
                // }else{
                //     console.log(delta);
                // }
            };
            //meshGroup.rotation.y += 0.5 * delta;
            renderer.render(scene,camera);
            requestIdRef.current = requestAnimationFrame(animate);
        }
        requestIdRef.current = requestAnimationFrame(animate);
            
        //引入GUI插件
        const gui = new GUI();
        gui.domElement.style.right = '0px';
        gui.domElement.style.width = '300px';
        // const object = {
        //     x: 30,
        //     y: 60,
        //     z: 300,
        // }
        addGUI(ambientLight, 'intensity', 0, 2.0, {
            name: '环境光',
            step: 0.1,
            onChange: function(val){
                console.log(val);
            }
        })
        addGUI(directionalLight, 'intensity', 0, 2.0, {
            name: '平行光',
            step: 0.1,
        })
        addGUI(meshGroup.position, 'x', 0, 180,{
            onChange: function(val){
                meshGroup.position.z = val;
            }
        });
        addGUI(meshGroup.position, 'y', 0, 180,{
            onChange: function(val){
                meshGroup.position.x = val;
            }
        });
        addGUI(meshGroup.position, 'z', 0, 180,{
            onChange: function(val){
                meshGroup.position.y = val;
            }
        });
        const meshFolder = gui.addFolder('进阶');
        const objColor = {
            color:0xff6600,
        };
        meshFolder.addColor(objColor,'color').onChange(function(val){
            for(let i of meshGroup.children as THREE.Mesh<THREE.BufferGeometry, THREE.MeshPhongMaterial>[]){
                i.material.color.set(val);
            }
        });
        const objScale = {
            scale: 0,
        };
        // 参数3数据类型：对象(下拉菜单)
        meshFolder.add(objScale, 'scale', {
            '左': -100,
            '中': 0,
            '右': 100
        }).name('位置选择').onChange(function (val) {
            meshGroup.position.x = val;
        });
        // 参数3数据类型：数组(下拉菜单)
        meshFolder.add(objScale, 'scale', [-100, 0, 100]).name('y坐标').onChange(function (val) {
            meshGroup.position.y = val;
        });

        const objCount = {
            count: countRef.current,
        }
        function clear(group: THREE.Group) {
            group.traverse(child => {
                if(child instanceof THREE.Mesh){
                    child.geometry?.dispose();
                    Array.isArray(child.material) ? child.material.forEach(mats => mats.dispose()) : child.material?.dispose();
                }
            });
            group.clear();
        }
        // 压力测试规模选择(下拉菜单)
        meshFolder.add(objCount, 'count', [125, 1000, 8000, 27000,125000,1000000]).name('压力测试').onChange(function (val) {
            countRef.current = val;
            countSizeRef.current = Math.cbrt(countRef.current);
            clear(meshGroup);

            const meshScaleGroup = Mesh(countRef.current,countSizeRef.current);
            while(meshScaleGroup.children.length > 0){
                meshGroup.add(meshScaleGroup.children[0]);
            }
            meshGroup.userData.instancedMesh = meshScaleGroup.userData.instancedMesh;
        });
        const objBool = {
            bool: true,
        };
        // 改变的obj属性数据类型是布尔值，交互界面是单选框
        meshFolder.add(objBool, 'bool').name('是否旋转');
        // const timers = setInterval(function () {
        //     console.log('x', object.x);
        // }, 1000)

        return() => {
            //页面卸载时删除3D场景（避免重复添加）
            if (container && renderer.domElement) {
                 container.removeChild(renderer.domElement);
            }
            //页面卸载时清除动画
            if(requestIdRef.current !== null){
                cancelAnimationFrame(requestIdRef.current);
                requestIdRef.current = null;
            }
            //页面卸载时停止render渲染
            renderer.dispose();
            renderer.forceContextLoss();
            controls.dispose(); 
            //页面卸载时清除gui
            gui.destroy();
            stats?.dom.remove();
            stats = null;
            //clearInterval(timers);
        }
    },[])

    return(
        <>
            <div className="ThreeInx" ref={containerRef}>
            </div>
        </>
    )
}

export default Three