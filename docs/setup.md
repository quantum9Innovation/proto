# Setup

This document will go over how to install and properly configure the Proto Language Server.
If you have not yet installed or just installed Proto and want to know what to do next, keep reading.

---

## Dependencies

Make sure you have these installed before continuing to future steps!
Even if you already installed Proto, if you do not have certain core dependencies, you may not be able to deploy the language server.

Since Proto's releases are currently not compiled for any operating system, you'll need [Node.js](https://nodejs.org) or another local Javascript runtime to start the language server.
Please note that Proto has not been tested with any non-Node.js runtime and may require significant manual configuration and additional dependency installations to work properly with other runtimes.
The rest of this documentation will assume you are using the Node.js runtime.

We also recommend installing [Yarn](https://yarnpkg.com), as the bootstrapping script uses it to install Proto's dependencies.
Installation instructions for Yarn can be found [here](https://yarnpkg.com/getting-started/install).
If you choose to use npm, which ships with Node.js, you will need to run the bootstrapping commands manually.

## Installation

This section will go over how to install the Proto Language Server.
If you've already done this, you can skip to the [next section](#extraction).

All current Proto releases are bundled as tarballs on GitHub.
Go to this repository's [releases page](https://github.com/quantum9Innovation/proto/releases) and choose the latest release.
Currently, Proto is in the **public alpha** stage of development, so expect to see a few bugs and some significant changes in the future.
Downloading the latest release will ensure that any known security vulnerabilities have been resolved (see our [security policy](../SECURITY.md) for more information about security in the **public alpha** stage of development).

Under the release assets, look for `dist-x.y.z.tar.gz`.
`x`, `y`, and `z` should match the major, minor, and patch version numbers of the tag name, respectively.
If they don't, please report this as an [issue](https://github.com/quantum9Innovation/proto/issues/new) so we can fix it as soon as possible.

We try to keep release assets as small as possible, so all distributed assets are currently well under 1 MB.
We recommend checking for new releases often to ensure you don't miss any important updates (watching the repository for releases is one way to do this).
You can also view our [changelog](../CHANGELOG.md) for details about new releases.

## Extraction

:tada: Congratulations! You've successfully installed the Proto Language Server.
The next step is to extract the tarball to your local machine.
Move the downloaded tarball to an isolated directory (`~/proto` for example) and then run the following commands from inside that directory:

```sh
~/proto: mkdir dist
~/proto: tar -xzvf dist-x.y.z.tar.gz dist  # replace with version  
~/proto: cd dist; ls
```

You should see two Bash scripts `start.sh` and `bootstrap.sh` show up in the list of files.
Since this is your first time starting the language server, you'll need to run `bootstrap.sh` once to install the project dependencies.
You *do not* need to run this again if it completes successfully.

```sh
~/proto/dist: chmod +x bootstrap.sh
~/proto/dist: ./bootstrap.sh
```

If you don't have npm, you will get an error saying that `yarn` is not found.
After running `bootstrap.sh`, run `npm install` to finish installing project dependencies.
Alternatively, you can manually run a modified version of the bootstrap script:

```sh
#!/bin/bash
cd ..
mkdir frontend
mv dist/frontend/index.html frontend/index.html
cd dist; npm install
```

## Configuration

Before you can start the server, you will need to provide a configuration file and an appropriate storage directory.
Inside the `dist` directory where you extracted the tarball (`~/proto/dist` in this example), create a file `config.json` with the following format:

```ts
{
  host: string
  port: number
  root: string
  https?: {
    key: string
    cert: string
    pin?: string
  }
  settings?: {
    limit?: number
  }
}
```

### Server

The `host` and `port` parameters will control where the API listens for requests and are printed to the console when the server starts.
This determines the link that will be used to access the frontend.
For example, if `host='localhost'` and `port=8080`, the frontend will be hosted at `http://localhost:8080`.

### Storage

The `root` parameter contains the storage directory for your knowledge base.
This directory will be created if it doesn't already exist.
You can specify either a relative path, absolute path, or home-relative path (e.g. `~/proto/storage`).
Backup this directory often!
If you lose the contents of this directory, you will not be able to access any cards or documents that you have created or studied.
We highly recommend you read [syncing with Git](#syncing-with-git) for an option to store your knowledge base in a Git repository.

### HTTPS

If you plan on hosting from any non-localhost origin (e.g. `192.168.0.100` or your local IP address), it's a good idea to configure a password-protected HTTPS server to prevent unauthorized access or resource deletion over the network.
We recommend using [mkcert](https://github.com/FiloSottile/mkcert) to create locally-trusted HTTPS certificates.
The `key` and `cert` parameters take in relative, absolute, or home-relative paths to the key and certificate files, respectively.
Then, specify a password string and set it in the `pin` parameter.
You will be prompted once on each new device to enter the password when accessing the site.
The password is stored as a plaintext cookie on each device unless you logout with <kbd>Ctrl</kbd>+<kbd>Q</kbd> (will not work on mobile devices).
Note that enabling HTTPS without password protection adds **little to no security** since all resources can still be accessed over the network without any authentication.
If you plan on hosting your server publicly or over an insecure network, **make sure you read the suggestions in our [security policy](../SECURITY.md)** before continuing (there may still be unresolved security vulnerabilities we don't know about).

### Settings

We highly recommend setting the `limit` parameter to the number of cards you want to be tested on each time you start the queue.
If you don't set it, you may encounter problems with the server.
When specified, the queue will continue to run past the limit given, but the way that incorrect responses are handled will change after the limit threshold is reached.
Before the limit is reached, incorrect cards will be saved and tested at the end of the queue (after the number of cards specified by the limit has been tested).
After the limit is reached, cards are retested immediately following an incorrect response.
Your progress towards the limit is reset each time you start a new queue session.

## Starting the Server

Inside the `dist` folder, you should find a Bash script `start.sh`.
This script will automatically set the `NODE_ENV` environment variable to `production` and start the server on the desired host and port.
The server is actually run from `index.js`, which is a single JavaScript file containing the entire Proto Language Server backend logic.

```sh
~/proto/dist: chmod +x start.sh
~/proto/dist: ./start.sh
```

Follow the link printed in the terminal to open the frontend in a browser.
When you open the frontend, you will probably see a blank page labeled 'Files' with three buttons.
You may also see a file `session.json`, which you won't be able to open or edit from the frontend.
This file stores certain identifying information about your current session and is replaced each time you reconnect to the server.
Proto is a single-page application (SPA), so there is only one URL necessary to access all parts of the frontend.
Any errors encountered during usage will be printed in the terminal and likely logged to the console on the frontend.
Ending the server is as simple as ending the `start.sh` script with <kbd>Ctrl</kbd>+<kbd>C</kbd>.
For diagnostics, append `/api` to the URL printed in the terminal.
It will bring up a page with the following information:

```txt
Local Proto (vx.y.z) server listening on port http(s)://host:port
Running Express version on Node va.b.c
Serving as text/html; charset=utf-8 with status code 200 over http(s)
```

Include this information in any issue reports you submit so we can identify if it is a system-related problem and replicate it.

## Syncing with Git

We highly recommend syncing your storage directory with Git.
This will prevent accidental deletions of cards and documents that you have created or studied.
When you delete a document or folder, Proto will normally move it to a trash directory called `purged` within your storage directory, with certain exceptions.
Among these are cases when a document has the same name (path is irrelevant) as another file already in the trash directory, in which case the file selected for deletion will be permanently deleted.
Card deletions are also permanent as they are considered document modifications.
Since Proto does not use your system trash (it uses a Node.js `rm` equivalent), these deletions are usually permanent and irreversible.
However, syncing the storage directory with Git will allow you to revert to previous commits and restore the deleted files.
If your storage directory is contained within `dist`, then you may want to consider syncing the entire `dist` directory as well, since it will make it easier to start Proto from other devices.

To do this, simply open either your storage directory or `dist` and run:

```sh
~/proto/dist: git init
~/proto/dist: git add .
~/proto/dist: git commit -m "Initial commit"
# if you plan on syncing to a cloud provider (e.g. GitHub)
~/proto/dist: git remote add upstream <url>
~/proto/dist: git push -u upstream main  # or equivalent main branch
```

Every so often, we recommend creating a commit to have multiple backups that you can revert to.
You can do this with:

```sh
~/proto/dist: git add .
# using a date and time in your commit will make it easy to identify
~/proto/dist: git commit -m "1/1/23 12:00 p.m."
~/proto/dist: git push  # if remote exists
```

This will ensure your knowledge base is always backed up and provides a failsafe in case anything malfunctions.

## Updating

Proto will likely have many more releases in the months to come, and we recommend updating to the latest version to stay clear of any security vulnerabilities.
You can check our [changelog](../CHANGELOG.md) to track changes in new releases.
If you decide to upgrade, download the `dist-x.y.z.tar.gz` file from the release assets and move it into the Proto directory you created in the [installation step](#installation) (parent directory of `dist`—`~/proto` in this example).
From this directory, run:

```sh
# replace with version
# extract to the directory containing your config
~/proto: tar -xzf dist-x.y.z.tar.gz -C dist --strip-components=1
~/proto: cd dist
~/proto/dist: chmod +x start.sh
~/proto/dist: chmod +x bootstrap.sh
```

You should extract the tarball to your current `dist` directory (the place you start the Proto Language Server from).
This is safe as it will only replace the previously installed files and not additional ones (e.g. `config.json`), so you can continue to use the Proto Language Server as normal.
However, before starting it again, you'll need to rerun the bootstrapper (or manually run the modified version mentioned in [Extraction](#extraction) if you don't have Yarn).

```sh
~/proto/dist: ./bootstrap.sh  # only necessary before first run
~/proto/dist: ./start.sh
```

That should start the server with the new version of the Proto Language Server.
You can check the Proto version by appending `/api` to the URL printed in the terminal.
