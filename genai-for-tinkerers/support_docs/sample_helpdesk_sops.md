# Standard Operating Procedures (SOPs) & Tier 1 Troubleshooting Runbooks

**Organization**: Enterprise Information Technology Services  
**Document Revision**: 2026.2  
**Target Audience**: Help Desk Technicians (Tier 1 & Tier 1.5)

---

## SOP-101: Remote Access VPN & Multi-Factor Authentication (MFA) Failures

### 1. Scope & Symptoms
* User reports: "Cannot connect to VPN", "Login failed", "MFA push notification not arriving", or client hanging on "Securing connection..."

### 2. Tier 1 Diagnostic Checklist
1. **Verify Network Connectivity**: Ensure the user can access external websites (e.g., https://google.com) from their home Wi-Fi.
2. **Check Gateway Status**: Verify that the primary VPN gateway (`vpn.enterprise.org`) is online via the IT Status Dashboard.
3. **MFA Token Sync Check**:
   - Check the Identity Management portal (Okta/Entra ID) for account lockout or token clock drift.
   - If MFA push is not received, verify if the user's mobile device has background data enabled and is not in "Do Not Disturb" mode.
   - Generate a temporary 6-digit one-time passcode (OTP) via the admin console if push notifications fail.
4. **Local VPN Client Cache Reset**:
   - Instruct the user to disconnect, quit the VPN client completely, and restart the system service.
   - For Windows: Run `net stop "EnterpriseVPNService"` followed by `net start "EnterpriseVPNService"` in an administrative shell.
   - For macOS: Restart the system daemon via `sudo launchctl kickstart -k system/com.enterprise.vpn`.

### 3. Escalation Threshold
* If gateway reports authentication error `AUTH_RADIUS_TIMEOUT` or more than 5 users report simultaneous connection drops, escalate immediately to **Network Infrastructure & Operations (NetOps)**.

---

## SOP-102: Account Lockouts & Password Resets

### 1. Scope & Symptoms
* User reports: "Account is locked", "Incorrect password", or repeated password prompt loops across Outlook, Teams, and workstation login.

### 2. Tier 1 Diagnostic Checklist
1. **Identify Lockout Source**:
   - Query Active Directory Event ID 4740 or Okta System Logs to locate the source IP/workstation causing the repeated bad password attempts.
   - Common culprit: An old smartphone, secondary tablet, or saved credential in Windows Credential Manager attempting auto-sync with an expired password.
2. **Identity Verification**:
   - Technicians **must** verify the caller's identity via manager callback, verified employee ID, or an approved SMS verification code before performing any manual reset.
3. **Clearing Saved Credentials**:
   - Instruct user to open Windows Credential Manager (`control keymgr.dll`) $\rightarrow$ Windows Credentials, and remove all entries under `Enterprise_SSO` and `MicrosoftOffice16`.
4. **Unlocking Account**:
   - Unlock the user in Active Directory. If password reset is required, set a temporary complex password with "User must change password at next logon" enabled.

### 3. Escalation Threshold
* If repeated lockouts originate from external unknown IP addresses or indicate a credential stuffing attempt against an executive account, escalate immediately to the **Security Operations Center (SOC)**.

---

## SOP-103: Network Printer Spooler & Driver Issues

### 1. Scope & Symptoms
* User reports: "Document stuck in print queue", "Printer offline", or garbled ASCII characters printing across multiple pages.

### 2. Tier 1 Diagnostic Checklist
1. **Clear Local Print Spooler Queue**:
   - Windows command:
     ```cmd
     net stop spooler
     del /Q /F /S "%systemroot%\System32\Spool\Printers\*.*"
     net start spooler
     ```
2. **Verify Print Server Connectivity**:
   - Ping the central print server (`print01.corp.internal`).
   - Check if the physical printer IP is reachable on port 9100.
3. **Re-map Network Printer**:
   - Remove existing printer connection and re-add from the directory: `\\print01.corp.internal\<PrinterShareName>`.

### 3. Escalation Threshold
* If the entire department printer queue on `print01` is halted or the physical printer displays hardware error codes (`Fuser Failure`, `50.4 Error`), escalate to **Endpoint & Workplace Systems**.

---

## SOP-104: Suspected Phishing Email Reports & Email Security

### 1. Scope & Symptoms
* User submits an email reporting: "Suspicious invoice attached", "Urgent request from CEO asking for gift cards", or clicked a link in a suspicious email.

### 2. Tier 1 Diagnostic Checklist
1. **Immediate Containment**:
   - Ask the user: *Did you enter your username, password, or MFA code on any webpage opened from this email?*
   - Ask: *Did you open or run any downloaded attachment?*
2. **If Credentials Were Entered**:
   - Immediately force-terminate all active user sessions in Okta / Microsoft 365.
   - Reset the user's password immediately.
   - Isolate the endpoint from the network via EDR console if malicious payload was executed.
3. **Extract Email Headers**:
   - Guide the user to forward the suspicious email as an attachment (`.eml` or `.msg`) to `phish-report@enterprise.org`.

### 3. Escalation Threshold
* Any report involving executed attachments, credential entry on phishing portals, or wire transfer fraud must be escalated immediately to the **Security Operations Center (SOC)** as a Priority 1/2 Incident.

---

## SOP-105: Software Access & Privilege Elevation Requests

### 1. Scope & Symptoms
* User requests installation of specialized software (e.g., Adobe Creative Cloud, Wireshark, Visual Studio) or temporary local admin rights.

### 2. Tier 1 Diagnostic Checklist
1. **Check Self-Service Catalog**: Verify if the requested package is pre-approved and available in the Company Portal / Jamf Self Service app.
2. **License Validation**: Verify if the user's department has an allocated license seat.
3. **Approval Requirement**: All non-standard software requires written approval from the user's direct Department Manager before deployment.

### 3. Escalation Threshold
* Requests for permanent local administrator rights or access to core enterprise servers must be routed to **Identity & Access Management (IAM)**.
