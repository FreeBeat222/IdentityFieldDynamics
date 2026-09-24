const express = require("express");

const app = express();
const port = process.env.PORT || 3000;

app.disable("x-powered-by");

const page = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="theme-color" content="#070707">
<meta name="description" content="Identity Field Dynamics — the dynamics of identity as a field system.">
<title>Identity Field Dynamics</title>
<style>
:root{--o:#050505;--g:#d6b15a;--gb:#f3da8c;--gd:#79622e;--c:#cbd0d4;--t:#eeeae1;--m:#98968f;--l:rgba(214,177,90,.25)}
*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;color:var(--t);background:radial-gradient(circle at 50% 0,rgba(214,177,90,.11),transparent 34rem),linear-gradient(180deg,#0b0b0b,#020202 62%,#090909);font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;min-height:100vh}
body:before{content:"";position:fixed;inset:0;pointer-events:none;opacity:.2;background-image:linear-gradient(rgba(255,255,255,.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.018) 1px,transparent 1px);background-size:48px 48px;mask-image:linear-gradient(#000,transparent 75%)}
a{color:inherit;text-decoration:none}.shell{width:min(1180px,calc(100% - 40px));margin:auto}
header{position:sticky;top:0;z-index:10;background:rgba(4,4,4,.78);backdrop-filter:blur(18px);border-bottom:1px solid rgba(203,208,212,.12)}
nav{min-height:76px;display:flex;align-items:center;justify-content:space-between;gap:24px}.mark{display:flex;align-items:center;gap:13px;font-size:11px;letter-spacing:.24em;font-weight:700}
.crest{width:34px;height:34px;display:grid;place-items:center;border:1px solid var(--g);color:var(--gb);transform:rotate(45deg);box-shadow:0 0 22px rgba(214,177,90,.12)}.crest span{transform:rotate(-45deg);font-size:12px;letter-spacing:0}
.links{display:flex;gap:24px;flex-wrap:wrap}.links a{color:#aaa;font-size:10px;letter-spacing:.16em;text-transform:uppercase}.links a:hover{color:var(--gb)}
.pill{display:inline-flex;align-items:center;gap:8px;border:1px solid rgba(214,177,90,.25);padding:7px 10px;color:#aaa;font-size:9px;letter-spacing:.16em;text-transform:uppercase}.dot{width:6px;height:6px;border-radius:50%;background:var(--g);box-shadow:0 0 12px var(--g)}
.hero{min-height:calc(100vh - 76px);display:grid;align-items:center;padding:100px 0 120px}.hero-grid{display:grid;grid-template-columns:1.2fr .8fr;gap:70px;align-items:center}
.eyebrow,.label{color:var(--g);font-size:10px;letter-spacing:.3em;text-transform:uppercase}.eyebrow{margin-bottom:24px}
h1{margin:0;font-size:clamp(48px,8vw,104px);line-height:.9;letter-spacing:-.055em;font-weight:700}.gold{color:var(--gb)}
.lede{margin:30px 0 0;max-width:690px;color:#c4c1ba;font-size:clamp(18px,2.2vw,25px);line-height:1.55}.quote{margin-top:34px;padding-left:20px;border-left:1px solid var(--g);color:#aaa8a1;line-height:1.65;max-width:620px}.quote strong{color:var(--t)}
.crest-large{width:min(100%,560px);margin:auto;position:relative;filter:drop-shadow(0 28px 50px rgba(0,0,0,.72));}.crest-art{display:block;width:100%;height:auto;border-radius:0;box-shadow:0 24px 80px rgba(0,0,0,.68),0 0 55px rgba(214,177,90,.08)}.instrument{min-height:390px;border:1px solid rgba(203,208,212,.18);display:grid;place-items:center;position:relative;overflow:hidden;background:radial-gradient(circle,rgba(214,177,90,.1),transparent 56%),#080808;box-shadow:inset 0 0 60px rgba(255,255,255,.025),0 30px 100px rgba(0,0,0,.5)}
.instrument:before,.instrument:after{content:"";position:absolute;border:1px solid var(--l);border-radius:50%}.instrument:before{width:270px;height:270px}.instrument:after{width:190px;height:190px;border-color:rgba(203,208,212,.18)}
.core{width:88px;height:88px;transform:rotate(45deg);border:2px solid var(--g);display:grid;place-items:center;box-shadow:0 0 45px rgba(214,177,90,.16)}.core span{transform:rotate(-45deg);color:var(--gb);font-size:25px;font-weight:700}.axis{position:absolute;width:80%;height:1px;background:linear-gradient(90deg,transparent,var(--gd),transparent)}.axis.v{transform:rotate(90deg)}
section{padding:100px 0;border-top:1px solid rgba(203,208,212,.09)}.label{margin-bottom:18px}h2{margin:0 0 24px;font-size:clamp(34px,5vw,62px);letter-spacing:-.04em}.intro{color:#aaa9a4;max-width:720px;line-height:1.75;font-size:17px}.architecture{display:grid;grid-template-columns:repeat(4,1fr);gap:1px;margin-top:55px;background:rgba(203,208,212,.14)}.stage{background:#090909;padding:26px;min-height:155px;position:relative}.stage-num{color:#66552e;font-size:10px;letter-spacing:.2em}.stage h3{font-size:15px;margin:14px 0 9px;color:#ddd}.stage p{margin:0;color:#777;line-height:1.55;font-size:13px}.codex-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-top:50px}.codex-card{border:1px solid rgba(203,208,212,.13);padding:25px;background:linear-gradient(145deg,#0b0b0b,#060606)}.codex-card b{color:var(--gb);font-size:12px;letter-spacing:.12em}.codex-card p{color:#85837d;line-height:1.6;font-size:13px}.crest-section{display:grid;grid-template-columns:1fr .65fr;gap:70px;align-items:center}
.axes{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;margin-top:55px;background:rgba(203,208,212,.14)}.axis-card{background:#090909;padding:30px;min-height:190px}.axis-letter{color:var(--gb);font-size:34px;font-weight:700}.axis-name{margin-top:10px;font-size:13px;letter-spacing:.18em;text-transform:uppercase;color:var(--c)}.axis-desc{margin-top:18px;color:#888883;line-height:1.6;font-size:14px}
.cta{display:flex;gap:14px;flex-wrap:wrap;margin-top:34px}.button{border:1px solid var(--gd);padding:13px 18px;font-size:10px;letter-spacing:.18em;text-transform:uppercase}.button.primary{background:linear-gradient(135deg,#d6b15a,#806a36);color:#090909;border-color:var(--gb);font-weight:700}
footer{padding:45px 0 65px;border-top:1px solid rgba(203,208,212,.12);color:#666;font-size:10px;letter-spacing:.12em;text-transform:uppercase}
@media(max-width:900px){.architecture{grid-template-columns:repeat(2,1fr)}.crest-section{grid-template-columns:1fr;gap:45px}}@media(max-width:820px){.links{display:none}.hero-grid{grid-template-columns:1fr;gap:55px}.instrument{min-height:300px}.axes,.architecture,.codex-grid{grid-template-columns:1fr}.shell{width:min(100% - 28px,1180px)}}
</style>
</head>
<body>
<header><div class="shell"><nav>
<a class="mark" href="#top"><span class="crest"><span>IFD</span></span><span>IDENTITY FIELD DYNAMICS</span></a>
<div class="links"><a href="#discipline">Discipline</a><a href="#framework">Framework</a><a href="#research">Research</a><a href="#codex">Codex</a><a href="#crest">Crest</a></div>
</nav></div></header>
<main id="top">
<section class="hero"><div class="shell hero-grid"><div>
<div class="eyebrow">A developing scientific discipline</div><div class="pill"><span class="dot"></span>Research in development</div>
<h1>Identity as a <span class="gold">field system.</span></h1>
<p class="lede">Identity Field Dynamics studies identity through structure, direction, boundary, abstraction, narrative, and distortion—and asks how these elements interact, persist, change, and transition.</p>
<div class="quote"><strong>IDENTITY PHYSICS was the name of the discovery.</strong><br>IDENTITY FIELD DYNAMICS is the name of the discipline that emerged from it.</div>
<div class="cta"><a class="button primary" href="#discipline">Enter the discipline</a><a class="button" href="#research">View research</a></div>
</div><div class="instrument"><div class="axis"></div><div class="axis v"></div><div class="core"><span>IFD</span></div></div></div></section>
<section id="discipline"><div class="shell"><div class="label">01 / Discipline</div><h2>From identity as an object to identity as a dynamic system.</h2><p class="intro">IFD is being developed as a formal framework for investigating identity as a structured, dynamic phenomenon. Its claims are intended to remain distinguishable from their operational tests: proposed constructs are not treated as established measurements merely because they can be named.</p></div></section>
<section id="framework"><div class="shell"><div class="label">02 / Framework</div><h2>Six proposed axes.</h2><p class="intro">The current framework organizes empirical development around six candidate constructs. Their measurability, distinguishability, stability, perturbation response, and explanatory value remain empirical questions.</p><div class="axes">
<article class="axis-card"><div class="axis-letter">W</div><div class="axis-name">Witness</div><div class="axis-desc">Detection, noticing, monitoring, and orientation.</div></article>
<article class="axis-card"><div class="axis-letter">V</div><div class="axis-name">Vector</div><div class="axis-desc">Directionality and the reconstruction of directional choice.</div></article>
<article class="axis-card"><div class="axis-letter">B</div><div class="axis-name">Being / Boundary</div><div class="axis-desc">Persistence, stability, and boundary conditions.</div></article>
<article class="axis-card"><div class="axis-letter">A</div><div class="axis-name">Archetype / Abstraction</div><div class="axis-desc">Pattern abstraction and higher-order representation.</div></article>
<article class="axis-card"><div class="axis-letter">N</div><div class="axis-name">Narrative</div><div class="axis-desc">The organization of identity through narrative structure.</div></article>
<article class="axis-card"><div class="axis-letter">D</div><div class="axis-name">Distortion</div><div class="axis-desc">Deviation, transformation, and identity-system perturbation.</div></article>
</div></div></section>
<section id="research"><div class="shell"><div class="label">03 / Research</div><h2>Observation before conclusion.</h2><p class="intro">The empirical program is designed around observable action, durable session integrity, competing models, perturbation experiments, and explicit falsification criteria. OBSERVOR is the developing measurement and discovery engine supporting that program.</p><div class="architecture"><article class="stage"><div class="stage-num">01</div><h3>Operationalize</h3><p>Define observable variables without treating proposed constructs as settled measurements.</p></article><article class="stage"><div class="stage-num">02</div><h3>Perturb</h3><p>Introduce controlled changes and record system response through durable trials.</p></article><article class="stage"><div class="stage-num">03</div><h3>Compare</h3><p>Test competing model specifications using fit, prediction, cross-validation, and falsification.</p></article><article class="stage"><div class="stage-num">04</div><h3>Revise</h3><p>Promote claims only when the evidence supports them; preserve uncertainty and lineage.</p></article></div></div></section>
<section id="codex"><div class="shell"><div class="label">04 / Codex</div><h2>The discipline is still being built.</h2><p class="intro">The canonical corpus, notation, construct registry, experiments, equations, and model specifications are maintained as an evolving research architecture. This site will expose that architecture as it reaches publication-ready states.</p><div class="codex-grid"><article class="codex-card"><b>CANON</b><p>Definitions, notation, claims, status, and historical provenance.</p></article><article class="codex-card"><b>MECHANICS</b><p>Coupling hypotheses, dynamic models, phase transitions, and systemic disequilibrium.</p></article><article class="codex-card"><b>VALIDATION</b><p>Experiments, preregistration, competing models, observables, and falsification.</p></article></div></div></section>
<section id="crest"><div class="shell crest-section"><div><div class="label">05 / The Author’s Crest</div><h2>A mark for the discipline.</h2><p class="intro">The crest is intended as a visual signature for the emerging IFD corpus: structured identity, coherent symbolic form, and an orientation toward the horizon.</p></div><div class="crest-large" aria-label="The Author’s Crest"><img class="crest-art" src="/author-crest.svg" alt="The Author’s Crest: an angular gold crown with a central beam, coherent arcs, and luminous horizon rings."></div></div></section>
</main>
<footer><div class="shell">Identity Field Dynamics · Formerly developed under the working name Identity Physics · Research in development</div></footer>
</body></html>`;

app.use(express.static("public", { extensions: ["svg"] }));

app.get("/", (_req, res) => res.type("html").send(page));
app.listen(port, () => console.log(`Identity Field Dynamics listening on port ${port}`));
