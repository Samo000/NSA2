const nodemailer = require('nodemailer');

let transporter;

function cleanString(value) {
  return String(value || '').trim();
}

function hasEmailConfig() {
  return Boolean(
    cleanString(process.env.SMTP_HOST) &&
    cleanString(process.env.SMTP_USER) &&
    cleanString(process.env.SMTP_PASS)
  );
}

function getTransporter() {
  if (!hasEmailConfig()) {
    return null;
  }

  if (!transporter) {
    const port = Number(process.env.SMTP_PORT || 587);
    const secure =
      cleanString(process.env.SMTP_SECURE) === ''
        ? port === 465
        : String(process.env.SMTP_SECURE).toLowerCase() === 'true';

    transporter = nodemailer.createTransport({
      host: cleanString(process.env.SMTP_HOST),
      port,
      secure,
      auth: {
        user: cleanString(process.env.SMTP_USER),
        pass: cleanString(process.env.SMTP_PASS)
      }
    });
  }

  return transporter;
}

function formatMoney(value) {
  return new Intl.NumberFormat('sl-SI', {
    style: 'currency',
    currency: 'EUR'
  }).format(Number(value || 0));
}

function escapeHtml(value) {
  return cleanString(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function methodLabel(value) {
  const labels = {
    card: 'Card payment',
    cod: 'Cash on delivery',
    standard: 'Standard delivery',
    express: 'Express delivery'
  };

  return labels[value] || cleanString(value) || 'Not selected';
}

function buildTextEmail(order) {
  const items = order.items
    .map((item) => {
      return [
        `- ${item.name}`,
        `  Quantity: ${item.quantity}`,
        `  Unit price: ${formatMoney(item.unitPrice)}`,
        `  Line total: ${formatMoney(item.total)}`
      ].join('\n');
    })
    .join('\n\n');

  return [
    `Hello ${order.customer.fullName},`,
    '',
    'Thank you for your order. Here are your order details:',
    '',
    `Order number: ${order.orderNumber}`,
    `Order status: ${order.status}`,
    `Payment method: ${methodLabel(order.paymentMethod)}`,
    `Shipping method: ${methodLabel(order.shippingMethod)}`,
    '',
    'Items:',
    items,
    '',
    `Subtotal: ${formatMoney(order.subtotal)}`,
    `Discount: ${formatMoney(order.discount)}`,
    `Total: ${formatMoney(order.total)}`,
    '',
    'Shipping address:',
    order.customer.fullName,
    order.shippingAddress.address,
    `${order.shippingAddress.postalCode} ${order.shippingAddress.city}`,
    order.shippingAddress.country,
    '',
    `Phone: ${order.customer.phone}`,
    '',
    'We will contact you when your order is processed.',
    '',
    'TechMarket'
  ].join('\n');
}

function buildHtmlEmail(order) {
  const itemRows = order.items
    .map((item) => {
      return `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${escapeHtml(item.name)}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">${Number(item.quantity || 0)}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">${formatMoney(item.unitPrice)}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">${formatMoney(item.total)}</td>
        </tr>
      `;
    })
    .join('');

  return `
    <!doctype html>
    <html>
      <body style="margin: 0; padding: 0; background: #f6f8fb; color: #111827; font-family: Arial, sans-serif;">
        <div style="max-width: 680px; margin: 0 auto; padding: 28px 16px;">
          <div style="background: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
            <div style="background: #111827; color: #ffffff; padding: 22px 24px;">
              <h1 style="margin: 0; font-size: 24px;">Order confirmation</h1>
              <p style="margin: 8px 0 0;">${escapeHtml(order.orderNumber)}</p>
            </div>

            <div style="padding: 24px;">
              <p style="margin-top: 0;">Hello ${escapeHtml(order.customer.fullName)},</p>
              <p>Thank you for your order. Here are your order details.</p>

              <table style="width: 100%; border-collapse: collapse; margin: 22px 0;">
                <thead>
                  <tr>
                    <th style="padding: 12px; border-bottom: 2px solid #d1d5db; text-align: left;">Item</th>
                    <th style="padding: 12px; border-bottom: 2px solid #d1d5db; text-align: center;">Qty</th>
                    <th style="padding: 12px; border-bottom: 2px solid #d1d5db; text-align: right;">Price</th>
                    <th style="padding: 12px; border-bottom: 2px solid #d1d5db; text-align: right;">Total</th>
                  </tr>
                </thead>
                <tbody>${itemRows}</tbody>
              </table>

              <table style="width: 100%; border-collapse: collapse; margin: 0 0 22px;">
                <tr>
                  <td style="padding: 6px 0;">Subtotal</td>
                  <td style="padding: 6px 0; text-align: right;">${formatMoney(order.subtotal)}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0;">Discount</td>
                  <td style="padding: 6px 0; text-align: right;">${formatMoney(order.discount)}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; border-top: 1px solid #d1d5db; font-weight: 700;">Total</td>
                  <td style="padding: 10px 0; border-top: 1px solid #d1d5db; text-align: right; font-weight: 700;">${formatMoney(order.total)}</td>
                </tr>
              </table>

              <h2 style="font-size: 16px; margin: 24px 0 8px;">Order info</h2>
              <p style="margin: 0; line-height: 1.6;">
                Status: ${escapeHtml(order.status)}<br>
                Payment: ${escapeHtml(methodLabel(order.paymentMethod))}<br>
                Shipping: ${escapeHtml(methodLabel(order.shippingMethod))}
              </p>

              <h2 style="font-size: 16px; margin: 24px 0 8px;">Shipping address</h2>
              <p style="margin: 0; line-height: 1.6;">
                ${escapeHtml(order.customer.fullName)}<br>
                ${escapeHtml(order.shippingAddress.address)}<br>
                ${escapeHtml(order.shippingAddress.postalCode)} ${escapeHtml(order.shippingAddress.city)}<br>
                ${escapeHtml(order.shippingAddress.country)}<br>
                Phone: ${escapeHtml(order.customer.phone)}
              </p>

              <p style="margin: 24px 0 0;">We will contact you when your order is processed.</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
}

async function sendOrderConfirmation(order) {
  const mailer = getTransporter();

  if (!mailer) {
    console.warn('Order confirmation email skipped: missing SMTP_HOST, SMTP_USER, or SMTP_PASS.');
    return { sent: false, skipped: true };
  }

  const to = cleanString(order?.customer?.email).toLowerCase();
  if (!to) {
    console.warn(`Order confirmation email skipped: order ${order?.orderNumber || 'unknown'} has no customer email.`);
    return { sent: false, skipped: true };
  }

  await mailer.sendMail({
    from: cleanString(process.env.MAIL_FROM) || cleanString(process.env.SMTP_USER),
    to,
    subject: `Order confirmation ${order.orderNumber}`,
    text: buildTextEmail(order),
    html: buildHtmlEmail(order)
  });

  return { sent: true, skipped: false };
}

module.exports = {
  sendOrderConfirmation
};
