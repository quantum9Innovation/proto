# Proto API

[![JavaScript Style Guide](https://cdn.rawgit.com/standard/standard/master/badge.svg)](https://github.com/standard/standard)

This is the backend code for the Proto Language Server API Protocol.
The [frontend](./frontend/) folder contains the code that is served to a browser client from the API backend.

## Installation

Please note that Proto is currently in the **public alpha** stage of development and released code may be unstable and not work as expected.
If you encounter any issues or need help, please either [open an issue](https://github.com/quantum9Innovation/proto/issues/new) or contact a project maintainer.

If you have already cloned the repository, you can run `yarn dist` to generate all the required files in the `dist` directory.
Instructions for a production deployment in another location should be printed to the terminal.

Run the following commands to update your local Proto version:

```sh
git pull
yarn install
yarn dist
```

**Important:**
Do not use the Proto repository as a production environment.
Stored files will be overwritten when you run `yarn test` or similar commands.
Always extract production releases to a separate location used exclusively for its intended purpose (i.e. not development).

**Warning:**
Always extract any distribution tarballs inside a subdirectory as the bootstrapper might spawn files in the parent directory.
Do not modify or otherwise tamper with generated files that are not intended for user configuration.

If you do not have the repository cloned and do not want to clone it, you can install a tarball from the latest release.
Follow the below steps regarding setup:

> To run in production, move the tarball to the desired location.
> Then, run the bootstrapper from within the extracted location:  
> `$ ./bootstrap.sh`
>
> Create and edit config.json and then run:  
> `$ ./start.sh`

*These are the same steps that will be printed to the terminal when you run `yarn dist`.*

:warning: **Make sure to backup your card storage directory often!**

---

## Configuration

Do not modify any part of [`config.json`](./config.json) as it is used exactly *as is* in all tests.
The [`config.json`](./config.json) file is designed specifically for development and **should not** be used for production, which requires a separate bundle and install.

## Testing

Project builds are cached in a `compiled` folder, which contains the corresponding JS and JS source maps for all TS code.
The backend is tested entirely using [Jest](https://jestjs.io) and [Supertest](https://github.com/ladjs/supertest), which run mock HTTP requests.
Additionally, to check for style and QA issues, there is a custom [Eslint](https://eslint.org) template based off of [standard-ts](https://github.com/standard/ts-standard).

- `yarn build`: Builds the project
- `yarn test`: Tests code and reports coverage
- `yarn lint`: Lints code and runs QA checks
- `yarn dist`: Generate distribution release

## Debugging

Before debugging, check for any common issues with `yarn lint`.
If that doesn't reveal anything meaningful, continue to these next steps.

To debug tests, use the built-in Node.js debugger that is supported by Jest out-of-the-box.
Run the `jest` executable from the local `node_modules` directory with the following flags:

```sh
node --inspect-brk ./node_modules/.bin/jest --runInBand
```

This command is also aliased to `yarn debug`.

Then, you can connect an external debugger to this process to track down failing tests.
`yarn build` will automatically compile source maps, so any debugger with support for those will allow you to view the TypeScript source when available.
To connect via VSC, add the following to `launch.json`, under `"configurations"`:

```json
{
  "name": "Attach to Debugger",
  "type": "node",
  "request": "attach",
  "port": 9229
}
```

However, Jest tests can be quite hard to debug sometimes, especially due to the constant source map referencing, which can move breakpoints.
For more accurate debugging, consider rewriting a specific Jest test to use HTTP requests and then start a standard debugging instance at [`run.ts`](./run.ts) or `compiled/run.js`, where the server is run from. Then, run the exported test to send a request to the server and create a breakpoint where the request should be processed.
This will allow you to do more precise analyses of what exactly is malfunctioning.

Note that [`node-fetch`](https://github.com/node-fetch/node-fetch) comes preinstalled with the dev dependencies, so you can use that to craft custom tests for specific backend functions.
To import it in standard (non-ESM) Javascript, use:

```js
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args))
```

## Deployment

All dependencies need to be installed with Yarn first, which can be done with `yarn install`.
You'll also want the dev dependencies for any of the above steps.
The server is deployed from [`run.ts`](./run.ts), which is the entry point for the API.
Simply run `node .` to start it after building the project.
If you want to read more about what's happening behind the scenes, try the [API docs](./docs/README.md).
