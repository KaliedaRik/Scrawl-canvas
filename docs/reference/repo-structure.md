# Repository structure, and release protocol
A brief overview of the Scrawl-canvas repo's folders and files, together with instructions on the steps to take when releasing a new version of the repo to NPM.

## GitHub branch policy
The Scrawl-canvas repo includes two branches - `v8` and `v8-dev` - alongside any number of development and investigation branches.

### v8 branch

`v8` is the default branch against which all [NPM releases](https://www.npmjs.com/package/scrawl-canvas) take place. The only branch that should merge into it is `v8-dev`, and this should only happen as part of a new version release.

### v8-dev branch

`v8-dev` is the current release candidate branch. For any new development or maintenance work, a new branch should be checked out from it and, when work completes satisfactorily, merged back into it.

Final testing prior to a new release should take place on the `v8-dev` branch as part of a PR to merge into `v8`. Once the merge completes repo-devs can either retain the current `v8-dev` branch for the next release candidate, or delete it and create a new `v8-dev` branch from the `v8` branch.

Development or maintenance branches merge into `v8-dev` via a PR, so repo-devs can keep track of the work they contain.

### History
The repo used to contain `v6` and `v7` branches, but they were deleted once the decision was made not to maintain them. At some point in the future a `v9` branch may be created, should the code ever require a substantial rewrite - for example if repo-devs ever move code over to WASM, or reintroduce Web Workers, or convert the entire codebase over to Typescript.

## Repository structure
The Scrawl-canvas repo on GitHub is a complete package to maintain and develop the SC frontend code which gets imported into a web page. As such, the repo includes documentation and testing (demo) code, alongside the source code and configuration files for the developer toolchain.

### Top level documentation
The essential files are as follows:

+ `package.json` - SC gets released as an [NPM package](https://www.npmjs.com/). The file needs to be updated with version data for each new release.
+ `README.md` - This file displays in various places, thus needs to be updated for each release.
+ `LICENSE.md` - Scrawl-canvas uses the standard [MIT license](https://opensource.org/license/mit).

### Development toolchain
Most files relating to the dev toolchain reside in the root of the repo. These can be broken down as follows:

#### Git, GitHub, NPM
+ `.github/*`
+ `.gitattributes`
+ `.gitignore`
+ `.npmignore`

#### Yarn
SC uses [Yarn v4](https://yarnpkg.com/) as the basis for the dev toolchain, as recorded in the `package.json` file. The following folders and files are present in the remote git; other yarn-associated files are git-ignored:

+ `.yarn/releases/*.cjs`
+ `.yarnrc.yml`
+ `yarn.lock`

#### Building: Rollup
The SC frontend (source) code gets built and bundled using [Rollup](https://rollupjs.org/) and its [terser](https://www.npmjs.com/package/@rollup/plugin-terser) plugin. Only the **ES modules** output format is supported.

Scrawl-canvas runs in browser environments only. There are no plans at this time to support functionality to get SC running in any non-browser environments (Node, Bun, Deno, etc).

Running the `yarn build-min` command (also invoked when running `yarn build`) will bundle and minify the SC frontend (source) code. The `package.json` file points to the minified file as the main entry point for running the code in the front end.

+ `rollup.config.js`
+ `min/scrawl.js`

#### Building: Docco
SC uses [Docco](https://ashkenas.com/docco/) to auto-generate dev-user documentation from inline comments in both the SC frontend (source) and demo code. Running the `yarn build-docco` command (also invoked when running `yarn build`) will generate the documentation files, which live in the `docs/demo` and `docs/source` folders.

Additional documentation files were generated when Docco was first added to the repo, and can be updated by hand:

+ `docs/public/fonts/*`
+ `docs/public/stylesheets/*`

SC provides the (handwritten) index file for easy browser navigation around the documents as part of the development experience:

+ `docs/index.html`
+ `docs/docco.css`

#### Building: Showdown
The Developer Runbook page files live in the `docs/reference` folder. These are written in (simple) `.md` markdown files. Repo-devs use [Showdown](https://showdownjs.com/docs/) to convert these files into `.html` documents which live in the same folder. Running the `yarn build-showdown` command (also invoked when running `yarn build`) generates the `.html` files.

Files specific to the Developer Runbook toolchain:

+ `scripts/build-reference-docs.mjs`
+ `docs/reference/*`
+ `docs/css/*`

#### Testing: Eslint
Repo-devs lint both the SC frontend (source) and demo code using [ESLint](https://eslint.org/) - command: `yarn lint`.

+ `eslint.config.mjs`

#### Testing: Knip
Repo-devs use [Knip](https://knip.dev/) to find and fix unused files, exports and dependencies in the SC frontend (source) code - command: `yarn knip`.

+ `knip.json`

#### Testing: Typescript
The Scrawl-canvas source code is written in Javascript. There are no plans to convert the codebase over to [Typescript](https://www.typescriptlang.org/) at any point in the near-mid future.

Repo-devs use the TS parser for testing both the SC frontend (source) and demo code against the repo's TS definitions (`.d.ts`) file - this is mainly to identify errors in that file - command: `yarn test`.

The `.d.ts` file is ***not*** autogenerated, but rather hand-written, relying mainly on interfaces to define the SC public API used in frontend code. 

+ `tsconfig.json`
+ `source/scrawl.d.ts`

### Development and testing: Browser-sync
The bulk of development testing is handled manually - if anyone can come up with a way of automating (mostly) animated and interactive integration tests, some PRs in that direction would be most gratefully received! For a walk-through on how to conduct this manual testing, see this [Substack post with added YouTube videos](https://rikroots.substack.com/p/testing-as-an-act-of-fun).

The integration tests are a set of handwritten demo files in the `demo` folder. Each test includes an `html` file and a `js` file sharing the same name. Additional module and asset files used in the demos can be found in various subfolders:

+ `demo/*.html`
+ `demo/*.js`
+ `demo/data/*`
+ `demo/img/*`
+ `demo/modules/*`
+ `demo/packets/*`
+ `demo/snippets/*`

All demo tests will also import additional testing and convenience code from the `demo/utilities.js` module.

To perform development work on the source code, or test the demos, run the command `yarn dev`.

SC uses the [browser-sync](https://browsersync.io/) server to handle browser testing as it allows repo-devs to test each demo on multiple browsers (generally Chrome, Firefox and Safari) at the same time. Additional local site files can be found as follows:

+ `index.html`
+ `favicon.png`
+ `docs/index.html`
+ `docs/docco.css`
+ `docs/reference/index.html`
+ `docs/css/*.css`
+ `demo/index.html`
+ `demo/css/*.css`
+ `demo/thumbs/*.webp`

When creating a new demo test, remember to update these local site files (`demo/index.html`, `docs/index.html`) appropriately with links to the demo. The demos on each side of the new test will also need their `.html` files updated to align to the new test navigation experience.

For ad-hoc or speculative development, repo-devs and dev-users can create a new demo and prefix the files associated with it with `temp-` (eg `demo/temp-mytest-01.html`, `demo/temp-mytest-01.js`). Files in the `demo` and `docs` folders which start with `temp-` are git-ignored and won't be saved as part of the repo.

### Development and testing: source code
See the [Scrawl-canvas source code structure](source-code-structure.html) page for details.

## Releasing a new version of Scrawl-canvas
Version release has not (yet) been automated, which means the following steps need to be performed manually. Note that when repo-devs release a new version, the work spreads beyond this repo:

+ Updates need to be made to the [scrawl-canvas-website](https://github.com/KaliedaRik/scrawl-canvas-website) repo, in particular updating all mentions of the previous version to the new version, and copying over some folders to the website repo.
+ All the Pens held in the [Scrawl-canvas CodePens collection](https://codepen.io/collection/RzzMjw) need to be updated to use the latest release.

### Release steps

#### GitHub

1: All outstanding development branches that will be part of the release need to be merged into `v8-dev`.

2: Generate a PR from the `v8-dev` branch on GitHub - make a note of all the changes that will be included in the release in the PR description (use previous release notes for inspiration).

#### Local SC root

3: Perform a complete testing sweep against `v8-dev` locally:
+ Manual testing of all demos in Chrome, Firefox and Safari browsers - fix any non-working demos, pushing changes to the PR
+ Run `yarn lint` to identify (and fix) any JS linting issues; push changes to the PR.
+ Run `yarn knip` to remove unnecessary code; push changes to the PR.
+ Run `yarn test` to fix any issues in the `d.ts` definitions file; push changes to the PR.
+ Should the testing have generated a large number of fixes pushed to the PR, testing needs to be repeated.

4: All (relevant) references to the previous release version (in the form `x.y.z` and also `x-y-z`) need to be updated across files; the release date also needs to be updated in a couple of files. Current affected files include:
+ `demo/dom-001.html`
+ `demo/index.html`
+ `docs/index.html`
+ `docs/reference/index.html`
+ `source/core/library.js`
+ `source/scrawl.d.ts`
+ `source/scrawl.js`
+ `index.html`
+ `package.json` (twice)
+ `README.md` (several times)

5: Run `yarn build` to update the documentation and create the minified file. Push these changes to the PR.

#### Local SC parent folder

6: Create a zipped file of the minified code: `zip -r scrawl-canvas_x-y-z.zip ./Scrawl-canvas/min/`

#### Local scrawl-canvas-website

7: Dogfood the upcoming release by copying `scrawl-canvas/min/` and `scrawl-canvas/source` folders over to `scrawl-canvas-website/node_modules/scrawl-canvas`.

8: Smoke test the website by running `yarn dev` - dogfooding of the minified file happens on the "Tour" landing page. If the canvases break they will either need fixing to work with the new release, or there's an undiscovered bug in SC itself which needs to be investigated.

9: If all goes well, all (relevant) references to the previous release version (in the form `x.y.z` and also `x-y-z`) need to be updated across scrawl-canvas-website files; the release date also needs to be updated in a couple of files. Current affected files include:
+ `public/cookbook/add-using-cdn.html`
+ `public/cookbook/display-cycle.html`
+ `public/cookbook/scene-graph.html`
+ `public/lessons/eighth-lesson.html`
+ `public/lessons/eleventh-lesson.html`
+ `public/lessons/first-lesson.html`
+ `public/lessons/fourth-lesson.html`
+ `public/lessons/second-lesson.html`
+ `public/lessons/seventh-lesson.html`
+ `public/lessons/third-lesson.html`
+ `public/lessons/twelfth-lesson.html`
+ `src/components/FooterLinks.svelte`

10: Copy the zip file created in step 6 into the `scrawl-canvas-website/public/downloads` folder.

11: Copy the following folders from the Scrawl-canvas repo into the `scrawl-canvas-website/public/` folder:
+ `demo/`
+ `docs/`
+ `min/`
+ `source/`

12: Rerun `yarn dev` and smoke check the entire scrawl-canvas-website site.

#### GitHub

13: Merge the `v8-dev` PR into `v8`. If the `v8-dev` branch gets (accidentally) deleted during the process, repo-devs can recreate it from Local

#### Local SC root

14: Checkout the `v8` branch and pull from remote

15: Run `npm publish` (requires permissions to publish to NPM registry)

16: Checkout the `v8-dev` branch and merge `v8` into it. Push to remote.

#### GitHub

17: Create a new release.

#### Local scrawl-canvas-website

18: Run:
+ `yarn remove scrawl-canvas`
+ `yarn add scrawl-canvas`

19: Check to make sure the new version was added to the repo - the previous command should report the version of SC that was added.

20: Run: `yarn build`. Smoke test the website.

21: Repo-devs are now in a position to push the updated website to production. Use FTP for this work. All files in the `public` folder need to be copied to the remote site.

#### CodePen

22: Repo-devs can now update all the [SC Pen demos in CodePen](https://codepen.io/collection/RzzMjw). This is required work because several of these demos are embedded into the website's various "Learn" articles. The change in each Pen is to update the SC import line to the latest version.
