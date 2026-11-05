<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Project rules
- Product facts, download options and placeholders live in `src/lib/site.ts`; pages read from there so swapping placeholders is a one-file change.
- Per-route SEO goes through `seo()` in `src/lib/seo.ts` with the request origin from `getRequestOrigin` (route loader) so canonical/og:url are absolute.
- Light sections use the `.theme-paper` class, which re-scopes the semantic tokens instead of hardcoding colors.
- Product UI previews are HTML mockups in `src/components/mockup/AppWindow.tsx`, always captioned as illustrative, not fake screenshots.
- sitemap.xml and robots.txt are server routes (not files in public/) so URLs use the live origin.
