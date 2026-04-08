# Hướng dẫn cài đặt Image Compression

## B1: Cài đặt thư viện
```bash
npm install browser-image-compression
# hoặc
yarn add browser-image-compression
```

## B2: Khởi động lại development server
```bash
npm run dev
# hoặc
yarn dev
```

## B3: Test chức năng nén ảnh

Chức năng nén ảnh đã được tích hợp với các tính năng sau:

### Cấu hình nén:
- **Kích thước tối đa**: 30KB (0.03MB)
- **Kích thước ảnh**: Tối đa 800px (chiều rộng hoặc chiều cao)
- **Chất lượng**: 70% (0.7)
- **Định dạng**: JPEG
- **Sử dụng Web Worker**: Có (để không block UI)

### Log thông tin:
- Log kích thước file gốc
- Log kích thước file sau khi nén
- Log tỷ lệ nén (%)

### Hiển thị cho user:
- Loading spinner trong lúc nén và upload
- Toast thông báo lỗi chi tiết
- Preview ảnh ngay sau khi chọn

## B4: Kiểm tra trong Console

Mở browser console để xem:
```
Starting avatar upload...
Original file size: 2048576 bytes
Compressed file size: 28456 bytes
Compression ratio: 98.61%
Storage ref created: [StorageReference]
Upload bytes completed
Download URL obtained: [URL]
```

## Lợi ích:
- Giảm dung lượng lưu trữ trên Firebase
- Tăng tốc độ upload và download
- Tiết kiệm băng thông cho user
- Giữ chất lượng ảnh chấp nhận được

## Lưu ý:
- Chỉ nén khi file > 30KB
- Nếu file < 30KB, vẫn được nén nhẹ để tối ưu
- Hỗ trợ tất cả định dạng ảnh phổ biến (JPG, PNG, WebP)
