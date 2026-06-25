const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

exports.main = async (event) => {
  const { code } = event

  if (!code) {
    return { errMsg: 'missing code' }
  }

  try {
    const result = await cloud.openapi.phonenumber.getPhoneNumber({ code })
    const phone = result.phoneInfo.phoneNumber
    const { OPENID } = cloud.getWXContext()
    const db = cloud.database()

    await db.collection('users').where({ openid: OPENID }).update({
      data: { phone },
    })

    return { phone }
  } catch (err) {
    return { errMsg: err.message || 'decrypt failed' }
  }
}
