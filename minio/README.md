# Minio Çalıştırma ve Modelleri Yükleme

## 1️⃣ MinIO'yu Çalıştırın

Bu klasörün içerisinde aşağıdaki komutu çalıştırın:

```bash
 docker compose up --build
```

## 2️⃣ Modelleri Yükleme

Minio'nun ayağı kalktığına emin olduktan sonra (tarayıcıdan kontrol edebilirsiniz: http://localhost:9001 ) aşağıdaki komutu çalıştırınız:

> DİKKAT! upload_models.sh dosyasını çalıştırmadan önce içerisindeki <PATH_TO_...> ile belirtilen noktaları modellerin bilgisayarınızdaki gerçek konumları ile değiştirmeyi unutmayınız!

```bash
 chmod +x upload_models.sh
 ./upload_models.sh
```

> Windows makinede çalıştıracaksanız, ./upload_models.sh dosyasının formatını LF olduğundan emin olun!

## 3️⃣ Modellerin Yüklendiğinden Emin Olun

Tarayıcınızdan http://localhost:9001 adresine giderek modellerin yüklendiğine emin olunuz.