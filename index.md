---
layout: default
title: Home
---

<div class="content-header">Welcome to Swalton.Prof, the educational landing page of Dr Steven Walton, CISSP!</div>

<div class="card" markdown="1">

### Welcome & Overview

Welcome to my  educational repository. Select a course from the navigation menu on the side or explore the links below:

* **[SOC Fundamentals](/soc-fundamentals/)**: The realities of the Security Operations Center, stripping away vendor marketing to explore human-centric workflows, architectures, and blue team defense.
* **[GenAI for Tinkerers](/genai-for-tinkerers/)**: Applied GenAI usage for practical purposes, from understanding the fundamentals of how it works to building deterministic harnesses around non-deterministic engines for the IT Generalist and tinkerer alike.

</div>

<div class="card" markdown="1">

### Recently Updated Content

The most recent instructional content pushed to the repository:

<ul style="list-style: none; padding-left: 0;">
  {% assign recent_modules = site.html_pages | where_exp: "item", "item.date" | sort: "date" | reverse %}
  {% for module in recent_modules limit: 6 %}
  <li style="margin-bottom: 15px; border-left: 3px solid var(--border-color); padding-left: 15px;">
    <a href="{{ module.url }}" style="color: inherit; text-decoration: none; font-weight: bold; font-size: 1.05rem;">{{ module.title }}</a>
    <br>
    <span style="font-size: 0.9rem; color: var(--text-muted);">{{ module.description }}</span>
  </li>
  {% endfor %}
</ul>

</div>