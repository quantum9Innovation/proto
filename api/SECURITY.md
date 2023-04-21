# Security

Normally this document would contain a security policy of sorts, which would be ideal for a stable release.
However, given the precarious state of this project, this document is being turned into a security vulnerability tracker so that we can fix all the necessary problems before a stable release, by which point these issues **must** be resolved.

- [ ] Switch to HTTPS
  - This is necessary to prevent the deletion of key resources when accessing the Proto server from another device.
  With HTTP, an attacker could potentially hijack the server by sending modification requests that delete the content of stored documents or overriding the trash directory with blank files of the same name of a file that has already been deleted.
- [x] Restrict filesystem access
  - Currently, there are no hard limits on which directories can be accessed, which allows malicious actors to craft requests that include `..` or other variations of the symbol, in effect allowing a path traversal attack to access privileged resources outside the application's scope
- [ ] Sanitize filenames
  - This is similar to the previous vulnerability, in which malicious filenames (potentially including `..`) can modify parts of the file system that are outside of the application's scope
