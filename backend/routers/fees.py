from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from database import get_db
import models, schemas, auth

router = APIRouter(prefix="/api/fees", tags=["Fees"])

@router.get("", response_model=List[schemas.FeeOut])
def get_fees(
    status: Optional[str] = None,
    month: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    query = db.query(models.Fee)
    if current_user.role != models.UserRole.ADMIN:
        query = query.filter(models.Fee.student_id == current_user.id)
        
    if status:
        query = query.filter(models.Fee.status == status)
    if month:
        query = query.filter(models.Fee.month_year.ilike(f"%{month}%"))
        
    return query.all()

@router.post("", response_model=schemas.FeeOut, status_code=status.HTTP_201_CREATED)
def create_fee(
    fee_data: schemas.FeeCreate,
    db: Session = Depends(get_db),
    admin: models.User = Depends(auth.get_admin_user)
):
    student = db.query(models.User).filter(models.User.id == fee_data.student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
        
    new_fee = models.Fee(**fee_data.model_dump())
    db.add(new_fee)
    db.commit()
    db.refresh(new_fee)
    return new_fee

@router.post("/{fee_id}/pay", response_model=schemas.FeeOut)
def pay_fee(
    fee_id: int,
    pay_data: schemas.FeePayRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    fee = db.query(models.Fee).filter(models.Fee.id == fee_id).first()
    if not fee:
        raise HTTPException(status_code=404, detail="Fee record not found")
        
    if current_user.role != models.UserRole.ADMIN and fee.student_id != current_user.id:
        raise HTTPException(status_code=403, detail="Forbidden")
        
    fee.status = "Paid"
    fee.payment_date = datetime.utcnow()
    fee.transaction_id = pay_data.transaction_id
    
    db.commit()
    db.refresh(fee)
    return fee
