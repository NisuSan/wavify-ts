export interface IWavifyParams {
  container?: string,
  height?: number,
  amplitude?: number,
  speed?: number,
  bones?: number,
  color?: string
}

export interface IWavifyUpdateColorParams {
  timing: number,
  color: string,
  onComplete(): void
}

export interface IWavifyOutput {
  reboot(options: IWavifyParams): void,
  play(): void,
  pause(): void,
  kill(): void,
  updateColor(options: IWavifyParams): void
}

export type IWavifyPoints = { x: number, y: number }