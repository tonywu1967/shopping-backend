const sgMail = require('@sendgrid/mail');

// Initialize SendGrid with API key from environment variable
// SET SENDGRID_API_KEY in Zeabur environment variables
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@chic-shopping.com';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'tonywu1967@gmail.com';

// Send order confirmation to customer
async function sendOrderConfirmation(order, customerEmail) {
  if (!process.env.SENDGRID_API_KEY) {
    console.log('⚠️ SendGrid API Key 未設定，略過發送確認信');
    return false;
  }

  const msg = {
    to: customerEmail,
    from: FROM_EMAIL,
    subject: `【CHIC】訂單 ${order.orderNumber} 確認信件`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #1a1a1a; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0; letter-spacing: 5px;">CHIC</h1>
        </div>
        <div style="padding: 30px;">
          <h2 style="color: #333;">親愛的顧客您好，</h2>
          <p>感謝您的訂單！以下是您的訂單詳情：</p>
          
          <div style="background: #f8f8f8; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <p><strong>訂單編號：</strong> ${order.orderNumber}</p>
            <p><strong>訂單金額：</strong> <span style="color: #c9a96e; font-size: 18px;">$${order.totalAmount.toLocaleString()}</span></p>
            <p><strong>收件人：</strong> ${order.shippingInfo.name}</p>
            <p><strong>聯絡電話：</strong> ${order.shippingInfo.phone}</p>
            <p><strong>配送地址：</strong> ${order.shippingInfo.city} ${order.shippingInfo.address} ${order.shippingInfo.zipCode || ''}</p>
          </div>
          
          <h3>訂購商品</h3>
          <ul style="list-style: none; padding: 0;">
            ${order.items.map(item => `
              <li style="padding: 10px 0; border-bottom: 1px solid #eee;">
                ${item.name} x${item.quantity} - $${(item.price * item.quantity).toLocaleString()}
              </li>
            `).join('')}
          </ul>
          
          <div style="text-align: right; margin-top: 20px;">
            <p style="font-size: 18px;"><strong>總計：</strong> <span style="color: #c9a96e;">$${order.totalAmount.toLocaleString()}</span></p>
          </div>
          
          <p style="margin-top: 30px; color: #666;">我們將在確認訂單後盡快為您安排出貨。</p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          
          <p style="color: #999; font-size: 12px; text-align: center;">
            CHIC 時尚購物 © 2026<br>
            如有問題，請聯繫我們的客服團隊
          </p>
        </div>
      </div>
    `
  };

  try {
    await sgMail.send(msg);
    console.log('✅ 訂單確認信已發送至:', customerEmail);
    return true;
  } catch (error) {
    console.error('❌ 發送失敗:', error?.response?.body?.errors || error.message);
    return false;
  }
}

// Send new order notification to admin
async function sendNewOrderNotification(order) {
  if (!process.env.SENDGRID_API_KEY) {
    console.log('⚠️ SendGrid API Key 未設定，略過發送管理員通知');
    return false;
  }

  const msg = {
    to: ADMIN_EMAIL,
    from: FROM_EMAIL,
    subject: `🛒 新訂單！ ${order.orderNumber} - $${order.totalAmount.toLocaleString()}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #c9a96e; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">🛒 新訂單通知</h1>
        </div>
        <div style="padding: 30px;">
          <h2>您有一筆新訂單！</h2>
          
          <div style="background: #f8f8f8; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <p><strong>訂單編號：</strong> ${order.orderNumber}</p>
            <p><strong>訂單金額：</strong> <span style="color: #c9a96e; font-size: 18px;">$${order.totalAmount.toLocaleString()}</span></p>
            <p><strong>會員 Email：</strong> ${order.userId?.email || 'N/A'}</p>
            <p><strong>收件人：</strong> ${order.shippingInfo.name}</p>
            <p><strong>聯絡電話：</strong> ${order.shippingInfo.phone}</p>
            <p><strong>配送地址：</strong> ${order.shippingInfo.city} ${order.shippingInfo.address} ${order.shippingInfo.zipCode || ''}</p>
            <p><strong>下單時間：</strong> ${new Date(order.createdAt).toLocaleString('zh-TW')}</p>
          </div>
          
          <h3>訂購商品</h3>
          <ul style="list-style: none; padding: 0;">
            ${order.items.map(item => `
              <li style="padding: 10px 0; border-bottom: 1px solid #eee;">
                ${item.name} x${item.quantity} - $${(item.price * item.quantity).toLocaleString()}
              </li>
            `).join('')}
          </ul>
          
          <div style="text-align: right; margin-top: 20px;">
            <p style="font-size: 18px;"><strong>總計：</strong> <span style="color: #c9a96e;">$${order.totalAmount.toLocaleString()}</span></p>
          </div>
          
          <p style="margin-top: 30px;">
            請登入管理後臺確認並處理此訂單。
          </p>
        </div>
      </div>
    `
  };

  try {
    await sgMail.send(msg);
    console.log('✅ 新訂單通知已發送至管理員:', ADMIN_EMAIL);
    return true;
  } catch (error) {
    console.error('❌ 發送失敗:', error?.response?.body?.errors || error.message);
    return false;
  }
}

module.exports = {
  sendOrderConfirmation,
  sendNewOrderNotification
};
