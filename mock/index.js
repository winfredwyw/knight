/**
 * 后端未提供接口场景，可mock接口
 * 注意：大规模时，可自行拆分
 */
const mocker = {
    'POST /deliver/fish2': {
        'msg': 'ok',
        'error': 0
    },
    'GET /api/user': {
        id: 1,
        username: 'kenny',
        sex: 6
    }
}
module.exports = mocker;