# GitHub delivery and manual publication

No repository was created, no source was pushed and no website was published
while preparing this package. The code is independent of earlier projects.

## Upload the source folder

1. Extract `NuclearIsotopeID-Lab-v1.0.0.zip`.
2. Create the repository yourself with the suggested name `NuclearIsotopeID-Lab`.
3. Upload the **contents inside** the extracted `NuclearIsotopeID-Lab/` folder
   into the repository root, so `package.json`, `src/`, `data/`, `docs/`, and
   `.github/` are at the top level. Do not upload only the ZIP or put the whole
   repository inside an extra nested folder.
4. Include the lockfile and source snapshots. Do not commit `node_modules/`.
5. Commit to your main branch. The CI workflow checks the scientific tests,
   every reference-data row/hash, offline data reconstruction, TypeScript,
   production builds, standalone DOM execution, and real Chromium scenarios.
   Wait for those actual results; this package does not invent a GitHub CI run.

Optional Git CLI flow, from the extracted project root:

```bash
git init
git add .
git commit -m "Initial Nuclear Isotope Identification Lab release"
git branch -M main
git remote add origin YOUR_REPOSITORY_URL
git push -u origin main
```

`YOUR_REPOSITORY_URL` is a user-supplied value, not a claimed existing remote.

## Explicitly publish, only when you choose

1. Review the limitations and inspect the successful checks.
2. In repository Settings > Pages, set the source to GitHub Actions.
3. Open Actions > Publish GitHub Pages (manual approval) > Run workflow.
4. Only if you intend publication, set `approve_publish` to true and run it.
5. After a successful deployment, use the URL returned by that workflow.

The workflow has **no push trigger and no schedule**. The false default approval
input skips publication. It uses `/NuclearIsotopeID-Lab/` as Vite base. If you
rename the repository, update that value before running the workflow. The
standalone HTML remains self-contained and does not require that base path.

The Pages workflow runs verification and actual browser tests before deploying.
Its separate deployment job needs the build artifact and uses the github-pages
environment. Source action versions were checked against official GitHub action
and Pages documentation; these workflows have not yet been executed remotely.

Primary references:

- https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages
- https://github.com/actions/setup-node

## Production-only upload

For another static host, serve the contents of `dist/`. For direct local use,
open `dist/NuclearIsotopeID-Lab.html`. Do not serve source TypeScript as if it
were the built application. Hash routing keeps the fifteen internal pages from
needing server-side route rewrites.
