from openai import OpenAI
import os
from dotenv import load_dotenv
load_dotenv()

client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

def get_job_description():
    """Get job description from user input."""
    choice = input("Enter job description (1) from file or (2) directly: ")
    
    if choice == "1":
        file_path = input("Enter the path to the job description file: ")
        with open(file_path, 'r') as file:
            return file.read()
    else:
        print("Enter the job description (type 'END' on a new line when finished):")
        lines = []
        while True:
            line = input()
            if line == "END":
                break
            lines.append(line)
        return "\n".join(lines)

def analyze_job_description(job_description):
    """Analyze job description to extract key requirements and skills."""
    response = client.chat.completions.create(
        model=os.environ.get("MODEL_NAME"),
        messages=[
            {"role": "system", "content": "Analyze the job description and extract key information. Format the output as JSON with the following fields: job_title, required_skills (array), preferred_skills (array), responsibilities (array), qualifications (array), keywords (array of important terms)."},
            {"role": "user", "content": job_description}
        ],
        response_format={"type": "json_object"}
    )
    
    return response.choices[0].message.content