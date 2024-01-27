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


function resolveCommit (arch, platform, version) {
  const ext = extForPlatform(platform)
  const resolvedOs = {
    linux: 'linux',
    darwin: 'macos',
    win32: 'windows'
  }[platform]

  const resolvedArch = {
    arm: 'armv7a',
    arm64: 'aarch64',
    ppc64: 'powerpc64',
    riscv64: 'riscv64',
    x64: 'x86_64',
  } [arch]

  const downloadUrl = `https://ziglang.org/builds/zig-${resolvedOs}-${resolvedArch}-${version}.${ext}`
  const variantName = `zig-${resolvedOs}-${resolvedArch}-${version}`

  return { downloadUrl, variantName, version }
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

async function resolveVersion (arch, platform, version) {
  const ext = extForPlatform(platform)
  const resolvedOs = {
    linux: 'linux',
    darwin: 'macos',
    win32: 'windows'
  }[platform]

  const resolvedArch = {
    arm: 'armv7a',
    arm64: 'aarch64',
    ppc64: 'powerpc64',
    riscv64: 'riscv64',
    x64: 'x86_64',
  } [arch]

  const host = `${resolvedArch}-${resolvedOs}`

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
