import { DeviceMaintenanceLogDocument } from "../models/DeviceMaintenanceLog.js";
import { ParkingSessionDocument } from "../models/ParkingSession.js";
import { ParkingSlotDocument } from "../models/ParkingSlot.js";
import { ReservationDocument } from "../models/Reservation.js";
import { SubscriptionDocument } from "../models/Subscription.js";
import { SubscriptionPlanDocument } from "../models/SubscriptionPlan.js";
import { UserDocument } from "../models/User.js";
import { VehicleDocument } from "../models/Vehicle.js";
import { DeviceDocument } from "../models/Device.js";
import { FeedbackDocument } from "../models/Feedback.js";
import { IncidentDocument } from "../models/Incident.js";
import { NotificationDocument } from "../models/Notification.js";
import { PaymentConfigDocument } from "../models/PaymentConfig.js";
import { ShiftDocument } from "../models/Shift.js";
import { TransactionDocument } from "../models/Transaction.js";
import { ZoneDocument } from "../models/Zone.js";
import type { ZoneStats } from "../services/zone.service.js";

export function serializeUser(user: UserDocument) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    wallet: user.wallet,
    avatarUrl: user.avatarUrl,
    provider: user.provider,
    twoFactorEnabled: user.twoFactorEnabled,
  };
}

export function serializeParkingSession(session: ParkingSessionDocument) {
  return {
    id: session._id.toString(),
    plate: session.plate,
    owner: session.ownerName,
    vehicleType: session.vehicleType,
    checkIn: session.checkInAt.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
    checkOut: session.checkOutAt?.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
    slot: session.slot,
    slotId: session.slotId?.toString(),
    status: session.status,
    paymentStatus: session.paymentStatus,
    fee: session.fee,
    feeBreakdown: session.feeBreakdown,
    entryImageUrl: session.entryImageUrl,
    exitImageUrl: session.exitImageUrl,
    entryDetectedPlate: session.entryDetectedPlate,
    exitDetectedPlate: session.exitDetectedPlate,
    entryConfidence: session.entryConfidence,
    exitConfidence: session.exitConfidence,
    vehicleMatchScore: session.vehicleMatchScore,
    matchStatus: session.matchStatus,
    verificationStatus: session.verificationStatus,
    manualPlate: session.manualPlate,
    verificationNote: session.verificationNote,
    transactionId: session.transactionId?.toString(),
  };
}

export function serializeVehicle(vehicle: VehicleDocument) {
  return {
    id: vehicle._id.toString(),
    plate: vehicle.plate,
    owner: vehicle.ownerName,
    type: vehicle.vehicleType,
    status: vehicle.status,
  };
}

export function serializePaymentConfig(config: PaymentConfigDocument) {
  return {
    id: config._id.toString(),
    bankName: config.bankName,
    bankBin: config.bankBin,
    accountNumber: config.accountNumber,
    accountName: config.accountName,
    transferPrefix: config.transferPrefix,
    isActive: config.isActive,
    updatedAt: config.updatedAt,
  };
}

export function serializeTransaction(transaction: TransactionDocument) {
  return {
    id: transaction._id.toString(),
    sessionId: transaction.sessionId?.toString(),
    userId: transaction.userId?.toString(),
    method: transaction.method,
    amount: transaction.amount,
    status: transaction.status,
    content: transaction.content,
    qrUrl: transaction.qrUrl,
    paidAt: transaction.paidAt,
    note: transaction.note,
    createdAt: transaction.createdAt,
  };
}

export function serializeDevice(device: DeviceDocument) {
  return {
    id: device._id.toString(),
    name: device.name,
    gate: device.gate,
    rtspUrl: device.rtspUrl,
    username: device.username,
    roiNote: device.roiNote,
    status: device.status,
    lastSnapshotUrl: device.lastSnapshotUrl,
    lastSnapshotAt: device.lastSnapshotAt,
  };
}

export function serializeFeedback(feedback: FeedbackDocument) {
  return {
    id: feedback._id.toString(),
    subject: feedback.subject,
    content: feedback.content,
    status: feedback.status,
    response: feedback.response,
    createdBy: feedback.createdBy?.toString(),
    handledAt: feedback.handledAt,
    createdAt: feedback.createdAt,
  };
}

export function serializeNotification(notification: NotificationDocument, userId?: string) {
  return {
    id: notification._id.toString(),
    title: notification.title,
    content: notification.content,
    targetRole: notification.targetRole,
    userId: notification.userId?.toString(),
    read: userId ? notification.readBy.some((id) => id.toString() === userId) : false,
    createdAt: notification.createdAt,
  };
}

export function serializeShift(shift: ShiftDocument) {
  return {
    id: shift._id.toString(),
    name: shift.name,
    staffId: shift.staffId.toString(),
    startAt: shift.startAt,
    endAt: shift.endAt,
    status: shift.status,
    note: shift.note,
  };
}

export function serializeIncident(incident: IncidentDocument) {
  return {
    id: incident._id.toString(),
    type: incident.type,
    note: incident.note,
    plate: incident.plate,
    sessionId: incident.sessionId?.toString(),
    status: incident.status,
    createdBy: incident.createdBy?.toString(),
    handledAt: incident.handledAt,
    createdAt: incident.createdAt,
  };
}

export function serializeZone(zone: ZoneDocument, stats?: ZoneStats) {
  return {
    id: zone._id.toString(),
    name: zone.name,
    description: zone.description,
    capacity: zone.capacity,
    allowedVehicleTypes: zone.allowedVehicleTypes,
    pricingConfigId: zone.pricingConfigId?.toString(),
    displayOrder: zone.displayOrder,
    isActive: zone.isActive,
    ...(stats ? { stats } : {}),
    updatedAt: zone.updatedAt,
  };
}

export function serializeParkingSlot(slot: ParkingSlotDocument) {
  return {
    id: slot._id.toString(),
    slotCode: slot.slotCode,
    zoneId: slot.zoneId.toString(),
    zoneName: slot.zoneName,
    slotType: slot.slotType,
    features: slot.features,
    status: slot.status,
    currentSessionId: slot.currentSessionId?.toString(),
    floor: slot.floor,
    notes: slot.notes,
    updatedAt: slot.updatedAt,
  };
}

export function serializeReservation(reservation: ReservationDocument) {
  return {
    id: reservation._id.toString(),
    userId: reservation.userId.toString(),
    slotId: reservation.slotId.toString(),
    slotCode: reservation.slotCode,
    zoneName: reservation.zoneName,
    vehicleType: reservation.vehicleType,
    plate: reservation.plate,
    reservedFrom: reservation.reservedFrom.toISOString(),
    reservedUntil: reservation.reservedUntil.toISOString(),
    status: reservation.status,
    sessionId: reservation.sessionId?.toString(),
    depositAmount: reservation.depositAmount,
    cancelledAt: reservation.cancelledAt?.toISOString(),
    cancelReason: reservation.cancelReason,
    createdAt: reservation.createdAt.toISOString(),
  };
}

export function serializeSubscriptionPlan(plan: SubscriptionPlanDocument) {
  return {
    id: plan._id.toString(),
    name: plan.name,
    description: plan.description,
    duration: plan.duration,
    durationDays: plan.durationDays,
    price: plan.price,
    discountPercent: plan.discountPercent,
    maxVehicles: plan.maxVehicles,
    features: plan.features,
    isActive: plan.isActive,
  };
}

export function serializeSubscription(sub: SubscriptionDocument) {
  return {
    id: sub._id.toString(),
    userId: sub.userId.toString(),
    planId: sub.planId.toString(),
    planName: sub.planName,
    startDate: sub.startDate.toISOString(),
    endDate: sub.endDate.toISOString(),
    status: sub.status,
    autoRenew: sub.autoRenew,
    plates: sub.plates,
    transactionId: sub.transactionId?.toString(),
    renewalCount: sub.renewalCount,
    createdAt: sub.createdAt.toISOString(),
  };
}

export function serializeMaintenanceLog(log: DeviceMaintenanceLogDocument) {
  return {
    id: log._id.toString(),
    deviceId: log.deviceId.toString(),
    deviceName: log.deviceName,
    type: log.type,
    description: log.description,
    performedBy: log.performedBy?.toString(),
    performedAt: log.performedAt.toISOString(),
    cost: log.cost,
    notes: log.notes,
    status: log.status,
    createdAt: log.createdAt.toISOString(),
  };
}
