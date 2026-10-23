# Interview Helper

A self-contained interview preparation dashboard for junior software engineering, full-stack, backend, QA automation, data engineering, and programming-heavy data roles.

## Features

- Daily dashboard showing scheduled lessons, actual time blocks and ready reviews
- Sequential Odin, CS50P, JavaScript and algorithm study tracks
- A sourced interview-question bank covering software, web, algorithms, SQL, data engineering, testing, system design, and behavioral interviews
- Concise and expanded answers with examples, common traps, question-bank attribution, and technical-reference links
- Browser-based spaced-repetition scheduling with Again, Hard, Good, and Easy ratings
- Custom flashcard creation
- Error log that turns mistakes into future review cards
- Progress stored locally in the browser
- Vivid green/purple wireframe dashboard with secondary study tools in one collapsed section
- Responsive single-page design with no build step; integrated study tools load their documented runtimes on demand

## Run locally

Serve the folder with any static web server (required for the local SVG icon sprite).

```bash
python -m http.server 8000
```

Then visit `http://localhost:8000`.

## Data storage

Schedule progress, flashcard review history, custom cards, and error-log entries are stored in browser `localStorage`. The textbook, notes and progress stay in this browser. Rust code runs through Rust Playground; video embeds and runtime downloads contact their respective services.

## Hosting

Pushes to `main` deploy through `.github/workflows/pages.yml`.

See DESIGN.md for the approved visual direction and interface validation checklist.

## Integrated study

- **Learning tracks & textbook** opens the discrete mathematics importer, Rust foundations and all algorithm practice workspaces.
- Import your own text-based Rosen PDF. The importer checks the title and author, detects numbered sections, and asks you to confirm physical PDF page ranges for your edition. Files are kept in this browser's IndexedDB; clearing site data removes them. Export math progress from Textbook & course. The export excludes the textbook and videos.
- The real 85-video mapping comes from Discrete Mathematics Study Helper release 2.8.12. Watch completion is manual. Reading and exercise completion are shared across groups that revisit a section. The importer uses PDF bookmarks when available, preserves shared boundary pages, and links section exercises, odd-numbered answers and optional chapter material. Unmatched page references can be corrected manually. Practice now extracts individual questions, preserves their native formulas/tables/diagrams, and offers previous/next navigation, per-question drafts and reversible completion. Odd answers are linked to the exact section and exercise number, hidden by default, and remain available in the source PDF for diagrams. Answers are never fabricated or automatically graded.
- Scanned PDFs require OCR before import. The web parser is a browser adaptation with editable boundaries, not the desktop PyMuPDF parser; see THIRD_PARTY.md.
- Scheduled algorithms have original Python exercises and runnable practice tests. Python can use small imported text/CSV/JSON files and supplied stdin lines. They are temporary per run.
- JavaScript runs in a worker. Odin workspaces also offer a sandboxed HTML/CSS/JavaScript preview. Backend servers/databases and official course checks remain in the linked development environment.
- Rust currently provides four foundation lessons (mutability, functions, borrowing, Option/match) with real compilation via Rust Playground. Running code sends only that code to the public service, as stated beside the button.
- Runtime downloads and YouTube require internet access. Code and notes remain saved if a service fails. Code drafts are private browser storage, not cloud synchronization.

## Checks

```bash
npm install
npm test
npx playwright install chromium
python -m http.server 8000
# In another terminal:
npm run test:browser
```

Browser tests use an isolated profile, a synthetic PDF (no textbook content), and the actual Python/JavaScript/Rust runtimes. They cover completion/reload, stop, PDF rejection/import, reading, exercises, answer links, notes, review cards and desktop/tablet/phone overflow. The Rust test needs its public service to be available. Set TEST_SCREENSHOTS for screenshot output, TEST_URL for an alternate local server, or CHROMIUM_EXECUTABLE_PATH for a locally installed Chromium. No personal textbook is included in tests.

The user-supplied 1,118-page Rosen eighth-edition PDF was checked privately during implementation: 72 numbered sections, section exercise starts and odd-numbered answer references were detected. All mapped video groups matched a section. The copyrighted PDF and its extracted text are excluded from this repository.

To repeat that private integration check with your own copy: `TEST_TEXTBOOK=/absolute/path/to/your/rosen-eighth-edition.pdf npm run test:textbook` while the local server is running.

Exercise extraction was audited privately against the supplied edition: 3,533 numbered questions across 72 section sets, with no missing labels in their numeric sequences. This is a structural audit; representative diagram, table, shared-page, and saved-work cases were also checked visually and in Chromium. Other editions may need manual boundary correction. Run `TEST_TEXTBOOK=/absolute/path/to/your/rosen-eighth-edition.pdf npm run test:exercises` to repeat the private exercise UI checks. Existing imported books are indexed on first practice use; re-import is not necessary.

Watch, Read, Practice and Review share a **Swap sides** control. The material starts on the right; your preference is saved across stages and reloads. Swapping keeps the video/PDF mounted and preserves current form drafts and page selection. On narrow screens the selected order stacks vertically. Run `npm run test:math-layout` against the local server to check swapping, state preservation and responsive layouts using the synthetic fixture.
