import { useEffect,useRef } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import Stats from './../../utils/Stats';
import modelUrl from './../../assets/athena_kof_97.glb?url'
import { WebGPURenderer } from 'three/webgpu';

function ThreeTest(){

    const webGL = useRef<HTMLDivElement | null>(null);
    const animateId = useRef<number | null>(null);
    const webGPURender = useRef<WebGPURenderer | null>(null);

    // const BufferGeometry = (vertices: Float32Array) => {
    //     const group = new THREE.Group();
    //     const geometry = new THREE.BufferGeometry();
    //     const attribute = new THREE.BufferAttribute(vertices,3);
    //     geometry.attributes.position = attribute;
    //     const material = new THREE.PointsMaterial({
    //         color: 0xff0000,
    //         size: 10.0,
    //     })
    //     const mesh = new THREE.Points(geometry,material); 
    //     group.add(mesh);
    //     return group;
    // }
    useEffect(function(){
        const Width = window.innerWidth;
        const Height = window.innerHeight;

        const webGLCurrent = webGL.current;

        //帧率监测插件
        let stats: Stats|null = new Stats();

        const init = async () => {
            const scene =  new THREE.Scene();

            //类型化数组创建顶点数据
            // const vertices = new Float32Array([
            //     0, 0, 0, //顶点1坐标
            //     50, 0, 0, //顶点2坐标
            //     0, 100, 0, //顶点3坐标
            //     0, 0, 10, //顶点4坐标
            //     0, 0, 100, //顶点5坐标
            //     50, 0, 10, //顶点6坐标
            // ]);

            // const mesh = BufferGeometry(vertices);

            const geometry = new THREE.BoxGeometry(10,10,10);
            const material = new THREE.MeshLambertMaterial({
                color: 0xff0000,//0xff0000设置材质颜色为红色
            }); 
            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.set(0,0,0);
            //scene.add(mesh);
            
            const ambient = new THREE.AmbientLight(0xffffff,1.5);
            scene.add(ambient);
            // 主光源
            const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.5);
            dirLight1.position.set(5, 10, 7);
            scene.add(dirLight1);

            // 补光（防止模型背面变黑）
            const dirLight2 = new THREE.DirectionalLight(0xffffff, 0.8);
            dirLight2.position.set(-5, 10, -7);
            scene.add(dirLight2);

            // 全局保存 mixer，用于每一帧更新
            let model:THREE.Group | null = null;
            let mixer:THREE.AnimationMixer | null = null;
            //导入模型
            new GLTFLoader().load(modelUrl, (gltf) => {
                model = gltf.scene;
                model.traverse(child => {
                    if(child instanceof THREE.Mesh){
                        if (child.isMesh) {
                            // 开启双面渲染
                            // 顺便解决黑色问题
                        }
                    }
                })
                gltf.animations.forEach((clip, index) => {
                    console.log(`第${index+1}个动画：`, clip.name)
                })
                
                scene.add(model);
                
                model.scale.set(300,300,300);
                model.updateMatrixWorld(true);
                mixer = new THREE.AnimationMixer(model);
                const idleClip = THREE.AnimationClip.findByName(gltf.animations, 'city_idle');
                //const runClip = THREE.AnimationClip.findByName(gltf.animations, 'city_action');
                if(!idleClip){return};
                const action = mixer.clipAction(idleClip);
                action.play();
            });

            //参考线
            const axesHelper = new THREE.AxesHelper(150);
            scene.add(axesHelper)

            //相机
            const camera = new THREE.PerspectiveCamera(30,Width/Height,1,1000);
            camera.position.set(0,5,15);

            //渲染
            webGPURender.current = new WebGPURenderer({
                antialias: true,
            });
            const render = webGPURender.current;
            await render.init();
            render.setSize(Width,Height);
            render.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            render.setClearColor(0x47484B, 1);

            //相机轨道控制器
            const controls = new OrbitControls(camera,render.domElement);
            controls.enableDamping = true;
            controls.minDistance = 5; // ✅ 绝对不让相机靠近到模型扎进near
            controls.target.set(0, 3, 0); // ✅ 盯着模型的新位置
            controls.update();

            //将渲染画布与帧率检测插件插入到html中展示
            if(webGLCurrent && stats){
                webGLCurrent.appendChild(render.domElement);
                webGLCurrent.appendChild(stats.dom);
            }

            let previousTime = 0;
            function animate(currentTime: number){
                controls.update();
                stats?.update();
                const delta = (currentTime - previousTime) / 1000;
                previousTime = currentTime;
                if (mixer) {
                    mixer.update(delta);
                }
                // if (model) {
                //     mesh.rotation.y += 0.01;
                //     model.rotation.y += 0.01;
                // }
                render.render(scene,camera);
                animateId.current = requestAnimationFrame(animate);
            }
            animateId.current = requestAnimationFrame(animate);
        };
        init();
        return ()=>{
            const render = webGPURender.current;
            if(webGLCurrent && render && render.domElement){
                try{
                    webGLCurrent.removeChild(render.domElement);
                }catch{};
            }

            if(animateId.current){
                cancelAnimationFrame(animateId.current);
                animateId.current = null;
            }
            if(render){
                render.dispose();
            }
            stats?.dom.remove();
            stats = null;
        }
    },[])
    return (
        <>
            <div className='three-test' ref={webGL}></div>
        </>
    )
}

export default ThreeTest;