# Condition Lab

Condition Lab is a small, local-first physics learning lab. It makes a scientific claim's conditions visible and lets a learner test how a result changes when mass or net force changes.

## The question

When someone offers a counterexample, did the original conditions stay the same? In this prototype, the claim is: **at the same net force, increasing mass lowers acceleration.** The learner can adjust force and mass, observe the cart model, save multiple trials, compare the condition, and export the run table as CSV.

The model is Newton's second law, `a = F / m`, with friction and drag omitted. A learner can choose any valid force/mass setup as the reference, then compare later trials against that saved reference. Each trial stores its own reference values, so changing the reference later does not rewrite the meaning of earlier runs. If force changes along with mass, the app flags that the run does not isolate the mass effect. It does not decide whether a learner's free-form explanation is correct.

## Run it

Open `index.html` directly, or serve the folder locally:

```powershell
python -m http.server 8517
```

Then visit `http://127.0.0.1:8517/competitions/stem2connect-2026-condition-lab/` from the workspace root, or run the server from this folder and visit `http://127.0.0.1:8517/`.

No dependencies, account, or network access are required. Trial data and the selected reference are stored in this browser's local storage. The CSV includes each trial's force, mass, calculated acceleration, and the reference force/mass used for its condition check.

## Recorded demo

[Watch the 16-second browser demo](assets/condition-lab-demo.webm) (WebM) or [download the MP4 version](assets/condition-lab-demo.mp4). It records a same-force mass comparison, then a force change that the app flags as not isolating mass.

## AI disclosure

Codex was used for brainstorming, implementation drafting, and debugging. The running project does not call an AI model or send user inputs to a service. Its output is a deterministic calculation from the displayed equation; it is not an AI tutor, a correctness score, or a complete physics simulator.

## Scope and limits

- One explicit mechanism: Newton's second law.
- The simulation assumes constant net force and omits friction, drag, rotation, and measurement error.
- The condition check compares numeric force with the baseline; it does not semantically review a learner's explanation.
- This is an educational prototype, not a research instrument or a substitute for physical experiments.

## Competition disclosure

This standalone prototype was started on 2026-11-24 for the STEM2Connect AI Hackathon. It is separate from Cora's existing research and product repositories. No pre-existing core project code is included.

## Rights

Copyright (c) 2026 Cora Zeng. All rights reserved. No license is granted by this repository.
