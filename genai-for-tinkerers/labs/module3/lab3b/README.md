---
layout: default
title: "Lab 3B: Authoring a Custom SecOps Triage Skill & Subagent Verification"
description: "Hands-on lab building a modular Antigravity custom skill (SKILL.md), master workspace rules (AGENTS.md), and a deterministic CVE validator script."
---

<div class="content-header">Lab 3B: Authoring a Custom SecOps Triage Skill & Subagent Verification</div>

<div class="breadcrumbs">
  <a href="/">Home</a>
  <span class="separator">/</span>
  <a href="/genai-for-tinkerers/">GenAI for Tinkerers</a>
  <span class="separator">/</span>
  <a href="/genai-for-tinkerers/Module3.html">Module 3</a>
  <span class="separator">/</span>
  <span class="current">Lab 3B</span>
</div>

<div class="card" markdown="1">

# Lab 3B: Authoring a Custom SecOps Triage Skill & Subagent Verification

**Module:** [Module 3: Agentic IDEs & AI Pair Programming](/genai-for-tinkerers/Module3.html)  
**Target Environment:** Windows, macOS, or Linux (Workstation, VM, or Container Sandbox) with Antigravity IDE or CLI  
**Estimated Completion Time:** 45 Minutes  

* TOC
{:toc}

---

## Lab Objectives

1. **Configure Master Workspace Rules (`AGENTS.md`)**: Enforce repository-level operational guardrails, non-destructive terminal policies, and defanged indicators of compromise (IOCs).
2. **Author a Modular Custom Skill (`SKILL.md`)**: Build a modular workspace skill in `.agents/skills/soc-cve-triage/SKILL.md` with structured YAML frontmatter for on-demand discovery.
3. **Integrate Deterministic Helper Utilities**: Author a local Python utility script (`cve_validator.py`) to handle deterministic regex parsing and CVSS scoring rather than relying on probabilistic LLM attention.
4. **Test Dynamic Skill Discovery**: Trigger the custom skill using an unformatted vulnerability advisory and verify that the IDE automatically discovers, indexes, and loads the skill playbook on demand.
5. **Verify Telemetry**: Review session transcripts (`transcript.jsonl`) to confirm the agent invoked local scripts deterministically and adhered to workspace constraints.

---

> [!NOTE]
> **Operational Guidance: Understanding Tool Access, Sandboxes & Autonomy**
> 
> Security boundaries in agentic engineering are never purely black and white: they depend entirely on understanding what tools your agent possesses and what filesystem or network access is actually granted.
> 
> * **Know Your Access Boundaries**: Running inside Windows Subsystem for Linux (WSL) keeps package dependencies organized, but remember that WSL mounts host drives (`/mnt/c/`) and shares host network routes by default. Similarly, tools like Hermes or Docker containers offer dedicated sandbox modes right on your local machine, but they are only as effective as the bind mounts and environment variables you configure. Always verify what directories, ports, and credentials an agent can touch before letting it run.
> * **Calibrate Autonomy with Familiarity**: There is certainly a place for fully autonomous solutions, but that level of trust comes only with hands-on familiarity that this course is designed to build. When starting out with new agentic harnesses or models, keep the Human-in-the-Loop permission gate active. Review proposed terminal commands and atomic diffs rather than blindly auto-approving them.
> * **Defensive Operational Habits**: Whether you pair with an agent directly on bare metal or inside an isolated Virtual Machine (VM), build defensive muscle memory: work in dedicated git scratch branches so any bad change can be reverted instantly, keep secrets (`.env`, private keys) quarantined away from project folders, and test new agentic skills in clean, low-stakes workspaces first.

---

## Starter Files & Architecture

The lab architecture is staged in this directory:
* `AGENTS.md`: Master workspace operational rules and guardrails.
* `advisory_raw.txt`: Incoming raw unformatted vendor security bulletin.
* `.agents/skills/soc-cve-triage/SKILL.md`: Modular custom skill playbook with YAML frontmatter.
* `.agents/skills/soc-cve-triage/scripts/cve_validator.py`: Local deterministic helper script for CVE validation.

---

## Step-by-Step Execution Guide

### Step 1: Initialize Workspace Directory Structure

You can complete this lab either directly inside this repository or by copying the files to an isolated sandbox:

#### Option A: In-Repository Staging
If working directly inside the cloned course repository, navigate directly to this lab directory:
```bash
cd genai-for-tinkerers/labs/module3/lab3b
```

#### Option B: Isolated Sandbox Staging
If setting up in a dedicated sandbox or clean directory outside this repository:

1. Create the customization folder hierarchy:
   ```bash
   mkdir -p ~/labs/lab3b-cve-skill/.agents/skills/soc-cve-triage/scripts
   cd ~/labs/lab3b-cve-skill
   ```

2. Copy the starter files from the course repository into your sandbox:
   ```bash
   cp /path/to/genai-for-tinkerers/labs/module3/lab3b/advisory_raw.txt .
   cp /path/to/genai-for-tinkerers/labs/module3/lab3b/AGENTS.md .
   cp /path/to/genai-for-tinkerers/labs/module3/lab3b/.agents/skills/soc-cve-triage/SKILL.md .agents/skills/soc-cve-triage/
   cp /path/to/genai-for-tinkerers/labs/module3/lab3b/.agents/skills/soc-cve-triage/scripts/cve_validator.py .agents/skills/soc-cve-triage/scripts/
   ```

*(Alternatively, if drafting from scratch without copying, you can create each file following Steps 2 through 4 below.)*

---

### Step 2: Configure Master Workspace Rules (`AGENTS.md`)

Inspect or create `AGENTS.md` in the root of your lab directory:

```markdown
# Master Workspace Operational Rules

## 1. Role & Identity
You are a Senior SecOps Automation Engineer operating in a quarantined analysis lab. Your focus is deterministic threat triage, rigorous parsing, and actionable executive communication.

## 2. Terminal & Tool Guardrails
* All terminal commands must be strictly non-destructive.
* Never invoke interactive commands that block stdout (e.g., `nano`, `vi`, `top`).
* When formatting indicators of compromise (IOCs), always defang IP addresses and domains (e.g., `192[.]168[.]1[.]1`, `evil[.]com`).

## 3. Skill Execution Policy
* When handling vulnerability advisories or CVE requests, always check `.agents/skills/` for relevant playbooks before formulating responses.
* Execute local deterministic scripts via Python rather than performing regex parsing or mathematical scoring inside model attention weights.
```

---

### Step 3: Author the Custom Skill Playbook (`SKILL.md`)

Inspect or create `.agents/skills/soc-cve-triage/SKILL.md`:

```yaml
---
name: soc-cve-triage
description: Ingests raw vulnerability advisories, validates CVE IDs, classifies CVSS severity, maps mitigation actions, and produces an Executive Vulnerability Briefing table.
---

# SOC CVE Triage Playbook

Use this skill whenever an Operator provides raw CVE identifiers, vendor security advisories, or requests vulnerability impact assessments.

## Standard Operating Procedure

1. **Indicator Validation**:
   * Extract all CVE IDs matching `CVE-[0-9]{4}-[0-9]{4,}`.
   * Run the deterministic validator script `python .agents/skills/soc-cve-triage/scripts/cve_validator.py <CVE_ID> <CVSS_SCORE>` to determine standard severity bands.

2. **Severity Classification Matrix**:
   * Critical: CVSS 9.0-10.0 (Immediate 24-hour remediation window).
   * High: CVSS 7.0-8.9 (72-hour remediation window).
   * Medium: CVSS 4.0-6.9 (14-day remediation window).
   * Low: CVSS 0.1-3.9 (Next maintenance cycle).
   * None: CVSS 0.0 (Informational / no action required).

3. **Mandatory Output Schema**:
   Always structure the final deliverable with the following exact headers:
   * **Executive Summary**: Maximum 2 sentences describing business risk and whether active exploitation is reported.
   * **Triage Matrix**: Standard Markdown table with the following columns:
     `| CVE ID | Vulnerability Type | CVSS Base | Severity Band | Remediation SLA | Immediate Mitigation |`
   * **Analyst Action Items**: Numbered list of concrete containment and patching steps for Systems Administrators.
```

---

### Step 4: Implement and Verify the Deterministic Helper Script

LLMs are probabilistic next-token predictors. They lack internal clocks, hash engines, and arithmetic logic units. When asked to evaluate complex regular expressions or compute qualitative severity bands, models can hallucinate ratings or miss boundary conditions.

To guarantee operational accuracy, we delegate regex parsing and CVSS scoring to a deterministic Python utility: `.agents/skills/soc-cve-triage/scripts/cve_validator.py`.

#### Script Source Code

If setting up in a fresh sandbox, create `.agents/skills/soc-cve-triage/scripts/cve_validator.py` with the complete implementation below:

```python
#!/usr/bin/env python3
"""
cve_validator.py: Deterministic CVE Syntax and CVSS v3.1 Validator

Conforms to:
- MITRE CVE ID Syntax Specification (CVE-YYYY-NNNN+)
- FIRST Common Vulnerability Scoring System v3.1 Specification & Appendix A
"""

from __future__ import annotations

import json
import math
import re
import sys

CVE_PATTERN = re.compile(r"^CVE-\d{4}-\d{4,}$", re.ASCII)
CVSS_VECTOR_PATTERN = re.compile(
    r"^CVSS:3\.1/AV:[NALP]/AC:[LH]/PR:[NLH]/UI:[NR]/S:[UC]/C:[NLH]/I:[NLH]/A:[NLH]$"
)

# CVSS v3.1 Metric Constants (FIRST Specification Table 16)
AV_WEIGHTS = {"N": 0.85, "A": 0.62, "L": 0.55, "P": 0.20}
AC_WEIGHTS = {"L": 0.77, "H": 0.44}
UI_WEIGHTS = {"N": 0.85, "R": 0.62}
CIA_WEIGHTS = {"N": 0.00, "L": 0.22, "H": 0.56}

PR_WEIGHTS_UNCHANGED = {"N": 0.85, "L": 0.62, "H": 0.27}
PR_WEIGHTS_CHANGED = {"N": 0.85, "L": 0.68, "H": 0.50}


def validate_cve(cve_id: str) -> bool:
    """Validate CVE identifier syntax against MITRE CVE specifications."""
    return bool(CVE_PATTERN.match(cve_id.strip().upper()))


def roundup(val: float) -> float:
    """
    CVSS v3.1 Appendix A Floating Point Approximation Roundup algorithm.
    Rounds up to one decimal place using integer arithmetic.
    """
    int_input = round(val * 100000)
    if (int_input % 10000) == 0:
        return int_input / 100000.0
    return (math.floor(int_input / 10000) + 1) / 10.0


def calculate_cvss_v31_base(vector_str: str) -> float | None:
    """
    Parse a CVSS v3.1 vector string and calculate the base score
    per FIRST CVSS v3.1 Specification Section 7.1.
    """
    vector_clean = vector_str.strip().upper()
    if not CVSS_VECTOR_PATTERN.match(vector_clean):
        return None

    raw_metrics = vector_clean.replace("CVSS:3.1/", "").split("/")
    metrics = dict(item.split(":") for item in raw_metrics)

    av = AV_WEIGHTS[metrics["AV"]]
    ac = AC_WEIGHTS[metrics["AC"]]
    ui = UI_WEIGHTS[metrics["UI"]]
    scope = metrics["S"]

    pr_table = PR_WEIGHTS_CHANGED if scope == "C" else PR_WEIGHTS_UNCHANGED
    pr = pr_table[metrics["PR"]]

    c = CIA_WEIGHTS[metrics["C"]]
    i = CIA_WEIGHTS[metrics["I"]]
    a = CIA_WEIGHTS[metrics["A"]]

    # Impact Sub-Score (ISS)
    iss = 1.0 - ((1.0 - c) * (1.0 - i) * (1.0 - a))
    if iss <= 0:
        return 0.0

    # Impact Equation
    if scope == "U":
        impact = 6.42 * iss
    else:
        impact = 7.52 * (iss - 0.029) - 3.25 * ((iss - 0.02) ** 15)

    if impact <= 0:
        return 0.0

    # Exploitability Equation
    exploitability = 8.22 * av * ac * pr * ui

    # Base Score Equation
    if scope == "U":
        base_score = roundup(min(impact + exploitability, 10.0))
    else:
        base_score = roundup(min(1.08 * (impact + exploitability), 10.0))

    return base_score


def get_severity_band(score: float) -> str:
    """
    Map CVSS base score to qualitative severity rating
    per FIRST CVSS v3.1 Specification Table 14.
    Hardened against IEEE-754 NaN and out-of-bounds score inputs.
    """
    if math.isnan(score) or score < 0.0 or score > 10.0:
        return "INVALID_SCORE"
    if score == 0.0:
        return "NONE"
    elif score < 4.0:
        return "LOW"
    elif score < 7.0:
        return "MEDIUM"
    elif score < 9.0:
        return "HIGH"
    else:
        return "CRITICAL"


def main() -> None:
    if len(sys.argv) < 3:
        usage = {
            "error": "Usage: cve_validator.py <CVE_ID> <CVSS_SCORE> [VECTOR_STRING]"
        }
        print(json.dumps(usage, indent=2))
        sys.exit(1)

    cve_input = sys.argv[1].strip().upper()
    score_arg = sys.argv[2].strip()
    vector_arg = sys.argv[3].strip() if len(sys.argv) > 3 else None

    is_cve_valid = validate_cve(cve_input)

    try:
        score_val = float(score_arg)
        is_score_numeric = True
    except ValueError:
        score_val = -1.0
        is_score_numeric = False

    if not is_cve_valid:
        severity = "INVALID_CVE"
    elif not is_score_numeric or math.isnan(score_val) or score_val < 0.0 or score_val > 10.0:
        severity = "INVALID_SCORE"
    else:
        severity = get_severity_band(score_val)

    result = {
        "cve_id": cve_input,
        "is_valid_syntax": is_cve_valid,
        "cvss_score": score_arg,
        "severity_band": severity,
    }

    if vector_arg:
        calc_score = calculate_cvss_v31_base(vector_arg)
        if calc_score is not None:
            result["vector_string"] = vector_arg.upper()
            result["is_vector_valid"] = True
            result["calculated_base_score"] = calc_score
            result["score_verified"] = bool(
                is_score_numeric
                and not math.isnan(score_val)
                and math.isclose(score_val, calc_score, abs_tol=0.05)
            )
        else:
            result["vector_string"] = vector_arg
            result["is_vector_valid"] = False

    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
```

#### Terminal Verification

Test the deterministic validator script directly from your terminal before invoking the agent:

*Linux, macOS, and PowerShell:*
```bash
python .agents/skills/soc-cve-triage/scripts/cve_validator.py CVE-2026-44910 9.8
```

*Windows Command Prompt (CMD):*
```cmd
python .\.agents\skills\soc-cve-triage\scripts\cve_validator.py CVE-2026-44910 9.8
```

Verify that it returns structured JSON output:
```json
{
  "cve_id": "CVE-2026-44910",
  "is_valid_syntax": true,
  "cvss_score": "9.8",
  "severity_band": "CRITICAL"
}
```

> [!TIP]
> **Field Notes from the Server Room Floor**
>
> Notice how `cve_validator.py` handles regex syntax checking, floating-point CVSS threshold comparison, and IEEE-754 `NaN` protection deterministically in Python. Even when a prompt contains noisy vendor text or multiple CVE numbers, forcing the agent to pass extracted identifiers through a validator script guarantees that malformed CVE strings or misclassified severity bands are caught before an executive briefing is generated.

---

### Step 5: Test and Verify Skill Discovery

1. Inspect the raw incoming bulletin file `advisory_raw.txt`:
   ```text
   SECURITY ADVISORY BULLETIN - URGENT
   Date: September 3, 2026
   Source: Enterprise Edge Gateway Vendor
   
   A critical pre-authentication remote code execution vulnerability has been identified 
   in EdgeOS VPN Gateways running firmware prior to v14.2. Unauthenticated remote Attackers 
   can send crafted UDP packets to port 500 to execute arbitrary shell commands with root privileges.
   
   Identifier: CVE-2026-44910
   CVSS v3.1 Base Score: 9.8 (CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H)
   Active Exploitation: Yes, active in-the-wild zero-day exploitation observed.
   Affected Components: EdgeOS IPSec VPN Service daemon.
   Workaround: Disable external UDP port 500 access or restrict access to trusted source IP subnets.
   Patch: Upgrade to EdgeOS firmware v14.2-hotfix1 immediately.
   ```

2. Prompt the agent in Antigravity IDE or CLI (`agy`):
   ```text
   Please triage the incoming bulletin in advisory_raw.txt and prepare an executive vulnerability briefing.
   ```

3. **Supervise the Autonomous Execution Loop**:
   * Ensure that the agent is in standard execution mode (command execution enabled).
   * Observe the agent detect the advisory context and dynamically discover the `soc-cve-triage` skill from `.agents/skills/`.
   * When the agent requests permission to execute `python .agents/skills/soc-cve-triage/scripts/cve_validator.py CVE-2026-44910 9.8`, approve the request using **`1. Yes, run command`** or **`2. Session Allowlist`**.
   * Confirm that the agent receives the JSON response and structures its final markdown output matching the mandatory schema defined in `SKILL.md`:

   ```markdown
   ### Executive Summary
   A critical pre-authentication remote code execution vulnerability (CVE-2026-44910, CVSS 9.8) affects EdgeOS VPN Gateways prior to firmware v14.2, allowing unauthenticated remote Attackers to execute root shell commands via UDP port 500. Active in-the-wild zero-day exploitation is currently underway, requiring immediate 24-hour emergency remediation.

   ### Triage Matrix
   | CVE ID | Vulnerability Type | CVSS Base | Severity Band | Remediation SLA | Immediate Mitigation |
   | :--- | :--- | :--- | :--- | :--- | :--- |
   | CVE-2026-44910 | Pre-Authentication Remote Code Execution (RCE) | 9.8 | CRITICAL | Immediate (24 Hours) | Disable external UDP port 500 or restrict access to trusted source IP subnets |

   ### Analyst Action Items
   1. Inventory all perimeter EdgeOS VPN Gateways running firmware prior to `v14.2`.
   2. Apply emergency firewall ACLs restricting inbound UDP port 500 traffic to authorized peer subnets immediately.
   3. Deploy vendor patch `v14.2-hotfix1` across all affected appliances within the 24-hour Critical SLA window.
   4. Hunt SIEM and firewall telemetry for anomalous inbound UDP/500 payloads or unexpected root shell spawns on EdgeOS appliances.
   ```

4. **Inspect the Session Transcript**:
   Open the structured session log located by conversation ID to verify how the agent resolved the task:
   * *Linux / macOS*: `~/.gemini/antigravity/brain/<conversation-id>/.system_generated/logs/transcript.jsonl` (or `~/.gemini/antigravity-cli/...`)
   * *Windows*: `%USERPROFILE%\.gemini\antigravity\brain\<conversation-id>\.system_generated\logs\transcript.jsonl`

   Verify that the agent loaded the skill instructions into context, invoked the Python validator script, and captured the structured JSON output.

---

## Key Takeaways: Custom Skills as Deterministic Extensions

1. **Modular Skills vs. Monolithic System Prompts**: Custom skills (`SKILL.md`) embody a microservices architecture for agentic context. Instead of stuffing every operational procedure into a global prompt where tokens burn continuously and dilute attention, skills load on demand only when relevant tasks trigger them.
2. **Deterministic Delegation over Probabilistic Reasoning**: An autonomous agent should never calculate CVSS score equations or validate complex RFC regexes using model attention weights. Forcing the agent to invoke a Python script (`cve_validator.py`) guarantees mathematical consistency, bound checking, and reproducible security reporting.
3. **Guardrails Precede Execution (`AGENTS.md`)**: Setting repository rules upfront (such as defanging indicators of compromise and prohibiting destructive terminal commands) ensures that the agent conducts triage safely without leaking live attacker infrastructure or disrupting host services.

---

## Lab 3B Deliverables & Evaluation Rubric

Submit the following items to verify successful completion:

| Evaluation Checkpoint | Passing Criteria | Score |
|---|---|---|
| **1. Custom Skill Spec (`SKILL.md`)** | Valid YAML frontmatter (`name`, `description`), variable sequence regex (`CVE-\d{4}-\d{4,}`), and full severity matrix including None (0.0). | 25% |
| **2. Deterministic Helper Script** | `cve_validator.py` accurately validates syntax, enforces bounds (`0.0-10.0`), and returns structured JSON output. | 25% |
| **3. Master Rules (`AGENTS.md`)** | Clean workspace rules enforcing non-destructive terminal operations and defanged IOCs. | 20% |
| **4. Executive Triage Deliverable** | Rendered markdown report adhering strictly to the schema (Executive Summary, Matrix, Action Items). | 20% |
| **5. Audit Verification Proof** | Transcript excerpt from `transcript.jsonl` demonstrating dynamic skill indexing and deterministic helper execution. | 10% |

<div class="module-nav">
  <a href="/genai-for-tinkerers/labs/module3/lab3a/" class="module-nav-link prev">
    <span class="module-nav-label">Previous Lab</span>
    <span class="module-nav-title">← Lab 3A: Windows Firewall DNS Telemetry Refactoring</span>
  </a>
  <a href="/genai-for-tinkerers/Module3.html" class="module-nav-link next">
    <span class="module-nav-label">Return to Module</span>
    <span class="module-nav-title">Module 3: Agentic IDEs & AI Pair Programming →</span>
  </a>
</div>

</div>
