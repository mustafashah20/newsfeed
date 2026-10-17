# Newsfeed - A News Aggregator

Newsfeed is a news aggregator built with React, Vite and TypeScript. The application fetches news articles from multiple sources and displays them in a clean, mobile-friendly interface.

### Sources

- [NewsAPI.org](https://newsapi.org)
- [The Guardian](https://open-platform.theguardian.com)
- [New York Times](https://developer.nytimes.com)

## Features

- Fetches news articles from multiple sources (NewsAPI, The Guardian and New York Times).
- Personalized feed based on preferred sources, categories and authors.
- Searching articles by keyword.
- Filtering articles by date, category and source.
- In-app article reader (full text for The Guardian, preview for NYT and NewsAPI).
- If one source fails, the others keep working.
- Responsive UI for mobile, tablet and desktop.

## Technologies Used

- **React** with **TypeScript**
- **Vite** for fast builds and development
- **Tailwind CSS** for styling
- **shadcn/ui** components for UI
- **TanStack Router** for routing
- **TanStack Query** for data fetching
- **Zustand** for saving preferences
- **Axios** for API calls
- **Zod** for validating API responses
- **Vitest**, **React Testing Library** and **MSW** for testing
- **Docker** with **nginx** for containerization

## Folder Structure

- `src/`
  - `app/` - app providers, query client and router setup
  - `routes/` - all pages of the app
  - `features/` - code grouped by feature
    - `articles/` - article cards and lists
    - `feed/` - home feed
    - `search/` - search bar and filters
    - `reader/` - in-app article reader
    - `preferences/` - saved preferences
  - `services/news/` - API calls for each news source
    - `providers/` - one folder per news API
  - `components/` - common app components
    - `ui/` - shadcn based reusable components
    - `layout/` - header, navigation and page layout
  - `hooks/` - reusable React hooks
  - `lib/` - helper functions
  - `test/` - test setup and sample API data
- `nginx/` - nginx config for Docker
- `docs/` - extra documentation

## Setup and Installation

### Prerequisites

Ensure you have the following installed:

- **Node.js** (v24 or higher)
- **npm**
- **Docker** (only required for running with Docker)

### API Keys

You can sign up for free developer keys here:

- **NewsAPI:** https://newsapi.org/register
- **The Guardian:** https://open-platform.theguardian.com/access/
- **New York Times:** https://developer.nytimes.com/get-started (enable the Article Search API)

### Clone and Configure

1. Clone the repository:

   ```sh
   git clone https://github.com/mustafashah20/newsfeed.git
   cd newsfeed
   ```

2. Create a `.env` file in the root directory by copying the example:

   ```sh
   cp .env.example .env
   ```

3. Add your API keys to the `.env` file:

   ```sh
   NEWSAPI_KEY=your_newsapi_key
   GUARDIAN_API_KEY=your_guardian_key
   NYT_API_KEY=your_nyt_key
   ```

   The keys are never exposed to the browser. The dev server and nginx add them to API requests through a proxy.

### Running Locally

1. Install dependencies:

   ```sh
   npm install
   ```

2. Run the development server:

   ```sh
   npm run dev
   ```

3. Open http://localhost:5173 in your browser to see the app.

### Running with Docker

1. Make sure Docker is installed and running.

2. Build and run the container:

   ```sh
   docker compose up --build
   ```

3. Open http://localhost:8080 to view the dockerized app.

To stop the container:

```sh
docker compose down
```

## Screenshots

### Feed

<img width="1541" height="1296" alt="image" src="https://github.com/user-attachments/assets/ea52b966-716d-460a-a2da-8a1d69c31c6f" />

### Preferences

<img width="628" height="1006" alt="image" src="https://github.com/user-attachments/assets/510d3cd1-8e9b-4bac-a562-25010eb4ce7a" />

### Search

<img width="1377" height="1284" alt="image" src="https://github.com/user-attachments/assets/a0a73636-9f96-444b-9a65-476135b05063" />

### Filters

<img width="1401" height="699" alt="image" src="https://github.com/user-attachments/assets/c6461f30-9e22-4a6b-ada1-234054215dec" />

### Mobile View

<img width="440" height="959" alt="image" src="https://github.com/user-attachments/assets/12eae49f-5868-4fb2-ae21-6f57b2fb20d0" />
