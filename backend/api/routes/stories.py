from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from ...core.database import get_db
from ...models import models
from ...schemas import schemas
from ...services.minimax_service import minimax_service

router = APIRouter(prefix="/stories", tags=["stories"])


@router.post("/", response_model=schemas.StoryResponse)
async def create_story(story: schemas.StoryCreate, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == story.uploader_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if story.member_id:
        member = db.query(models.FamilyMember).filter(models.FamilyMember.id == story.member_id).first()
        if not member:
            raise HTTPException(status_code=404, detail="Family member not found")

    db_story = models.Story(
        family_tree_id=story.family_tree_id,
        member_id=story.member_id,
        uploader_id=story.uploader_id,
        title=story.title,
        content=story.content,
        original_language=story.original_language,
        story_type=story.story_type,
        share_level=story.share_level,
        can_contribute_to_public=story.can_contribute_to_public,
        year_mentioned=story.year_mentioned,
        location_mentioned=story.location_mentioned
    )

    if story.content:
        translation_result = await minimax_service.translate_text(
            story.content,
            source_language=story.original_language,
            target_language="en"
        )
        if not translation_result.get("error"):
            db_story.translated_content = translation_result.get("translation")

        summary_result = await minimax_service.summarize_text(
            story.content,
            language="en"
        )
        if not summary_result.get("error"):
            db_story.summary = summary_result.get("summary")

        entities_result = await minimax_service.extract_entities(story.content)
        if not entities_result.get("error"):
            db_story.extracted_entities = entities_result

    db.add(db_story)
    db.commit()
    db.refresh(db_story)
    return db_story


@router.post("/{story_id}/transcribe")
async def transcribe_audio(story_id: int, audio_url: str, language: str = "zh", db: Session = Depends(get_db)):
    story = db.query(models.Story).filter(models.Story.id == story_id).first()
    if not story:
        raise HTTPException(status_code=404, detail="Story not found")

    transcription_result = await minimax_service.speech_to_text(audio_url, language)
    translation_result = {}
    summary_result = {}
    entities_result = {}

    transcription_text = transcription_result.get("transcription")
    if not transcription_result.get("error") and transcription_text:
        story.transcription = transcription_text
        story.content = transcription_text # Also update main content

        translation_result = await minimax_service.translate_text(
            transcription_text,
            source_language=language,
            target_language="en"
        )
        if not translation_result.get("error"):
            story.translated_content = translation_result.get("translation")

        summary_result = await minimax_service.summarize_text(
            transcription_text,
            language="en"
        )
        if not summary_result.get("error"):
            story.summary = summary_result.get("summary")

        entities_result = await minimax_service.extract_entities(
            transcription_text
        )
        if not entities_result.get("error"):
            story.extracted_entities = entities_result

        story.audio_url = audio_url
        db.commit()
        db.refresh(story)

    return {
        "transcription": transcription_text,
        "translation": translation_result.get("translation"),
        "summary": summary_result.get("summary"),
        "extracted_entities": entities_result
    }


@router.get("/{story_id}", response_model=schemas.StoryResponse)
def get_story(story_id: int, db: Session = Depends(get_db)):
    story = db.query(models.Story).filter(models.Story.id == story_id).first()
    if not story:
        raise HTTPException(status_code=404, detail="Story not found")
    return story


@router.get("/", response_model=List[schemas.StoryResponse])
def list_stories(
    family_tree_id: Optional[int] = None,
    member_id: Optional[int] = None,
    uploader_id: Optional[int] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    query = db.query(models.Story)
    if family_tree_id:
        query = query.filter(models.Story.family_tree_id == family_tree_id)
    if member_id:
        query = query.filter(models.Story.member_id == member_id)
    if uploader_id:
        query = query.filter(models.Story.uploader_id == uploader_id)

    stories = query.offset(skip).limit(limit).all()
    return stories


@router.delete("/{story_id}")
def delete_story(story_id: int, db: Session = Depends(get_db)):
    story = db.query(models.Story).filter(models.Story.id == story_id).first()
    if not story:
        raise HTTPException(status_code=404, detail="Story not found")

    db.delete(story)
    db.commit()
    return {"message": "Story deleted successfully"}
