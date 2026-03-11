---
title: "Cognitive debt"
date: 2026-03-09T00:00:00.000Z
author: "Jon George"
description: "AI doesn't automatically create cognitive debt. It creates cognitive debt when developers skip the understanding step."
category: "Engineering"
---

Software teams have always had someone who understood the code first. Somebody built the system, carried the mental model, and everyone else had to catch up. Cognitive debt isn't new, but AI-assisted development is reshaping how it compounds, who owns it, and what it takes to resolve. Today, working code can ship without anyone ever having held the mental model. You can now ship working code where nobody ever held the mental model. The person who prompted it understands the intent but not necessarily the implementation. That's not a different degree of the old problem. It's a different kind of problem entirely.

## What cognitive debt actually is

Cognitive debt is what accumulates when your codebase outpaces your team's ability to reason about it. It's not the lack of understanding itself, it's the latent liability that the difference creates. The debt comes due when something breaks, requirements change, or you need to extend functionality and nobody can work from first principles because they never built the mental model.

This is distinct from technical debt, and the distinction matters. Technical debt is visible. You can search for TODOs, measure complexity, see the dependency graph. Cognitive debt is invisible until it isn't. The codebase looks clean, the tests pass, and when something unexpected happens, nobody knows why it works the way it does. 

That invisibility is what makes cognitive debt dangerous. Technical debt announces itself. Cognitive debt hides until something breaks and the person who needs to fix it can't explain how it works.

## What changes with AI, and what doesn't

The pre-AI version of cognitive debt was a structural problem. Someone builds an entire system, leaves or gets hit by a bus, and suddenly the team owns code they can't reason about. The industry's mitigation strategies: documentation, code review, pair programming, knowledge sharing sessions. These are all attempts to transfer mental models between people. They're cognitive debt repayment strategies, and they worked because the knowledge existed somewhere. You just had to move it.

With AI-generated code, there's no one to transfer knowledge from. The "author" never held the mental model. The person who prompted it understands the intent but not necessarily the implementation. That's a qualitatively different starting point.

But here's where I need to be precise, because it's easy to overstate this: AI code generation tools can also produce explanations, diagrams, and conversations that help a developer build a mental model of what was generated. 

Unlike a departed teammate, AI is always available to explain its own work. You can ask it to walk through the logic, explain tradeoffs, diagram the architecture, identify edge cases. It's an infinitely patient thought partner that never gets tired of questions.

So AI doesn't automatically create cognitive debt. It creates cognitive debt when developers skip the understanding step.

That makes this more of a discipline problem than a tooling problem. 

The old version was structural. Knowledge got siloed because transferring it was expensive and slow. 

The new version is behavioral. Understanding is available on demand, but you have to want it.

## Why the behavioral version is harder

Here's what changes when cognitive debt shifts from structural to behavioral. 

Your existing interventions stop working. You can mandate code reviews. You can block production releases with missing documentation or failing tests. These are structural interventions for a structural problem, and they work reasonably well.

Code reviews catch things a reviewer can see - obvious bugs, style violations, architectural red flags. It doesn't catch a developer who approved code they don't fully understand. A reviewer can look at AI-generated code, find nothing obviously wrong, and approve it, without anyone in the transaction building a durable mental model of what it does. The process ran correctly. The debt is still there.

You can require documentation. But a developer who doesn't understand the code they're shipping will write documentation that describes the intent, not the implementation. The documentation will look fine and fail you when you need it most.

And you can't mandate curiosity. You can't force someone to actually internalize an explanation rather than skim it. The behavioral version creates a new failure mode that structural version does not: the developer who thinks they understand the code because they prompted it, reviewed the output, and it looked reasonable. They're carrying invisible debt and they don't know it. The person who inherits a departed colleague's code at least knows they're in unfamiliar territory.

This has implications beyond individual practice. If the defining skill in an AI-augmented world is the willingness to slow down and understand (not just the speed at which you can generate), that changes what "good" looks like. The fastest prompter isn't the best developer. The one who consistently builds mental models of what they ship is. That's a harder thing to screen for in hiring, harder to measure in performance reviews, and harder to cultivate in a culture that celebrates velocity above almost everything else.

## Cognitive debt compounds
There's a reason that makes this urgent rather than merely interesting - cognitive debt compounds.

When you ship code you don't understand, you make implicit assumptions about how it behaves. You don't know exactly where those assumptions are because you never reasoned through the implementation. When you build on top of that code with more AI-generated code, your new code inherits and depends on those unexamined assumptions. Each layer narrows your ability to reason about the layers beneath it, because the foundation is opaque and you've built on top of the opacity. Each new layer of debt makes the layers beneath it harder to pay back, because now you can't reason about the foundation you're building on.

Technical debt compounds differently and more visibly. You watch the dependency graph get tangled, the build times creep up. Cognitive debt compounds silently. The codebase can look perfectly clean with passing tests and tidy architecture diagrams while the team's ability to reason about unexpected behavior degrades with every commit.

This is why "I'll understand it later" is more expensive than it sounds. Later, you'll be trying to understand unfamiliar code under pressure, with multiple additional layers of unfamiliar code on top of it, while something is broken in production. The cost of understanding goes up every day you defer it. And because cognitive debt is invisible, you won't know how much you owe until the fire is already burning.


## The sedan, not the Ferrari

If pre-AI development were synonymous with "horse and carriage" days, then post-AI is like having a Ferrari. Raw capability. Maximum speed. You can generate in 30 seconds what would have taken two hours.

What I'm suggesting is that we drive a sedan. Faster than a horse, but not as fast as a Ferrari.

On my team, if I use AI to generate code, I'll have one of my teammates grill me on it before the code ever sees our test environment. Not a cursory review...something closer to an interrogation. What are the edge cases? Why this approach over alternatives? What happens when this input is null? What assumptions does this make about the data?

Either I understand the code well enough to defend it, or I don't. We find out right there.

It's code review, which every serious team already does. The difference is the intent behind it. It checks whether the author actually understands what they pushed, directly addressing cognitive debt.

Knowledge transfer has always been a first-class reason code review the practice exists. So I want to be clear that this isn't some new process I invented. What I'm describing is code review accounting for a failure mode it wasn't originally calibrated to catch.

Without this, tgshe author sounds confident. The reviewer finds nothing obviously wrong. The debt enters anyway. Existing review culture tends to catch shallow code. It's less equipped to catch shallow understanding of code that isn't shallow because the two used to be harder to decouple. You generally couldn't submit well-structured, well-tested code you didn't understand. Now you can.

So the practice is to review with a specific additional question: 
> *Does the author actually own this, or do they just own the output?*

When someone can't defend the code, it doesn't move forward. They go back, use the AI to walk through the implementation, ask about the tradeoffs it made. Then they come back and we go again. Sometimes they return with the same code and a better understanding. Sometimes the interrogation reveals the AI's approach was wrong and they come back with something different. Both outcomes are the system working.

This step is slower than just shipping. But it catches the invisible debt before it enters the codebase and starts compounding. And the result is a team where everyone can reason about the code they own.

## A note on reading code vs. writing code
There's an assumption worth questioning: that understanding AI-generated code produces an equivalent mental model to writing the code yourself.

It might not. Writing code and reading code are different cognitive activities. When you write code, you make dozens of decisions every minute. You choose this approach over that one, you handle the edge case explicitly, you feel the resistance when a design doesn't fit. That friction is load-bearing. It's how you build durable understanding.

When you read code - even carefully, even with an AI walking you through it - you're reconstructing intent rather than experiencing the decisions as they were made. You can end up with an accurate understanding of what the code does without a feel for why it was shaped that way, or where it's fragile.

I don't think this means AI-assisted development produces systematically worse mental models. A developer who uses AI to generate code, then deliberately uses the same AI to stress-test their understanding, can end up knowing the code well. Sometimes better than if they'd written it quickly under time pressure. But the equivalence isn't automatic, and treating it as automatic is how you end up thinking you understand something you don't

## Understanding takes time
The current AI discourse is almost entirely about speed. Ship faster, build faster, iterate faster. But understanding takes time. We know this from spaced learning and distributed practice. We experience it every time we spend enough time with something until it finally clicks. These are biological processes, not workflow steps you can optimize away.

AI can compress the production of code. It cannot compress the cognition required to own it. Cognitive debt is the disconnect between those two speeds. Ship enough code you don't understand, and the interest compounds quietly.

But AI *can* change how productively you spend that cognitive time. Picture a spectrum:

At one end, you prompt, get code, and ship it unread. Maximum debt, and you don't even know you're carrying it. The invisibility is total.

In the middle, you prompt, read the code, and roughly follow the approach. Moderate debt. You know the shape but not the edge cases. You'll recognize the debt when it comes due, but you won't pay it down quickly.

At the other end, you prompt, then use the AI to walk you through the logic, interrogate tradeoffs, and stress-test failure modes. Minimal debt, and potentially *less* debt than writing it yourself.

That last point is worth sitting with. A developer who deliberately uses AI to learn the code it generated can build a stronger mental model than one who wrote it manually at 5pm on a Friday to hit a deadline and barely remembers how it works by Monday. AI doesn't just create the debt problem. It can also be the best tool available for paying it down if you choose to use it that way.

## The real question

AI doesn't create cognitive debt. Instead, it shifts who's responsible for managing it from teams and organizational structures to individual developers making choices that noone else can see. This used to be a structural problem. It was something teams dealt with through onboarding, code review, required documentation etc. These work reasonably well because the problem is visible and the interventions are enforcable. 

The new paradigm now it lands squarely on the individual developer. Are you using AI to skip understanding or are you using it to accelerate toward understanding? That choice determines whether you're accumulating invisible debt or paying it down in real time. And because the consequences are invisible until something breaks, there's no external feedback loop to catch you if you're making the wrong choice. 

That's uncomfortable. It means the same tool can make you significantly better or significantly worse as a developer, depending on a discipline that's hard to screen for, hard to meaasure, and hard to mandate. The organizations that figure out how to cultivate it through culture, incentives, review processes that check for understanding, will have a real advantage. The ones that don't will accumulate debt they can't see until it's already expensive.

The speed gains from AI are real, and take the time to understand doesnt cancel out that speed. Thirty seconds of generation plus twenty minutes of deliberate comprehension is still faster than two hours of manual code writing. You delivered faster and you own what you shipped

The question is whether you're choosing to spend those twenty minutes.

-----

*This is the third and final post in a series about the cognitive side of software engineering. The first was [Slow cook your ideas](/writing/slow-cook-your-ideas), about using LLMs as thinking partners to develop stronger mental models before building. The second was [The five dimensions of cognitive work](/writing/the-five-dimensions-of-cognitive-work), about the invisible cognitive costs that no productivity metric captures.*
