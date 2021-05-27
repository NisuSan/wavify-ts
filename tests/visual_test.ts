import { createWaves } from '../src/index'
import { ICreateWavesParams } from '../src/interfaces'
import '../styles.css'

const options: ICreateWavesParams = {
  container: '#app',
  wavesSetup: [
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
}

const waves = createWaves(options)
console.log(waves)
