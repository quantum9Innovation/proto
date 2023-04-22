# Todos

## Frontend

- [x] Show context in parentheses
- [x] Show part of speech to distinguish between similar terms
- [x] Don't error for cards without grammatical properties
- [x] Use grammar card term instead of standard term
- [x] Add dedicated dark mode
- [x] Fix score display in place (use fixed instead of absolute positioning)
- [ ] Fix fetch errors on creating new/blank document
- [ ] Automatically open frontend on backend start (possibly with config option)
- [ ] Fix accessibility problems
- [ ] Do not check order for multiple choice cards
- [ ] Support JSON with comments or other JSON extensions in config formats
- [ ] Possible frontend testing
- [ ] Transition to new frontend design (see [planned todos](../TODOS.md))

## Backend

- [x] Format JSON outputs for easy editing access
- [x] Only use correct responses for spaced repetition calculations (incorrect responses should receive an automatic zero score)
- [x] Only use correct responses for score determination
- [ ] CI/CD setup and pre-commit hooks
- [ ] Add detailed API endpoint documentation
- [ ] Add enhanced card verification (check if choices are valid)
- [ ] Expand test coverage to edge cases

---

**Completed** :white_check_mark: (v0.2.0)

- [x] Add option not to select a choice
- [x] Use consistent root directory for all VFS and card requests

---

**Completed** :white_check_mark: (v0.1.0)

- [x] Show overall card score on VFS and document screens
- [x] Color score boxes according to score
- [x] Add config option for daily card limit
