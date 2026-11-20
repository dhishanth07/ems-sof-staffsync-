import { Router } from "express";
import mongoose from "mongoose";
import LeaveRequest from "../models/LeaveRequest.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const filter = req.query.employeeEmail
      ? { employeeEmail: String(req.query.employeeEmail).trim().toLowerCase() }
      : {};
    const requests = await LeaveRequest.find(filter).sort({ createdAt: -1 });
    return res.json(requests);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Unable to fetch leave requests." });
  }
});

router.post("/", async (req, res) => {
  try {
    if (req.headers["x-user-role"] !== "user") {
      return res.status(403).json({ message: "Only employees can submit leave requests." });
    }
    if (!req.body.employeeEmail || !req.body.employeeName) {
      return res.status(400).json({ message: "Employee identity is required." });
    }
    if (new Date(req.body.endDate) < new Date(req.body.startDate)) {
      return res.status(400).json({ message: "End date cannot be before start date." });
    }
    const leaveRequest = await LeaveRequest.create({ ...req.body, status: "Pending" });
    return res.status(201).json(leaveRequest);
  } catch (error) {
    if (error.name === "ValidationError" || error.name === "CastError") {
      return res.status(400).json({ message: error.message });
    }
    console.error(error);
    return res.status(500).json({ message: "Unable to submit leave request." });
  }
});

router.patch("/:id/status", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: "Invalid leave request ID." });
  }
  if (req.headers["x-user-role"] !== "admin") {
    return res.status(403).json({ message: "Only admins can approve leave requests." });
  }
  if (!["Approved", "Rejected"].includes(req.body.status)) {
    return res.status(400).json({ message: "Status must be Approved or Rejected." });
  }

  try {
    const leaveRequest = await LeaveRequest.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true, runValidators: true },
    );
    if (!leaveRequest) return res.status(404).json({ message: "Leave request not found." });
    return res.json(leaveRequest);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Unable to update leave request." });
  }
});

export default router;
