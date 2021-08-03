const g_socket = {
  socket: null,
  onopen: [],
  onmessage: [],
  onerror: [],
  onclose: [],
  reconnectTimer: -1
}

class GlobalSocket {
  // WebSocket 实例
  _socket = null
  _socketUrl = undefined
  // 自动重连
  _autoReconnect = false
  _reconnectInterval = undefined
  _reconnectCount = 1

  constructor({ url, autoReconnect = true, reconnectInterval }) {
    this._socketUrl = url
    // 重连配置
    this._autoReconnect = autoReconnect
    this._reconnectInterval = reconnectInterval
    // 构建 socket 实例
    clearTimeout(g_socket.reconnectTimer)
    this._constructorSocket()
  }

  _constructorSocket = () => {
    this._socket = g_socket.socket = wx.connectSocket({ url: this._socketUrl })
    this._socket.onOpen(() => {
      this._evalFuncs('onopen', this._socket)
    })
    this._socket.onMessage((evt) => {
      this._evalFuncs('onmessage', evt.data)
    })
    this._socket.onError((err) => {
      this._evalFuncs('onerror', err)
    })
    this._socket.onClose((evt) => {
      this._evalFuncs('onclose', evt.code, evt.reason)
      this._autoReconnect && this._reconnect()
    })
  }

  /**
   * 执行 socket 监听的所有事件
   * @param {string} type
   * @param  {...any} restProps
   */
  _evalFuncs = (type, ...restProps) => {
    const funcs = g_socket[type].filter(item => !!item)
    Array.isArray(funcs) && funcs.forEach(func => func instanceof Function && func(...restProps))
  }

  /**
   * 生成重连时间，重连次数越多，重连时间越长，
   * 比如第一次重连 1000ms，第二次就是 3000ms，第三次就是 7000ms
   * @param {number} count 重连次数
   * @returns 重连的时间
   */
  _generateInterval = (count) => {
    return this._reconnectInterval || Math.min(30, Math.pow(2, count) - 1) * 1000
  }

  /**
   * socket 重连
   */
  _reconnect = () => {
    g_socket.reconnectTimer = setTimeout(() => {
      this._reconnectCount++
      this._constructorSocket()
    }, this._generateInterval(this._reconnectCount))
  }
}

class Socket {
  // WebSocket 实例
  _socket = null
  _socketEvtIndex = -1
  // onopen 方法
  onopen = null

  /**
   * socket 实例
   * @param {Object} props
   * @param {string} props.url
   * @param {Function} props.onopen
   * @param {Function} props.onmessage
   * @param {Function} props.onerror
   * @param {Function} props.onclose
   * @param {boolean} props.newSocket 是否重新 new 一个 WebSocket 实例
   * @param {boolean} props.autoReconnect 是否重连，默认 true
   * @param {number} props.reconnectInterval 定时重连时间
   */
  constructor(props) {
    if (!props.url) return

    const { onopen, onmessage, onerror, onclose, newSocket = false, ...restProps } = props
    /**
     * 全局 g_socket 始终保持只有一个，
     * 只有在指定了 newSocket 时候，才会将 g_socket 对应新的 url 进行更新，
     * 否则 g_socket 永远保持第一次 new Socket 时创建的 WebSocket 实例
     */
    let globalSocket = null
    if (!g_socket.socket || newSocket) {
      globalSocket = new GlobalSocket({ ...restProps })
    }
    this._socket = globalSocket ? globalSocket._socket : g_socket.socket
    // 此处特殊处理 onopen，是因为需要在 reconnect 之后，将 Socket 实例的 _socket 属性指向最新的 WebSocket
    g_socket.onopen.push(this._onopen)
    g_socket.onmessage.push(onmessage)
    g_socket.onerror.push(onerror)
    g_socket.onclose.push(onclose)
    this._socketEvtIndex = g_socket.onopen.length - 1

    // 如果已经存在 g_socket，则判断 opened 状态，opened 则直接调用 onopen 方法
    this.onopen = onopen
    this._socket.readyState === 1 && onopen instanceof Function && onopen(this._socket)
  }

  _onopen = (socketIns) => {
    // 保证新的 WebSocket opened 之后，所有 Socket 实例的 _socket 属性指向最新的 WebSocket
    this._socket = socketIns
    this.onopen instanceof Function && this.onopen(socketIns)
  }

  send = (data) => {
    if (!this._socket) return
    this._socket.send(data)
  }

  close = () => {
    if (this._socketEvtIndex === -1) return
    g_socket.onopen.splice(this._socketEvtIndex, 1, undefined)
    g_socket.onmessage.splice(this._socketEvtIndex, 1, undefined)
    g_socket.onerror.splice(this._socketEvtIndex, 1, undefined)
    g_socket.onclose.splice(this._socketEvtIndex, 1, undefined)
  }
}

export default Socket
