from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime


class UserBase(BaseModel):
    email: EmailStr
    name: Optional[str] = None
    family_name: Optional[str] = None


class UserCreate(UserBase):
    pass


class UserResponse(UserBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class FamilyMemberBase(BaseModel):
    name: str
    relation_type: Optional[str] = None
    birth_date: Optional[str] = None
    birth_place: Optional[str] = None
    occupation: Optional[str] = None
    bio: Optional[str] = None
    photo_url: Optional[str] = None
    parent_id: Optional[int] = None
    migration_history: Optional[dict] = None
    heritage_language: Optional[str] = None


class FamilyMemberCreate(FamilyMemberBase):
    family_tree_id: int


class FamilyMemberResponse(FamilyMemberBase):
    id: int
    family_tree_id: int
    created_at: datetime

    class Config:
        from_attributes = True


class FamilyTreeBase(BaseModel):
    name: str = "My Family Tree"


class FamilyTreeCreate(FamilyTreeBase):
    pass


class FamilyTreeResponse(FamilyTreeBase):
    id: int
    owner_id: int
    root_member_id: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True


class StoryBase(BaseModel):
    title: str
    content: Optional[str] = None
    original_language: str = "zh"
    story_type: str = "general"
    share_level: str = "private"
    can_contribute_to_public: bool = False
    year_mentioned: Optional[str] = None
    location_mentioned: Optional[str] = None


class StoryCreate(StoryBase):
    family_tree_id: Optional[int] = None
    member_id: Optional[int] = None
    uploader_id: int


class StoryResponse(StoryBase):
    id: int
    uploader_id: int
    family_tree_id: Optional[int] = None
    member_id: Optional[int] = None
    translated_content: Optional[str] = None
    summary: Optional[str] = None
    audio_url: Optional[str] = None
    transcription: Optional[str] = None
    extracted_entities: Optional[dict] = None
    tags: Optional[dict] = None
    created_at: datetime

    class Config:
        from_attributes = True


class PhotoBase(BaseModel):
    description: Optional[str] = None
    year_taken: Optional[str] = None
    location: Optional[str] = None
    share_level: str = "private"
    can_contribute_to_public: bool = False


class PhotoCreate(PhotoBase):
    user_id: int
    family_tree_id: Optional[int] = None
    story_id: Optional[int] = None


class PhotoResponse(PhotoBase):
    id: int
    user_id: int
    filename: str
    file_path: str
    story_text: Optional[str] = None
    extracted_entities: Optional[dict] = None
    created_at: datetime

    class Config:
        from_attributes = True


class HeritageLanguageBase(BaseModel):
    language_name: str
    proficiency_level: Optional[str] = None
    common_expressions: Optional[dict] = None
    notes: Optional[str] = None


class HeritageLanguageCreate(HeritageLanguageBase):
    family_member_id: int


class HeritageLanguageResponse(HeritageLanguageBase):
    id: int
    family_member_id: int
    created_at: datetime

    class Config:
        from_attributes = True


class PublicCulturalContributionBase(BaseModel):
    region: str
    country: str
    language: Optional[str] = None
    topic: str
    content: str
    summary: Optional[str] = None
    tags: Optional[dict] = None


class PublicCulturalContributionCreate(PublicCulturalContributionBase):
    original_story_id: Optional[int] = None
    original_photo_id: Optional[int] = None


class PublicCulturalContributionResponse(PublicCulturalContributionBase):
    id: int
    original_story_id: Optional[int] = None
    original_photo_id: Optional[int] = None
    author_anonymous: bool = True
    contributor_name: Optional[str] = None
    upvotes: int = 0
    view_count: int = 0
    created_at: datetime

    class Config:
        from_attributes = True


class FamilyQARequest(BaseModel):
    question: str
    family_tree_id: int
    language: str = "en"


class FamilyQAResponse(BaseModel):
    answer: str
    context_stories: Optional[List[dict]] = None
    confidence: Optional[float] = None


class AudioTranscriptionRequest(BaseModel):
    audio_url: Optional[str] = None
    language: str = "zh"
    translate_to: Optional[str] = "en"


class AudioTranscriptionResponse(BaseModel):
    transcription: str
    translation: Optional[str] = None
    summary: Optional[str] = None
    extracted_entities: Optional[dict] = None
