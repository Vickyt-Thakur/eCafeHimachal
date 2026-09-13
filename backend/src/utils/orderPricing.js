export function serverPriceForRole(service, role) {
  if (role === 'PARTNER') return service.partnerPrice;
  if (role === 'CUSTOMER') return service.customerPrice;
  throw new Error('Only customers and partners can place orders.');
}
