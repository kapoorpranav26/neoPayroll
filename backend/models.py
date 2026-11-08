from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Float, Date
from sqlalchemy.orm import relationship
from database import Base

class Employee(Base):
    __tablename__ = "employees"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    department = Column(String)
    designation = Column(String)
    basic_salary = Column(Float)
    
    attendances = relationship("Attendance", back_populates="employee")
    salaries = relationship("Salary", back_populates="employee")
    leaves = relationship("Leave", back_populates="employee")

class Attendance(Base):
    __tablename__ = "attendances"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"))
    date = Column(Date)
    status = Column(String) # Present, Absent, Half-Day

    employee = relationship("Employee", back_populates="attendances")

class Salary(Base):
    __tablename__ = "salaries"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"))
    month = Column(String)
    year = Column(Integer)
    amount_paid = Column(Float)

    employee = relationship("Employee", back_populates="salaries")

class Leave(Base):
    __tablename__ = "leaves"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"))
    start_date = Column(Date)
    end_date = Column(Date)
    reason = Column(String)
    status = Column(String, default="Pending") # Pending, Approved, Rejected

    employee = relationship("Employee", back_populates="leaves")
