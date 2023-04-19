# Proto

[![JavaScript Style Guide](https://cdn.rawgit.com/standard/standard/master/badge.svg)](https://github.com/standard/standard)

This is the backend code for the Proto Language Server API Protocol.
This *must* be run as a separate process and available for devices to connect to for the app to work.

---

## Configuration

Do not modify any part of `config.json` as it is used exactly *as is* in all tests.
The `config.json` file is designed specifically for development and **should not** be used for production, which requires a separate bundle and install.

### Server

The `host` and `port` parameters will control where the API listens for requests and are printed to the console when the server starts.

### Storage

The `root` parameter contains the storage directory for all API artifacts.
This *should not* be changed during development so that all artifacts are stored in the repository directory at build time (these are automatically ignored by Git).

### Other Settings

Specify other settings in the `settings` object, which can currently contain the `limit: number` property, which determines the number of cards to study in each queue.
This will affect when incorrect answers are restudied and progress bar indicators.

## Testing

Project builds are cached in a `compiled` folder, which contains the corresponding JS and JS source maps for all TS code.
The backend is tested entirely using `jest` and `supertest`, which run mock HTTP requests.
Additionally, to check for style and QA issues, there is a custom `eslint` template based off of `standard-ts`.

- `yarn build`: Builds the project
- `yarn test`: Tests code and reports coverage
- `yarn lint`: Lints code and runs QA checks

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

However, Jest tests can be quite hard to debug sometimes, especially due to the constant source map referencing which can move breakpoints.
For more accurate debugging, consider rewriting a specific Jest test to use `http` requests and then start a standard debugging instance at `run.ts` or `compiled/run.js`, where the server is run from. Then, run the exported test to send a request to the server and create a breakpoint where the request should be processed.
This will allow you to do more precise analyses of what exactly is malfunctioning.

Note that [`node-fetch`](https://github.com/node-fetch/node-fetch) comes preinstalled with the dev dependencies, so you can use that to craft custom tests for specific backend functions.
To import it in standard (non-ESM) Javascript, use:

```js
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args))
```

## Deployment

All dependencies need to be installed with Yarn first, which can be done with `yarn install`.
You'll also want the dev dependencies for any of the above steps.
The server is deployed from `run.ts`, which is the entry point for the API.
Simply run `node .` to start it after building the project.
