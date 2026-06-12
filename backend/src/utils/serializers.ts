import { ParkingSessionDocument } from "../models/ParkingSession.js";
import { UserDocument } from "../models/User.js";
import { VehicleDocument } from "../models/Vehicle.js";
import { DeviceDocument } from "../models/Device.js";
import { FeedbackDocument } from "../models/Feedback.js";
import { IncidentDocument } from "../models/Incident.js";
import { NotificationDocument } from "../models/Notification.js";
import { PaymentConfigDocument } from "../models/PaymentConfig.js";
import { ShiftDocument } from "../models/Shift.js";
import { TransactionDocument } from "../models/Transaction.js";

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
