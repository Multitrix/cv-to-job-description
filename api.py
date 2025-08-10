from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
import json
import os
from Models import CVRequest, PersonalInfo
from cv_generator import save_cv

app = FastAPI()


@app.get('/personal-info')
def get_personal_info(file_path="generated\\personal_info.json"):
    try:
        with open(file_path, 'r') as file:
            return json.load(file)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post('/personal-info')
def post_personal_info(request: PersonalInfo):
    try:
        PersonalInfo = request.model_dump_json()
        file_path = 'generated/personal_info.json'
        with open(file_path, 'w') as file:
            json.dump(PersonalInfo, file, indent=4)
        return {'message': 'Personal info saved successfully', 'file_path': file_path}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post('/job-description')
def post_job_description(description:str):
    pass


@app.post('/generate-cv')
def generate_cv(request: CVRequest):
    try:
        cv = generate_cv(request.personal_info, request.job_description)
        pdf_path = save_cv(cv, 'generated/CV.pdf')
        return {"message": "CV generated successfully", "pdf_path": pdf_path}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get('/cv/{file_path}')
def get_cv(file_path):
    try:
        if os.path.exists(file_path):
            return FileResponse(path=file_path, media_type='application/pdf')
        return {'error': 'File not found'}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))