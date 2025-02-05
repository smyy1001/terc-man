FROM python:3.9-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    libgcc1 && \
    rm -rf /var/lib/apt/lists/*

# RUN pip install flask transformers torch sentencepiece flask-cors protobuf

COPY requirements.txt /app

RUN pip install --no-cache-dir -r requirements.txt


COPY . /app.py

ENV FLASK_APP=app.py

EXPOSE 8080

CMD ["python", "app.py"]
