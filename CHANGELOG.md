# setup-zig change log

All notable changes to this project will be documented in this file.

This project adheres to [Semantic Versioning](http://semver.org/).

## 1.4.0
* The action now caches compilers in your repository's Actions cache by default. This significantly
  speeds up installs on average. [#53](https://github.com/goto-bus-stop/setup-zig/pull/54)

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
