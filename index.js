'use strict'

const os = require('os')
const path = require('path')
const semver = require('semver')
const actions = require('@actions/core')
const cache = require('@actions/cache')
const toolCache = require('@actions/tool-cache')
const {
  extForPlatform,
  resolveCommit,
  resolveVersion
} = require('./versions')

const TOOL_NAME = 'zig'

async function downloadZig (arch, platform, version, useCache = true) {
  const ext = extForPlatform(platform)

  const { downloadUrl, variantName, version: useVersion } = version.includes('+')
    ? resolveCommit(arch, platform, version)
    : await resolveVersion(arch, platform, version)

  const cachedPath = toolCache.find(TOOL_NAME, useVersion)
  if (cachedPath) {
    actions.info(`using cached zig install: ${cachedPath}`)
    return cachedPath
  }

  const cacheKey = `${TOOL_NAME}-${variantName}`
  if (useCache) {
    const restorePath = path.join(process.env.RUNNER_TOOL_CACHE, TOOL_NAME, useVersion, arch)
    actions.info(`attempting restore of ${cacheKey} to ${restorePath}`)
    const restoredKey = await cache.restoreCache([restorePath], cacheKey)
    if (restoredKey) {
      actions.info(`using cached zig install: ${restorePath}`)
      return restorePath
    }
  }

  actions.info(`no cached version found. downloading zig ${variantName}`)
  const downloadPath = await toolCache.downloadTool(downloadUrl)
  const zigPath = ext === 'zip'
    ? await toolCache.extractZip(downloadPath)
    : await toolCache.extractTar(downloadPath, undefined, 'x')

  const binPath = path.join(zigPath, variantName)
  const cachePath = await toolCache.cacheDir(binPath, TOOL_NAME, useVersion)

  if (useCache) {
    actions.info(`adding zig ${useVersion} at ${cachePath} to local cache ${cacheKey}`)
    await cache.saveCache([cachePath], cacheKey)
  }

  return cachePath
}

async function main () {
  const version = actions.getInput('version') || 'master'
  const useCache = actions.getInput('cache') || 'true'
  if (semver.valid(version) && semver.lt(version, '0.3.0')) {
    actions.setFailed('This action does not work with Zig 0.1.0 and Zig 0.2.0')
    return
  }
  if (useCache !== 'false' && useCache !== 'true') {
    actions.setFailed('`with.cache` must be "true" or "false"')
    return
  }

  const zigPath = await downloadZig(os.arch(), os.platform(), version, useCache === 'true')

  // Add the `zig` binary to the $PATH
  actions.addPath(zigPath)
  actions.info(`zig installed at ${zigPath}`)
}

main().catch((err) => {
  console.error(err.stack)
  actions.setFailed(err.message)
  process.exit(1)
})
