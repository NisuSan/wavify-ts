import { IWavifyOutput, IWavifyParams, IWavifyPoints, IWavifyUpdateColorParams } from './interfaces'
import { TweenMax, Power1 } from 'gsap'
import { debounce } from 'ts-debounce'

export function wavify(wave: HTMLOrSVGElement, options: IWavifyParams): IWavifyOutput {
  let settings: IWavifyParams = Object.assign(
    {},
    {
      container: options.container,
      height: 94,
      heightLenght: 'rem',
      amplitude: 100,
      speed: 0.15,
      bones: 3,
      color: 'rgba(255,255,255, 0.20)'
    } as IWavifyParams,
    options
  )

  const containerRect: DOMRect = document.querySelector(settings.container || 'body')!.getBoundingClientRect()
  let lastUpdate: number = 0
  let totalTime: number = 0
  let animationInstance: number = 0
  let tweenMaxInstance: TweenMax|null = null

  function rebuilSettings(params: IWavifyParams) {
    if(settings.container !== params.container) {
      throw new Error('Avoid setting new container for logic purpose')
    }

    settings = Object.assign({}, settings, params)
  }

  function drawPoints(factor: number) {
    const points = [] as Array<IWavifyPoints>

    for (let i = 0; i <= settings.bones!; i++) {
      const x = (i / settings.bones!) * containerRect.width
      const sinSeed = (factor + (i + (i % settings.bones!))) * settings.speed! * 100
      const sinHeight = Math.sin(sinSeed / 100) * settings.amplitude!
      const yPos = Math.sin(sinSeed / 100) * sinHeight + settings.height!
      points.push({ x: x, y: yPos })
    }

    return points
  }

  function drawPath(points: Array<IWavifyPoints>) {
    let SVGString: string = 'M ' + points[0].x + ' ' + points[0].y

    const cp0 = {
      x: (points[1].x - points[0].x) / 2,
      y: points[1].y - points[0].y + points[0].y + (points[1].y - points[0].y)
    }

    SVGString +=
      ' C ' +
      cp0.x +
      ' ' +
      cp0.y +
      ' ' +
      cp0.x +
      ' ' +
      cp0.y +
      ' ' +
      points[1].x +
      ' ' +
      points[1].y

    let prevCp = cp0
    let inverted = -1

    for (let i = 1; i < points.length - 1; i++) {
      const cp1 = {
        x: points[i].x - prevCp.x + points[i].x,
        y: points[i].y - prevCp.y + points[i].y
      }

      SVGString +=
        ' C ' +
        cp1.x +
        ' ' +
        cp1.y +
        ' ' +
        cp1.x +
        ' ' +
        cp1.y +
        ' ' +
        points[i + 1].x +
        ' ' +
        points[i + 1].y

      prevCp = cp1;
      inverted = -inverted
    }

    SVGString += ' L ' + containerRect.width + ' ' + containerRect.height
    SVGString += ' L 0 ' + containerRect.height + ' Z'
    return SVGString;
  }

  function draw() {
    const now = window.Date.now()

    if (lastUpdate) {
      const elapsed = (now - lastUpdate) / 1000
      lastUpdate = now
      totalTime += elapsed

      const factor = totalTime * Math.PI;
      tweenMaxInstance = TweenMax.to(wave, settings.speed!, {
        attr: {
          d: drawPath(drawPoints(factor))
        },
        ease: Power1.easeInOut
      });
    } else {
      lastUpdate = now
    }

    animationInstance = requestAnimationFrame(draw)
  }

  const redraw = debounce(function() {
    pause()

    totalTime = 0
    lastUpdate = 0

    play();
  }, 250)

  function boot() {
    if (!animationInstance) {
      tweenMaxInstance = TweenMax.set(wave, { attr: { fill: settings.color! } })

      play();
      window.addEventListener('resize', redraw)
    }
  }

  function reboot(options: IWavifyParams) {
    kill();

    if (typeof options !== undefined) rebuilSettings(options)
    tweenMaxInstance = TweenMax.set(wave, { attr: { fill: settings.color! } })

    play();
    window.addEventListener('resize', redraw)
  }

  function play() {
    if (!animationInstance) {
      animationInstance = requestAnimationFrame(draw)
    }
  }

  function pause() {
    if (animationInstance) {
      cancelAnimationFrame(animationInstance);
      animationInstance = 0
    }
  }

  function kill() {
    if (animationInstance) {
      pause();
      tweenMaxInstance?.kill()

      tweenMaxInstance = TweenMax.set(wave, {
        x: 0,
        y: 0,
        rotation: 0,
        opacity: 0,
        clearProps: 'all',
        attr: {
          d: 'M0,0',
          fill: ''
        }
      })

      window.removeEventListener('resize', redraw)
      animationInstance = 0
    }
  }

  function updateColor(options: IWavifyUpdateColorParams) {
    if (typeof options.timing === undefined) {
      options.timing = 1
    }

    if (typeof options.color === undefined) {
      options.color = settings.color!
    }

    tweenMaxInstance = TweenMax.to(wave, options.timing, {
      attr: { fill: options.color },
      onComplete: options.onComplete
    });
  }

  boot()

  return {
    reboot: reboot,
    play: play,
    pause: pause,
    kill: kill,
    updateColor: updateColor
  }
}

export function createWaves(options: Array<IWavifyParams>, container?: string): Array<IWavifyOutput> {
  if(options.length == 0) return [] as Array<IWavifyOutput>

  const containerElement: HTMLDivElement | HTMLBodyElement = document.querySelector(container || 'body')!
  const waves: Array<IWavifyOutput> = []

  let svgs: string = ''
  for (let index = 0; index < options.length; index++) {
    svgs += `
      <svg width="100%" height="100%" version="1.1" xmlns="http://www.w3.org/2000/svg" 
        style="position: absolute; bottom:0; z-index: ${index+1};"
      >
        <defs></defs>
        <path id="c-wave-${index}" d=""/>
    </svg>`
  }

  containerElement.innerHTML = svgs

  for (let index = 0; index < options.length; index++) {    
    const setup = options[index]

    const waveSvg: HTMLElement | null = document.getElementById(`c-wave-${index}`)
    if(!waveSvg) throw Error(`Wave wiht index ${index} is null`)

    waves.push(wavify(waveSvg, setup))
  }

  return waves
}