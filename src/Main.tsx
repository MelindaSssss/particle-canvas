import { useEffect, useRef, useState } from 'react'
import './Main.css'

const Main = () => {
  // 获取canvas画布
  const canvasDom = useRef<HTMLCanvasElement | null>(null)
  // 获取上下文
  let canvasContext = useRef<CanvasRenderingContext2D | null>(null)
  /* 👇 所有的类型定义 */
  // canvas 高宽数据 总画布大小
  const canvasOriginWidth = 450
  const canvasOriginHeight = 450

  // 设置粒子动画时长
  const animateTime = 40
  const opacityStep = 1 / animateTime

  /** 中心影响的半径 */
  const Radius = 40
  /** 排斥/吸引 力度 */
  const Inten = 1.5

  /** 粒子类 */
  class Particle {
    x: number // 粒子x轴的初始位置
    y: number // 粒子y轴的初始位置
    totalX: number // 粒子x轴的目标位置
    totalY: number // 粒子y轴的目标位置
    mx?: number // 粒子x轴需要移动的距离
    my?: number // 粒子y轴需要移动的距离
    vx?: number // 粒子x轴移动速度
    vy?: number // 粒子y轴移动速度
    time: number // 粒子移动耗时
    r: number // 粒子的半径
    color: number[] // 粒子的颜色
    opacity: number // 粒子的透明度
    constructor(totalX: number, totalY: number, time: number, color: number[]) {
      // 设置粒子的初始位置x、y，目标位置totalX、totalY，总耗时time
      this.x = (Math.random() * canvasOriginWidth) >> 0
      this.y = (Math.random() * canvasOriginHeight) >> 0
      this.totalX = totalX
      this.totalY = totalY
      this.time = time
      // 设置粒子的颜色和半径
      this.r = 1.2
      this.color = [...color]
      this.opacity = 0
    }
    // 在画布中绘制粒子
    draw() {
      canvasContext.current!.fillStyle = `rgba(${this.color.toString()})`
      canvasContext.current!.fillRect(this.x, this.y, this.r * 2, this.r * 2)
      canvasContext.current!.fill()
    }
    /** 更新粒子
     * @param {number} mouseX 鼠标X位置
     * @param {number} mouseY 鼠标Y位置
     */
    update(mouseX?: number, mouseY?: number) {
      // 设置粒子需要移动的距离
      this.mx = this.totalX - this.x
      this.my = this.totalY - this.y
      // 设置粒子移动速度
      this.vx = this.mx / this.time
      this.vy = this.my / this.time
      // 计算粒子与鼠标的距离
      if (mouseX && mouseY) {
        let dx = mouseX - this.x
        let dy = mouseY - this.y
        let distance = Math.sqrt(dx ** 2 + dy ** 2)
        // 粒子相对鼠标距离的比例 判断受到的力度比例
        let disPercent = Radius / distance
        // 设置阈值 避免粒子受到的斥力过大
        disPercent = disPercent > 7 ? 7 : disPercent
        // 获得夹角值 正弦值 余弦值
        let angle = Math.atan2(dy, dx)
        let cos = Math.cos(angle)
        let sin = Math.sin(angle)
        // 将力度转换为速度 并重新计算vx vy
        let repX = cos * disPercent * -Inten
        let repY = sin * disPercent * -Inten
        this.vx += repX
        this.vy += repY
      }
      this.x += this.vx
      this.y += this.vy
      if (this.opacity < 1) this.opacity += opacityStep
    }
    // 切换粒子
    change(x: number, y: number, color: number[]) {
      this.totalX = x
      this.totalY = y
      this.color = [...color]
    }
  }

  /** Logo图片类 */
  class LogoImg {
    src: string
    name: string
    particleData: Particle[] // 用于保存筛选后的粒子
    constructor(src: string, name: string) {
      this.src = src
      this.name = name
      this.particleData = []
      let img = new Image()
      img.crossOrigin = ''
      img.src = src
      // canvas 解析数据源获取粒子数据
      img.onload = () => {
        // 获取图片像素数据
        const tmp_canvas = document.createElement('canvas') // 创建一个空的canvas
        const tmp_ctx = tmp_canvas.getContext('2d')
        const imgW = canvasOriginWidth

        /* ~是按位取反的意思，计算机里面处理二进制数据时候的非，
      ~~就是再转回来，利用两个按位取反的符号，进行类型的转换，转换成数字符号。
      而在计算机里面的^=是异或运算，相同取0，不同取1. */
        const imgH = ~~(canvasOriginWidth * (img.height / img.width))
        tmp_canvas.width = imgW
        tmp_canvas.height = imgH

        /*
      ctx.drawImage(图片对象, x位置, y位置)
      图片的原始比例，图片的左上角在画布的(x, y)

      ctx.drawImage(图片对象, x位置, y位置, 宽度, 高度)
      图片的左上角在画布的(x, y)，指定图片的宽高

      ctx.drawImage(图片对象, 图像裁剪的x位置, 图像裁剪的y位置, 裁剪的宽度, 裁剪的高度, x位置, y位置, 宽度, 高度)
      将图片裁剪出来部分的左上角位于画布的(x,y)，且裁剪出来的图像宽高方所到指定的宽高

      */
        // tmp_ctx?.drawImage(img, 0, 0) // 将图片绘制到canvas中
        tmp_ctx?.drawImage(img, 0, 0, imgW, imgH) // 将图片绘制到canvas中

        /*
        ctx.getImageData(sx, sy, sw, sh);
        参数
        sx：将要被提取的图像数据矩形区域的左上角 x 坐标。
        sy：将要被提取的图像数据矩形区域的左上角 y 坐标。
        sw：将要被提取的图像数据矩形区域的宽度。
        sh：将要被提取的图像数据矩形区域的高度。
        返回值： 返回的是一个ImageData对象，该对象包含了三个只读属性：
        属性	含义
        ImageData.width	ImageData的宽度，用像素表示
        ImageData.height	ImageData的高度，用像素表示
        ImageData.data	  类型为 Uint8ClampedArray 的一维数组，
                          每四个数组元素代表了一个像素点的RGBA信息，每个元素数值介于0~255
        */
        const imgData = tmp_ctx?.getImageData(0, 0, imgW, imgH).data // 获取像素点数据
        tmp_ctx?.clearRect(0, 0, canvasOriginWidth, canvasOriginHeight)

        // 筛选像素点
        for (let y = 0; y < imgH; y += 5) {
          for (let x = 0; x < imgW; x += 5) {
            // 像素点的序号
            const index = (x + y * imgW) * 4
            // 在数组中对应的值
            const r = imgData![index]
            const g = imgData![index + 1]
            const b = imgData![index + 2]
            const a = imgData![index + 3]
            const sum = r + g + b + a
            // 筛选条件
            if (sum >= 100) {
              const particle = new Particle(x, y, animateTime, [r, g, b, a])
              this.particleData.push(particle)
            }
          }
        }
      }
    }
  }

  /** 画布类 */
  class ParticleCanvas {
    canvasEle: HTMLCanvasElement
    ctx: CanvasRenderingContext2D
    width: number
    height: number
    ParticleArr: Particle[]
    mouseX?: number // 鼠标X轴位置
    mouseY?: number // 鼠标Y轴位置
    constructor(target: HTMLCanvasElement) {
      // 设置画布 获取画布上下文
      this.canvasEle = target
      this.ctx = target.getContext('2d') as CanvasRenderingContext2D
      this.width = target.width
      this.height = target.height
      this.ParticleArr = []
      // 监听鼠标移动
      this.canvasEle.addEventListener('mousemove', (e) => {
        const { left, top } = this.canvasEle.getBoundingClientRect()
        const { clientX, clientY } = e
        this.mouseX = clientX - left
        this.mouseY = clientY - top
      })
      this.canvasEle.onmouseleave = () => {
        this.mouseX = 0
        this.mouseY = 0
      }
    }
    // 改变图片 如果已存在图片则根据情况额外操作
    changeImg(img: LogoImg) {
      if (this.ParticleArr.length > 0) {
        // 获取新旧两个粒子数组与它们的长度
        let newPrtArr = img.particleData
        let newLen = newPrtArr.length
        let arr = this.ParticleArr
        let oldLen = arr.length

        // 调用change修改已存在粒子
        for (let idx = 0; idx < newLen; idx++) {
          const { totalX, totalY, color } = newPrtArr[idx]
          if (arr[idx]) {
            // 找到已存在的粒子 调用change 接收新粒子的属性
            arr[idx].change(totalX, totalY, color)
          } else {
            // 新粒子数组较大 生成缺少的粒子
            arr[idx] = new Particle(totalX, totalY, animateTime, color)
          }
        }

        // 新粒子数组较小 删除多余的粒子
        if (newLen < oldLen) this.ParticleArr = arr.splice(0, newLen)
        arr = this.ParticleArr
        let tmp_len = arr.length
        // 随机打乱粒子最终对应的位置 使切换效果更自然
        while (tmp_len) {
          // 随机的一个粒子 与 倒序的一个粒子
          let randomIdx = ~~(Math.random() * tmp_len--)
          let randomPrt = arr[randomIdx]
          let { totalX: tx, totalY: ty, color } = randomPrt

          // 交换目标位置与颜色
          randomPrt.totalX = arr[tmp_len].totalX
          randomPrt.totalY = arr[tmp_len].totalY
          randomPrt.color = arr[tmp_len].color
          arr[tmp_len].totalX = tx
          arr[tmp_len].totalY = ty
          arr[tmp_len].color = color
        }
      } else {
        this.ParticleArr = img.particleData.map(
          (item) =>
            new Particle(item.totalX, item.totalY, animateTime, item.color),
        )
      }
    }
    drawCanvas() {
      this.ctx.clearRect(0, 0, this.width, this.height)
      this.ParticleArr.forEach((particle) => {
        particle.update(this.mouseX, this.mouseY)
        particle.draw()
      })
      window.requestAnimationFrame(() => this.drawCanvas())
    }
  }
  /* 👆 所有的类型定义 */

  // 图片数据
  const [logoImgs, setLogoImgs] = useState<LogoImg[]>([])

  // webpack处理后的图片数据
  const [imgCache, setImgCache] = useState<any>(null)
  // 标记激活logo
  const [activeLogo, setActiveLogo] = useState<{ name: string; src: string }>()
  /** canvas实体对象 */
  const [particleCanvasEntity, setParticleCanvasEntity] = useState<
    ParticleCanvas
  >()

  /**
   *
   * @description 点击logo数据触发图片更新
   * @param {ParticleCanvas} prt_canvas
   * @param {LogoImg} imgInfo
   */
  const clickLogo = (prt_canvas: ParticleCanvas, imgInfo: LogoImg) => {
    prt_canvas.changeImg(imgInfo)
    setActiveLogo((prev) => ({
      ...prev,
      ...imgInfo,
    }))
  }

  /**
   *
   * @description dom渲染完成后取到原始图片数据
   */
  const getImgData = () => {
    let resultImgs: any[] = []
    //引入图片数据
    let cache = {}
    //@ts-ignore
    const context = require.context('./assets/', true, /\.png$/)
    context.keys().forEach((key: string | number) => {
      //@ts-ignore
      const keyArr = key.split('/')
      const result = keyArr[1].split('.')[0]
      //@ts-ignore
      cache[result] = require('./assets/' + keyArr[1])
      resultImgs.push(new LogoImg(require('./assets/' + keyArr[1]), result))
    })

    setImgCache(cache)
    setLogoImgs(resultImgs)
  }
  useEffect(() => {
    // 将logo数据实例化为logoImg对象
    getImgData()
  }, [])

  useEffect(() => {
    if (canvasDom.current) {
      const tempText = canvasDom.current?.getContext('2d')
      canvasContext.current = tempText
      // 给画布实体赋值
      const result = new ParticleCanvas(canvasDom.current)
      setParticleCanvasEntity(result)
      result?.drawCanvas()
    }
  }, [])

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <canvas
        // @ts-ignore
        ref={canvasDom}
        id="mycanvas"
        width={canvasOriginWidth}
        height={canvasOriginHeight}
        style={{
          margin: '10px 34% 0 34%',
          boxSizing: 'border-box',
          border: '1px solid #614949',
        }}
      ></canvas>

      <div className="logo-options-container">
        {logoImgs.map((item, index) => {
          const imgSrc = imgCache[item.name]
          if (item.name === 'mouse' || item.name === 'rhodes') return null
          return (
            <div
              //@ts-ignore
              onClick={() => clickLogo(particleCanvasEntity, item)}
              key={index.toString()}
              className={activeLogo?.name === item.name ? 'logo-item' : ''}
            >
              <img
                src={imgSrc}
                alt=""
                id={item.name}
                className="item-picture"
                crossOrigin="anonymous"
                width={200}
                height={200}
              />
              <div className="item-desc">{item.name}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Main
