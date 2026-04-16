---
title: "Secure software development using zero trust"
date: 2024-10-23T01:20:23.000Z
updated: 2026-04-15T00:12:12.000Z
author: "Jon George"
featuredImage: "/images/writing/zero-trust-in-code/photo-1709477544343-56ceb8272ceb.jpeg"
featuredImageAlt: "Secure software development using zero trust"
description: "Zero trust usually means networks and infrastructure. Here's what it looks like applied to application code and what it means for AI systems and regulated environments."
category: "Security"
---

Zero trust is often discussed in terms of networks, devices, and infrastructure because these are usually the first line of defense against external threats. But as modern software development moves toward microservices, APIs, infrastructure-as-code, cloud architectures, and AI-driven systems, the boundaries between infrastructure and application are blurring — and the consequences of getting security wrong are getting higher, especially for teams building in regulated or mission-critical environments. Here I provide a brief introduction to zero trust and use cases for applying its concepts directly to software application code.

### What is zero trust?
*Zero trust* is a set of three principles aimed at protecting digital assets, services, and network infrastructure:

- Assume a breach has occurred
- Apply least-privilege access
- Perform explicit and continuous verification

In practice this may take the form of microsegmentation, granting access to users for only the resources needed, and continuously monitoring and verifying users and devices connected to the network.

The concept of zero trust assumes that everything and everyone is a potential threat until the user and/or device has been authenticated and authorized to access a resource. After the initial authentication, zero trust environments continuously validate access attempts to ensure that only authenticated and authorized users, devices, and systems can interact with resources on a protected network.

Building on this concept, a *zero trust architecture* applies zero trust principles to a network or system. These principles align with [NIST SP 800-207](https://csrc.nist.gov/publications/detail/sp/800-207/final), the federal standard for zero trust architecture, and are increasingly foundational to frameworks like CMMC and NIST SP 800-171 that govern how organizations handle controlled unclassified information (CUI) and other sensitive data.

### Software development and zero trust
The concepts of zero trust are usually applied to network and infrastructure layers for safeguarding digital assets and resources. But what about the software applications that run on zero trust networks?

Applying zero trust to software application code provides a more holistic approach that improves security at every layer of the stack — from network access to application logic. By ensuring that our application logic applies principles of least-privilege access, continuous authentication, and continuous authorization, we can create more secure software to protect against modern attack vectors. For teams operating in regulated environments or building systems where downtime, data leakage, or unauthorized access have real-world consequences, this isn't optional — it's table stakes.

### The software development life cycle
The [DevSecOps approach](https://www.redhat.com/en/topics/devops/what-is-devsecops) treats security as a shared responsibility across all stages of software development. But we all know that security is sometimes deprioritized when teams are under pressure to deliver quickly. When faced with a decision between security and time-to-market, it's the responsibility of the team to communicate the trade-offs effectively to stakeholders. If a product release can't be delayed in favor of security and a compromise is the next best option, queue up the technical debt for the next opportunity to release.

Introducing automation into the software development life cycle can also help reduce the overhead of developing and reviewing code for security. There are a host of tools available to perform [static code analysis](https://owasp.org/www-community/controls/Static_Code_Analysis) and [vulnerability scanning](https://owasp.org/www-community/Vulnerability_Scanning_Tools) that can help identify issues early on in the process.

Equally important — and often under-invested — is **auditability**. Structured logging, tamper-evident audit trails, and end-to-end traceability of sensitive actions aren't just compliance checkboxes. They're what let you answer the hard questions after an incident, demonstrate due diligence to regulators, and build the kind of operational trust that demanding customers require.

### Insider threats
Software development teams often have access to critical systems and sensitive data. If a developer with elevated permission is compromised, the entire application and its data is at risk. Zero trust limits the potential damage by applying least privilege access to ensure that developers and systems can only access what is strictly necessary for their specific tasks. Code repositories and environments should be segmented to limit unnecessary access across teams and services. A front-end developer working on a user interface should not have access to sensitive back-end databases unless absolutely required.

In environments that handle CUI or regulated data, segmentation becomes even more consequential. Environments should be separated by data sensitivity, access should be provisioned per task rather than per role, and privileged actions should require explicit justification and leave a paper trail.

### Supply chain risks
Modern software is built on the shoulders of giants; it involves using third-party libraries, frameworks, and APIs. These external dependencies can introduce security vulnerabilities that affect the integrity of the entire application or system. Zero trust requires strict monitoring of all external code and libraries that are integrated into the development process. [Dependency management tools](https://cloud.google.com/software-supply-chain-security/docs/dependencies#dependency-tools) can help you understand and evaluate the security posture of your project and its dependencies.

Maintaining a software bill of materials (SBOM) is increasingly expected — and in federal and defense contexts, often required. An SBOM gives you a defensible record of every component in your software, which is essential when a new CVE drops and you need to know, within hours, whether you're exposed.

### API security
APIs are often a target for attackers because they provide a direct path to sensitive data or services. Zero trust ensures that every API call is authenticated, authorized, and encrypted — even within internal systems. Internal and external APIs should be equally secured to ensure no implicit trust exists within the system. For example, internal APIs should use token-based authentication in the same manner as external APIs.

### AI and ML systems
AI and machine learning systems introduce security considerations that traditional application security doesn't fully address. A model is effectively new attack surface: training data can be poisoned, prompts and inputs can be weaponized to extract data or manipulate behavior, and the model's outputs are probabilistic — which means they cannot be trusted blindly the way we trust deterministic code.

Zero trust applied to AI systems means:

- **Treat model outputs as untrusted input.** Validate, sanitize, and constrain what downstream systems accept from a model, especially when the output drives a decision or an action.
- **Verify training data provenance.** Know where your data came from, who touched it, and when. Apply the same supply chain rigor you apply to code dependencies.
- **Continuously monitor for drift and adversarial behavior.** Models degrade and can be attacked. Instrument them the way you instrument a production service.
- **Audit model decisions.** In high-stakes domains — medical, defense, financial — you need to be able to explain, after the fact, why a model produced a given output. Build the logging and traceability in from the start.

For systems that inform operational decisions in contested or time-critical environments, these aren't theoretical concerns. They're the difference between a tool commanders can rely on and one they can't.

### Conclusion
Zero trust provides a comprehensive, forward-thinking framework for ensuring that software remains secure in the face of modern challenges. Although the zero trust model has historically been applied to networks and infrastructure, the most interesting work now lives at the seam between infrastructure and application — and increasingly, at the seam between application and AI.

Applying zero trust principles to software development is essential for building secure, resilient, auditable, and compliant systems. By prioritizing least-privilege access, continuous verification, strict segmentation, and end-to-end auditability within our applications, we can bolster our cybersecurity strategy, reduce our attack surface, and build software that holds up in the environments that need it most.
