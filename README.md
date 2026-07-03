# DevVerse | Modern Blogging Application & API

A production-grade blogging platform and backend API built in Python using **FastAPI**, **SQLAlchemy** (ORM), and **SQLite** for data persistence. It features a stunning, interactive Single Page Application (SPA) frontend designed with cosmic glassmorphism themes alongside secure JWT-based authentication, user profiles, blog post CRUD, and a nesting comment/moderation system.

---

## Features

- 🎨 **Futuristic Cosmic UI:** A premium Single Page Application dashboard styled with vanilla CSS glassmorphism, responsive grid layouts, custom input glows, and micro-animations.
- 🔐 **JWT Authentication:** Stateful user signup, login, session profile badges, and token storage using secure password hashing (`bcrypt`).
- 📝 **Post Management (CRUD):** Users can draft, read, search, update, and delete columns. Retrieval is public and features query-based search.
- 💬 **Discussion Boards:** Nested comments system for reader discussions. Comments can be deleted by either the comment author or the column creator.
- 📑 **Interactive Documentation:** Auto-generated Swagger UI and ReDoc pages.

---

## Tech Stack

- **Backend Framework:** [FastAPI](https://fastapi.tiangolo.com/) (Python)
- **ASGI Server:** [Uvicorn](https://www.uvicorn.org/)
- **ORM:** [SQLAlchemy](https://www.sqlalchemy.org/)
- **Database:** SQLite (local file database)
- **Frontend SPA:** HTML5, Vanilla CSS3 (Glassmorphism & animations), Vanilla JS (Fetch API integration)
- **Security:** `python-jose` (for JWT) & direct `bcrypt` password hashing (Python 3.12 compatible)

---

## Project Structure

```text
blogging-api/
│
├── app/
│   ├── __init__.py
│   ├── auth.py          # JWT authentication helpers and direct bcrypt hashing
│   ├── database.py      # SQLite engine and DB session setup
│   ├── main.py          # FastAPI application entrypoint, CORS config, and static file mounting
│   ├── models.py        # SQLAlchemy database schemas
│   ├── schemas.py       # Pydantic request and response validation schemas
│   │
│   ├── static/          # Premium SPA Frontend files
│   │   ├── index.html   # Main dashboard layout
│   │   ├── style.css    # Cosmic glassmorphic styling, animations, and typography
│   │   └── app.js       # Asynchronous fetch client and page view routers
│   │
│   └── routers/
│       ├── __init__.py
│       ├── comments.py  # Comment-related routes
│       ├── posts.py     # Post-related routes
│       └── users.py     # User registration and login routes
│
├── .gitignore
├── README.md
├── requirements.txt
├── run_tests.py         # Integration test suite against running API
└── verify_api.py        # Automated test wrapper
```

---

## Setup & Installation

### 1. Clone & Navigate to the Repository
```bash
git clone https://github.com/ssrivathsan2008-ship-it/Blogging-api.git
cd Blogging-api
```

### 2. Create and Activate Virtual Environment
On Windows:
```bash
python -m venv venv
.\venv\Scripts\activate
```
On macOS/Linux:
```bash
python3 -m venv venv
source venv/bin/activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

---

## Running the Application

To run the application locally:
```bash
uvicorn app.main:app --reload
```
Once started, open your web browser and navigate to:
- **Web Dashboard:** [http://127.0.0.1:8000](http://127.0.0.1:8000) (Home Page)
- **Interactive Swagger Docs:** [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **ReDoc Pages:** [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)

---

## API Endpoints

### User Authentications
- `POST /users/register` - Create a new user account.
- `POST /users/login` - Authenticate user and get JWT access token.
- `GET /users/me` - Retrieve current logged-in user profile (requires Auth).

### Blog Posts
- `GET /posts/` - Fetch all posts (Public, supports pagination via query params `skip` and `limit`).
- `GET /posts/{post_id}` - Fetch a single post by ID (Public).
- `POST /posts/` - Create a new post (requires Auth).
- `PUT /posts/{post_id}` - Update a post title/content (requires Auth, author only).
- `DELETE /posts/{post_id}` - Delete a post (requires Auth, author only).

### Comments
- `GET /posts/{post_id}/comments/` - Get comments for a specific post (Public).
- `POST /posts/{post_id}/comments/` - Write a comment on a post (requires Auth).
- `DELETE /comments/{comment_id}` - Delete a comment (requires Auth, comment author or post author only).

---

## Running Integration Tests

To run the automated client-side integration tests:
1. Make sure the server is running on `http://127.0.0.1:8000`.
2. Run the test script:
   ```bash
   python run_tests.py
   ```
