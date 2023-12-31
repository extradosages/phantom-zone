# phantom-zone

Type-safe config with zod.

## Overview

`phantom-zone` is a library for type-safe loading of config values. It leverages the fantastic typescript library zod to bridge static analysis and the runtime with very little code.

Config values can presently be sourced from yaml files and from the process environment.

Curious about the etymology? Consider [this](https://github.com/mozilla/node-convict) and [this](https://github.com/colinhacks/zod).

## Usage

### Tutorial: Define a config parser, config sources, and load config

Let's say we want to load some configuration encoded (for organizational purposes) as a nested data structure into our application. We want to be able to source data defaults from a yaml file checked into version control and override any of those with environment variables. That's what `phantom-zone` is for.

For this tutorial we'll pretend we're working on an application called `google-gateway` which abstracts access to a google api for our company.

#### Define a config parser

To define the shape of our configuration (and the static type with which it will be passed around the application) we'll use a zod parser. In `google-gateway` we'll pretend that we're configuring the server host, logging level, and google api key.

In `/mnt/app/src/config/parser.ts`:

```
import { z } from 'zod';

// Application api configuration
const api = z.object({
  google: z.object({
    key: z.string().length(24),
  }),
});

// Application logging configuration
const logging = z.object({
  level: z.enum(['debug, 'info', 'warn', 'error']),
});

// Application server configuration
const server = z.object({
  host: z.string(),
  // Numbers sourced from the environment must be parsed from strings!
  port: z.number().int().or(z.string().transform(parseInt),
});

// The config parser for the whole application
export const parser = z.object({
  api,
  logging,
  server,
});

```

Notice how we set-up the `server.port` parser to take either a number or a string. Since yaml is already slightly typed, `phantom-zone` can automatically ingest that data with the appropriate type. However, if we expect to source a config variable from the environment, we'll always need to be able to parse it from a string.

#### Set-up config sources

We'll have this application attempt to load its cofiguration from a file of default values: `/mnt/app/config.yaml`. We'll also set up a git-ignored file in the repo that allows the user to locally override some of the values without having to screw with the environment: `/mnt/app/config.adhoc.yaml`. Then, finally, we'll supersede any of those values with values extracted from the environment.

`phantom-zone` allows us to specify sourcing our config in this sequence by constructing an array of 'incremental loaders'. Right now there are two types of loaders: `yamlFileLoader` and `environmentLoader`.

The `yamlFileLoader` will try to load config from a yaml file. All that's required to configure it is a path to the file.

The `environmentLoader` will try to load config from the environment. By default it attempts to load a config variable with a given path in the parser by joining the path into ALL_CAPS case, e.g. `api.google.key` -> `API_GOOGLE_KEY`. This transformation is actually typeable in typescript 4.3.5; one can determine the union type of allowable environment variable names from a parser statically! `phantom-zone` does this. Leveraging this power, if one wishes to override the variable from which to source a config variable, one can pass a record which takes the default variable name to the desired one.

For example, in `/mnt/app/src/config/loaders.ts`:

```
import { environmentLoader, yamlFileLoader } from 'phantom-zone';

import { parser } from './parser.ts';

const defaults = yamlFileLoader(parser, '/mnt/app/config.yaml');

const localOverride = yamlFileLoader(parser, '/mnt/app/config.adhoc.yaml');

// Let's say that we want to source the `server.host` config variable from the
// `SERVER_ADDRESS` environment variable instead of the `SERVER_HOST` variable
const renameVars = { 'SERVER_HOST': 'SERVER_ADDRESS' };
const lastWord = environmentLoader(parser, renameVars)

// The variables loaded by these are in increasing precedence from right to left
export const loaders = [defaults, localOverride, lastWord];
```

#### Load the config!

Loading the config can then be accomplished by invoking the `project` function, the core api of the package.

For example, in `/mnt/app/src/config/core.ts`:

```
import { project } from 'phantom-zone';

import { loaders } from './loaders';
import { parser } from './parser';

export const config = project(parser, loaders);
```

The config will be typed, and the following type "assertion" will be `true`:

```
type Assertion = (typeof config) extends {
  api: {
    google: {
      key: string;
    };
  };
  logging: {
    level: 'debug' | 'info' | 'warn' | 'error';
  };
  server: {
    host: string;
    port: number;
  };
} ? true : false;
```

If we have the file `/mnt/app/config.yaml`:

```
api:
  google:
    key: 'fake'
logging:
  level: 'debug'
server:
  host: '127.0.0.1'
  port: 9000
```

And we have the file `/mnt/app/config.adhoc.yaml`:

```
api:
  google:
    key: 'ak.n7643DSasd83lkjgkmnn7643DSasd83lkjgkmn'
```

And we set the environment variable `SERVER_ADDRESS=0.0.0.0`, then the following test assertion will pass:

```
expect(config).toStrictEqual({
  api: {
    google: {
      // From the file `config.adhoc.yaml`
      key: 'ak.n7643DSasd83lkjgkmnn7643DSasd83lkjgkmn',
    },
  },
  logging: {
    // From the file `config.yaml`
    level: 'debug',
  },
  server: {
    // From the `SERVER_ADDRESS` environment variable
    host: '0.0.0.0',
    port: 9000,
  },
})
```

## Development

### Development containers

This repository comes with a containerized development environment for vscode. If you are using vscode, consider developing in this container to standardize the development experience. See [this page](https://code.visualstudio.com/docs/remote/remote-overview) for an overview of remote development. To use the environment, install the `Remote - Containers` vscode extension, open the command palette (usually `Ctrl-Shift-P`), and execute `Remote-Containers: Reopen in Container`.

### Commit-linting

Commits are linted by [commitlint](https://github.com/conventional-changelog/commitlint). There are facilities in place that will block commits locally if they do not pass linting. I value the experience of finding structure and detail in a commit history upon review. I also value the having the ability to automatically generate changelogs on release when our commits are structured.

### Publishing releases

I intend the release process for this library to be managed by the [standard-version](https://github.com/conventional-changelog/standard-version) tool. To invoke the release, run `./dev release` in the root of the repository.%
