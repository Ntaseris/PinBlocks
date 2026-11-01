# PinBlocks browser beta deployment

The browser beta is a static, client-side application. MPF YAML files selected through the folder picker are parsed in the visitor's browser and are not uploaded to PinBlocks. The existing Python/pywebview desktop application remains supported and retains direct Install Mode.

## Vercel preview

1. Import `Ntaseris/PinBlocks` into Vercel.
2. Select the `codex/browser-public-beta` branch for the first preview.
3. Framework preset: **Other**.
4. Build command: `npm run build`.
5. Output directory: `.`.
6. Install command can be left empty; the project has no runtime npm dependencies.
7. Test the generated `*.vercel.app` preview before promoting or attaching a domain.

Do not connect the production domain until the preview has passed the beta checklist and the repository owner approves promotion.

## Houseball subdomain (approval required)

After approving the Vercel preview:

1. In the Vercel project, add `pinblocks.houseballamusements.com` under Domains.
2. In the DNS provider that is authoritative for `houseballamusements.com`, create the exact CNAME record Vercel displays. Vercel commonly requests a CNAME for host `pinblocks`, but its displayed target is the source of truth.
3. Remove a conflicting `pinblocks` A/AAAA/CNAME record only after confirming it is unused.
4. Wait for Vercel's domain verification and TLS certificate to become ready.
5. Open the HTTPS URL, run the smoke checklist, then add the link to the Houseball Shopify navigation in a separate approved change.

No production, Vercel-project, Shopify, or DNS changes are performed by this repository branch.

## Browser beta checklist

- Open the demo machine without selecting local files.
- Select an MPF root folder and confirm switch/light/mode counts.
- Complete Guided Build: shot → three-hit counter → score rule.
- In Test, make the shot three times and confirm score/counter completion.
- Download the generated MPF YAML and validate its mode, shots, counters, event/variable player sections.
- Save a `.pinblocks` project, reopen it, and confirm the mode remains editable.
- Confirm an imported existing mode remains export-locked.
- Confirm the packaged desktop app still opens a real folder and offers Preview Install/Install Mode.
