import test from 'node:test';
import assert from 'node:assert/strict';
import { serverPriceForRole } from '../src/utils/orderPricing.js';
import { buildWhatsAppMessage, buildWhatsAppUrl } from '../src/utils/whatsapp.js';

const service = { customerPrice: 100, partnerPrice: 50 };

test('server price is derived from role, never a browser-provided amount', () => {
  assert.equal(serverPriceForRole(service, 'CUSTOMER'), 100);
  assert.equal(serverPriceForRole(service, 'PARTNER'), 50);
  assert.throws(() => serverPriceForRole(service, 'ADMIN'), /Only customers and partners/);
});

test('WhatsApp customer message contains the order and service', () => {
  const message = buildWhatsAppMessage({ buyerType: 'CUSTOMER', orderNumber: 'ECH-ORD-2026-123456', serviceName: 'SSC GD Form' });
  assert.match(message, /ECH-ORD-2026-123456/);
  assert.match(message, /SSC GD Form/);
  assert.match(message, /required details/);
});

test('WhatsApp partner message distinguishes a walk-in customer request', () => {
  const message = buildWhatsAppMessage({ buyerType: 'PARTNER', orderNumber: 'ECH-ORD-2026-123456', serviceName: 'Railway Form' });
  assert.match(message, /partner of eCafeHimachal/);
  assert.match(message, /customer's details/);
});

test('WhatsApp URL normalizes an Indian phone number and URL-encodes text', () => {
  const url = buildWhatsAppUrl('+91 89203 02813', { buyerType: 'CUSTOMER', orderNumber: 'ECH-ORD-1', serviceName: 'SSC GD Form' });
  assert.match(url, /^https:\/\/wa\.me\/918920302813\?text=/);
  assert.match(url, /ECH-ORD-1/);
});

test('WhatsApp URL is absent when no configured number exists', () => {
  assert.equal(buildWhatsAppUrl('', { buyerType: 'CUSTOMER', orderNumber: 'ECH-ORD-1', serviceName: 'SSC GD Form' }), null);
});
