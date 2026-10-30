# Security changes in this build

## Required deployment variables

Set these server-side in Netlify/Vercel. Do not put them in `NEXT_PUBLIC_*` variables or commit them:

- `CZER_CODE`: a new long random administrator access code. The previous hardcoded code was removed.
- `CHAT_ACCESS_SECRET`: a separate long random secret used to sign customer-chat access tokens.
- `NEXTAUTH_SECRET`: a long random secret used by NextAuth.

If `CZER_CODE` is not set, the Czer master login is disabled instead of falling back to a built-in credential.

## Defensive changes

- Removed hardcoded Czer credentials from server code, client JavaScript, setup scripts, and documentation.
- Added constant-time secret comparisons for the Czer code and chat access tokens.
- Added signed customer-chat access tokens. Chat metadata and messages now require a matching email and token.
- Added a shared honeypot detector for public forms, including alternate bot field names.
- Added a robots trap endpoint that records a warning and returns a non-cacheable 404.
- Added additional response hardening headers and disabled the `X-Powered-By` disclosure.
- Added `object-src 'none'` to the existing CSP.

## Verification

Install dependencies and run the project's lint and production build commands before deploying. This archive was edited without access to the production database or deployment environment, so the environment variables and live integrations must be checked in the target hosting dashboard.
