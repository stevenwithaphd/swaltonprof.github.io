---
layout: default
title: Home
---

<div class="content-header">Welcome to Swalton.Prof, the educational landing page of Dr Steven Walton, CISSP!</div>

<div class="card">
  <h3>Hello World!</h3>
  <p>Welcome to my academic and educational repository. Please select <strong>COURSES</strong> from the left navigation menu to review the available instructional materials.</p>
  
  <hr style="border: 0; border-top: 1px solid var(--border-color); margin: 20px 0;">
  
  <h3>External Routing</h3>
  <p>This site is for educational content. For other topics, please route to the appropriate external sites:</p>
  <ul>
    <li><strong>Professional & Consulting:</strong> <a href="https://stevenwitha.phd" target="_blank" rel="noopener noreferrer">stevenwitha.phd</a></li>
    <li><strong>The Tech Sandbox:</strong> <a href="https://swalton.tech" target="_blank" rel="noopener noreferrer">swalton.tech</a></li>
  </ul>
</div>

<div class="card">
  <h3>Recently Updated Content</h3>
  <p>The most recent instructional content pushed to the repository:</p>
  
  <ul style="list-style: none; padding-left: 0;">
    {% assign recent_modules = site.pages | where_exp: "item", "item.date != nil" | sort: "date" | reverse %}
    {% for module in recent_modules limit: 3 %}
    <li style="margin-bottom: 15px; border-left: 3px solid var(--border-color); padding-left: 15px;">
      <a href="{{ module.url }}" style="color: inherit; text-decoration: none; font-weight: bold; font-size: 1.05rem;">{{ module.title }}</a>
      <br>
      <span style="font-size: 0.9rem; color: var(--text-muted);">{{ module.description }}</span>
    </li>
    {% endfor %}
  </ul>
</div>