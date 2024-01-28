'use strict'

const os = require('os')
const fs = require('node:fs/promises')
const net = require('node:http/promises')
const path = require('path')
const semver = require('semver')
const minisign = require('minisign')
const actions = require('@actions/core')
const cache = require('@actions/cache')
const toolCache = require('@actions/tool-cache')
const {
  extForPlatform,
  resolveCommit,
  resolveVersion
} = require('./versions')

const TOOL_NAME = 'zig'
const ZIG_PUBLIC_KEY = 'RWSGOq2NVecA2UPNdBUZykf1CCb147pkmdtYxgb3Ti+JO/wCYvhbAb/U'

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

  actions.info(`downloading zig and signature`)
  actions.info(`no cached version found. downloading zig ${variantName}`)
  const downloadSig = await http.get(downloadUrl + '.minisig')
  const downloadPath = await toolCache.downloadTool(downloadUrl) 
  const downloadFile = await fs.open(downloadPath)
  const downloadBuffer = await fs.read(downloadFile)

  actions.info(`downloading zig signature ${downloadUrl + '.minisig'}`)
  const sigPath = await sigPathPromise
  const sigFile = await fs.open(sigPath)
  const sigBuffer = await fs.read(sigFile)
  const sig = minisign.parseSignature(sigBuffer)
  const pubKey = minisign.parsePubKey(ZIG_PUBLIC_KEY)

  if (minisign.verifySignature(sig.signature, downloadBuffer, pubKey.publicKey)) {
    actions.info(`trusted comment: ${sig.trustedComment}`)
  } else {
    actions.error(`untrusted comment: ${sign.untrustedComment}`)
  }

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
