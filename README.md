# Interview Helper

A self-contained interview preparation dashboard for junior software engineering, full-stack, backend, QA automation, data engineering, and programming-heavy data roles.

## Features

- Twelve-week schedule with daily time blocks and direct study links
- Forty-eight built-in technical flashcards covering software, web, algorithms, SQL, data engineering, testing, system design, and behavioral interviews
- Browser-based spaced-repetition scheduling with Again, Hard, Good, and Easy ratings
- Custom flashcard creation
- Error log that turns mistakes into future review cards
- Technical speaking prompts with a 90-second timer
- Role-specific study adjustments
- Progress stored locally in the browser
- Responsive single-page design with no build step or external runtime dependency

## Run locally

Open `index.html` in a browser, or serve the folder with any static web server.

```bash
python -m http.server 8000
```

Then visit `http://localhost:8000`.

## Data storage

Schedule progress, flashcard review history, custom cards, and error-log entries are stored in browser `localStorage`. Nothing is sent to a server.

## Hosting

The repository is ready for GitHub Pages from the `main` branch and repository root.
