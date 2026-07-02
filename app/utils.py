from fastapi import HTTPException, status


def bearer_token_from_header(authorization: str) -> str:
    scheme, _, token = authorization.partition(" ")
    if scheme.lower() != "bearer" or not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header must be in the format: Bearer <token>.",
        )
    return token
