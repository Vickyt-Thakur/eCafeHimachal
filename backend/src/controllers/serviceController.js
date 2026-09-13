import Service from '../models/Service.js';
import { serviceSchema } from '../validators/service.js';

function publicService(service, role) {
  const data = service.toObject();
  return { id: data._id, name: data.name, description: data.description, category: data.category, icon: data.icon, isActive: data.isActive, price: role === 'PARTNER' ? data.partnerPrice : data.customerPrice };
}

export async function listPublicServices(_request, response, next) {
  try {
    const services = await Service.find({ isActive: true }).sort({ name: 1 });
    response.json({ success: true, services: services.map((service) => publicService(service, 'CUSTOMER')) });
  } catch (error) { next(error); }
}

export async function listServicesForUser(request, response, next) {
  try {
    const services = await Service.find({ isActive: true }).sort({ name: 1 });
    response.json({ success: true, services: services.map((service) => publicService(service, request.user.role)) });
  } catch (error) { next(error); }
}

export async function listAdminServices(_request, response, next) {
  try {
    const services = await Service.find().sort({ createdAt: -1 });
    response.json({ success: true, services: services.map((service) => ({ id: service._id, name: service.name, description: service.description, category: service.category, customerPrice: service.customerPrice, partnerPrice: service.partnerPrice, icon: service.icon, isActive: service.isActive })) });
  } catch (error) { next(error); }
}

export async function createService(request, response, next) {
  try {
    const data = serviceSchema.parse(request.body);
    const service = await Service.create(data);
    response.status(201).json({ success: true, message: 'Service created.', service });
  } catch (error) { next(error); }
}

export async function updateService(request, response, next) {
  try {
    const data = serviceSchema.parse(request.body);
    const service = await Service.findByIdAndUpdate(request.params.id, data, { new: true, runValidators: true });
    if (!service) return response.status(404).json({ success: false, message: 'Service not found.' });
    response.json({ success: true, message: 'Service updated.', service });
  } catch (error) { next(error); }
}

export async function deleteService(request, response, next) {
  try {
    const service = await Service.findByIdAndDelete(request.params.id);
    if (!service) return response.status(404).json({ success: false, message: 'Service not found.' });
    response.json({ success: true, message: 'Service deleted.' });
  } catch (error) { next(error); }
}
