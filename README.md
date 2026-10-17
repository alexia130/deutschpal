
# DeutschPal 🇩🇪

**A German vocabulary learning application built with React, TypeScript, and Vite.**

DeutschPal is an interactive web application designed to help German language learners organize vocabulary, practice grammar, track learning progress, and improve long-term retention.

Rather than relying only on static vocabulary lists, the application combines vocabulary management, targeted practice exercises, mistake tracking, and personalized learning insights in one interface.

## Key Features

### 📚 Vocabulary Management

- Add, edit, and delete vocabulary entries
- Organize nouns, verbs, adjectives, and expressions
- Mark vocabulary as favorites
- Search and filter vocabulary
- Store personal examples
- View individual word profiles

### 🎯 Interactive Practice

Practice vocabulary through different exercise modes:

- **Meaning Practice** — recall word meanings
- **Article Practice** — practice German noun articles
- **Plural Practice** — learn noun plural forms
- **Präteritum Practice** — review past-tense verb forms
- **Perfekt Practice** — practice perfect-tense constructions
- **Comparative Practice** — review adjective comparisons
- **Mixed Practice** — combine different question types
- **Context Practice** — practice vocabulary in context

Practice sessions help learners identify difficult words and review their knowledge.

### 🔤 Verb Trainer

A dedicated module for practicing German verbs.

Supported practice categories include:

- Infinitive
- Meaning
- Präteritum
- Perfekt
- Partizip II
- Auxiliary verb
- Mixed mode

Additional capabilities include pronunciation, level filtering, initial-letter filtering, favorite verbs, and progress tracking.

### 📊 Learning Analytics

DeutschPal includes several features for monitoring learning activity:

- **Knowledge Map** — visualize vocabulary knowledge
- **Learning Timeline** — review learning activity over time
- **Learning Coach** — receive learning guidance
- **Mistake History** — identify frequently missed vocabulary
- **Word Mastery Tracking** — monitor vocabulary progress
- **Adaptive Recommendations** — support targeted revision

These features aim to make learning progress more visible and help learners prioritize their practice.

### 💾 Import and Export

- Export vocabulary as a JSON backup
- Import vocabulary from JSON
- Import CSV and TSV files
- Detect duplicate entries
- Restore vocabulary from backups

## Technology Stack

| Technology | Purpose |
|---|---|
| React | Component-based user interface |
| TypeScript | Static typing and application logic |
| Vite | Development server and production builds |
| React Router | Client-side navigation |
| Tailwind CSS | UI styling |
| Lucide React | Interface icons |
| LocalStorage | Browser-based data persistence |

## Application Architecture

DeutschPal uses a feature-oriented frontend architecture.

```text
src/
├── app/
├── components/
├── features/
├── pages/
└── shared/
```

The codebase separates application pages, reusable UI components, feature-specific functionality, and shared utilities.

The application uses React components, custom hooks, context providers, and TypeScript types to organize state and application behavior.

### Main Modules

- Vocabulary Management
- Practice
- Verb Trainer
- Knowledge Map
- Learning Coach
- Mistake History
- Learning Timeline
- Settings

## How It Works

**1. Build a vocabulary collection**

Users create vocabulary entries with relevant grammatical information and examples.

**2. Practice vocabulary**

The application provides different practice modes based on the vocabulary being studied.

**3. Review mistakes**

Practice activity helps learners identify vocabulary that requires additional attention.

**4. Monitor progress**

Learning analytics and timeline features provide visibility into study activity and vocabulary mastery.

**5. Manage learning data**

Vocabulary can be stored locally and transferred using the available import and export features.

## Getting Started

### Prerequisites

- Node.js
- npm

### Installation

Clone the repository:

```bash
git clone https://github.com/alexia130/deutschpal.git
```

Navigate to the project:

```bash
cd deutschpal
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open the local URL displayed by Vite in your browser.

### Code Quality

Run ESLint:

```bash
npm run lint
```

Create a production build:

```bash
npm run build
```

The build process includes TypeScript compilation and Vite production bundling.

## Data Storage

DeutschPal uses browser-based LocalStorage to persist learning data.

The application can be used locally without configuring an external database or backend service.

Users can manage vocabulary backups through the import and export functionality.

**Note:** LocalStorage data is associated with the browser and origin. Clearing browser storage may remove saved learning data, so exporting backups is recommended.

## Screenshots

Screenshots of the application interface will be added here.

Suggested views:

- Vocabulary dashboard
- Interactive practice session
- Learning analytics dashboard

## Future Improvements

Potential future developments include:

- User authentication
- Cloud synchronization across devices
- Mobile application
- Speech recognition
- AI-assisted conversation practice
- Further improvements to spaced repetition
- Expanded learning analytics

## Project Purpose

DeutschPal is a personal software development project focused on combining language learning with modern frontend engineering.

The project demonstrates practical experience with:

- React and TypeScript development
- Component-based architecture
- State management with React hooks and context
- Interactive user interfaces
- Browser-based data persistence
- Modular application design
- Frontend tooling and production builds

## License

Developed for educational and personal learning purposes.

No open-source license has been specified.
