# Pydantic schemas

from pydantic import BaseModel, Field
from typing import List, Optional

class Experience(BaseModel):
    id: str
    title: str
    company: str
    start_date: Optional[str] = None  # YYYY-MM
    end_date: Optional[str] = None
    bullets: List[str] = Field(default_factory=list)
    skills: List[str] = Field(default_factory=list)

class Project(BaseModel):
    id: str
    name: str
    bullets: List[str] = Field(default_factory=list)
    skills: List[str] = Field(default_factory=list)

class FullProfile(BaseModel):
    experiences: List[Experience] = Field(default_factory=list)
    projects: List[Project] = Field(default_factory=list)
    skills: List[str] = Field(default_factory=list)
    certifications: List[str] = Field(default_factory=list)

class JobDescription(BaseModel):
    title: Optional[str] = None
    company: Optional[str] = None
    description: str

class LayerInput(BaseModel):
    user_id: str
    full_profile: FullProfile
    job_description: JobDescription

class TailoredProfile(BaseModel):
    experiences: List[Experience]
    projects: List[Project]
    skills: List[str]
    certifications: List[str]

class LayerOutput(BaseModel):
    user_id: str
    tailored_profile: TailoredProfile