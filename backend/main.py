from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date as dt_date

import crud, models, schemas
from database import SessionLocal, engine

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Re-engineered Payroll System API")

@app.on_event("startup")
def startup_populate_defaults():
    db = SessionLocal()
    try:
        if db.query(models.Employee).count() == 0:
            e1 = models.Employee(
                name="Pranav Kapoor",
                email="pranav.kapoor@company.com",
                department="IT",
                designation="Software Engineer",
                basic_salary=62470.0
            )
            e2 = models.Employee(
                name="Jyotsna Kapoor",
                email="jyotsna.kapoor@company.com",
                department="Human Resources",
                designation="HR Manager",
                basic_salary=120000.0
            )
            db.add_all([e1, e2])
            db.commit()
    finally:
        db.close()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all for local dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post("/employees/", response_model=schemas.Employee)
def create_employee(employee: schemas.EmployeeCreate, db: Session = Depends(get_db)):
    db_employee = crud.get_employee_by_email(db, email=employee.email)
    if db_employee:
        raise HTTPException(status_code=400, detail="Email already registered")
    return crud.create_employee(db=db, employee=employee)

@app.get("/employees/", response_model=List[schemas.Employee])
def read_employees(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    employees = crud.get_employees(db, skip=skip, limit=limit)
    return employees

@app.put("/employees/{employee_id}", response_model=schemas.Employee)
def update_employee(employee_id: int, employee: schemas.EmployeeCreate, db: Session = Depends(get_db)):
    updated = crud.update_employee(db=db, employee_id=employee_id, employee_update=employee)
    if not updated:
        raise HTTPException(status_code=404, detail="Employee not found")
    return updated

@app.delete("/employees/{employee_id}")
def delete_employee(employee_id: int, db: Session = Depends(get_db)):
    deleted = crud.delete_employee(db=db, employee_id=employee_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Employee not found")
    return {"message": "Employee deleted successfully", "id": employee_id}

@app.post("/attendance/", response_model=schemas.Attendance)
def create_attendance(attendance: schemas.AttendanceCreate, db: Session = Depends(get_db)):
    return crud.create_attendance(db=db, attendance=attendance)

@app.get("/attendance/", response_model=List[schemas.Attendance])
def read_attendances(date: Optional[dt_date] = None, skip: int = 0, limit: int = 1000, db: Session = Depends(get_db)):
    return crud.get_attendances(db, skip=skip, limit=limit, date_filter=date)

@app.post("/salary/", response_model=schemas.Salary)
def create_salary(salary: schemas.SalaryCreate, db: Session = Depends(get_db)):
    return crud.create_salary(db=db, salary=salary)

@app.get("/salary/", response_model=List[schemas.Salary])
def read_salaries(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_salaries(db, skip=skip, limit=limit)

@app.post("/leaves/", response_model=schemas.Leave)
def create_leave(leave: schemas.LeaveCreate, db: Session = Depends(get_db)):
    return crud.create_leave(db=db, leave=leave)

@app.get("/leaves/", response_model=List[schemas.Leave])
def read_leaves(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_leaves(db, skip=skip, limit=limit)

from pydantic import BaseModel
class LeaveStatusUpdate(BaseModel):
    status: str

@app.put("/leaves/{leave_id}")
def update_leave(leave_id: int, update_data: LeaveStatusUpdate, db: Session = Depends(get_db)):
    return crud.update_leave_status(db, leave_id, update_data.status)
