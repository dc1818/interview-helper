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

## Extracted mathematics exercises

Reading notes and exercise working sit on the left; the larger textbook reader sits on the right. On narrow screens, working comes first and the reader follows. Keep DOM and visual order aligned. The desktop reader stays visible while long question content scrolls.

Practice extracts individual native PDF questions on demand, with an actual question selector, previous/next navigation, challenge markers, source excerpts preserving tables/diagrams/formulas, selectable text, and separate saved working. Shared directions stay with the relevant questions. Source page controls remain available. Question answers are hidden on selection and offered only when an exact section/number match was extracted; even-numbered answers are not invented. Completion is reversible. Existing saved books and numeric exercise drafts remain compatible; catalogs use separate versioned IndexedDB keys. Missing labels and parsing failures are explicit, with the source PDF still available.

All four math stages use the same orientation: Watch has selection/actions on the left and video on the right; Read and Practice have notes/questions/working on the left and textbook on the right; Review has card creation on the left and the unit checklist on the right. Use the same column proportions and left-first mobile/keyboard order throughout.

A shared Swap sides button reverses all four math stages and saves the preference in `interview-helper-math-layout-v1`. Material defaults to the right. Swap the working panel in DOM order without remounting the video or PDF; retain form values, selected question, page and playback. Reverse column proportions with the panels, and preserve the chosen DOM order when stacked on phones.

The optional answer key lives in Textbook & course, as a private ZIP import. Its status reports verified coverage and import failures. In Practice, the existing reveal control distinguishes textbook odd answers from imported even worked solutions. Even solutions render native PDF excerpts with selectable text in a disclosure; no answers appear before reveal, and selecting another question hides them. The imported key is stored separately from textbook/progress and can be removed independently. No copyrighted book or solution text is committed.
