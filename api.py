from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
import json
import os
from Models import CVRequest, PersonalInfo
from cv_generator import save_cv, generate_cv


from ai_layer.pipeline import run as ai_pipeline
from ai_layer.models import LayerInput
from Models import CVRequest, PersonalInfo
from cv_generator import save_cv, generate_cv

app = FastAPI()


@app.get('/personal-info')
def get_personal_info(file_path="generated/personal_info.json"):
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
async def post_job_description(description: str, file_path="generated/personal_info.json"):
    """
    Takes a job description and existing personal_info.json,
    runs the AI layer pipeline, and outputs tailored profile JSON.
    """
    try:
        with open(file_path, 'r') as f:
            personal_info = json.load(f)

        # Build LayerInput for AI pipeline
        layer_input = LayerInput(
            job_description=description,
            profile=personal_info
        )

        # Run AI tailoring pipeline
        tailored_profile = await ai_pipeline(layer_input)

        # Save tailored CV JSON
        output_path = "generated/tailored_profile.json"
        with open(output_path, "w") as f:
            json.dump(tailored_profile.dict(), f, indent=2)

        return {"message": "Tailored profile generated", "file_path": output_path}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post('/generate-cv')
async def cv_generation(request: CVRequest):
    try:
        # Use AI-layer tailored profile if exists
        tailored_path = "generated/tailored_profile.json"
        if os.path.exists(tailored_path):
            with open(tailored_path, "r") as f:
                personal_info = json.load(f)
        else:
            personal_info = request.personal_info

        # Generate CV PDF
        cv = await generate_cv(personal_info, request.job_description)
        pdf_path = await save_cv(cv, 'generated/CV.pdf')

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