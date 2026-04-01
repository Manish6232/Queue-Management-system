import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5001/api",
  headers: { "Content-Type": "application/json" },
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

// ── Auth ──────────────────────────────────────────
export const signupUser  = (data) => API.post("/auth/signup", data);
export const loginUser   = (data) => API.post("/auth/login", data);
export const verifyOTP   = (data) => API.post("/auth/verify-otp", data);
export const resendOTP   = (data) => API.post("/auth/resend-otp", data);

// ── Queue ─────────────────────────────────────────
export const joinQueue   = (data)         => API.post("/queue/join", data);
export const callNext    = (data)         => API.post("/queue/next", data);
export const getStatus   = (queueId)      => API.get(`/queue/status/${queueId}`);
export const getPosition = (qId, token)   => API.get(`/queue/position/${qId}/${token}`);

// ── Departments ───────────────────────────────────
export const getAllDepartments    = ()      => API.get("/departments");
export const getDeptDoctors      = (deptId)=> API.get(`/departments/${deptId}/doctors`);
export const createDepartment    = (data)  => API.post("/departments", data);
export const createDoctor        = (data)  => API.post("/departments/doctors", data);

// ── Appointments ──────────────────────────────────
export const bookAppointment     = (data)  => API.post("/appointments/book", data);
export const checkInPatient      = (data)  => API.post("/appointments/checkin", data);
export const submitFeedback      = (data)  => API.post("/appointments/feedback", data);
export const getMyAppointments   = ()      => API.get("/appointments/my");
export const getAppointmentById  = (id)    => API.get(`/appointments/${id}`);
export const cancelAppointment   = (id)    => API.patch(`/appointments/${id}/cancel`);
export const getDeptQueue        = (deptId)=> API.get(`/appointments/queue/${deptId}`);
export const getAllAppointments   = ()      => API.get("/appointments/all");
export const searchAppointment   = (q)     => API.get(`/appointments/search?q=${q}`);

// ── Analytics ─────────────────────────────────────
export const getAdminAnalytics   = (queueId) => API.get(`/analytics/admin/${queueId}`);
export const getUserHistory      = ()         => API.get("/analytics/history");

export default API;