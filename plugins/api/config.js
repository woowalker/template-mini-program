export default {
  // 请求 host
  baseUrl: 'https://www.optiems.com',
  socketUrl: 'ws://www.optiems.com/wss',
  socketUrl3242: 'ws://www.optiems.com/wsm',
  // 修正路径，可用这个控制接口版本号，比如 /apiv2
  prefixPath: '/api',
  // this.$api['common/getUserInfo'] 中的 common/getUserInfo 分隔符，分割命名空间和接口
  sep: '/',
  // 是否开启接口 console 输出
  debug: false
}