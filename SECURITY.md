# Security

Please note that Proto is currently in the **public alpha** stage of development.
There will likely be vulnerabilities we don't know about, so avoid using Proto in insecure environments.

## Versions

| Version | Bugfix | Security | Status |
| --- | --- | --- | --- |
| 0.6.0 | :x: | :white_check_mark: | Current |
| >=0.5.0 | :x: | :x: | EOL |

Versions marked with an :x: will not receive security updates.
Make sure you are using a supported version before submitting security vulnerabilities.

## Recommendations

If you are planning on hosting Proto in an insecure environment, we recommend you take numerous measures to safeguard your system from potential attacks.
First, ensure that `NODE_ENV` is set to `production` (if you are launching the server from `start.sh`, this will automatically be done for you).
This will prevent the disclosure of any sensitive information in stack traces.
Also, take advantage of the [permission system](https://nodejs.org/api/permissions.html) in Node v20 to limit access to key resources on your system.
Proto needs read and write access to your storage directory and the parent directory of the folder you are hosting the server from (the one with the `frontend/index.js` in it).
Proto also needs read-only access to any certificate files specified in the config.
Instead of using `start.sh`, we recommend running the following:

```sh
export NODE_ENV=production
node --experimental-permission \
--allow-fs-read=/abs/path/to/proto,/abs/path/to/storage,/abs/path/to/cert \
--allow-fs-write=/abs/path/to/storage index.js
```

Lastly, make sure you are using a secure hosting strategy (in addition to HTTPS and password protection in your Proto config) to prevent more complex attacks.
We can't guarantee that there are no vulnerabilities at this early stage in development, so remain vigilant for any signs of potential attacks and report them by following the instructions listed here.

## Reporting

Use [GitHub's security vulnerability disclosure tool](https://github.com/quantum9Innovation/proto/security) to report any vulnerabilities you find.
**Please do not** publish these as issues or any other public artifact on GitHub or any other site.
We will work to resolve any known vulnerabilities and get back to you as quickly as possible.

## Resolved

These are issues that were resolved prior to the public alpha.

- [x] Validate session
  - This is necessary, along with HTTPS, to prevent the deletion of key resources when accessing the Proto server from another device.
  Without session validation, any attacker could potentially hijack the server by sending modification requests that delete the content of stored documents or overriding the trash directory with blank files of the same name of a file that has already been deleted.
- [x] Switch to HTTPS
  - This is necessary to prevent the deletion of key resources when accessing the Proto server from another device.
  With HTTP, an attacker could potentially hijack the server by sending modification requests that delete the content of stored documents or overriding the trash directory with blank files of the same name of a file that has already been deleted.
- [x] Restrict filesystem access
  - Currently, there are no hard limits on which directories can be accessed, which allows malicious actors to craft requests that include `..` or other variations of the symbol, in effect allowing a path traversal attack to access privileged resources outside the application's scope
- [x] Sanitize filenames
  - This is similar to the previous vulnerability, in which malicious filenames (potentially including `..`) can modify parts of the file system that are outside of the application's scope
