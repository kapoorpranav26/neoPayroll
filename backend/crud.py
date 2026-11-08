from sqlalchemy.orm import Session
import models, schemas

# Employee
def get_employee(db: Session, employee_id: int):
    return db.query(models.Employee).filter(models.Employee.id == employee_id).first()

def get_employee_by_email(db: Session, email: str):
    return db.query(models.Employee).filter(models.Employee.email == email).first()

def get_employees(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Employee).offset(skip).limit(limit).all()

def create_employee(db: Session, employee: schemas.EmployeeCreate):
    db_employee = models.Employee(**employee.model_dump())
    db.add(db_employee)
    db.commit()
    db.refresh(db_employee)
    return db_employee

def update_employee(db: Session, employee_id: int, employee_update: schemas.EmployeeCreate):
    db_emp = get_employee(db, employee_id)
    if not db_emp:
        return None
    for key, value in employee_update.model_dump().items():
        setattr(db_emp, key, value)
    db.commit()
    db.refresh(db_emp)
    return db_emp

def delete_employee(db: Session, employee_id: int):
    db_emp = get_employee(db, employee_id)
    if not db_emp:
        return None
    db.query(models.Attendance).filter(models.Attendance.employee_id == employee_id).delete()
    db.query(models.Salary).filter(models.Salary.employee_id == employee_id).delete()
    db.query(models.Leave).filter(models.Leave.employee_id == employee_id).delete()
    db.delete(db_emp)
    db.commit()
    return db_emp

# Attendance
def get_attendances(db: Session, skip: int = 0, limit: int = 1000, date_filter=None):
    query = db.query(models.Attendance)
    if date_filter:
        query = query.filter(models.Attendance.date == date_filter)
    return query.offset(skip).limit(limit).all()

def create_attendance(db: Session, attendance: schemas.AttendanceCreate):
    existing = db.query(models.Attendance).filter(
        models.Attendance.employee_id == attendance.employee_id,
        models.Attendance.date == attendance.date
    ).first()
    
    if existing:
        existing.status = attendance.status
        db.commit()
        db.refresh(existing)
        return existing
        
    db_attendance = models.Attendance(**attendance.model_dump())
    db.add(db_attendance)
    db.commit()
    db.refresh(db_attendance)
    return db_attendance

# Salary
def get_salaries(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Salary).offset(skip).limit(limit).all()

def create_salary(db: Session, salary: schemas.SalaryCreate):
    db_salary = models.Salary(**salary.model_dump())
    db.add(db_salary)
    db.commit()
    db.refresh(db_salary)
    return db_salary

# Leave
def get_leaves(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Leave).offset(skip).limit(limit).all()

def create_leave(db: Session, leave: schemas.LeaveCreate):
    db_leave = models.Leave(**leave.model_dump())
    db.add(db_leave)
    db.commit()
    db.refresh(db_leave)
    return db_leave

def update_leave_status(db: Session, leave_id: int, status: str):
    db_leave = db.query(models.Leave).filter(models.Leave.id == leave_id).first()
    if db_leave:
        db_leave.status = status
        db.commit()
        db.refresh(db_leave)
    return db_leave
