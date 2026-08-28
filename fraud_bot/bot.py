"""
bot.py
Fraud Shield Bot – Telegram bot phát hiện tin nhắn lừa đảo.
Dùng python-telegram-bot v20+ (async).
"""

import logging
from telegram import Update
from telegram.ext import (
    ApplicationBuilder,
    CommandHandler,
    MessageHandler,
    ContextTypes,
    filters,
)
from predictor import predict

# ──────────────────────────────────────────────
# CONFIG
# ──────────────────────────────────────────────
BOT_TOKEN = "8612418913:AAFqlsm9wBg-lCermTme2DET1jFtghSuGkI"   # @BotFather 

# ──────────────────────────────────────────────
# Logging
# ──────────────────────────────────────────────
logging.basicConfig(
    format  = "%(asctime)s | %(levelname)s | %(name)s | %(message)s",
    level   = logging.INFO,
)
logger = logging.getLogger(__name__)


# ──────────────────────────────────────────────
# Handler: /start
# ──────────────────────────────────────────────
async def start_handler(update: Update, context: ContextTypes.DEFAULT_TYPE):
    name = update.effective_user.first_name or "bạn"
    text = (
        f"👋 Xin chào *{name}*\\!\n\n"
        "🛡️ Tôi là *Fraud Shield Bot* — trợ lý phát hiện tin nhắn lừa đảo "
        "tích hợp trí tuệ nhân tạo AI\\.\n\n"
        "📋 *Cách dùng:*\n"
        "Chỉ cần *copy\\-paste* đoạn tin nhắn bạn nghi ngờ vào đây\\. "
        "Tôi sẽ phân tích và cho bạn biết có phải lừa đảo không\\.\n\n"
        "Gõ /help để xem thêm hướng dẫn\\."
    )
    await update.message.reply_text(text, parse_mode="MarkdownV2")


# ──────────────────────────────────────────────
# Handler: /help
# ──────────────────────────────────────────────
async def help_handler(update: Update, context: ContextTypes.DEFAULT_TYPE):
    text = (
        "ℹ️ *Hướng dẫn sử dụng Fraud Shield Bot*\n\n"
        "1\\. Copy đoạn tin nhắn bạn nghi ngờ \\(từ Zalo, Facebook, SMS\\.\\.\\.\\)\n"
        "2\\. Paste vào chat này và gửi\n"
        "3\\. Bot sẽ trả về:\n"
        "   • CLEAN hoặc SCAM\n"
        "   • Độ tự tin của mô hình \\(\\%\\)\n"
        "   • Xác suất từng nhãn\n\n"
        "⚠️ *Lưu ý:* Kết quả chỉ mang tính tham khảo\\. "
        "Hãy luôn cẩn thận với các yêu cầu chuyển tiền, "
        "cung cấp mật khẩu hoặc thông tin cá nhân\\."
    )
    await update.message.reply_text(text, parse_mode="MarkdownV2")


# ──────────────────────────────────────────────
# Handler: Tin nhắn văn bản thường
# ──────────────────────────────────────────────
async def message_handler(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user_text = update.message.text.strip()

    if len(user_text) < 2:
        await update.message.reply_text("Vui lòng gửi đoạn tin nhắn dài hơn để tôi phân tích.")
        return

    # Báo đang xử lý (nếu model chậm)
    await context.bot.send_chat_action(
        chat_id=update.effective_chat.id,
        action="typing"
    )

    # Gọi model
    result = predict(user_text)

    label      = result["label"]
    label_text = result["label_text"]
    confidence = result["confidence"]
    prob_scam  = result["prob_scam"] * 100
    prob_safe  = result["prob_safe"] * 100
    has_url    = result["has_url"]

    # Thanh progress bằng emoji
    filled = round(confidence / 10)
    bar    = "█" * filled + "░" * (10 - filled)

    url_note = "*Phát hiện URL trong tin nhắn*\n" if has_url else ""

    # Màu sắc theo nhãn
    if label == 1:  # SCAM
        header  = "🚨 *KẾT QUẢ: SCAM*"
        warning = "\n⚠️ _Hãy cẩn thận\\! Đừng chuyển tiền hay cung cấp thông tin cá nhân\\._"
    else:           # CLEAN
        header  = "✅ *KẾT QUẢ: CLEAN*"
        warning = "\n💡 _Tin nhắn có vẻ bình thường, nhưng vẫn cảnh giác nhé\\!_"

    # Sửa bố cục hiển thị
    reply = (
        f"{header}\n"
        f"Độ tự tin: `{confidence:.1f}%` `{bar}`\n\n"
        f"📊 *Chi tiết tỷ lệ:*\n"
        f"• Lừa đảo : `{prob_scam:.1f}%`\n"
        f"• An toàn : `{prob_safe:.1f}%`\n\n"
        f"{url_note}"
        f"{warning}"
    )

    await update.message.reply_text(reply, parse_mode="MarkdownV2")

    # Log ra terminal để theo dõi
    logger.info(
        "User=%s | Label=%s | Conf=%.1f%% | Text='%s'",
        update.effective_user.id,
        label_text,
        confidence,
        user_text,
    )


# ──────────────────────────────────────────────
# Main
# ──────────────────────────────────────────────
def main():
    logger.info("Khởi động Fraud Shield Bot...")
    app = ApplicationBuilder().token(BOT_TOKEN).build()

    app.add_handler(CommandHandler("start", start_handler))
    app.add_handler(CommandHandler("help",  help_handler))
    app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, message_handler))

    logger.info("Bot đang chạy. Nhấn Ctrl+C để dừng.")
    app.run_polling(allowed_updates=Update.ALL_TYPES)


if __name__ == "__main__":
    main()