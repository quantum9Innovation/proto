# Todos

## Frontend

- [x] Fix boolean inline checks which require repeat property name
- [x] Calculate ping correctly by measuring full round trip instead of assuming clock synchronization
- [x] Fix <kbd>\\</kbd> keybind activating in text fields, add other keybinds
- [x] Fix fetch errors on creating new/blank document

---

- [ ] First-class mobile and PWA support
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

---

**Completed** :white_check_mark: (v0.4.0)

- [x] Only send checkboxes when checked
- [x] Don't show only grammar properties history in editor info, queue
- [x] Check grammar properties even when there are no input boxes
- [x] Allow editing cards when viewing info
- [x] Use definition as term when testing grammar separately

---

**Completed** :white_check_mark: (v0.3.0)

- [x] Show context in parentheses
- [x] Show part of speech to distinguish between similar terms
- [x] Don't error for cards without grammatical properties
- [x] Use grammar card term instead of standard term
- [x] Add dedicated dark mode
- [x] Fix score display in place (use fixed instead of absolute positioning)
- [x] Remove phrases and grammar properties from review cards before displaying
- [x] Format JSON outputs for easy editing access
- [x] Only use correct responses for spaced repetition calculations (incorrect responses should receive an automatic zero score)
- [x] Only use correct responses for score determination

---

**Completed** :white_check_mark: (v0.2.0)

- [x] Add option not to select a choice
- [x] Use consistent root directory for all VFS and card requests

---

**Completed** :white_check_mark: (v0.1.0)

- [x] Show overall card score on VFS and document screens
- [x] Color score boxes according to score
- [x] Add config option for daily card limit
