from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from app import models, schemas, database
from sqlalchemy import func
from geoalchemy2.shape import from_shape
from shapely.geometry import Point
from typing import List
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

@router.get("/companies", response_model=List[schemas.CompanyOut], summary="Get all companies")
def get_companies(db: Session = Depends(database.get_db)):
    """
    Retrieve all companies from the database.
    
    Returns:
        List[CompanyOut]: List of all companies with their details
    """
    try:
        companies = db.query(models.Company).all()
        logger.info(f"Retrieved {len(companies)} companies")
        return companies
    except Exception as e:
        logger.error(f"Error retrieving companies: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve companies"
        )

@router.get("/companies/{company_id}", response_model=schemas.CompanyOut, summary="Get company by ID")
def get_company(company_id: int, db: Session = Depends(database.get_db)):
    """
    Retrieve a specific company by its ID.
    
    Args:
        company_id (int): The unique identifier of the company
        
    Returns:
        CompanyOut: Company details
        
    Raises:
        HTTPException: If company is not found
    """
    if company_id <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Company ID must be a positive integer"
        )
    
    try:
        company = db.query(models.Company).filter(models.Company.id == company_id).first()
        if not company:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Company with ID {company_id} not found"
            )
        logger.info(f"Retrieved company with ID: {company_id}")
        return company
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving company {company_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve company"
        )

@router.post("/companies", response_model=schemas.CompanyOut, status_code=status.HTTP_201_CREATED, summary="Create a new company")
def create_company(company: schemas.CompanyCreate, db: Session = Depends(database.get_db)):
    """
    Create a new company in the database.
    
    Args:
        company (CompanyCreate): Company data to create
        
    Returns:
        CompanyOut: Created company details
        
    Raises:
        HTTPException: If creation fails or validation errors occur
    """
    try:
        # Validate coordinates are within valid ranges
        if not (-90 <= company.latitude <= 90):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Latitude must be between -90 and 90 degrees"
            )
        if not (-180 <= company.longitude <= 180):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Longitude must be between -180 and 180 degrees"
            )
        
        # Create geometric point
        point = from_shape(Point(company.longitude, company.latitude), srid=4326)
        
        # Create company object
        db_company = models.Company(
            name=company.name,
            industry=company.industry,
            address=company.address,
            latitude=company.latitude,
            longitude=company.longitude,
            location=point
        )
        
        db.add(db_company)
        db.commit()
        db.refresh(db_company)
        
        logger.info(f"Created company: {db_company.name} with ID: {db_company.id}")
        return db_company
        
    except IntegrityError as e:
        db.rollback()
        logger.error(f"Database integrity error creating company: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Company with this name already exists or invalid data provided"
        )
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error creating company: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create company"
        )

@router.put("/companies/{company_id}", response_model=schemas.CompanyOut, summary="Update a company")
def update_company(company_id: int, company_update: schemas.CompanyUpdate, db: Session = Depends(database.get_db)):
    """
    Update an existing company by ID.
    
    Args:
        company_id (int): The unique identifier of the company to update
        company_update (CompanyUpdate): Updated company data
        
    Returns:
        CompanyOut: Updated company details
        
    Raises:
        HTTPException: If company not found or update fails
    """
    if company_id <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Company ID must be a positive integer"
        )
    
    try:
        db_company = db.query(models.Company).filter(models.Company.id == company_id).first()
        if not db_company:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Company with ID {company_id} not found"
            )
        
        # Get update data, excluding unset fields
        update_data = company_update.dict(exclude_unset=True)
        
        if not update_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No valid fields provided for update"
            )
        
        # Handle location update if latitude or longitude is provided
        if "latitude" in update_data or "longitude" in update_data:
            lat = update_data.get("latitude", db_company.latitude)
            lng = update_data.get("longitude", db_company.longitude)
            
            # Validate coordinates
            if not (-90 <= lat <= 90):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Latitude must be between -90 and 90 degrees"
                )
            if not (-180 <= lng <= 180):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Longitude must be between -180 and 180 degrees"
                )
            
            point = from_shape(Point(lng, lat), srid=4326)
            update_data["location"] = point
        
        # Update the company fields
        for field, value in update_data.items():
            setattr(db_company, field, value)
        
        db.commit()
        db.refresh(db_company)
        
        logger.info(f"Updated company with ID: {company_id}")
        return db_company
        
    except IntegrityError as e:
        db.rollback()
        logger.error(f"Database integrity error updating company {company_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid data provided for update"
        )
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error updating company {company_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update company"
        )

@router.delete("/companies/{company_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete a company")
def delete_company(company_id: int, db: Session = Depends(database.get_db)):
    """
    Delete a company by ID.
    
    Args:
        company_id (int): The unique identifier of the company to delete
        
    Returns:
        None
        
    Raises:
        HTTPException: If company not found or deletion fails
    """
    if company_id <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Company ID must be a positive integer"
        )
    
    try:
        db_company = db.query(models.Company).filter(models.Company.id == company_id).first()
        if not db_company:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Company with ID {company_id} not found"
            )
        
        company_name = db_company.name
        db.delete(db_company)
        db.commit()
        
        logger.info(f"Deleted company: {company_name} with ID: {company_id}")
        return None
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error deleting company {company_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete company"
        )
