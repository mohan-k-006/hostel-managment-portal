from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
import models, schemas, auth

router = APIRouter(prefix="/api/complaints", tags=["Complaints"])

def smart_auto_triage(title: str, description: str, current_priority: str) -> str:
    text = (title + " " + description).lower()
    emergency_keywords = ["fire", "spark", "short circuit", "gas leak", "flood", "water overflow", "broken door lock", "intruder"]
    high_keywords = ["no water", "power failure", "ac broken", "geyser leak", "rodent", "insect infestation"]
    
    for word in emergency_keywords:
        if word in text:
            return "Emergency"
    for word in high_keywords:
        if word in text and current_priority != "Emergency":
            return "High"
    return current_priority

@router.get("", response_model=List[schemas.ComplaintOut])
def get_complaints(
    category: Optional[str] = None,
    status: Optional[str] = None,
    priority: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    query = db.query(models.Complaint)
    
    # Students only see their own complaints, admin sees all
    if current_user.role != models.UserRole.ADMIN:
        query = query.filter(models.Complaint.student_id == current_user.id)
        
    if category:
        query = query.filter(models.Complaint.category == category)
    if status:
        query = query.filter(models.Complaint.status == status)
    if priority:
        query = query.filter(models.Complaint.priority == priority)
        
    return query.order_by(models.Complaint.created_at.desc()).all()

@router.post("", response_model=schemas.ComplaintOut, status_code=status.HTTP_201_CREATED)
def create_complaint(
    complaint_data: schemas.ComplaintCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    # Apply Smart Auto-Triage algorithm
    triaged_priority = smart_auto_triage(
        complaint_data.title,
        complaint_data.description,
        complaint_data.priority
    )
    
    new_complaint = models.Complaint(
        student_id=current_user.id,
        title=complaint_data.title,
        category=complaint_data.category,
        priority=triaged_priority,
        description=complaint_data.description,
        status="Pending"
    )
    db.add(new_complaint)
    db.commit()
    db.refresh(new_complaint)
    return new_complaint

@router.put("/{complaint_id}", response_model=schemas.ComplaintOut)
def update_complaint(
    complaint_id: int,
    update_data: schemas.ComplaintUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    complaint = db.query(models.Complaint).filter(models.Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
    
    # Students can only update their own pending complaints
    if current_user.role != models.UserRole.ADMIN and complaint.student_id != current_user.id:
        raise HTTPException(status_code=403, detail="Forbidden")
        
    data = update_data.model_dump(exclude_unset=True)
    for key, val in data.items():
        setattr(complaint, key, val)
        
    db.commit()
    db.refresh(complaint)
    return complaint

@router.delete("/{complaint_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_complaint(
    complaint_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    complaint = db.query(models.Complaint).filter(models.Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
        
    if current_user.role != models.UserRole.ADMIN and complaint.student_id != current_user.id:
        raise HTTPException(status_code=403, detail="Forbidden")
        
    db.delete(complaint)
    db.commit()
    return None
