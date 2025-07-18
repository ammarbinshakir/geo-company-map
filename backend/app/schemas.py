from pydantic import BaseModel

class CompanyBase(BaseModel):
    name: str
    industry: str
    address: str | None = None
    latitude: float
    longitude: float

class CompanyCreate(CompanyBase):
    pass

class CompanyOut(CompanyBase):
    id: int

    class Config:
        orm_mode = True
