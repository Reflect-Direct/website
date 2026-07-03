# Reflect.Direct — Website

Single-page marketing landing page for [reflect.direct](https://reflect.direct), styled in the Claude (Anthropic) design language: warm cream surfaces, coral/terracotta accent, serif display headings over clean sans-serif body copy.

Static site — no build step, no dependencies. Hosted on GitHub Pages: https://reflect-direct.github.io/reflect-direct-website/

## Local development

```bash
python3 -m http.server 4321
```

Then open http://localhost:4321.

## Structure

- `index.html` — page markup and copy
- `styles.css` — all styling

## Making changes

`main` deploys straight to production on every push, so changes go through a branch and pull request rather than a direct push:

1. `git checkout -b your-change`
2. Edit, commit, push the branch
3. Open a pull request against `main`
4. Preview the change locally before merging (e.g. `python3 -m http.server`) — GitHub Pages has no built-in PR preview URLs
5. Merge the PR — GitHub Pages rebuilds `main` automatically within a minute or two
