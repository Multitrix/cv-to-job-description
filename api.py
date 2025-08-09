from fastapi import FastAPI, HTTPException
from Models import CVRequest
from cv_generator import save_cv

app = FastAPI()


@app.get('/personal-info')
def get_personal_info():
    pass


@app.post('/personal-info')
def post_personal_info():
    pass


@app.post('/job-description')
def post_job_description():
    pass


@app.post('/generate-cv')
def generate_cv(request: CVRequest):
    try:
        cv = generate_cv(request.personal_info, request.job_description)
        pdf_path = save_cv(cv, 'generated/CV.pdf')
        return {"message": "CV generated successfully", "pdf_path": pdf_path}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get('/cv/{cv_id}')
def get_cv(cv_id):
    pass