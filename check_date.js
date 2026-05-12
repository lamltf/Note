const fs = require('fs');

// Đọc file config.json (Bây giờ nó là một mảng - Array)
let tasks = [];
try {
    tasks = JSON.parse(fs.readFileSync('./config.json', 'utf8'));
} catch (error) {
    console.error('❌ Lỗi không đọc được file config.json:', error.message);
    process.exit(1);
}

const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

if (!webhookUrl) {
    console.error('❌ Lỗi: Chưa tìm thấy DISCORD_WEBHOOK_URL trong biến môi trường.');
    process.exit(1);
}

const today = new Date();
today.setHours(0, 0, 0, 0);
console.log(`\n📅 Đang kiểm tra lịch cho ngày: ${today.toISOString().split('T')[0]}`);
console.log(`Tìm thấy ${tasks.length} tasks trong cấu hình.\n`);

// Chạy vòng lặp kiểm tra từng task
tasks.forEach((task, index) => {
    const startDate = new Date(task.startDate);
    startDate.setHours(0, 0, 0, 0);

    const diffTime = today - startDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    console.log(`[Task ${index + 1}] Bắt đầu: ${task.startDate} | Chu kỳ: ${task.cycleLength} ngày | Đã qua: ${diffDays} ngày`);

    // Điều kiện: Đã đến hạn hoặc quá hạn VÀ chia hết cho số ngày chu kỳ
    if (diffDays >= 0 && diffDays % task.cycleLength === 0) {
        console.log(`  => ⏰ MATCH! Đang gửi thông báo: "${task.message}"`);

        fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: task.message })
        })
            .then(res => {
                if (res.ok) console.log('  => ✅ Gửi thành công!');
                else console.error('  => ❌ Gửi thất bại, mã lỗi:', res.status);
            })
            .catch(err => console.error('  => ❌ Lỗi kết nối mạng:', err));
    } else {
        console.log(`  => 💤 Chưa đến ngày.`);
    }
});