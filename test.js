const assert = require('assert').strict
const {
  resolveCommit,
  resolveVersion
} = require('./versions')

async function test () {
  assert.deepEqual(resolveCommit('linux', '0.6.0+4b48fccad'), {
    downloadUrl: 'https://ziglang.org/builds/zig-linux-x86_64-0.6.0+4b48fccad.tar.xz',
    fileWithoutFileType: 'zig-linux-x86_64-0.6.0+4b48fccad',
    variantName: 'zig-linux-x86_64-0.6.0',
    version: '0.6.0'
  })
  assert.deepEqual(resolveCommit('win32', '0.6.0+4b48fccad'), {
    downloadUrl: 'https://ziglang.org/builds/zig-windows-x86_64-0.6.0+4b48fccad.zip',
    fileWithoutFileType: 'zig-windows-x86_64-0.6.0+4b48fccad',
    variantName: 'zig-windows-x86_64-0.6.0',
    version: '0.6.0'
  })
  assert.deepEqual(resolveCommit('win32', '0.12.0-dev.1092+68ed78775'), {
    downloadUrl: 'https://ziglang.org/builds/zig-windows-x86_64-0.12.0-dev.1092+68ed78775.zip',
    fileWithoutFileType: 'zig-windows-x86_64-0.12.0-dev.1092+68ed78775',
    variantName: 'zig-windows-x86_64-0.12.0-dev.1092',
    version: '0.12.0-dev.1092'
  })
  assert.deepEqual(resolveCommit('darwin', '0.12.0-dev.1150+3c22cecee'), {
    downloadUrl: 'https://ziglang.org/builds/zig-macos-x86_64-0.12.0-dev.1150+3c22cecee.tar.xz',
    fileWithoutFileType: 'zig-macos-x86_64-0.12.0-dev.1150+3c22cecee',
    variantName: 'zig-macos-x86_64-0.12.0-dev.1150',
    version: '0.12.0-dev.1150'
  })

  assert.deepEqual(await resolveVersion('linux', '0.7.0'), {
    downloadUrl: 'https://ziglang.org/download/0.7.0/zig-linux-x86_64-0.7.0.tar.xz',
    variantName: 'zig-linux-x86_64-0.7.0',
    version: '0.7.0'
  })
  assert.deepEqual(await resolveVersion('win32', '0.4.0'), {
    downloadUrl: 'https://ziglang.org/download/0.4.0/zig-windows-x86_64-0.4.0.zip',
    variantName: 'zig-windows-x86_64-0.4.0',
    version: '0.4.0'
  })
  await assert.doesNotReject(resolveVersion('linux', 'master'))
  await assert.doesNotReject(resolveVersion('win32', 'master'))
}

test().catch((error) => {
  console.error(error.stack)
  process.exit(1)
})
