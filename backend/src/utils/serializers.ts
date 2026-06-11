import { ParkingSessionDocument } from "../models/ParkingSession.js";
import { UserDocument } from "../models/User.js";
import { VehicleDocument } from "../models/Vehicle.js";

export function serializeUser(user: UserDocument) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    wallet: user.wallet,
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
    fee: session.fee,
    entryImageUrl: session.entryImageUrl,
    exitImageUrl: session.exitImageUrl,
    entryDetectedPlate: session.entryDetectedPlate,
    exitDetectedPlate: session.exitDetectedPlate,
    entryConfidence: session.entryConfidence,
    exitConfidence: session.exitConfidence,
    vehicleMatchScore: session.vehicleMatchScore,
    matchStatus: session.matchStatus,
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
