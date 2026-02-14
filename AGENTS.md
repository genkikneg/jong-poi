# Repository Guidelines
日本語で答えてください。

## Project Structure & Module Organization
Laravel application code lives in `app/` (HTTP controllers, jobs, models) with configuration under `config/` and bootstrapping in `bootstrap/`. Front-end files sit in `resources/js`, where `pages/` map to Inertia routes, `components/` hold shared UI, and `layouts/` provide shells used by `resources/views/app.blade.php`. Tailwind styles reside in `resources/css`, and public assets belong in `public/`. Tests split between `tests/Feature` and `tests/Unit`, while factories and seeders live under `database/`.

## Build, Test, and Development Commands
Install dependencies via `composer install && npm install`, copy `.env.example`, and run `php artisan key:generate`. Use `composer dev` for the full-stack watcher (HTTP server, queue listener, Pail logs, Vite). Production bundles come from `npm run build` or `npm run build:ssr`. Static checks: `npm run lint`, `npm run types`, `npm run format:check`, and `composer lint`. Execute `composer test` for Pint plus `php artisan test`.

## Coding Style & Naming Conventions
PHP follows Laravel Pint (PSR-12, four-space indent, StudlyCase classes, snake_case database columns). Keep namespaces in sync with folder structure and avoid facades in domain logic. React/TypeScript files use PascalCase components, camelCase hooks/utilities, and named exports for modules in `resources/js/lib`. Prettier with the Tailwind plugin enforces utility ordering—never hand-sort classes. Favor descriptive directory names (e.g., `resources/js/actions/onboarding`) over deep nesting.

## Testing Guidelines
Every HTTP change needs a `tests/Feature/*Test.php` covering the request, authorization, and response payload. Extract pure logic into services or hooks with matching `tests/Unit/*Test.php`. Refresh databases with `RefreshDatabase`, seed via `database/seeders`, and generate factories for new models. Before pushing, run `composer test`, optionally `php artisan test --group=<name>`, and capture TypeScript errors with `npm run types`.

## Commit & Pull Request Guidelines
This working copy lacks Git history, so default to concise imperative commit summaries (<=72 chars) plus optional bodies describing context and migrations (e.g., `fix: guard museum image uploads`). Pull requests should include a short narrative, screenshots or recordings for UI, linked issues (`Closes #123`), and a checklist of commands executed. Call out schema or queue changes explicitly so deployers can run `php artisan migrate` or restart workers.

## Environment & Security Notes
Store secrets only in `.env` and never commit that file or anything under `storage/`. After cloning new environments, run `php artisan config:clear` followed by `npm run build` before caching config/routes. When adding third-party services, document the required ENV keys and fallbacks. Avoid embedding API keys in React code—pass them through server-rendered props or backend endpoints instead.
