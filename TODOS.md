# Todos

## Scheduled

- [x] Remove input suggestions with `autocomplete="off"`
- [x] Option to retest cards (in case of typo)
- [x] Fine-tune forgetting curve parameters

## Long-term

- [ ] Accurate progress bar
- [ ] Minimize history resets on edit
- [ ] Create dedicated edit endpoint
- [ ] Allow searching for cards, by tags e.g.
- [ ] Add plugin support
- [ ] Distribute compiled language server binaries
- [ ] Switch to SQLite-based database
- [ ] Allow custom forgetting curves
- [ ] Allow configuration from frontend
- [ ] Work on grammar tab

## Frontend

- [ ] Automatically check for updates and security/bugfix status
- [ ] Only show start queue button when valid
- [ ] Restructure API settings endpoints
- [ ] Create PWA to cache network assets
- [ ] Fetch large files over network to reduce release size
- [ ] Remove spellcheck and autofill from input boxes
- [ ] First-class mobile support
- [ ] Automatically open frontend on backend start (possibly with config option)
- [ ] Fix accessibility problems
- [ ] Do not check order for multiple choice cards
- [ ] Support JSON with comments or other JSON extensions in config formats
- [ ] Possible frontend testing
- [ ] Stricter type controls on frontend
- [ ] Transition to new frontend design (see [planned todos](../TODOS.md))

## Backend

- [ ] Consider switching imports to use `require()`
- [ ] Debug unusual spaced repetition behaviors
- [ ] Decide on how to structure phrases
- [ ] Context-dependent grammar properties (only show certain properties when a part of speech or other context matches some criteria)
- [ ] Add automatic card ID checking and history rescoring
- [ ] Auto-detect duplicate cards with same term, PoS, and context
- [ ] CI/CD setup and pre-commit hooks
- [ ] Add detailed API endpoint documentation
- [ ] Use type coercion and type verification for requests
- [ ] Add enhanced card verification (check if choices are valid)
- [ ] Expand test coverage to edge cases

## After public debut

*These directives were originally created for a Flutter frontend.*  
All the following directives must be adapted for the new frontend framework before its release.
<!-- TODO: update todos for new frontend -->

- [ ] Create an automatic workflow to build production translations from incomplete Crowdin translations
- [ ] Fix Crowdin changing .arb metadata
- [ ] Add a code coverage provider to tests
  - Use CodeCov or another provider so that GitHub workflows will include code coverage analysis, which should ideally remain at 100%
- [ ] First-class support for RTL languages
- [ ] Check if icons and symbolism are properly localized and understood
- [ ] Add responsive design and full support for all devices, including mobile
- [ ] Add localization support for iOS
- [ ] First-class support for vertical typesetting (Mongolian)
