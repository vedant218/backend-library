from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from modules.auth.routes import router as auth_router
from modules.librarian.routes import router as librarian_router
from modules.member.routes import router as member_router

app = FastAPI(
    title = "Library Management System"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://famous-kataifi-e3edcb.netlify.app/","http://127.0.0.1:5501" ,],  # Add your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

origins = [
    "http://localhost:3000",  # Adjust the port if your frontend runs on a different one
    "http://127.0.0.1:5500/",
    "http://127.0.0.1:5501/",
    "https://famous-kataifi-e3edcb.netlify.app/"
]

app.include_router(auth_router)
app.include_router(librarian_router)
app.include_router(member_router)
