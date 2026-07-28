from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

# --- Auth & User Schemas ---
class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    phone: Optional[str] = None
    role: str = "student"

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(UserBase):
    id: int
    room_id: Optional[int] = None
    avatar_url: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserOut

# --- Room Schemas ---
class RoomBase(BaseModel):
    room_number: str
    block: str
    floor: int
    capacity: int = 2
    room_type: str = "Double AC"
    monthly_fee: float = 4500.0
    status: str = "Available"
    amenities: Optional[str] = "Wi-Fi, Study Table, Attached Washroom, AC"

class RoomCreate(RoomBase):
    pass

class RoomUpdate(BaseModel):
    block: Optional[str] = None
    floor: Optional[int] = None
    capacity: Optional[int] = None
    occupancy: Optional[int] = None
    room_type: Optional[str] = None
    monthly_fee: Optional[float] = None
    status: Optional[str] = None
    amenities: Optional[str] = None

class RoomOut(RoomBase):
    id: int
    occupancy: int
    occupants: List[UserOut] = []

    class Config:
        from_attributes = True

class AssignRoomRequest(BaseModel):
    student_id: int
    room_id: int

# --- Complaint Schemas ---
class ComplaintBase(BaseModel):
    title: str
    category: str
    priority: str = "Medium"
    description: str

class ComplaintCreate(ComplaintBase):
    pass

class ComplaintUpdate(BaseModel):
    status: Optional[str] = None
    priority: Optional[str] = None
    resolution_notes: Optional[str] = None

class ComplaintOut(ComplaintBase):
    id: int
    student_id: int
    status: str
    resolution_notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    student: Optional[UserOut] = None

    class Config:
        from_attributes = True

# --- Visitor Schemas ---
class VisitorBase(BaseModel):
    visitor_name: str
    phone: str
    relation: str
    purpose: str

class VisitorCreate(VisitorBase):
    student_id: int

class VisitorOut(VisitorBase):
    id: int
    student_id: int
    check_in_time: datetime
    check_out_time: Optional[datetime] = None
    status: str
    student: Optional[UserOut] = None

    class Config:
        from_attributes = True

# --- Fee Schemas ---
class FeeBase(BaseModel):
    student_id: int
    month_year: str
    amount: float
    due_date: str
    status: str = "Pending"

class FeeCreate(FeeBase):
    pass

class FeePayRequest(BaseModel):
    transaction_id: str

class FeeOut(FeeBase):
    id: int
    payment_date: Optional[datetime] = None
    transaction_id: Optional[str] = None
    student: Optional[UserOut] = None

    class Config:
        from_attributes = True

# --- Notice Schemas ---
class NoticeBase(BaseModel):
    title: str
    content: str
    category: str = "General"
    priority: str = "Normal"

class NoticeCreate(NoticeBase):
    author_name: Optional[str] = "Warden Office"

class NoticeOut(NoticeBase):
    id: int
    author_name: str
    created_at: datetime

    class Config:
        from_attributes = True

# --- Smart Helper & Recommendation Schemas ---
class SmartAllocationRequest(BaseModel):
    preferred_type: Optional[str] = None
    max_budget: Optional[float] = None
    preferred_block: Optional[str] = None
