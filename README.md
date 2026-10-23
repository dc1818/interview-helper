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
- Responsive single-page design with no build step or external runtime dependency

## Run locally

Serve the folder with any static web server (required for the local SVG icon sprite).

```bash
python -m http.server 8000
```

Then visit `http://localhost:8000`.

## Data storage

Schedule progress, flashcard review history, custom cards, and error-log entries are stored in browser `localStorage`. Nothing is sent to a server.

## Hosting

Pushes to `main` deploy through `.github/workflows/pages.yml`.

See DESIGN.md for the approved visual direction and interface validation checklist.
