import { Router } from "express";
import mongoose from "mongoose";
import Employee from "../models/Employee.js";

const router = Router();

function isValidId(id) {
  return mongoose.isValidObjectId(id);
}

function handleWriteError(error, res) {
  if (error.code === 11000) {
    return res.status(409).json({ message: "An employee with this email already exists." });
  }

  if (error.name === "ValidationError" || error.name === "CastError") {
    return res.status(400).json({ message: error.message });
  }

  console.error(error);
  return res.status(500).json({ message: "Unable to save employee." });
}

router.get("/", async (_req, res) => {
  try {
    const employees = await Employee.find().sort({ createdAt: -1 });
    res.json(employees);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Unable to fetch employees." });
  }
});

router.get("/:id", async (req, res) => {
  if (!isValidId(req.params.id)) {
    return res.status(400).json({ message: "Invalid employee ID." });
  }

  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found." });
    }
    return res.json(employee);
  } catch (error) {
    return handleWriteError(error, res);
  }
});

router.post("/", async (req, res) => {
  try {
    const employee = await Employee.create(req.body);
    res.status(201).json(employee);
  } catch (error) {
    handleWriteError(error, res);
  }
});

router.put("/:id", async (req, res) => {
  if (!isValidId(req.params.id)) {
    return res.status(400).json({ message: "Invalid employee ID." });
  }

  try {
    const employee = await Employee.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!employee) {
      return res.status(404).json({ message: "Employee not found." });
    }
    return res.json(employee);
  } catch (error) {
    return handleWriteError(error, res);
  }
});

router.delete("/:id", async (req, res) => {
  if (!isValidId(req.params.id)) {
    return res.status(400).json({ message: "Invalid employee ID." });
  }

  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found." });
    }
    return res.status(204).end();
  } catch (error) {
    return handleWriteError(error, res);
  }
});

export default router;
