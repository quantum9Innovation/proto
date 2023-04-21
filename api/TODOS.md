# Todos

## Frontend

**Completed** :white_check_mark: (v0.1.0)

- [x] Show overall card score on VFS and document screens
- [x] Color score boxes according to score
- [x] Add config option for daily card limit

---

- [x] Add option not to select a choice
- [ ] Add dedicated dark mode
- [ ] Fix fetch errors on creating new/blank document
- [ ] Automatically open frontend on backend start (possibly with config option)
- [ ] Fix accessibility problems
- [ ] Do not check order for multiple choice cards
- [ ] Support JSON with comments or other JSON extensions in config formats
- [ ] Possible frontend testing
- [ ] Transition to new frontend design (see [planned todos](../TODOS.md))

## Backend

- [ ] Only use correct responses for spaced repetition calculations (incorrect responses should receive an automatic zero score)
- [ ] Automatically clear history for cards when a certain criteria is met
- [ ] Add detailed API endpoint documentation
- [ ] Add enhanced card verification (check if choices are valid)
- [ ] Test against directory traversal attacks
- [ ] Expand test coverage to error cases
