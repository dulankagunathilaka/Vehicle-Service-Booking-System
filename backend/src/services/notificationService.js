const Notification = require('../models/Notification');
const User = require('../models/User');

/**
 * Notification Service
 * Simulates SMS/email sending and logs notifications in the database.
 * In production, integrate with Twilio (SMS) and SendGrid/Nodemailer (email).
 */

const sendNotification = async ({ recipientId, type, category, subject, message, relatedBooking, relatedInvoice }) => {
  try {
    const user = await User.findById(recipientId);
    if (!user) throw new Error('Recipient not found');

    const notification = new Notification({
      recipientId,
      type: type || 'both',
      category,
      subject,
      message,
      relatedBooking,
      relatedInvoice,
      channel: {
        email: { sent: false },
        sms: { sent: false },
      },
    });

    // Simulate email sending
    if (type === 'email' || type === 'both') {
      try {
        // In production: await sendEmail(user.email, subject, message);
        console.log(`[EMAIL] To: ${user.email} | Subject: ${subject}`);
        notification.channel.email.sent = true;
        notification.channel.email.sentAt = new Date();
      } catch (err) {
        notification.channel.email.error = err.message;
        console.error(`[EMAIL ERROR] ${err.message}`);
      }
    }

    // Simulate SMS sending
    if (type === 'sms' || type === 'both') {
      try {
        // In production: await sendSMS(user.phone, message);
        console.log(`[SMS] To: ${user.phone} | Message: ${message.substring(0, 100)}`);
        notification.channel.sms.sent = true;
        notification.channel.sms.sentAt = new Date();
      } catch (err) {
        notification.channel.sms.error = err.message;
        console.error(`[SMS ERROR] ${err.message}`);
      }
    }

    await notification.save();
    return notification;
  } catch (error) {
    console.error('Notification error:', error.message);
    throw error;
  }
};

// Pre-built notification templates
const templates = {
  bookingConfirmation: (booking, serviceName) => ({
    category: 'booking-confirmation',
    subject: 'Booking Confirmed - AutoServe',
    message: `Your booking for ${serviceName} on ${new Date(booking.bookingDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} at ${booking.timeSlot} has been confirmed. Booking ID: ${booking._id.toString().slice(-8)}`,
  }),

  bookingUpdate: (booking, newStatus) => ({
    category: 'booking-update',
    subject: `Booking Status Update - ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}`,
    message: `Your booking #${booking._id.toString().slice(-8)} status has been updated to "${newStatus}". ${newStatus === 'in-progress' ? 'Our technicians are working on your vehicle.' : newStatus === 'completed' ? 'Your vehicle service is complete! You can pick up your vehicle.' : ''}`,
  }),

  bookingReminder: (booking, serviceName) => ({
    category: 'booking-reminder',
    subject: 'Upcoming Service Reminder - AutoServe',
    message: `Reminder: You have a ${serviceName} appointment on ${new Date(booking.bookingDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} at ${booking.timeSlot}. Please arrive 10 minutes early.`,
  }),

  bookingCancelled: (booking) => ({
    category: 'booking-cancelled',
    subject: 'Booking Cancelled - AutoServe',
    message: `Your booking #${booking._id.toString().slice(-8)} has been cancelled. If you did not request this, please contact us immediately.`,
  }),

  invoiceSent: (invoice) => ({
    category: 'invoice-sent',
    subject: `Invoice ${invoice.invoiceNumber} - AutoServe`,
    message: `A new invoice ${invoice.invoiceNumber} for $${invoice.totalAmount.toFixed(2)} has been generated. Due date: ${new Date(invoice.dueDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}. Please ensure timely payment.`,
  }),

  paymentReceived: (invoice) => ({
    category: 'payment-received',
    subject: 'Payment Received - AutoServe',
    message: `Payment of $${invoice.totalAmount.toFixed(2)} for invoice ${invoice.invoiceNumber} has been received. Thank you for your payment!`,
  }),

  serviceComplete: (booking, serviceName) => ({
    category: 'service-complete',
    subject: 'Service Complete - AutoServe',
    message: `Great news! The ${serviceName} for your vehicle is now complete. You can pick up your vehicle at your convenience. Thank you for choosing AutoServe!`,
  }),
};

module.exports = { sendNotification, templates };
