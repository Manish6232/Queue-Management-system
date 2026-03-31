require("dotenv").config();
const mongoose = require("mongoose");
const Department = require("../models/Department");
const Doctor = require("../models/Doctor");

const departments = [
  { name: "OPD - General", code: "OPD", description: "General outpatient", avgServiceTime: 8 },
  { name: "Cardiology", code: "CARD", description: "Heart & cardiovascular", avgServiceTime: 15 },
  { name: "Orthopaedics", code: "ORTH", description: "Bone & joints", avgServiceTime: 12 },
  { name: "Pathology / Lab", code: "LAB", description: "Blood tests & reports", avgServiceTime: 5 },
  { name: "Radiology", code: "RAD", description: "X-Ray, MRI, CT Scan", avgServiceTime: 20 },
  { name: "Pharmacy", code: "PHAR", description: "Medicine dispensing", avgServiceTime: 3 },
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  await Department.deleteMany({});
  const depts = await Department.insertMany(departments);
  console.log("✅ Departments seeded:", depts.map(d => d.name));

  // Add sample doctors
  const doctors = [
    { name: "Dr. Ravi Sharma", specialization: "General Physician", departmentId: depts[0]._id, availableDays: ["Monday","Tuesday","Wednesday"] },
    { name: "Dr. Priya Mehta", specialization: "Cardiologist", departmentId: depts[1]._id, availableDays: ["Monday","Thursday","Friday"] },
    { name: "Dr. Arjun Patel", specialization: "Orthopaedic Surgeon", departmentId: depts[2]._id, availableDays: ["Tuesday","Wednesday","Friday"] },
  ];
  await Doctor.deleteMany({});
  await Doctor.insertMany(doctors);
  console.log("✅ Doctors seeded");
  process.exit(0);
}

seed().catch(console.error);