# Frequently Asked Questions

Here we describe some common problems and how to fix them.
If your problem is not here, please [open an issue](https://github.com/quantum9innovation/proto/issues/new) with the relevant information.

## Resource not found error after continuing to queue review

This is likely because you renamed or moved a file with cards in it from your device's local filesystem.
When you do this, the ID of each card in that document needs to change to reflect its new path.
You can do this by a simple find and replace operation to replace paths starting with `/lang-XX/old/path` with `/lang-XX/new/path` for all documents moved.
