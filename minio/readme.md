# Restore Docker Volume from Backup

## **Overview**
This guide explains how to restore a Docker volume from a `.tar.gz` backup and start a service using `docker-compose`.

---

## **Steps to Restore the Volume**

### **1. Create the Docker Volume**
Run the following command to create a new volume:

```bash
docker volume create minio_tercuman_data
```

### **2. Find the Volume's Mount Path**
Check where Docker stores the volume:

```bash
docker volume inspect minio_tercuman_data
```

Look for the **"Mountpoint"** field in the output, which should be something like:

```
"Mountpoint": "/var/lib/docker/volumes/minio_tercuman_data/_data"
```

### **3. Extract the Backup Directly to the Docker Volume**
Run the following command to extract the `.tar.gz` backup **directly** into the volume:

```bash
sudo tar -xzf minio_data_backup.tar.gz -C /var/lib/docker/volumes/minio_tercuman_data/_data/
```

Ensure the correct ownership and permissions:

```bash
sudo chown -R 1000:1000 /var/lib/docker/volumes/minio_tercuman_data/_data
```

### **4. Start the MinIO Service**
Navigate to the directory containing the `docker-compose.yml` file and start the service:

```bash
docker-compose up -d --build
```

---

## **Verification**
Once the container is running, verify that the data is restored:

- Access the MinIO web UI: [http://localhost:9001](http://localhost:9001)
- Log in with the credentials (if default):
  - **Username:** `admin`
  - **Password:** `admin123`
- Or check with the MinIO Client (`mc`):
  
  ```bash
  mc alias set local http://localhost:9000 admin admin123
  mc ls local
  ```

---

## **Troubleshooting**
- **Permission Denied Errors**: Try running the commands with `sudo`.
- **Volume Not Found**: Ensure the volume name in `docker-compose.yml` matches the created volume.
- **Missing Data**: Check if the backup was created correctly by listing its contents:
  
  ```bash
  tar -tzf minio_data_backup.tar.gz
  ```

