# Contribution Guide

We're so glad you want to contribute! :art:

Proto is still an evolving project and contributions from the open-source community are always welcome!
If you are working on anything technical, [these docs](./api/docs/) may be of use to you, but please know that much of the internal logic has yet to be documented and may change rapidly.

When working on a contribution, you can run tests locally from the `api` folder, which contains most of the source code.
Running `pnpm install` will automatically build the tools you need to work with the code.
From there, `pnpm build` and `pnpm test` will build both the backend and frontend and then test the API.
Try to keep code coverage as high as possible (we aim for 100% ignoring repeated code).
To test the frontend, run `pnpm start` after building the source code.
When you are ready to submit a pull request, you can run `pnpm dist` to generate a full release distribution.
The [API README](./api/README.md) covers the development process more in-depth.

If at any time you encounter an issue or need help with Proto, please [open an issue](https://github.com/quantum9innovation/proto/issues/new) and provide us with basic information about your version and system (you can get this by attaching /api to your standard frontend URL).
