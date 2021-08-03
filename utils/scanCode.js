export default function scanCode() {
  return wx.scanCode().then(res => {
    const innerAudioContext = wx.createInnerAudioContext()
    innerAudioContext.autoplay = true
    innerAudioContext.src = '/images/scan-code/scan-success.mp3'
    innerAudioContext.onPlay(() => {
      wx.vibrateShort({ type: 'heavy' })
    })
    return res
  })
}