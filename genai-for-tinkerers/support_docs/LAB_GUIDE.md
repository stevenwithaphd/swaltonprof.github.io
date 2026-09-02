# Lab 2B: Building a Production Tier 1.5 Help Desk Mentor Gem

**Module:** Module 2: Grounded Enterprise Intelligence: NotebookLM & Gems  
**Target Environment:** Google Gemini (Advanced/Enterprise) & Google NotebookLM  
**Estimated Completion Time:** 45 Minutes  

---

## Lab Objectives
1. Configure and deploy a custom **Tier 1.5 Help Desk Mentor & Ticket Assistant** Gem using a structured YAML specification.
2. Ground the Gem with technical runbooks ([sample_helpdesk_sops.md](./sample_helpdesk_sops.md)) and customer communication guidelines ([manager_engagement_guide.md](./manager_engagement_guide.md)).
3. Test deterministic contact and team lookup using an uploaded escalation roster ([sample_escalation_roster.csv](./sample_escalation_roster.csv)).
4. Validate strict four-section output structuring, jargon-free client messaging, and explicit missing-data error handling.

---

## Required Lab Assets
* [helpdesk_mentor_gem_template.yaml](./helpdesk_mentor_gem_template.yaml): The production YAML system prompt.
* [sample_helpdesk_sops.md](./sample_helpdesk_sops.md): Standard Operating Procedures and Tier 1 diagnostic runbooks.
* [manager_engagement_guide.md](./manager_engagement_guide.md): Manager's client communication playbook and verbiage guide.
* [sample_escalation_roster.csv](./sample_escalation_roster.csv): Department escalation directory with contacts and SLAs.

---

## Step-by-Step Execution Guide

### Part 1: Configuring the Custom Gem in Google Gemini

1. Navigate to **Google Gemini** ([gemini.google.com](https://gemini.google.com)).
2. In the left navigation sidebar, click on **Gems** $\rightarrow$ **New Gem** (or **Gem Manager**).
3. Set the Gem Name: `Tier 1.5 Help Desk Mentor`.
4. Open [helpdesk_mentor_gem_template.yaml](./helpdesk_mentor_gem_template.yaml), copy the entire YAML content, and paste it into the **Instructions** box.
5. In the **Knowledge** section (if supported in your Google Workspace tier), upload:
   * [sample_helpdesk_sops.md](./sample_helpdesk_sops.md)
   * [manager_engagement_guide.md](./manager_engagement_guide.md)
   * [sample_escalation_roster.csv](./sample_escalation_roster.csv)
   *(Note: If your tier does not support persistent file attachments in Gem Manager, you can upload or paste them into the conversation session when testing).*
6. Click **Save / Create Gem**.

![Tier 1.5 Help Desk Technical Mentor Gem Configuration](/genai-for-tinkerers/images/helpdesk_mentor_gem_setup.png){: style="display: block; width: 100%; max-width: 650px; margin: 1.5rem auto; border-radius: 8px; box-shadow: 0 0 25px rgba(0, 255, 170, 0.15);" }

---

### Part 2: Testing Live Ticket Triage & Grounded Diagnostics

1. Open a new chat session inside your newly created **Tier 1.5 Help Desk Mentor** Gem.
2. If not uploaded as persistent knowledge, attach or paste the contents of `sample_helpdesk_sops.md`, `manager_engagement_guide.md`, and `sample_escalation_roster.csv`.
3. Issue the following prompt:

```text
Help me triage this incoming ticket from user 'Eleanor Vance':

Ticket Subject: Cannot connect to VPN from home - getting error AUTH_RADIUS_TIMEOUT
Ticket Body:
"I am trying to log into the corporate VPN from home to finish a critical quarterly report, but the client gets stuck on 'Securing connection' and then gives me an AUTH_RADIUS_TIMEOUT error. I need this fixed immediately!"
```

4. **Verify the Output Against Acceptance Criteria**:
   * **Section 1 (Mentor Guidance)**: Correctly identifies the issue as an Incident (P2/P3), references **SOP-101**, provides diagnostic checklist for the tech, and flags that `AUTH_RADIUS_TIMEOUT` requires NetOps escalation if persistent.
   * **Section 2 (Customer Draft)**: Follows the Manager's Engagement Guide: empathetic opening, no internal jargon (does not mention "RADIUS timeout" or "token drift" to the user), clear reassurance, and next steps.
   * **Section 3 (Ticketing Record & Escalation)**: Identifies escalation to **Network Infrastructure (NetOps Engineering)**, pulls the exact semicolon-delimited emails from `sample_escalation_roster.csv` (`netops-tier2@enterprise.org; d.miller@enterprise.org`), and logs concise work notes.
   * **Section 4 (Advisory Notice)**: Contains the mandatory mentor disclaimer reminding the technician that they own verification and ticket execution.

---

### Part 3: Testing Fallback Protocols & Error Handling

1. Issue a prompt with an undocumented department:

```text
The user needs specialized access to the 'Quantum Cryptography Research Group'. Please escalate the ticket to their team lead.
```

2. **Verify Error Handling**:
   * The Gem must **not** hallucinate a fake email address (e.g., `quantum@enterprise.org`).
   * It must trigger the explicit fallback protocol: `ESCALATION_TEAM_NOT_FOUND: Verify escalation directory manually.`

---

## Verification & Reflection Check

| Validation Test | Expected Result | Pass/Fail |
|---|---|---|
| **Tone & Jargon Check** | Verify customer draft contains no raw technical jargon (e.g. Kerberos, RADIUS, daemons) and adheres to the Manager's empathetic voice. | [ ] |
| **SOP Grounding Test** | Diagnostic checklist directly mirrors steps from `sample_helpdesk_sops.md`. | [ ] |
| **CSV Escalation Lookup** | Escalation contacts match `sample_escalation_roster.csv` exactly without invented names or emails. | [ ] |
| **Missing-Data Fallback Test** | Querying a non-existent team returns `ESCALATION_TEAM_NOT_FOUND` rather than a hallucinated email. | [ ] |
| **Advisory Disclaimer** | Response always ends with the mandatory mentor advisory notice. | [ ] |
