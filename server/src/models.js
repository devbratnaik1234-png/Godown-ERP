import mongoose from "mongoose";

const options = { timestamps: true };

const farmerSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  village: { type: String, trim: true, default: "" },
  mobile: { type: String, trim: true, default: "" },
  bank: { type: String, trim: true, default: "" },
  account: { type: String, trim: true, default: "" },
  status: { type: String, enum: ["Paid", "Pending"], default: "Pending" }
}, options);

const labourSchema = new mongoose.Schema({
  labourId: { type: String, required: true, unique: true, trim: true },
  name: { type: String, required: true, trim: true },
  mobile: { type: String, trim: true, default: "" },
  village: { type: String, trim: true, default: "" },
  workType: { type: String, trim: true, default: "" },
  dailyWage: { type: Number, min: 0, default: 0 },
  joiningDate: { type: Date, default: Date.now },
  status: { type: String, enum: ["Active", "Inactive"], default: "Active" }
}, options);

const purchaseSchema = new mongoose.Schema({
  purchaseId: { type: String, required: true, unique: true, trim: true },
  date: { type: Date, default: Date.now },
  farmer: { type: String, required: true, trim: true },
  paddyType: { type: String, required: true, trim: true },
  quantity: { type: Number, required: true, min: 0 },
  rate: { type: Number, required: true, min: 0 },
  total: { type: Number, min: 0, default: 0 },
  truck: { type: String, trim: true, default: "" },
  moisture: { type: Number, min: 0, default: 0 },
  remarks: { type: String, trim: true, default: "" }
}, options);

purchaseSchema.pre("validate", function(next) {
  this.total = (Number(this.quantity) || 0) * (Number(this.rate) || 0);
  next();
});

const paymentSchema = new mongoose.Schema({
  farmer: { type: String, required: true, trim: true },
  amount: { type: Number, required: true, min: 0 },
  method: { type: String, enum: ["Cash", "UPI", "Bank Transfer", "NEFT"], default: "Cash" },
  date: { type: Date, required: true },
  status: { type: String, enum: ["Paid", "Pending"], default: "Paid" },
  remarks: { type: String, trim: true, default: "" }
}, options);

const stockSchema = new mongoose.Schema({
  rice: { type: String, required: true, trim: true },
  godown: { type: String, required: true, trim: true },
  quantity: { type: Number, required: true, min: 0 },
  rate: { type: Number, required: true, min: 0 },
  date: { type: Date, default: Date.now }
}, options);

const truckSchema = new mongoose.Schema({
  truckNo: { type: String, required: true, trim: true, uppercase: true },
  driver: { type: String, trim: true, default: "" },
  mobile: { type: String, trim: true, default: "" },
  farmer: { type: String, trim: true, default: "" },
  quantity: { type: Number, min: 0, default: 0 },
  date: { type: Date, default: Date.now },
  status: { type: String, enum: ["In Transit", "Completed", "Cancelled"], default: "In Transit" },
  type: { type: String, enum: ["Incoming", "Outgoing"], default: "Incoming" },
  purpose: { type: String, trim: true, default: "" },
  remarks: { type: String, trim: true, default: "" }
}, options);

truckSchema.index({ truckNo: 1 }, { unique: true });

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, default: "Admin" },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ["admin"], default: "admin" }
}, options);

export const Farmer = mongoose.model("Farmer", farmerSchema);
export const Labour = mongoose.model("Labour", labourSchema);
export const Purchase = mongoose.model("Purchase", purchaseSchema);
export const Payment = mongoose.model("Payment", paymentSchema);
export const Stock = mongoose.model("Stock", stockSchema);
export const Truck = mongoose.model("Truck", truckSchema);
export const User = mongoose.model("User", userSchema);
