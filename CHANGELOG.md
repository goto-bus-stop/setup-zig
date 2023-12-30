# setup-zig change log

All notable changes to this project will be documented in this file.

This project adheres to [Semantic Versioning](http://semver.org/).

## 2.2.0
* Update the action to use Node.js 20. [#61](https://github.com/goto-bus-stop/setup-zig/pull/61)
* Add a test for zig 0.11.0. [#62](https://github.com/goto-bus-stop/setup-zig/pull/62)

Thanks [@chenrui333](https://github.com/chenrui333)!

## 2.1.1
* Fix `cache: false`, see [#55](https://github.com/goto-bus-stop/setup-zig/issues/55).

Thanks to [@linusg](https://github.com/linusg) for the report!

## 2.1.0
* The action now caches compilers in your repository's Actions cache by default. This significantly
  speeds up installs on average. [#53](https://github.com/goto-bus-stop/setup-zig/pull/53)

  2.0.2 also had caching-related changes but they didn't actually do much, based on a misunderstanding
  of what the `tool-cache` is for.

## 2.0.2
* Fix tool-cache usage, this should speed up the action if zig was already downloaded before. [#45](https://github.com/goto-bus-stop/setup-zig/pull/45)

## 2.0.1
* Update docs to v2

## 2.0.0
* Change `version` option default to `master`. See [#24](https://github.com/goto-bus-stop/setup-zig/issues/24)

## 1.3.0
* Support pinning to a specific commit of the zig compiler. ([@codehz](https://github.com/codehz) in [#14](https://github.com/goto-bus-stop/setup-zig/pull/14))
  ```yaml
  uses: goto-bus-stop/setup-zig@v1
  with:
    version: 0.6.0+4b48fccad
  ```
* Add tests for the version -> URL resolution code.

## 1.2.5
* Update dependencies to fix #11.

## 1.2.4
* Update dependencies simple-get and ncc.

## 1.2.3
* Configure Actions to build releases automatically.

## 1.2.2
* Update examples. ([#7](https://github.com/goto-bus-stop/setup-zig/pull/7))
* Upgrade dependencies.
* Recommend using @v1 instead of pinning to a version.

## 1.2.1
* Make `version: master` actually work.

## 1.2.0
* Allow setting `version: master` to get the latest build from the development branch.

## 1.1.0
* Load the zig binaries from tool cache if available.
* Use the ziglang.org download index instead of downloading from Github Releases.
* Bundle the action JavaScript code, reducing repository size.

## 1.0.1
* Add an icon and colour.

## 1.0.0
* Initial release.
