# 🛡️ Telegram Scam Detection System (End-to-End Deep Learning Pipeline)

![Python](https://www.python.org/)
![PyTorch](https://pytorch.org/)
![Telegram Bot API](https://core.telegram.org/bots)
![Git LFS](https://git-lfs.github.com/)

Hệ thống phát hiện tin nhắn và hành vi lừa đảo trực tuyến trên nền tảng Telegram, được xây dựng theo quy trình Machine Learning/Deep Learning 
khép kín (End-to-End Pipeline) từ trích xuất dữ liệu, tiền xử lý, huấn luyện mô hình phân loại văn bản đến đóng gói và triển khai ứng dụng 
Telegram Bot phục vụ người dùng theo thời gian thực.
---
## 📌 Tổng quan kiến trúc & Quy trình (Pipeline Workflow)
```text
[ Telegram Data / Chat Logs ]
│
▼
ETL & Data Processing  ──► Trích xuất dữ liệu (Telegram etl pipeline.ipynb) & lọc trùng lặp (loctrunglap.ipynb)
│
▼
Custom Tokenization    ──► Tokenizer xử lý văn bản tiếng Việt (Byte-Pair Encoding / BPE)
│
▼
Deep Learning Training ──► Fine-tuning mô hình ngôn ngữ (scam_detection_training.ipynb)
│
▼
Model Evaluation       ──► Đánh giá Loss, Accuracy, Precision-Recall Curve, ROC-AUC, Confusion Matrix
│
▼
Deployment / Bot API   ──► Triển khai Real-time Inference Engine qua Telegram Bot (fraud_bot/)
```
---
## 📂 Cấu trúc dự án (Repository Structure)
```text
├── checkpoints_results/       # Checkpoints mô hình đã huấn luyện (.pt) & biểu đồ đánh giá (ROC-AUC, PR Curve, CM)
├── fraud_bot/                 # Ứng dụng Telegram Bot và bộ module dự đoán thời gian thực (Inference Engine)
│   ├── bot.py                 # Luồng điều khiển Bot nhận/phản hồi tin nhắn
│   └── predictor.py           # Tiền xử lý input và load mô hình dự đoán nhãn lừa đảo
├── tokenizer/                 # Bộ từ điển và tokenizer (vocab.txt, bpe.codes)
├── tokenized/                 # Tập dữ liệu sau khi tokenize dạng Arrow/Parquet
├── Telegram etl pipeline.ipynb# Quy trình trích xuất và tiền xử lý dữ liệu Telegram
├── scam_detection_training.ipynb # Kịch bản huấn luyện và tinh chỉnh (Fine-tuning) mô hình
└── README.md
```
📊 Kết quả đánh giá mô hình (Model Performance)
Mô hình được đánh giá toàn diện trên tập kiểm thử thông qua các chỉ số:
Precision - Recall Curve: Đo lường khả năng bắt chính xác tin nhắn rác/lừa đảo mà không làm ảnh hưởng tin nhắn thường.
ROC-AUC: Đo lường phân tách giữa lớp nhãn Scam và Normal.
Confusion Matrix & Training Metrics: Chi tiết tại thư mục checkpoints_results/.

🚀 Hướng dẫn cài đặt & Chạy ứng dụng
# 1. Yêu cầu môi trường
Python 3.12+


Git LFS (để pull các file weights model nặng)
# 2. Cài đặt thư viện
Clone repository
`git clone https://github.com/tabang205/Scam-detection`
`cd Scam-detection`
Tải weights model dung lượng lớn qua Git LFS
`git lfs pull`
Cài đặt dependencies
`pip install -r requirements.txt`
# 3. Cấu hình biến môi trường
Tạo file .env tại thư mục gốc:
`TELEGRAM_BOT_TOKEN="your_telegram_bot_token_here"`
# 4. Khởi chạy Bot
`python fraud_bot/bot.py`
