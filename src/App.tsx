import { useEffect } from 'react'
import './App.css'
import Main from './Main'
function App() {
  useEffect(() => {
    // 处理鼠标跟随效果
    const body = document.querySelector('body')
    const element = document.getElementById('pointer')
    // const elementEffect = document.getElementById('pointer-effect')

    function setPosition(x: number, y: number) {
      //@ts-ignore
      element.style.top = y - 1 + 'px'
      //@ts-ignore
      element.style.left = x - 1 + 'px'
    }
    //@ts-ignore
    body.onmousemove = (e) =>
      window.requestAnimationFrame(() => setPosition(e.clientX, e.clientY))
    //@ts-ignore
    body.onmouseenter = (e) => element.classList.remove('hidden')
    //@ts-ignore
    body.onmouseleave = (e) => element.classList.add('hidden')
    //@ts-ignore
    body.onmouseover = (e) =>
      //@ts-ignore
      e.target.dataset.cursor || e?.fromElement?.dataset.cursor
        ? element?.classList.add('hover')
        : element?.classList.remove('hover')
  }, [])
  return (
    <div className="App">
      {/*  主页面 调整 鼠标跟随效果 */}

      <div id="app"></div>
      <div id="pointer"></div>
      <div id="pointer-effect"></div>

      {/* 主页面 */}
      <div className="bg">
        <Main />
      </div>
    </div>
  )
}

export default App
