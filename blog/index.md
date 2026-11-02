---
layout: default
title: "Blog: Field Notes & Dispatches"
description: Technical breakdowns, SLED cybersecurity field notes, and agentic engineering write-ups by Dr. Steven Walton, CISSP.
---

<div class="content-header">Blog: Field Notes & Dispatches</div>

<div class="breadcrumbs">
  <a href="/">Home</a>
  <span class="separator">/</span>
  <span class="current">Blog</span>
</div>

<div class="card" markdown="1">

### Operational Write-Ups & Dispatches

Thoughts, architectural teardowns, and field notes from the server room floor and the garage shop. Every entry focuses on practical systems engineering, cognitive ergonomics, and what actually survives contact with production.

</div>

<div class="card" markdown="1">

### Published Entries

<div style="margin-top: 15px;">
  {% assign blog_posts = site.html_pages | where_exp: "item", "item.date" | where_exp: "item", "item.url contains '/blog/'" | sort: "date" | reverse %}
  {% if blog_posts.size > 0 %}
    {% for post in blog_posts %}
    <div style="margin-bottom: 18px; padding-bottom: 16px; border-bottom: 1px solid var(--border-color);">
      <div style="display: flex; justify-content: space-between; align-items: baseline; flex-wrap: wrap; gap: 8px;">
        <a href="{{ post.url }}" style="font-weight: 700; font-size: 1.05rem; color: var(--text-main);">{{ post.title }}</a>
        <span style="font-size: 0.8rem; color: var(--text-subtle); font-weight: 600;">{{ post.date | date: "%B %d, %Y" }}</span>
      </div>
      {% if post.description %}
      <div style="font-size: 0.9rem; color: var(--text-muted); margin-top: 6px;">{{ post.description }}</div>
      {% endif %}
    </div>
    {% endfor %}
  {% else %}
    <p style="color: var(--text-muted); font-style: italic;">New dispatches coming soon.</p>
  {% endif %}
</div>

</div>
