'use strict'

const os = require('os')
const path = require('path')
const semver = require('semver')
const actions = require('@actions/core')
const cache = require('@actions/cache')
const toolCache = require('@actions/tool-cache')
const fs = require('fs')
const {
  extForPlatform,
  resolveCommit,
  resolveVersion
} = require('./versions')

const TOOL_NAME = 'zig'

function get7zUrl(arch) {
    if (arch == 'x64')
        return 'https://github.com/marler8997/7-Zip/releases/download/23.0.1/7z-x86_64.exe'
    return null
}

async function extractZipFast(file, dest) {
  if (os.platform() != "win32")
      return toolCache.extractZip(file, dest)
  const _7zUrl = get7zUrl(os.arch())
  if (!_7zUrl)
      return toolCache.extractZip(file, dest)
  actions.info(`downloading 7z.exe from ${_7zUrl}`)
  const _7z_tmp = await toolCache.downloadTool(_7zUrl)
  const _7z = _7z_tmp + ".exe"
  fs.rename(_7z_tmp, _7z, (error) => {
    if (error) {
      actions.setFailed('failed to rename 7z to an exe: ' + error)
    }
  })
  actions.info(`7z.exe extracting ${file}...`)
  return toolCache.extract7z(file, dest, _7z)
}

async function downloadZig (platform, version, useCache = true) {
  const ext = extForPlatform(platform)

  const { downloadUrl, variantName, version: useVersion } = version.includes('+')
    ? resolveCommit(platform, version)
    : await resolveVersion(platform, version)

  const cachedPath = toolCache.find(TOOL_NAME, useVersion)
  if (cachedPath) {
    actions.info(`using cached zig install: ${cachedPath}`)
    return cachedPath
  }

  const cacheKey = `${TOOL_NAME}-${variantName}`
  if (useCache) {
    const restorePath = path.join(process.env.RUNNER_TOOL_CACHE, TOOL_NAME, useVersion, os.arch())
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
    ? await extractZipFast(downloadPath)
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

  const zigPath = await downloadZig(os.platform(), version, useCache === 'true')

  // Add the `zig` binary to the $PATH
  actions.addPath(zigPath)
  actions.info(`zig installed at ${zigPath}`)
}

main().catch((err) => {
  console.error(err.stack)
  actions.setFailed(err.message)
  process.exit(1)
})
