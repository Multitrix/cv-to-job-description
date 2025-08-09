from pydantic import BaseModel


class CVRequest(BaseModel):
    personal_info: dict
    job_description: str