from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import List, Optional

# Token Schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

# User Schemas
class UserBase(BaseModel):
    username: str
    email: EmailStr

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

# Simplified User for nesting
class UserMin(BaseModel):
    id: int
    username: str

    class Config:
        from_attributes = True

# Comment Schemas
class CommentBase(BaseModel):
    content: str

class CommentCreate(CommentBase):
    pass

class CommentResponse(CommentBase):
    id: int
    created_at: datetime
    post_id: int
    owner_id: int
    owner: UserMin

    class Config:
        from_attributes = True

# Post Schemas
class PostBase(BaseModel):
    title: str
    content: str

class PostCreate(PostBase):
    pass

class PostUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None

class PostResponse(PostBase):
    id: int
    created_at: datetime
    updated_at: datetime
    owner_id: int
    owner: UserMin

    class Config:
        from_attributes = True
