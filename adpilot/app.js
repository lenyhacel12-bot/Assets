/* ===== AdPilot AI — App Logic ===== */
(function () {
  "use strict";

  // ---------- helpers ----------
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const peso = (n) => "₱" + Number(n).toLocaleString("en-PH", { maximumFractionDigits: 2 });
  let charts = [];
  function destroyCharts() { charts.forEach((c) => c.destroy()); charts = []; }

  function toast(msg) {
    const t = $("#toast");
    t.textContent = msg;
    t.hidden = false;
    requestAnimationFrame(() => t.classList.add("show"));
    clearTimeout(toast._t);
    toast._t = setTimeout(() => {
      t.classList.remove("show");
      setTimeout(() => (t.hidden = true), 300);
    }, 2400);
  }

  // shared chart styling
  const GRID = "#eef0f6";
  Chart.defaults.font.family = "Inter, sans-serif";
  Chart.defaults.font.size = 11;
  Chart.defaults.color = "#9aa1b3";
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const noGrid = { grid: { display: false }, border: { display: false } };
  const yGrid = { grid: { color: GRID }, border: { display: false }, ticks: { maxTicksLimit: 5 } };

  function gradient(ctx, hex) {
    const g = ctx.createLinearGradient(0, 0, 0, 200);
    g.addColorStop(0, hex + "55");
    g.addColorStop(1, hex + "00");
    return g;
  }

  // ============================================================
  //  PAGE 1 — DASHBOARD
  // ============================================================
  function pageDashboard() {
    const kpis = [
      { label: "Active Campaigns", value: "24", delta: "+12%", up: true, ico: "▦", tint: "tint-brand" },
      { label: "Total Ad Spend", value: peso(124560), delta: "+8.4%", up: true, ico: "₱", tint: "tint-mint" },
      { label: "Leads Generated", value: "1,248", delta: "+32%", up: true, ico: "◷", tint: "tint-sky" },
      { label: "Cost Per Lead", value: peso(99.72), delta: "-10%", up: true, ico: "◴", tint: "tint-peach" },
      { label: "ROAS", value: "4.32x", delta: "+16%", up: true, ico: "↗", tint: "tint-pink" },
      { label: "Conversion Rate", value: "7.32%", delta: "+6%", up: true, ico: "◑", tint: "tint-lilac" },
    ];

    const activity = [
      { ico: "🚀", tint: "tint-mint", title: "AI launched campaign", meta: "Apartment Rental — Leads", time: "2 min ago" },
      { ico: "⏸", tint: "tint-amber", title: "AI paused underperforming ad", meta: "Bedspace — Creative: Image 2", time: "18 min ago" },
      { ico: "▲", tint: "tint-sky", title: "AI increased budget +25%", meta: "Dorm Rental — Best ad set", time: "1 hour ago" },
      { ico: "◷", tint: "tint-brand", title: "New lead generated", meta: "From Retargeting — All Visitors", time: "1 hour ago" },
      { ico: "◎", tint: "tint-lilac", title: "AI created lookalike audience", meta: "LAL 1% — Best Leads", time: "3 hours ago" },
    ];

    const recos = [
      { ico: "▲", tint: "tint-mint", title: "Increase budget on Apartment Rental", sub: "ROAS 4.8x — scaling could add ~38 leads/wk" },
      { ico: "⏸", tint: "tint-amber", title: "Pause Creative B", sub: "Low CTR (0.6%) detected over 3 days" },
      { ico: "◎", tint: "tint-sky", title: "Create lookalike audience", sub: "Based on your 240 best converting leads" },
      { ico: "↺", tint: "tint-lilac", title: "Retarget website visitors", sub: "High intent — 1,820 visitors last 7 days" },
    ];

    return `
      <div class="page">
        <div class="page-head">
          <div>
            <div class="page-title">Dashboard</div>
            <div class="page-sub">Overview of your AI-powered advertising performance · Last 7 days</div>
          </div>
          <div class="head-actions">
            <select class="select" style="width:auto">
              <option>Last 7 days</option><option>Last 30 days</option><option>This month</option>
            </select>
            <button class="pill-btn" data-page="builder">✨ New AI Campaign</button>
          </div>
        </div>

        <div class="grid kpi-grid mb">
          ${kpis.map((k) => `
            <div class="kpi">
              <div class="kpi-ico ${k.tint}">${k.ico}</div>
              <div class="kpi-label">${k.label}</div>
              <div class="kpi-value">${k.value}</div>
              <div class="kpi-delta ${k.up ? "up" : "down"}">${k.up ? "▲" : "▼"} ${k.delta} <span class="muted" style="font-weight:500">vs last 7d</span></div>
            </div>`).join("")}
        </div>

        <div class="grid dash-main">
          <div class="grid" style="gap:16px">
            <div class="grid cols-2">
              <div class="card"><div class="card-head"><div class="card-title">Daily Leads</div><div class="card-sub">1,248 total</div></div><div class="chart-box"><canvas id="cLeads"></canvas></div></div>
              <div class="card"><div class="card-head"><div class="card-title">Daily Spend</div><div class="card-sub">₱124.5k total</div></div><div class="chart-box"><canvas id="cSpend"></canvas></div></div>
            </div>
            <div class="card"><div class="card-head"><div class="card-title">ROAS Trend</div><div class="card-sub">Avg 4.32x</div></div><div class="chart-box"><canvas id="cRoas"></canvas></div></div>
            <div class="card">
              <div class="card-head"><div class="card-title">Campaign Performance</div><a class="card-sub" style="color:var(--brand);font-weight:600" data-page="optimization">View all ›</a></div>
              <div class="table-wrap">
                <table class="tbl">
                  <thead><tr><th>Campaign</th><th>Spend</th><th>Leads</th><th>CPL</th><th>ROAS</th><th>Status</th></tr></thead>
                  <tbody>
                    ${[
                      ["Apartment Rental — Leads", 28560, 285, 100.21, "4.82x", "active"],
                      ["Bedspace — Messages", 16350, 192, 85.42, "3.91x", "active"],
                      ["Dorm Rental — Leads", 12850, 152, 84.54, "4.15x", "active"],
                      ["Retargeting — All Visitors", 8420, 96, 87.71, "5.32x", "active"],
                    ].map((r) => `
                      <tr><td class="camp-name">${r[0]}</td><td>${peso(r[1])}</td><td>${r[2]}</td><td>${peso(r[3])}</td><td><b>${r[4]}</b></td><td><span class="status ${r[5]}">Active</span></td></tr>`).join("")}
                  </tbody>
                </table>
              </div>
            </div>
            <div class="card">
              <div class="card-head"><div class="card-title">Recent Activity</div><a class="card-sub" style="color:var(--brand);font-weight:600">View all activity ›</a></div>
              <ul class="activity">
                ${activity.map((a) => `
                  <li><div class="act-ico ${a.tint}">${a.ico}</div>
                    <div class="act-body"><div class="act-title">${a.title}</div><div class="act-meta">${a.meta}</div></div>
                    <div class="act-time">${a.time}</div></li>`).join("")}
              </ul>
            </div>
          </div>

          <div class="card assistant" style="position:sticky;top:84px">
            <div class="flex center gap mb">
              <div class="a-ava">✦</div>
              <div><div class="card-title">AI Recommendations</div><div class="card-sub">Updated 2 min ago</div></div>
            </div>
            <div class="reco">
              ${recos.map((r) => `
                <div class="reco-card">
                  <div class="reco-ico ${r.tint}">${r.ico}</div>
                  <div style="flex:1">
                    <div class="reco-title">${r.title}</div>
                    <div class="reco-sub">${r.sub}</div>
                    <div class="reco-act">
                      <button class="mini-btn primary js-apply">Apply</button>
                      <button class="mini-btn">Dismiss</button>
                    </div>
                  </div>
                </div>`).join("")}
            </div>
            <button class="btn mt" style="width:100%" data-page="optimization">View all recommendations</button>
          </div>
        </div>
      </div>`;
  }

  function dashboardCharts() {
    const lc = $("#cLeads").getContext("2d");
    charts.push(new Chart(lc, {
      type: "line",
      data: { labels: days, datasets: [{ data: [142, 168, 155, 190, 178, 205, 210], borderColor: "#6d5dfc", backgroundColor: gradient(lc, "#6d5dfc"), fill: true, tension: .4, pointRadius: 0, borderWidth: 2.5 }] },
      options: baseLine(),
    }));
    const sc = $("#cSpend").getContext("2d");
    charts.push(new Chart(sc, {
      type: "bar",
      data: { labels: days, datasets: [{ data: [15800, 17200, 16400, 19500, 18100, 19200, 18360], backgroundColor: "#34d399", borderRadius: 6, maxBarThickness: 26 }] },
      options: baseBar(),
    }));
    const rc = $("#cRoas").getContext("2d");
    charts.push(new Chart(rc, {
      type: "line",
      data: { labels: days, datasets: [{ data: [3.8, 4.0, 3.95, 4.3, 4.2, 4.45, 4.32], borderColor: "#f472b6", backgroundColor: gradient(rc, "#f472b6"), fill: true, tension: .4, pointRadius: 0, borderWidth: 2.5 }] },
      options: baseLine(),
    }));
  }
  const baseLine = () => ({ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: noGrid, y: yGrid } });
  const baseBar = () => ({ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: noGrid, y: yGrid } });

  // ============================================================
  //  PAGE 2 — AI CAMPAIGN BUILDER (wizard)
  // ============================================================
  const builderSteps = ["Business Info", "Campaign Goal", "Budget", "Targeting", "Launch"];
  let builderStep = 0;

  function stepper(steps, current) {
    return `<div class="stepper">${steps.map((s, i) => {
      const cls = i < current ? "done" : i === current ? "active" : "";
      return `<div class="step ${cls}" data-step="${i}"><span class="num">${i < current ? "✓" : i + 1}</span>${s}</div>${i < steps.length - 1 ? '<div class="step-line"></div>' : ""}`;
    }).join("")}</div>`;
  }

  function pageBuilder() {
    return `
      <div class="page">
        <div class="page-head">
          <div><div class="page-title">AI Campaign Builder</div><div class="page-sub">Build a high-performing Facebook campaign in minutes with AI</div></div>
        </div>
        ${stepper(builderSteps, builderStep)}
        <div class="grid" style="grid-template-columns:1fr 320px;align-items:start">
          <div class="card" id="builderBody">${builderStepBody()}</div>
          <div class="card assistant" style="position:sticky;top:84px">
            <div class="flex center gap mb"><div class="a-ava">✦</div><div><div class="card-title">AI Assistant</div><div class="card-sub">Analyzing your inputs…</div></div></div>
            <p class="muted" style="font-size:12.5px">I'll analyze your business and create a complete, high-converting campaign tailored to your ideal customers.</p>
            <div class="divider"></div>
            <div class="a-step"><span class="tick">✓</span> Understanding your business</div>
            <div class="a-step"><span class="tick">✓</span> Identifying ideal customers</div>
            <div class="a-step"><span class="tick">✓</span> Drafting campaign strategy</div>
            <div class="a-step"><span class="tick" style="background:var(--brand-soft);color:var(--brand)">●</span> Generating ad concepts</div>
          </div>
        </div>
      </div>`;
  }

  function builderStepBody() {
    if (builderStep === 0) {
      return `
        <div class="card-title mb">Step 1 · Business Information</div>
        <div class="form-grid">
          <div class="field"><label>Business Name</label><input class="input" value="CityView Apartments" /></div>
          <div class="field"><label>Industry</label><select class="select"><option>Real Estate Rental</option><option>E-commerce</option><option>Coaching</option><option>Restaurant</option></select></div>
          <div class="field"><label>Website</label><input class="input" value="https://cityviewapartments.com" /></div>
          <div class="field"><label>Facebook Page</label><select class="select"><option>CityView Apartments</option><option>Connect a page…</option></select></div>
        </div>
        <div class="field"><label>Product Description</label><textarea class="textarea">Modern, affordable apartment units for young professionals and families in the city.</textarea></div>
        <div class="field"><label>Offer Description</label><textarea class="textarea">Limited time: 1 month FREE rent when you sign a 12-month lease. Book a free viewing today!</textarea></div>
        ${wizardFoot()}`;
    }
    if (builderStep === 1) {
      const goals = [
        ["◷", "Leads", "Get contact details", true],
        ["💬", "Messages", "Start conversations", false],
        ["🛒", "Sales", "Drive purchases", false],
        ["🌐", "Website Traffic", "Send visitors", false],
        ["📣", "Brand Awareness", "Maximize reach", false],
      ];
      return `
        <div class="card-title mb">Step 2 · Campaign Goal</div>
        <p class="muted" style="font-size:13px;margin-top:-6px">What do you want this campaign to achieve?</p>
        <div class="choices mt">
          ${goals.map((g) => `<div class="choice ${g[3] ? "sel" : ""} js-choice"><div class="c-ico">${g[0]}</div><div class="c-name">${g[1]}</div><div class="c-sub">${g[2]}</div></div>`).join("")}
        </div>
        ${wizardFoot()}`;
    }
    if (builderStep === 2) {
      return `
        <div class="card-title mb">Step 3 · Budget</div>
        <div class="form-grid">
          <div class="field"><label>Daily Budget</label><input class="input" value="₱500" /></div>
          <div class="field"><label>Monthly Budget</label><input class="input" value="₱15,000" /></div>
        </div>
        <div class="card" style="background:var(--brand-softer);border-color:#e1daff">
          <div class="flex center gap"><div class="reco-ico tint-brand">✦</div><div><b style="font-size:13px">AI Budget Suggestion</b><div class="muted" style="font-size:12px">For your goal & location, ₱500/day is optimal to exit the learning phase within ~5 days.</div></div></div>
        </div>
        ${wizardFoot()}`;
    }
    if (builderStep === 3) {
      return `
        <div class="card-title mb">Step 4 · Geographic Targeting</div>
        <div class="form-grid">
          <div class="field"><label>Country</label><select class="select"><option>Philippines</option><option>United States</option></select></div>
          <div class="field"><label>Province / Region</label><select class="select"><option>Metro Manila</option><option>Cebu</option><option>Davao</option></select></div>
          <div class="field"><label>City</label><input class="input" value="Makati, Taguig, Pasig" /></div>
          <div class="field"><label>Radius</label><select class="select"><option>+10 km</option><option>+25 km</option><option>+50 km</option></select></div>
        </div>
        <div class="card" style="background:var(--mint-soft);border-color:#bdf0db">
          <div class="flex center gap"><div class="reco-ico tint-mint">◎</div><div><b style="font-size:13px">Estimated reach: 120K – 280K people</b><div class="muted" style="font-size:12px">Healthy audience size for your daily budget.</div></div></div>
        </div>
        ${wizardFoot()}`;
    }
    // launch
    return `
      <div style="text-align:center;padding:18px 8px">
        <div class="a-ava" style="margin:0 auto 16px;width:64px;height:64px;border-radius:18px;font-size:28px">✦</div>
        <div class="page-title">Ready to Generate</div>
        <p class="muted" style="max-width:420px;margin:8px auto 22px">AdPilot AI will now build your audiences, ad copy, creatives, and budget allocation — then prepare everything for launch.</p>
        <button class="launch-btn" style="max-width:340px;margin:0 auto" id="genCampaign">✨ Generate Campaign</button>
        <div class="wizard-foot mt"><button class="btn" id="wPrev">‹ Back</button><span></span></div>
      </div>`;
  }

  function wizardFoot() {
    return `<div class="wizard-foot mt">
      ${builderStep > 0 ? '<button class="btn" id="wPrev">‹ Back</button>' : "<span></span>"}
      <button class="pill-btn" id="wNext">${builderStep === 3 ? "Review &amp; Launch" : "Next Step"} ›</button>
    </div>`;
  }

  function bindBuilder() {
    const rerender = () => {
      $("#builderBody").innerHTML = builderStepBody();
      // update stepper
      $(".stepper").outerHTML = stepper(builderSteps, builderStep);
      bindBuilder();
    };
    const next = $("#wNext"), prev = $("#wPrev");
    if (next) next.onclick = () => { if (builderStep < 4) { builderStep++; rerender(); } };
    if (prev) prev.onclick = () => { if (builderStep > 0) { builderStep--; rerender(); } };
    $$(".js-choice").forEach((c) => c.onclick = () => { $$(".js-choice").forEach((x) => x.classList.remove("sel")); c.classList.add("sel"); });
    const gen = $("#genCampaign");
    if (gen) gen.onclick = () => { toast("✨ Generating your campaign…"); setTimeout(() => navigate("review"), 900); };
    $$(".step").forEach((s) => s.onclick = () => { builderStep = +s.dataset.step; rerender(); });
  }

  // ============================================================
  //  PAGE 3 — AUDIENCE INTELLIGENCE
  // ============================================================
  function pageAudience() {
    return `
      <div class="page">
        <div class="page-head">
          <div><div class="page-title">AI Audience Intelligence</div><div class="page-sub">AI-generated audience insights and targeting recommendations</div></div>
          <div class="card" style="padding:10px 16px;display:flex;align-items:center;gap:12px;box-shadow:none">
            <div class="ring sm pos-rel" style="--p:90;--c:var(--mint)"><b>90%</b></div>
            <div><div style="font-weight:700;font-size:13px">Audience Confidence</div><div class="muted" style="font-size:11.5px">Very high match</div></div>
          </div>
        </div>

        <div class="grid cols-3">
          <div class="card">
            <div class="card-title mb">Customer Persona</div>
            <div class="persona-top">
              <div class="persona-ava">MS</div>
              <div><div style="font-weight:700;font-size:15px">Maria Santos</div><div class="muted" style="font-size:12px">Young Professional · Renter</div></div>
            </div>
            <div class="kv"><span class="k">Age</span><span class="v">24 – 35</span></div>
            <div class="kv"><span class="k">Gender</span><span class="v">Female (skew)</span></div>
            <div class="kv"><span class="k">Location</span><span class="v">Metro Manila</span></div>
            <div class="section-label">Interests</div>
            <div class="tags"><span class="tag">Urban Living</span><span class="tag">Travel</span><span class="tag mint">Fitness</span><span class="tag sky">Online Shopping</span><span class="tag peach">Career Growth</span></div>
            <div class="section-label">Pain Points</div>
            <div class="tags"><span class="tag peach">High rent</span><span class="tag peach">Long commute</span><span class="tag peach">Unsafe areas</span></div>
            <div class="section-label">Buying Triggers</div>
            <div class="tags"><span class="tag mint">Move-in promos</span><span class="tag mint">Near workplace</span><span class="tag mint">Flexible terms</span></div>
          </div>

          <div class="card">
            <div class="card-title mb">Audience Insights</div>
            <div class="meter"><div class="meter-top"><span>Estimated Reach</span><b>120K – 280K</b></div><div class="meter-bar"><span style="width:72%"></span></div></div>
            <div class="meter"><div class="meter-top"><span>Buying Intent Score</span><b>85 / 100</b></div><div class="meter-bar mint"><span style="width:85%"></span></div></div>
            <div class="meter"><div class="meter-top"><span>Competition Level</span><b>Medium</b></div><div class="meter-bar peach"><span style="width:62%"></span></div></div>
            <div class="meter"><div class="meter-top"><span>Engagement Score</span><b>4.6 / 5</b></div><div class="meter-bar sky"><span style="width:92%"></span></div></div>
            <div class="divider"></div>
            <div class="card-sub mb">Interest affinity</div>
            <div class="chart-box sm"><canvas id="cAffinity"></canvas></div>
          </div>

          <div class="card">
            <div class="card-title mb">Recommended Audiences</div>
            <div class="aud-card">
              <div class="aud-head"><span class="aud-name">Core Audience</span><span class="aud-best">Recommended</span></div>
              <div class="muted" style="font-size:12px">Young professionals & renters in Metro Manila, 24–35.</div>
              <div class="kv"><span class="k">Size</span><span class="v">180K – 250K</span></div>
            </div>
            <div class="aud-card">
              <div class="aud-head"><span class="aud-name">Lookalike Audience</span></div>
              <div class="muted" style="font-size:12px">LAL 1% — Best Leads (180 days source).</div>
              <div class="kv"><span class="k">Size</span><span class="v">90K – 150K</span></div>
            </div>
            <div class="aud-card">
              <div class="aud-head"><span class="aud-name">Retargeting Audience</span></div>
              <div class="muted" style="font-size:12px">Website visitors, last 180 days.</div>
              <div class="kv"><span class="k">Size</span><span class="v">3K – 8K</span></div>
            </div>
            <button class="btn mt" style="width:100%" data-page="copywriter">Continue to Ad Copy ›</button>
          </div>
        </div>
      </div>`;
  }
  function audienceCharts() {
    const ctx = $("#cAffinity").getContext("2d");
    charts.push(new Chart(ctx, {
      type: "bar",
      data: { labels: ["Urban", "Travel", "Fitness", "Shopping", "Career"], datasets: [{ data: [92, 78, 70, 64, 58], backgroundColor: ["#6d5dfc", "#8b7cff", "#a78bfa", "#c4b5fd", "#ddd6fe"], borderRadius: 6, maxBarThickness: 30 }] },
      options: { indexAxis: "y", responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { ...yGrid, max: 100 }, y: noGrid } },
    }));
  }

  // ============================================================
  //  PAGE 4 — AI COPYWRITER
  // ============================================================
  function pageCopywriter() {
    return `
      <div class="page">
        <div class="page-head">
          <div><div class="page-title">AI Copywriter</div><div class="page-sub">Generate high-converting ad copy that sells</div></div>
          <div class="head-actions"><button class="btn">＋ New Variation</button></div>
        </div>
        <div class="grid" style="grid-template-columns:1fr 320px;align-items:start">
          <div class="card">
            <div class="copy-block">
              <div class="cb-label">Primary Text</div><span class="charcount">312 / 500</span>
              <p>Looking for a modern apartment in the heart of the city? 🏙️<br><br>
              CityView Apartments offers stylish units, premium amenities, and the perfect location for your lifestyle.<br><br>
              ✅ Limited time: <b>1 month FREE rent</b><br>✅ Near BGC, Makati & major districts<br>✅ 24/7 security · Pool, gym & more<br><br>
              👉 Book a free viewing today!</p>
            </div>
            <div class="copy-block">
              <div class="cb-label">Headline</div><span class="charcount">37 / 40</span>
              <p style="font-weight:700;font-size:15px">Modern Apartments. Better Living.</p>
            </div>
            <div class="copy-block">
              <div class="cb-label">Description</div><span class="charcount">34 / 60</span>
              <p>1 month FREE rent — limited time only.</p>
            </div>
            <div class="copy-block">
              <div class="cb-label">Call To Action</div>
              <span class="cta-chip">📅 Book Now</span>
            </div>
            <div class="btn-row">
              <button class="btn primary js-copyaction">↻ Regenerate</button>
              <button class="btn js-copyaction">✨ Improve Copy</button>
              <button class="btn js-copyaction">⤓ Shorter Version</button>
              <button class="btn js-copyaction">❤ Emotional Version</button>
              <button class="btn mint js-copyaction">🚀 High-Converting</button>
            </div>
          </div>

          <div class="card assistant" style="position:sticky;top:84px">
            <div class="card-title mb">Predicted Performance</div>
            <div class="ring-wrap mb">
              <div class="ring pos-rel" style="--p:92;--c:var(--mint)"><b>92</b></div>
              <div><div style="font-weight:700">Excellent</div><div class="muted" style="font-size:12px">High chance of driving results</div></div>
            </div>
            <div class="section-label">Why this will work</div>
            <ul class="checklist">
              <li>Strong offer & urgency</li>
              <li>Clear, scannable benefits</li>
              <li>Emotional + lifestyle triggers</li>
              <li>Easy to understand</li>
              <li>High engagement potential</li>
            </ul>
            <div class="divider"></div>
            <div class="meter"><div class="meter-top"><span>Predicted CTR</span><b>2.4%</b></div><div class="meter-bar mint"><span style="width:80%"></span></div></div>
            <div class="meter"><div class="meter-top"><span>Readability</span><b>Grade 6</b></div><div class="meter-bar sky"><span style="width:90%"></span></div></div>
            <button class="btn mt" style="width:100%" data-page="creative">Continue to Creatives ›</button>
          </div>
        </div>
      </div>`;
  }

  // ============================================================
  //  PAGE 5 — CREATIVE GENERATOR
  // ============================================================
  const creativeData = {
    Image: [
      { g: "g1", title: "Modern Living, Prime Location", hook: "Live in the heart of the city", story: "Convenience meets comfort", visual: "Bright, modern interior shot", cta: "Book a Viewing" },
      { g: "g2", title: "Your New Home Awaits You", hook: "Your new home is waiting", story: "Start a better lifestyle today", visual: "Cozy, sunlit bedroom", cta: "Book a Viewing" },
      { g: "g3", title: "Premium Amenities, Better Lifestyle", hook: "More than just an apartment", story: "Amenities that elevate living", visual: "Rooftop pool at golden hour", cta: "Learn More" },
      { g: "g4", title: "Live Closer to What Matters", hook: "Closer to what matters", story: "Perfect location advantage", visual: "City skyline view", cta: "Book a Viewing" },
    ],
    Carousel: [
      { g: "g2", title: "Studio · 1BR · 2BR Units", hook: "A layout for every lifestyle", story: "Swipe to find your fit", visual: "3-card unit walkthrough", cta: "See Units" },
      { g: "g1", title: "Tour the Amenities", hook: "Pool, gym, lounge & more", story: "Card-by-card amenity tour", visual: "Amenity highlight cards", cta: "Book a Viewing" },
      { g: "g3", title: "Why Residents Love It", hook: "Real resident favorites", story: "Benefit-per-card storytelling", visual: "Lifestyle + testimonial cards", cta: "Learn More" },
      { g: "g4", title: "Move-in Steps Made Easy", hook: "3 simple steps to move in", story: "Process explained per card", visual: "Numbered step cards", cta: "Get Started" },
    ],
    Video: [
      { g: "g3", title: "60s Apartment Walkthrough", hook: "See it before you book it", story: "Hook → tour → offer → CTA", visual: "Handheld unit walkthrough", cta: "Book a Viewing" },
      { g: "g1", title: "A Day at CityView", hook: "Imagine your day here", story: "Morning-to-night lifestyle", visual: "Cinematic day-in-life", cta: "Learn More" },
      { g: "g4", title: "Location Highlights Reel", hook: "Everything is minutes away", story: "Map + nearby spots montage", visual: "Fast-cut location b-roll", cta: "Book a Viewing" },
      { g: "g2", title: "Resident Testimonial", hook: "Hear it from our residents", story: "Authentic social proof", visual: "Talking-head interview", cta: "See Units" },
    ],
    Reels: [
      { g: "g1", title: "POV: Your Dream Apartment", hook: "POV: you just moved in ✨", story: "Trend-led, fast & punchy", visual: "Vertical POV walkthrough", cta: "Book Now" },
      { g: "g4", title: "Apartment Glow-up", hook: "From empty to dream home", story: "Before/after transformation", visual: "Trending transition edit", cta: "See Units" },
      { g: "g2", title: "Things You Get Here", hook: "3 things you'll love 👀", story: "List-style hook retention", visual: "Quick on-screen text reel", cta: "Learn More" },
      { g: "g3", title: "Rent vs. Reality", hook: "1 month FREE rent?!", story: "Offer-led pattern interrupt", visual: "Reaction + offer overlay", cta: "Book Now" },
    ],
  };
  let creativeTab = "Image";

  function pageCreative() {
    const list = creativeData[creativeTab];
    return `
      <div class="page">
        <div class="page-head">
          <div><div class="page-title">AI Creative Generator</div><div class="page-sub">AI-powered creative ideas and ad mockups</div></div>
          <div class="head-actions"><button class="pill-btn ghost">✨ Generate More</button></div>
        </div>
        <div class="tabs mb">
          ${Object.keys(creativeData).map((t) => `<button class="tab ${t === creativeTab ? "active" : ""} js-ctab" data-tab="${t}">${t} Ads</button>`).join("")}
        </div>
        <div class="creative-grid">
          ${list.map((c) => `
            <div class="creative">
              <div class="mockup ${c.g}">
                <span class="badge-offer">1 MONTH FREE RENT</span>
                <h4>${c.title}</h4>
                <span class="fake-cta">${c.cta}</span>
              </div>
              <div class="creative-body">
                <div class="cr-line"><span class="l">Hook</span>${c.hook}</div>
                <div class="cr-line"><span class="l">Story Angle</span>${c.story}</div>
                <div class="cr-line"><span class="l">Visual Concept</span>${c.visual}</div>
                <div class="cr-line"><span class="l">CTA</span>${c.cta}</div>
                <div class="btn-row mt-s"><button class="mini-btn primary">Use this</button><button class="mini-btn">↻ Remix</button></div>
              </div>
            </div>`).join("")}
        </div>
      </div>`;
  }

  // ============================================================
  //  PAGE 6 — CAMPAIGN REVIEW
  // ============================================================
  function pageReview() {
    return `
      <div class="page">
        <div class="page-head">
          <div><div class="page-title">Campaign Review</div><div class="page-sub">Review your AI-generated campaign before launch</div></div>
          <div class="head-actions"><button class="btn" data-page="builder">‹ Edit Campaign</button></div>
        </div>

        <div class="grid" style="grid-template-columns:1fr 340px;align-items:start">
          <div class="grid" style="gap:16px">
            <div class="grid cols-2">
              <div class="card"><div class="card-sub">Campaign Objective</div><div style="font-weight:700;font-size:18px;margin-top:6px">◷ Leads</div><div class="muted" style="font-size:12px;margin-top:4px">Get more leads for your business</div></div>
              <div class="card"><div class="card-sub">Target Audience</div><div style="font-weight:700;font-size:15px;margin-top:6px">Young Professionals & Renters</div><div class="muted" style="font-size:12px;margin-top:4px">Metro Manila · 24–35 · Urban living, fitness, career</div></div>
            </div>

            <div class="review-grid">
              <div class="rv"><div class="rl">Budget</div><div class="rv-val">${peso(500)}</div><div class="rv-sub">Daily · ₱15,000 / mo</div></div>
              <div class="rv"><div class="rl">Estimated Reach</div><div class="rv-val">120K–280K</div><div class="rv-sub">people / month</div></div>
              <div class="rv"><div class="rl">Estimated Leads</div><div class="rv-val">25 – 60</div><div class="rv-sub">per day</div></div>
              <div class="rv"><div class="rl">Estimated CPL</div><div class="rv-val">₱80–120</div><div class="rv-sub">per lead</div></div>
            </div>

            <div class="card">
              <div class="card-head"><div class="card-title">Campaign Structure</div><span class="status active">AI Optimized</span></div>
              <div class="funnel">
                <div class="funnel-step"><div class="fs-name">Campaign</div><div class="fs-meta">Leads · CBO</div></div>
                <div class="funnel-arrow">›</div>
                <div class="funnel-step"><div class="fs-name">Ad Set 1</div><div class="fs-meta">Core · 3 ads</div></div>
                <div class="funnel-arrow">›</div>
                <div class="funnel-step"><div class="fs-name">Ad Set 2</div><div class="fs-meta">Lookalike · 3 ads</div></div>
                <div class="funnel-arrow">›</div>
                <div class="funnel-step"><div class="fs-name">Ad Set 3</div><div class="fs-meta">Retargeting · 3 ads</div></div>
              </div>
            </div>

            <div class="card">
              <div class="card-head"><div class="card-title">Projected ROAS</div><div class="card-sub">90-day projection</div></div>
              <div class="flex center gap mb"><div style="font-size:28px;font-weight:800">4.0x – 6.0x</div><span class="status active" style="margin-bottom:4px">Very Good</span></div>
              <div class="chart-box sm"><canvas id="cProjRoas"></canvas></div>
            </div>
          </div>

          <div class="card" style="position:sticky;top:84px">
            <div class="card-title mb">Launch Summary</div>
            <div class="kv"><span class="k">Objective</span><span class="v">Leads</span></div>
            <div class="kv"><span class="k">Daily Budget</span><span class="v">${peso(500)}</span></div>
            <div class="kv"><span class="k">Audiences</span><span class="v">3 ad sets</span></div>
            <div class="kv"><span class="k">Ad Creatives</span><span class="v">9 variations</span></div>
            <div class="kv"><span class="k">Ad Copies</span><span class="v">5 variations</span></div>
            <div class="kv"><span class="k">Est. Leads / mo</span><span class="v">750 – 1,800</span></div>
            <div class="divider"></div>
            <button class="launch-btn" id="launchBtn">🚀 Launch Campaign</button>
            <button class="btn mt" style="width:100%">Save as Draft</button>
            <p class="muted" style="font-size:11px;text-align:center;margin-top:10px">Will be published via Meta Marketing API</p>
          </div>
        </div>
      </div>`;
  }
  function reviewCharts() {
    const ctx = $("#cProjRoas").getContext("2d");
    charts.push(new Chart(ctx, {
      type: "line",
      data: { labels: ["Wk 1", "Wk 2", "Wk 4", "Wk 6", "Wk 8", "Wk 12"], datasets: [
        { label: "Low", data: [2.1, 2.8, 3.4, 3.7, 3.9, 4.0], borderColor: "#c4b5fd", borderWidth: 2, pointRadius: 0, tension: .4 },
        { label: "High", data: [3.0, 3.9, 4.6, 5.2, 5.6, 6.0], borderColor: "#6d5dfc", backgroundColor: gradient(ctx, "#6d5dfc"), fill: true, borderWidth: 2.5, pointRadius: 0, tension: .4 },
      ] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: noGrid, y: yGrid } },
    }));
  }

  // ============================================================
  //  PAGE 7 — OPTIMIZATION CENTER
  // ============================================================
  const optRows = [
    ["Apartment Rental — Leads", "active", 28560, 285, 100.21, "4.82x", 92, "h-good", ["inc"]],
    ["Bedspace — Messages", "active", 16350, 196, 83.42, "3.91x", 78, "h-ok", ["dup"]],
    ["Dorm Rental — Leads", "active", 12850, 152, 84.54, "4.15x", 81, "h-good", ["inc"]],
    ["Retargeting — All Visitors", "active", 8420, 96, 87.71, "5.32x", 95, "h-good", ["inc", "dup"]],
    ["Condo Rental — Leads", "paused", 4250, 28, 151.78, "1.92x", 45, "h-bad", ["pause"]],
    ["Lookalike — Best Leads", "active", 6780, 88, 77.05, "6.21x", 88, "h-good", ["retarget"]],
  ];
  const chipLabel = { inc: "Increase Budget", pause: "Pause Campaign", dup: "Duplicate Winner", retarget: "Launch Retargeting" };

  function pageOptimization() {
    return `
      <div class="page">
        <div class="page-head">
          <div><div class="page-title">AI Optimization Center</div><div class="page-sub">AI monitors and optimizes your campaigns 24/7</div></div>
        </div>

        <div class="autopilot-banner">
          <div class="ap-ico">✦</div>
          <div class="ap-text" style="flex:1"><b>Full AI Autopilot</b><div>When enabled, AI adjusts budgets, creates audiences, launches retargeting, pauses losing ads, and scales winners — automatically.</div></div>
          <label class="switch"><input type="checkbox" id="autopilot" checked><span class="track"></span></label>
        </div>

        <div class="grid kpi-grid mb" style="grid-template-columns:repeat(4,1fr)">
          <div class="kpi"><div class="kpi-ico tint-mint">↗</div><div class="kpi-label">Avg ROAS</div><div class="kpi-value">4.39x</div></div>
          <div class="kpi"><div class="kpi-ico tint-brand">✦</div><div class="kpi-label">AI Actions (24h)</div><div class="kpi-value">37</div></div>
          <div class="kpi"><div class="kpi-ico tint-sky">◷</div><div class="kpi-label">Leads Today</div><div class="kpi-value">214</div></div>
          <div class="kpi"><div class="kpi-ico tint-peach">◴</div><div class="kpi-label">Avg CPL</div><div class="kpi-value">${peso(94.2)}</div></div>
        </div>

        <div class="card mb">
          <div class="card-head"><div class="card-title">All Campaigns</div><div class="card-sub">${optRows.length} campaigns · live</div></div>
          <div class="table-wrap">
            <table class="tbl" style="min-width:920px">
              <thead><tr><th>Campaign</th><th>Status</th><th>Spend</th><th>Leads</th><th>CPL</th><th>ROAS</th><th>AI Health</th><th>AI Actions</th></tr></thead>
              <tbody>
                ${optRows.map((r) => {
                  const sLabel = r[1].charAt(0).toUpperCase() + r[1].slice(1);
                  return `<tr>
                    <td class="camp-name">${r[0]}</td>
                    <td><span class="status ${r[1]}">${sLabel}</span></td>
                    <td>${peso(r[2])}</td><td>${r[3]}</td><td>${peso(r[4])}</td><td><b>${r[5]}</b></td>
                    <td><div class="health"><div class="health-bar ${r[7]}"><span style="width:${r[6]}%"></span></div><b>${r[6]}</b></div></td>
                    <td><div class="ai-actions-cell">${r[8].map((a) => `<span class="ai-chip ${a}">${chipLabel[a]}</span>`).join("")}</div></td>
                  </tr>`;
                }).join("")}
              </tbody>
            </table>
          </div>
        </div>

        <div class="card">
          <div class="card-title mb">AI Actions Legend</div>
          <div class="legend">
            <div class="legend-item"><span class="legend-dot tint-mint">▲</span> Increase Budget — scale winning ads</div>
            <div class="legend-item"><span class="legend-dot tint-amber">⏸</span> Pause Campaign — stop underperformers</div>
            <div class="legend-item"><span class="legend-dot tint-sky">⧉</span> Duplicate Winner — test new variations</div>
            <div class="legend-item"><span class="legend-dot tint-lilac">↺</span> Launch Retargeting — re-engage visitors</div>
          </div>
        </div>
      </div>`;
  }
  function bindOptimization() {
    const ap = $("#autopilot");
    if (ap) ap.onchange = () => toast(ap.checked ? "🤖 Full AI Autopilot enabled" : "Autopilot paused — manual mode");
  }

  // ============================================================
  //  PAGE 8 — LEARNING ENGINE
  // ============================================================
  function pageLearning() {
    return `
      <div class="page">
        <div class="page-head">
          <div><div class="page-title">AI Learning Engine</div><div class="page-sub">See how AdPilot AI learns and improves over time</div></div>
          <div class="card" style="padding:10px 16px;display:flex;align-items:center;gap:12px;box-shadow:none">
            <div class="ring sm pos-rel" style="--p:96;--c:var(--brand)"><b>96%</b></div>
            <div><div style="font-weight:700;font-size:13px">AI Confidence Score</div><div class="muted" style="font-size:11.5px">Smarter every week</div></div>
          </div>
        </div>

        <div class="learn-grid mb">
          <div class="learn-card"><div class="lc-ico tint-brand">◎</div><div class="lc-val">12</div><div class="lc-label">Winning Audiences</div><div class="lc-meta">+3 this week</div></div>
          <div class="learn-card"><div class="lc-ico tint-pink">▣</div><div class="lc-val">18</div><div class="lc-label">Winning Creatives</div><div class="lc-meta">+5 this week</div></div>
          <div class="learn-card"><div class="lc-ico tint-mint">✎</div><div class="lc-val">24</div><div class="lc-label">Winning Ad Copies</div><div class="lc-meta">+6 this week</div></div>
          <div class="learn-card"><div class="lc-ico tint-sky">📍</div><div class="lc-val">8</div><div class="lc-label">Best Locations</div><div class="lc-meta">+2 this week</div></div>
          <div class="learn-card"><div class="lc-ico tint-peach">🕐</div><div class="lc-val">7–10PM</div><div class="lc-label">Best Time of Day</div><div class="lc-meta">Highest conversions</div></div>
        </div>

        <div class="grid" style="grid-template-columns:1.6fr 1fr;align-items:start">
          <div class="card">
            <div class="card-head"><div class="card-title">Performance Improvement Over Time</div><div class="card-sub">Last 6 months</div></div>
            <div class="chart-box"><canvas id="cLearn"></canvas></div>
          </div>
          <div class="card">
            <div class="card-title mb">What AI Learned This Week</div>
            <ul class="insight-list">
              <li><span class="il-ico tint-mint">▲</span><div>Lookalike audiences perform <b>31% better</b> than interest targeting.</div></li>
              <li><span class="il-ico tint-sky">▣</span><div>Video creatives get <b>2.4x more</b> engagement than images.</div></li>
              <li><span class="il-ico tint-peach">🕐</span><div>Evening ads convert <b>28% better</b> (7–10PM).</div></li>
              <li><span class="il-ico tint-lilac">↺</span><div>Retargeting ads have the <b>lowest CPL</b> at ₱62.</div></li>
            </ul>
            <div class="divider"></div>
            <div class="card-sub mb">AI Model Training Progress</div>
            <div class="meter"><div class="meter-top"><span>Training on your data…</span><b>82%</b></div><div class="meter-bar"><span style="width:82%"></span></div></div>
            <p class="muted" style="font-size:11.5px;margin-top:4px">More data = smarter AI · 4,200 conversions analyzed</p>
          </div>
        </div>
      </div>`;
  }
  function learningCharts() {
    const ctx = $("#cLearn").getContext("2d");
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
    charts.push(new Chart(ctx, {
      type: "line",
      data: { labels: months, datasets: [
        { label: "ROAS", data: [2.4, 2.9, 3.3, 3.8, 4.1, 4.4], borderColor: "#6d5dfc", backgroundColor: gradient(ctx, "#6d5dfc"), fill: true, tension: .4, pointRadius: 0, borderWidth: 2.5 },
        { label: "CPL (₱, ÷40)", data: [3.6, 3.2, 2.9, 2.6, 2.4, 2.35], borderColor: "#f472b6", tension: .4, pointRadius: 0, borderWidth: 2 },
        { label: "Conv. Rate", data: [1.0, 1.4, 1.8, 2.3, 2.8, 3.2], borderColor: "#34d399", tension: .4, pointRadius: 0, borderWidth: 2 },
      ] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: true, position: "bottom", labels: { boxWidth: 10, boxHeight: 10, usePointStyle: true, padding: 16 } } }, scales: { x: noGrid, y: yGrid } },
    }));
  }

  // ============================================================
  //  PAGE 9 — SETTINGS
  // ============================================================
  function pageSettings() {
    const conns = [
      ["📘", "tint-sky", "Meta Ad Account", "act_1029384756 · Business Manager", true],
      ["👍", "tint-brand", "Facebook Page", "CityView Apartments", true],
      ["📷", "tint-pink", "Instagram Account", "@cityview.apartments", true],
      ["◎", "tint-lilac", "Meta Pixel", "Tracking 4 standard events", true],
      ["🔌", "tint-mint", "Conversion API (CAPI)", "Server-side events active", true],
    ];
    const prefs = [
      ["🔔", "tint-peach", "Notification Settings", "Email, push & in-app alerts"],
      ["🤖", "tint-brand", "AI Automation Settings", "Autopilot rules & guardrails"],
      ["👥", "tint-sky", "User Management", "3 team members · roles & access"],
      ["💳", "tint-mint", "Subscription Plan", "Pro Plan · ₱2,499 / mo · renews Jul 22"],
    ];
    return `
      <div class="page">
        <div class="page-head">
          <div><div class="page-title">Settings</div><div class="page-sub">Manage your accounts, connections and preferences</div></div>
        </div>

        <div class="grid cols-2" style="align-items:start">
          <div class="card">
            <div class="card-title mb">Integrations &amp; Connections</div>
            <div class="set-list">
              ${conns.map((c) => `
                <div class="set-row">
                  <div class="set-ico ${c[1]}">${c[0]}</div>
                  <div class="set-info"><b>${c[2]}</b><div>${c[3]}</div></div>
                  <span class="conn-pill ${c[4] ? "on" : "off"}">${c[4] ? "● Connected" : "Connect"}</span>
                </div>`).join("")}
            </div>
          </div>

          <div class="grid" style="gap:16px">
            <div class="card">
              <div class="card-title mb">Preferences</div>
              <div class="set-list">
                ${prefs.map((p) => `
                  <div class="set-row">
                    <div class="set-ico ${p[1]}">${p[0]}</div>
                    <div class="set-info"><b>${p[2]}</b><div>${p[3]}</div></div>
                    <span class="chevron" style="font-size:18px">›</span>
                  </div>`).join("")}
              </div>
            </div>

            <div class="card">
              <div class="card-title mb">AI Automation Guardrails</div>
              <div class="set-row" style="border:0;padding:10px 0">
                <div class="set-info"><b>Full Autopilot</b><div>Let AI manage everything automatically</div></div>
                <label class="switch"><input type="checkbox" checked><span class="track"></span></label>
              </div>
              <div class="set-row" style="padding:10px 0"><div class="set-info"><b>Auto-pause losing ads</b><div>Pause when ROAS &lt; 1.5x for 3 days</div></div><label class="switch"><input type="checkbox" checked><span class="track"></span></label></div>
              <div class="set-row" style="padding:10px 0"><div class="set-info"><b>Auto-scale winners</b><div>Increase budget up to +25% / day</div></div><label class="switch"><input type="checkbox" checked><span class="track"></span></label></div>
              <div class="set-row" style="border:0;padding:10px 0"><div class="set-info"><b>Max daily spend cap</b><div>Hard limit across all campaigns</div></div><input class="input" style="width:120px" value="₱20,000"></div>
            </div>
          </div>
        </div>
      </div>`;
  }

  // ============================================================
  //  ROUTER
  // ============================================================
  const pages = {
    dashboard: { render: pageDashboard, after: dashboardCharts },
    builder: { render: pageBuilder, after: bindBuilder },
    audience: { render: pageAudience, after: audienceCharts },
    copywriter: { render: pageCopywriter, after: null },
    creative: { render: pageCreative, after: bindCreative },
    review: { render: pageReview, after: reviewCharts },
    optimization: { render: pageOptimization, after: bindOptimization },
    learning: { render: pageLearning, after: learningCharts },
    settings: { render: pageSettings, after: null },
  };

  function bindCreative() {
    $$(".js-ctab").forEach((t) => t.onclick = () => { creativeTab = t.dataset.tab; navigate("creative"); });
  }

  function navigate(page) {
    if (!pages[page]) page = "dashboard";
    destroyCharts();
    const content = $("#content");
    content.innerHTML = pages[page].render();
    content.scrollTop = 0;
    window.scrollTo(0, 0);
    // nav active state
    $$(".nav-item").forEach((n) => n.classList.toggle("active", n.dataset.page === page));
    if (pages[page].after) pages[page].after();
    // global delegated bindings
    bindCommon(content);
    closeSidebar();
  }

  function bindCommon(scope) {
    $$("[data-page]", scope).forEach((el) => {
      if (el.classList.contains("nav-item")) return;
      el.addEventListener("click", (e) => { e.preventDefault(); navigate(el.dataset.page); });
    });
    $$(".js-apply", scope).forEach((b) => b.onclick = () => toast("✓ Recommendation applied"));
    $$(".js-copyaction", scope).forEach((b) => b.onclick = () => toast("✨ Generating new copy…"));
    const launch = $("#launchBtn", scope);
    if (launch) launch.onclick = () => { toast("🚀 Campaign launched via Meta API!"); setTimeout(() => navigate("optimization"), 1000); };
  }

  // ============================================================
  //  SHELL WIRING
  // ============================================================
  function closeSidebar() {
    $("#sidebar").classList.remove("open");
    $("#scrim").classList.remove("show");
  }
  function openSidebar() {
    $("#sidebar").classList.add("open");
    $("#scrim").classList.add("show");
  }

  function init() {
    // sidebar nav
    $$(".nav-item").forEach((n) => n.addEventListener("click", () => navigate(n.dataset.page)));
    $("#menuBtn").onclick = openSidebar;
    $("#sidebarClose").onclick = closeSidebar;
    $("#scrim").onclick = closeSidebar;
    $("#quickBuild").onclick = () => { builderStep = 0; navigate("builder"); };
    $("#userCardSide").onclick = () => navigate("settings");

    // dropdowns
    const notifBtn = $("#notifBtn"), notifMenu = $("#notifMenu");
    const profileBtn = $("#profileBtn"), profileMenu = $("#profileMenu");
    const toggle = (menu, other) => { other.hidden = true; menu.hidden = !menu.hidden; };
    notifBtn.onclick = (e) => { e.stopPropagation(); toggle(notifMenu, profileMenu); };
    profileBtn.onclick = (e) => { e.stopPropagation(); toggle(profileMenu, notifMenu); };
    document.addEventListener("click", () => { notifMenu.hidden = true; profileMenu.hidden = true; });
    [notifMenu, profileMenu].forEach((m) => m.addEventListener("click", (e) => e.stopPropagation()));
    $$(".menu-link[data-page]").forEach((l) => l.onclick = () => { profileMenu.hidden = true; navigate(l.dataset.page); });
    $(".dropdown-foot").onclick = () => { notifMenu.hidden = true; toast("Opening activity feed…"); };

    navigate("dashboard");
  }

  document.addEventListener("DOMContentLoaded", init);
})();
