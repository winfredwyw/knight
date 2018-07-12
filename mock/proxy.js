/**
 * 后端已存在接口场景，可代理接口
 */
module.exports = {
    // 单个代理
    '/api/cate/list': {
        target: 'https://m.douyu.com',
        changeOrigin: true
    },
    // 批量代理
    // '/api/*': {
    //     target: 'https://m.douyu.com',
    //     changeOrigin: true
    // }
}