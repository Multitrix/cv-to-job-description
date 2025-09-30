"""Mock Firebase for testing when service account key is not available"""
from datetime import datetime
import json
import os

class MockDocument:
    def __init__(self, data=None, exists=True):
        self.data = data or {}
        self.exists = exists
        self.id = "mock_doc_id"

    def to_dict(self):
        return self.data

    def get(self):
        return self

class MockOrderedCollection:
    def __init__(self, collection):
        self.collection = collection

    def stream(self):
        return self.collection.stream()

class MockCollection:
    def __init__(self):
        self.documents = {}

    def document(self, doc_id):
        return MockDocumentRef(doc_id, self)

    def add(self, data):
        doc_id = f"mock_{len(self.documents)}"
        doc_ref = MockDocumentRef(doc_id, self)
        self.documents[doc_id] = data
        return datetime.utcnow(), doc_ref

    def order_by(self, field, direction='ASCENDING'):
        return MockOrderedCollection(self)

    def stream(self):
        for doc_id, data in self.documents.items():
            doc = MockDocument(data)
            doc.id = doc_id
            yield doc

class MockDocumentRef:
    def __init__(self, doc_id, collection):
        self.id = doc_id
        self.collection = collection

    def get(self):
        data = self.collection.documents.get(self.id)
        return MockDocument(data, exists=data is not None)

    def set(self, data):
        self.collection.documents[self.id] = data

    def update(self, data):
        if self.id in self.collection.documents:
            self.collection.documents[self.id].update(data)

    def collection(self, name):
        if not hasattr(self, '_subcollections'):
            self._subcollections = {}
        if name not in self._subcollections:
            self._subcollections[name] = MockCollection()
        return self._subcollections[name]

class MockFirestore:
    def __init__(self):
        self.collections = {}

    def collection(self, name):
        if name not in self.collections:
            self.collections[name] = MockCollection()
        return self.collections[name]

class MockFirebaseManager:
    _instance = None
    _db = None

    def __new__(cls, *args, **kwargs):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._db = MockFirestore()
        return cls._instance

    def get_firestore_client(self):
        return self._db