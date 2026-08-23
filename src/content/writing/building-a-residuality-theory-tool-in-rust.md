---
title: "A CLI for Residuality Theory built with Rust"
date: 2026-08-23T12:00:00.000Z
author: "Jon George"
description: "A Spreadsheet, a Borrow Checker, and Me: Shipping My First Rust Crate"
category: "Engineering"
---

Earlier this summer I read Barry O'Reilly's *Residues: Time, Uncertainty, and Change in Software Architecture*, and it wouldn't leave me alone. The core claim is provocative: randomly stressing a simple design produces better architectures than requirements analysis, risk prediction, or pattern reuse. You start with a naive architecture, brainstorm stressors (anything outside your current understanding of the system) and record what each one breaks and what you change so the design survives. Each surviving change is called a *residue*, and the architecture is the collection of residues. An incidence matrix of stressors against components then reveals the hidden coupling that only shows up when the business environment changes.

The whole method runs on a spreadsheet. I had also been circling Rust for about a year, reading other blog posts about the Rust programming language. A small CLI that manages a spreadsheet felt like the right trailhead for a Rust newbie. It's real enough to matter, small enough to finish.

So I built one. [`residuality`](https://crates.io/crates/residuality) is a CLI that keeps the stressor spreadsheet as plain CSV in your repo, generates the incidence matrix, computes the book's contagion triggers, and runs the empirical test. It's the first thing I've ever written in Rust, and today I shipped v1.0.0, the crate is live on the registry, docs rendering, release tagged and annotated. This is my retrospective, written while the compiler errors are still fresh enough to have feelings about.

## The spec for this project was my naive architecture

The ironic part about this whole this is that the project became a demonstration of the theory it implements.

Before writing any code, I wrote a spec that allowed a user to actually define their architure using YAML file. I was proud of it. It felt thorough. It felt *responsible*. A `project.yaml` for flows and the naive architecture, a `triggers` command, `anyhow` for errors, `dialoguer` for interactive prompts. 

Almost none of it survived contact with actual use.

YAML became CSV, because stressor brainstorming happens in a spreadsheet and CSV is one double-click away from Excel which more closely aligns with the original method. `triggers` became `analyze`, because "triggers" is jargon that only means something if you've read the book, and I want people who *haven't* read the book to be able to guess what the command does. A `check` command appeared that was nowhere in the plan, because the moment I started using the tool for this project I started introducing dangling references and duplicate ids, and I needed an auditor watching my back. And `anyhow` never got added at all because `Box<dyn Error>{:rust}` and `?` simply never hurt enough to justify another dependency.

My favorite unplanned change is the removal of `naive_survives` and `residual_survives` booleans in the empirical test file. What shipped infers survival from whether the `technical_change` cell is blank. You have to write the change down anyway. A blank cell *is* the claim of survival. One less field that can disagree with itself. That design didn't come from planning; it came from the plan getting stressed and leaving a better residue behind.

Barry might say the spec was my naive architecture and real usage was the stressor analysis. I can't argue.

## Where the method drew lines the tool respects

The hardest design decisions were about what *not* to automate. My instinct wanted `res test{:bash}` to replay stressors against components and compute survival mechanically. But "does this architecture survive a war breaking out?" isn't computable. It's a lateral-thinking judgment that requires knowing "the business". Automating it would have meant the tool grading its own homework. So I settled on counts and divides... X survived, Y survived, Ri = (Y − X) / S, and human judgement.

The same principle shows up in the schema. There is no probability field and no cost field, and there never will be, because the method says those numbers filter the simulation and hide exactly the fault lines you're trying to find. There's no built-in stressor library or auto-generated stressors, because generic stressors yield generic patterns. I spent a whole evening *not* adding fields or automation to a struct, and I'd argue it was the most architectural evening of the project.

## Learning Rust by arguing with it

I came to Rust as someone who thinks about systems more than syntax, and the surprise was how often the language forced architectural conversations.

Take a small example. A stressor's affected components are a `BTreeSet<String>{:rust}`, not a `Vec<String>{:rust}`. That sounds like data-structure trivia or an interview question. It's actually a policy decision. Hand-edited CSV cells arrive with duplicates and random ordering; the set dedupes and sorts on the next write, for free, forever. The type *is* the validation. Similarly, nearly every field in the model being `Option<String>{:rust}` is what makes "empty cell = survived" possible at all. In Rust, the model layer carries design intent in a way I've rarely seen a type system pull off.

Then there were the arguments. Anyone who's learned Rust will recognize the error codes the way you recognize old classmates. 
- E0277, "the trait bound is not satisfied", showed up early and often, most memorably when I discovered that `.join(","){:rust}` needs `Borrow<str>{:rust}` and that implementing `Display` doesn't grant it. A trait is a specific promise, not a general vibe of string-ness. 
- E0507, "cannot move out of borrowed content" taught me to stop reflexively reaching for values that weren't mine to take; half the time the fix was a `&`.
- And E0382, the classic "use of moved value," caught me exactly passing collections around like a garbage-collected tourist. The fix was learning which functions "eat" my values... Yes, I'm looking at you "implicit `into_iter(){:rust}` in a `for{:rust}` loop" vesus "explicit `iter(){:rust}`". 

The thing is, those fights were productive. Every analysis function ended up returning borrowed data tied to the `&Matrix{:rust}{:rust}` it was handed, `Vec<(&Stressor, u32)>{:rust}{:rust}`, clusters of `&Component{:rust}{:rust}`, etc. and the all-pairs coupling computation was where ownership genuinely mattered. When the borrow checker complained, it was really asking "*who owns this data, and how long does it live?*" That's an architecture question. Answering it up front is why the analysis module ended up pure. Functions over `&Matrix{:rust}{:rust}`, no IO, fully unit-tested. `storage.rs` does the file work. And `src/commands` just wires things together. The language nudged me toward the separation I'd wanted anyway, and then wouldn't let me abandon it.

There was a real decision behind almost every one of those errors, too. Borrow, clone, or move? For small strings in hot-ish paths I learned to default to borrow unless, a clone or move is warranted. I also learned that clones of certian things are cheap (i.e. cloning a component name). For the matrix itself, borrowing was the only honest answer. Map keys were another fork in the road: `&str` keys keep you in borrow-land and make lifetimes contagious; `String` keys cost an allocation and buy you peace. I went back and forth twice before landing on owned keys at the storage boundary and borrowed everything inside the analysis layer, which in hindsight is just the module structure restated as a lifetime policy.

The `check` command forced a different kind of call: fail fast on the first bad row, or collect every finding and report them all? Fail-fast is easier to write — `?` and you're done — but an auditor that quits at the first problem makes you fix a CSV one error per run, which is misery. So `check` accumulates findings into a `Vec` and reports at the end, while the load path stays fail-fast, because a corrupt file you're about to *analyze* should stop you cold. Same codebase, two error philosophies, each earning its place.

## Iterators all the way down

The other conversion I didn't expect: I came out of this a functional programmer, at least within Rust's dialect of it. The analysis module has almost no `{:rust}` loops. It's `iter().filter().map().collect(){:rust}` chains, `filter_map{:rust}` to drop the `None{:rust}`s that the Option-heavy model produces, `fold{:rust}` for the coupling counts, `and_then{:rust}` and `unwrap_or_default{:rust}` doing all the work at the edges. At first I wrote loops and refactored them into chains as a kind of exercise. By the end I was thinking in chains, and the loops felt like assembly.

The standard library kept rewarding the habit. `entry().or_insert_with(){:rust}` on a `BTreeMap{:rust}` replaced an entire clumsy check-then-insert dance. `split(';'){:rust}` plus `filter(|s| !s.is_empty()){:rust}` handled the semicolon-joined CSV cells. Though getting serde to round-trip a set through a single cell produced the gnarliest custom serialize/deserialize functions in the codebase, type signatures that look like incantations. And I collected my share of beginner scars learning that mutating methods don't chain, and spending too much time on why `cargo test res` ran exactly one test until I realized `res` is a substring filter, and it was matching the middle of "st**res**sor."

The last mile was clippy. I ran it expecting a pat on the head and got a lecture instead. Needless borrows, `map().unwrap_or(){:rust}` where `map_or{:rust}` would do, a `&String{:rust}` parameter that should have been `&str{:rust}`. I fixed all of it, partly for the badge of a clean crate and partly because every lint was a tiny repeat of the same lesson: the idiomatic version most times *is* the clearer statement of intent.

## The verdict

Would I recommend Rust for a CLI side project? Yes, with a caveat. The value isn't speed of delivery. I could have built this faster in three other languages. The value is that the language refuses to let structural questions stay vague. Every `Option{:rust}`, every borrow, every trait bound is a small decision about how the system handles absence, ownership, and capability. Those decisions accumulate into an architecture whether you're paying attention or not.

Six months ago this was a learn-Rust project with a spec full of things that didn't survive. Today it's a 1.0.0 on crates.io. The residues are in git, the matrix catches coupling I'd have missed by eye, and the empirical test gives me a number that tells me when to stop doing architecture.
