// components/cell-input/cell-input.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    title: {
      type: String
    },
    focus: {
      type: Boolean,
      value: false
    },
    type: {
      type: String,
      value: 'text'
    },
    value: {
      type: null
    },
    placeholder: {
      type: String,
      value: '请输入'
    }
  },

  options: {
    addGlobalClass: true,
    multipleSlots: true
  },

  /**
   * 组件的初始数据
   */
  data: {
  },

  /**
   * 组件的方法列表
   */
  methods: {
    handleFocus: function (evt) {
      this.triggerEvent('focus', evt)
    },

    handleInput: function (evt) {
      this.triggerEvent('input', evt.detail)
    }
  }
})
