# Repository Guidelines

## Project Structure & Module Organization
This repository is a VitePress-based personal blog. Core site config lives in `.vitepress/config.mts`, and the custom theme is under `.vitepress/theme/` with Vue components, Less styles, and post utilities. Content pages are Markdown files in `posts/`, with section entry pages in `index.md` and `tags/index.md`. Static assets such as images, fonts, audio, and Spine resources live in `public/`. Generated output in `.vitepress/dist/` and cache files in `.vitepress/cache/` should not be edited manually.

## Build, Test, and Development Commands
Use `pnpm` for all package management.

- `pnpm install` installs dependencies.
- `pnpm run dev` starts the local VitePress dev server.
- `pnpm run build` builds the production site into `.vitepress/dist/`.
- `pnpm run preview` serves the built site locally for a final check.

Before opening a PR, run `pnpm run build` to catch broken imports, invalid frontmatter, or theme issues.

## Coding Style & Naming Conventions
Follow `.editorconfig`: 2-space indentation, UTF-8, LF line endings, and a final newline. Prettier settings are defined in `.prettierrc.json`: single quotes, no semicolons, `printWidth` 100, and trailing commas where valid. Keep Vue and TypeScript files consistent with the existing theme code. Use descriptive PascalCase for Vue components (for example, `Posts-List.vue`) and kebab-case for Markdown content files (for example, `makefile-learn.md`).

## Testing Guidelines
There is currently no dedicated automated test framework in this repository. Validation is build-based: run `pnpm run build`, then `pnpm run preview` and spot-check key pages such as the homepage, post list, and changed article routes. For content changes, verify frontmatter fields like `title`, `date`, `tags`, and `pinned` match the conventions shown in `readme.md`.

## Commit & Pull Request Guidelines
Recent history mixes short Chinese summaries and `feat(posts/): ...` style messages. Prefer concise, imperative commit subjects with a clear scope when helpful, such as `feat(theme): refine banner layout` or `docs(posts): add new article`. Pull requests should include a brief summary, impacted paths, screenshots for UI/theme changes, and linked issues when applicable. Mention any follow-up work or manual verification steps.

## Deployment Notes
GitHub Pages deployment is defined in `.github/workflows/deploy.yml`. Pushes to `main` trigger a production build and publish flow using Node 20 and `pnpm`.
