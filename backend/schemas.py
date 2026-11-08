from pydantic import BaseModel
from typing import List, Optional
from datetime import date

# Employee Schemas
class EmployeeBase(BaseModel):
    name: str
    email: str
    department: str
    designation: str
    basic_salary: float

class EmployeeCreate(EmployeeBase):
    pass

class Employee(EmployeeBase):
    id: int

    class Config:
        from_attributes = True

# Attendance Schemas
class AttendanceBase(BaseModel):
    date: date
    status: str

class AttendanceCreate(AttendanceBase):
    employee_id: int

class Attendance(AttendanceBase):
    id: int
    employee_id: int

    class Config:
        from_attributes = True

# Salary Schemas
class SalaryBase(BaseModel):
    month: str
    year: int
    amount_paid: float

class SalaryCreate(SalaryBase):
    employee_id: int

class Salary(SalaryBase):
    id: int
    employee_id: int

    class Config:
        from_attributes = True

# Leave Schemas
class LeaveBase(BaseModel):
    start_date: date
    end_date: date
    reason: str

class LeaveCreate(LeaveBase):
    employee_id: int

class Leave(LeaveBase):
    id: int
    employee_id: int
    status: str

    class Config:
        from_attributes = True
