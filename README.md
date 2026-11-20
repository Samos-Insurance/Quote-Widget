# Samos Quote Widget: Integration & Security Guide

## Overview
The Samos Quote Widget is a secure, embeddable JavaScript application that allows partners to seamlessly integrate the Samos quoting and activation flows directly into their own websites. 

## Why We Are More Secure
Unlike traditional embedded scripts that expose partners to supply-chain attacks and cross-site scripting (XSS), the Samos Quote Widget is built on a zero-trust, cryptographically verified pipeline.

### 1. Cryptographic Subresource Integrity (SRI)
Every release of our widget generates a unique SHA-384 cryptographic hash. Partners embed this hash via the `integrity` attribute. If a malicious actor were to compromise our CDN and alter even a single byte of the script, the partner's browser will instantly detect the mismatch and block the script from executing.

### 2. Cryptographic Signing via Sigstore
All production assets are cryptographically signed using the Sigstore toolchain before being deployed to our AWS S3 origin. This guarantees the provenance and authenticity of the code, ensuring it was genuinely built by our automated GitHub Actions CI/CD pipeline and not tampered with post-build. We also publish to NPM using strict Provenance.

### 3. Immutable Versioning
We use strict version-locked deployments (e.g., `/v1.0.1/widget.js`). Once a version is deployed, it is immutable. This prevents unexpected automated updates from breaking partner integrations and ensures that browser caching behavior is 100% predictable and secure.

### 4. Sandboxed Execution Environment
The widget core runs entirely within a secure `<iframe>`. We apply a strict `sandbox` attribute (`allow-scripts allow-forms allow-same-origin allow-popups`) and a `strict-origin-when-cross-origin` referrer policy, isolating the widget's execution context from the host page.
