from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
import json
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
from database import FirebaseManager
# Initialize Firebase with proper credentials
firebase = FirebaseManager()
db = firebase.get_firestore_client()
print("Firebase configured successfully")
from ai_layer.pipeline import tailor_profile
from ai_layer.models import LayerInput, JobDescription, FullProfile
from Models import CVRequest, PersonalInfo
from cv_generator import save_cv, generate_cv
import asyncio
from datetime import datetime

app = FastAPI()

# Add CORS middleware for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Firebase and database are already initialized above


@app.get('/test')
def test():
    return {'message': 'API is running'}


@app.get('/personal-info/{document_id}')
def get_personal_info(document_id=None):
    try:
        # with open(file_path, 'r') as file:
        #     return json.load(file)
        if document_id:
            doc_ref = db.collection('users').document(document_id)
            doc = doc_ref.get()
            if doc.exists:
                return doc.to_dict()
            else:
                raise HTTPException(status_code=404, detail='User not found')
        else:
            raise HTTPException(status_code=400, detail='User ID is required')
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post('/personal-info')
def post_personal_info(request: PersonalInfo):
    try:
        # PersonalInfo = request.model_dump_json()
        # file_path = 'generated/personal_info.json'
        # with open(file_path, 'w') as file:
        #     json.dump(PersonalInfo, file, indent=4)
        # return {'message': 'Personal info saved successfully', 'file_path': file_path}
        personalInfo = request.model_dump()
        update_time, doc_ref = db.collection('users').add(personalInfo)
        return {'message': 'personal info saved successfully', 'document_id': doc_ref.id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post('/job-description')
async def post_job_description(request: dict):
    """
    Takes a job description and user_id, retrieves profile from Firestore,
    runs the AI layer pipeline, and outputs tailored profile.
    """
    try:
        user_id = request.get('user_id')
        job_description_text = request.get('job_description')

        if not user_id or not job_description_text:
            raise HTTPException(status_code=400, detail='user_id and job_description are required')

        # Get user profile from Firestore
        doc_ref = db.collection('users').document(user_id)
        doc = doc_ref.get()
        if not doc.exists:
            raise HTTPException(status_code=404, detail='User profile not found')

        user_profile = doc.to_dict()

        # Transform user profile to AI layer format
        # Convert experience data to match AI layer structure
        ai_experiences = []
        for idx, exp in enumerate(user_profile.get('experience', [])):
            ai_exp = {
                'id': f"exp_{idx}",
                'title': exp.get('role', ''),
                'company': exp.get('company', ''),
                'start_date': None,
                'end_date': None,
                'bullets': [f"Worked at {exp.get('company', '')} as {exp.get('role', '')} for {exp.get('years', 0)} years"],
                'skills': []
            }
            ai_experiences.append(ai_exp)

        # Convert projects data to match AI layer structure
        ai_projects = []
        for idx, proj in enumerate(user_profile.get('projects', [])):
            ai_proj = {
                'id': f"proj_{idx}",
                'name': proj.get('title', ''),
                'bullets': [proj.get('description', '')],
                'skills': []
            }
            ai_projects.append(ai_proj)

        # Convert certifications to list of strings
        ai_certifications = []
        for cert in user_profile.get('certifications', []):
            if isinstance(cert, dict):
                ai_certifications.append(cert.get('name', ''))
            else:
                ai_certifications.append(str(cert))

        full_profile = FullProfile(
            experiences=ai_experiences,
            projects=ai_projects,
            skills=user_profile.get('skills', []),
            certifications=ai_certifications
        )

        # Build LayerInput for AI pipeline
        layer_input = LayerInput(
            user_id=user_id,
            full_profile=full_profile,
            job_description=JobDescription(description=job_description_text)
        )

        # Run AI tailoring pipeline
        tailored_result = tailor_profile(layer_input)
        tailored_profile = tailored_result.tailored_profile.model_dump()

        # Save tailored profile to Firestore
        cv_ref = db.collection('users').document(user_id).collection('cvs').document()
        cv_data = {
            'tailored_profile': tailored_profile,
            'job_description': job_description_text,
            'created_at': datetime.utcnow(),
            'status': 'tailored'
        }
        cv_ref.set(cv_data)

        return {
            "message": "Tailored profile generated",
            "cv_id": cv_ref.id,
            "tailored_profile": tailored_profile
        }
    except Exception as e:
        print(f"Error in job-description endpoint: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@app.post('/generate-cv')
async def cv_generation(request: dict):
    """
    Generate CV PDF from tailored profile and upload to Firebase Storage
    """
    try:
        user_id = request.get('user_id')
        cv_id = request.get('cv_id')

        if not user_id or not cv_id:
            raise HTTPException(status_code=400, detail='user_id and cv_id are required')

        # Get tailored profile from Firestore
        cv_ref = db.collection('users').document(user_id).collection('cvs').document(cv_id)
        cv_doc = cv_ref.get()

        if not cv_doc.exists:
            raise HTTPException(status_code=404, detail='CV data not found')

        cv_data = cv_doc.to_dict()
        tailored_profile = cv_data.get('tailored_profile')
        job_description = cv_data.get('job_description')

        # Get user personal info for CV header
        user_ref = db.collection('users').document(user_id)
        user_doc = user_ref.get()
        if not user_doc.exists:
            raise HTTPException(status_code=404, detail='User not found')

        user_info = user_doc.to_dict()

        # Combine user info with tailored profile for CV generation
        combined_info = {
            **user_info,
            **tailored_profile
        }

        # Generate CV using existing cv_generator
        loop = asyncio.get_event_loop()
        cv_text = await loop.run_in_executor(None, generate_cv, combined_info, job_description)

        # Save CV with user's name
        user_name = user_info.get('name', 'User')
        pdf_filename = f"{user_name.replace(' ', '_')}_CV_{cv_id[:8]}.pdf"
        local_pdf_path = f"generated/{pdf_filename}"

        # Ensure generated directory exists
        os.makedirs("generated", exist_ok=True)

        pdf_path = await loop.run_in_executor(None, save_cv, cv_text, local_pdf_path)

        # TODO: Upload to Firebase Storage (implement when Storage is set up)
        # For now, just return local path

        # Update CV record with PDF info
        cv_ref.update({
            'pdf_path': pdf_path,
            'pdf_filename': pdf_filename,
            'status': 'completed',
            'generated_at': datetime.utcnow()
        })

        return {
            "message": "CV generated successfully",
            "pdf_path": pdf_path,
            "cv_id": cv_id,
            "download_url": f"/cv/{cv_id}"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get('/cv/{cv_id}')
def get_cv(cv_id: str, user_id: str):
    """
    Download CV PDF by cv_id
    """
    try:
        # Get CV record from Firestore
        cv_ref = db.collection('users').document(user_id).collection('cvs').document(cv_id)
        cv_doc = cv_ref.get()

        if not cv_doc.exists:
            raise HTTPException(status_code=404, detail='CV not found')

        cv_data = cv_doc.to_dict()
        pdf_path = cv_data.get('pdf_path')

        if not pdf_path or not os.path.exists(pdf_path):
            raise HTTPException(status_code=404, detail='PDF file not found')

        return FileResponse(
            path=pdf_path,
            media_type='application/pdf',
            filename=cv_data.get('pdf_filename', 'CV.pdf')
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get('/user/{user_id}/cvs')
def get_user_cvs(user_id: str):
    """
    Get all CVs for a user
    """
    try:
        cvs_ref = db.collection('users').document(user_id).collection('cvs')
        cvs = cvs_ref.order_by('created_at', direction='DESCENDING').stream()

        cv_list = []
        for cv in cvs:
            cv_data = cv.to_dict()
            cv_list.append({
                'id': cv.id,
                'job_description': cv_data.get('job_description', '')[:100] + '...',
                'status': cv_data.get('status'),
                'created_at': cv_data.get('created_at'),
                'generated_at': cv_data.get('generated_at'),
                'pdf_filename': cv_data.get('pdf_filename')
            })

        return {'cvs': cv_list}
    except Exception as e:
        print(f"Error in get_user_cvs endpoint: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
