```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp company_portal/.env.example company_portal/.env
python manage.py migrate
python manage.py runserver 127.0.0.1:8001
```

