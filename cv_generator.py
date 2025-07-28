import os
import json
import numpy as np
from openai import OpenAI
import faiss
from personal_info_parser import load_personal_info
from vector_db import create_vector_db_from_personal_info, VectorDB
from job_analyzer import get_job_description, analyze_job_description
from pdf_generator import convert_text_to_pdf

# Initialize OpenAI client
client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

def find_relevant_info(vector_db, job_analysis, k=10):
    """Find relevant information from personal info based on job analysis."""
    # Create a comprehensive query from job analysis
    job_analysis_dict = json.loads(job_analysis)
    
    query_parts = []
    query_parts.append(f"Job Title: {job_analysis_dict.get('job_title', '')}")
    
    if 'required_skills' in job_analysis_dict:
        query_parts.append(f"Required Skills: {', '.join(job_analysis_dict['required_skills'])}")
    
    if 'preferred_skills' in job_analysis_dict:
        query_parts.append(f"Preferred Skills: {', '.join(job_analysis_dict['preferred_skills'])}")
    
    if 'responsibilities' in job_analysis_dict:
        query_parts.append(f"Responsibilities: {', '.join(job_analysis_dict['responsibilities'])}")
    
    if 'qualifications' in job_analysis_dict:
        query_parts.append(f"Qualifications: {', '.join(job_analysis_dict['qualifications'])}")
    
    if 'keywords' in job_analysis_dict:
        query_parts.append(f"Keywords: {', '.join(job_analysis_dict['keywords'])}")
    
    query = "\n".join(query_parts)
    
    # Search for relevant information
    results = vector_db.search(query, k=k)
    
    return results, job_analysis_dict

def generate_cv(personal_info, job_description):
    """Generate an ATS-friendly CV based on personal info and job description."""
    # Create or load vector database
    vector_db_path = "vector_db.json"
    if os.path.exists(vector_db_path):
        vector_db = VectorDB.load(vector_db_path)
    else:
        vector_db = create_vector_db_from_personal_info(personal_info)
    
    # Analyze job description
    job_analysis = analyze_job_description(job_description)
    
    # Find relevant information
    relevant_info, job_analysis_dict = find_relevant_info(vector_db, job_analysis)
    
    # Prepare context for CV generation
    context = {
        "personal_details": personal_info.get("personal_details", {}),
        "job_analysis": job_analysis_dict,
        "relevant_info": relevant_info
    }
    
    # Generate CV using OpenAI
    prompt = f"""
    Create an ATS-friendly CV based on the following information:
    
    JOB DESCRIPTION ANALYSIS:
    {json.dumps(job_analysis_dict, indent=2)}
    
    PERSONAL DETAILS:
    {json.dumps(personal_info.get('personal_details', {}), indent=2)}
    
    RELEVANT EXPERIENCE AND Skills:
    {json.dumps([item['text'] for item in relevant_info], indent=2)}
    
    INSTRUCTIONS:
    1. Format the CV to match EXACTLY the following structure:
       - Name at the top
       - Contact information (Portfolio, LinkedIn, Mobile Number, Github, Email) in two columns below the name
       - Sections in this order: Experience, Projects, Education, Publications (if relevant), Certifications, Extracurricular Activities (if relevant), Research Experience (if relevant), Skills
    
    2. For each experience and project:
       - Title and position on one line
       - Company/project details in italics on the next line (include location if available)
       - Bullet points for achievements and responsibilities
    
    3. Use bullet points (•) for listing achievements, responsibilities, and skills
    
    4. In listing skills, use a structured format e.g.:
        Programming: Python, SQL,...
        Frameworks & Libraries: TensorFlow, PyTorch,...
        Cloud Platforms: Google Cloud AI,...
        Machine Learning Techniques: LLM Fine-tuning,...
        Dev Tools: Git, CI/CD,...
        .
        .
        .

    5. Only include information that is relevant to the job description
    
    6. Adapt the wording to align with the job description keywords without fabricating information
    
    7. Format the output as plain text with proper spacing and formatting that can be converted to PDF

    8. Output the CV and the CV only, no extra texts, no summary, no explanation, no comments, no code blocks, no markdown, no HTML, no LaTeX, just the CV in plain text format.
    
    9. IMPORTANT: For all links (certificates, portfolio, LinkedIn, etc.), use Markdown format: [Link Text](URL)
       For example: [LangChain for LLM Application Development](https://learn.deeplearning.ai/langchain)
       This ensures only the certificate name is visible and clickable in the final PDF.
    """
    
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "You are an expert CV writer who creates tailored, ATS-friendly CVs. Your task is to create a CV that matches EXACTLY the format specified, highlighting the candidate's relevant experience and skills for the specific job they're applying for. Do not fabricate information, but adapt the wording to align with the job description keywords."},
            {"role": "user", "content": prompt}
        ]
    )
    
    return response.choices[0].message.content

def save_cv(cv, file_path="Tarek Ashraf.pdf"):
    """Save the generated CV to a PDF file."""
    # First save as text for reference
    text_file_path = "generated_cv.txt"
    with open(text_file_path, 'w') as file:
        file.write(cv)
    print(f"CV text saved to {text_file_path}")
    
    # Convert to PDF
    pdf_path = convert_text_to_pdf(cv, file_path)
    print(f"CV PDF saved to {pdf_path}")
    
    return pdf_path

def main():
    print("CV Generator AI Agent")
    print("=====================")
    
    # Load or create personal information
    personal_info = load_personal_info()
    
    # Get job description
    job_description = get_job_description()
    
    # Generate CV
    cv = generate_cv(personal_info, job_description)
    
    # Save CV
    pdf_path = save_cv(cv)
    
    print("\nCV generated successfully!")
    print(f"You can find your ATS-friendly CV in the file '{pdf_path}'")

if __name__ == "__main__":
    main()