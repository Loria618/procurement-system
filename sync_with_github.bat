@echo off
echo Synchronizing code with GitHub...

REM Add all changes to the staging area
git add .

REM Commit changes with a message
git commit -m "Updated code"

REM Push changes to GitHub
git push origin master

echo Code synchronized successfully!
pause