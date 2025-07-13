import React from "react";

interface OfferLetterTemplateProps {
  date: string;
  name: string;
  position: string;
  passportNumber: string;
  contractPeriod: string;
  workingHours: string;
  workingDays: string;
  basicSalary: string;
  foodAllowance: string;
  transportationAllowance: string;
  accommodationAllowance: string;
  mobileAllowance: string;
  otherAllowance: string;
  total: string;
  tickets: string;
  leaveSalary: string;
  healthInsurance: string;
  endOfService: string;
  probationPeriod: string;
  companyName: string;
  logoUrl: string;
}

const OfferLetterTemplate: React.FC<OfferLetterTemplateProps> = ({
  date,
  name,
  position,
  passportNumber,
  contractPeriod,
  workingHours,
  workingDays,
  basicSalary,
  foodAllowance,
  transportationAllowance,
  accommodationAllowance,
  mobileAllowance,
  otherAllowance,
  total,
  tickets,
  leaveSalary,
  healthInsurance,
  endOfService,
  probationPeriod,
  companyName,
  logoUrl,
}) => {
  return (
    <div
      style={{
        width: "210mm",
        minHeight: "297mm",
        padding: "32px 40px",
        fontFamily: "Arial, sans-serif",
        background: "#fff",
        color: "#222",
        fontSize: "13px",
        boxSizing: "border-box",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
        <img
          src={logoUrl}
          alt="Company Logo"
          style={{
            width: 80,
            height: 80,
            objectFit: "contain",
            marginRight: 24,
          }}
        />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, color: "#888" }}>{companyName}</div>
        </div>
        <div style={{ textAlign: "right", fontSize: 13 }}>
          <div>Date: - {date}</div>
        </div>
      </div>
      <h2
        style={{
          textAlign: "center",
          fontWeight: 700,
          textDecoration: "underline",
          margin: "16px 0 8px 0",
        }}
      >
        JOB OFFER
      </h2>
      <div style={{ marginBottom: 12 }}>
        <span style={{ fontWeight: 700 }}>To:</span>{" "}
        <span style={{ marginRight: 24 }}></span>
        <span style={{ fontWeight: 700 }}>Name</span>: {name}
      </div>
      <div style={{ marginBottom: 12 }}>
        <span style={{ fontWeight: 700 }}>Position</span>: {position}
        <span style={{ marginLeft: 32, fontWeight: 700 }}>Passport Number</span>
        : {passportNumber}
      </div>
      <div style={{ marginBottom: 16 }}>
        It is my pleasure to offer you some possible employment in our company
        in accordance with the terms and conditions stated herein.
      </div>
      {/* Contract Details */}
      <div
        style={{
          background: "#e9f1fa",
          fontWeight: 700,
          padding: "4px 8px",
          marginBottom: 0,
          fontSize: 13,
        }}
      >
        Contract Details
      </div>
      <table
        style={{ width: "100%", borderCollapse: "collapse", marginBottom: 8 }}
      >
        <tbody>
          <tr>
            <td>Contract Period</td>
            <td>: {contractPeriod}</td>
          </tr>
          <tr>
            <td>Working Hours</td>
            <td>: {workingHours}</td>
          </tr>
          <tr>
            <td>Working Days</td>
            <td>: {workingDays}</td>
          </tr>
        </tbody>
      </table>
      {/* Compensation Package */}
      <div
        style={{
          background: "#e9f1fa",
          fontWeight: 700,
          padding: "4px 8px",
          marginBottom: 0,
          fontSize: 13,
        }}
      >
        Compensation Package
      </div>
      <table
        style={{ width: "100%", borderCollapse: "collapse", marginBottom: 8 }}
      >
        <tbody>
          <tr>
            <td>Basic Salary</td>
            <td>: {basicSalary} Qr</td>
          </tr>
          <tr>
            <td>Food Allowance</td>
            <td>: {foodAllowance} Qr</td>
          </tr>
          <tr>
            <td>Transportation Allowance</td>
            <td>: {transportationAllowance}</td>
          </tr>
          <tr>
            <td>Accommodation Allowance</td>
            <td>: {accommodationAllowance}</td>
          </tr>
          <tr>
            <td>Mobile Allowance</td>
            <td>: {mobileAllowance} Qr</td>
          </tr>
          <tr>
            <td>Other allowance</td>
            <td>: {otherAllowance}</td>
          </tr>
          <tr style={{ fontWeight: 700 }}>
            <td>Total</td>
            <td style={{ fontWeight: 700, fontSize: 15 }}>: {total} Qr</td>
          </tr>
        </tbody>
      </table>
      {/* Other Benefit */}
      <div
        style={{
          background: "#e9f1fa",
          fontWeight: 700,
          padding: "4px 8px",
          marginBottom: 0,
          fontSize: 13,
        }}
      >
        Other Benefit
      </div>
      <table
        style={{ width: "100%", borderCollapse: "collapse", marginBottom: 8 }}
      >
        <tbody>
          <tr>
            <td>Tickets</td>
            <td>: {tickets}</td>
          </tr>
          <tr>
            <td>Leave Salary</td>
            <td>: {leaveSalary}</td>
          </tr>
          <tr>
            <td>Health Insurance</td>
            <td>: {healthInsurance}</td>
          </tr>
          <tr>
            <td>End of Service</td>
            <td>: {endOfService}</td>
          </tr>
        </tbody>
      </table>
      {/* Performance */}
      <div
        style={{
          background: "#e9f1fa",
          fontWeight: 700,
          padding: "4px 8px",
          marginBottom: 0,
          fontSize: 13,
        }}
      >
        Performance
      </div>
      <table
        style={{ width: "100%", borderCollapse: "collapse", marginBottom: 16 }}
      >
        <tbody>
          <tr>
            <td>Probation Period</td>
            <td>: {probationPeriod}</td>
          </tr>
        </tbody>
      </table>
      <div style={{ margin: "32px 0 16px 0" }}>Yours truly,</div>
      <table
        style={{ width: "100%", borderCollapse: "collapse", marginBottom: 24 }}
      >
        <tbody>
          <tr>
            <td
              style={{
                textAlign: "center",
                fontStyle: "italic",
                fontWeight: 700,
              }}
            >
              Company Signature
            </td>
            <td
              style={{
                textAlign: "center",
                fontStyle: "italic",
                fontWeight: 700,
              }}
            >
              Employee Acceptance
            </td>
          </tr>
        </tbody>
      </table>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: 12,
        }}
      >
        <div>
          Authorized Signatory
          <br />
          <span style={{ color: "#b00" }}>
            (Client Acceptance Through Findly)
          </span>
          <br />
          Date : {date}
        </div>
        <div style={{ color: "#b00", fontWeight: 700 }}>
          Employee Finger Stamp
        </div>
      </div>
    </div>
  );
};

export default OfferLetterTemplate;
