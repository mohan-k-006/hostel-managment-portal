from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from database import get_db
import models, schemas, auth

router = APIRouter(prefix="/api/visitors", tags=["Visitors"])

@router.get("", response_model=List[schemas.VisitorOut])
def get_visitors(
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    query = db.query(models.Visitor)
    if current_user.role != models.UserRole.ADMIN:
        query = query.filter(models.Visitor.student_id == current_user.id)
        
    if status:
        query = query.filter(models.Visitor.status == status)
        
    return query.order_by(models.Visitor.check_in_time.desc()).all()

@router.post("", response_model=schemas.VisitorOut, status_code=status.HTTP_201_CREATED)
def create_visitor(
    visitor_data: schemas.VisitorCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    # Verify student exists
    student = db.query(models.User).filter(models.User.id == visitor_data.student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Target student not found")
        
    new_visitor = models.Visitor(
        student_id=visitor_data.student_id,
        visitor_name=visitor_data.visitor_name,
        phone=visitor_data.phone,
        relation=visitor_data.relation,
        purpose=visitor_data.purpose,
        check_in_time=datetime.utcnow(),
        status="Active"
    )
    db.add(new_visitor)
    db.commit()
    db.refresh(new_visitor)
    return new_visitor

@router.put("/{visitor_id}/checkout", response_model=schemas.VisitorOut)
def checkout_visitor(
    visitor_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    visitor = db.query(models.Visitor).filter(models.Visitor.id == visitor_id).first()
    if not visitor:
        raise HTTPException(status_code=404, detail="Visitor entry not found")
        
    visitor.status = "Checked Out"
    visitor.check_out_time = datetime.utcnow()
    db.commit()
    db.refresh(visitor)
    return visitor
