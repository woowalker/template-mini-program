// pages/contacts/contacts.js
const app = getApp()

Page({
  data: {
    list: []
  },

  onLoad() {
    this.getQuestions()
  },

  getQuestions() {
    app.showLoading()
    app.$api['mine/questions']()
      .then(res => {
        this.setData({ list: res })
      })
      .finally(() => {
        app.hideLoading()
      })
  }
})