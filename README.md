# NectarPay Pulse

Personalized engagement pages for the outbound campaign. Landing at `/`,
per-lead Pulse pages at `/s/<token>` (token = nectarpay_leads.pulse_token).

Requires migration `020_pulse-engagement.sql` on the nectarpay Supabase project.

## Deploy
1. Vercel -> New Project -> import this repo -> name `nectarpay-pulse`
2. Env vars: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (nectarpay project)
3. Add domain `nectarpayaz.com` to the project
4. Test: grab any pulse_token from the leads table -> visit /s/<token>

## Event flow
- Page view -> soft log only (email scanners can trigger these)
- Slider release / intent chip / visit request / text request -> activity
  on the contact's CRM timeline (trigger-side, 020)
- "Not for us" -> status DO_NOT_CONTACT + contact disqualified, instantly
