from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Float, JSON, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..core.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True)
    name = Column(String(255))
    family_name = Column(String(255))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    family_trees = relationship("FamilyTree", back_populates="owner", cascade="all, delete-orphan")
    stories = relationship("Story", back_populates="uploader", cascade="all, delete-orphan")
    photos = relationship("Photo", back_populates="uploader", cascade="all, delete-orphan")


class FamilyTree(Base):
    __tablename__ = "family_trees"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), default="My Family Tree")
    owner_id = Column(Integer, ForeignKey("users.id"))
    root_member_id = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    owner = relationship("User", back_populates="family_trees")
    members = relationship("FamilyMember", back_populates="family_tree", cascade="all, delete-orphan")
    stories = relationship("Story", back_populates="family_tree", cascade="all, delete-orphan")


class FamilyMember(Base):
    __tablename__ = "family_members"

    id = Column(Integer, primary_key=True, index=True)
    family_tree_id = Column(Integer, ForeignKey("family_trees.id"))
    name = Column(String(255))
    relation_type = Column(String(50))
    birth_date = Column(String(20), nullable=True)
    birth_place = Column(String(255), nullable=True)
    occupation = Column(Text, nullable=True)
    bio = Column(Text, nullable=True)
    photo_url = Column(String(500), nullable=True)
    parent_id = Column(Integer, ForeignKey("family_members.id"), nullable=True)
    migration_history = Column(JSON, nullable=True)
    heritage_language = Column(String(100), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    family_tree = relationship("FamilyTree", back_populates="members")
    parent = relationship("FamilyMember", remote_side=[id], backref="children")
    stories = relationship("Story", back_populates="member")


class Story(Base):
    __tablename__ = "stories"

    id = Column(Integer, primary_key=True, index=True)
    family_tree_id = Column(Integer, ForeignKey("family_trees.id"), nullable=True)
    member_id = Column(Integer, ForeignKey("family_members.id"), nullable=True)
    uploader_id = Column(Integer, ForeignKey("users.id"))

    title = Column(String(255))
    content = Column(Text)
    original_language = Column(String(20))
    translated_content = Column(Text, nullable=True)
    summary = Column(Text, nullable=True)

    audio_url = Column(String(500), nullable=True)
    transcription = Column(Text, nullable=True)
    extracted_entities = Column(JSON, nullable=True)

    tags = Column(JSON, nullable=True)
    share_level = Column(String(20), default="private")
    is_anonymous = Column(Boolean, default=True)
    can_contribute_to_public = Column(Boolean, default=False)

    story_type = Column(String(50), default="general")
    year_mentioned = Column(String(20), nullable=True)
    location_mentioned = Column(String(255), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    family_tree = relationship("FamilyTree", back_populates="stories")
    member = relationship("FamilyMember", back_populates="stories")
    uploader = relationship("User", back_populates="stories")
    photo = relationship("Photo", back_populates="story", uselist=False)


class Photo(Base):
    __tablename__ = "photos"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    family_tree_id = Column(Integer, ForeignKey("family_trees.id"), nullable=True)
    story_id = Column(Integer, ForeignKey("stories.id"), nullable=True)

    filename = Column(String(255))
    file_path = Column(String(500))
    description = Column(Text, nullable=True)
    story_text = Column(Text, nullable=True)
    year_taken = Column(String(20), nullable=True)
    location = Column(String(255), nullable=True)
    extracted_entities = Column(JSON, nullable=True)

    share_level = Column(String(20), default="private")
    can_contribute_to_public = Column(Boolean, default=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    uploader = relationship("User", back_populates="photos")
    story = relationship("Story", back_populates="photo")


class HeritageLanguage(Base):
    __tablename__ = "heritage_languages"

    id = Column(Integer, primary_key=True, index=True)
    family_member_id = Column(Integer, ForeignKey("family_members.id"))
    language_name = Column(String(100))
    proficiency_level = Column(String(50), nullable=True)
    common_expressions = Column(JSON, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    family_member = relationship("FamilyMember")


class PublicCulturalContribution(Base):
    __tablename__ = "public_cultural_contributions"

    id = Column(Integer, primary_key=True, index=True)
    original_story_id = Column(Integer, ForeignKey("stories.id"), nullable=True)
    original_photo_id = Column(Integer, ForeignKey("photos.id"), nullable=True)

    region = Column(String(100))
    country = Column(String(100))
    language = Column(String(100))
    topic = Column(String(100))
    content = Column(Text)
    summary = Column(Text, nullable=True)
    tags = Column(JSON, nullable=True)

    author_anonymous = Column(Boolean, default=True)
    contributor_name = Column(String(255), nullable=True)

    upvotes = Column(Integer, default=0)
    view_count = Column(Integer, default=0)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    original_story = relationship("Story")
    original_photo = relationship("Photo")
