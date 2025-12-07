# Alfred Analysis Site

This is a [Next.js](https://nextjs.org) project designed to visualize daily financial portfolio data. It uses a file-based data system and Static Site Generation (SSG) for high performance.

## 1. Project Overview

**Alfred Analysis Site** serves as a read-only dashboard for viewing:
- Daily portfolio performance summaries.
- Detailed holdings lists.
- Manager commentary (daily briefs).
- In-depth reports for individual stock tickers.

The site is built using **Static Site Generation (SSG)**. This means all pages are pre-rendered into HTML at build time, ensuring extremely fast load times and simple hosting requirements.

## 2. Quick Start & Installation

### Prerequisites
- [Node.js](https://nodejs.org/) (Version 20 or higher recommended)
- `npm` (usually comes with Node.js)

### Installation
1. Open your terminal in the project directory.
2. Install the dependencies:
   ```bash
   npm install
   ```

### Running the Development Server
This allows you to view the site locally and see changes in real-time.

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result. The site will automatically redirect to the latest data date defined in `data/latest.json`.

You can start editing the page by modifying `app/page.tsx` or the components in `app/v1/...`. The page auto-updates as you edit the file.

### Building for Production
To generate the static HTML files (what you would deploy to a web server):
```bash
npm run build
```
The output will be in the `.next/` folder.

## 3. Technical Architecture

### Key Technologies
- **Framework:** [Next.js 16](https://nextjs.org/) (App Router)
- **Language:** TypeScript
- **Styling:** [Tailwind CSS 4](https://tailwindcss.com/)
- **Icons:** Lucide React
- **Markdown Rendering:** react-markdown

### Data Architecture (File-Based "Database")
The application does not use a traditional database (like SQL or MongoDB). Instead, it reads data directly from the local filesystem in the `data/` directory.

- **Source of Truth:** The `data/` folder contains all the information the site displays.
- **Data Access Layer:** `lib/api.ts` contains all functions to read, parse, and serve this data to the application.
- **Static Paths:** Next.js scans the `data/` directory at build time to determine which pages to generate.

### Routing Structure
The application uses Next.js Dynamic Routes:

- **`/` (Root):** Automatically redirects to the latest available date found in `data/latest.json`.
- **`/v1/[year]/[month]/[day] (Dashboard):** The main view for a specific date (e.g., `/v1/2025/12/06`). Displays the summary, holdings table, and commentary.
- **`/v1/[year]/[month]/[day]/tickers/[ticker] (Ticker Report):** A detailed view for a specific stock on a specific date (e.g., `/v1/2025/12/06/tickers/AAPL`).

## 4. Data Structure

To add new data to the site, you simply create folders and files following this schema:

### Directory Layout
```text
data/
├── latest.json                 # Pointer to the most recent date
└── [YYYY]/                     # Year folder
    └── [MM]/                   # Month folder
        └── [DD]/               # Day folder
            ├── daily_summary.json        # Key metrics (PV, cash, etc.)
            ├── holdings.json             # List of stock positions
            └── reports/
                ├── manager_commentary.md # Daily written brief
                └── tickers/              # Folder for ticker-specific Markdown
                    ├── AAPL.md
                    ├── MSFT.md
                    └── ...
```

### File Formats

**1. `data/latest.json`**
Updates the default redirect for the homepage.
```json
{
  "latest_date": "2025-12-06",
  "path": "/data/2025/12/06"
}
```

**2. `daily_summary.json`**
```json
{
  "date": "2025-12-06",
  "total_pv": 150000.00,
  "daily_return": 1250.50,
  "daily_return_pct": 0.85,
  "cash_balance": 5000.00,
  "market_value": 145000.00
}
```

**3. `holdings.json`**
```json
[
  {
    "ticker": "AAPL",
    "shares": 150,
    "price": 185.50,
    "market_value": 27825.00,
    "daily_change_pct": 1.2
  },
  ...
]
```

## Learn More & Deployment

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.