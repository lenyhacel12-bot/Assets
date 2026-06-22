# ✦ AdPilot AI — Facebook Ads Autopilot (SaaS Wireframe)

A modern, premium SaaS web app prototype where business owners describe their
business and goals, and **AI creates, launches, optimizes, and scales** their
Facebook ad campaigns automatically.

Built as a clean, Stripe/HubSpot/Notion-style dashboard: soft pastel palette,
white background, rounded cards, minimal typography, **desktop-first but fully
responsive**. No build tools, no backend — pure HTML/CSS/JS.

## ▶️ Run it

Just open `index.html` in a browser, or serve the folder:

```bash
# from the adpilot/ folder
python3 -m http.server 8000
# then open http://localhost:8000
```

> An internet connection is needed the first time so the **Chart.js** CDN and
> Google Fonts load. Everything else is local.

## 🧭 Pages (sidebar navigation)

1. **Dashboard** — KPIs (Active Campaigns, Ad Spend, Leads, CPL, ROAS, Conversion
   Rate), Daily Leads / Daily Spend / ROAS Trend / Campaign Performance charts,
   a Recent Activity feed, and an **AI Recommendations** side panel.
2. **AI Campaign Builder** — 5-step wizard: Business Info → Campaign Goal →
   Budget → Geographic Targeting → Launch (Generate Campaign).
3. **AI Audience Intelligence** — customer persona, audience insights (reach,
   buying intent, competition, engagement), recommended Core / Lookalike /
   Retargeting audiences, and an audience confidence score.
4. **AI Copywriter** — Primary Text, Headline, Description, CTA + Regenerate /
   Improve / Shorter / Emotional / High-Converting actions and a Predicted
   Performance score panel.
5. **AI Creative Generator** — Image / Carousel / Video / Reels tabs, each with
   Hook, Story Angle, Visual Concept, CTA and sample ad mockups.
6. **Campaign Review** — objective, audience, budget, estimated reach / leads /
   CPL, projected ROAS, campaign structure, and a big **Launch Campaign** button.
7. **AI Optimization Center** — all campaigns table (Spend, Leads, CPL, ROAS, AI
   Health Score, AI Actions) with an **Enable Full AI Autopilot** toggle.
8. **Learning Engine** — winning audiences / creatives / copies / locations /
   time-of-day, an AI Confidence Score, and improvement-over-time charts.
9. **Settings** — Meta Ad Account, Facebook Page, Instagram, Pixel, Conversion
   API connections plus Notifications, AI Automation guardrails, User Management
   and Subscription Plan.

Plus a persistent **sidebar**, **top navigation** (search, notifications
dropdown, user profile menu) and a **mobile responsive** layout.

## 🧱 Files

- `index.html` — app shell (sidebar, topbar, dropdowns)
- `style.css` — pastel design system + responsive layout
- `app.js` — client-side router, all 9 page renderers, Chart.js charts

Library via CDN: [Chart.js](https://www.chartjs.org/).

> This is a front-end **wireframe / product prototype**. Data is illustrative and
> Meta API actions are simulated (toasts), not live.
