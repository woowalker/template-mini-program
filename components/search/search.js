// components/search/search.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    placeholder: String,
    style: String
  },

  options: {
    addGlobalClass: true
  },

  /**
   * 组件的初始数据
   */
  data: {
    searchKey: ''
  },

  /**
   * 组件的方法列表
   */
  methods: {
    /**
     * 处理搜索输入
     * @param {Object} param0 
     */
    handleSearchInput: function ({ detail }) {
      this.setData({ searchKey: detail.value })
    },

    /**
     * 发起搜索，搜索时直接判断用户是否有位置权限，
     * 没有权限则不进行搜索
     */
    handleSearch: function () {
      this.triggerEvent('search', { value: this.data.searchKey })
    }
  }
})
