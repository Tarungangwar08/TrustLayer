@echo off
echo Killing processes on port 3000 and 5000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000 ^| findstr LISTENING') do taskkill /F /PID %%a 2>nul
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5000 ^| findstr LISTENING') do taskkill /F /PID %%a 2>nul
echo Done. Ports 3000 and 5000 are free. (Postgres on 5433 is left to Docker; native PG on 5432 untouched.)
