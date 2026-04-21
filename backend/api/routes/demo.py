from fastapi import APIRouter
from ...mock_data import family_tree_data

router = APIRouter(prefix="/demo", tags=["demo"])


@router.get("/family-tree")
async def get_demo_family_tree():
    return family_tree_data
