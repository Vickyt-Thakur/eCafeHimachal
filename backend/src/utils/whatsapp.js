export function buildWhatsAppMessage({ buyerType, orderNumber, serviceName }) {
  if (buyerType === 'PARTNER') return `Hello, I am a partner of eCafeHimachal.\n\nOrder ID: ${orderNumber}\n\nService: ${serviceName}\n\nI am sending my customer's details/documents for processing.`;
  return `Hello, I have placed an order on eCafeHimachal.\n\nOrder ID: ${orderNumber}\n\nService: ${serviceName}\n\nI am sending the required details/documents for processing.`;
}
export function buildWhatsAppUrl(number, data) { const normalized = String(number || '').replace(/\D/g, ''); return normalized ? `https://wa.me/${normalized}?text=${encodeURIComponent(buildWhatsAppMessage(data))}` : null; }
