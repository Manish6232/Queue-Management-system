const express = require("express");
const router = express.Router();
const { getAllDepartments, createDepartment, getDoctorsByDepartment, createDoctor } = require("../controllers/departmentController");
const { verifyToken, isAdmin } = require("../middlewares/authMiddleware");

router.get("/", getAllDepartments);
router.post("/", verifyToken, isAdmin, createDepartment);
router.get("/:deptId/doctors", getDoctorsByDepartment);
router.post("/doctors", verifyToken, isAdmin, createDoctor);

module.exports = router;