# SEAK public engineering reference lab

**Status: working, testable standalone educational reference implementation.**
This is original sample code prepared to demonstrate engineering approaches. It is **not**
the source code of SecureGate, MERNORAHFLOW, Roxzy or any confidential client project.
It is **not a deployed SaaS product, audited security library or live payment processor**.

## What this shows

1. **Tenant-scoped resource authorization** (`access.mjs`).
   A trusted identity context is required, organization boundary checks occur before
   role checks, other-tenant resources are hidden as 404, and missing permissions
   are denied by default. The example separates read/update operations.
2. **Balanced journal + idempotency** (`journal.mjs`).
   Signed integer minor-unit postings must balance, use one currency, and pass
   all checks before mutating the in-memory state. Retries with the same key and
   payload are accepted; conflicting retries are refused.
3. **Signed webhook validation** (`webhook.mjs`).
   HMAC-SHA256 validation uses the raw request body, a signed timestamp, a freshness
   window and a constant-time comparison of equal-length signatures.
4. **Automated negative-path tests** (`lab.test.mjs`), using Node's built-in
   test runner; CI runs the same suite on each pull request and deployment commit.

## Reproduce in Node.js 22+

```sh
node --test engineering-lab/lab.test.mjs
```

No API keys, dependencies or paid services are required.

## Threat model and production limitations

**Assumptions:** authentication upstream provides a verified actor; resources and
organization IDs are loaded by trusted backend code; secret values are configured
server-side and never delivered to a browser.

**What the lab checks:** cross-tenant denial, role authorization, unbalanced
journals, duplicate account lines, unsafe money values, idempotency-key
conflicts, tampered signatures and stale events.

**What it does *not* establish:** production authentication, database isolation,
persistence, distributed concurrency correctness, secret rotation, rate limiting,
PII privacy controls, payment-provider compliance, hardware security, or external
penetration-test certification.

For production use, move idempotency and ledger postings into a **single database
transaction** with unique constraints and serializable/retry semantics where
required; use audited identity verification, TLS, replay-safe event IDs, durable
webhook deduplication, monitoring, recovery procedures, automated vulnerability
scanning, and properly scoped authorization at every resource access boundary.
An in-memory Map has no multi-process or crash consistency.

## Reviewer traceability

The included tests provide reproducible proof of **these exact samples**.
They do not substantiate performance or delivery claims about other private
systems in the portfolio.

To review a related real project write-up, see
[SecureGate](../case-studies/securegate.html),
[MERNORAHFLOW](../case-studies/mernorahflow.html), and
[the engineering evidence index](../projects.html#engineering-review).
