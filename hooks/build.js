module.exports = function(ctx) {
    const fs = ctx.requireCordovaModule('fs');
    const path = ctx.requireCordovaModule('path');
    const deferral = ctx.requireCordovaModule('q').defer();

    // 是否可以执行cordova命令
    let isPass = true;

    // 依赖www资源
    try {
        fs.statSync(path.join(__dirname, '../www'));
    } catch (e) {
        console.log('[hybrid]: no www, you need build you src');
        isPass = false;
    }

    // 依赖platform
    try {
        fs.statSync(path.join(__dirname, '../platforms'));
    } catch (e) {
        console.log('[hybrid]: no platform, you need add platform');
        isPass = false;
    }

    (isPass ? deferral.resolve : deferral.reject)();

    return deferral.promise;
}
