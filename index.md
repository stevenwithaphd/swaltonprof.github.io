---
layout: default
title: Home
---

<div class="content-header">Latest Lectures</div>

{% assign recent_pages = site.pages | where_exp: "item", "item.date != nil" | sort: "date" | reverse %}
{% for p in recent_pages limit: 3 %}
<div class="card">
  <h3><a href="{{ p.url }}" style="color: inherit; text-decoration: none;">{{ p.title }}</a></h3>
  <p>{{ p.description | default: "Click to view lecture details." }}</p>
</div>
{% endfor %}