/**
 * Email Templates with HTML formatting for professional notifications
 * All templates use Tailwind CSS for styling
 */

export interface EmailTemplateData {
  recipientName: string;
  recipientEmail: string;
  [key: string]: any;
}

/**
 * Base HTML wrapper with Tailwind CSS styling
 */
function baseTemplate(content: string, subject: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${subject}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f9fafb;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: white;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px 20px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 600;
        }
        .body {
            padding: 40px 20px;
        }
        .body h2 {
            color: #1f2937;
            font-size: 18px;
            margin: 0 0 20px 0;
        }
        .body p {
            margin: 0 0 16px 0;
            color: #4b5563;
        }
        .button {
            display: inline-block;
            background-color: #667eea;
            color: white;
            padding: 12px 24px;
            border-radius: 6px;
            text-decoration: none;
            font-weight: 500;
            margin: 20px 0;
        }
        .button:hover {
            background-color: #5568d3;
        }
        .alert {
            background-color: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 16px;
            margin: 20px 0;
            border-radius: 4px;
            color: #92400e;
        }
        .alert.error {
            background-color: #fee2e2;
            border-left-color: #ef4444;
            color: #7f1d1d;
        }
        .alert.success {
            background-color: #dcfce7;
            border-left-color: #22c55e;
            color: #166534;
        }
        .info-box {
            background-color: #f3f4f6;
            border: 1px solid #e5e7eb;
            padding: 16px;
            margin: 20px 0;
            border-radius: 6px;
        }
        .info-box strong {
            color: #1f2937;
        }
        .footer {
            background-color: #f9fafb;
            border-top: 1px solid #e5e7eb;
            padding: 20px;
            text-align: center;
            color: #6b7280;
            font-size: 12px;
        }
        .footer a {
            color: #667eea;
            text-decoration: none;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        table th {
            background-color: #f3f4f6;
            padding: 12px;
            text-align: left;
            font-weight: 600;
            color: #1f2937;
            border-bottom: 2px solid #e5e7eb;
        }
        table td {
            padding: 12px;
            border-bottom: 1px solid #e5e7eb;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${subject}</h1>
        </div>
        <div class="body">
            ${content}
        </div>
        <div class="footer">
            <p>&copy; 2026 Enterprise Asset Management System. All rights reserved.</p>
            <p><a href="\${NEXT_PUBLIC_BASE_URL}">View in Dashboard</a></p>
        </div>
    </div>
</body>
</html>
  `;
}

/**
 * Checkout Expiry Reminder - 2 days before expiry
 */
export function checkoutExpiryReminderTemplate(
  data: EmailTemplateData & {
    assetName: string;
    assetTag: string;
    expiryDate: string;
    daysRemaining: number;
    assetUrl: string;
  }
): { subject: string; html: string } {
  const subject = `Reminder: Asset "${data.assetName}" checkout expires in ${data.daysRemaining} days`;
  const content = `
    <h2>Hi ${data.recipientName},</h2>
    <p>Your checkout for <strong>${data.assetName}</strong> (Tag: ${data.assetTag}) is expiring soon.</p>

    <div class="info-box">
      <strong>Checkout Details:</strong><br>
      Asset: ${data.assetName}<br>
      Asset Tag: ${data.assetTag}<br>
      Expected Return: ${data.expiryDate}<br>
      Days Remaining: <strong>${data.daysRemaining} days</strong>
    </div>

    <p>Please plan to return this asset by the expected return date. If you need to extend the checkout, please contact your manager or the procurement team.</p>

    <a href="${data.assetUrl}" class="button">View Asset Details</a>

    <p>If you have any questions, please don't hesitate to reach out to our support team.</p>
  `;
  return { subject, html: baseTemplate(content, subject) };
}

/**
 * Checkout Expired - Overdue
 */
export function checkoutExpiredTemplate(
  data: EmailTemplateData & {
    assetName: string;
    assetTag: string;
    expiryDate: string;
    daysOverdue: number;
    assetUrl: string;
  }
): { subject: string; html: string } {
  const subject = `URGENT: Asset "${data.assetName}" checkout is OVERDUE`;
  const content = `
    <h2>Hi ${data.recipientName},</h2>
    <p>Your checkout for <strong>${data.assetName}</strong> is <strong style="color: #dc2626;">${data.daysOverdue} days overdue</strong>.</p>

    <div class="alert error">
      <strong>This checkout is overdue!</strong><br>
      Expected Return: ${data.expiryDate}<br>
      Days Overdue: ${data.daysOverdue}
    </div>

    <p><strong>Please return this asset immediately.</strong> Extended overdue checkouts may affect your account status and asset eligibility.</p>

    <a href="${data.assetUrl}" class="button">View Asset Details</a>

    <p>If you have any questions or need to arrange a return, please contact your manager immediately.</p>
  `;
  return { subject, html: baseTemplate(content, subject) };
}

/**
 * Maintenance Task Assigned
 */
export function maintenanceAssignedTemplate(
  data: EmailTemplateData & {
    maintenanceId: string;
    assetName: string;
    assetTag: string;
    taskDescription: string;
    dueDate: string;
    priority: string;
    maintenanceUrl: string;
  }
): { subject: string; html: string } {
  const subject = `Maintenance Task Assigned: ${data.assetName}`;
  const priority = data.priority.toUpperCase();
  const priorityClass = priority === 'HIGH' ? 'alert error' : priority === 'MEDIUM' ? 'alert' : 'alert success';

  const content = `
    <h2>Hi ${data.recipientName},</h2>
    <p>A new maintenance task has been assigned to you.</p>

    <div class="info-box">
      <strong>Task Details:</strong><br>
      Asset: ${data.assetName} (${data.assetTag})<br>
      Due Date: ${data.dueDate}<br>
      Priority: <span style="color: ${priority === 'HIGH' ? '#dc2626' : priority === 'MEDIUM' ? '#f59e0b' : '#22c55e'};">${priority}</span><br>
      Description: ${data.taskDescription}
    </div>

    <a href="${data.maintenanceUrl}" class="button">View Maintenance Task</a>

    <p>Please ensure timely completion of this maintenance task to maintain asset health and warranty coverage.</p>
  `;
  return { subject, html: baseTemplate(content, subject) };
}

/**
 * Asset Status Changed
 */
export function assetStatusChangedTemplate(
  data: EmailTemplateData & {
    assetName: string;
    assetTag: string;
    oldStatus: string;
    newStatus: string;
    reason: string;
    changedBy: string;
    assetUrl: string;
  }
): { subject: string; html: string } {
  const subject = `Asset Status Changed: ${data.assetName} - ${data.newStatus}`;

  const content = `
    <h2>Hi ${data.recipientName},</h2>
    <p>An asset status has been updated.</p>

    <div class="info-box">
      <strong>Status Update:</strong><br>
      Asset: ${data.assetName} (${data.assetTag})<br>
      Previous Status: ${data.oldStatus}<br>
      New Status: <strong>${data.newStatus}</strong><br>
      Changed By: ${data.changedBy}<br>
      Reason: ${data.reason || 'No reason specified'}
    </div>

    <a href="${data.assetUrl}" class="button">View Asset</a>

    <p>For more details about this change, please contact the asset manager or check the audit logs.</p>
  `;
  return { subject, html: baseTemplate(content, subject) };
}

/**
 * Low Stock Alert
 */
export function lowStockAlertTemplate(
  data: EmailTemplateData & {
    assetType: string;
    currentStock: number;
    minimumThreshold: number;
    recommededOrderQty: number;
  }
): { subject: string; html: string } {
  const subject = `Low Stock Alert: ${data.assetType}`;

  const content = `
    <h2>Hi ${data.recipientName},</h2>
    <p>Stock levels for <strong>${data.assetType}</strong> have fallen below the minimum threshold.</p>

    <div class="alert">
      <strong>Stock Alert:</strong><br>
      Current Stock: ${data.currentStock}<br>
      Minimum Threshold: ${data.minimumThreshold}<br>
      Recommended Order Quantity: ${data.recommededOrderQty}
    </div>

    <p>Please consider placing an order to replenish inventory and avoid stock-outs.</p>

    <p>Contact the procurement team to place an order or adjust threshold settings.</p>
  `;
  return { subject, html: baseTemplate(content, subject) };
}

/**
 * Bulk Operation Completed
 */
export function bulkOperationCompletedTemplate(
  data: EmailTemplateData & {
    operationType: string;
    totalRecords: number;
    successCount: number;
    failureCount: number;
    completedAt: string;
    reportUrl: string;
  }
): { subject: string; html: string } {
  const subject = `Bulk Operation Completed: ${data.operationType}`;

  const content = `
    <h2>Hi ${data.recipientName},</h2>
    <p>Your bulk operation has been completed.</p>

    <div class="info-box">
      <strong>Operation Summary:</strong><br>
      Operation Type: ${data.operationType}<br>
      Total Records: ${data.totalRecords}<br>
      Successful: <span style="color: #22c55e;">${data.successCount}</span><br>
      Failed: <span style="color: #dc2626;">${data.failureCount}</span><br>
      Completed At: ${data.completedAt}
    </div>

    <a href="${data.reportUrl}" class="button">Download Report</a>

    <p>Review the detailed report for specific information about each record processed.</p>
  `;
  return { subject, html: baseTemplate(content, subject) };
}

/**
 * User Account Created - Welcome Email
 */
export function welcomeEmailTemplate(
  data: EmailTemplateData & {
    tempPassword: string;
    loginUrl: string;
    role: string;
  }
): { subject: string; html: string } {
  const subject = `Welcome to Enterprise Asset Management System`;

  const content = `
    <h2>Welcome to Asset Management!</h2>
    <p>Hi ${data.recipientName},</p>
    <p>Your account has been created and is ready to use.</p>

    <div class="info-box">
      <strong>Account Details:</strong><br>
      Email: ${data.recipientEmail}<br>
      Role: ${data.role}<br>
      Temporary Password: <code style="background-color: #f3f4f6; padding: 4px 8px; border-radius: 4px;">${data.tempPassword}</code>
    </div>

    <div class="alert success">
      <strong>Important:</strong> Please change your password immediately upon first login for security.
    </div>

    <a href="${data.loginUrl}" class="button">Login to Dashboard</a>

    <p>If you have any questions about using the system, please refer to the user guide or contact support.</p>
  `;
  return { subject, html: baseTemplate(content, subject) };
}

/**
 * Password Reset Request
 */
export function passwordResetTemplate(
  data: EmailTemplateData & {
    resetUrl: string;
    expiresIn: string;
  }
): { subject: string; html: string } {
  const subject = `Password Reset Request`;

  const content = `
    <h2>Password Reset Requested</h2>
    <p>Hi ${data.recipientName},</p>
    <p>We received a request to reset your password. Click the button below to proceed:</p>

    <a href="${data.resetUrl}" class="button">Reset Password</a>

    <p>This link expires in ${data.expiresIn}.</p>

    <div class="alert">
      <strong>Didn't request this?</strong> If you didn't request a password reset, you can safely ignore this email. Your account remains secure.
    </div>

    <p>For security, never share your password reset link with anyone.</p>
  `;
  return { subject, html: baseTemplate(content, subject) };
}

/**
 * Generic notification template
 */
export function genericNotificationTemplate(
  data: EmailTemplateData & {
    title: string;
    message: string;
    actionUrl?: string;
    actionText?: string;
    type?: 'info' | 'warning' | 'success' | 'error';
  }
): { subject: string; html: string } {
  const subject = data.title;
  const alertClass = data.type ? `alert ${data.type}` : '';

  const content = `
    <h2>Hi ${data.recipientName},</h2>
    ${
      alertClass
        ? `<div class="${alertClass}"><strong>${data.title}</strong></div>`
        : `<h2>${data.title}</h2>`
    }
    <p>${data.message}</p>
    ${
      data.actionUrl
        ? `<a href="${data.actionUrl}" class="button">${data.actionText || 'View Details'}</a>`
        : ''
    }
  `;
  return { subject, html: baseTemplate(content, subject) };
}
