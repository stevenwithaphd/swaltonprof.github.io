---
layout: default
title: Home
---

<div class="content-header">Welcome to Swalton.Prof, the educational landing page of Dr Steven Walton, CISSP!</div>

<div class="card" markdown="1">

### Hello World!

Welcome to my academic and educational repository. Please select **COURSES** from the left navigation menu to review the available instructional materials.

<hr style="border: 0; border-top: 1px solid var(--border-color); margin: 20px 0;">

### External Routing

This site is for educational content. For other topics, please route to the appropriate external sites:

* **Professional & Consulting:** [stevenwitha.phd](https://stevenwitha.phd)
* **The Tech Sandbox:** [swalton.tech](https://swalton.tech)

</div>

<div class="card" markdown="1">

### Recently Updated Content

The most recent instructional content pushed to the repository:

<ul style="list-style: none; padding-left: 0;">
  {% assign recent_modules = site.pages | where_exp: "item", "item.date != nil" | sort: "date" | reverse %}
  {% for module in recent_modules limit: 6 %}
  <li style="margin-bottom: 15px; border-left: 3px solid var(--border-color); padding-left: 15px;">
    <a href="{{ module.url }}" style="color: inherit; text-decoration: none; font-weight: bold; font-size: 1.05rem;">{{ module.title }}</a>
    <br>
    <span style="font-size: 0.9rem; color: var(--text-muted);">{{ module.description }}</span>
  </li>
  {% endfor %}
</ul>

</div>