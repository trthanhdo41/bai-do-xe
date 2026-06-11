import { Router } from "express";
import { authRoutes } from "./auth.routes.js";
import { parkingSessionsRoutes } from "./parkingSessions.routes.js";
import { usersRoutes } from "./users.routes.js";
import { vehiclesRoutes } from "./vehicles.routes.js";

export const apiRoutes = Router();

apiRoutes.get("/health", (_request, response) => response.json({ ok: true, service: "ipark-backend" }));
apiRoutes.use("/auth", authRoutes);
apiRoutes.use("/users", usersRoutes);
apiRoutes.use("/vehicles", vehiclesRoutes);
apiRoutes.use("/parking-sessions", parkingSessionsRoutes);
