---
layout: default
title: Module 2 - Endpoint Defense
#date: 2026-04-20
description: The Endpoint is no longer within the confines of the corporate network. How do you keep it protected?
---

<div class="card" markdown="1">Module 2: Endpoint Defense</div>

<div class="card" markdown="1">

*Welcome to Module 2. This section is under active development. Below is a preview of the operational realities and controls we will cover.*

# What is Endpoint Defense?

Modern work destroys the traditional network perimeter. Users access corporate data from remote locations and attackers target the endpoint directly. Defneders must monitor and protect desktops, laptops, mobile devices, servers, and basically anything that can run code or be exploited by a bad actor.

Limited budgets restrict complete asset visibility while security controls generate friction with end users who want to use their work device with the same level of autonmy that enjoy on their personal devices. The CISO must ensure baseline defenses exist in alignment with business risk tolerance and security budget, regardless of user (and even some IT admins) complaints. The relative noise in a SOC can be greatly reduced by a robust security framework, while the ability to dig into what alerts do exist is eased by proper deployment of a solid security stack.

Unmanaged endpoints introduce severe operational risks, permitting attackers a chance to steal credentials from these easily compromised devices. If unmanaged devices are permitted onto a secure network, or if network segmentation doesn't exist and that unmanaged gains access as a "guest/BYOD" device, a bad actor can now deploy ransomware across the organization. This failure stops business operations completely.

Endpoint defense is deep, there are many terms and an entire book can be written about it, summarily, for defenders within a SOC they should focus on understanding how Windows, Mac, and Linux operate from a "power user" perspective in order to quickly navigate alerts they may receive from their various tooling. 

* TOC
{:toc}

## 1. The Endpoint Baseline
We define the modern endpoint and apply CIS Controls 1 and 2 for hardware and software inventory. Unmanaged devices introduce severe consequences to the network, yet budget limitations restrict complete asset visibility. We acknowledge this reality. 

## 2. Endpoint Detection and Response (EDR)
We define actual EDR functions. We ignore vendor marketing promises. 
* **Windows:** Windows generates high alert volumes. You must monitor the registry to catch complex malware. Windows Server and Domain Controllers exist here as well. Entire books can be written about GPO and how they support proper security of Windows devices.
* **macOS:** Apple hardware gives a false sense of security. These environments require specific Mobile Device Management restrictions.
* **Linux:** Linux servers require stability and high uptime. We explain eBPF for kernel-level visibility. eBPF provides monitoring without causing production system crashes. While you don't normally think of Linux and "endpoint" together, it is a fundamental reality.

## 3. Attack Surface Reduction
We shrink the available targets for attackers. 
* **Host Firewalls:** Host firewalls block lateral movement across all operating systems. Enforcing strict rules here can provide easy wins.
* **Application Control:** You must restrict executable execution. We cover AppLocker and Airlock specifically for Windows environments.
* **Software Inventory:** Software inventory identifies unpatched or unauthorized applications. 
* **USB Control:** USB control restricts physical data exfiltration. It stops external malware staging.

## 4. Endpoint Privilege Management
Access control procedures guarantee system access follows the concept of least privilege. You must revoke local administrator permissions. This stops malicious users from exploiting systems with poor security controls. This operational requirement generates friction with staff.

## 5. Phishing and The Human Firewall
Users click malicious links. This is an operational reality. Phishing directly bypasses technical controls. Phishing campaigns lead to credential theft and initial endpoint compromise. Security training mitigates risk. It does not cure human error.

## 6. Mobile Devices and BYOD
The modern endpoint includes mobile devices and BYOD culture. Employees access data on personal phones. We require Mobile Device Management profiles for access. Unmanaged phones lead to data exfiltration and credential theft. 

## 7. Vulnerability and Patch Management
Vulnerability management activities uncover weaknesses and ensure proper remediation. Software inventory only identifies the applications. You must patch identified vulnerabilities immediately. Attackers scan for unpatched software automatically.
