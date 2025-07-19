from pydantic import BaseModel
from typing import Optional

class CompanyBase(BaseModel):
    name: str
    industry: str
    address: Optional[str] = None
    latitude: float
    longitude: float

class CompanyCreate(CompanyBase):
    pass

class CompanyUpdate(BaseModel):
    name: Optional[str] = None
    industry: Optional[str] = None
    address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class CompanyOut(CompanyBase):
    id: int

    class Config:
        orm_mode = True
