from pydantic import BaseModel
from typing import Optional

class CVRequest(BaseModel):
    personal_info: dict
    job_description: str

class PersonalInfo(BaseModel):
    name: str
    email: str
    address: Optional[str]
    portfolio: Optional[str]
    phone: str
    linkedIn: str
    github: Optional[str]
    skills: list[str]
    experience: Optional[list[dict]]
    education: list[dict]
    certifications: Optional[list[dict]]
    languages: list[str]
    projects: Optional[list[dict]]
