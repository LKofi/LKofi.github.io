# Sukkah Emmanuel — Software Engineering Portfolio

Public website: https://lkofi.github.io/

Minimal, responsive and personally branded website for **Sukkah Emmanuel Kofi Ariel** — software engineer in Accra, Ghana.

## How it works

- `index.html` — main portfolio (9 engineering case studies and personal experience).
- `assets/site.css` — visual design, responsive layouts, accessibility and reduced-motion support.
- `assets/site.js` — accessible navigation, project case studies and contact form.
- `resume.html` — printable CV. Open and choose **Print / Save as PDF**.
- `.github/workflows/pages.yml` — checks and deploy job.
- `scripts/check-site.mjs` — verifies local links, required assets, project wiring and JavaScript syntax.

## Contact form activation

The contact form uses [FormSubmit.co](https://formsubmit.co/) as a third-party email relay, with submissions directed to `sukahemmanuelkofi@gmail.com`.

**Important: The recipient must activate the form.** Open the published site, send one test submission, find FormSubmit's activation email in that Gmail inbox and click the activation link. Until activation, forwarding to the inbox is not enabled. Do not treat a client-side success response as proof that mail was delivered. The site also has direct `mailto:` links as a fallback. Submissions are processed by the third-party service; do not submit sensitive details.

## Deployment

Pushing to `main` triggers GitHub Pages branch deployment when that source is enabled in repository Settings → Pages. The included Actions workflow additionally runs source checks and attempts a GitHub Actions Pages deployment; GitHub Actions deployments require Settings → Pages → Source: **GitHub Actions**. Choose one Pages deployment source as appropriate for your account. `main` is the publishing branch.

## Authenticity

Private client material is not embedded; engineering project descriptions are based on the CV and publicly shareable work. Product dashboard imagery is identified as a **system illustration**, not represented as a production screenshot. The portraits are stylistically edited versions of user-provided photography.

## Local development

```bash
python -m http.server 8000
# open http://localhost:8000
node scripts/check-site.mjs
```
