"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const auth_module_1 = require("./auth/auth.module");
// Load environment variables
dotenv_1.default.config();
// Import routes
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const course_routes_1 = __importDefault(require("./routes/course.routes"));
const job_routes_1 = __importDefault(require("./routes/job.routes"));
const application_routes_1 = __importDefault(require("./routes/application.routes"));
const certificate_routes_1 = __importDefault(require("./routes/certificate.routes"));
const employer_routes_1 = __importDefault(require("./routes/employer.routes"));
const analytics_routes_1 = __importDefault(require("./routes/analytics.routes"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Enable CORS
app.use((0, cors_1.default)());
// Cookie parser
app.use((0, cookie_parser_1.default)());
// Body parser
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Initialize Auth Module
app.use(auth_module_1.AuthModule.init());
// Root route
app.get('/', (_req, res) => {
    res.json({
        status: 'success',
        message: 'Welcome to the HANGA WORKS Workforce Intelligence API',
        version: '2.0.0',
        endpoints: {
            auth: '/api/v1/auth',
            courses: '/api/v1/courses',
            jobs: '/api/v1/jobs',
            applications: '/api/v1/applications',
            certificates: '/api/v1/certificates',
            employer: '/api/v1/employer',
            analytics: '/api/v1/analytics'
        }
    });
});
// Mount routes
app.use('/api/v1/auth', auth_routes_1.default);
app.use('/api/v1/courses', course_routes_1.default);
app.use('/api/v1/jobs', job_routes_1.default);
app.use('/api/v1/applications', application_routes_1.default);
app.use('/api/v1/certificates', certificate_routes_1.default);
app.use('/api/v1/employer', employer_routes_1.default);
app.use('/api/v1/analytics', analytics_routes_1.default);
// 404 handler
app.use((req, res) => {
    res.status(404).json({
        status: 'error',
        message: `Route ${req.originalUrl} not found`
    });
});
// Global error handler
app.use((err, _req, res, _next) => {
    console.error(err.stack);
    res.status(500).json({
        status: 'error',
        message: 'An internal server error occurred',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});
// Start server
app.listen(PORT, () => {
    console.log(`[server]: Server is running at http://localhost:${PORT}`);
});
