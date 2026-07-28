from database import SessionLocal, engine, Base
import models
import auth
from datetime import datetime, timedelta

def seed_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # Check if already seeded
    if db.query(models.User).filter(models.User.email == "admin@hostel.edu").first():
        print("Database already contains seed data.")
        db.close()
        return

    print("Seeding database with realistic campus hostel data...")

    # 1. Create Rooms
    rooms_data = [
        models.Room(room_number="A-101", block="Block A", floor=1, capacity=2, occupancy=2, room_type="Double AC", monthly_fee=5000.0, status="Full", amenities="Wi-Fi, Study Table, Attached Washroom, AC"),
        models.Room(room_number="A-102", block="Block A", floor=1, capacity=2, occupancy=1, room_type="Double AC", monthly_fee=5000.0, status="Available", amenities="Wi-Fi, Study Table, Attached Washroom, AC"),
        models.Room(room_number="B-201", block="Block B", floor=2, capacity=1, occupancy=1, room_type="Single Deluxe", monthly_fee=7500.0, status="Full", amenities="Wi-Fi, Balcony, Private Washroom, AC, Refrigerator"),
        models.Room(room_number="B-202", block="Block B", floor=2, capacity=2, occupancy=0, room_type="Double Non-AC", monthly_fee=3800.0, status="Available", amenities="Wi-Fi, Study Desk, Shared Washroom"),
        models.Room(room_number="C-301", block="Block C", floor=3, capacity=3, occupancy=2, room_type="Triple Non-AC", monthly_fee=3200.0, status="Available", amenities="Wi-Fi, Study Desks, Shared Washroom"),
        models.Room(room_number="C-302", block="Block C", floor=3, capacity=2, occupancy=0, room_type="Double AC", monthly_fee=4800.0, status="Maintenance", amenities="Under repair after plumbing check")
    ]
    for r in rooms_data:
        db.add(r)
    db.commit()

    # Query room IDs
    room_a101 = db.query(models.Room).filter(models.Room.room_number == "A-101").first()
    room_a102 = db.query(models.Room).filter(models.Room.room_number == "A-102").first()
    room_b201 = db.query(models.Room).filter(models.Room.room_number == "B-201").first()
    room_c301 = db.query(models.Room).filter(models.Room.room_number == "C-301").first()

    # 2. Create Users (1 Warden Admin, 4 Students)
    admin_user = models.User(
        email="admin@hostel.edu",
        hashed_password=auth.hash_password("admin123"),
        full_name="Dr. Rajesh Sharma (Head Warden)",
        role="admin",
        phone="+91 98765 43210",
        avatar_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250"
    )

    student1 = models.User(
        email="student@hostel.edu",
        hashed_password=auth.hash_password("student123"),
        full_name="Aarav Verma",
        role="student",
        phone="+91 98123 45678",
        room_id=room_a101.id,
        avatar_url="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=250"
    )

    student2 = models.User(
        email="ananya@hostel.edu",
        hashed_password=auth.hash_password("student123"),
        full_name="Ananya Roy",
        role="student",
        phone="+91 98234 56789",
        room_id=room_a101.id,
        avatar_url="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=250"
    )

    student3 = models.User(
        email="rahul@hostel.edu",
        hashed_password=auth.hash_password("student123"),
        full_name="Rahul Mehta",
        role="student",
        phone="+91 98345 67890",
        room_id=room_a102.id,
        avatar_url="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250"
    )

    student4 = models.User(
        email="vikram@hostel.edu",
        hashed_password=auth.hash_password("student123"),
        full_name="Vikram Singh",
        role="student",
        phone="+91 98456 78901",
        room_id=room_b201.id,
        avatar_url="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=250"
    )

    db.add_all([admin_user, student1, student2, student3, student4])
    db.commit()

    # Refresh students to get IDs
    db.refresh(student1)
    db.refresh(student2)
    db.refresh(student3)

    # 3. Create Complaints
    complaints = [
        models.Complaint(
            student_id=student1.id,
            title="Short circuit near study desk socket",
            category="Electrical",
            priority="Emergency",
            description="Sparking observed near the desk plug outlet. Needs immediate technician check.",
            status="In Progress",
            resolution_notes="Electrician assigned; main breaker temporarily isolated."
        ),
        models.Complaint(
            student_id=student2.id,
            title="Wi-Fi router signal intermittent in Block A",
            category="Wi-Fi",
            priority="Medium",
            description="Speed drops significantly after 8 PM during study hours.",
            status="Pending",
            resolution_notes=None
        ),
        models.Complaint(
            student_id=student3.id,
            title="Bathroom tap leaking continuously",
            category="Plumbing",
            priority="High",
            description="Tap knob is loose causing water loss. Please replace washer.",
            status="Resolved",
            resolution_notes="Tap washer replaced on July 24 by plumber Mohan."
        )
    ]
    db.add_all(complaints)

    # 4. Create Visitors
    visitors = [
        models.Visitor(
            student_id=student1.id,
            visitor_name="Suresh Verma",
            phone="+91 99887 76655",
            relation="Father",
            purpose="Delivering monthly supplies and books",
            check_in_time=datetime.utcnow() - timedelta(hours=1),
            status="Active"
        ),
        models.Visitor(
            student_id=student3.id,
            visitor_name="Priya Mehta",
            phone="+91 99776 65544",
            relation="Sister",
            purpose="Weekend visit",
            check_in_time=datetime.utcnow() - timedelta(days=2, hours=3),
            check_out_time=datetime.utcnow() - timedelta(days=2),
            status="Checked Out"
        )
    ]
    db.add_all(visitors)

    # 5. Create Fees
    fees = [
        models.Fee(
            student_id=student1.id,
            month_year="July 2026",
            amount=5000.0,
            due_date="2026-07-31",
            status="Paid",
            payment_date=datetime.utcnow() - timedelta(days=5),
            transaction_id="TXN98421034"
        ),
        models.Fee(
            student_id=student2.id,
            month_year="July 2026",
            amount=5000.0,
            due_date="2026-07-15",
            status="Overdue"
        ),
        models.Fee(
            student_id=student3.id,
            month_year="July 2026",
            amount=5000.0,
            due_date="2026-07-31",
            status="Pending"
        )
    ]
    db.add_all(fees)

    # 6. Create Notices
    notices = [
        models.Notice(
            title="Hostel Annual Maintenance & Geyser Inspection",
            content="All residents are informed that water heaters in Block A & B will be inspected between 10 AM - 4 PM tomorrow.",
            category="Maintenance",
            priority="Important",
            author_name="Chief Warden Office"
        ),
        models.Notice(
            title="Night Gate Pass Timings Updated",
            content="Curfew time for entry without prior warden pass is strictly 10:30 PM. Late entries will log automated parent alerts.",
            category="Rules",
            priority="Urgent",
            author_name="Discipline Committee"
        ),
        models.Notice(
            title="Inter-Hostel Table Tennis Championship Registration",
            content="Register your entries at the sports desk by July 30. Exciting trophies and certificate prizes!",
            category="Event",
            priority="Normal",
            author_name="Sports Club"
        )
    ]
    db.add_all(notices)

    db.commit()
    print("Database seeding completed successfully!")
    db.close()

if __name__ == "__main__":
    seed_database()
