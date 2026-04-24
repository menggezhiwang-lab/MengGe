import { useRef, useEffect, Suspense,lazy } from 'react'
import { Routes,Route,useNavigate,useLocation } from 'react-router-dom'
//import reactSvg from './assets/react.svg'
import './App.scss'

const CanvasPage = lazy(() => import('./pages/Canvas/CanvasPage'));
const Three = lazy(() => import('./pages/Three/Three'));
const ThreeTest = lazy(() => import('./pages/Three/ThreeTest'));
const Gsap = lazy(() => import('./pages/Three/Gsap'));
const DNF = lazy(() => import('./pages/Dnf/Dnf'));
const Game01 = lazy(() => import('./pages/Three/Game01'));
const AirplaneFighter = lazy(() => import('./pages/AirplaneFighter/index'));

// 禁止滚动（记录当前滚动位置，避免跳顶）
function preventPageScroll() {
    const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    document.body.style.top = `-${scrollTop}px`;
    document.body.classList.add('body-fixed');
}
preventPageScroll();

function App() {
    const location = useLocation();
    const currentPath = location.pathname; // 当前路由
    const listRef = useRef<HTMLDivElement | null>(null);

    // 自动获取内容高度，设置给 max-height
    useEffect(() => {
        const el = listRef.current;
        if (el) {
            el.style.setProperty('--full-height', el.scrollHeight + 'px');
        }
    }, []);
    const navigate = useNavigate();
    function navigateList(pageName: string){
        navigate(pageName);
    }
    return (
        <>
            <Suspense fallback={<div>{/*加载中...*/}</div>}>
                <Routes>
                    {/* Game01 */}
                    <Route path="/" element={<Game01 />} />
                    {/* DNF */}
                    <Route path="/dnf" element={<DNF />} />
                    {/* AirplaneFighter */}
                    <Route path="/AirplaneFighter" element={<AirplaneFighter />} />
                    {/* Gasp */}
                    <Route path="/gsap" element={<Gsap />} />
                    {/* canvas */}
                    <Route path="/canvasPage" element={<CanvasPage />} />
                    {/* three压力测试 */}
                    <Route path="/three" element={<Three />} />
                    {/* three模型导入 */}
                    <Route path="/threeTest" element={<ThreeTest />} />
                    
                </Routes>
            </Suspense>
            <div ref={listRef} 
            onMouseEnter={() => {
                if(listRef.current){
                    listRef.current.style.maxHeight = listRef.current.style.getPropertyValue('--full-height');
                }
            }}
            onMouseLeave={() => {
                if(listRef.current){
                    listRef.current.style.maxHeight = '40px';
                }
            }} className="app-list">
                <button className={`app-list-btn ${currentPath === '/' ? 'app-list-btn-select' : ''}`} onClick={() => {navigateList('/')}}>方块大冒险</button>
                <button className={`app-list-btn ${currentPath === '/dnf' ? 'app-list-btn-select' : ''}`} onClick={() => {navigateList('/dnf')}}>DNF</button>
                <button className={`app-list-btn ${currentPath === '/AirplaneFighter' ? 'app-list-btn-select' : ''}`} onClick={() => {navigateList('/AirplaneFighter')}}>飞机大战</button>
                <button className={`app-list-btn ${currentPath === '/gsap' ? 'app-list-btn-select' : ''}`} onClick={() => {navigateList('/gsap')}}>Gsap</button>
                <button className={`app-list-btn ${currentPath === '/three' ? 'app-list-btn-select' : ''}`} onClick={() => {navigateList('/three')}}>压力测试</button>
                <button className={`app-list-btn ${currentPath === '/threeTest' ? 'app-list-btn-select' : ''}`} onClick={() => {navigateList('/threeTest')}}>GLB模型</button>
                <button className={`app-list-btn ${currentPath === '/canvasPage' ? 'app-list-btn-select' : ''}`} onClick={() => {navigateList('/canvasPage')}}>Canvas</button>
            </div>
        </>
    )
}

export default App
