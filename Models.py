from pydantic import BaseModel, EmailStr
from pydantic_extra_types.phone_numbers import PhoneNumber
from typing import Optional


class PersonalInfo(BaseModel):
    name: str
    email: EmailStr
    address: Optional[str]
    portfolio: Optional[str]
    phone: PhoneNumber
    linkedIn: str
    github: Optional[str]
    skills: list[str]
    experience: Optional[list[dict]]
    education: list[dict]
    certifications: Optional[list[dict]]
    languages: list[str]
    projects: Optional[list[dict]]


class CVRequest(BaseModel):
    personal_info: PersonalInfo
    job_description: str