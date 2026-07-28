from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
import models, schemas, auth

router = APIRouter(prefix="/api/notices", tags=["Notices"])

@router.get("", response_model=List[schemas.NoticeOut])
def get_notices(
    category: Optional[str] = None,
    priority: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    query = db.query(models.Notice)
    if category:
        query = query.filter(models.Notice.category == category)
    if priority:
        query = query.filter(models.Notice.priority == priority)
        
    return query.order_by(models.Notice.created_at.desc()).all()

@router.post("", response_model=schemas.NoticeOut, status_code=status.HTTP_201_CREATED)
def create_notice(
    notice_data: schemas.NoticeCreate,
    db: Session = Depends(get_db),
    admin: models.User = Depends(auth.get_admin_user)
):
    new_notice = models.Notice(**notice_data.model_dump())
    db.add(new_notice)
    db.commit()
    db.refresh(new_notice)
    return new_notice

@router.delete("/{notice_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_notice(
    notice_id: int,
    db: Session = Depends(get_db),
    admin: models.User = Depends(auth.get_admin_user)
):
    notice = db.query(models.Notice).filter(models.Notice.id == notice_id).first()
    if not notice:
        raise HTTPException(status_code=404, detail="Notice not found")
    db.delete(notice)
    db.commit()
    return None
