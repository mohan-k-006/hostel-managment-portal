from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
import models, schemas, auth

router = APIRouter(prefix="/api/rooms", tags=["Rooms"])

@router.get("", response_model=List[schemas.RoomOut])
def get_rooms(
    block: Optional[str] = None,
    status: Optional[str] = None,
    room_type: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    query = db.query(models.Room)
    if block:
        query = query.filter(models.Room.block == block)
    if status:
        query = query.filter(models.Room.status == status)
    if room_type:
        query = query.filter(models.Room.room_type == room_type)
    if search:
        query = query.filter(models.Room.room_number.ilike(f"%{search}%"))
    
    return query.all()

@router.post("", response_model=schemas.RoomOut, status_code=status.HTTP_201_CREATED)
def create_room(
    room_data: schemas.RoomCreate,
    db: Session = Depends(get_db),
    admin: models.User = Depends(auth.get_admin_user)
):
    existing = db.query(models.Room).filter(models.Room.room_number == room_data.room_number).first()
    if existing:
        raise HTTPException(status_code=400, detail="Room number already exists")
    
    new_room = models.Room(**room_data.model_dump())
    db.add(new_room)
    db.commit()
    db.refresh(new_room)
    return new_room

@router.get("/{room_id}", response_model=schemas.RoomOut)
def get_room(room_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    room = db.query(models.Room).filter(models.Room.id == room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    return room

@router.put("/{room_id}", response_model=schemas.RoomOut)
def update_room(
    room_id: int,
    room_update: schemas.RoomUpdate,
    db: Session = Depends(get_db),
    admin: models.User = Depends(auth.get_admin_user)
):
    room = db.query(models.Room).filter(models.Room.id == room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    
    update_data = room_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(room, key, value)
    
    # Recalculate status based on capacity & occupancy
    if room.occupancy >= room.capacity:
        room.status = "Full"
    elif room.status == "Full" and room.occupancy < room.capacity:
        room.status = "Available"
        
    db.commit()
    db.refresh(room)
    return room

@router.delete("/{room_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_room(
    room_id: int,
    db: Session = Depends(get_db),
    admin: models.User = Depends(auth.get_admin_user)
):
    room = db.query(models.Room).filter(models.Room.id == room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    if room.occupants:
        raise HTTPException(status_code=400, detail="Cannot delete room with assigned occupants")
    db.delete(room)
    db.commit()
    return None

@router.post("/assign", response_model=schemas.UserOut)
def assign_room(
    req: schemas.AssignRoomRequest,
    db: Session = Depends(get_db),
    admin: models.User = Depends(auth.get_admin_user)
):
    student = db.query(models.User).filter(models.User.id == req.student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    room = db.query(models.Room).filter(models.Room.id == req.room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    
    if room.occupancy >= room.capacity:
        raise HTTPException(status_code=400, detail="Room is already at full capacity")
    
    # Unassign from previous room if any
    if student.room_id and student.room_id != req.room_id:
        old_room = db.query(models.Room).filter(models.Room.id == student.room_id).first()
        if old_room and old_room.occupancy > 0:
            old_room.occupancy -= 1
            if old_room.status == "Full":
                old_room.status = "Available"
    
    # Assign new room
    if student.room_id != req.room_id:
        student.room_id = room.id
        room.occupancy += 1
        if room.occupancy >= room.capacity:
            room.status = "Full"
    
    db.commit()
    db.refresh(student)
    return student

@router.post("/unassign/{student_id}", response_model=schemas.UserOut)
def unassign_room(
    student_id: int,
    db: Session = Depends(get_db),
    admin: models.User = Depends(auth.get_admin_user)
):
    student = db.query(models.User).filter(models.User.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    if student.room_id:
        room = db.query(models.Room).filter(models.Room.id == student.room_id).first()
        if room and room.occupancy > 0:
            room.occupancy -= 1
            if room.status == "Full":
                room.status = "Available"
        student.room_id = None
    
    db.commit()
    db.refresh(student)
    return student

@router.post("/smart-recommend")
def smart_recommend_room(
    req: schemas.SmartAllocationRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """
    Smart Helper Feature: Analyzes available rooms against student constraints (type, budget, block)
    and scores top recommended rooms based on occupancy balance and price fit.
    """
    rooms = db.query(models.Room).filter(models.Room.status == "Available").all()
    scored_rooms = []

    for room in rooms:
        score = 100
        reasons = []

        # Budget fit
        if req.max_budget:
            if room.monthly_fee <= req.max_budget:
                score += 30
                reasons.append(f"Within budget (₹{room.monthly_fee:.0f} <= ₹{req.max_budget:.0f})")
            else:
                score -= 40
                reasons.append("Exceeds target budget")

        # Preferred Room Type match
        if req.preferred_type:
            if req.preferred_type.lower() in room.room_type.lower():
                score += 35
                reasons.append(f"Matches preferred room type ({room.room_type})")

        # Preferred Block match
        if req.preferred_block:
            if req.preferred_block.lower() in room.block.lower():
                score += 25
                reasons.append(f"Located in preferred {room.block}")

        # Favor rooms with existing roommates over completely empty rooms for social balance
        vacant_seats = room.capacity - room.occupancy
        if vacant_seats > 0:
            score += (vacant_seats * 5)
            reasons.append(f"{vacant_seats} vacant spot(s) remaining")

        scored_rooms.append({
            "room": schemas.RoomOut.model_validate(room),
            "score": score,
            "reasons": list(set(reasons))
        })

    # Sort descending by recommendation score
    scored_rooms.sort(key=lambda x: x["score"], reverse=True)
    return {"recommendations": scored_rooms[:5]}
