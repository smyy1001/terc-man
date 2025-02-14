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

### 2️⃣ Projeyi Klonlayın ve Bir Docker Network Oluşturun
```bash
 git clone <repo-url>
 cd terc-man
 docker network create tercuman-network
```

### 3️⃣ MinIO'yu Çalıştırın

Bu adım için aynı dizindeki minio/ klasörüne bakınız ve README.md'sindeki adımları tek tek uygulayınız. Oradaki tüm süreç tamamlanmadan sonraki adıma geçmeyiniz!


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
http://<ip>:3000
```

### 6️⃣ Sağlık Kontorlü

Tüm modellerin çalışır halde olup olmadığını aşağıdaki gibi görüntüleyebilirsiniz:
```bash
http://<ip>:8080/health
```
