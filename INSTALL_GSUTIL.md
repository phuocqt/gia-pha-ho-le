# Cài đặt gsutil cho Windows

## Cách 1: Cài Google Cloud SDK (Khuyến khích)

1. **Tải Google Cloud SDK:**
   - Truy cập: https://cloud.google.com/sdk/docs/install
   - Tải phiên bản cho Windows
   - Giải nén và chạy `google-cloud-sdk/install.bat`

2. **Khởi động lại terminal** sau khi cài xong

3. **Xác minh cài đặt:**
   ```bash
   gcloud version
   gsutil version
   ```

## Cách 2: Sử dụng Firebase CLI (Đơn giản hơn)

Thay vì dùng gsutil, bạn có thể dùng Firebase CLI để cấu hình Storage:

1. **Mở Firebase Console:**
   - Vào: https://console.firebase.google.com
   - Chọn project: `dev-gia-pha-ho-le-3e8eb`
   - Vào Storage > Rules

2. **Thêm Security Rules:**
   ```javascript
   rules_version = '2';
   service firebase.storage {
     match /b/{bucket}/o {
       match /avatars/{allPaths=**} {
         allow read: if true;
         allow write: if request.auth != null;
       }
     }
   }
   ```

3. **Cấu hình CORS trong Firebase Console:**
   - Vào Storage > File browser
   - Upload file `cors.json` trực tiếp
   Hoặc sử dụng Firebase CLI:
   ```bash
   firebase deploy --only storage
   ```

## Cách 3: Cài gsutil riêng lẻ

Nếu chỉ cần gsutil:
```bash
# Tải gsutil riêng
curl https://storage.googleapis.com/pub/gsutil.tar.gz | tar -xz
# Thêm vào PATH
export PATH=$PATH:$(pwd)/gsutil
```

## Kiểm tra sau khi cài:

```bash
# Kiểm tra gsutil
gsutil version

# Thiết lập CORS
gsutil cors set cors.json gs://dev-gia-pha-ho-le-3e8eb.firebasestorage.app

# Kiểm tra cấu hình
gsutil cors get gs://dev-gia-pha-ho-le-3e8eb.firebasestorage.app
```
