const Department = require("../models/Department");
const Doctor = require("../models/Doctor");

exports.getAllDepartments = async (req, res) => {
  try {
    const depts = await Department.find({ isActive: true });
    res.json({ success: true, data: depts });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createDepartment = async (req, res) => {
  try {
    const dept = await Department.create(req.body);
    res.status(201).json({ success: true, data: dept });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getDoctorsByDepartment = async (req, res) => {
  try {
    const doctors = await Doctor.find({ departmentId: req.params.deptId, isActive: true });
    res.json({ success: true, data: doctors });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.create(req.body);
    res.status(201).json({ success: true, data: doctor });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};