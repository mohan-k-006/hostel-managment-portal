from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Text, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from database import Base

class UserRole(str, enum.Enum):
    ADMIN = "admin"
    STUDENT = "student"

class RoomStatus(str, enum.Enum):
    AVAILABLE = "Available"
    FULL = "Full"
    MAINTENANCE = "Maintenance"

class ComplaintStatus(str, enum.Enum):
    PENDING = "Pending"
    IN_PROGRESS = "In Progress"
    RESOLVED = "Resolved"

class ComplaintPriority(str, enum.Enum):
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"
    EMERGENCY = "Emergency"

class FeeStatus(str, enum.Enum):
    PAID = "Paid"
    PENDING = "Pending"
    OVERDUE = "Overdue"

class VisitorStatus(str, enum.Enum):
    ACTIVE = "Active"
    CHECKED_OUT = "Checked Out"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    role = Column(String, default=UserRole.STUDENT)
    phone = Column(String, nullable=True)
    room_id = Column(Integer, ForeignKey("rooms.id"), nullable=True)
    avatar_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    room = relationship("Room", back_populates="occupants")
    complaints = relationship("Complaint", back_populates="student", cascade="all, delete-orphan")
    visitors = relationship("Visitor", back_populates="student", cascade="all, delete-orphan")
    fees = relationship("Fee", back_populates="student", cascade="all, delete-orphan")

class Room(Base):
    __tablename__ = "rooms"

    id = Column(Integer, primary_key=True, index=True)
    room_number = Column(String, unique=True, index=True, nullable=False)
    block = Column(String, nullable=False)  # e.g., 'Block A', 'Block B'
    floor = Column(Integer, nullable=False)
    capacity = Column(Integer, default=2)
    occupancy = Column(Integer, default=0)
    room_type = Column(String, default="Double AC")  # Single, Double AC, Triple Non-AC, Deluxe
    monthly_fee = Column(Float, nullable=False, default=4500.0)
    status = Column(String, default=RoomStatus.AVAILABLE)
    amenities = Column(String, default="Wi-Fi, Study Table, Attached Washroom, AC")

    occupants = relationship("User", back_populates="room")

class Complaint(Base):
    __tablename__ = "complaints"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    category = Column(String, nullable=False)  # Plumbing, Electrical, Furniture, Wi-Fi, Cleanliness
    priority = Column(String, default=ComplaintPriority.MEDIUM)
    description = Column(Text, nullable=False)
    status = Column(String, default=ComplaintStatus.PENDING)
    resolution_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    student = relationship("User", back_populates="complaints")

class Visitor(Base):
    __tablename__ = "visitors"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    visitor_name = Column(String, nullable=False)
    phone = Column(String, nullable=False)
    relation = Column(String, nullable=False)
    purpose = Column(String, nullable=False)
    check_in_time = Column(DateTime, default=datetime.utcnow)
    check_out_time = Column(DateTime, nullable=True)
    status = Column(String, default=VisitorStatus.ACTIVE)

    student = relationship("User", back_populates="visitors")

class Fee(Base):
    __tablename__ = "fees"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    month_year = Column(String, nullable=False)  # e.g., "July 2026"
    amount = Column(Float, nullable=False)
    due_date = Column(String, nullable=False)
    status = Column(String, default=FeeStatus.PENDING)
    payment_date = Column(DateTime, nullable=True)
    transaction_id = Column(String, nullable=True)

    student = relationship("User", back_populates="fees")

class Notice(Base):
    __tablename__ = "notices"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    author_name = Column(String, default="Warden Office")
    category = Column(String, default="General")  # General, Maintenance, Rules, Event
    priority = Column(String, default="Normal")  # Normal, Important, Urgent
    created_at = Column(DateTime, default=datetime.utcnow)
