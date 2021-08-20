import os from 'os'
import path from 'path'
import semver from 'semver'
import actions from '@actions/core'
import cache from '@actions/tool-cache'
import { extForPlatform, resolveCommit, resolveVersion } from './versions.js'

async function downloadZig (platform, version) {
  const ext = extForPlatform(platform)

  const { downloadUrl, variantName } = version.includes('+')
    ? resolveCommit(platform, version)
    : await resolveVersion(platform, version)

  const downloadPath = await cache.downloadTool(downloadUrl)
  const zigPath = ext === 'zip'
    ? await cache.extractZip(downloadPath)
    : await cache.extractTar(downloadPath, undefined, 'x')

  const binPath = path.join(zigPath, variantName)
  const cachePath = await cache.cacheDir(binPath, 'zig', variantName)

  return cachePath
}

try {
  const version = actions.getInput('version') || '0.5.0'
  if (semver.valid(version) && semver.lt(version, '0.3.0')) {
    throw new Error('This action does not work with Zig 0.1.0 and Zig 0.2.0')
  }

  let zigPath = cache.find('zig', version)
  if (!zigPath) {
    zigPath = await downloadZig(os.platform(), version)
  }

  // Add the `zig` binary to the $PATH
  actions.addPath(zigPath)
} catch (err) {
  console.error(err.stack)
  actions.setFailed(err.message)
  process.exit(1)
}
