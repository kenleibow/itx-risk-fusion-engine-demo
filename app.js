const state = {
  riskProfile: { health: 58, lifestyle: 52, timing: 70 },
  sources: {
    aps: { label: "APS Records", icon: "A", boxClass: "blue-box", risk: 65, confidence: 55 },
    rx: { label: "Rx Data", icon: "R", boxClass: "purple-box", risk: 72, confidence: 75 },
    labs: { label: "Lab Results", icon: "L", boxClass: "green-box", risk: 48, confidence: 90 },
    wearables: { label: "Wearables", icon: "W", boxClass: "orange-box", risk: 58, confidence: 65 }
  }
};

function baselineRisk() {
  const p = state.riskProfile;
  return Math.round(p.health * 0.45 + p.lifestyle * 0.3 + (100 - p.timing) * 0.25);
}

function calculate() {
  const base = baselineRisk();
  const evidence = Object.entries(state.sources).map(([key, s]) => {
    const variance = Math.max(1, 101 - s.confidence);
    const weight = 1 / variance;
    const blendedRisk = Math.round(s.risk * 0.75 + base * 0.25);
    return { key, label: s.label, weight, risk: blendedRisk, confidence: s.confidence };
  });

  const totalWeight = evidence.reduce((sum, e) => sum + e.weight, 0) || 1;
  const fusedRisk = Math.round(evidence.reduce((sum, e) => sum + e.risk * e.weight, 0) / totalWeight);
  const confidence = Math.max(1, Math.min(99, Math.round(
    evidence.reduce((sum, e) => sum + e.confidence * e.weight, 0) / totalWeight
  )));

  let decision = "Standard";
  if (fusedRisk > 75) decision = "Decline";
  else if (fusedRisk > 60) decision = "Table Rated";
  else if (fusedRisk > 45) decision = "Standard Plus";
  else decision = "Preferred";

  return { base, fusedRisk, confidence, decision, evidence: evidence.sort((a,b) => b.weight - a.weight) };
}

function renderSources() {
  const container = document.getElementById("sources");
  container.innerHTML = "";

  Object.entries(state.sources).forEach(([key, source]) => {
    const wrapper = document.createElement("div");
    wrapper.className = "source-card";
    wrapper.innerHTML = `
      <div class="source-top">
        <div class="icon-box ${source.boxClass}">${source.icon}</div>
        <div class="source-title">${source.label}</div>
      </div>
      <div class="input-label">Source Risk Assessment: <span id="${key}-risk-value">${source.risk}</span></div>
      <input type="range" min="0" max="100" value="${source.risk}" id="${key}-risk" />
      <div class="input-label">Confidence: <span id="${key}-confidence-value">${source.confidence}</span></div>
      <input type="range" min="0" max="99" value="${source.confidence}" id="${key}-confidence" />
    `;
    container.appendChild(wrapper);

    document.getElementById(`${key}-risk`).addEventListener("input", (e) => {
      state.sources[key].risk = Number(e.target.value);
      document.getElementById(`${key}-risk-value`).textContent = e.target.value;
      renderResults();
    });

    document.getElementById(`${key}-confidence`).addEventListener("input", (e) => {
      state.sources[key].confidence = Number(e.target.value);
      document.getElementById(`${key}-confidence-value`).textContent = e.target.value;
      renderResults();
    });
  });
}

function renderResults() {
  const results = calculate();

  document.getElementById("baselineRiskValue").textContent = results.base;
  document.getElementById("baselineRiskPanel").textContent = results.base;
  document.getElementById("fusedRiskValue").textContent = results.fusedRisk;
  document.getElementById("confidenceValue").textContent = results.confidence + "%";
  document.getElementById("decisionValue").textContent = results.decision;
  document.getElementById("fusedRiskBar").style.width = results.fusedRisk + "%";
  document.getElementById("confidenceBar").style.width = results.confidence + "%";

  const explainList = document.getElementById("explainList");
  explainList.innerHTML = "";
  results.evidence.forEach((e) => {
    const row = document.createElement("div");
    row.className = "explain-row";
    row.innerHTML = `
      <span>${e.label}</span>
      <span class="explain-right">Weight ${e.weight.toFixed(2)} · Blended Risk ${e.risk}</span>
    `;
    explainList.appendChild(row);
  });
}

function bindProfileControls() {
  ["health", "lifestyle", "timing"].forEach((field) => {
    const el = document.getElementById(field);
    const valueEl = document.getElementById(field + "Value");
    el.addEventListener("input", (e) => {
      state.riskProfile[field] = Number(e.target.value);
      valueEl.textContent = e.target.value;
      renderResults();
    });
  });
}

document.getElementById("conflictBtn").addEventListener("click", () => {
  state.riskProfile = { health: 72, lifestyle: 60, timing: 35 };
  document.getElementById("health").value = 72;
  document.getElementById("lifestyle").value = 60;
  document.getElementById("timing").value = 35;
  document.getElementById("healthValue").textContent = "72";
  document.getElementById("lifestyleValue").textContent = "60";
  document.getElementById("timingValue").textContent = "35";

  state.sources.aps.risk = 80; state.sources.aps.confidence = 50;
  state.sources.rx.risk = 75; state.sources.rx.confidence = 80;
  state.sources.labs.risk = 45; state.sources.labs.confidence = 92;
  state.sources.wearables.risk = 60; state.sources.wearables.confidence = 60;

  renderSources();
  renderResults();
});

renderSources();
bindProfileControls();
renderResults();
