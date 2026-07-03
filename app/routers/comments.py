from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from .. import database, models, schemas, auth

router = APIRouter(
    tags=["comments"]
)

@router.post("/posts/{post_id}/comments/", response_model=schemas.CommentResponse, status_code=status.HTTP_201_CREATED)
def create_comment(post_id: int, comment_in: schemas.CommentCreate, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    post = db.query(models.Post).filter(models.Post.id == post_id).first()
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found"
        )
    
    db_comment = models.Comment(
        content=comment_in.content,
        post_id=post_id,
        owner_id=current_user.id
    )
    db.add(db_comment)
    db.commit()
    db.refresh(db_comment)
    return db_comment

@router.get("/posts/{post_id}/comments/", response_model=List[schemas.CommentResponse])
def read_comments(post_id: int, db: Session = Depends(database.get_db)):
    post = db.query(models.Post).filter(models.Post.id == post_id).first()
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found"
        )
    comments = db.query(models.Comment).filter(models.Comment.post_id == post_id).order_by(models.Comment.created_at.desc()).all()
    return comments

@router.delete("/comments/{comment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_comment(comment_id: int, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    comment = db.query(models.Comment).filter(models.Comment.id == comment_id).first()
    if not comment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Comment not found"
        )
        
    post = db.query(models.Post).filter(models.Post.id == comment.post_id).first()
    
    # Authorized if current user is comment owner OR post owner
    if comment.owner_id != current_user.id and (not post or post.owner_id != current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this comment"
        )
        
    db.delete(comment)
    db.commit()
    return
