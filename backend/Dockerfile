FROM python:3.9-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    libgcc1 \
    git \
    && rm -rf /var/lib/apt/lists/*

RUN pip install --upgrade pip

COPY requirements.txt /app
RUN pip install --no-cache-dir -r requirements.txt

COPY . /app

EXPOSE 8080

CMD ["waitress-serve", "--host=0.0.0.0", "--port=8080", "app:app"]
