from fastapi import APIRouter, Depends

from app.core.dependencies import get_auth_service
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse, UserOut
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=TokenResponse)
async def login(dto: LoginRequest, svc: AuthService = Depends(get_auth_service)):
    return await svc.login(dto)


@router.post("/register", response_model=UserOut, status_code=201)
async def register(dto: RegisterRequest, svc: AuthService = Depends(get_auth_service)):
    return await svc.register(dto)


@router.post("/logout")
async def logout(token: str, svc: AuthService = Depends(get_auth_service)):
    await svc.invalidate_session(token)
    return {"detail": "logged out"}
