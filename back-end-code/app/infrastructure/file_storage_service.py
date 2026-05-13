import os
import shutil
import uuid
from pathlib import Path
from uuid import UUID

from fastapi import UploadFile


class FileStorageService:
    def __init__(self, storage_path: str):
        self.storage_path = Path(storage_path)
        self.storage_path.mkdir(parents=True, exist_ok=True)

    async def store_file(self, file: UploadFile) -> str:
        ext = Path(file.filename).suffix if file.filename else ""
        file_id = uuid.uuid4()
        dest = self.storage_path / f"{file_id}{ext}"
        with dest.open("wb") as f:
            shutil.copyfileobj(file.file, f)
        return str(dest)

    async def delete_file(self, file_url: str) -> None:
        path = Path(file_url)
        if path.exists():
            path.unlink()

    async def get_file_url(self, file_id: UUID) -> str:
        matches = list(self.storage_path.glob(f"{file_id}*"))
        return str(matches[0]) if matches else ""

    def validate_file_size(self, file: UploadFile, max_mb: int = 5) -> bool:
        file.file.seek(0, os.SEEK_END)
        size = file.file.tell()
        file.file.seek(0)
        return size <= max_mb * 1024 * 1024
