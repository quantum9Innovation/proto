# Frequently Asked Questions

Here we describe some common problems and how to fix them.
If your problem is not here, please [open an issue](https://github.com/quantum9innovation/proto/issues/new) with the relevant information.

## Resource not found error after continuing to queue review

This is likely because you renamed or moved a file with cards in it from your device's local filesystem.
When you do this, the ID of each card in that document needs to change to reflect its new path.
You can do this by a simple find and replace operation to replace paths starting with `/lang-XX/old/path` with `/lang-XX/new/path` for all documents moved.

## Site identified as unsafe after HTTPS setup

Because Proto's server is locally hosted, the public certificate in your `config.json` is self-signed and not verified by any certificate authority.
The simple solution is to simply ignore this error and continue (on Chrome you may need to click 'Advanced' and then 'Proceed to site' to bypass this message).
The main point of an HTTPS connection is to prevent request interception.
Since you already know the URL to the language server (which is the one specified in `config.json`), the identity checks your browser runs are pointless.
If you dislike this approach, you can (1) use a localhost HTTP connection, which will stop any remote access or (2) add the certificate to your browser's trust store (how to do this depends on various operating system and browser specifics that we won't get into here).

## Production environment file system setup

If you get a file not found error, your Proto language server fails to load, or your storage directory is not being detected, it is likely that your production environment's file system is not set up the way Proto expects it to be.
Say you've extracted a release tarball into some directory `proto/dist`; this directory should contain the following core assets:

```txt
config.json
frontend/*
index.js
package.json
start.sh
bootstrap.sh
storage       # only if stored at `./storage`
```

Then, create a folder `proto/frontend` and copy `proto/dist/frontend/index.html` into it.
Once this is complete, you will be able to start the language server and frontend by running `./start.sh` from `proto/dist`.
Make sure to run `./bootstrap.sh` before if running for the first time.

## Full stack trace/error info is being broadcast in production

Make sure the `NODE_ENV` environment variable is set to `production` before launching the language server to ensure that  server errors are handled internally and not broadcast across potentially insecure channels.
This should already be done when you run `./start.sh` (you can check by running `echo "$NODE_ENV"` in a Bash shell).
