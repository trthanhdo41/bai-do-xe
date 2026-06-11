import { ErrorRequestHandler } from "express";
import { ZodError } from "zod";

export const errorMiddleware: ErrorRequestHandler = (error, _request, response, _next) => {
  if (error instanceof ZodError) {
    response.status(400).json({ message: "Dữ liệu không hợp lệ.", errors: error.issues });
    return;
  }

  console.error(error);
  response.status(500).json({ message: "Lỗi hệ thống." });
};
