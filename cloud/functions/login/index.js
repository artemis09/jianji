const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

exports.main = async () => {
  const { OPENID } = cloud.getWXContext()
  const db = cloud.database()
  const users = db.collection('users')
  const existing = await users.where({ openid: OPENID }).get()

  if (existing.data.length === 0) {
    await users.add({
      data: {
        openid: OPENID,
        theme: 'warm',
        createdAt: db.serverDate(),
      },
    })
  }

  return { openid: OPENID }
}
