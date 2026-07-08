import fs from 'fs'
import path from 'path'
import type { IPluginContext } from '@tarojs/service'

function fixWeappDist(): void {
  const root = path.join(__dirname, '../..')
  const cloudDist = path.join(root, 'dist/cloud')

  if (fs.existsSync(cloudDist)) {
    fs.rmSync(cloudDist, { recursive: true, force: true })
  }

  const distConfigPath = path.join(root, 'dist/project.config.json')
  if (fs.existsSync(distConfigPath)) {
    const config = JSON.parse(fs.readFileSync(distConfigPath, 'utf8')) as Record<string, unknown>
    delete config.cloudfunctionRoot
    config.__usePrivacyCheck__ = true
    fs.writeFileSync(distConfigPath, `${JSON.stringify(config, null, 2)}\n`)
  }

  const appJsonPath = path.join(root, 'dist/app.json')
  if (!fs.existsSync(appJsonPath)) return

  const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8')) as Record<string, unknown>
  appJson.__usePrivacyCheck__ = true
  delete appJson.requiredPrivateInfos
  fs.writeFileSync(appJsonPath, `${JSON.stringify(appJson, null, 2)}\n`)
}

export default (ctx: IPluginContext) => {
  ctx.onBuildFinish(() => {
    if (process.env.TARO_ENV !== 'weapp') return
    fixWeappDist()
  })
}
