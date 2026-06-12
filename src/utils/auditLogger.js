const logger = require('../config/logger');

/**
 * Comprehensive audit logging for financial and sensitive transactions
 * Ensures compliance and security tracking
 */

class AuditLogger {
    /**
     * Log payment transaction
     */
    static logPaymentTransaction(data) {
        const auditEntry = {
            event_type: 'PAYMENT_TRANSACTION',
            timestamp: new Date(),
            user_id: data.user_id,
            booking_id: data.booking_id,
            payment_id: data.payment_id,
            order_id: data.order_id,
            amount: data.amount,
            currency: data.currency || 'INR',
            payment_method: data.payment_method,
            status: data.status,
            ip_address: data.ip_address,
            user_agent: data.user_agent,
            description: data.description || 'Payment processed'
        };

        logger.info({
            category: 'AUDIT',
            ...auditEntry
        });
    }

    /**
     * Log payment refund
     */
    static logRefund(data) {
        const auditEntry = {
            event_type: 'PAYMENT_REFUND',
            timestamp: new Date(),
            user_id: data.user_id,
            booking_id: data.booking_id,
            payment_id: data.payment_id,
            refund_id: data.refund_id,
            refund_amount: data.refund_amount,
            reason: data.reason,
            status: data.status,
            ip_address: data.ip_address,
            description: `Refund initiated for booking ${data.booking_id}`
        };

        logger.info({
            category: 'AUDIT',
            ...auditEntry
        });
    }

    /**
     * Log booking creation
     */
    static logBookingCreation(data) {
        const auditEntry = {
            event_type: 'BOOKING_CREATED',
            timestamp: new Date(),
            user_id: data.user_id,
            booking_id: data.booking_id,
            booking_code: data.booking_code,
            property_id: data.property_id,
            room_id: data.room_id,
            check_in: data.check_in_date,
            check_out: data.check_out_date,
            total_amount: data.total_amount,
            status: data.status,
            ip_address: data.ip_address
        };

        logger.info({
            category: 'AUDIT',
            ...auditEntry
        });
    }

    /**
     * Log booking cancellation
     */
    static logBookingCancellation(data) {
        const auditEntry = {
            event_type: 'BOOKING_CANCELLED',
            timestamp: new Date(),
            user_id: data.user_id,
            booking_id: data.booking_id,
            cancellation_reason: data.reason,
            refund_status: data.refund_status,
            refund_amount: data.refund_amount,
            ip_address: data.ip_address,
            cancelled_by: data.cancelled_by
        };

        logger.info({
            category: 'AUDIT',
            ...auditEntry
        });
    }

    /**
     * Log admin action
     */
    static logAdminAction(data) {
        const auditEntry = {
            event_type: 'ADMIN_ACTION',
            timestamp: new Date(),
            admin_id: data.admin_id,
            action: data.action,
            target_user_id: data.target_user_id,
            target_resource: data.target_resource,
            target_id: data.target_id,
            changes: data.changes,
            reason: data.reason,
            ip_address: data.ip_address
        };

        logger.info({
            category: 'AUDIT',
            ...auditEntry
        });
    }

    /**
     * Log financial settlement
     */
    static logFinancialSettlement(data) {
        const auditEntry = {
            event_type: 'FINANCIAL_SETTLEMENT',
            timestamp: new Date(),
            settlement_id: data.settlement_id,
            owner_id: data.owner_id,
            period: data.period,
            total_earnings: data.total_earnings,
            commissions: data.commissions,
            net_payout: data.net_payout,
            status: data.status,
            settlement_date: data.settlement_date
        };

        logger.info({
            category: 'AUDIT',
            ...auditEntry
        });
    }

    /**
     * Log user authentication
     */
    static logAuthentication(data) {
        const auditEntry = {
            event_type: data.success ? 'AUTH_SUCCESS' : 'AUTH_FAILED',
            timestamp: new Date(),
            user_id: data.user_id,
            email: data.email,
            method: data.method || 'PASSWORD',
            ip_address: data.ip_address,
            user_agent: data.user_agent,
            reason_failed: data.reason_failed,
            attempt_count: data.attempt_count
        };

        logger.info({
            category: 'AUDIT',
            ...auditEntry
        });
    }

    /**
     * Log data access
     */
    static logDataAccess(data) {
        const auditEntry = {
            event_type: 'DATA_ACCESS',
            timestamp: new Date(),
            user_id: data.user_id,
            resource_type: data.resource_type,
            resource_id: data.resource_id,
            action: data.action, // 'READ', 'EXPORT', etc
            ip_address: data.ip_address,
            records_accessed: data.records_accessed
        };

        logger.info({
            category: 'AUDIT',
            ...auditEntry
        });
    }

    /**
     * Log security event
     */
    static logSecurityEvent(data) {
        const auditEntry = {
            event_type: 'SECURITY_EVENT',
            timestamp: new Date(),
            event: data.event,
            severity: data.severity, // 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
            user_id: data.user_id,
            ip_address: data.ip_address,
            description: data.description,
            action_taken: data.action_taken
        };

        logger.error({
            category: 'AUDIT',
            ...auditEntry
        });
    }

    /**
     * Log dispute or complaint
     */
    static logDisputeCreation(data) {
        const auditEntry = {
            event_type: 'DISPUTE_CREATED',
            timestamp: new Date(),
            dispute_id: data.dispute_id,
            reported_by: data.reported_by,
            booking_id: data.booking_id,
            payment_id: data.payment_id,
            amount: data.amount,
            reason: data.reason,
            status: 'OPEN',
            ip_address: data.ip_address
        };

        logger.info({
            category: 'AUDIT',
            ...auditEntry
        });
    }
}

module.exports = AuditLogger;
