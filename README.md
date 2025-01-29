# Offline Çeviri Platformu

Bu proje, çevrimdışı (offline) çalışan bir çeviri platformudur. Farklı yeterliliklerde **4 farklı NLP modeli** kullanarak çeviri yapar. Modellerin tamamı **lokal olarak indirilmeli** ve **container içine mount edilmelidir**.

## 🚀 Kurulum ve Kullanım

Aşağıdaki adımları takip ederek platformu çalıştırabilirsiniz.

### 1️⃣ Gereksinimler

Aşağıdaki araçların sisteminizde kurulu olması gerekmektedir:
- Docker & Docker Compose
- Python 3.10+
- pip
- Git

### 2️⃣ Projeyi Klonlayın
```bash
 git clone <repo-url>
 cd terc-man
```

### 3️⃣ Modelleri İndirin

Modelleri indirmek için aşağıdaki komutu çalıştırın:
```bash
bash download_models.sh
```
Bu script, gerekli modelleri indirerek **models/** klasörüne yerleştirecektir.

### 4️⃣ Docker Image'i Oluşturun ve Çalıştırın

Docker ile servisi ayağa kaldırmak için aşağıdaki komutu çalıştırabilirsiniz:
```bash
docker-compose up --build -d
```
Bu adımda:
- Servis container'ı oluşturulacak
- Modeller image içine mount edilecek
- API servisi başlatılacak

### 5️⃣ API Kullanımı

Çalışan servise aşağıdaki gibi görüntüleyebilirsiniz:
```bash
http://localhost:3000
```


## 📂 Proje Yapısı
```
├── backend/
├── frontend/
├── models/                                             # NLP modelleri burada saklanacak
├── model_scripts/                                      # Model scriptleri
│   ├── download_helsinki_nlp_mul_eng.py        
│   ├── download_m2m100.py 
|   ├── download_mbart50.py 
|   └── download_nllb.py
├── docker-compose.yml
├── README.md
├── .env
└── download_models.sh                                  # Modelleri indirmek için çalıştırılacak executable
```