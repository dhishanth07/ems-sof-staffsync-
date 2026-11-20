import mongoose from "mongoose";

const leaveRequestSchema = new mongoose.Schema(
  {
    employeeEmail: {
      type: String,
      required: [true, "Employee email is required"],
      trim: true,
      lowercase: true,
    },
    employeeName: {
      type: String,
      required: [true, "Employee name is required"],
      trim: true,
    },
    leaveType: {
      type: String,
      enum: ["Annual Leave", "Sick Leave", "Personal Leave", "Unpaid Leave"],
      required: [true, "Leave type is required"],
    },
    startDate: {
      type: Date,
      required: [true, "Start date is required"],
    },
    endDate: {
      type: Date,
      required: [true, "End date is required"],
    },
    reason: {
      type: String,
      required: [true, "Reason is required"],
      trim: true,
      maxlength: [500, "Reason cannot exceed 500 characters"],
    },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
  },
  { timestamps: true },
);

export default mongoose.model("LeaveRequest", leaveRequestSchema);
