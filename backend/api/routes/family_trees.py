from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from ...core.database import get_db
from ...models import models
from ...schemas import schemas

router = APIRouter(prefix="/family-trees", tags=["family-trees"])


@router.post("/", response_model=schemas.FamilyTreeResponse)
def create_family_tree(tree: schemas.FamilyTreeCreate, owner_id: int, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == owner_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    db_tree = models.FamilyTree(name=tree.name, owner_id=owner_id)
    db.add(db_tree)
    db.commit()
    db.refresh(db_tree)
    return db_tree


@router.get("/{tree_id}", response_model=schemas.FamilyTreeResponse)
def get_family_tree(tree_id: int, db: Session = Depends(get_db)):
    tree = db.query(models.FamilyTree).filter(models.FamilyTree.id == tree_id).first()
    if not tree:
        raise HTTPException(status_code=404, detail="Family tree not found")
    return tree


@router.get("/", response_model=List[schemas.FamilyTreeResponse])
def list_family_trees(owner_id: Optional[int] = None, db: Session = Depends(get_db)):
    query = db.query(models.FamilyTree)
    if owner_id:
        query = query.filter(models.FamilyTree.owner_id == owner_id)
    return query.all()


@router.post("/{tree_id}/members", response_model=schemas.FamilyMemberResponse)
def add_member(
    tree_id: int,
    member: schemas.FamilyMemberCreate,
    db: Session = Depends(get_db)
):
    tree = db.query(models.FamilyTree).filter(models.FamilyTree.id == tree_id).first()
    if not tree:
        raise HTTPException(status_code=404, detail="Family tree not found")

    db_member = models.FamilyMember(
        family_tree_id=tree_id,
        name=member.name,
        relation_type=member.relation_type,
        birth_date=member.birth_date,
        birth_place=member.birth_place,
        occupation=member.occupation,
        bio=member.bio,
        photo_url=member.photo_url,
        parent_id=member.parent_id,
        migration_history=member.migration_history,
        heritage_language=member.heritage_language
    )
    db.add(db_member)
    db.commit()
    db.refresh(db_member)
    return db_member


@router.get("/{tree_id}/members", response_model=List[schemas.FamilyMemberResponse])
def get_members(tree_id: int, db: Session = Depends(get_db)):
    members = db.query(models.FamilyMember).filter(
        models.FamilyMember.family_tree_id == tree_id
    ).all()
    return members


@router.get("/{tree_id}/members/{member_id}", response_model=schemas.FamilyMemberResponse)
def get_member(tree_id: int, member_id: int, db: Session = Depends(get_db)):
    member = db.query(models.FamilyMember).filter(
        models.FamilyMember.family_tree_id == tree_id,
        models.FamilyMember.id == member_id
    ).first()
    if not member:
        raise HTTPException(status_code=404, detail="Family member not found")
    return member


@router.delete("/{tree_id}/members/{member_id}")
def delete_member(tree_id: int, member_id: int, db: Session = Depends(get_db)):
    member = db.query(models.FamilyMember).filter(
        models.FamilyMember.family_tree_id == tree_id,
        models.FamilyMember.id == member_id
    ).first()
    if not member:
        raise HTTPException(status_code=404, detail="Family member not found")

    db.delete(member)
    db.commit()
    return {"message": "Member deleted successfully"}


@router.get("/{tree_id}/tree-structure")
def get_tree_structure(tree_id: int, db: Session = Depends(get_db)):
    members = db.query(models.FamilyMember).filter(
        models.FamilyMember.family_tree_id == tree_id
    ).all()

    tree_data = []
    for member in members:
        member_data = {
            "id": member.id,
            "name": member.name,
            "relation_type": member.relation_type,
            "birth_date": member.birth_date,
            "birth_place": member.birth_place,
            "occupation": member.occupation,
            "bio": member.bio,
            "photo_url": member.photo_url,
            "parent_id": member.parent_id,
            "migration_history": member.migration_history,
            "heritage_language": member.heritage_language,
            "children": []
        }
        tree_data.append(member_data)

    return {"members": tree_data, "total": len(tree_data)}