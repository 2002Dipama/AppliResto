#!/usr/bin/env bash
set -o errexit

pip install -r requirements.txt

cd ../frontend
npm install
npm run build
cd ../backend

python manage.py collectstatic --noinput
python manage.py migrate
