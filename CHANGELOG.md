# Changelog

## v0.8.0

- Remove input suggestions with `autocomplete="off"`
- Option to retest cards (in case of typo)
- Fine-tune forgetting curve parameters

## v0.7.0

- Randomize initial queue order
- Add enter keybind in queue
- Add option to skip review if correct

## v0.6.0

- Fill out [FAQs](./FAQ.md) with more questions
- Reorganize important repository files into parent directory
- Add [API setup documentation](./docs/setup.md)
- Add [frontend usage documentation](./docs/usage.md)
- Review current [API](./api/README.md), [README](./README.md), and other docs
- Add [Open Source Licenses page](./OSL.md)
- Add any necessary theory and example usage to [API docs](./docs/philosophy.md)
- Confirm all deletions in popup
- Reset select objects in grammar properties after card creation
- Use [appropriate Noto fonts](./api/frontend/assets/noto-universal.ttf) for each language
- Fix byte length errors with PINs
- Hide detailed error messages from frontend (see [FAQ](./FAQ.md#full-stack-traceerror-info-is-being-broadcast-in-production))

---

## v0.5.0

- Fix boolean inline checks which require repeat property name
- Calculate ping correctly by measuring full round trip instead of assuming clock synchronization
- Fix <kbd>\\</kbd> keybind activating in text fields, add other keybinds
- Fix fetch errors on creating new/blank document

---

## v0.4.0

- Only send checkboxes when checked
- Don't show only grammar properties history in editor info, queue
- Check grammar properties even when there are no input boxes
- Allow editing cards when viewing info
- Use definition as term when testing grammar separately

---

## v0.3.0

- Show context in parentheses
- Show part of speech to distinguish between similar terms
- Don't error for cards without grammatical properties
- Use grammar card term instead of standard term
- Add dedicated dark mode
- Fix score display in place (use fixed instead of absolute positioning)
- Remove phrases and grammar properties from review cards before displaying
- Format JSON outputs for easy editing access
- Only use correct responses for spaced repetition calculations (incorrect responses should receive an automatic zero score)
- Only use correct responses for score determination

---

## v0.2.0

- Add option not to select a choice
- Use consistent root directory for all VFS and card requests

---

## v0.1.0

- Show overall card score on VFS and document screens
- Color score boxes according to score
- Add config option for daily card limit
