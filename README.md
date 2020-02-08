# setup-zig

Use the zig compiler in your Github Action

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
      - uses: actions/checkout@v1
      - uses: goto-bus-stop/setup-zig@v1.2.1
      - run: zig build test
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v1
      - uses: goto-bus-stop/setup-zig@v1.2.1
      - run: zig fmt --check src/*.zig
```

Optionally set a Zig version:
```yaml
- uses: goto-bus-stop/setup-zig@v1.2.1
  with:
    version: 0.4.0 # The default is 0.5.0
```

To use the nightly builds, set:
```yaml
- uses: goto-bus-stop/setup-zig@v1.2.1
  with:
    version: master
```

If you are running Zig on Windows machines, you need to make sure that your .zig files use \n line endings and not \r\n. The `actions/checkout` action auto-converts line endings to \r\n, so add a `.gitattributes` file:
```
*.zig text eol=lf
```

## License

[Apache-2.0](LICENSE.md)
