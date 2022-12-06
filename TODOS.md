# Todos

- [ ] Add a code coverage provider to tests
  - Use CodeCov or another provider so that GitHub workflows will include code coverage analysis, which should ideally remain at 100%
- [ ] Run API tests simultaneously
  - Run `jest` without `--runInBand` command-line argument or structure tests to pass while still allowing simultaneous or semi-simultaneous execution
