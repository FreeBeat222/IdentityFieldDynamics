# CAT-03 Gateway Route Verification

**Branch:** `cat03-six-gateway-navigation`  
**Scope:** Six Tier 2 gateway pages and homepage gateway navigation.  
**Verification type:** Repository-source verification only; not a live HTTP test.

## Tier 1 navigation

The homepage links to the six approved Tier 2 gateways in the frozen order:

1. UNDERSTAND — `/understand.html`
2. RESEARCH — `/research-gateway.html`
3. LIBRARY — `/library-gateway.html`
4. MUSEUM — `/museum-gateway.html`
5. EXPERIENCE — `/experience-gateway.html`
6. PARTICIPATE — `/participate-gateway.html`

All six target files exist in `public/` on this branch.

## Tier 3 static destinations

All 37 static HTML destinations linked from the six Tier 2 pages were checked against the repository on this branch. All 37 files exist.

### UNDERSTAND
- `/structure-dynamics-identity.html`
- `/identity-engineering.html`
- `/ifd-overview.html`
- `/current-ifd-formulation.html`
- `/current-ifd/purpose-and-scope.html`
- `/aiist-signet.html`
- `/zeroid.html`
- `/current-ifd/identity-in-operation.html`

### RESEARCH
- `/research-deep.html`
- `/current-ifd/research-program.html`
- `/observor-method.html`
- `/observor-deep.html`
- `/flaw-chart.html`
- `/tools.html`
- `/current-ifd/four-channel-workflow.html`
- `/current-ifd/evidence-and-status.html`
- `/current-ifd/flaw-chart-role.html`
- `/living-corpus.html`
- `/archive.html`
- `/hard-shark.html`

### LIBRARY
- `/current-ifd-formulation.html`
- `/current-ifd/integrative-principles.html`
- `/current-ifd/synergy.html`
- `/current-ifd/cosmological-clock.html`
- `/current-ifd/generation-differentiation.html`
- `/living-corpus.html`
- `/research/memoranda` (server route; not a static HTML file)
- `/research/memoranda/zeroid-aggregation-ladder` (server route)
- `/research/memoranda/zeroid-profile` (server route)
- `/codex` (static entry point confirmed in supplied production evidence)

### MUSEUM
- `/luna-artifacts.html`
- `/happy-shoggoth.html`
- `/good-times-gallery.html`
- `/luna-stone.html`
- `/the-encounter.html`
- `/museum.html`

### EXPERIENCE
- `/the-encounter.html`
- `/quiz-lab.html`
- `/quiz-lab-identity-challenge.html`
- `/quiz-lab-bite-009.html`
- `/quiz-lab-power-pilot.html`
- `/hard-shark.html`

### PARTICIPATE
- `/confessional` (server route)
- `/salon.html`
- `/write-club.html`
- `/lu-basement.html`
- `/research/intake` (server route)

## Sitemap

The six new Tier 2 gateway URLs have been appended to `public/sitemap.xml`.

## Verification boundaries

- Repository existence confirms that static destination files are present in this branch; it does not prove that GoDaddy production currently contains the same files.
- Dynamic server routes and static extensionless entry points have not been live HTTP-tested.
- Relative navigation, CSS rendering, keyboard behavior, and mobile menu operation have not been browser-tested.
- The Library Catalogue and Master Sitemap interfaces remain a subsequent implementation package.
- No production files were changed and no deployment was performed.
