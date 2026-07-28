from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, date
from database import get_db
import models, auth

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])

@router.get("/dashboard")
def get_dashboard_analytics(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    total_rooms = db.query(models.Room).count()
    rooms = db.query(models.Room).all()
    
    total_capacity = sum(r.capacity for r in rooms)
    total_occupied = sum(r.occupancy for r in rooms)
    occupancy_rate = (total_occupied / total_capacity * 100) if total_capacity > 0 else 0
    
    # Complaints metrics
    total_complaints = db.query(models.Complaint).count()
    pending_complaints = db.query(models.Complaint).filter(models.Complaint.status == "Pending").count()
    in_progress_complaints = db.query(models.Complaint).filter(models.Complaint.status == "In Progress").count()
    resolved_complaints = db.query(models.Complaint).filter(models.Complaint.status == "Resolved").count()
    emergency_complaints = db.query(models.Complaint).filter(models.Complaint.priority == "Emergency").count()
    
    # Visitors metrics
    active_visitors = db.query(models.Visitor).filter(models.Visitor.status == "Active").count()
    
    # Fee metrics
    total_paid_fees = db.query(func.sum(models.Fee.amount)).filter(models.Fee.status == "Paid").scalar() or 0.0
    total_pending_fees = db.query(func.sum(models.Fee.amount)).filter(models.Fee.status == "Pending").scalar() or 0.0
    total_overdue_fees = db.query(func.sum(models.Fee.amount)).filter(models.Fee.status == "Overdue").scalar() or 0.0

    # Students count
    total_students = db.query(models.User).filter(models.User.role == "student").count()

    return {
        "rooms": {
            "total_rooms": total_rooms,
            "total_capacity": total_capacity,
            "total_occupied": total_occupied,
            "vacant_beds": max(0, total_capacity - total_occupied),
            "occupancy_rate": round(occupancy_rate, 1)
        },
        "complaints": {
            "total": total_complaints,
            "pending": pending_complaints,
            "in_progress": in_progress_complaints,
            "resolved": resolved_complaints,
            "emergency": emergency_complaints
        },
        "visitors": {
            "active": active_visitors
        },
        "fees": {
            "paid_amount": total_paid_fees,
            "pending_amount": total_pending_fees,
            "overdue_amount": total_overdue_fees
        },
        "total_students": total_students
    }
