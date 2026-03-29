import nodemailer from 'nodemailer';

const GMAIL_USER = process.env.GMAIL_USER;
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;

function getTransporter() {
  if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
    throw new Error('Gmail credentials not configured. Please set GMAIL_USER and GMAIL_APP_PASSWORD secrets.');
  }
  
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: GMAIL_USER,
      pass: GMAIL_APP_PASSWORD
    }
  });
}

export async function sendEnrollmentConfirmation(to: string, studentName: string, courseName: string) {
  try {
    const transporter = getTransporter();
    
    const info = await transporter.sendMail({
      from: `"Yusuf Invest" <${GMAIL_USER}>`,
      to: to,
      subject: `Welcome to ${courseName} - Yusuf Invest`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #1e40af; font-size: 28px; margin: 0;">Yusuf Invest</h1>
            <p style="color: #64748b; margin: 5px 0 0 0;">Financial Education Platform</p>
          </div>
          
          <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: white; padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 30px;">
            <h2 style="margin: 0 0 10px 0; font-size: 24px;">Welcome aboard, ${studentName}!</h2>
            <p style="margin: 0; opacity: 0.9;">You've successfully enrolled in a new course</p>
          </div>
          
          <div style="background: #f8fafc; padding: 25px; border-radius: 12px; margin-bottom: 30px;">
            <h3 style="color: #1e293b; margin: 0 0 15px 0; font-size: 18px;">Course Details</h3>
            <p style="color: #475569; margin: 0; font-size: 16px;"><strong>${courseName}</strong></p>
          </div>
          
          <div style="text-align: center; margin-bottom: 30px;">
            <a href="https://yusufalrahbi.com/my-courses" style="display: inline-block; background: #1e40af; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">Start Learning</a>
          </div>
          
          <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; text-align: center;">
            <p style="color: #94a3b8; font-size: 14px; margin: 0;">Build your financial future with Yusuf Invest</p>
          </div>
        </div>
      `,
    });
    
    console.log('Enrollment email sent successfully:', info.messageId);
    return { success: true, data: { messageId: info.messageId } };
  } catch (error: any) {
    console.error('Failed to send enrollment email:', error?.message || error);
    return { success: false, error: error?.message || 'Unknown email error' };
  }
}

export async function sendConsultationConfirmation(
  to: string,
  name: string,
  date: string,
  time: string,
  sessionType: string
) {
  try {
    const transporter = getTransporter();
    
    const info = await transporter.sendMail({
      from: `"Yusuf Invest" <${GMAIL_USER}>`,
      to: to,
      subject: `Consultation Confirmed - ${date} at ${time}`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #1e40af; font-size: 28px; margin: 0;">Yusuf Invest</h1>
            <p style="color: #64748b; margin: 5px 0 0 0;">Financial Education Platform</p>
          </div>
          
          <div style="background: linear-gradient(135deg, #059669 0%, #10b981 100%); color: white; padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 30px;">
            <h2 style="margin: 0 0 10px 0; font-size: 24px;">Consultation Confirmed!</h2>
            <p style="margin: 0; opacity: 0.9;">Hi ${name}, your session is booked</p>
          </div>
          
          <div style="background: #f8fafc; padding: 25px; border-radius: 12px; margin-bottom: 30px;">
            <h3 style="color: #1e293b; margin: 0 0 15px 0; font-size: 18px;">Session Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="color: #64748b; padding: 8px 0;">Session Type:</td>
                <td style="color: #1e293b; font-weight: 600; padding: 8px 0;">${sessionType}</td>
              </tr>
              <tr>
                <td style="color: #64748b; padding: 8px 0;">Date:</td>
                <td style="color: #1e293b; font-weight: 600; padding: 8px 0;">${date}</td>
              </tr>
              <tr>
                <td style="color: #64748b; padding: 8px 0;">Time:</td>
                <td style="color: #1e293b; font-weight: 600; padding: 8px 0;">${time}</td>
              </tr>
            </table>
          </div>
          
          <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin-bottom: 30px;">
            <p style="color: #92400e; margin: 0; font-size: 14px;">
              <strong>Reminder:</strong> Please be available 5 minutes before your scheduled time. You'll receive a meeting link closer to the session.
            </p>
          </div>
          
          <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; text-align: center;">
            <p style="color: #94a3b8; font-size: 14px; margin: 0;">Build your financial future with Yusuf Invest</p>
          </div>
        </div>
      `,
    });
    
    return { success: true, data: { messageId: info.messageId } };
  } catch (error: any) {
    console.error('Failed to send consultation email:', error?.message || error);
    return { success: false, error: error?.message || 'Unknown email error' };
  }
}

export async function sendWorkshopInquiryNotification(
  organizationName: string,
  contactName: string,
  email: string,
  message: string
) {
  try {
    const transporter = getTransporter();
    
    const info = await transporter.sendMail({
      from: `"Yusuf Invest" <${GMAIL_USER}>`,
      to: GMAIL_USER!,
      subject: `New Workshop Inquiry from ${organizationName}`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #1e40af; font-size: 28px; margin: 0;">Yusuf Invest</h1>
            <p style="color: #64748b; margin: 5px 0 0 0;">Admin Notification</p>
          </div>
          
          <div style="background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); color: white; padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 30px;">
            <h2 style="margin: 0 0 10px 0; font-size: 24px;">New Workshop Inquiry</h2>
            <p style="margin: 0; opacity: 0.9;">A new corporate training request has arrived</p>
          </div>
          
          <div style="background: #f8fafc; padding: 25px; border-radius: 12px; margin-bottom: 30px;">
            <h3 style="color: #1e293b; margin: 0 0 15px 0; font-size: 18px;">Contact Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="color: #64748b; padding: 8px 0;">Organization:</td>
                <td style="color: #1e293b; font-weight: 600; padding: 8px 0;">${organizationName}</td>
              </tr>
              <tr>
                <td style="color: #64748b; padding: 8px 0;">Contact Person:</td>
                <td style="color: #1e293b; font-weight: 600; padding: 8px 0;">${contactName}</td>
              </tr>
              <tr>
                <td style="color: #64748b; padding: 8px 0;">Email:</td>
                <td style="color: #1e293b; font-weight: 600; padding: 8px 0;">${email}</td>
              </tr>
            </table>
          </div>
          
          <div style="background: #f8fafc; padding: 25px; border-radius: 12px; margin-bottom: 30px;">
            <h3 style="color: #1e293b; margin: 0 0 15px 0; font-size: 18px;">Message</h3>
            <p style="color: #475569; margin: 0; line-height: 1.6;">${message}</p>
          </div>
          
          <div style="text-align: center; margin-bottom: 30px;">
            <a href="https://yusufalrahbi.com/admin/requests" style="display: inline-block; background: #1e40af; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">View in Dashboard</a>
          </div>
        </div>
      `,
    });
    
    return { success: true, data: { messageId: info.messageId } };
  } catch (error: any) {
    console.error('Failed to send workshop notification:', error?.message || error);
    return { success: false, error: error?.message || 'Unknown email error' };
  }
}

export async function sendPaymentConfirmation(
  to: string,
  name: string,
  amount: number,
  currency: string,
  referenceCode: string,
  productType: string
) {
  try {
    const transporter = getTransporter();
    
    const productName = productType === 'course' ? 'Course Enrollment' : 'Consultation Session';
    const formattedAmount = `${amount} ${currency}`;
    
    const info = await transporter.sendMail({
      from: `"Yusuf Invest" <${GMAIL_USER}>`,
      to: to,
      subject: `Payment Confirmed - ${referenceCode}`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #1e40af; font-size: 28px; margin: 0;">Yusuf Invest</h1>
            <p style="color: #64748b; margin: 5px 0 0 0;">Financial Education Platform</p>
          </div>
          
          <div style="background: linear-gradient(135deg, #059669 0%, #10b981 100%); color: white; padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 30px;">
            <h2 style="margin: 0 0 10px 0; font-size: 24px;">Payment Confirmed!</h2>
            <p style="margin: 0; opacity: 0.9;">Thank you, ${name}</p>
          </div>
          
          <div style="background: #f8fafc; padding: 25px; border-radius: 12px; margin-bottom: 30px;">
            <h3 style="color: #1e293b; margin: 0 0 15px 0; font-size: 18px;">Payment Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="color: #64748b; padding: 8px 0;">Reference:</td>
                <td style="color: #1e293b; font-weight: 600; padding: 8px 0;">${referenceCode}</td>
              </tr>
              <tr>
                <td style="color: #64748b; padding: 8px 0;">Product:</td>
                <td style="color: #1e293b; font-weight: 600; padding: 8px 0;">${productName}</td>
              </tr>
              <tr>
                <td style="color: #64748b; padding: 8px 0;">Amount:</td>
                <td style="color: #1e293b; font-weight: 600; padding: 8px 0;">${formattedAmount}</td>
              </tr>
              <tr>
                <td style="color: #64748b; padding: 8px 0;">Status:</td>
                <td style="color: #059669; font-weight: 600; padding: 8px 0;">Approved</td>
              </tr>
            </table>
          </div>
          
          <div style="text-align: center; margin-bottom: 30px;">
            <a href="https://yusufalrahbi.com/my-courses" style="display: inline-block; background: #1e40af; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">Go to My Courses</a>
          </div>
          
          <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; text-align: center;">
            <p style="color: #94a3b8; font-size: 14px; margin: 0;">Build your financial future with Yusuf Invest</p>
          </div>
        </div>
      `,
    });
    
    return { success: true, data: { messageId: info.messageId } };
  } catch (error: any) {
    console.error('Failed to send payment confirmation:', error?.message || error);
    return { success: false, error: error?.message || 'Unknown email error' };
  }
}

export async function sendWelcomeEmail(to: string, name: string) {
  try {
    const transporter = getTransporter();
    
    const info = await transporter.sendMail({
      from: `"Yusuf Invest" <${GMAIL_USER}>`,
      to: to,
      subject: `Welcome to Yusuf Invest | مرحباً بك في يوسف للاستثمار`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <!-- Header -->
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #1e40af; font-size: 28px; margin: 0;">Yusuf Invest</h1>
            <p style="color: #64748b; margin: 5px 0 0 0;">يوسف للاستثمار</p>
          </div>
          
          <!-- Welcome Banner -->
          <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: white; padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 30px;">
            <h2 style="margin: 0 0 10px 0; font-size: 24px;">Welcome, ${name}!</h2>
            <p style="margin: 0; opacity: 0.9; font-size: 20px; direction: rtl;">!مرحباً بك، ${name}</p>
          </div>
          
          <!-- English Section -->
          <div style="background: #f8fafc; padding: 25px; border-radius: 12px; margin-bottom: 20px;">
            <h3 style="color: #1e293b; margin: 0 0 15px 0; font-size: 18px;">Your Financial Education Journey Starts Here</h3>
            <p style="color: #475569; margin: 0 0 15px 0; line-height: 1.6;">
              Thank you for joining Yusuf Invest! We're excited to help you build your financial knowledge and investment skills.
            </p>
            <p style="color: #475569; margin: 0; line-height: 1.6;">
              <strong>What you can do:</strong>
            </p>
            <ul style="color: #475569; margin: 10px 0 0 0; padding-left: 20px; line-height: 1.8;">
              <li>Browse our courses on investing and financial literacy</li>
              <li>Book one-on-one consultation sessions</li>
              <li>Request corporate workshops for your organization</li>
            </ul>
          </div>
          
          <!-- Arabic Section -->
          <div style="background: #f8fafc; padding: 25px; border-radius: 12px; margin-bottom: 30px; direction: rtl; text-align: right;">
            <h3 style="color: #1e293b; margin: 0 0 15px 0; font-size: 18px;">رحلتك في التعليم المالي تبدأ هنا</h3>
            <p style="color: #475569; margin: 0 0 15px 0; line-height: 1.8;">
              شكراً لانضمامك إلى يوسف للاستثمار! نحن متحمسون لمساعدتك في بناء معرفتك المالية ومهاراتك الاستثمارية.
            </p>
            <p style="color: #475569; margin: 0; line-height: 1.6;">
              <strong>ما يمكنك فعله:</strong>
            </p>
            <ul style="color: #475569; margin: 10px 0 0 0; padding-right: 20px; line-height: 1.8;">
              <li>تصفح دوراتنا في الاستثمار والثقافة المالية</li>
              <li>احجز جلسات استشارية فردية</li>
              <li>اطلب ورش عمل للشركات لمؤسستك</li>
            </ul>
          </div>
          
          <!-- CTA Button -->
          <div style="text-align: center; margin-bottom: 30px;">
            <a href="https://yusufalrahbi.com/courses" style="display: inline-block; background: #1e40af; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">
              Explore Courses | استكشف الدورات
            </a>
          </div>
          
          <!-- Footer -->
          <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; text-align: center;">
            <p style="color: #94a3b8; font-size: 14px; margin: 0;">Build your financial future with Yusuf Invest</p>
            <p style="color: #94a3b8; font-size: 14px; margin: 5px 0 0 0; direction: rtl;">ابنِ مستقبلك المالي مع يوسف للاستثمار</p>
          </div>
        </div>
      `,
    });
    
    console.log('Welcome email sent successfully:', info.messageId);
    return { success: true, data: { messageId: info.messageId } };
  } catch (error: any) {
    console.error('Failed to send welcome email:', error?.message || error);
    return { success: false, error: error?.message || 'Unknown email error' };
  }
}

export async function sendBookingReceived(
  to: string,
  name: string,
  date: string,
  time: string,
  sessionType: string,
  referenceCode: string
) {
  try {
    const transporter = getTransporter();
    const info = await transporter.sendMail({
      from: `"Yusuf Invest" <${GMAIL_USER}>`,
      to,
      subject: `Booking Received - ${referenceCode} | تم استلام حجزك`,
      html: `
        <div style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
          <div style="text-align:center;margin-bottom:30px;">
            <h1 style="color:#D4A843;font-size:28px;margin:0;">Yusuf Invest</h1>
            <p style="color:#64748b;margin:5px 0 0 0;">يوسف للاستثمار</p>
          </div>
          <div style="background:linear-gradient(135deg,#0f172a 0%,#1e293b 100%);color:white;padding:30px;border-radius:12px;text-align:center;margin-bottom:30px;border:1px solid rgba(212,168,67,0.3);">
            <h2 style="margin:0 0 10px 0;font-size:24px;color:#D4A843;">Booking Received!</h2>
            <p style="margin:0;opacity:0.8;">Hi ${name}, we've received your consultation request.</p>
            <p style="margin:6px 0 0;opacity:0.6;font-size:13px;direction:rtl;">مرحباً ${name}، تم استلام طلب الاستشارة الخاص بك.</p>
          </div>
          <div style="background:#f8fafc;padding:25px;border-radius:12px;margin-bottom:20px;">
            <h3 style="color:#1e293b;margin:0 0 15px 0;font-size:18px;">Session Details</h3>
            <table style="width:100%;border-collapse:collapse;">
              <tr><td style="color:#64748b;padding:8px 0;">Reference:</td><td style="color:#1e293b;font-weight:700;padding:8px 0;font-family:monospace;">${referenceCode}</td></tr>
              <tr><td style="color:#64748b;padding:8px 0;">Session:</td><td style="color:#1e293b;font-weight:600;padding:8px 0;">${sessionType}</td></tr>
              <tr><td style="color:#64748b;padding:8px 0;">Date:</td><td style="color:#1e293b;font-weight:600;padding:8px 0;">${date}</td></tr>
              <tr><td style="color:#64748b;padding:8px 0;">Time:</td><td style="color:#1e293b;font-weight:600;padding:8px 0;">${time}</td></tr>
            </table>
          </div>
          <div style="background:#fef9ee;border:1px solid #f59e0b;padding:15px;border-radius:8px;margin-bottom:20px;">
            <p style="color:#92400e;margin:0;font-size:14px;line-height:1.6;">
              <strong>Next step:</strong> Please complete your payment transfer and include the reference code <strong>${referenceCode}</strong>. Your session will be confirmed once payment is verified.
            </p>
            <p style="color:#92400e;margin:8px 0 0;font-size:13px;line-height:1.6;direction:rtl;">
              الخطوة التالية: يرجى إتمام التحويل المالي وذكر رمز المرجع <strong>${referenceCode}</strong>. سيتم تأكيد جلستك بعد التحقق من الدفعة.
            </p>
          </div>
          <div style="border-top:1px solid #e2e8f0;padding-top:20px;text-align:center;">
            <p style="color:#94a3b8;font-size:14px;margin:0;">Yusuf Invest · يوسف للاستثمار</p>
          </div>
        </div>
      `,
    });
    return { success: true, data: { messageId: info.messageId } };
  } catch (error: any) {
    console.error('Failed to send booking received email:', error?.message || error);
    return { success: false, error: error?.message || 'Unknown email error' };
  }
}

const ADMIN_EMAIL = "hello@yusufalrahbi.com";

export async function sendAdminPaymentNotification(
  userName: string,
  userEmail: string,
  amount: number,
  currency: string,
  referenceCode: string,
  productType: string,
  productName: string
) {
  try {
    const transporter = getTransporter();
    
    const productLabel = productType === 'course' ? 'Course' : 'Consultation';
    const formattedAmount = `${amount} ${currency}`;
    
    const info = await transporter.sendMail({
      from: `"Yusuf Invest" <${GMAIL_USER}>`,
      to: ADMIN_EMAIL,
      subject: `New Payment Pending - ${referenceCode}`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #1e40af; font-size: 28px; margin: 0;">Yusuf Invest</h1>
            <p style="color: #64748b; margin: 5px 0 0 0;">Admin Notification</p>
          </div>
          
          <div style="background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%); color: white; padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 30px;">
            <h2 style="margin: 0 0 10px 0; font-size: 24px;">New Payment Awaiting Approval</h2>
            <p style="margin: 0; opacity: 0.9;">A customer has submitted a bank transfer</p>
          </div>
          
          <div style="background: #f8fafc; padding: 25px; border-radius: 12px; margin-bottom: 30px;">
            <h3 style="color: #1e293b; margin: 0 0 15px 0; font-size: 18px;">Payment Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="color: #64748b; padding: 8px 0;">Reference:</td>
                <td style="color: #1e293b; font-weight: 600; padding: 8px 0;">${referenceCode}</td>
              </tr>
              <tr>
                <td style="color: #64748b; padding: 8px 0;">Customer:</td>
                <td style="color: #1e293b; font-weight: 600; padding: 8px 0;">${userName}</td>
              </tr>
              <tr>
                <td style="color: #64748b; padding: 8px 0;">Email:</td>
                <td style="color: #1e293b; font-weight: 600; padding: 8px 0;">${userEmail}</td>
              </tr>
              <tr>
                <td style="color: #64748b; padding: 8px 0;">Type:</td>
                <td style="color: #1e293b; font-weight: 600; padding: 8px 0;">${productLabel}</td>
              </tr>
              <tr>
                <td style="color: #64748b; padding: 8px 0;">Product:</td>
                <td style="color: #1e293b; font-weight: 600; padding: 8px 0;">${productName}</td>
              </tr>
              <tr>
                <td style="color: #64748b; padding: 8px 0;">Amount:</td>
                <td style="color: #1e293b; font-weight: 600; padding: 8px 0;">${formattedAmount}</td>
              </tr>
              <tr>
                <td style="color: #64748b; padding: 8px 0;">Status:</td>
                <td style="color: #f59e0b; font-weight: 600; padding: 8px 0;">Pending Approval</td>
              </tr>
            </table>
          </div>
          
          <div style="text-align: center; margin-bottom: 30px;">
            <a href="https://yusufalrahbi.com/admin/payments" style="display: inline-block; background: #1e40af; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">Review in Dashboard</a>
          </div>
          
          <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin-bottom: 30px;">
            <p style="color: #92400e; margin: 0; font-size: 14px;">
              <strong>Action Required:</strong> Please verify the bank transfer and approve or reject this payment in your admin dashboard.
            </p>
          </div>
          
          <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; text-align: center;">
            <p style="color: #94a3b8; font-size: 14px; margin: 0;">Yusuf Invest Admin System</p>
          </div>
        </div>
      `,
    });
    
    console.log('Admin payment notification sent:', info.messageId);
    return { success: true, data: { messageId: info.messageId } };
  } catch (error: any) {
    console.error('Failed to send admin notification:', error?.message || error);
    return { success: false, error: error?.message || 'Unknown email error' };
  }
}

export async function sendPasswordResetEmail(to: string, resetLink: string) {
  try {
    const transporter = getTransporter();
    
    const info = await transporter.sendMail({
      from: `"Yusuf Invest" <${GMAIL_USER}>`,
      to: to,
      subject: `Reset Your Password - Yusuf Invest | إعادة تعيين كلمة المرور`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #1e40af; font-size: 28px; margin: 0;">Yusuf Invest</h1>
          </div>
          
          <div style="background: #f8fafc; padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 30px;">
            <h2 style="color: #1e293b; margin: 0 0 15px 0;">Password Reset Request</h2>
            <p style="color: #475569; line-height: 1.6; margin-bottom: 25px;">
              We received a request to reset your password. Click the button below to choose a new one.
            </p>
            <p style="color: #475569; line-height: 1.6; margin-bottom: 25px; direction: rtl;">
              تلقينا طلباً لإعادة تعيين كلمة المرور الخاصة بك. انقر فوق الزر أدناه لاختيار كلمة مرور جديدة.
            </p>
            
            <a href="${resetLink}" style="display: inline-block; background: #1e40af; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">
              Reset Password | إعادة تعيين كلمة المرور
            </a>
            
            <p style="color: #94a3b8; font-size: 13px; margin-top: 25px;">
              If you didn't request this, you can safely ignore this email.
            </p>
          </div>
        </div>
      `,
    });
    
    return { success: true, data: { messageId: info.messageId } };
  } catch (error: any) {
    console.error('Failed to send password reset email:', error?.message || error);
    return { success: false, error: error?.message || 'Unknown email error' };
  }
}
