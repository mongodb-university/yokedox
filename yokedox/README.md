yokedox
=======

A yoked ox

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/yokedox.svg)](https://npmjs.org/package/yokedox)
[![Downloads/week](https://img.shields.io/npm/dw/yokedox.svg)](https://npmjs.org/package/yokedox)
[![License](https://img.shields.io/npm/l/yokedox.svg)](https://github.com/cbush/yokedox/blob/master/package.json)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g yokedox
$ yokedox COMMAND
running command...
$ yokedox (-v|--version|version)
yokedox/0.0.0 darwin-x64 node-v14.4.0
$ yokedox --help [COMMAND]
USAGE
  $ yokedox COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`yokedox hello [FILE]`](#yokedox-hello-file)
* [`yokedox help [COMMAND]`](#yokedox-help-command)

## `yokedox hello [FILE]`

describe the command here

```
USAGE
  $ yokedox hello [FILE]

OPTIONS
  -f, --force
  -h, --help       show CLI help
  -n, --name=name  name to print

EXAMPLE
  $ yokedox hello
  hello world from ./src/hello.ts!
```

_See code: [src/commands/hello.ts](https://github.com/cbush/yokedox/blob/v0.0.0/src/commands/hello.ts)_

## `yokedox help [COMMAND]`

display help for yokedox

```
USAGE
  $ yokedox help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v3.2.0/src/commands/help.ts)_
<!-- commandsstop -->
