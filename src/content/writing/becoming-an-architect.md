---
title: "Becoming an architect"
date: 2026-06-18T12:00:00.000Z
author: "Jon George"
description: "A vow to clean up bad code turned into the real job of an architect: keeping the business from paying for choices that looked free at the time."
category: "Engineering"
---

My career as an architect started as a way to improve the developer experience. I was a developer myself, and time after time I inherited utter trash from the people who came before me. And distastefully, I was expected to keep the cycle going, piling smelly code on top of smelly code. So early on I made a quiet vow: I'd turn trash into gold to the best of my ability.

I didn't realize what that vow would cost me, nor the opportunities it'd open up. Trying to keep that promise meant I couldn't think about code in isolation. I had to think about systems, design, user experience, the business, and the people doing the work, all at once, all the time. Caring about the next developer turned out to be a gateway drug to caring about everything.

## I came in through the side door

I didn't take the traditional route. Before I ever shipped production code, I worked a help desk. I ran cables and stood up physical desktops, servers, and networks. I administered systems. I sat in technical liaison roles wherever someone needed a translator.

As a fresh-eyed twenty-something, what kept catching my attention was the disconnect: between technical and non-technical people, and between management and the people actually doing the work. I could speak both languages, and I was surrounded by only a handful of others who could. That felt like something. "Technical Liaison" eventually became my official title, but really it was just the place I naturally landed everywhere I worked. This is the backdrop for my software career.

## What I thought the job was

In a one-on-one with my manager back in my IT days, I told them my goal was to become a Solutions Architect.

They burst out laughing. Head thrown back, eyes squished, knee slap. Real laughter. I don't know to this day what was so funny. I don't remember much of what he said afterward. What I do remember is being the youngest person at the company, the only one without a degree, one of a few who got there via a non-traditional path, and feeling that laugh land squarely on all of it.

When he asked, "Why Solutions Architect?", I told him I wanted to translate non-technical needs into technical solutions, which was already what I did, right? Looking back, I get the laugh. I was describing a sliver of the job and calling it the whole thing. That answer was where my small idea of the job started, and it took me years to see how much it I'd left out.

## What an architect actually does

The prefix (Software, Solution, Enterprise, Data, Security, Cloud etc.) matters less than the altitude you work at, and every company has its own idea of what any of them means. "Architect" covers a wild range of jobs, and what separates them is how much of the world you're on the hook for. 

A software architect works inside a single system: the modules, the services, how the parts fit. 
A solution architect pulls back to the handful of systems that together solve one business problem and makes them agree with each other. 
An enterprise architect pulls back further still, to the whole organization's technology estate, deciding which systems get to exist at all, how they're allowed to talk, and what standards everyone has to live by. 
Cutting across all of them are the specialists (data, security, cloud) who take a single concern and drive it straight through every level.

For a long time those looked like separate jobs to me. Eventually I saw them as one job at different distances. Every one of them is drawing lines and then defending them: where this ends and that begins, what's allowed to depend on what, who owns which side. The software architect draws lines between components, the solution architect between systems, the enterprise architect between whole platforms and departments. The lines are the work.

## The five-year "interim" solution

The experience that shaped me most was a six-to-twelve-month interim solution that I supported for over five years, first as a developer, then as an architect. We never stopped calling it temporary, and it never stopped running. That's where I learned a rule I now treat as a law: temporary systems become permanent. So now I build anything that gets called temporary as though it's here to stay, because it usually is.

I didn't build the original. Another team stood it up, and I inherited it barely three months after it shipped. Over the years that followed I kept extending it, use case after use case, until roughly eighty percent of what runs today is my own design layered onto their foundation. Somewhere in there it stopped being a stopgap and became the system, and every new feature put the same question in front of me: does this extend the original architecture or fight it? I was building the permanent thing on top of the temporary one.

## Why the trash keeps piling up

Business people mostly don't care about code formatting or structure, and honestly they shouldn't have to. End users don't care either, as long as it works. For years that infuriated me. These days I think the business is usually making a fair call: customers pay for what the software does, not for how clean it is underneath, and shipping late to ship pretty is its own kind of failure.

What changed for me was thinking about it as debt. Cutting a corner to ship faster is a loan, and sometimes a loan is exactly the right move. The trouble comes when you borrow blind: no sense of the interest rate, no plan to ever pay it down. That's how teams quietly go bankrupt, and it's where I think an architect earns the title. The job is to say the cost out loud, get it on the books, and decide which corners we're allowed to cut and which ones will bury us.

I put the care where reversal is expensive (the boundaries, the data, the contracts other things lean on), and I let the disposable stuff stay rough. Some trash is load-bearing. Most of it isn't, and learning to tell the difference is most of the job.

Which brings me back to the vow, and what the years did to it. It started as a promise to clean up after everyone. These days I read it as something less romantic and more useful: my job is to protect the business. Every shortcut, every tangled module, every "temporary" system that refuses to die is a bill the business pays later, in money, in lost speed, in good people who quit rather than maintain the mess. Caring about the developer who inherits the code is how I first learned to see those bills coming, but the developer was always the early warning, not the client.
