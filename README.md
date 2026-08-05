# wed_design_skils

Claude Code skills for design work, vendored into this repo under `.claude/skills/` so
they're available automatically in any session opened here — plus real design work
produced using them.

## Projects

### `wedding-invitation/`

Свадебный сайт-приглашение для Артёма и Юлии (19 сентября 2026) — одностраничник
на чистых HTML/CSS/JS, собранный с помощью скилла `ui-ux-pro-max` и принципов
типографики бюро Горбунова. Подробности, включая как добавить реальные фото,
точный адрес на карте и приём заявок RSVP — в `wedding-invitation/README.md`.

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

## MCP servers

### `21st` (21st MCP — UI component generation/search)

`.mcp.json` at the repo root registers the [21st MCP](https://21st.dev/mcp) as a
project-scoped HTTP MCP server. It gives Claude Code tools to search 21st.dev's
component catalog, pull inspiration, and generate/refine UI components and logos on
demand (`generate`, `search`, `get_inspiration`, `search_logo`, `get_component`, and
more — call `tools/list` once connected for the full set).

**Setup (one-time, per machine):**

1. Get an API key at [21st.dev/mcp](https://21st.dev/mcp).
2. Export it in your shell before opening Claude Code in this repo:
   ```bash
   export TWENTY_FIRST_API_KEY="your-key-here"
   ```
   Claude Code expands `${TWENTY_FIRST_API_KEY}` from `.mcp.json` at connect time — the
   key itself is never committed to this repo.

Note: this repo's `.mcp.json` targets the current 21st MCP directly (`https://21st.dev/api/mcp`).
The older `@21st-dev/magic` npm package (formerly "Magic MCP") is now just a
compatibility proxy for the same backend and isn't needed here.
