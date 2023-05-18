const path = require('path')
const get = require('simple-get').concat
const semver = require('semver')

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
    throw new Error(`Could not find version ${useVersion || version} for platform ${host}`)
  }

  const downloadUrl = meta[host].tarball
  const variantName = path.basename(meta[host].tarball).replace(`.${ext}`, '')

  return { downloadUrl, variantName, version: useVersion || version }
}

module.exports = {
  extForPlatform,
  resolveCommit,
  resolveVersion
}
