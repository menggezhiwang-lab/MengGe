import { useRef } from "react";
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import Stats from './../../utils/Stats';

gsap.registerPlugin(useGSAP)

function Gsap(){
    const webGL = useRef<HTMLDivElement | null>(null);
    const requestAnimate = useRef<number | null>(null);
    
    useGSAP(()=>{
        const Width = window.innerWidth;
        const Height = window.innerHeight;
        const webGLCurrent = webGL.current;

        const scene = new THREE.Scene();

        const geometry = new THREE.BoxGeometry(5,5,5);
        // const ballColors = [
        //     0xF8A7B8, // 柔雾粉
        //     0xF9B872, // 杏子橙
        //     0xF9E87C, // 嫩鹅黄
        //     0x9BE888, // 青柠绿
        //     0x68D8C8, // 薄荷青
        //     0x72B8F9, // 天青蓝
        //     0xA798E8, // 风铃紫
        //     0xD8889B  // 豆沙红
        // ];
        const createMaterial = ()=> new THREE.MeshPhysicalMaterial({
            //color: ballColors[Math.floor(Math.random() * ballColors.length)],
            color: 0xffffff,
            metalness: 0.1,
            roughness: 0.05,
            transmission: 1.0, 
            ior: 1.5,
            thickness: 0.5,
            envMapIntensity: 1.0
        }); 

        //加入模型
        function Mesh(){
            const mesh = new THREE.Mesh(geometry,createMaterial());
            mesh.position.set(0,0,0);
            scene.add(mesh);
            
            gsap.to(mesh.material.color,{
                r: .5, // 红色分量
                g: .5, // 绿色分量
                b: .5, // 蓝色分量
                yoyo: true,
                duration: 1,
                ease: 'none',
                repeat: -1,
            })

            gsap.to(mesh.rotation, {
                x: '+=' + Math.PI * 2,
                y: '+=' + Math.PI * 2,
                duration: 1,
                ease: 'none',
                repeat: -1,
            });

            const mesh2 = new THREE.Mesh(geometry,createMaterial());
            mesh2.position.set(7,0,0);
            scene.add(mesh2);
            //const loader = new THREE.TextureLoader();
            // loader.load(reactSVG, (texture) => {
            //     texture.magFilter = THREE.NearestFilter; 
            //     mesh2.material.map = texture;
            //     mesh2.material.transparent = true; // 如果图标是PNG透明底
            //     mesh2.material.needsUpdate = true;
            // });
            
            gsap.to(mesh2.position, {
                x: 13,
                duration: 1,
                yoyo: true,
                ease: 'none',
                repeat: -1,
            });

            const mesh3 = new THREE.Mesh(geometry,createMaterial());
            mesh3.position.set(20,-3,0);
            scene.add(mesh3);

            gsap.to(mesh3.position, {
                y: 3,
                duration: 1,
                yoyo: true,
                ease: 'none',
                repeat: -1,
            });

            const mesh4 = new THREE.Mesh(geometry,createMaterial());
            mesh4.position.set(30,0,-3);
            scene.add(mesh4);
            
            gsap.to(mesh4.position, {
                z: 3,
                duration: 1,
                yoyo: true,
                ease: 'none',
                repeat: -1,
            });
            
            const mesh5 = new THREE.Mesh(geometry,createMaterial());
            mesh5.position.set(0,0,20);
            scene.add(mesh5);

            gsap.to(mesh5.position, {
                duration: 3,  // 公转一圈 3秒
                ease: 'none',
                repeat: -1,
                onUpdate: function() {
                    // 利用三角函数计算圆周运动
                    const angle = (Date.now() * 0.001) * (2 * Math.PI / 3); // 根据时间计算角度
                    const radius = 3; // 轨道半径
                    mesh5.position.x = Math.cos(angle) * radius;
                    mesh5.position.z = 10 + Math.sin(angle) * radius;
                }
            });

            const mesh6 = new THREE.Mesh(geometry,createMaterial());
            mesh6.position.set(10,0,10);
            scene.add(mesh6);
            const control6 = createMotionController(mesh6,[8,12],[-3,3],.5);

            
            const mesh7 = new THREE.Mesh(geometry,createMaterial());
            mesh7.position.set(20,0,10);
            scene.add(mesh7);
            const control7 = createMotionController(mesh7,[22,18],[3,-3],.5);
            
            // 获取元素的位置信息（用于计算相对坐标）
            function createMotionController(mesh: THREE.Mesh,xArr: [number,number],yArr: [number,number],step: number){
                const xMap = gsap.utils.interpolate(xArr[0],xArr[1]);
                const yMap = gsap.utils.interpolate(yArr[0],yArr[1]);
                
                return {
                    xTo: gsap.utils.pipe(
                        gsap.utils.snap(step),          
                        gsap.quickTo(mesh.position, "x", {duration: 0.1, ease: "none"})
                    ),
                    yTo: gsap.utils.pipe(
                        gsap.utils.snap(step),          
                        gsap.quickTo(mesh.position, "y", {duration: 0.1, ease: "none"})
                    ),
                    update(xNorm: number, yNorm: number) {
                        this.xTo(xMap(xNorm));
                        this.yTo(yMap(yNorm));
                    },
                };
            }
                    
            if(webGLCurrent){
                webGLCurrent.addEventListener("mousemove", (e) => {
                    const rect = webGLCurrent.getBoundingClientRect();
                    const xNorm = (e.clientX - rect.left) / rect.width;
                    const yNorm = (e.clientY - rect.top) / rect.height;
                    control6.update(xNorm,yNorm);
                    control7.update(xNorm,yNorm);
                });
            }
        }
        Mesh();

        //加入参考坐标系
        const axesHelper = new THREE.AxesHelper(150);
        scene.add(axesHelper);

        //加入相机
        const camera = new THREE.PerspectiveCamera(30,Width/Height,1,3000);
        camera.position.set(20,37,110);
        camera.lookAt(0,0,0);

        //加入渲染
        const render = new THREE.WebGLRenderer();
        render.setSize(Width,Height);
        render.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        render.setClearColor(0x47484B, 1);
        
        //加入相机控制轨道
        const controls = new OrbitControls(camera,render.domElement);
        controls.target.set(15,0.3,-0.7);
        controls.enableDamping = true;
        // controls.addEventListener('change',function(){
        //     log(camera.position);
        //     log(controls.target);
        // })
        

        //加入帧率监测
        let stats: Stats|null = new Stats();

        webGLCurrent?.appendChild(render.domElement);
        webGLCurrent?.appendChild(stats.dom);

        function animate(){
            controls.update();
            stats?.update();
            render.render(scene,camera);
            requestAnimate.current = requestAnimationFrame(animate);
        }
        requestAnimate.current = requestAnimationFrame(animate);

        return ()=>{
            if(webGLCurrent && render.domElement){
                webGLCurrent.removeChild(render.domElement);
            }
            if(requestAnimate.current){
                cancelAnimationFrame(requestAnimate.current);
                requestAnimate.current = null;
            }
            render.dispose();
            render.forceContextLoss();
            controls.dispose(); 
            stats?.dom.remove();
            stats = null;
        }
    }, { scope: webGL });

    return (
        <>
            <div className="Gsap" ref={webGL}></div>
        </>
    )
}
export default Gsap;