import os
import pyarrow.parquet as pq

file_goc = "D:\\Project_DeepLearning\\public_db\\data_final_part_1.parquet"  # Thay bằng tên file của bạn
file_preview = "preview.parquet"
dung_luong_muc_tieu_bytes = 100 * 1024 * 1024  # 100 MB tương đương bytes

# Mở kết nối tới file gốc
parquet_file = pq.ParquetFile(file_goc)

# Lấy cấu trúc dữ liệu (Schema) từ file gốc
schema = parquet_file.schema.to_arrow_schema()

# Bắt đầu đọc và ghi dữ liệu theo luồng
with pq.ParquetWriter(file_preview, schema, compression='snappy') as writer:
    # Đọc dữ liệu theo từng block (batch) khoảng 50.000 dòng để tiết kiệm RAM
    for batch in parquet_file.iter_batches(batch_size=50000):
        writer.write_batch(batch)
        
        # Kiểm tra dung lượng file preview hiện tại trên ổ cứng
        dung_luong_hien_tai = os.path.getsize(file_preview)
        
        # Nếu đạt hoặc vượt quá 100MB thì dừng lại
        if dung_luong_hien_tai >= dung_luong_muc_tieu_bytes:
            print(f"Đã trích xuất thành công!")
            print(f"File preview lưu tại: {file_preview}")
            print(f"Dung lượng thực tế: {dung_luong_hien_tai / (1024*1024):.2f} MB")
            break
