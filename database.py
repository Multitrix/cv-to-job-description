import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore # For Cloud Firestore
from firebase_admin import db # For Realtime Database


class FirebaseManager:
        _instance = None
        _db = None # To store the Firestore client

        def __new__(cls, *args, **kwargs):
            if cls._instance is None:
                cls._instance = super().__new__(cls)
                # Initialize Firebase Admin SDK
                cred = credentials.Certificate("cv-generator-45805-firebase-adminsdk-fbsvc-a96ee39b37.json")
                firebase_admin.initialize_app(cred)
                cls._db = firestore.client()
            return cls._instance

        def get_firestore_client(self):
            return self._db