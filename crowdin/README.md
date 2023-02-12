# Localization

All localization is handled through [Crowdin](https://crowdin.com/) and automatically pushed to this directory.
[`app_en.arb`](../../lib/l10n/app_en.arb) is the source English translation but Crowdin translations are pushed here.
Translations here **do not** affect the production version, which needs to be built separately since Crowdin does not feature adequate support for .arb files.
