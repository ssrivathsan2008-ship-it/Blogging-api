# Blogging API

A modern, production-grade Blogging API built in Python using **FastAPI**, **SQLAlchemy** (ORM), and **SQLite** for data persistence. It features secure JWT-based authentication, user registration, blog post CRUD operations, and a nested commenting system.

---

## Features

- 🔐 **JWT Authentication:** Secure user registration and login endpoints utilizing direct `bcrypt` password hashing.
- 📝 **Post Management (CRUD):** Authenticated users can create, update, and delete their blog posts. Retrieval is public and paginated.
- 💬 **Commenting System:** Users can comment on any blog post. Deletion of comments is restricted to either the comment author or the post author.
- 📑 **Interactive Documentation:** Auto-generated Swagger UI and Redoc API documentation.

---

## Tech Stack

- **Framework:** [FastAPI](https://fastapi.tiangolo.com/)
- **ASGI Server:** [Uvicorn](https://www.uvicorn.org/)
- **ORM:** [SQLAlchemy](https://www.sqlalchemy.org/)
- **Database:** SQLite (local file database)
- **Validation:** [Pydantic v2](https://docs.pydantic.dev/)
- **Security:** `python-jose` (for JWT) & `bcrypt` (for password hashing)

---

## Project Structure

```text
blogging-api/
│
├── app/
│   ├── __init__.py
│   ├── auth.py          # JWT authentication helpers and password hashing
│   ├── database.py      # SQLite configuration and DB session setup
│   ├── main.py          # FastAPI application entrypoint & CORS config
│   ├── models.py        # SQLAlchemy database schemas
│   ├── schemas.py       # Pydantic request and response models
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

To run the API server locally:
```bash
uvicorn app.main:app --reload
```
Once started, the server will be available at `http://127.0.0.1:8000`.

### Interactive API Documentation
FastAPI provides automatic docs out-of-the-box:
- **Swagger UI (Interactive):** [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **ReDoc:** [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)

---

## API Endpoints

### Authentication
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
