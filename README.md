# Dev-Journal

My personal developer journal where I document daily learnings, project notes, bugs and fixes, code snippets, and important concepts for future reference.

## Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** MongoDB Atlas
- **Frontend:** HTML, CSS, JavaScript (External files)
- **Styling:** Dark theme with responsive design

## Features

- Create, read, update, delete journal entries
- Categories: Daily Learning, Project Notes, Bug Fixes, Code Snippets, Concepts
- Tag-based organization
- Full-text search
- Code block support with copy functionality
- Responsive design

## Quick Start

### 1. Setup MongoDB Atlas

1. Create a free account at [MongoDB Atlas](https://cloud.mongodb.com)
2. Create a cluster and database user
3. Get your connection string

### 2. Configure Environment

```bash
cd backend
cp .env
# Edit .env with your MongoDB connection string
```

### 3. Install Dependencies

```bash
cd backend
npm install
```

### 4. Run the Server

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

### 5. Access the Application

Open `http://localhost:3000` in your browser.

## Project Structure

```
Dev-Journal/
├── backend/
│   ├── src/
│   │   ├── app.js           # Express app config
│   │   ├── server.js        # Server entry point
│   │   ├── config/db.js     # MongoDB connection
│   │   ├── models/Entry.js  # Journal entry schema
│   │   ├── routes/entries.js
│   │   └── controllers/entryController.js
│   └── package.json
├── frontend/
│   ├── public/
│   │   ├── css/styles.css   # External CSS
│   │   └── js/app.js        # External JavaScript
│   └── views/
│       ├── index.html       # Main dashboard
│       ├── new-entry.html   # Create entry
│       ├── entry.html       # View entry
│       └── edit-entry.html  # Edit entry
├── VPS/                      # VPS documentation (protected)
├── .gitignore
└── README.md
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/entries` | List all entries |
| GET | `/api/entries/:id` | Get single entry |
| POST | `/api/entries` | Create new entry |
| PUT | `/api/entries/:id` | Update entry |
| DELETE | `/api/entries/:id` | Delete entry |
| GET | `/api/entries/search?q=` | Search entries |
| GET | `/api/entries/tags` | Get all tags |
| GET | `/api/entries/stats` | Get category statistics |

## License

ISC
