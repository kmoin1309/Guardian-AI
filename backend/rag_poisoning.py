import os
import re
import math
import hashlib
import numpy as np
from typing import Dict, List, Optional, Tuple
from datetime import datetime
from dataclasses import dataclass, field, asdict


# ──────────────────────────────────────────────────────
# Data Classes
# ──────────────────────────────────────────────────────

@dataclass
class DocumentChunk:
    content: str
    source: str
    chunk_id: str = ""
    is_poisoned: bool = False
    poison_type: Optional[str] = None
    embedding: Optional[List[float]] = None

    def __post_init__(self):
        if not self.chunk_id:
            self.chunk_id = hashlib.md5(
                f"{self.source}:{self.content[:50]}".encode()
            ).hexdigest()[:12]


@dataclass
class DetectionResult:
    chunk_id: str
    content_preview: str
    source: str
    perplexity_score: float
    similarity_score: float
    is_suspicious: bool
    verdict: str  # "clean", "suspicious", "poisoned", "critical"
    matched_patterns: List[str] = field(default_factory=list)
    risk_level: str = "low"

    def to_dict(self):
        return asdict(self)


@dataclass
class MitigationResult:
    total_chunks: int
    blocked_chunks: int
    passed_chunks: int
    blocked_details: List[Dict] = field(default_factory=list)
    applied_filters: List[str] = field(default_factory=list)

    def to_dict(self):
        return asdict(self)


# ──────────────────────────────────────────────────────
# Blocked patterns (from the original lab)
# ──────────────────────────────────────────────────────

BLOCKED_PATTERNS = [
    "ignore all previous", "ignore previous", "disregard previous", "forget previous",
    "override previous", "bypass previous", "new directive", "critical directive",
    "you are now", "now you are", "from now on", "developer mode", "dan mode",
    "jailbreak", "unrestricted", "no restrictions", "do anything now", "never refuse",
    "leak", "secret flag", "admin password", "private key", "secret",
    "ignore all", "ignore any", "disregard all", "follow only my", "system override"
]

POISON_TYPE_PATTERNS = {
    "injection": [
        r"ignore (all )?previous",
        r"critical directive",
        r"new directive",
        r"system override",
        r"you are now",
        r"from now on",
        r"developer mode",
        r"dan mode",
        r"do anything now",
    ],
    "bias": [
        r"always respond with",
        r"only for (large|small)",
        r"don'?t need",
        r"biased information",
        r"never mention",
    ],
    "leakage": [
        r"leak this",
        r"secret[:\s]",
        r"stored unencrypted",
        r"admin password",
        r"private key",
        r"confidential",
        r"do not share",
    ],
    "exfiltration": [
        r"print (all |your )?system prompt",
        r"reveal (your |the )?configuration",
        r"show me (all |your )?(database|secrets|keys)",
        r"export (all )?(data|users|credentials)",
    ],
    "backdoor": [
        r"if user asks.*then respond",
        r"when.*trigger.*execute",
        r"secret (command|keyword|phrase):",
        r"hidden (instruction|directive)",
    ]
}


# ──────────────────────────────────────────────────────
# RAG Poisoning Lab Engine
# ──────────────────────────────────────────────────────

class RAGPoisoningLab:
    """
    Manages a simulated RAG knowledge base with attack, detection,
    and mitigation capabilities.
    """

    def __init__(self):
        self.clean_docs: List[DocumentChunk] = []
        self.poisoned_docs: List[DocumentChunk] = []
        self.active_kb: List[DocumentChunk] = []  # current working KB
        self.is_poisoned: bool = False
        self.mitigations_active: Dict[str, bool] = {
            "keyword_filter": False,
            "similarity_filter": False,
            "perplexity_filter": False,
        }
        self.attack_log: List[Dict] = []
        self.detection_log: List[Dict] = []
        self.mitigation_log: List[Dict] = []
        self._avg_clean_embedding: Optional[np.ndarray] = None

        # Load documents on init
        self._load_documents()

    def _load_documents(self):
        """Load clean and poisoned documents from disk."""
        base = os.path.dirname(os.path.abspath(__file__))

        # ── Clean docs ──
        clean_path = os.path.join(base, "rag_lab_documents", "clean")
        if os.path.exists(clean_path):
            for fname in sorted(os.listdir(clean_path)):
                fp = os.path.join(clean_path, fname)
                if os.path.isfile(fp):
                    try:
                        with open(fp, "r", encoding="utf-8") as f:
                            text = f.read()
                        # Chunk at 1000 chars with 200 overlap (like the original lab)
                        chunks = [text[i:i+1000] for i in range(0, len(text), 800)]
                        for c in chunks:
                            if c.strip():
                                self.clean_docs.append(
                                    DocumentChunk(
                                        content=c.strip(),
                                        source=fname,
                                        is_poisoned=False
                                    )
                                )
                    except Exception:
                        pass

        # ── Poisoned docs ──
        poison_path = os.path.join(base, "rag_lab_documents", "poisoned")
        if os.path.exists(poison_path):
            for fname in sorted(os.listdir(poison_path)):
                fp = os.path.join(poison_path, fname)
                if os.path.isfile(fp):
                    try:
                        with open(fp, "r", encoding="utf-8") as f:
                            text = f.read()
                        poison_type = self._detect_poison_type(text)
                        self.poisoned_docs.append(
                            DocumentChunk(
                                content=text.strip(),
                                source=fname,
                                is_poisoned=True,
                                poison_type=poison_type
                            )
                        )
                    except Exception:
                        pass

        # Initialize active KB with clean docs
        self.active_kb = list(self.clean_docs)

    def _detect_poison_type(self, text: str) -> str:
        """Classify what type of poisoning a text contains."""
        text_lower = text.lower()
        scores = {}
        for ptype, patterns in POISON_TYPE_PATTERNS.items():
            count = sum(1 for p in patterns if re.search(p, text_lower))
            if count > 0:
                scores[ptype] = count
        if scores:
            return max(scores, key=scores.get)
        return "unknown"

    # ──────────────────────────────────────────────────────
    # STATUS
    # ──────────────────────────────────────────────────────

    def get_status(self) -> Dict:
        """Get current lab status."""
        return {
            "clean_documents": len(self.clean_docs),
            "poisoned_documents": len(self.poisoned_docs),
            "active_kb_size": len(self.active_kb),
            "is_poisoned": self.is_poisoned,
            "mitigations": self.mitigations_active,
            "total_attacks": len(self.attack_log),
            "total_detections": len(self.detection_log),
            "total_mitigations": len(self.mitigation_log),
            "available_payloads": [
                {
                    "name": doc.source,
                    "type": doc.poison_type,
                    "preview": doc.content[:100] + ("..." if len(doc.content) > 100 else ""),
                    "size": len(doc.content)
                }
                for doc in self.poisoned_docs
            ],
            "clean_doc_list": list(set(d.source for d in self.clean_docs)),
        }

    # ──────────────────────────────────────────────────────
    # ATTACK — Poison the KB
    # ──────────────────────────────────────────────────────

    def execute_poison_attack(self, payload_name: Optional[str] = None, custom_payload: Optional[str] = None) -> Dict:
        """
        Execute a poisoning attack on the knowledge base.
        Uses either a pre-built payload or a custom one.
        """
        result = {
            "success": False,
            "payload_used": None,
            "poison_type": None,
            "chunks_injected": 0,
            "blocked_by_mitigation": False,
            "mitigation_details": None,
            "timestamp": datetime.utcnow().isoformat()
        }

        # Determine payload
        if custom_payload:
            poison_type = self._detect_poison_type(custom_payload)
            poison_chunk = DocumentChunk(
                content=custom_payload.strip(),
                source="custom_payload.txt",
                is_poisoned=True,
                poison_type=poison_type
            )
            result["payload_used"] = "custom"
            result["poison_type"] = poison_type
        elif payload_name:
            matching = [d for d in self.poisoned_docs if d.source == payload_name]
            if not matching:
                result["error"] = f"Payload '{payload_name}' not found"
                return result
            poison_chunk = matching[0]
            result["payload_used"] = payload_name
            result["poison_type"] = poison_chunk.poison_type
        else:
            result["error"] = "No payload specified"
            return result

        # Check mitigations
        if self.mitigations_active.get("keyword_filter"):
            blocked = self._apply_keyword_filter([poison_chunk])
            if not blocked:
                result["blocked_by_mitigation"] = True
                result["mitigation_details"] = "Keyword filter blocked this payload"
                self.attack_log.append(result)
                return result

        # Inject into active KB
        self.active_kb.append(poison_chunk)
        self.is_poisoned = True
        result["success"] = True
        result["chunks_injected"] = 1
        result["active_kb_size"] = len(self.active_kb)

        self.attack_log.append(result)
        return result

    # ──────────────────────────────────────────────────────
    # QUERY — Simulate RAG retrieval
    # ──────────────────────────────────────────────────────

    def query_rag(self, query: str, top_k: int = 5) -> Dict:
        """
        Simulate a RAG query. Uses simple keyword matching for retrieval
        (no FAISS/embeddings required for hackathon demo).
        """
        if not self.active_kb:
            return {
                "query": query,
                "results": [],
                "context": "",
                "poisoned_chunks_retrieved": 0,
                "warning": "Knowledge base is empty"
            }

        # Simple relevance scoring (TF-IDF-like keyword matching)
        query_terms = set(query.lower().split())
        scored = []
        for chunk in self.active_kb:
            content_lower = chunk.content.lower()
            # Count matching terms
            score = sum(1 for term in query_terms if term in content_lower)
            # Boost for longer matches
            score += sum(
                2 for term in query_terms
                if len(term) > 3 and term in content_lower
            )
            scored.append((score, chunk))

        # Sort by relevance
        scored.sort(key=lambda x: x[0], reverse=True)
        top_chunks = scored[:top_k]

        retrieved = []
        poisoned_count = 0
        for score, chunk in top_chunks:
            if chunk.is_poisoned:
                poisoned_count += 1
            retrieved.append({
                "content": chunk.content,
                "source": chunk.source,
                "relevance_score": score,
                "is_poisoned": chunk.is_poisoned,
                "poison_type": chunk.poison_type,
                "chunk_id": chunk.chunk_id
            })

        context = "\n\n".join(c["content"] for c in retrieved)

        return {
            "query": query,
            "results": retrieved,
            "context": context,
            "total_retrieved": len(retrieved),
            "poisoned_chunks_retrieved": poisoned_count,
            "warning": f"⚠️ {poisoned_count} poisoned chunk(s) retrieved!" if poisoned_count > 0 else None,
            "is_kb_poisoned": self.is_poisoned
        }

    # ──────────────────────────────────────────────────────
    # DETECT — Analyze chunks for poisoning
    # ──────────────────────────────────────────────────────

    def detect_poisoning(self, text: Optional[str] = None, scan_full_kb: bool = False) -> Dict:
        """
        Detect poisoning using pattern matching and simulated perplexity/similarity scoring.
        Can analyze a single text or scan the entire active KB.
        """
        results = []

        if text:
            # Analyze single text input
            result = self._analyze_chunk(
                DocumentChunk(content=text, source="user_input")
            )
            results.append(result.to_dict())
        elif scan_full_kb:
            # Scan all chunks in active KB
            for chunk in self.active_kb:
                result = self._analyze_chunk(chunk)
                results.append(result.to_dict())

        # Summary
        suspicious_count = sum(1 for r in results if r["is_suspicious"])
        critical_count = sum(1 for r in results if r["verdict"] == "critical")
        poisoned_count = sum(1 for r in results if r["verdict"] == "poisoned")

        detection_entry = {
            "timestamp": datetime.utcnow().isoformat(),
            "chunks_scanned": len(results),
            "suspicious": suspicious_count,
            "critical": critical_count,
            "poisoned": poisoned_count,
        }
        self.detection_log.append(detection_entry)

        return {
            "scan_results": results,
            "summary": {
                "total_scanned": len(results),
                "clean": len(results) - suspicious_count,
                "suspicious": suspicious_count - critical_count - poisoned_count,
                "poisoned": poisoned_count,
                "critical": critical_count,
            },
            "timestamp": datetime.utcnow().isoformat()
        }

    def _analyze_chunk(self, chunk: DocumentChunk) -> DetectionResult:
        """Analyze a single chunk for poisoning indicators."""
        content = chunk.content
        content_lower = content.lower()

        # ── Pattern matching ──
        matched_patterns = []
        for pattern in BLOCKED_PATTERNS:
            if pattern in content_lower:
                matched_patterns.append(pattern)

        # Also check regex patterns
        for ptype, patterns in POISON_TYPE_PATTERNS.items():
            for p in patterns:
                if re.search(p, content_lower):
                    matched_patterns.append(f"{ptype}:{p}")

        # ── Simulated perplexity ──
        # Real perplexity would use GPT-2; we simulate based on text characteristics
        perplexity = self._calculate_simulated_perplexity(content)

        # ── Simulated similarity to clean KB ──
        similarity = self._calculate_simulated_similarity(content)

        # ── Determine verdict ──
        is_suspicious = False
        verdict = "clean"
        risk_level = "low"

        if len(matched_patterns) >= 3 or (perplexity > 100 and similarity < 0.50):
            verdict = "critical"
            is_suspicious = True
            risk_level = "critical"
        elif len(matched_patterns) >= 1 or perplexity > 80 or similarity < 0.60:
            verdict = "poisoned"
            is_suspicious = True
            risk_level = "high"
        elif perplexity > 60 or similarity < 0.70:
            verdict = "suspicious"
            is_suspicious = True
            risk_level = "medium"

        return DetectionResult(
            chunk_id=chunk.chunk_id,
            content_preview=content[:200] + ("..." if len(content) > 200 else ""),
            source=chunk.source,
            perplexity_score=round(perplexity, 2),
            similarity_score=round(similarity, 4),
            is_suspicious=is_suspicious,
            verdict=verdict,
            matched_patterns=list(set(matched_patterns)),
            risk_level=risk_level
        )

    def _calculate_simulated_perplexity(self, text: str) -> float:
        """
        Simulate perplexity scoring. Real implementation would use GPT-2.
        High perplexity = unnatural text, likely adversarial.
        """
        if len(text.strip()) < 15:
            return 0.0

        score = 30.0  # baseline for clean text
        text_lower = text.lower()

        # Adversarial markers increase perplexity
        adversarial_markers = [
            "ignore", "override", "directive", "jailbreak", "system prompt",
            "admin", "password", "secret", "leak", "bypass", "unrestricted",
            "dan mode", "developer mode", "do anything now"
        ]
        for marker in adversarial_markers:
            if marker in text_lower:
                score += 15.0

        # All caps increases perplexity
        caps_ratio = sum(1 for c in text if c.isupper()) / max(len(text), 1)
        score += caps_ratio * 50

        # Special characters density
        special_chars = sum(1 for c in text if c in "[]{}()<>|\\!@#$%^&*")
        special_ratio = special_chars / max(len(text), 1)
        score += special_ratio * 80

        # Very short or unusually structured text
        words = text.split()
        if len(words) < 10:
            score += 10

        # Repetitive patterns
        unique_ratio = len(set(words)) / max(len(words), 1)
        if unique_ratio < 0.5:
            score += 20

        return min(score, 300.0)

    def _calculate_simulated_similarity(self, text: str) -> float:
        """
        Simulate cosine similarity to clean KB average embedding.
        Real implementation would use nomic-embed-text via Ollama.
        Returns value between 0.0 and 1.0.
        """
        text_lower = text.lower()

        # Clean cybersecurity vocabulary
        clean_vocab = {
            "security", "encryption", "firewall", "network", "authentication",
            "vulnerability", "malware", "phishing", "password", "compliance",
            "threat", "protection", "scanning", "monitoring", "detection",
            "incident", "response", "backup", "patch", "update", "audit",
            "access", "control", "data", "system", "risk", "attack",
            "defense", "policy", "standard", "framework", "encrypt",
            "decrypt", "vpn", "ids", "ips", "siem", "wpa", "ssl", "tls"
        }

        # Count clean vocabulary matches
        words = set(re.findall(r'[a-z]+', text_lower))
        clean_matches = len(words & clean_vocab)
        total_words = max(len(words), 1)
        base_similarity = min(clean_matches / total_words * 2.5, 0.95)

        # Poisoned indicators reduce similarity
        poison_penalty = 0.0
        for pattern in BLOCKED_PATTERNS:
            if pattern in text_lower:
                poison_penalty += 0.12

        similarity = max(base_similarity - poison_penalty, 0.05)

        # Add small noise for realistic variation
        import random
        noise = random.uniform(-0.03, 0.03)
        similarity = max(0.05, min(0.98, similarity + noise))

        return similarity

    # ──────────────────────────────────────────────────────
    # MITIGATE — Apply defense filters
    # ──────────────────────────────────────────────────────

    def apply_mitigations(self, keyword_filter: bool = True, similarity_filter: bool = False, perplexity_filter: bool = False) -> MitigationResult:
        """Apply mitigation filters and rebuild the active KB."""
        self.mitigations_active = {
            "keyword_filter": keyword_filter,
            "similarity_filter": similarity_filter,
            "perplexity_filter": perplexity_filter,
        }

        original_count = len(self.active_kb)
        filtered_kb = list(self.active_kb)
        blocked_details = []
        applied_filters = []

        # ── Keyword filter ──
        if keyword_filter:
            applied_filters.append("keyword_filter")
            passed = []
            for chunk in filtered_kb:
                content_lower = chunk.content.lower()
                blocking_patterns = [p for p in BLOCKED_PATTERNS if p in content_lower]
                if blocking_patterns:
                    blocked_details.append({
                        "chunk_id": chunk.chunk_id,
                        "source": chunk.source,
                        "preview": chunk.content[:100],
                        "matched_patterns": blocking_patterns,
                        "filter": "keyword"
                    })
                else:
                    passed.append(chunk)
            filtered_kb = passed

        # ── Perplexity filter ──
        if perplexity_filter:
            applied_filters.append("perplexity_filter")
            passed = []
            for chunk in filtered_kb:
                perp = self._calculate_simulated_perplexity(chunk.content)
                if perp > 100:
                    blocked_details.append({
                        "chunk_id": chunk.chunk_id,
                        "source": chunk.source,
                        "preview": chunk.content[:100],
                        "perplexity": round(perp, 2),
                        "filter": "perplexity"
                    })
                else:
                    passed.append(chunk)
            filtered_kb = passed

        # ── Similarity filter ──
        if similarity_filter:
            applied_filters.append("similarity_filter")
            passed = []
            for chunk in filtered_kb:
                sim = self._calculate_simulated_similarity(chunk.content)
                if sim < 0.50:
                    blocked_details.append({
                        "chunk_id": chunk.chunk_id,
                        "source": chunk.source,
                        "preview": chunk.content[:100],
                        "similarity": round(sim, 4),
                        "filter": "similarity"
                    })
                else:
                    passed.append(chunk)
            filtered_kb = passed

        # Update active KB
        self.active_kb = filtered_kb
        blocked_count = original_count - len(filtered_kb)

        # Check if KB is now clean
        self.is_poisoned = any(c.is_poisoned for c in self.active_kb)

        result = MitigationResult(
            total_chunks=original_count,
            blocked_chunks=blocked_count,
            passed_chunks=len(filtered_kb),
            blocked_details=blocked_details,
            applied_filters=applied_filters
        )

        self.mitigation_log.append({
            "timestamp": datetime.utcnow().isoformat(),
            **result.to_dict()
        })

        return result

    def _apply_keyword_filter(self, chunks: List[DocumentChunk]) -> List[DocumentChunk]:
        """Apply keyword filter to a list of chunks. Returns passing chunks."""
        passed = []
        for chunk in chunks:
            content_lower = chunk.content.lower()
            if not any(p in content_lower for p in BLOCKED_PATTERNS):
                passed.append(chunk)
        return passed

    # ──────────────────────────────────────────────────────
    # RESET
    # ──────────────────────────────────────────────────────

    def reset_kb(self) -> Dict:
        """Reset the knowledge base to clean state."""
        self.active_kb = list(self.clean_docs)
        self.is_poisoned = False
        self.mitigations_active = {
            "keyword_filter": False,
            "similarity_filter": False,
            "perplexity_filter": False,
        }
        return {
            "status": "reset",
            "active_kb_size": len(self.active_kb),
            "is_poisoned": False,
            "message": "Knowledge base reset to clean state"
        }

    def disable_mitigations(self) -> Dict:
        """Turn off all mitigations (to allow poisoning)."""
        self.mitigations_active = {
            "keyword_filter": False,
            "similarity_filter": False,
            "perplexity_filter": False,
        }
        return {
            "status": "disabled",
            "mitigations": self.mitigations_active,
            "message": "All mitigations disabled — poisoning will now succeed"
        }

    # ──────────────────────────────────────────────────────
    # LOGS
    # ──────────────────────────────────────────────────────

    def get_attack_log(self) -> List[Dict]:
        return self.attack_log

    def get_detection_log(self) -> List[Dict]:
        return self.detection_log

    def get_mitigation_log(self) -> List[Dict]:
        return self.mitigation_log

    def get_all_logs(self) -> Dict:
        return {
            "attacks": self.attack_log,
            "detections": self.detection_log,
            "mitigations": self.mitigation_log
        }


# ──────────────────────────────────────────────────────
# Singleton instance
# ──────────────────────────────────────────────────────
_lab_instance: Optional[RAGPoisoningLab] = None


def get_rag_poisoning_lab() -> RAGPoisoningLab:
    """Get or create the singleton RAG Poisoning Lab instance."""
    global _lab_instance
    if _lab_instance is None:
        _lab_instance = RAGPoisoningLab()
    return _lab_instance
