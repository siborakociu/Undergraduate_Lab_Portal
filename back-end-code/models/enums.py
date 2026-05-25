import enum


class UserRole(str, enum.Enum):
    STUDENT = "STUDENT"
    PROFESSOR = "PROFESSOR"
    HR_STAFF = "HR_STAFF"
    ADMIN = "ADMIN"


class PositionStatus(str, enum.Enum):
    OPEN = "OPEN"
    CLOSED = "CLOSED"
    FILLED = "FILLED"


class ApplicationStatus(str, enum.Enum):
    SUBMITTED = "SUBMITTED"
    UNDER_REVIEW = "UNDER_REVIEW"
    ACCEPTED = "ACCEPTED"
    REJECTED = "REJECTED"
    WITHDRAWN = "WITHDRAWN"


class ProgramStatus(str, enum.Enum):
    DRAFT = "DRAFT"
    PUBLISHED = "PUBLISHED"
    CLOSED = "CLOSED"


class LabStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    INACTIVE = "INACTIVE"
    SUSPENDED = "SUSPENDED"


class FundingStatus(str, enum.Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"


class StipendStatus(str, enum.Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    PROCESSED = "PROCESSED"
    REJECTED = "REJECTED"


class DocumentType(str, enum.Enum):
    RESUME = "RESUME"
    TRANSCRIPT = "TRANSCRIPT"
    COVER_LETTER = "COVER_LETTER"
    RECOMMENDATION = "RECOMMENDATION"
    OTHER = "OTHER"
