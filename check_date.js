const fs = require('fs');

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

tasks.forEach((task, index) => {
    const startDate = new Date(task.startDate);
    startDate.setHours(0, 0, 0, 0);
    
    let isMatch = false;

    // PHÂN LOẠI LOGIC KIỂM TRA
    if (task.type === 'yearly') {
        // KIỂM TRA HÀNG NĂM: Chỉ so sánh Tháng và Ngày
        const todayMonth = today.getMonth();
        const todayDate = today.getDate();
        const startMonth = startDate.getMonth();
        const startDateNum = startDate.getDate();

        console.log(`[Task ${index + 1}] Loại: Hàng năm | Cài đặt: Ngày ${startDateNum}/${startMonth + 1}`);
        
        if (todayMonth === startMonth && todayDate === startDateNum) {
            isMatch = true;
        }

    } else {
        // KIỂM TRA CHU KỲ: Tính toán số ngày trôi qua
        const diffTime = today - startDate;
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        console.log(`[Task ${index + 1}] Loại: Chu kỳ | Bắt đầu: ${task.startDate} | Đã qua: ${diffDays} ngày`);

        if (diffDays >= 0 && diffDays % task.cycleLength === 0) {
            isMatch = true;
        }
    }

    // GỬI THÔNG BÁO NẾU TRÙNG KHỚP
    if (isMatch) {
        console.log(`  => ⏰ MATCH! Đang gửi thông báo: "${task.message}"`);
        
        fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: task.message })
        })
        .then(res => {
            if (res.ok) console.log('  => ✅ Gửi thành công!');
        })
        .catch(err => console.error('  => ❌ Lỗi mạng:', err));
    } else {
        console.log(`  => 💤 Chưa đến ngày.`);
    }
});