---
layout: default
title: Home - Dr. Steven Walton
description: IT, Cybersecurity, and GenAI educational content and labs by a lifelong tinkerer, Dr. Steven Walton, CISSP.
---

<div class="content-header">IT, Cybersecurity, and GenAI Education</div>

<div class="card" markdown="1">

### Welcome & Teaching Philosophy

Welcome to my open educational repository. My content strips away vendor marketing, sales hype, and academic fluff to focus on what actually works on the server room floor and in production environments. 

Wherever you are at in your career, if you believe in understanding how things work and getting your hands covered in digital dust, this content is for you. 

</div>

<div class="card" markdown="1">

<span class="badge badge-blue">Active Course</span>
<span class="badge badge-teal">6 Modules</span>
<span class="badge badge-slate">Blue Team Defense</span>
<span class="badge badge-amber">Hands-on Labs</span>

### [SOC Fundamentals](/soc-fundamentals/)

An honest look at the realities of modern Security Operations Centers. Move past movie hacking tropes and pristine vendor dashboards to explore human-centric analyst workflows, messy physical and logical logging architectures, endpoint detection, mobile security, and practical blue team defense.

<a href="/soc-fundamentals/" class="btn-cta">Explore SOC Fundamentals →</a>

</div>

<div class="card" markdown="1">

<span class="badge badge-purple">New Course</span>
<span class="badge badge-teal">8 Modules</span>
<span class="badge badge-blue">Local Models & GGUF</span>
<span class="badge badge-amber">Agentic Harnesses</span>

### [GenAI for Tinkerers](/genai-for-tinkerers/)

Bridging the gap between theoretical AI computer science and real-world IT systems operations. Learn how GenAI works, how to become power user+ with it, and hopefully walk away with the fundamental required to go deeper and build your own agentic solution leveraging the cloud of just locally ran open-weight models.

<a href="/genai-for-tinkerers/" class="btn-cta">Explore GenAI for Tinkerers →</a>

</div>

<div class="card" markdown="1">

### Recent Curriculum Updates

The latest instructional modules, revisions, and laboratory exercises added to the repository:

<div style="margin-top: 15px;">
  {% assign recent_modules = site.html_pages | where_exp: "item", "item.date" | sort: "date" | reverse %}
  {% for module in recent_modules limit: 6 %}
  <div style="margin-bottom: 16px; padding-bottom: 14px; border-bottom: 1px solid var(--border-color);">
    <div style="display: flex; justify-content: space-between; align-items: baseline; flex-wrap: wrap; gap: 8px;">
      <a href="{{ module.url }}" style="font-weight: 700; font-size: 1.02rem; color: var(--text-main);">{{ module.title }}</a>
      <span style="font-size: 0.8rem; color: var(--text-subtle); font-weight: 600;">{{ module.date | date: "%B %d, %Y" }}</span>
    </div>
    {% if module.description %}
    <div style="font-size: 0.88rem; color: var(--text-muted); margin-top: 4px;">{{ module.description }}</div>
    {% endif %}
  </div>
  {% endfor %}
</div>

</div>
