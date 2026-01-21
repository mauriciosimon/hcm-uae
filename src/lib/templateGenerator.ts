import { TemplateType } from '@/types/report';
import { Employee } from '@/types/employee';
import { calculateGratuity, formatServiceDuration } from '@/lib/gratuityCalculator';

const COMPANY_NAME = 'HCM UAE Demo Company LLC';
const COMPANY_ADDRESS = 'Business Bay, Dubai, UAE';
const COMPANY_PHONE = '+971 4 123 4567';
const COMPANY_EMAIL = 'hr@hcmuae.ae';

/**
 * Get today's date formatted
 */
function getTodayFormatted(): string {
  return new Date().toLocaleDateString('en-AE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Format currency
 */
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-AE', {
    style: 'currency',
    currency: 'AED',
    minimumFractionDigits: 0,
  }).format(amount);
}

/**
 * Generate template HTML
 */
export function generateTemplateHTML(
  templateType: TemplateType,
  employee: Employee,
  additionalData?: Record<string, string>
): string {
  const templates: Record<TemplateType, () => string> = {
    employment_contract: () => generateEmploymentContract(employee),
    offer_letter: () => generateOfferLetter(employee),
    salary_certificate: () => generateSalaryCertificate(employee),
    experience_certificate: () => generateExperienceCertificate(employee),
    noc: () => generateNOC(employee, additionalData?.purpose || 'general purposes'),
    warning_letter_1: () => generateWarningLetter(employee, 1, additionalData?.reason || ''),
    warning_letter_2: () => generateWarningLetter(employee, 2, additionalData?.reason || ''),
    warning_letter_final: () => generateWarningLetter(employee, 3, additionalData?.reason || ''),
    termination_letter: () => generateTerminationLetter(employee, additionalData?.reason || ''),
    resignation_acceptance: () =>
      generateResignationAcceptance(employee, additionalData?.lastDate || ''),
    leave_application: () => generateLeaveApplication(employee),
    final_settlement: () => generateFinalSettlement(employee, additionalData?.endDate || ''),
  };

  return templates[templateType]();
}

/**
 * Base template wrapper
 */
function wrapTemplate(title: string, content: string, showArabic: boolean = true): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 12px; color: #333; padding: 50px; line-height: 1.6; }
    .letterhead { text-align: center; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 3px solid #0d9488; }
    .letterhead h1 { color: #0d9488; font-size: 24px; margin-bottom: 5px; }
    .letterhead p { color: #666; font-size: 11px; }
    .date { text-align: right; margin-bottom: 30px; }
    .reference { margin-bottom: 20px; color: #666; font-size: 11px; }
    .title { text-align: center; font-size: 16px; font-weight: bold; margin: 30px 0; text-decoration: underline; color: #0d9488; }
    .content { margin-bottom: 30px; text-align: justify; }
    .content p { margin-bottom: 15px; }
    .details-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    .details-table td { padding: 8px 12px; border: 1px solid #e5e7eb; }
    .details-table td:first-child { background: #f8fafc; font-weight: 500; width: 200px; }
    .signature-section { margin-top: 50px; }
    .signature-line { border-top: 1px solid #333; width: 200px; margin-top: 50px; }
    .footer { margin-top: 60px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 10px; color: #999; text-align: center; }
    .arabic { direction: rtl; text-align: right; font-family: 'Traditional Arabic', Arial, sans-serif; }
    .bilingual { display: flex; justify-content: space-between; }
    .bilingual > div { width: 48%; }
  </style>
</head>
<body>
  <div class="letterhead">
    <h1>${COMPANY_NAME}</h1>
    <p>${COMPANY_ADDRESS}</p>
    <p>Tel: ${COMPANY_PHONE} | Email: ${COMPANY_EMAIL}</p>
  </div>

  <div class="date">Date: ${getTodayFormatted()}</div>

  ${content}

  <div class="footer">
    This is an official document of ${COMPANY_NAME}. For verification, contact HR at ${COMPANY_EMAIL}
  </div>
</body>
</html>
  `;
}

/**
 * Employment Contract
 */
function generateEmploymentContract(employee: Employee): string {
  const content = `
    <div class="reference">Ref: EC/${employee.employeeId}/${new Date().getFullYear()}</div>

    <div class="title">EMPLOYMENT CONTRACT<br><span class="arabic">عقد العمل</span></div>

    <div class="content">
      <p>This Employment Contract is entered into between:</p>

      <p><strong>Employer:</strong> ${COMPANY_NAME}, with registered address at ${COMPANY_ADDRESS}</p>

      <p><strong>Employee:</strong> ${employee.personalInfo.firstName} ${employee.personalInfo.lastName},
      holder of ${employee.personalInfo.nationality} Passport No. ${employee.documents.passportNumber}</p>

      <p>The parties agree to the following terms and conditions:</p>

      <table class="details-table">
        <tr><td>Position</td><td>${employee.employmentInfo.jobTitle}</td></tr>
        <tr><td>Department</td><td>${employee.employmentInfo.department}</td></tr>
        <tr><td>Contract Type</td><td>${employee.employmentInfo.contractType === 'limited' ? 'Limited (Fixed Term)' : 'Unlimited'}</td></tr>
        <tr><td>Start Date</td><td>${new Date(employee.employmentInfo.employmentStartDate).toLocaleDateString('en-AE')}</td></tr>
        ${employee.employmentInfo.contractEndDate ? `<tr><td>End Date</td><td>${new Date(employee.employmentInfo.contractEndDate).toLocaleDateString('en-AE')}</td></tr>` : ''}
        <tr><td>Basic Salary</td><td>${formatCurrency(employee.compensation.basicSalary)} per month</td></tr>
        <tr><td>Housing Allowance</td><td>${formatCurrency(employee.compensation.housingAllowance)} per month</td></tr>
        <tr><td>Transport Allowance</td><td>${formatCurrency(employee.compensation.transportAllowance)} per month</td></tr>
        <tr><td>Other Allowances</td><td>${formatCurrency(employee.compensation.otherAllowances)} per month</td></tr>
        <tr><td>Total Package</td><td>${formatCurrency(employee.compensation.totalPackage)} per month</td></tr>
        <tr><td>Work Location</td><td>${employee.employmentInfo.workLocation}</td></tr>
        <tr><td>Probation Period</td><td>6 months from start date</td></tr>
      </table>

      <p>This contract is governed by the UAE Federal Decree-Law No. 33/2021 (UAE Labor Law) and its amendments.</p>

      <p>Both parties acknowledge that they have read and understood all terms and conditions of this contract.</p>
    </div>

    <div class="signature-section">
      <div class="bilingual">
        <div>
          <p><strong>For the Employer:</strong></p>
          <div class="signature-line"></div>
          <p>Authorized Signatory</p>
          <p>Date: _______________</p>
        </div>
        <div>
          <p><strong>Employee:</strong></p>
          <div class="signature-line"></div>
          <p>${employee.personalInfo.firstName} ${employee.personalInfo.lastName}</p>
          <p>Date: _______________</p>
        </div>
      </div>
    </div>
  `;

  return wrapTemplate('Employment Contract', content);
}

/**
 * Offer Letter
 */
function generateOfferLetter(employee: Employee): string {
  const content = `
    <div class="reference">Ref: OL/${employee.employeeId}/${new Date().getFullYear()}</div>

    <div class="title">OFFER OF EMPLOYMENT</div>

    <div class="content">
      <p>Dear ${employee.personalInfo.firstName} ${employee.personalInfo.lastName},</p>

      <p>We are pleased to offer you the position of <strong>${employee.employmentInfo.jobTitle}</strong>
      in our <strong>${employee.employmentInfo.department}</strong> department.</p>

      <p>Please find below the details of your employment:</p>

      <table class="details-table">
        <tr><td>Position</td><td>${employee.employmentInfo.jobTitle}</td></tr>
        <tr><td>Department</td><td>${employee.employmentInfo.department}</td></tr>
        <tr><td>Start Date</td><td>${new Date(employee.employmentInfo.employmentStartDate).toLocaleDateString('en-AE')}</td></tr>
        <tr><td>Basic Salary</td><td>${formatCurrency(employee.compensation.basicSalary)} per month</td></tr>
        <tr><td>Housing Allowance</td><td>${formatCurrency(employee.compensation.housingAllowance)} per month</td></tr>
        <tr><td>Transport Allowance</td><td>${formatCurrency(employee.compensation.transportAllowance)} per month</td></tr>
        <tr><td>Total Package</td><td>${formatCurrency(employee.compensation.totalPackage)} per month</td></tr>
        <tr><td>Annual Leave</td><td>30 days per year (as per UAE Labor Law)</td></tr>
        <tr><td>Medical Insurance</td><td>As per company policy</td></tr>
      </table>

      <p>This offer is contingent upon successful completion of reference checks and valid work authorization.</p>

      <p>Please sign and return this letter within 7 days to confirm your acceptance.</p>

      <p>We look forward to welcoming you to our team.</p>
    </div>

    <div class="signature-section">
      <p>Yours sincerely,</p>
      <div class="signature-line"></div>
      <p><strong>HR Manager</strong></p>
      <p>${COMPANY_NAME}</p>
    </div>

    <div style="margin-top: 50px; padding-top: 20px; border-top: 1px dashed #ccc;">
      <p><strong>Acceptance:</strong></p>
      <p>I, ${employee.personalInfo.firstName} ${employee.personalInfo.lastName}, accept this offer of employment.</p>
      <p style="margin-top: 30px;">Signature: _______________ Date: _______________</p>
    </div>
  `;

  return wrapTemplate('Offer Letter', content);
}

/**
 * Salary Certificate
 */
function generateSalaryCertificate(employee: Employee): string {
  const content = `
    <div class="reference">Ref: SC/${employee.employeeId}/${new Date().getFullYear()}</div>

    <div class="title">SALARY CERTIFICATE<br><span class="arabic">شهادة الراتب</span></div>

    <div class="content">
      <p>To Whom It May Concern,</p>

      <p>This is to certify that <strong>${employee.personalInfo.firstName} ${employee.personalInfo.lastName}</strong>,
      holder of ${employee.personalInfo.nationality} Passport No. <strong>${employee.documents.passportNumber}</strong>,
      is employed with ${COMPANY_NAME} since <strong>${new Date(employee.employmentInfo.employmentStartDate).toLocaleDateString('en-AE')}</strong>.</p>

      <p>The details of employment and salary are as follows:</p>

      <table class="details-table">
        <tr><td>Employee ID</td><td>${employee.employeeId}</td></tr>
        <tr><td>Designation</td><td>${employee.employmentInfo.jobTitle}</td></tr>
        <tr><td>Department</td><td>${employee.employmentInfo.department}</td></tr>
        <tr><td>Date of Joining</td><td>${new Date(employee.employmentInfo.employmentStartDate).toLocaleDateString('en-AE')}</td></tr>
        <tr><td>Employment Status</td><td>${employee.employmentInfo.employmentStatus === 'active' ? 'Active' : employee.employmentInfo.employmentStatus}</td></tr>
      </table>

      <p><strong>Monthly Salary Breakdown:</strong></p>

      <table class="details-table">
        <tr><td>Basic Salary</td><td>${formatCurrency(employee.compensation.basicSalary)}</td></tr>
        <tr><td>Housing Allowance</td><td>${formatCurrency(employee.compensation.housingAllowance)}</td></tr>
        <tr><td>Transport Allowance</td><td>${formatCurrency(employee.compensation.transportAllowance)}</td></tr>
        <tr><td>Other Allowances</td><td>${formatCurrency(employee.compensation.otherAllowances)}</td></tr>
        <tr><td><strong>Total Monthly Salary</strong></td><td><strong>${formatCurrency(employee.compensation.totalPackage)}</strong></td></tr>
      </table>

      <p>This certificate is issued upon the employee's request for official purposes and does not constitute a commitment for future employment.</p>
    </div>

    <div class="signature-section">
      <p>Yours faithfully,</p>
      <div class="signature-line"></div>
      <p><strong>HR Manager</strong></p>
      <p>${COMPANY_NAME}</p>
      <p>Company Stamp</p>
    </div>
  `;

  return wrapTemplate('Salary Certificate', content);
}

/**
 * Experience Certificate
 */
function generateExperienceCertificate(employee: Employee): string {
  const content = `
    <div class="reference">Ref: EXP/${employee.employeeId}/${new Date().getFullYear()}</div>

    <div class="title">EXPERIENCE / SERVICE CERTIFICATE<br><span class="arabic">شهادة الخبرة</span></div>

    <div class="content">
      <p>To Whom It May Concern,</p>

      <p>This is to certify that <strong>${employee.personalInfo.firstName} ${employee.personalInfo.lastName}</strong>,
      holder of ${employee.personalInfo.nationality} Passport No. <strong>${employee.documents.passportNumber}</strong>,
      was/is employed with ${COMPANY_NAME} from <strong>${new Date(employee.employmentInfo.employmentStartDate).toLocaleDateString('en-AE')}</strong>
      to <strong>${employee.employmentInfo.employmentStatus === 'active' ? 'Present' : 'Date of Leaving'}</strong>.</p>

      <table class="details-table">
        <tr><td>Position Held</td><td>${employee.employmentInfo.jobTitle}</td></tr>
        <tr><td>Department</td><td>${employee.employmentInfo.department}</td></tr>
        <tr><td>Period of Service</td><td>${new Date(employee.employmentInfo.employmentStartDate).toLocaleDateString('en-AE')} to Present</td></tr>
      </table>

      <p>During the period of employment, ${employee.personalInfo.gender === 'male' ? 'he' : 'she'} demonstrated
      professionalism, dedication, and competence in ${employee.personalInfo.gender === 'male' ? 'his' : 'her'} role.</p>

      <p>We wish ${employee.personalInfo.gender === 'male' ? 'him' : 'her'} all the best in ${employee.personalInfo.gender === 'male' ? 'his' : 'her'} future endeavors.</p>

      <p>This certificate is issued at the employee's request and without any liability on the company's part.</p>
    </div>

    <div class="signature-section">
      <p>Yours faithfully,</p>
      <div class="signature-line"></div>
      <p><strong>HR Manager</strong></p>
      <p>${COMPANY_NAME}</p>
    </div>
  `;

  return wrapTemplate('Experience Certificate', content);
}

/**
 * NOC
 */
function generateNOC(employee: Employee, purpose: string): string {
  const content = `
    <div class="reference">Ref: NOC/${employee.employeeId}/${new Date().getFullYear()}</div>

    <div class="title">NO OBJECTION CERTIFICATE<br><span class="arabic">شهادة عدم ممانعة</span></div>

    <div class="content">
      <p>To Whom It May Concern,</p>

      <p>This is to certify that ${COMPANY_NAME} has no objection to <strong>${employee.personalInfo.firstName} ${employee.personalInfo.lastName}</strong>,
      holding ${employee.personalInfo.nationality} Passport No. <strong>${employee.documents.passportNumber}</strong>,
      Emirates ID No. <strong>${employee.documents.emiratesId}</strong>,
      currently employed as <strong>${employee.employmentInfo.jobTitle}</strong> in our organization,
      for ${purpose}.</p>

      <table class="details-table">
        <tr><td>Employee Name</td><td>${employee.personalInfo.firstName} ${employee.personalInfo.lastName}</td></tr>
        <tr><td>Employee ID</td><td>${employee.employeeId}</td></tr>
        <tr><td>Passport Number</td><td>${employee.documents.passportNumber}</td></tr>
        <tr><td>Emirates ID</td><td>${employee.documents.emiratesId}</td></tr>
        <tr><td>Designation</td><td>${employee.employmentInfo.jobTitle}</td></tr>
        <tr><td>Department</td><td>${employee.employmentInfo.department}</td></tr>
      </table>

      <p>This NOC is issued at the request of the above-named employee and is valid for a period of 30 days from the date of issue.</p>
    </div>

    <div class="signature-section">
      <p>Yours faithfully,</p>
      <div class="signature-line"></div>
      <p><strong>HR Manager</strong></p>
      <p>${COMPANY_NAME}</p>
    </div>
  `;

  return wrapTemplate('No Objection Certificate', content);
}

/**
 * Warning Letter
 */
function generateWarningLetter(employee: Employee, level: 1 | 2 | 3, reason: string): string {
  const levelText = level === 1 ? 'First' : level === 2 ? 'Second' : 'Final';
  const levelAr = level === 1 ? 'إنذار أول' : level === 2 ? 'إنذار ثاني' : 'إنذار نهائي';

  const content = `
    <div class="reference">Ref: WL${level}/${employee.employeeId}/${new Date().getFullYear()}</div>

    <div class="title">${levelText.toUpperCase()} WRITTEN WARNING<br><span class="arabic">${levelAr}</span></div>

    <div class="content">
      <p>Dear ${employee.personalInfo.firstName} ${employee.personalInfo.lastName},</p>

      <p><strong>Subject: ${levelText} Written Warning</strong></p>

      <p>This letter serves as a formal ${levelText.toLowerCase()} written warning regarding your conduct/performance.</p>

      <p><strong>Details of the Issue:</strong></p>
      <p>${reason || '[Describe the issue/violation here]'}</p>

      <p><strong>Previous Warnings:</strong></p>
      <p>${level === 1 ? 'This is your first warning.' : level === 2 ? 'You received a first warning on [date].' : 'You have received two prior warnings on [dates].'}</p>

      <p><strong>Expected Improvement:</strong></p>
      <p>You are required to immediately correct this behavior/improve your performance. Failure to do so may result in
      ${level === 3 ? 'termination of your employment' : 'further disciplinary action'}.</p>

      ${level === 3 ? '<p><strong>This is your final warning. Any further violation may result in immediate termination of employment as per UAE Labor Law.</strong></p>' : ''}

      <p>Please acknowledge receipt of this warning by signing below.</p>
    </div>

    <div class="signature-section">
      <div class="bilingual">
        <div>
          <p><strong>HR Manager:</strong></p>
          <div class="signature-line"></div>
          <p>Date: _______________</p>
        </div>
        <div>
          <p><strong>Employee Acknowledgment:</strong></p>
          <div class="signature-line"></div>
          <p>${employee.personalInfo.firstName} ${employee.personalInfo.lastName}</p>
          <p>Date: _______________</p>
        </div>
      </div>
    </div>
  `;

  return wrapTemplate(`${levelText} Warning Letter`, content);
}

/**
 * Termination Letter
 */
function generateTerminationLetter(employee: Employee, reason: string): string {
  const content = `
    <div class="reference">Ref: TL/${employee.employeeId}/${new Date().getFullYear()}</div>

    <div class="title">TERMINATION OF EMPLOYMENT<br><span class="arabic">إنهاء الخدمة</span></div>

    <div class="content">
      <p>Dear ${employee.personalInfo.firstName} ${employee.personalInfo.lastName},</p>

      <p><strong>Subject: Termination of Employment</strong></p>

      <p>We regret to inform you that your employment with ${COMPANY_NAME} is being terminated effective from
      <strong>[Last Working Date]</strong>.</p>

      <p><strong>Reason for Termination:</strong></p>
      <p>${reason || '[State the reason for termination]'}</p>

      <p><strong>Notice Period:</strong></p>
      <p>As per your employment contract and UAE Labor Law, you are entitled to a notice period of 30 days.</p>

      <p><strong>Final Settlement:</strong></p>
      <p>Your final settlement, including any outstanding salary, leave encashment, and end-of-service gratuity (if applicable),
      will be processed within 14 days of your last working day as per UAE Labor Law.</p>

      <p><strong>Company Property:</strong></p>
      <p>Please ensure all company property, including ID cards, laptops, access cards, and any other items,
      are returned before your last working day.</p>

      <p>We appreciate your contributions during your tenure with us and wish you success in your future endeavors.</p>
    </div>

    <div class="signature-section">
      <p>Yours sincerely,</p>
      <div class="signature-line"></div>
      <p><strong>HR Manager</strong></p>
      <p>${COMPANY_NAME}</p>

      <div style="margin-top: 40px;">
        <p><strong>Employee Acknowledgment:</strong></p>
        <p>I acknowledge receipt of this termination letter.</p>
        <div class="signature-line"></div>
        <p>${employee.personalInfo.firstName} ${employee.personalInfo.lastName}</p>
        <p>Date: _______________</p>
      </div>
    </div>
  `;

  return wrapTemplate('Termination Letter', content);
}

/**
 * Resignation Acceptance
 */
function generateResignationAcceptance(employee: Employee, lastDate: string): string {
  const content = `
    <div class="reference">Ref: RA/${employee.employeeId}/${new Date().getFullYear()}</div>

    <div class="title">RESIGNATION ACCEPTANCE<br><span class="arabic">قبول الاستقالة</span></div>

    <div class="content">
      <p>Dear ${employee.personalInfo.firstName} ${employee.personalInfo.lastName},</p>

      <p><strong>Subject: Acceptance of Resignation</strong></p>

      <p>We acknowledge receipt of your resignation letter dated [Resignation Date] and hereby accept your resignation
      from the position of <strong>${employee.employmentInfo.jobTitle}</strong>.</p>

      <p>Your last working day will be <strong>${lastDate || '[Last Working Date]'}</strong>.</p>

      <p><strong>Handover:</strong></p>
      <p>Please ensure a proper handover of all your responsibilities, documents, and ongoing projects to your
      reporting manager or designated colleague before your last working day.</p>

      <p><strong>Exit Formalities:</strong></p>
      <ul style="margin-left: 20px;">
        <li>Complete exit interview with HR</li>
        <li>Return all company property (ID card, laptop, access cards, etc.)</li>
        <li>Obtain clearance from relevant departments</li>
      </ul>

      <p><strong>Final Settlement:</strong></p>
      <p>Your final settlement will be processed within 14 days of your last working day, as per UAE Labor Law.</p>

      <p>We thank you for your contributions and wish you the very best in your future endeavors.</p>
    </div>

    <div class="signature-section">
      <p>Yours sincerely,</p>
      <div class="signature-line"></div>
      <p><strong>HR Manager</strong></p>
      <p>${COMPANY_NAME}</p>
    </div>
  `;

  return wrapTemplate('Resignation Acceptance', content);
}

/**
 * Leave Application Form
 */
function generateLeaveApplication(employee: Employee): string {
  const content = `
    <div class="reference">Ref: LA/${employee.employeeId}/${new Date().getFullYear()}</div>

    <div class="title">LEAVE APPLICATION FORM<br><span class="arabic">طلب إجازة</span></div>

    <div class="content">
      <table class="details-table">
        <tr><td>Employee Name</td><td>${employee.personalInfo.firstName} ${employee.personalInfo.lastName}</td></tr>
        <tr><td>Employee ID</td><td>${employee.employeeId}</td></tr>
        <tr><td>Department</td><td>${employee.employmentInfo.department}</td></tr>
        <tr><td>Position</td><td>${employee.employmentInfo.jobTitle}</td></tr>
      </table>

      <p style="margin-top: 20px;"><strong>Leave Details:</strong></p>

      <table class="details-table">
        <tr><td>Type of Leave</td><td>☐ Annual  ☐ Sick  ☐ Maternity/Paternity  ☐ Unpaid  ☐ Other</td></tr>
        <tr><td>Start Date</td><td>_______________</td></tr>
        <tr><td>End Date</td><td>_______________</td></tr>
        <tr><td>Total Days</td><td>_______________</td></tr>
        <tr><td>Reason</td><td>_______________________________________________</td></tr>
        <tr><td>Contact During Leave</td><td>_______________________________________________</td></tr>
        <tr><td>Handover To</td><td>_______________________________________________</td></tr>
      </table>

      <p style="margin-top: 20px;"><strong>For Sick Leave:</strong> Medical certificate attached? ☐ Yes ☐ No</p>
    </div>

    <div class="signature-section">
      <div style="display: flex; justify-content: space-between; margin-top: 30px;">
        <div style="width: 30%;">
          <p><strong>Employee</strong></p>
          <div class="signature-line"></div>
          <p>Date: ___________</p>
        </div>
        <div style="width: 30%;">
          <p><strong>Line Manager</strong></p>
          <div class="signature-line"></div>
          <p>☐ Approved ☐ Rejected</p>
          <p>Date: ___________</p>
        </div>
        <div style="width: 30%;">
          <p><strong>HR Department</strong></p>
          <div class="signature-line"></div>
          <p>☐ Processed</p>
          <p>Date: ___________</p>
        </div>
      </div>
    </div>
  `;

  return wrapTemplate('Leave Application Form', content);
}

/**
 * Final Settlement Statement
 */
function generateFinalSettlement(employee: Employee, endDate: string): string {
  const gratuity = calculateGratuity({
    basicSalary: employee.compensation.basicSalary,
    employmentStartDate: employee.employmentInfo.employmentStartDate,
    employmentEndDate: endDate || new Date().toISOString().split('T')[0],
    contractType: employee.employmentInfo.contractType,
    terminationType: 'termination',
    unpaidLeaveDays: 0,
  });

  const content = `
    <div class="reference">Ref: FS/${employee.employeeId}/${new Date().getFullYear()}</div>

    <div class="title">FINAL SETTLEMENT STATEMENT<br><span class="arabic">بيان التسوية النهائية</span></div>

    <div class="content">
      <table class="details-table">
        <tr><td>Employee Name</td><td>${employee.personalInfo.firstName} ${employee.personalInfo.lastName}</td></tr>
        <tr><td>Employee ID</td><td>${employee.employeeId}</td></tr>
        <tr><td>Department</td><td>${employee.employmentInfo.department}</td></tr>
        <tr><td>Position</td><td>${employee.employmentInfo.jobTitle}</td></tr>
        <tr><td>Date of Joining</td><td>${new Date(employee.employmentInfo.employmentStartDate).toLocaleDateString('en-AE')}</td></tr>
        <tr><td>Last Working Day</td><td>${endDate ? new Date(endDate).toLocaleDateString('en-AE') : '_______________'}</td></tr>
        <tr><td>Total Service</td><td>${formatServiceDuration(gratuity)}</td></tr>
      </table>

      <p style="margin-top: 30px;"><strong>ENTITLEMENTS:</strong></p>

      <table class="details-table">
        <tr><td>Outstanding Salary</td><td style="text-align: right;">AED _______________</td></tr>
        <tr><td>Leave Encashment (___ days)</td><td style="text-align: right;">AED _______________</td></tr>
        <tr><td>End of Service Gratuity</td><td style="text-align: right;">${formatCurrency(gratuity.cappedGratuity)}</td></tr>
        <tr><td>Repatriation Ticket</td><td style="text-align: right;">AED _______________</td></tr>
        <tr><td>Other Allowances</td><td style="text-align: right;">AED _______________</td></tr>
        <tr style="background: #f0fdfa;"><td><strong>TOTAL ENTITLEMENTS</strong></td><td style="text-align: right;"><strong>AED _______________</strong></td></tr>
      </table>

      <p style="margin-top: 20px;"><strong>DEDUCTIONS:</strong></p>

      <table class="details-table">
        <tr><td>Outstanding Loan/Advance</td><td style="text-align: right;">AED _______________</td></tr>
        <tr><td>Notice Period Shortage</td><td style="text-align: right;">AED _______________</td></tr>
        <tr><td>Other Deductions</td><td style="text-align: right;">AED _______________</td></tr>
        <tr style="background: #fef2f2;"><td><strong>TOTAL DEDUCTIONS</strong></td><td style="text-align: right;"><strong>AED _______________</strong></td></tr>
      </table>

      <table class="details-table" style="margin-top: 20px;">
        <tr style="background: #0d9488; color: white;"><td><strong>NET PAYABLE AMOUNT</strong></td><td style="text-align: right;"><strong>AED _______________</strong></td></tr>
      </table>

      <p style="margin-top: 30px;">I acknowledge receipt of the above final settlement amount and confirm that I have no further claims against ${COMPANY_NAME}.</p>
    </div>

    <div class="signature-section">
      <div class="bilingual">
        <div>
          <p><strong>For the Company:</strong></p>
          <div class="signature-line"></div>
          <p>HR Manager</p>
          <p>Date: _______________</p>
        </div>
        <div>
          <p><strong>Employee:</strong></p>
          <div class="signature-line"></div>
          <p>${employee.personalInfo.firstName} ${employee.personalInfo.lastName}</p>
          <p>Date: _______________</p>
        </div>
      </div>
    </div>
  `;

  return wrapTemplate('Final Settlement Statement', content);
}
