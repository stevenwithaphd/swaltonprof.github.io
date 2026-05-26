---
layout: default
title: Module 4 - Network Defense
date: 2026-05-26
description: The network is the battlefield. We explore how data moves, how trust is verified, and how the wire never lies.
---

<div class="content-header">Module 4: Network Defense</div>

<div class="card" markdown="1">

# Network Defense - From LAN Parties to Enterprise Perimeters

The endpoint might be the ultimate target, but the network is the battlefield. While industry marketing heavily promotes zero-trust architectures and perimeter-less environments, the operational reality is that data must still traverse a physical or logical wire. Positive security is nice, it certainly is achievable, but it is difficult to come by and requires strong governanace and the backing of the entire IT group to tell users "no, you can't access whatever you want on a company-issued device." If you cannot monitor and control that transit layer, your SOC is functionally blind to lateral movement and data exfiltration. Network defense relies on establishing rigid choke points. Your firewalls, proxies, and traffic taps force adversaries into heavily monitored corridors. In this module, we will examine how to manage the cryptography required to verify trust, how to analyze raw packet captures when your security dashboards lie, and how to maintain enterprise availability against automated attacks. You cannot defend an environment if you do not fundamentally understand how its components communicate. The best part, because the wire doesn't lie it is the one of the best troubleshooting skills to have!

* TOC
{:toc}

# Understanding the Wire

What follows is loosely tied to the OSI model, if you are a networker this will be second hand knowledge to you, if you unfamiliar with the OSI model, add that to your to-learn list, considering halting any further reading here until you understand it and TCP/IP more.

## Layer 1: Physical Media: Copper, Light, and Air

Before data reaches a firewall or triggers an alert in the SOC, it must travel across a physical medium. Security analysts must understand the constraints of this transit layer to accurately assess network topography, diagnose latency, and identify physical vulnerabilities.

* **Copper Cabling (Twisted Pair):** Standard ethernet relies on copper wire with a strict physical transmission limit of 100 meters per run. The internal wires are twisted into pairs specifically to cancel out electromagnetic interference (EMF). Higher performance tiers, such as Cat6, Cat6a, or Cat8, require more twists per inch and varying levels of physical shielding to sustain faster multi-gigabit speeds over those runs without signal degradation. 
* **Fiber Optic Cabling:** Fiber utilizes light pulses instead of electrical signals, rendering it completely immune to EMF and capable of traversing vast distances. In an enterprise, fiber forms the high-speed backbone connecting data centers and core switches. You will almost never see fiber run directly to an end-user's workstation. An interesting exception to this rule is in the home, where audiophiles, who have utilized TOSLINK optical fiber for high-fidelity audio for decades, leverage it for specialized setups.
* **Wireless (Just cause you can't touch it doesn't mean it isn't physical):** Wireless networking is not a separate logical entity; it operates strictly at the Physical Layer (Layer 1) of the OSI model. It is a highly complex, math-heavy domain where radio frequency physics dictate performance. Choosing between the 2.4 GHz, 5 GHz, and 6 GHz bands is a calculated compromise, as nothing is inherently "worse" or "better." 2.4 GHz penetrates physical walls effectively but suffers from lower speeds and massive channel congestion. 5 GHz and 6 GHz offer significant throughput but severely lack physical penetration. Designing a wireless network requires balancing these physical realities directly against the specific needs and asset density of the business. Better hope you don't live near an airport or other infrastructure that generates even more constraints on your wireless environment!

## Layer 2: The Data Link (Switches and VLANs)

Now that you understand the media, you must understand how devices connect to it locally. Layer 2 is where raw electrical signals become framed data.

* **MAC Addresses (The Illusion of Permanence)**: Textbooks state that a Media Access Control (MAC) address is a "burned-in" hardware identifier, permanently tying a physical Network Interface Card (NIC) to a specific string. The operational reality is different. Modern operating systems prioritize user privacy over static network tracking. iOS and Android randomize MAC addresses by default when connecting to networks. Windows provides an effortless toggle to enable this behavior. Furthermore, an attacker or a curious user can spoof a MAC address with a single terminal command. The SOC cannot rely on a MAC address as a definitive, immutable identity metric; it is merely a transient marker of a local connection.
* **The Death of the Hub:** Hubs are effectively obsolete and inherently insecure. Unlike modern switches, which use MAC addresses to isolate traffic between specific ports, hubs blindly broadcast every packet to every connected device. In a modern enterprise, discovering a hub is an immediate red flag. The environment is too archaic to be secure unless an IT administrator can provide an exceedingly specific, heavily documented legacy requirement for its existence.
* **The Switch (The Traffic Cop):** Modern networks rely on switches. A switch maintains a MAC address table, ensuring that when Host A talks to Host B, the data is only sent down the specific physical wire connected to Host B. This eliminates the collision domains that plagued legacy LAN environments and prevents passive sniffing of network traffic by other devices on the same switch.
* **VLANs (Virtual Local Area Networks):** Physical isolation is expensive. VLANs allow network engineers to logically segment a single physical switch into multiple isolated networks. The SOC cares deeply about VLANs. If a guest connects to the lobby Wi-Fi, their traffic must be tagged to a guest VLAN, ensuring they cannot laterally scan the internal server VLAN, even though their traffic is flowing through the exact same physical switch hardware in the IT closet.

## Layer 3: The Network (Routing and IP)

Layer 2 handles local delivery. Layer 3 handles inter-network transit. When data needs to leave its local subnet and cross into another, it requires routing. It can also get messy with L3 devices performing switching and L2 devices performing routing. Just understand the concepts and don't stick to any rigid ideology because, as we have already spoken about many times, there is very minimal hard and fast in IT.

* **IP Addressing vs. MAC Addressing:** If a MAC address is described as a vehicle's immutable VIN number, the IP address is its current license plate and parking space. It denotes logical location. To move traffic from one subnet (or VLAN) to another, a router must inspect the destination IP address and determine the optimal path to forward the packets.
* **Subnetting and Blast Radius:** The SOC utilizes subnets to understand the blast radius of an incident. Subnets dictate logical boundaries. If an analyst sees an alert firing on a /24 subnet designated for critical databases, the severity of the incident is immediately higher than an alert firing on an isolated /24 subnet used for testing ephemeral development servers.
* **Routing Protocols (The Maps):** Routers do not guess; they rely on routing tables. While small networks use static (manual) routes, enterprises rely on dynamic protocols like OSPF internally or BGP externally. **The SOC Reality:** Routing infrastructure is a prime target. If an adversary compromises a core router and alters BGP advertisements, they can seamlessly hijack and redirect your corporate traffic to an external server they control. 
* **Network Address Translation (NAT) and PAT:** Because IPv4 addresses ran out years ago, networks use private internal IPs (like 10.x.x.x or 192.168.x.x) that are non-routable on the internet. NAT and PAT (Port Address Translation) disguise thousands of internal devices behind a single public IP address. **The SOC Reality:** When an external entity or a threat intelligence feed reports your public IP is attacking them, the SOC must correlate firewall NAT logs to unmask exactly *which* internal private IP initiated the malicious connection.
* **DHCP (The Ephemeral Lease):** Devices are not permanently assigned their IP addresses; they lease them from a DHCP server. **The SOC Reality:** An IP address is not a user identity. If you are investigating an alert from three days ago on IP 10.5.5.50, you must correlate that timestamp against DHCP logs to determine which specific machine held that lease at that exact moment. This is its own frustrating challenge as even when firewall logs are accessibly, DHCP logs may have been forgotten about or require a network engineer to pull.
* **ICMP (The Diagnostic Weapon):** Internet Control Message Protocol (ICMP) is the heartbeat of Layer 3. IT uses it benignly via the `ping` command to test connectivity. **The SOC Reality:** Attackers use ICMP sweeps to discover active hosts across your subnets. Highly sophisticated adversaries will even encode and tunnel stolen data outward inside ICMP echo requests, bypassing firewalls that are strictly looking for HTTP/HTTPS exfiltration.

## Layer 4: The Perimeter Guard: Firewalls and Proxies

The traditional perimeter might be dissolving, but choke points are still required. This section strips away vendor marketing to explain what these appliances *actually* do.

* **The Evolution of the Firewall:**
  * **Stateless to Stateful:** Moving from simple "allow/deny" port rules to tracking the actual state of a conversation.
  * **Next-Generation Firewalls (NGFW):** Deep Packet Inspection (DPI) and application-layer awareness. The firewall isn't just looking at Port 80; it's recognizing that the traffic on Port 80 is specifically a malicious payload disguised as a Skype call.
* **Web Proxies & Outbound Visibility:**
  * Firewalls look at what is coming in; proxies manage what is going out.
  * Discuss DNS filtering, URL categorization, and preventing users from navigating to newly registered, uncategorized domains.
  * **The Friction:** Balancing the need to inspect outbound traffic against the unintentional disruption of blocking legitimate educational or business tools.

## The Currency of Trust: PKI and Encryption

As the web moves entirely to HTTPS, the SOC is increasingly blinded by encryption. This section covers how we establish trust and the operational nightmare of managing it.

* **What is PKI (Public Key Infrastructure)?**
  * The baseline mechanics of Certificate Authorities (CAs), public/private key pairs, and TLS/SSL handshakes.
  * How we verify that the server we are talking to is actually who it claims to be.
* **The Shrinking Rotation Window (The Operational Nightmare):**
  * Historically, certificates lasted years. Now, the industry standard has shrunk to 398 days, with an aggressive push toward 90-day lifespans.
  * **The SOC Reality:** Manual certificate management is dead. If you rely on a spreadsheet to track renewals, you *will* cause an enterprise-wide outage.
* **Automation is Mandatory:**
  * The necessity of ACME (Automated Certificate Management Environment), Certbot, and integrating PKI directly into deployment pipelines.

## The Ground Truth: Packet Capture (PCAP) and Analysis

Dashboards lie. Logs get dropped. EDR agents get bypassed. But the wire never lies.

* **When to Drop to the Command Line:**
  * Why Tier 2 and Tier 3 analysts must know how to read raw network traffic.
  * Understanding the TCP 3-way handshake (SYN, SYN-ACK, ACK) to diagnose if a connection was actively refused, dropped, or successfully established.
* **Tools of the Trade:**
  * **tcpdump:** The lightweight, command-line scalpel for capturing traffic directly from Linux servers.
  * **Wireshark:** The heavy-duty graphical magnifying glass for dissecting packet payloads, following TCP streams, and extracting malicious artifacts.
* **Triage vs. Deep Analysis:**
  * The reality of alert fatigue: You cannot run a full PCAP analysis on every single alert. Teaching analysts *when* to pull a PCAP versus when to rely on NetFlow or firewall logs.

## Modern Twists: Esports, Latency, and Availability

Bridging the gap back to gaming to explain modern network availability and DDoS mitigation.

* **The Latency vs. Security Trade-off:**
  * In online esports, every millisecond counts. Heavy deep packet inspection (DPI) and SSL decryption introduce latency.
  * How do organizations balance extreme high-availability requirements with the need to inspect traffic for malware?
* **DDoS (Distributed Denial of Service) Mitigation:**
  * How modern attackers overwhelm the wire, and how defenders use Anycast routing, scrubbing centers (like Cloudflare or Akamai), and BGP blackholing to keep the game—and the enterprise—online.

</div>