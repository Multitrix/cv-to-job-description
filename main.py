import os
import sys
from personal_info_parser import load_personal_info
from job_analyzer import get_job_description
from cv_generator import generate_cv, save_cv
from dotenv import load_dotenv

load_dotenv()

def check_api_key():
    """Check if OpenAI API key is set."""
    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        print("Error: OPENAI_API_KEY environment variable is not set.")
        print("Please set your OpenAI API key using:")
        print("  export OPENAI_API_KEY='your-api-key'  # For Linux/Mac")
        print("  set OPENAI_API_KEY=your-api-key  # For Windows")
        return False
    return True

def check_dependencies():
    """Check if required packages are installed."""
    try:
        import openai
        import faiss
        import numpy
        import reportlab
        return True
    except ImportError as e:
        print(f"Error: Missing required package - {e.name}")
        print("Please install required packages using:")
        print("  pip install -r requirements.txt")
        return False

def main():
    print("\n=== ATS-Friendly CV Generator ===\n")
    
    # Check dependencies
    if not check_dependencies():
        sys.exit(1)
    
    # Check API key
    if not check_api_key():
        sys.exit(1)
    
    # Load or create personal information
    print("Step 1: Loading personal information...")
    personal_info = load_personal_info()
    print("Personal information loaded successfully!\n")
    
    # Get job description
    print("Step 2: Getting job description...")
    job_description = get_job_description()
    print("Job description loaded successfully!\n")
    
    # Generate CV
    print("Step 3: Generating ATS-friendly CV...")
    print("This may take a moment as the AI analyzes your information and the job description...")
    cv = generate_cv(personal_info, job_description)
    
    # Save CV
    print("\nStep 4: Saving generated CV...")
    pdf_path = save_cv(cv, "generated\\Tarek Ashraf.pdf")
    
    print("\n=== Process Complete ===")
    print("Your ATS-friendly CV has been generated successfully!")
    print(f"You can find it in the file '{pdf_path}'")
    print("\nGood luck with your job application!")

if __name__ == "__main__":
    main()