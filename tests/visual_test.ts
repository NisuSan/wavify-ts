import { createWaves } from '../src/index'
import { IWavifyParams } from '../src/interfaces'
import '../styles.css'

const options: Array<IWavifyParams> = [
  {
    height: 440,
    bones: 4,
    amplitude: 60,
    color: '#B289EF',
    speed: .15
  },
  {
    height: 430,
    bones: 3,
    amplitude: 40,
    color: 'rgba(150, 97, 255, .8)',
    speed: .25
  }
]

const waves = createWaves(options, '#app')
console.log(waves)
