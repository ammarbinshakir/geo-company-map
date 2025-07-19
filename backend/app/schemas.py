from pydantic import BaseModel, Field, validator, ValidationError
from typing import Optional
from decimal import Decimal

class CompanyBase(BaseModel):
    name: str = Field(
        ..., 
        min_length=1, 
        max_length=100,
        description="Company name",
        example="Acme Corporation"
    )
    industry: str = Field(
        ..., 
        min_length=1, 
        max_length=50,
        description="Company industry",
        example="Technology"
    )
    address: Optional[str] = Field(
        None, 
        max_length=200,
        description="Company address",
        example="123 Main St, City, State 12345"
    )
    latitude: float = Field(
        ..., 
        ge=-90, 
        le=90,
        description="Latitude coordinate",
        example=40.7128
    )
    longitude: float = Field(
        ..., 
        ge=-180, 
        le=180,
        description="Longitude coordinate",
        example=-74.0060
    )

    @validator('name')
    def validate_name(cls, v):
        if not v.strip():
            raise ValueError('Company name cannot be empty or whitespace only')
        return v.strip()

    @validator('industry')
    def validate_industry(cls, v):
        if not v.strip():
            raise ValueError('Industry cannot be empty or whitespace only')
        return v.strip()

    @validator('address')
    def validate_address(cls, v):
        if v is not None and not v.strip():
            return None
        return v.strip() if v else None

    @validator('latitude', 'longitude')
    def validate_coordinates(cls, v):
        if not isinstance(v, (int, float)):
            raise ValueError('Coordinate must be a number')
        return float(v)

class CompanyCreate(CompanyBase):
    pass

class CompanyUpdate(BaseModel):
    name: Optional[str] = Field(
        None, 
        min_length=1, 
        max_length=100,
        description="Company name",
        example="Acme Corporation"
    )
    industry: Optional[str] = Field(
        None, 
        min_length=1, 
        max_length=50,
        description="Company industry",
        example="Technology"
    )
    address: Optional[str] = Field(
        None, 
        max_length=200,
        description="Company address",
        example="123 Main St, City, State 12345"
    )
    latitude: Optional[float] = Field(
        None, 
        ge=-90, 
        le=90,
        description="Latitude coordinate",
        example=40.7128
    )
    longitude: Optional[float] = Field(
        None, 
        ge=-180, 
        le=180,
        description="Longitude coordinate",
        example=-74.0060
    )

    @validator('name')
    def validate_name(cls, v):
        if v is not None:
            if not v.strip():
                raise ValueError('Company name cannot be empty or whitespace only')
            return v.strip()
        return v

    @validator('industry')
    def validate_industry(cls, v):
        if v is not None:
            if not v.strip():
                raise ValueError('Industry cannot be empty or whitespace only')
            return v.strip()
        return v

    @validator('address')
    def validate_address(cls, v):
        if v is not None and not v.strip():
            return None
        return v.strip() if v else None

    @validator('latitude', 'longitude')
    def validate_coordinates(cls, v):
        if v is not None:
            if not isinstance(v, (int, float)):
                raise ValueError('Coordinate must be a number')
            return float(v)
        return v

    @validator('latitude', 'longitude', pre=True)
    def validate_coordinate_pairs(cls, v, values):
        # Check if both latitude and longitude are provided together
        if 'latitude' in values and 'longitude' in values:
            lat = values.get('latitude')
            lng = values.get('longitude')
            if (lat is not None and lng is None) or (lat is None and lng is not None):
                raise ValueError('Both latitude and longitude must be provided together')
        return v

class CompanyOut(CompanyBase):
    id: int = Field(..., description="Company ID", example=1)

    class Config:
        orm_mode = True
        schema_extra = {
            "example": {
                "id": 1,
                "name": "Acme Corporation",
                "industry": "Technology",
                "address": "123 Main St, New York, NY 10001",
                "latitude": 40.7128,
                "longitude": -74.0060
            }
        }
