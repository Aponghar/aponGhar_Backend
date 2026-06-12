require('dotenv').config();

const requiredEnvVars = [
    'NODE_ENV',
    'PORT',
    'JWT_SECRET',
    'RAZORPAY_KEY_ID',
    'RAZORPAY_KEY_SECRET',
    'EMAIL_HOST',
    'EMAIL_PORT',
    'EMAIL_USER',
    'EMAIL_PASS',
    'EMAIL_FROM',
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET'
];

const hasDatabaseUrl = () =>
    Boolean(
        process.env.DATABASE_URL ||
        process.env.MYSQL_URL ||
        process.env.MYSQL_PUBLIC_URL
    );

const getDatabasePort = () =>
    process.env.DB_PORT ||
    process.env.MYSQLPORT ||
    (
        hasDatabaseUrl()
            ? new URL(
                process.env.DATABASE_URL ||
                process.env.MYSQL_URL ||
                process.env.MYSQL_PUBLIC_URL
            ).port || '3306'
            : undefined
    );

const requiredDatabaseEnvVars = [
    ['DB_HOST', 'MYSQLHOST'],
    ['DB_PORT', 'MYSQLPORT'],
    ['DB_NAME', 'MYSQLDATABASE', 'MYSQL_DATABASE'],
    ['DB_USER', 'MYSQLUSER'],
    ['DB_PASSWORD', 'MYSQLPASSWORD', 'MYSQL_ROOT_PASSWORD']
];

const validateEnvironment = () => {
    const missingVars = [];

    requiredEnvVars.forEach(varName => {
        if (!process.env[varName]) {
            missingVars.push(varName);
        }
    });

    if (!hasDatabaseUrl()) {
        requiredDatabaseEnvVars.forEach(varGroup => {
            if (!varGroup.some(varName => process.env[varName])) {
                missingVars.push(varGroup.join(' or '));
            }
        });
    }

    if (missingVars.length > 0) {
        console.error(
            'Missing required environment variables:',
            missingVars.join(', ')
        );
        console.error(
            'Please check your .env file and ensure all required variables are set.'
        );
        process.exit(1);
    }

    // Validate specific values
    if (!['development', 'production', 'test'].includes(process.env.NODE_ENV)) {
        console.error(
            'Invalid NODE_ENV. Must be one of: development, production, test'
        );
        process.exit(1);
    }

    if (isNaN(parseInt(process.env.PORT))) {
        console.error('PORT must be a valid number');
        process.exit(1);
    }

    if (isNaN(parseInt(getDatabasePort()))) {
        console.error('Database port must be a valid number');
        process.exit(1);
    }

    // JWT_SECRET must be at least 32 characters in production
    if (
        process.env.NODE_ENV === 'production' &&
        process.env.JWT_SECRET.length < 32
    ) {
        console.error(
            'JWT_SECRET must be at least 32 characters long in production'
        );
        process.exit(1);
    }

    console.log('✓ All environment variables validated successfully');
};

module.exports = {
    validateEnvironment
};
