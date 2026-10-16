# Sukkah Emmanuel — Software Engineering Portfolio

Live: https://lkofi.github.io/

A multi-page, accessible personal portfolio built for job applications and engineering case studies.

## Pages
- `index.html` — cinematic hero and featured engineering work
- `projects.html` — twelve engineering projects, filtering, and clear prototype-versus-delivery distinctions
- `capabilities.html` — real engineering capabilities, related industry experience and sectors suitable for future solutions
- `engineering-roadmap.html` — seven clearly labeled planned GitHub projects with architecture, security, tests and intended demonstrations
- `about.html` — personal engineering approach and photography
- `experience.html` — experience and expanded technical toolkit
- `contact.html` — contact form, direct mail and GitHub
- `resume.html` — printable CV
- `case-studies/` — three documented flagship technical case studies

## Tech
Static HTML/CSS/JavaScript with accessible navigation, semantic controls, responsive images, reduced-motion support, and no JavaScript framework required at runtime. Site assets reside under `assets/`.

## Email activation
Contact messages are routed through FormSubmit to `sukahemmanuelkofi@gmail.com`. To activate, submit one test message, open the FormSubmit activation email in that mailbox, approve forwarding, then test again. Form acceptance alone is **not proof** of mailbox delivery. Direct mail links remain available.

## Hiring pathways and engineering evidence
- Homepage provides separate first-click routes for international recruiters, engineering managers and prospective clients.
- Experience includes a recruiter summary and approved CV link; Projects includes an honest evidence index distinguishing public source, private work, prototypes and plans.
- Contact includes a suggested scoped project engagement process, without fabricated promises or performance numbers.
- Three case studies include technical validation and evidence-boundary notes, and the MERNORAHFLOW write-up explicitly distinguishes separate documented architecture stages.
- LinkedIn profile link is the address supplied by the site owner; its logged-in profile content has not been verified here.
- GitHub Actions browser smoke tests include axe-core WCAG rule checks. Critical violations fail the workflow; other findings are reported for review.

## Deployment
GitHub Pages deploys on pushes to `main`. `.github/workflows/pages.yml` runs source integrity checks. `.github/workflows/browser-audit.yml` runs Chromium smoke tests for desktop and mobile. See `scripts/check-site.mjs` and `scripts/browser-audit.mjs`.

Source screenshots are not fabricated: project art is clearly marked as conceptual, while written claims are drawn from verified engineering experience.

## Additional engineering work
The catalog also includes MERNORAH INTELLIGENCE (an early enterprise AI authentication/MFA prototype), MERNORAH WEB EXPERIENCE (immersive frontend development work), and this SEAK PORTFOLIO (public source). Development-stage entries are identified as such and do not claim completed production deployments.

## Evidence boundaries
Documented experience and work-in-progress are distinguished from proposed systems. The capabilities page labels industries with related work separately from sectors that are prospective opportunities; the roadmap describes future engineering builds, **not** completed projects or published source. Project details remain bounded by the approved CV and accessible code evidence.
