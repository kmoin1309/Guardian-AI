from sqlalchemy import create_engine, Column, String, DateTime, Boolean, ForeignKey, Text, Integer, Float
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime
import uuid
import os

# Neon PostgreSQL Connection
SQLALCHEMY_DATABASE_URL = 'postgresql://neondb_owner:npg_SWm8dOK5xvMs@ep-mute-boat-ahrcdtyd-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'

engine = create_engine(SQLALCHEMY_DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Helper function to generate UUIDs
def generate_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=False), primary_key=True, default=generate_uuid)
    email = Column(String(255), unique=True, index=True, nullable=False)
    username = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    llm_models = relationship("LLMModel", back_populates="owner", cascade="all, delete-orphan")
    scan_sessions = relationship("ScanSession", back_populates="owner", cascade="all, delete-orphan")

class LLMModel(Base):
    """TABLE 2: llm_models - Stores user-connected LLM details for personalization"""
    __tablename__ = "llm_models"
    
    id = Column(UUID(as_uuid=False), primary_key=True, default=generate_uuid)
    user_id = Column(UUID(as_uuid=False), ForeignKey("users.id"), nullable=False)
    
    # Model identification
    model_name = Column(String(255), nullable=False)  # GPT-4, LLaMA, Custom
    model_type = Column(String(50), nullable=False)   # Chatbot / RAG / Agent
    
    # Connection details
    endpoint_url = Column(Text, nullable=False)
    auth_type = Column(String(50), nullable=False)    # API key / none / bearer
    api_key = Column(String(500), nullable=True)      # Encrypted in production
    
    # Validation & health
    is_validated = Column(Boolean, default=False)
    health_status = Column(String(50), default="pending")  # healthy / unhealthy / pending
    last_health_check = Column(DateTime, nullable=True)
    
    # Metadata
    model_metadata = Column(Text, nullable=True)  # JSON for additional config
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationship
    owner = relationship("User", back_populates="llm_models")

class ScanSession(Base):
    """TABLE 3: scan_sessions - Stores each security scan session"""
    __tablename__ = "scan_sessions"
    
    id = Column(UUID(as_uuid=False), primary_key=True, default=generate_uuid)
    model_id = Column(UUID(as_uuid=False), ForeignKey("llm_models.id"), nullable=False)
    user_id = Column(UUID(as_uuid=False), ForeignKey("users.id"), nullable=False)
    
    # Scan details
    prompt_text = Column(Text, nullable=False)
    status = Column(String(50), default="running")  # running / completed
    action_taken = Column(String(50), nullable=True)  # ALLOW / BLOCK / TRANSFORM
    
    # Results
    is_malicious = Column(Boolean, default=False)
    risk_score = Column(Integer, default=0)  # 0-100
    threats_detected = Column(Text, nullable=True)  # JSON array
    sanitized_prompt = Column(Text, nullable=True)  # If transformed
    
    # Timing
    start_time = Column(DateTime, default=datetime.utcnow)
    end_time = Column(DateTime, nullable=True)
    total_tests = Column(Integer, default=0)
    
    # Metadata
    detection_details = Column(Text, nullable=True)  # JSON with reasons
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationship
    owner = relationship("User", back_populates="scan_sessions")


class RAGDocument(Base):
    """TABLE 4: rag_documents - Stores uploaded RAG documents with trust scores"""
    __tablename__ = "rag_documents"

    id = Column(UUID(as_uuid=False), primary_key=True, default=generate_uuid)
    user_id = Column(UUID(as_uuid=False), ForeignKey("users.id"), nullable=False)

    # Document info
    filename = Column(String(500), nullable=False)
    file_hash = Column(String(64), nullable=False)
    file_size = Column(Integer, default=0)
    content_type = Column(String(100), nullable=True)
    source_type = Column(String(100), default="API Upload")

    # Security results
    trust_score = Column(Float, default=100.0)
    risk_level = Column(String(20), default="LOW")        # LOW / MEDIUM / HIGH / CRITICAL
    action_taken = Column(String(20), default="ALLOW")     # ALLOW / WARN / QUARANTINE / BLOCK
    signature_status = Column(String(20), default="verified")  # verified / signed / invalid / pending
    safe_to_index = Column(Boolean, default=True)

    # Scan details (JSON)
    threats_detected = Column(Text, nullable=True)  # JSON array
    owasp_categories = Column(Text, nullable=True)  # JSON array
    scan_details = Column(Text, nullable=True)       # Full JSON scan result
    extracted_text_length = Column(Integer, default=0)

    # Timestamps
    upload_date = Column(DateTime, default=datetime.utcnow)
    last_scanned = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)


class RAGAnomaly(Base):
    """TABLE 5: rag_anomalies - Tracks detected RAG anomalies"""
    __tablename__ = "rag_anomalies"

    id = Column(UUID(as_uuid=False), primary_key=True, default=generate_uuid)
    user_id = Column(UUID(as_uuid=False), ForeignKey("users.id"), nullable=False)

    # Anomaly info
    anomaly_type = Column(String(100), nullable=False)       # e.g. "Injection Cluster #4"
    severity = Column(String(20), nullable=False)            # CRITICAL / WARNING / ACTIVE / INFO
    description = Column(Text, nullable=True)
    status = Column(String(20), default="active")            # active / investigating / quarantined / resolved

    # Linked document (optional)
    document_id = Column(UUID(as_uuid=False), ForeignKey("rag_documents.id"), nullable=True)

    # Timestamps
    detected_at = Column(DateTime, default=datetime.utcnow)
    resolved_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


# Create all tables
Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
