const os = require('os')
const path = require('path')
const semver = require('semver')
const get = require('simple-get').concat
const actions = require('@actions/core')
const cache = require('@actions/tool-cache')

function getJSON (opts) {
  return new Promise((resolve, reject) => {
    get({ ...opts, json: true }, (err, req, data) => {
      if (err) {
        reject(err)
      } else {
        resolve(data)
      }
    })
  })
}

function extForPlatform (platform) {
  return {
    linux: 'tar.xz',
    darwin: 'tar.xz',
    win32: 'zip'
  }[platform]
}

function resolveCommit (platform, version) {
  const ext = extForPlatform(platform)
  const addrhost = {
    linux: 'linux-x86_64',
    darwin: 'macos-x86_64',
    win32: 'windows-x86_64'
  }[platform]

  const downloadUrl = `https://ziglang.org/builds/zig-${addrhost}-${version}.${ext}`
  const variantName = `zig-${addrhost}-${version}`

  return { downloadUrl, variantName }
}

async function resolveVersion (platform, version) {
  const ext = extForPlatform(platform)
  const host = {
    linux: 'x86_64-linux',
    darwin: 'x86_64-macos',
    win32: 'x86_64-windows'
  }[platform] || platform

  const index = await getJSON({ url: 'https://ziglang.org/download/index.json' })

  const availableVersions = Object.keys(index)
  const useVersion = semver.valid(version)
    ? semver.maxSatisfying(availableVersions.filter((v) => semver.valid(v)), version)
    : null

  const meta = index[useVersion || version]
  if (!meta || !meta[host]) {
    throw new Error(`Could not find version ${version} for platform ${host}`)
  }

  const downloadUrl = meta[host].tarball
  const variantName = path.basename(meta[host].tarball).replace(`.${ext}`, '')

  return { downloadUrl, variantName }
}

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

async function main () {
  const version = actions.getInput('version') || '0.5.0'
  if (semver.valid(version) && semver.lt(version, '0.3.0')) {
    actions.setFailed('This action does not work with Zig 0.1.0 and Zig 0.2.0')
    return
  }

  let zigPath = cache.find('zig', version)
  if (!zigPath) {
    zigPath = await downloadZig(os.platform(), version)
  }

  // Add the `zig` binary to the $PATH
  actions.addPath(zigPath)
}

main().catch((err) => {
  console.error(err.stack)
  actions.setFailed(err.message)
  process.exit(1)
})
