const { Resend } = require('resend');

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.FROM_EMAIL || 'onboarding@resend.dev';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'tonywu1967@gmail.com';
const APP_URL = process.env.APP_URL || 'https://shopping.zeabur.app';

// Send verification email
async function sendVerificationEmail(user, token) {
  if (!process.env.RESEND_API_KEY) {
    console.log('⚠️ RESEND_API_KEY 未設定，略過發送驗證信');
    return false;
  }

  const verifyUrl = `${APP_URL}/verify-email.html?token=${token}`;

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: user.email,
      subject: '【CHIC】驗證您的 Email 帳戶',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #1a1a1a; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0; letter-spacing: 5px;">CHIC</h1>
          </div>
          <div style="padding: 30px;">
            <h2 style="color: #333;">親愛的 ${user.name} 您好，</h2>
            <p>感謝您註冊 CHIC 時尚購物！</p>
            <p>請點擊以下按鈕驗證您的 Email 帳戶：</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verifyUrl}" style="display: inline-block; padding: 15px 40px; background: #c9a96e; color: white; text-decoration: none; border-radius: 5px; font-size: 16px;">驗證 Email</a>
            </div>
            
            <p style="color: #666; font-size: 13px;">或者複製以下連結到瀏覽器開啟：</p>
            <p style="background: #f5f5f5; padding: 10px; border-radius: 5px; word-break: break-all; font-size: 12px;">${verifyUrl}</p>
            
            <p style="margin-top: 30px; color: #999; font-size: 12px;">此驗證連結將在 24 小時後失效。</p>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            
            <p style="color: #999; font-size: 12px; text-align: center;">
              CHIC 時尚購物 © 2026
            </p>
          </div>
        </div>
      `
    });
    console.log('✅ 驗證信已發送至:', user.email);
    return true;
  } catch (error) {
    console.error('❌ 發送驗證信失敗:', error?.message);
    return false;
  }
}

// Send order confirmation to customer
async function sendOrderConfirmation(order, customerEmail) {
  if (!process.env.RESEND_API_KEY) {
    console.log('⚠️ RESEND_API_KEY 未設定，略過發送確認信');
    return false;
  }

  const itemsHtml = order.items
    .map(item => `<tr><td style="padding:10px;border-bottom:1px solid #eee;">${item.name}</td><td style="padding:10px;border-bottom:1px solid #eee;">x${item.quantity}</td><td style="padding:10px;border-bottom:1px solid #eee;text-align:right;">$${(item.price * item.quantity).toLocaleString()}</td></tr>`)
    .join('');

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: customerEmail,
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
              <p><strong>收件人：</strong> ${order.shippingInfo?.name}</p>
              <p><strong>聯絡電話：</strong> ${order.shippingInfo?.phone}</p>
              <p><strong>配送地址：</strong> ${order.shippingInfo?.city} ${order.shippingInfo?.address} ${order.shippingInfo?.zipCode || ''}</p>
            </div>
            
            <h3>訂購商品</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="background: #f5f5f5;">
                  <th style="padding:10px;text-align:left;">商品</th>
                  <th style="padding:10px;">數量</th>
                  <th style="padding:10px;text-align:right;">金額</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="2" style="padding:10px;text-align:right;font-size:18px;"><strong>總計：</strong></td>
                  <td style="padding:10px;text-align:right;font-size:18px;color:#c9a96e;"><strong>$${order.totalAmount.toLocaleString()}</strong></td>
                </tr>
              </tfoot>
            </table>
            
            <p style="margin-top: 30px; color: #666;">我們將在確認訂單後盡快為您安排出貨。</p>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            
            <p style="color: #999; font-size: 12px; text-align: center;">
              CHIC 時尚購物 © 2026<br>
              如有問題，請聯繫我們的客服團隊
            </p>
          </div>
        </div>
      `
    });
    console.log('✅ 訂單確認信已發送至:', customerEmail);
    return true;
  } catch (error) {
    console.error('❌ 發送確認信失敗:', error?.message);
    return false;
  }
}

// Send new order notification to admin
async function sendNewOrderNotification(order) {
  if (!process.env.RESEND_API_KEY) {
    console.log('⚠️ RESEND_API_KEY 未設定，略過發送管理員通知');
    return false;
  }

  const itemsHtml = order.items
    .map(item => `<tr><td style="padding:10px;border-bottom:1px solid #eee;">${item.name}</td><td style="padding:10px;border-bottom:1px solid #eee;">x${item.quantity}</td><td style="padding:10px;border-bottom:1px solid #eee;text-align:right;">$${(item.price * item.quantity).toLocaleString()}</td></tr>`)
    .join('');

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
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
              <p><strong>收件人：</strong> ${order.shippingInfo?.name}</p>
              <p><strong>聯絡電話：</strong> ${order.shippingInfo?.phone}</p>
              <p><strong>配送地址：</strong> ${order.shippingInfo?.city} ${order.shippingInfo?.address} ${order.shippingInfo?.zipCode || ''}</p>
              <p><strong>下單時間：</strong> ${new Date(order.createdAt).toLocaleString('zh-TW')}</p>
            </div>
            
            <h3>訂購商品</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="background: #f5f5f5;">
                  <th style="padding:10px;text-align:left;">商品</th>
                  <th style="padding:10px;">數量</th>
                  <th style="padding:10px;text-align:right;">金額</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="2" style="padding:10px;text-align:right;font-size:18px;"><strong>總計：</strong></td>
                  <td style="padding:10px;text-align:right;font-size:18px;color:#c9a96e;"><strong>$${order.totalAmount.toLocaleString()}</strong></td>
                </tr>
              </tfoot>
            </table>
            
            <p style="margin-top: 30px;">
              請登入管理後臺確認並處理此訂單。
            </p>
          </div>
        </div>
      `
    });
    console.log('✅ 新訂單通知已發送至管理員:', ADMIN_EMAIL);
    return true;
  } catch (error) {
    console.error('❌ 發送管理員通知失敗:', error?.message);
    return false;
  }
}

module.exports = {
  sendOrderConfirmation,
  sendNewOrderNotification,
  sendVerificationEmail
};
