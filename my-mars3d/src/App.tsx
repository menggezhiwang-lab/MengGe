import { Suspense,lazy } from 'react'
import { HashRouter,Routes,Route } from 'react-router-dom'
import './App.css'

const Mars = lazy(() => import('./Mars'))
function App() {
    //return <Mars/>

  return (
    <>
        <HashRouter>
            <Suspense fallback={<div className="loading">加载中...</div>}>
                <Routes>
                    <Route path="/" element={<Mars />} />
                </Routes>
            </Suspense>
        </HashRouter>
    </>
  )
}

export default App
