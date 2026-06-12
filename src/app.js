const express = require("express");
const path = require("path");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const compression =require("compression");
const hpp =require("hpp");
const routes = require("./routes");
const errorMiddleware = require("./middleware/errorMiddleware");
const globalLimiter =require("./middleware/security/rateLimiter");
const requestLogger =require("./utils/logger/requestLogger");
const errorLogger =require("./utils/logger/errorLogger");

const app = express();

// TRUST PROXY
app.set("trust proxy", 1);

// SECURITY MIDDLEWARE
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(
    "/uploads",
    express.static(
        path.join(__dirname, "../uploads")
    )
);


// ENABLE CORS
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000,http://localhost:5500,http://127.0.0.1:5500')
    .split(',')
    .map(origin => origin.trim());

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
            return;
        }

        callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// RESPONSE COMPRESSION
app.use(compression());

// BODY PARSER
app.use(

    express.json({

        limit: "50mb"
    })
);
app.use(

    express.urlencoded({

        extended: true,

        limit: "50mb"
    })
);

// HTTP PARAMETER POLLUTION
app.use(hpp());

const sanitizeBody = (value) => {
    if (!value || typeof value !== "object") {
        return;
    }

    Object.keys(value).forEach((key) => {
        if (key.includes("$") || key.includes(".")) {
            delete value[key];
            return;
        }

        sanitizeBody(value[key]);
    });
};

// REQUEST SANITIZATION
app.use((req, res, next) => {
    sanitizeBody(req.body);
    next();
});

// REQUEST LOGGER
app.use(requestLogger);

// RATE LIMITING
app.use(globalLimiter);

// HTTP LOGGER - Use appropriate format based on environment
const morganFormat = process.env.NODE_ENV === 'production' ? 'combined' : 'dev';
app.use(morgan(morganFormat));

// XSS PROTECTION


// API ROUTES
app.use("/api", routes);

// ERROR LOGGER
app.use(errorLogger);

// 404 HANDLER
app.use((req, res, next) => {

    const error = new Error("Route not found");

    error.statusCode = 404;

    next(error);
});

// GLOBAL ERROR HANDLER
app.use(errorMiddleware);



module.exports = app;
