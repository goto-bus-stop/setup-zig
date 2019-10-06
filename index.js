const os = require('os')
const path = require('path')
const semver = require('semver')
const actions = require('@actions/core')
const cache = require('@actions/tool-cache')

async function downloadZig (version) {
  const host = {
    linux: 'linux-x86_64',
    darwin: 'macos-x86_64',
    win32: 'windows-x86_64'
  }[os.platform()]
  const ext = {
    linux: 'tar.xz',
    darwin: 'tar.xz',
    win32: 'zip'
  }[os.platform()]

  const variantName = `zig-${host}-${version}`
  const url = `https://github.com/ziglang/zig/releases/download/${version}/${variantName}.${ext}`

  const downloadPath = await cache.downloadTool(url)
  const zigPath = ext === 'zip'
    ? await cache.extractZip(downloadPath)
    : await cache.extractTar(downloadPath, undefined, 'x')

  const binPath = path.join(zigPath, variantName)
  return cache.cacheDir(binPath, 'zig', version)
}

async function main () {
  const version = actions.getInput('version') || '0.5.0'
  if (semver.lt(version, '0.3.0')) {
    actions.setFailed('This action does not work with Zig 0.1.0 and Zig 0.2.0')
    return
  }

  let zigPath = cache.find('zig', version)
  if (!zigPath) {
    zigPath = await downloadZig(version)
  }

  // Add the `zig` binary to the $PATH
  actions.addPath(zigPath)
}

main()
