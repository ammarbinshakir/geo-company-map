from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import models, schemas, database
from sqlalchemy import func
from geoalchemy2.shape import from_shape
from shapely.geometry import Point

router = APIRouter()

@router.get("/companies", response_model=list[schemas.CompanyOut])
def get_companies(db: Session = Depends(database.get_db)):
    return db.query(models.Company).all()

@router.post("/companies", response_model=schemas.CompanyOut)
def create_company(company: schemas.CompanyCreate, db: Session = Depends(database.get_db)):
    point = from_shape(Point(company.longitude, company.latitude), srid=4326)
    db_company = models.Company(**company.dict(), location=point)
    db.add(db_company)
    db.commit()
    db.refresh(db_company)
    return db_company
