import numpy as np
import faiss
import json
import os
import io
from openai import OpenAI
from dotenv import load_dotenv
load_dotenv()

client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))


class VectorDB:
    def __init__(self, dimension=1536):
        """Initialize the vector database with the specified dimension."""
        self.dimension = dimension
        self.index = faiss.IndexFlatL2(dimension)
        self.texts = []
        self.metadata = []
    
    def add_texts(self, texts, metadata=None):
        """Add texts to the vector database with optional metadata."""
        if metadata is None:
            metadata = [{} for _ in texts]
        
        embeddings = []
        for text in texts:
            embedding = self._get_embedding(text)
            embeddings.append(embedding)
        
        embeddings_np = np.array(embeddings).astype('float32')
        self.index.add(embeddings_np)
        
        self.texts.extend(texts)
        self.metadata.extend(metadata)
    
    def search(self, query, k=5):
        """Search for similar texts to the query."""
        query_embedding = self._get_embedding(query)
        query_embedding_np = np.array([query_embedding]).astype('float32')
        
        distances, indices = self.index.search(query_embedding_np, k)
        
        results = []
        for i, idx in enumerate(indices[0]):
            if idx != -1 and idx < len(self.texts):
                results.append({
                    'text': self.texts[idx],
                    'metadata': self.metadata[idx],
                    'score': float(distances[0][i])
                })
        
        return results
    
    def _get_embedding(self, text):
        """Get embedding for a text using OpenAI API."""
        response = client.embeddings.create(
            model="text-embedding-3-small",
            input=text
        )
        return response.data[0].embedding
    
    def save(self, file_path="generated\\vector_db.json"):
        """Save the vector database to a file."""
        # Write the index to a temporary file
        temp_index_path = "temp_index.faiss"
        faiss.write_index(self.index, temp_index_path)
        
        # Read the binary data from the temporary file
        with open(temp_index_path, 'rb') as f:
            index_binary = f.read()
        
        # Remove the temporary file
        os.remove(temp_index_path)
        
        # Convert binary data to hex string for JSON storage
        index_hex = index_binary.hex()
        
        data = {
            'texts': self.texts,
            'metadata': self.metadata,
            'embeddings': index_hex,
            'dimension': self.dimension
        }
        
        with open(file_path, 'w') as file:
            json.dump(data, file)
    
    @classmethod
    def load(cls, file_path="generated\\vector_db.json"):
        """Load a vector database from a file."""
        if not os.path.exists(file_path):
            return None
        
        with open(file_path, 'r') as file:
            data = json.load(file)
        
        # Get dimension from saved data or use default
        dimension = data.get('dimension', 1536)
        db = cls(dimension=dimension)
        db.texts = data['texts']
        db.metadata = data['metadata']
        
        # Convert hex string back to binary data
        binary_data = bytes.fromhex(data['embeddings'])
        
        # Write binary data to a temporary file
        temp_index_path = "temp_index.faiss"
        with open(temp_index_path, 'wb') as f:
            f.write(binary_data)
        
        # Read the index from the temporary file
        db.index = faiss.read_index(temp_index_path)
        
        # Remove the temporary file
        os.remove(temp_index_path)
        
        return db

def create_vector_db_from_personal_info(personal_info):
    """Create a vector database from personal information."""
    db = VectorDB()
    
    texts = []
    metadata = []
    
    # Add skills
    for skill in personal_info.get('skills', []):
        texts.append(f"Skill: {skill}")
        metadata.append({'type': 'skill'})
    
    # Add experience
    for job in personal_info.get('experience', []):
        job_text = f"Job Title: {job.get('title')}\nCompany: {job.get('company')}\nDates: {job.get('dates')}\nDescription: {job.get('description')}"
        texts.append(job_text)
        metadata.append({'type': 'experience', 'job': job})
    
    # Add education
    for edu in personal_info.get('education', []):
        edu_text = f"Institution: {edu.get('institution')}\nDegree: {edu.get('degree')}\nDates: {edu.get('dates')}\nDescription: {edu.get('description')}"
        texts.append(edu_text)
        metadata.append({'type': 'education', 'education': edu})
    
    # Add projects
    for project in personal_info.get('projects', []):
        project_text = f"Project: {project.get('title')}\nDescription: {project.get('description')}\nTechnologies: {', '.join(project.get('technologies', []))}"
        texts.append(project_text)
        metadata.append({'type': 'project', 'project': project})
    
    # Add certifications
    for cert in personal_info.get('certifications', []):
        texts.append(f"Certification: {cert}")
        metadata.append({'type': 'certification'})
    
    # Add summary
    if 'summary' in personal_info:
        texts.append(f"Summary: {personal_info['summary']}")
        metadata.append({'type': 'summary'})
    
    db.add_texts(texts, metadata)
    db.save()
    
    return db