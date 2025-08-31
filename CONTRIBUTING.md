# Contributing to CST SmartDesk

## Development Process

1. **Create Feature Branch**: `git checkout -b feat/your-feature-name`
2. **Make Changes**: Follow the code style and run checks locally
3. **Run Quality Checks**:
   ```bash
   npm run lint
   npm test
   node doctor.mjs
   ```
4. **Commit with Conventional Format**:
   - `feat:` for new features
   - `fix:` for bug fixes
   - `docs:` for documentation
   - `refactor:` for code refactoring
5. **Create Draft PR**: Use GitHub's draft PR feature
6. **Address CI/CD Feedback**: Fix any failing checks
7. **Mark PR Ready**: Convert to regular PR when ready

## Quality Standards

- All tests must pass
- No ESLint errors or warnings
- Spell check must pass
- Accessibility standards met
- Documentation updated for changes

## PR Checklist

- [ ] Code follows style guidelines
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] No breaking changes
- [ ] PR title follows conventional format
