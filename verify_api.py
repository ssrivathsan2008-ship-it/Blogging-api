import subprocess
import time
import urllib.request
import urllib.error
import json
import sys
import os

def main():
    print("Starting FastAPI Blogging API server...")
    
    # Start the FastAPI server using the local virtual environment's uvicorn
    # Use shell=True or absolute/relative paths carefully in Windows
    server_process = subprocess.Popen(
        [r".\venv\Scripts\python.exe", "-m", "uvicorn", "app.main:app", "--port", "8000"],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True
    )
    
    # Wait for the server to spin up
    time.sleep(3)
    
    # Check if the server is running by sending a request to the docs endpoint
    try:
        print("Checking if root endpoint is active (should redirect to docs)...")
        req = urllib.request.Request("http://127.0.0.1:8000/", method="GET")
        with urllib.request.urlopen(req) as response:
            status = response.status
            # Root redirects to /docs, so response url should have /docs
            print(f"Server is running! Final URL: {response.geturl()}, Response status: {status}")
    except Exception as e:
        print(f"Failed to connect to server: {e}")
        # Print output/error from server if any
        server_process.terminate()
        sys.exit(1)
        
    try:
        # Delete existing db file if any, to ensure tests are fresh
        if os.path.exists("blog.db"):
            try:
                os.remove("blog.db")
                print("Cleaned up existing database for fresh test run.")
            except Exception:
                pass

        # 1. Register a user
        print("\n[TEST 1] Testing User Registration...")
        user_data = {
            "username": "testuser",
            "email": "testuser@example.com",
            "password": "testpassword123"
        }
        req = urllib.request.Request(
            "http://127.0.0.1:8000/users/register",
            data=json.dumps(user_data).encode("utf-8"),
            headers={"Content-Type": "application/json"},
            method="POST"
        )
        with urllib.request.urlopen(req) as response:
            res_body = json.loads(response.read().decode("utf-8"))
            print(f"User registered successfully: {res_body}")
            
        # 2. Login to get JWT Token
        print("\n[TEST 2] Testing User Login...")
        from urllib.parse import urlencode
        login_data = {
            "username": "testuser",
            "password": "testpassword123"
        }
        req = urllib.request.Request(
            "http://127.0.0.1:8000/users/login",
            data=urlencode(login_data).encode("utf-8"),
            headers={"Content-Type": "application/x-www-form-urlencoded"},
            method="POST"
        )
        with urllib.request.urlopen(req) as response:
            res_body = json.loads(response.read().decode("utf-8"))
            token = res_body["access_token"]
            print(f"Login successful! Token acquired.")
            
        # 3. Create a Post
        print("\n[TEST 3] Testing Post Creation...")
        post_data = {
            "title": "My First Blog Post",
            "content": "This is the content of my first post. It is built using FastAPI and SQLite!"
        }
        req = urllib.request.Request(
            "http://127.0.0.1:8000/posts/",
            data=json.dumps(post_data).encode("utf-8"),
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {token}"
            },
            method="POST"
        )
        with urllib.request.urlopen(req) as response:
            res_body = json.loads(response.read().decode("utf-8"))
            print(f"Post created successfully: {res_body}")
            post_id = res_body["id"]
            
        # 4. Fetch all posts
        print("\n[TEST 4] Testing Read Posts...")
        req = urllib.request.Request("http://127.0.0.1:8000/posts/", method="GET")
        with urllib.request.urlopen(req) as response:
            res_body = json.loads(response.read().decode("utf-8"))
            print(f"Fetched posts (total: {len(res_body)}): {res_body}")
            
        # 5. Add a Comment to the Post
        print("\n[TEST 5] Testing Comment Creation...")
        comment_data = {
            "content": "This is a great first post! Keep it up."
        }
        req = urllib.request.Request(
            f"http://127.0.0.1:8000/posts/{post_id}/comments/",
            data=json.dumps(comment_data).encode("utf-8"),
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {token}"
            },
            method="POST"
        )
        with urllib.request.urlopen(req) as response:
            res_body = json.loads(response.read().decode("utf-8"))
            print(f"Comment added successfully: {res_body}")
            comment_id = res_body["id"]
            
        # 6. Fetch comments
        print("\n[TEST 6] Testing Read Comments...")
        req = urllib.request.Request(f"http://127.0.0.1:8000/posts/{post_id}/comments/", method="GET")
        with urllib.request.urlopen(req) as response:
            res_body = json.loads(response.read().decode("utf-8"))
            print(f"Fetched comments: {res_body}")
            
        # 7. Delete Comment
        print("\n[TEST 7] Testing Comment Deletion...")
        req = urllib.request.Request(
            f"http://127.0.0.1:8000/comments/{comment_id}",
            headers={"Authorization": f"Bearer {token}"},
            method="DELETE"
        )
        with urllib.request.urlopen(req) as response:
            print(f"Comment deleted. Status: {response.status}")
            
        # 8. Delete Post
        print("\n[TEST 8] Testing Post Deletion...")
        req = urllib.request.Request(
            f"http://127.0.0.1:8000/posts/{post_id}",
            headers={"Authorization": f"Bearer {token}"},
            method="DELETE"
        )
        with urllib.request.urlopen(req) as response:
            print(f"Post deleted. Status: {response.status}")
            
        print("\nAll integration tests passed successfully!")
        
    except urllib.error.HTTPError as e:
        print(f"\nAPI Error (HTTP {e.code}): {e.read().decode('utf-8')}")
        server_process.terminate()
        sys.exit(1)
    except Exception as e:
        print(f"\nAn error occurred: {e}")
        server_process.terminate()
        sys.exit(1)
        
    # Clean up and stop server
    print("\nStopping FastAPI server...")
    server_process.terminate()
    server_process.wait()
    print("Verification complete.")

if __name__ == "__main__":
    main()
