Thư mục chứa PDF để import hàng loạt

1. Copy tối đa 10 file .pdf vào đây (hoặc đặt ở thư mục khác).
2. Từ thư mục BE chạy:

   node seed-reports-from-pdf-files.cjs

   Hoặc chỉ định thư mục / giới hạn số file:

   node seed-reports-from-pdf-files.cjs "D:\Duong\dan\pdfs"
   node seed-reports-from-pdf-files.cjs --limit=5

3. Cần: node seed-demo-data.cjs (trước), Redis, MinIO, DB đúng .env.
4. Sau đó chạy worker Python để xử lý hàng đợi pdf_processing_queue.
