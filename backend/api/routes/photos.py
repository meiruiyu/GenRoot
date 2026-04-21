from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
import shutil
import os

from ...core.database import get_db
from ...models import models
from ...schemas import schemas

router = APIRouter(prefix="/photos", tags=["photos"])

UPLOAD_DIRECTORY = "./uploads/photos"
if not os.path.exists(UPLOAD_DIRECTORY):
    os.makedirs(UPLOAD_DIRECTORY)

@router.post("/", response_model=schemas.PhotoResponse)
async def upload_photo(
    user_id: int,
    file: UploadFile = File(...),
    description: str = None,
    story_id: int = None,
    family_tree_id: int = None,
    db: Session = Depends(get_db)
):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if story_id:
        story = db.query(models.Story).filter(models.Story.id == story_id).first()
        if not story:
            raise HTTPException(status_code=404, detail="Story not found")

    file_path = os.path.join(UPLOAD_DIRECTORY, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    photo_data = {
        "user_id": user_id,
        "filename": file.filename,
        "file_path": file_path,
        "description": description,
        "story_id": story_id,
        "family_tree_id": family_tree_id,
    }

    db_photo = models.Photo(**photo_data)
    db.add(db_photo)
    db.commit()
    db.refresh(db_photo)

    if story_id and description:
        story.content = description
        db.commit()

    return db_photo


@router.get("/{photo_id}", response_model=schemas.PhotoResponse)
def get_photo(photo_id: int, db: Session = Depends(get_db)):
    photo = db.query(models.Photo).filter(models.Photo.id == photo_id).first()
    if not photo:
        raise HTTPException(status_code=404, detail="Photo not found")
    return photo

@router.get("/", response_model=List[schemas.PhotoResponse])
def list_photos(
    user_id: int = None,
    family_tree_id: int = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    query = db.query(models.Photo)
    if user_id:
        query = query.filter(models.Photo.user_id == user_id)
    if family_tree_id:
        query = query.filter(models.Photo.family_tree_id == family_tree_id)
    
    photos = query.offset(skip).limit(limit).all()
    return photos

@router.delete("/{photo_id}")
def delete_photo(photo_id: int, db: Session = Depends(get_db)):
    photo = db.query(models.Photo).filter(models.Photo.id == photo_id).first()
    if not photo:
        raise HTTPException(status_code=404, detail="Photo not found")

    if os.path.exists(photo.file_path):
        os.remove(photo.file_path)

    db.delete(photo)
    db.commit()
    return {"message": "Photo deleted successfully"}
