# <img src='./static/favicon.png' style='width:10%;'> Proto

[![JavaScript Style Guide](https://cdn.rawgit.com/standard/standard/master/badge.svg)](https://github.com/standard/standard)

Learn any language

## Installing

Simply clone the repository!
Make sure you have the right credentials, as the repository is listed as private.

```sh
git clone https://github.com/quantum9innovation/proto
```

## Building

As of right now, the best way to start working is to spin up a developer build.
This project uses Yarn and the SvelteKit extension for Vite to make builds as fast as possible.
If you don't have Yarn, you can install it via `npm` like so:

```sh
npm i yarn@latest
```

Once you have that taken care of, make sure to run the API before starting the build to copy any config files to the `lib` directory, where they can be accessed by the bridge module.
This can be done with:

```sh
$ node api
API listening on port 3000
```

After the API responds with a message saying it's listening on a specific port, you can end that process and start the build. The above step only needs to be run before the first build and after any subsequent config file changes. Otherwise, you can just skip to the last step to build the development version:

```sh
yarn run dev
```

This will start up Vite and build the site on `http://localhost:5173/`.

## Configuration

Proto reads all its configuration information from a single JSON file in the standard application config directory (e.g. `~/.config/proto` on Unix-based systems).
In that directory, create a file `config.json` and specify any of the following parameters:

**port** (`number (=3000)`)

Here you can tell Proto what port to host the backend (API) on if other ports are already occupied.
This does *not* affect the frontend, which is hosted separately by Vite.

### After any changes...

Make sure to start the API so that your changes can be safely copied to the frontend.
You can do this by running `node api` from the directory where Proto is installed (cloned).
