export default {
  // 请求 host
  baseUrl: 'http://192.168.2.121:8800',
  socketUrl: 'ws://192.168.2.121:3241/wss',
  socketUrl3242: 'ws://192.168.2.121:3242/wss',
  // 修正路径，可用这个控制接口版本号，比如 /apiv2
  prefixPath: '/api',
  // this.$api['common/getUserInfo'] 中的 common/getUserInfo 分隔符，分割命名空间和接口
  sep: '/',
  // 是否开启接口 console 输出
  debug: false
}