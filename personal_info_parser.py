import os
import json
from openai import OpenAI
from dotenv import load_dotenv
load_dotenv()

client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

def parse_text_file(file_path):
    """Parse a text file containing personal information."""
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"File not found: {file_path}")
    with open(file_path, 'r', encoding='utf-8') as file:
        content = file.read()
    return content

def extract_structured_info(text):
    """Use OpenAI to extract structured information from text."""
    response = client.chat.completions.create(
        model=os.environ.get("MODEL_NAME"),
        messages=[
            {"role": "system", "content": "Extract structured information from the following text. Format the output as JSON with the following fields: personal_details (name, email, portfolio, phone, linkedIn, github), skills, experience (array of jobs with title, company, dates, description), education (array of degrees with institution, degree, dates, description, thesis), certifications(title, url, issuer, year), languages, projects (array with title, description, technologies), research papers."},
            {"role": "user", "content": text}
        ],
        response_format={"type": "json_object"}
    )
    
    return json.loads(response.choices[0].message.content)

def load_personal_info_from_file(file_path):
    """Load and structure personal information from a text file."""
    text = parse_text_file(file_path)
    return extract_structured_info(text)

def save_personal_info(personal_info, file_path="generated\\personal_info.json"):
    """Save structured personal information to a JSON file."""
    with open(file_path, 'w') as file:
        json.dump(personal_info, file, indent=2)

def load_personal_info(file_path="generated\\personal_info.json"):
    """Load personal information from a JSON file or create new."""
    if os.path.exists(file_path):
        with open(file_path, 'r') as file:
            return json.load(file)
    else:
        print("No existing personal information found.")
        file_path = input("Enter the path to your personal information text file: ")
        personal_info = load_personal_info_from_file(file_path)
        save_personal_info(personal_info)
        return personal_info