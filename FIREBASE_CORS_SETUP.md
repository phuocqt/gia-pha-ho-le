# Cài CORS cho Firebase Storage

## B1: Cài Firebase CLI
```bash
npm install -g firebase-tools
```

## B2: Login vào Firebase
```bash
firebase login
```

## B3: Triên khai file CORS
Chay lênh sau trong thu muc goc project:
```bash
gsutil cors set cors.json gs://your-project-id.appspot.com
```

Thay `your-project-id` bang project ID cua ban.

## B4: Kiêm tra cau hinh CORS
```bash
gsutil cors get gs://your-project-id.appspot.com
```

## Luu y:
- Cân có Google Cloud SDK và gsutil cài dat
- File `cors.json` da duoc tao san trong project
- Sau khi cau hinh, cân wait vài phút de có hieu luc

## Cau hinh Security Rules cho Firebase Storage:
Trong Firebase Console > Storage > Rules, thêm:
```
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
