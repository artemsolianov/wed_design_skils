# wed_design_skils

Claude Code skills for design work, vendored into this repo under `.claude/skills/` so
they're available automatically in any session opened here.

## Skills

### `ui-ux-pro-max`

UI/UX design intelligence for web and mobile: a searchable local database of 84 UI
styles, 192 color palettes, 74 font pairings, product-type reasoning rules, UX
guidelines, icon recommendations, GSAP motion presets, and chart-type guidance across
22 tech stacks (React, Next.js, Vue, Svelte, Astro, SwiftUI, React Native, Flutter,
Tailwind, shadcn/ui, Jetpack Compose, Angular, Laravel, and more).

Claude Code activates it automatically for UI/design tasks — building or reviewing
pages and components, picking colors/typography/layout, checking accessibility, or
adding animation and data visualization.

It can also be queried directly:

```bash
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "<query>" --domain <domain> [-n <max_results>]
```

Domains: `product`, `style`, `typography`, `color`, `landing`, `chart`, `ux`, `icons`,
`react`, `web`, `google-fonts`, `gsap`. Stack-specific search:

```bash
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "<query>" --stack <stack>
```

Vendored from [nextlevelbuilder/ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill)
(MIT licensed — see `LICENSE`).
