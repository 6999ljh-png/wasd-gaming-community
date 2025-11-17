import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'zh-CN' | 'zh-TW' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  'zh-CN': {
    // Navigation
    'nav.submit': '投稿',
    'nav.home': '主页',
    'nav.personal': '个人',
    'nav.leaderboard': '排行榜',
    'nav.forum': '论坛',
    'nav.friends': '好友',
    
    // Theme
    'theme.dark': '黑夜模式',
    'theme.light': '白天模式',
    
    // Language
    'lang.zh-CN': '简体中文',
    'lang.zh-TW': '繁体中文',
    'lang.en': 'English',
    
    // Home Page
    'home.title': '记录每一场精彩瞬间',
    'home.subtitle': '你的专属游戏追踪平台',
    'home.search': '搜索游戏',
    'home.topPlayers': '全球前三玩家',
    'home.topPlayersDesc': '顶尖玩家排行榜',
    'home.rank': '排名',
    'home.totalScore': '总分',
    'home.viewProfile': '查看资料',
    
    // Personal Page
    'personal.level': '等级',
    'personal.exp': '经验值',
    'personal.editProfile': '编辑资料',
    'personal.stats': '统计数据',
    'personal.gamesCount': '游戏数量',
    'personal.postsCount': '发帖数量',
    'personal.commentsCount': '评论数量',
    'personal.daysJoined': '加入天数',
    'personal.gameLibrary': '游戏库',
    'personal.loadGame': '加载游戏',
    'personal.myPosts': '我的帖子',
    'personal.loadPosts': '加载帖子',
    'personal.playTime': '游戏时长',
    'personal.noPosts': '暂无帖子',
    'personal.noPostsDesc': '点击"加载帖子"查看',
    'personal.noGames': '点击"加载游戏"',
    'personal.noGamesDesc': '首看',
    
    // Leaderboard
    'leaderboard.title': '排行榜',
    'leaderboard.desc': '查看全球顶尖玩家排名',
    'leaderboard.global': '全球排名',
    'leaderboard.friends': '好友排名',
    'leaderboard.weekly': '本周排名',
    'leaderboard.score': '分数',
    'leaderboard.loading': '数据加载中...',
    
    // Forum
    'forum.title': '游戏讨论',
    'forum.desc': '分享你的想法和看法',
    'forum.newPost': '新帖子',
    'forum.justNow': '刚刚',
    
    // Friends
    'friends.title': '好友',
    'friends.desc': '管理你的游戏社区',
    'friends.addFriend': '添加好友',
    'friends.all': '所有好友',
    'friends.online': '在线',
    'friends.requests': '请求',
    'friends.search': '搜索好友...',
    'friends.online.status': '在线',
    'friends.myFriends': '我的好友',
    'friends.noFriends': '还没有好友',
    'friends.loginRequired': '请先登录查看好友',
    'friends.friend': '位好友',
    'friends.friends': '位好友',
    
    // Bookmarks
    'bookmarks.title': '我的收藏',
    'bookmarks.subtitle': '已保存的帖子',
    'bookmarks.bookmark': '收藏',
    'bookmarks.bookmarked': '已收藏',
    'bookmarks.unbookmark': '取消收藏',
    'bookmarks.loginRequired': '请先登录才能收藏帖子',
    'bookmarks.noBookmarks': '还没有收藏任何帖子',
    'bookmarks.hint': '点击帖子上的收藏图标来保存',
    'bookmarks.bookmarks': '个收藏',
    
    // Tags
    'tags.trending': '热门标签',
    'tags.noTags': '暂无标签',
    'tags.placeholder': '添加标签... (按回车)',
    'tags.hint': '用回车、逗号或空格分隔标签',
    'tags.filtering': '筛选标签',
    
    // Submit Dialog
    'submit.title': '投稿',
    'submit.desc': '分享你的游戏体验',
    'submit.text': '文字稿',
    'submit.textDesc': '发布游戏评测、攻略或心得',
    'submit.video': '视频稿',
    'submit.videoDesc': '分享游戏视频或直播精彩片段',
    'submit.textPost': '文字投稿',
    'submit.videoPost': '视频投稿',
    'submit.backToSelect': '返回选择',
    'submit.gameName': '游戏名称',
    'submit.gameNamePlaceholder': '请输入游戏名称...',
    'submit.title.label': '标题',
    'submit.titlePlaceholder': '请输入标题...',
    'submit.rating': '评分',
    'submit.content': '内容',
    'submit.contentPlaceholder': '分享你的游戏体验...',
    'submit.videoUrl': '视频链接',
    'submit.videoUrlPlaceholder': '请输入视频链接 (YouTube, Bilibili等)...',
    'submit.videoDesc': '视频描述',
    'submit.videoDescPlaceholder': '简单介绍一下这个视频...',
    'submit.uploadFile': '或上传视频文件',
    'submit.uploadFileDesc': '支持 MP4, MOV, AVI 格式，最大 500MB',
    'submit.chooseFile': '选择文件',
    'submit.cancel': '取消',
    'submit.publish': '发布',
    'submit.submitting': '发布中...',
    
    // Auth Dialog
    'auth.title': '登录 / 注册',
    'auth.desc': '加入我们的游戏社区',
    'auth.login': '登录',
    'auth.signup': '注册',
    'auth.email': '邮箱',
    'auth.emailPlaceholder': '输入你的邮箱',
    'auth.password': '密码',
    'auth.passwordPlaceholder': '输入密码',
    'auth.name': '昵称',
    'auth.namePlaceholder': '输入你的昵称',
    'auth.confirmPassword': '确认密码',
    'auth.confirmPasswordPlaceholder': '再次输入密码',
    'auth.loginButton': '登录',
    'auth.signupButton': '注册',
    'auth.loggingIn': '登录中...',
    'auth.signingUp': '注册中...',
    'auth.or': '或',
    'auth.googleLogin': '使用 Google 登录',
    'auth.googleSignup': '使用 Google 注册',
    'auth.loginError': '登录失败',
    'auth.signupError': '注册失败',
    'auth.fetchUserError': '获取用户数据失败',
    'auth.passwordMismatch': '两次密码不一致',
    'auth.passwordTooShort': '密码至少需要6个字符',
    'auth.loginAfterSignupError': '注册成功，但登录失败',
    'auth.googleError': 'Google登录失败',
    'auth.logout': '登出',
    'auth.profile': '我的资料',
    'auth.notLoggedIn': '未登录',
    'auth.clickToLogin': '点击登录',
    
    // Common
    'common.loading': '加载中...',
    'common.cancel': '取消',
    'common.rank': '排名',
    'common.totalScore': '总分',
    'common.viewProfile': '查看资料',
    'common.level': '等级',
    'common.score': '分数',
    'common.posts': '帖子',
    'common.likes': '点赞',
    'common.minutesAgo': '分钟前',
    'common.hoursAgo': '小时前',
    'common.daysAgo': '天前',
    'common.back': '返回',
    
    // Home Page Extended
    'home.searchPlaceholder': '搜索游戏',
    'home.topPlayersTitle': '全球前三玩家',
    'home.topPlayersSubtitle': '顶尖玩家排行榜',
    'home.noPlayers': '暂无玩家数据',
    'home.trendingGames': '🎮 热门游戏排行',
    'home.trendingPosts': '🔥 全网热搜榜',
    'home.posts': '帖子',
    'home.noGames': '暂无热门游戏',
    'home.noPosts': '暂无热门帖子',
    'home.showMore': '展开更多',
    'home.showLess': '收起',
    
    // Personal Page Extended
    'personal.loginRequired': '请先登录以查看个人资料',
    'personal.experience': '经验值',
    'personal.statistics': '统计数据',
    'personal.likesReceived': '收到点赞',
    'personal.createFirstPost': '点击"投稿"创建你的第一个帖子',
    'personal.userNotFound': '未找到用户',
    'personal.posts': '帖子',
    
    // Leaderboard Extended
    'leaderboard.subtitle': '查看全球顶尖玩家排名',
    'leaderboard.noData': '暂无排行榜数据',
    'leaderboard.friendsComingSoon': '好友排名功能即将推出',
    'leaderboard.weeklyComingSoon': '本周排名功能即将推出',
    
    // Forum Extended
    'forum.subtitle': '分享你对游戏的想法和看法',
    'forum.loginRequired': '请先登录才能发帖',
    'forum.postError': '发帖失败，请重试',
    'forum.noPosts': '暂无帖子',
    'forum.addComment': '添加评论...',
    'forum.comment': '评论',
    'forum.submitting': '提交中...',
    'forum.noComments': '暂无评论',
    'forum.deletePostTitle': '删除帖子',
    'forum.deletePostConfirm': '确定要删除这个帖子吗？此操作无法撤销。',
    'forum.delete': '删除',
    'forum.deleteError': '删除失败，请重试',
    'forum.justNow': '刚刚',
    
    // Friends Extended
    'friends.subtitle': '管理你的游戏社区',
    'friends.loginRequired': '请先登录以查看好友列表',
    'friends.allFriends': '所有好友',
    'friends.searchPlaceholder': '搜索好友...',
    'friends.noFriends': '暂无好友',
    'friends.addFriendTitle': '添加好友',
    'friends.addFriendDescription': '输入你想要添加的用户ID',
    'friends.friendIdLabel': '用户ID',
    'friends.friendIdPlaceholder': '输入用户ID...',
    'friends.addSuccess': '好友添加成功！',
    'friends.addError': '添加好友失败',
    
    // Profile Editor
    'profile.editProfile': '编辑资料',
    'profile.editProfileDesc': '更新你的个人信息',
    'profile.name': '昵称',
    'profile.namePlaceholder': '输入你的昵称...',
    'profile.avatar': '头像',
    'profile.avatarUpload': '上传头像',
    'profile.avatarHint': '支持 JPG、PNG、GIF 格式，最大5MB',
    'profile.uploading': '上传中...',
    'profile.bio': '个人简介',
    'profile.bioPlaceholder': '介绍一下自己...',
    'profile.saveChanges': '保存更改',
    'profile.updating': '更新中...',
    'profile.updateSuccess': '资料更新成功！',
    'profile.updateError': '更新失败，请重试',
    
    // Games
    'games.library': '游戏库',
    'games.libraryDescription': '管理你的游戏收藏',
    'games.searchPlaceholder': '搜索游戏...',
    'games.searchResults': '搜索结果',
    'games.noGames': '暂无游戏',
    'games.searchToAdd': '搜索游戏以添加到库中',
    'games.playing': '游玩中',
    'games.completed': '已完成',
    'games.wishlist': '愿望单',
    'games.dropped': '已放弃',
    'games.searchTitle': '搜索游戏',
    'games.searchDescription': '找到你喜欢的游戏',
    'games.noResults': '未找到相关游戏',
    'games.searchHint': '输入至少2个字符开始搜索',
  },
  'zh-TW': {
    // Navigation
    'nav.submit': '投稿',
    'nav.home': '主頁',
    'nav.personal': '個人',
    'nav.leaderboard': '排行榜',
    'nav.forum': '論壇',
    'nav.friends': '好友',
    
    // Theme
    'theme.dark': '黑夜模式',
    'theme.light': '白天模式',
    
    // Language
    'lang.zh-CN': '簡體中文',
    'lang.zh-TW': '繁體中文',
    'lang.en': 'English',
    
    // Home Page
    'home.title': '記錄每一場精彩瞬間',
    'home.subtitle': '你的專屬遊戲追蹤平台',
    'home.search': '搜索遊戲',
    'home.topPlayers': '全球前三玩家',
    'home.topPlayersDesc': '頂尖玩家排行榜',
    'home.rank': '排名',
    'home.totalScore': '總分',
    'home.viewProfile': '查看資料',
    
    // Personal Page
    'personal.level': '等級',
    'personal.exp': '經驗值',
    'personal.editProfile': '編輯資料',
    'personal.stats': '統計數據',
    'personal.gamesCount': '遊戲數量',
    'personal.postsCount': '發帖數量',
    'personal.commentsCount': '評論數量',
    'personal.daysJoined': '加入天數',
    'personal.gameLibrary': '遊戲庫',
    'personal.loadGame': '加載遊戲',
    'personal.myPosts': '我的帖子',
    'personal.loadPosts': '加載帖子',
    'personal.playTime': '遊戲時長',
    'personal.noPosts': '暫無帖子',
    'personal.noPostsDesc': '點擊"加載帖子"查看',
    'personal.noGames': '點擊"加載遊戲"',
    'personal.noGamesDesc': '首看',
    
    // Leaderboard
    'leaderboard.title': '排行榜',
    'leaderboard.desc': '查看全球頂尖玩家排名',
    'leaderboard.global': '全球排名',
    'leaderboard.friends': '好友排名',
    'leaderboard.weekly': '本週排名',
    'leaderboard.score': '分數',
    'leaderboard.loading': '數據加載中...',
    
    // Forum
    'forum.title': '遊戲討論',
    'forum.desc': '分享你的想法和看法',
    'forum.newPost': '新帖子',
    'forum.justNow': '剛剛',
    
    // Friends
    'friends.title': '好友',
    'friends.desc': '管理你的遊戲社區',
    'friends.addFriend': '添加好友',
    'friends.all': '所有好友',
    'friends.online': '在線',
    'friends.requests': '請求',
    'friends.search': '搜索好友...',
    'friends.online.status': '在線',
    'friends.myFriends': '我的好友',
    'friends.noFriends': "还没有好友",
    'friends.loginRequired': '请先登录查看好友',
    'friends.friend': '位好友',
    'friends.friends': '位好友',
    
    // Bookmarks
    'bookmarks.title': '我的收藏',
    'bookmarks.subtitle': '已保存的帖子',
    'bookmarks.bookmark': '收藏',
    'bookmarks.bookmarked': '已收藏',
    'bookmarks.unbookmark': '取消收藏',
    'bookmarks.loginRequired': '请先登录才能收藏帖子',
    'bookmarks.noBookmarks': '还没有收藏任何帖子',
    'bookmarks.hint': '点击帖子上的收藏图标来保存',
    'bookmarks.bookmarks': '个收藏',
    
    // Tags
    'tags.trending': '热门标签',
    'tags.noTags': '暂无标签',
    'tags.placeholder': '添加标签... (按回车)',
    'tags.hint': '用回车、逗号或空格分隔标签',
    'tags.filtering': '筛选标签',
    
    // Submit Dialog
    'submit.title': '投稿',
    'submit.desc': '分享你的遊戲體驗',
    'submit.text': '文字稿',
    'submit.textDesc': '發布遊戲評測、攻略或心得',
    'submit.video': '視頻稿',
    'submit.videoDesc': '分享遊戲視頻或直播精彩片段',
    'submit.textPost': '文字投稿',
    'submit.videoPost': '視頻投稿',
    'submit.backToSelect': '返回選擇',
    'submit.gameName': '遊戲名稱',
    'submit.gameNamePlaceholder': '請輸入遊戲名稱...',
    'submit.title.label': '標題',
    'submit.titlePlaceholder': '請輸入標題...',
    'submit.rating': '評分',
    'submit.content': '內容',
    'submit.contentPlaceholder': '分享你的遊戲體驗...',
    'submit.videoUrl': '視頻鏈接',
    'submit.videoUrlPlaceholder': '請輸入視頻鏈接 (YouTube, Bilibili等)...',
    'submit.videoDesc': '視頻描述',
    'submit.videoDescPlaceholder': '簡單介紹一下這個視頻...',
    'submit.uploadFile': '或上傳視頻文件',
    'submit.uploadFileDesc': '支持 MP4, MOV, AVI 格式，最大 500MB',
    'submit.chooseFile': '選擇文件',
    'submit.cancel': '取消',
    'submit.publish': '發布',
    'submit.submitting': '发布中...',
    
    // Auth Dialog
    'auth.title': '登錄 / 註冊',
    'auth.desc': '加入我們的遊戲社區',
    'auth.login': '登錄',
    'auth.signup': '註冊',
    'auth.email': '郵箱',
    'auth.emailPlaceholder': '輸入你的郵箱',
    'auth.password': '密碼',
    'auth.passwordPlaceholder': '輸入密碼',
    'auth.name': '暱稱',
    'auth.namePlaceholder': '輸入你的暱稱',
    'auth.confirmPassword': '確認密碼',
    'auth.confirmPasswordPlaceholder': '再次輸入密碼',
    'auth.loginButton': '登錄',
    'auth.signupButton': '註冊',
    'auth.loggingIn': '登錄中...',
    'auth.signingUp': '註冊中...',
    'auth.or': '或',
    'auth.googleLogin': '使用 Google 登錄',
    'auth.googleSignup': '使用 Google 註冊',
    'auth.loginError': '登錄失敗',
    'auth.signupError': '註冊失敗',
    'auth.fetchUserError': '獲取用戶數據失敗',
    'auth.passwordMismatch': '兩次密碼不一致',
    'auth.passwordTooShort': '密碼至少需要6個字符',
    'auth.loginAfterSignupError': '註冊成功，但登錄失敗',
    'auth.googleError': 'Google登錄失敗',
    'auth.logout': '登出',
    'auth.profile': '我的資料',
    'auth.notLoggedIn': '未登錄',
    'auth.clickToLogin': '點擊登錄',
    
    // Common
    'common.loading': '加載中...',
    'common.cancel': '取消',
    'common.rank': '排名',
    'common.totalScore': '總分',
    'common.viewProfile': '查看資料',
    'common.level': '等級',
    'common.score': '分數',
    'common.posts': '帖子',
    'common.likes': '点赞',
    'common.minutesAgo': '分鐘前',
    'common.hoursAgo': '小時前',
    'common.daysAgo': '天前',
    'common.back': '返回',
    
    // Home Page Extended
    'home.searchPlaceholder': '搜索遊戲',
    'home.topPlayersTitle': '全球前三玩家',
    'home.topPlayersSubtitle': '頂尖玩家排行榜',
    'home.noPlayers': '暫無玩家數據',
    'home.trendingGames': '🎮 热门游戏排行',
    'home.trendingPosts': '🔥 全网热搜榜',
    'home.posts': '帖子',
    'home.noGames': '暂无热门游戏',
    'home.noPosts': '暂无热门帖子',
    'home.showMore': '展开更多',
    'home.showLess': '收起',
    
    // Personal Page Extended
    'personal.loginRequired': '請先登錄以查看個人資料',
    'personal.experience': '經驗值',
    'personal.statistics': '統計數據',
    'personal.likesReceived': '收到点赞',
    'personal.createFirstPost': '點擊"投稿"創建你的第一個帖子',
    'personal.userNotFound': '未找到用户',
    'personal.posts': '帖子',
    
    // Leaderboard Extended
    'leaderboard.subtitle': '查看全球頂尖玩家排名',
    'leaderboard.noData': '暫無排行榜數據',
    'leaderboard.friendsComingSoon': '好友排名功能即將推出',
    'leaderboard.weeklyComingSoon': '本週排名功能即將推出',
    
    // Forum Extended
    'forum.subtitle': '分享你對遊戲的想法和看法',
    'forum.loginRequired': '請先登錄才能發帖',
    'forum.postError': '發帖失敗，請重試',
    'forum.noPosts': '暫無帖子',
    'forum.addComment': '添加评论...',
    'forum.comment': '评论',
    'forum.submitting': '提交中...',
    'forum.noComments': '暂无评论',
    'forum.deletePostTitle': '删除帖子',
    'forum.deletePostConfirm': '确定要删除这个帖子吗？此操作无法撤销。',
    'forum.delete': '删除',
    'forum.deleteError': '删除失败，请重试',
    'forum.justNow': '刚刚',
    
    // Friends Extended
    'friends.subtitle': '管理你的遊戲社區',
    'friends.loginRequired': '請先登錄以查看好友列表',
    'friends.allFriends': '所有好友',
    'friends.searchPlaceholder': '搜索好友...',
    'friends.noFriends': '暫無好友',
    'friends.addFriendTitle': '添加好友',
    'friends.addFriendDescription': '輸入你想要添加的用戶ID',
    'friends.friendIdLabel': '用戶ID',
    'friends.friendIdPlaceholder': '輸入用戶ID...',
    'friends.addSuccess': '好友添加成功！',
    'friends.addError': '添加好友失败',
    
    // Profile Editor
    'profile.editProfile': '编辑资料',
    'profile.editProfileDesc': '更新你的个人信息',
    'profile.name': '昵称',
    'profile.namePlaceholder': '输入你的昵称...',
    'profile.avatar': '头像',
    'profile.avatarUpload': '上传头像',
    'profile.avatarHint': '支持 JPG、PNG、GIF 格式，最大5MB',
    'profile.uploading': '上传中...',
    'profile.bio': '个人简介',
    'profile.bioPlaceholder': '介绍一下自己...',
    'profile.saveChanges': '保存更改',
    'profile.updating': '更新中...',
    'profile.updateSuccess': '资料更新成功！',
    'profile.updateError': '更新失败，请重试',
    
    // Games
    'games.library': '游戏库',
    'games.libraryDescription': '管理你的游戏收藏',
    'games.searchPlaceholder': '搜索游戏...',
    'games.searchResults': '搜索结果',
    'games.noGames': '暂无游戏',
    'games.searchToAdd': '搜索游戏以添加到库中',
    'games.playing': '游玩中',
    'games.completed': '已完成',
    'games.wishlist': '愿望单',
    'games.dropped': '已放弃',
    'games.searchTitle': '搜索游戏',
    'games.searchDescription': '找到你喜欢的游戏',
    'games.noResults': '未找到相关游戏',
    'games.searchHint': '输入至少2个字符开始搜索',
  },
  'en': {
    // Navigation
    'nav.submit': 'Submit',
    'nav.home': 'Home',
    'nav.personal': 'Profile',
    'nav.leaderboard': 'Leaderboard',
    'nav.forum': 'Forum',
    'nav.friends': 'Friends',
    
    // Theme
    'theme.dark': 'Dark Mode',
    'theme.light': 'Light Mode',
    
    // Language
    'lang.zh-CN': 'Simplified Chinese',
    'lang.zh-TW': 'Traditional Chinese',
    'lang.en': 'English',
    
    // Home Page
    'home.title': 'Record Every Epic Moment',
    'home.subtitle': 'Your Personal Gaming Tracker',
    'home.search': 'Search Games',
    'home.topPlayers': 'Top 3 Global Players',
    'home.topPlayersDesc': 'Elite Player Rankings',
    'home.rank': 'Rank',
    'home.totalScore': 'Total Score',
    'home.viewProfile': 'View Profile',
    
    // Personal Page
    'personal.level': 'Level',
    'personal.exp': 'Experience',
    'personal.editProfile': 'Edit Profile',
    'personal.stats': 'Statistics',
    'personal.gamesCount': 'Games',
    'personal.postsCount': 'Posts',
    'personal.commentsCount': 'Comments',
    'personal.daysJoined': 'Days Joined',
    'personal.gameLibrary': 'Game Library',
    'personal.loadGame': 'Load Game',
    'personal.myPosts': 'My Posts',
    'personal.loadPosts': 'Load Posts',
    'personal.playTime': 'Play Time',
    'personal.noPosts': 'No posts yet',
    'personal.noPostsDesc': 'Click "Load Posts" to view',
    'personal.noGames': 'Click "Load Game"',
    'personal.noGamesDesc': 'to get started',
    
    // Leaderboard
    'leaderboard.title': 'Leaderboard',
    'leaderboard.desc': 'View Top Players Worldwide',
    'leaderboard.global': 'Global',
    'leaderboard.friends': 'Friends',
    'leaderboard.weekly': 'Weekly',
    'leaderboard.score': 'Score',
    'leaderboard.loading': 'Loading data...',
    
    // Forum
    'forum.title': 'Game Discussions',
    'forum.desc': 'Share your thoughts and opinions',
    'forum.newPost': 'New Post',
    'forum.justNow': 'Just now',
    
    // Friends
    'friends.title': 'Friends',
    'friends.desc': 'Manage Your Gaming Community',
    'friends.addFriend': 'Add Friend',
    'friends.all': 'All Friends',
    'friends.online': 'Online',
    'friends.requests': 'Requests',
    'friends.search': 'Search friends...',
    'friends.online.status': 'Online',
    'friends.myFriends': 'My Friends',
    'friends.noFriends': 'No friends yet',
    'friends.loginRequired': 'Please log in to view friends',
    'friends.friend': 'friend',
    'friends.friends': 'friends',
    
    // Bookmarks
    'bookmarks.title': 'My Bookmarks',
    'bookmarks.subtitle': 'Saved Posts',
    'bookmarks.bookmark': 'Bookmark',
    'bookmarks.bookmarked': 'Bookmarked',
    'bookmarks.unbookmark': 'Unbookmark',
    'bookmarks.loginRequired': 'Please log in to bookmark posts',
    'bookmarks.noBookmarks': 'No bookmarks yet',
    'bookmarks.hint': 'Click the bookmark icon on a post to save it',
    'bookmarks.bookmarks': 'bookmarks',
    
    // Tags
    'tags.trending': 'Trending Tags',
    'tags.noTags': 'No tags yet',
    'tags.placeholder': 'Add tags... (press Enter)',
    'tags.hint': 'Separate tags with Enter, comma, or space',
    'tags.filtering': 'Filter Tags',
    
    // Submit Dialog
    'submit.title': 'Submit',
    'submit.desc': 'Share your gaming experience',
    'submit.text': 'Text Post',
    'submit.textDesc': 'Publish reviews, guides or insights',
    'submit.video': 'Video Post',
    'submit.videoDesc': 'Share gameplay videos or highlights',
    'submit.textPost': 'Text Submission',
    'submit.videoPost': 'Video Submission',
    'submit.backToSelect': 'Back to Select',
    'submit.gameName': 'Game Name',
    'submit.gameNamePlaceholder': 'Enter game name...',
    'submit.title.label': 'Title',
    'submit.titlePlaceholder': 'Enter title...',
    'submit.rating': 'Rating',
    'submit.content': 'Content',
    'submit.contentPlaceholder': 'Share your gaming experience...',
    'submit.videoUrl': 'Video URL',
    'submit.videoUrlPlaceholder': 'Enter video link (YouTube, Bilibili, etc)...',
    'submit.videoDesc': 'Video Description',
    'submit.videoDescPlaceholder': 'Brief description of the video...',
    'submit.uploadFile': 'Or upload video file',
    'submit.uploadFileDesc': 'Supports MP4, MOV, AVI, max 500MB',
    'submit.chooseFile': 'Choose File',
    'submit.cancel': 'Cancel',
    'submit.publish': 'Publish',
    'submit.submitting': '发布中...',
    
    // Auth Dialog
    'auth.title': 'Login / Sign Up',
    'auth.desc': 'Join our gaming community',
    'auth.login': 'Login',
    'auth.signup': 'Sign Up',
    'auth.email': 'Email',
    'auth.emailPlaceholder': 'Enter your email',
    'auth.password': 'Password',
    'auth.passwordPlaceholder': 'Enter password',
    'auth.name': 'Name',
    'auth.namePlaceholder': 'Enter your name',
    'auth.confirmPassword': 'Confirm Password',
    'auth.confirmPasswordPlaceholder': 'Enter password again',
    'auth.loginButton': 'Login',
    'auth.signupButton': 'Sign Up',
    'auth.loggingIn': 'Logging in...',
    'auth.signingUp': 'Signing up...',
    'auth.or': 'OR',
    'auth.googleLogin': 'Login with Google',
    'auth.googleSignup': 'Sign up with Google',
    'auth.loginError': 'Login failed',
    'auth.signupError': 'Sign up failed',
    'auth.fetchUserError': 'Failed to fetch user data',
    'auth.passwordMismatch': 'Passwords do not match',
    'auth.passwordTooShort': 'Password must be at least 6 characters',
    'auth.loginAfterSignupError': 'Sign up successful, but login failed',
    'auth.googleError': 'Google login failed',
    'auth.logout': 'Logout',
    'auth.profile': 'My Profile',
    'auth.notLoggedIn': 'Not logged in',
    'auth.clickToLogin': 'Click to login',
    
    // Common
    'common.loading': 'Loading...',
    'common.cancel': 'Cancel',
    'common.rank': 'Rank',
    'common.totalScore': 'Total Score',
    'common.viewProfile': 'View Profile',
    'common.level': 'Level',
    'common.score': 'Score',
    'common.posts': 'Posts',
    'common.likes': 'Likes',
    'common.minutesAgo': 'minutes ago',
    'common.hoursAgo': 'hours ago',
    'common.daysAgo': 'days ago',
    'common.back': 'Back',
    
    // Home Page Extended
    'home.searchPlaceholder': 'Search games',
    'home.topPlayersTitle': 'Top 3 Global Players',
    'home.topPlayersSubtitle': 'Elite Player Rankings',
    'home.noPlayers': 'No player data available',
    'home.trendingGames': '🎮 热门游戏排行',
    'home.trendingPosts': '🔥 全网热搜榜',
    'home.posts': '帖子',
    'home.noGames': '暂无热门游戏',
    'home.noPosts': '暂无热门帖子',
    'home.showMore': '展开更多',
    'home.showLess': '收起',
    
    // Personal Page Extended
    'personal.loginRequired': 'Please log in to view your profile',
    'personal.experience': 'Experience',
    'personal.statistics': 'Statistics',
    'personal.likesReceived': 'Likes Received',
    'personal.createFirstPost': 'Click "Submit" to create your first post',
    'personal.userNotFound': 'User not found',
    'personal.posts': 'Posts',
    
    // Leaderboard Extended
    'leaderboard.subtitle': 'View Top Players Worldwide',
    'leaderboard.noData': 'No leaderboard data available',
    'leaderboard.friendsComingSoon': 'Friends leaderboard feature coming soon',
    'leaderboard.weeklyComingSoon': 'Weekly leaderboard feature coming soon',
    
    // Forum Extended
    'forum.subtitle': 'Share your thoughts and opinions on games',
    'forum.loginRequired': 'Please log in to post',
    'forum.postError': 'Post failed, please try again',
    'forum.noPosts': 'No posts available',
    'forum.addComment': 'Add comment...',
    'forum.comment': 'Comment',
    'forum.submitting': 'Submitting...',
    'forum.noComments': 'No comments yet',
    'forum.deletePostTitle': 'Delete Post',
    'forum.deletePostConfirm': 'Are you sure you want to delete this post? This action cannot be undone.',
    'forum.delete': 'Delete',
    'forum.deleteError': 'Delete failed, please try again',
    'forum.justNow': 'Just now',
    
    // Friends Extended
    'friends.subtitle': 'Manage your gaming community',
    'friends.loginRequired': 'Please log in to view your friends list',
    'friends.allFriends': 'All Friends',
    'friends.searchPlaceholder': 'Search friends...',
    'friends.noFriends': 'No friends available',
    'friends.addFriendTitle': 'Add Friend',
    'friends.addFriendDescription': 'Enter the user ID you want to add',
    'friends.friendIdLabel': 'User ID',
    'friends.friendIdPlaceholder': 'Enter user ID...',
    'friends.addSuccess': 'Friend added successfully!',
    'friends.addError': 'Failed to add friend',
    
    // Profile Editor
    'profile.editProfile': '编辑资料',
    'profile.editProfileDesc': '更新你的个人信息',
    'profile.name': '昵称',
    'profile.namePlaceholder': '输入你的昵称...',
    'profile.avatar': '头像',
    'profile.avatarUpload': '上传头像',
    'profile.avatarHint': '支持 JPG、PNG、GIF 格式，最大5MB',
    'profile.uploading': '上传中...',
    'profile.bio': '个人简介',
    'profile.bioPlaceholder': '介绍一下自己...',
    'profile.saveChanges': '保存更改',
    'profile.updating': '更新中...',
    'profile.updateSuccess': '资料更新成功！',
    'profile.updateError': '更新失败，请重试',
    
    // Games
    'games.library': '游戏库',
    'games.libraryDescription': '管理你的游戏收藏',
    'games.searchPlaceholder': '搜索游戏...',
    'games.searchResults': '搜索结果',
    'games.noGames': '暂无游戏',
    'games.searchToAdd': '搜索游戏以添加到库中',
    'games.playing': '游玩中',
    'games.completed': '已完成',
    'games.wishlist': '愿望单',
    'games.dropped': '已放弃',
    'games.searchTitle': '搜索游戏',
    'games.searchDescription': '找到你喜欢的游戏',
    'games.noResults': '未找到相关游戏',
    'games.searchHint': '输入至少2个字符开始搜索',
    
    // Messages/DM
    'messages.title': 'Messages',
    'messages.search': 'Search conversations...',
    'messages.noConversations': 'No conversations yet',
    'messages.noMessages': 'No messages yet. Start the conversation!',
    'messages.typeMessage': 'Type a message...',
    'messages.selectConversation': 'Select a conversation',
    'messages.selectConversationDesc': 'Choose a conversation to start messaging',
    
    // Search
    'search.placeholder': 'Search...',
    'search.typeToSearch': 'Type to search users, posts, and games...',
    'search.typeAtLeast': 'Type at least 2 characters to search',
    'search.noResults': 'No results found',
    'search.users': 'Users',
    'search.posts': 'Posts',
    'search.games': 'Games',
    
    // Events
    'events.title': 'Events & Tournaments',
    'events.description': 'Join or create gaming events and tournaments',
    'events.create': 'Create Event',
    'events.createNew': 'Create New Event',
    'events.createDescription': 'Fill in the details to create a new event',
    'events.noEvents': 'No events found',
    'events.noEventsDescription': 'Be the first to create an event!',
    'events.join': 'Join',
    'events.leave': 'Leave',
    'events.full': 'Full',
    'events.createButton': 'Create Event',
    'events.status.upcoming': 'Upcoming',
    'events.status.ongoing': 'Ongoing',
    'events.status.completed': 'Completed',
    'events.status.all': 'All',
    'events.form.title': 'Event Title',
    'events.form.description': 'Description',
    'events.form.game': 'Game',
    'events.form.type': 'Type',
    'events.form.startDate': 'Start Date',
    'events.form.endDate': 'End Date',
    'events.form.maxParticipants': 'Max Participants',
    'events.form.prize': 'Prize',
    
    // Report
    'report.title': 'Report Content',
    'report.description': 'Help us keep our community safe by reporting inappropriate content',
    'report.reasonLabel': 'Reason for reporting',
    'report.selectReasonPlaceholder': 'Select a reason',
    'report.descriptionLabel': 'Additional details (optional)',
    'report.descriptionPlaceholder': 'Provide any additional context...',
    'report.warning': 'False reports may result in action against your account',
    'report.submit': 'Submit Report',
    'report.submitting': 'Submitting...',
    'report.success': 'Report submitted successfully',
    'report.error': 'Failed to submit report',
    'report.selectReason': 'Please select a reason',
    'report.reasons.spam': 'Spam or misleading',
    'report.reasons.harassment': 'Harassment or hate speech',
    'report.reasons.inappropriate': 'Inappropriate content',
    'report.reasons.violence': 'Violence or harm',
    'report.reasons.copyright': 'Copyright violation',
    'report.reasons.other': 'Other',
    
    // Rating
    'rating.rateGame': 'Rate Game',
    'rating.updateRating': 'Update Rating',
    'rating.noRatings': 'No ratings yet',
    'rating.beFirst': 'Be the first to rate this game!',
    'rating.shareExperience': 'Share your experience with',
    'rating.yourRating': 'Your Rating',
    'rating.review': 'Review (Optional)',
    'rating.reviewPlaceholder': 'Share your thoughts about this game...',
    'rating.submit': 'Submit Rating',
    
    // Replies
    'replies.show': 'Show replies',
    'replies.hide': 'Hide replies',
    'replies.typeReply': 'Type a reply...',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('zh-CN');

  useEffect(() => {
    // Load language from localStorage
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && ['zh-CN', 'zh-TW', 'en'].includes(savedLanguage)) {
      setLanguageState(savedLanguage);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}