# Components and provenance

- The discrete mathematics playlist metadata is adapted from `data/video_chapter_matches.json` bundled in dc1818/DiscreteMathematicsStudyHelper release 2.8.12. The original MIT license is retained in assets/MATH-HELPER-LICENSE. It includes 85 exact video IDs and section matches; no textbook text, answers, or videos are distributed.
- The browser curriculum preserves consecutive playlist grouping, introduction-only behavior, direct section matching, shared section completion and appended reading-only sections. It is a browser adaptation, not execution of the desktop Qt/PyMuPDF parser. Historical 2.8.6 and 2.8.9 changes were consulted; the complete Python source was absent from the available repository branches.
- PDF.js 6.4.299 (Apache-2.0) is loaded from jsDelivr on first textbook use. Text is extracted and pages rendered locally. PDFs remain in IndexedDB. Copyright Mozilla Foundation and individual contributors.
- Pyodide 314.0.7 (MPL-2.0; bundled CPython and component licenses apply) is loaded from jsDelivr in an isolated sandbox and worker on demand. https://github.com/pyodide/pyodide
- Rust runs via the public Rust Playground execution endpoint only when Run on Rust Playground is selected. The interface explains that code is sent to that service. https://github.com/rust-lang/rust-playground
- Lucide icons: license in assets/LUCIDE-LICENSE.

External runtimes and embedded videos require internet access and may be unavailable. The application displays errors and preserves drafts. No LeetCode judge, account integration or hidden test suite is claimed. All local algorithm prompts and tests are original practice material.
