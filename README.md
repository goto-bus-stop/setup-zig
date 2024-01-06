# setup-zig

Use the zig compiler in your Github Actions workflows

[Usage](#usage) - [License: Apache-2.0](#license)

## Usage

In a Github Actions workflow file, do something like:

```yaml
jobs:
  test:
    strategy:
      matrix:
        os: [ubuntu-latest, macos-latest, windows-latest]
    runs-on: ${{matrix.os}}
    steps:
      - uses: actions/checkout@v2
      - uses: goto-bus-stop/setup-zig@v2
      - run: zig build test
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: goto-bus-stop/setup-zig@v2
      - run: zig fmt --check .
```

Optionally set a Zig version:
```yaml
- uses: goto-bus-stop/setup-zig@v2
  with:
    version: 0.7.0
```

The default is to use the nightly `master` builds.

Or [pin to a specific commit](https://github.com/goto-bus-stop/setup-zig/issues/13) using `version+commithash` syntax:
```yaml
- uses: goto-bus-stop/setup-zig@v2
  with:
    version: 0.6.0+4b48fccad
```

If you are running Zig on Windows machines, you need to make sure that your .zig files use \n line endings and not \r\n. The `actions/checkout` action auto-converts line endings to `\r\n` on Windows runners, so add a `.gitattributes` file:
```
*.zig text eol=lf
```

This action caches the downloaded compilers in your repository's Actions cache by default,
to reduce the load on the Zig Foundation's servers. Cached compilers are only about 60MB
each per version/OS/architecture.

If this is really bad for you for some reason you can disable the caching.

```yaml
- uses: goto-bus-stop/setup-zig@v2
  with:
    cache: false
```

## License

[Apache-2.0](LICENSE.md)
