var postsData = require('../../../data/posts-data.js')
var app =getApp()
Page({
  //本页面数据
  data: {
    isPlayingMusic:false
  },
  //页面加载函数
  onLoad: function (option) {
    //接受post页面传过来的数据（id）
    var postId = option.id;
    //将接收的id设置到当前数据库中
    this.data.currentPostId = postId;
    //从基础数据库data中调数据
    var postData = postsData.postList[postId];
    this.setData({
      postData: postData
    });
    //从缓存中取出posts_collected对象数组
    var postsCollected = wx.getStorageSync('posts_collected');
    if (postsCollected) {
      var postCollected = postsCollected[postId];
      this.setData({
        collected: postCollected
      })
    }
    else {
      var postsCollected = {};
      postsCollected[postId] = false;
      wx.setStorageSync('posts_collected', postsCollected);
    }
      var that = this;
    //监听全局变量，以便于音乐播放图标显示正确
    if(app.globalData.g_isPlayingMusic&&app.globalData.g_currentMusicPostId===postId){
      that.setData({
        isPlayingMusic: true
      });
    }
    //监听音乐播放暂停，为了使播放图标和总控开关匹配
    wx.onBackgroundAudioPause(function () {
      that.setData({
        isPlayingMusic: false
      });
      app.globalData.g_isPlayingMusic=false;
      app.globalData.g_currentMusicPostId=null;
    });
    //监听音乐播放播放
    wx.onBackgroundAudioPlay(function () {
      that.setData({
        isPlayingMusic: true
      });
      app.globalData.g_isPlayingMusic=true;
    });
  
    //监听音乐停止，实现循环播放的功能
    wx.onBackgroundAudioStop(function () {
      wx.playBackgroundAudio({
        dataUrl: postData.music.url,
        title: postData.music.title,
        coverImgUrl: postData.music.coverImg,
      });
    });
  },
  //收藏功能的实现
  onCollectionTap: function (event) {
    var postsCollected = wx.getStorageSync('posts_collected');
    var postCollected = postsCollected[this.data.currentPostId];
    postCollected = !postCollected;
    postsCollected[this.data.currentPostId] = postCollected;
    wx.setStorageSync('posts_collected', postsCollected);
    this.setData({
      collected: postCollected
    })
    wx.showToast({
      title: postCollected ? "收藏成功!" : "取消成功!"
    })
  },

  //文章分享功能的实现
  onShareTap: function (event) {
    var itemList = [
      "分享给微信好友",
      "分享到朋友圈",
      "分享给QQ好友",
      "分享到微博"
    ];
    wx.showActionSheet({
      itemList: itemList,
      itemColor: "#405f80",
      success: function (res) {
        wx.showModal({
          title: "用户" + itemList[res.tapIndex],
          content: "用户是否取消？" + res.cancel + "现在无法实现分享功能，什么时候能实现还不知道"
        })
      }
    })
  },

  //音乐播放功能的实现
  onMusicTap: function (event) {
    var isPlayingMusic = this.data.isPlayingMusic;
    //从基础数据库data中调数据
    var postData = postsData.postList[this.data.currentPostId];
    if (isPlayingMusic) {
      wx.pauseBackgroundAudio();
      this.setData({
        postData: postData,
        isPlayingMusic: false
      });
    } else {
      wx.playBackgroundAudio({
        dataUrl: postData.music.url,
        title: postData.music.title,
        coverImgUrl: postData.music.coverImg,
      });
      this.setData({
        postData: postData,
        isPlayingMusic: true
      });
    }

  },

  //页面分享功能的实现
  onShareAppMessage: function () {
    return {
      title: '自定义分享标题',
      path: '/pages/posts/post-detail?id=123'
    }
  },
})