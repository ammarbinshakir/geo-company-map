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

@router.get("/companies/{company_id}", response_model=schemas.CompanyOut)
def get_company(company_id: int, db: Session = Depends(database.get_db)):
    company = db.query(models.Company).filter(models.Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    return company

@router.post("/companies", response_model=schemas.CompanyOut)
def create_company(company: schemas.CompanyCreate, db: Session = Depends(database.get_db)):
    point = from_shape(Point(company.longitude, company.latitude), srid=4326)
    db_company = models.Company(**company.dict(), location=point)
    db.add(db_company)
    db.commit()
    db.refresh(db_company)
    return db_company

@router.put("/companies/{company_id}", response_model=schemas.CompanyOut)
def update_company(company_id: int, company_update: schemas.CompanyUpdate, db: Session = Depends(database.get_db)):
    db_company = db.query(models.Company).filter(models.Company.id == company_id).first()
    if not db_company:
        raise HTTPException(status_code=404, detail="Company not found")
    
    # Update fields that are provided
    update_data = company_update.dict(exclude_unset=True)
    
    # Handle location update if latitude or longitude is provided
    if "latitude" in update_data or "longitude" in update_data:
        lat = update_data.get("latitude", db_company.latitude)
        lng = update_data.get("longitude", db_company.longitude)
        point = from_shape(Point(lng, lat), srid=4326)
        update_data["location"] = point
    
    # Update the company
    for field, value in update_data.items():
        setattr(db_company, field, value)
    
    db.commit()
    db.refresh(db_company)
    return db_company

@router.delete("/companies/{company_id}")
def delete_company(company_id: int, db: Session = Depends(database.get_db)):
    db_company = db.query(models.Company).filter(models.Company.id == company_id).first()
    if not db_company:
        raise HTTPException(status_code=404, detail="Company not found")
    
    db.delete(db_company)
    db.commit()
    return {"message": "Company deleted successfully"}
