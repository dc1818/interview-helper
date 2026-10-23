# Vivid wireframe

Implement the user-approved second mockup: a straightforward daily learning dashboard with WaniKani-inspired lesson/review hierarchy and a dark Matrix-inspired console aesthetic.

- One dashboard; no sidebar or persistent menu grid. Secondary views live in the collapsed “Study tools & progress” disclosure.
- Green Today's lessons and purple Reviews panels precede the daily assignment list. Lesson and review buttons open existing working flows.
- Charcoal forest background #101714, text #f2f5f3, muted text #b7c2bd, vivid green #55e8a0. Green panel #075b38–#06422d; purple panel #592466–#43264e. Crisp one-pixel borders, 3px corners, no glow or decorative shadows.
- IBM Plex Mono with system monospace fallback. Local Lucide SVG sprite, with its license in assets.
- All counts, lesson titles and minutes derive from the existing schedule and saved progress. Reviews explicitly distinguish due from new cards. Never insert mock curriculum or invented metrics.
- Preserve existing localStorage keys and curriculum order. Completion survives reload. Sunday and completed tracks have explicit empty/completed states.
- At narrow widths, stack action panels and put lesson actions below the text. Maintain keyboard focus, native dialog Escape behavior, labels, 44px controls and reduced motion support.

Implementation: index.html owns data and behavior; assets/vivid.css owns presentation. Serve over HTTP so the external SVG sprite loads. Check desktop, tablet and 320–390px phone widths, lesson completion/reload, review rating, saved data, empty states and all secondary views before shipping.

## Integrated learning workspaces

The approved lesson mockups extend the same shell. The dashboard remains the single entry point, with Learning tracks & textbook below its daily list. Math is added to study days after PDF import; Rust foundations can be toggled for Mon/Wed/Fri. Both add their actual minutes. Sunday stays a rest day.

Math uses Watch / Read / Practice / Review, with consecutive playlist groups and shared numbered-section progress. Learners import their own Rosen PDF into IndexedDB; no book is committed or uploaded. Title/author verification precedes editable page-boundary confirmation. Missing exercise/answer pages are explicitly unavailable until linked. No answers are generated. Introduction videos have no textbook work; uncovered sections remain reading-only units. Local videos override YouTube playback and are saved privately.

Coding has a task column, editable code, tests/output, and reasoning. Python and JavaScript run in opaque-origin sandbox frames and terminable workers. Python loads pinned Pyodide on demand. Rust code runs on the public Rust Playground only after an explicitly labeled action. HTML/CSS/JS previews are sandboxed with network access disabled. Failed runtime loading, errors, stop/timeouts and unsaved storage failures remain visible. Original course links and official CS50/LeetCode checks are distinct from local practice.

All new records use separate keys; the original track indices, SRS and completion keys retain their meanings. Editable code/notes autosave, while course completion is explicit. Panels stack on tablets/phones, PDF pages scroll within their reader, and readable code can scroll horizontally inside its editor.
