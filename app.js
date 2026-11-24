(() => {
  const STORAGE_KEY = "condition-lab-trials-v1";
  const BASELINE = { force: 12, mass: 2 };
  const forceInput = document.getElementById("forceInput");
  const massInput = document.getElementById("massInput");
  const forceValue = document.getElementById("forceValue");
  const massValue = document.getElementById("massValue");
  const accelerationValue = document.getElementById("accelerationValue");
  const baselineAcceleration = document.getElementById("baselineAcceleration");
  const conditionText = document.getElementById("conditionText");
  const conditionCheck = document.querySelector(".condition-check");
  const deltaIndicator = document.getElementById("deltaIndicator");
  const canvas = document.getElementById("simulationCanvas");
  const context = canvas.getContext("2d");
  const rows = document.getElementById("trialRows");
  let trials = [];

  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    if (Array.isArray(saved)) trials = saved.filter(isTrial);
  } catch {
    trials = [];
  }

  function isTrial(value) {
    return value && Number.isFinite(value.force) && Number.isFinite(value.mass) && Number.isFinite(value.acceleration) && typeof value.id === "string";
  }

  function readState() {
    const force = Number(forceInput.value);
    const mass = Number(massInput.value);
    return { force, mass, acceleration: force / mass };
  }

  function sameForce(state) {
    return Math.abs(state.force - BASELINE.force) < 0.001;
  }

  function draw() {
    const bounds = canvas.getBoundingClientRect();
    const ratio = window.devicePixelRatio || 1;
    canvas.width = Math.max(1, Math.round(bounds.width * ratio));
    canvas.height = Math.max(1, Math.round(bounds.height * ratio));
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    const w = bounds.width;
    const h = bounds.height;
    const state = readState();
    context.clearRect(0, 0, w, h);

    context.strokeStyle = "#d5e1dd";
    context.lineWidth = 1;
    context.beginPath();
    context.moveTo(24, h - 41);
    context.lineTo(w - 24, h - 41);
    context.stroke();

    const cartWidth = Math.min(120, 56 + state.mass * 5.2);
    const cartHeight = Math.min(60, 34 + state.mass * 2.2);
    const cartX = Math.max(62, w * 0.38 - cartWidth / 2);
    const cartY = h - 41 - cartHeight;
    const radius = 8;
    context.fillStyle = "#187d78";
    context.beginPath();
    context.roundRect(cartX, cartY, cartWidth, cartHeight, radius);
    context.fill();
    context.fillStyle = "rgba(255,255,255,.34)";
    context.fillRect(cartX + 12, cartY + 8, Math.max(8, cartWidth - 24), 4);
    context.fillStyle = "#546762";
    context.beginPath();
    context.arc(cartX + 19, h - 31, 7, 0, Math.PI * 2);
    context.arc(cartX + cartWidth - 19, h - 31, 7, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = "#fff";
    context.font = "600 12px system-ui, sans-serif";
    context.textAlign = "center";
    context.fillText(`${state.mass.toFixed(1)} kg`, cartX + cartWidth / 2, cartY + cartHeight / 2 + 5);

    const arrowStart = Math.max(12, cartX - 20 - state.force * 1.5);
    const arrowEnd = cartX - 8;
    const arrowY = cartY + cartHeight / 2;
    context.strokeStyle = "#cf6655";
    context.fillStyle = "#cf6655";
    context.lineWidth = 4;
    context.beginPath();
    context.moveTo(arrowStart, arrowY);
    context.lineTo(arrowEnd, arrowY);
    context.stroke();
    context.beginPath();
    context.moveTo(arrowEnd, arrowY);
    context.lineTo(arrowEnd - 10, arrowY - 7);
    context.lineTo(arrowEnd - 10, arrowY + 7);
    context.closePath();
    context.fill();
    context.fillStyle = "#9b5147";
    context.font = "700 11px system-ui, sans-serif";
    context.textAlign = "center";
    context.fillText(`${state.force.toFixed(1)} N`, (arrowStart + arrowEnd) / 2, arrowY - 12);

    const aWidth = Math.min(100, 12 + state.acceleration * 11);
    context.fillStyle = "#dcefeb";
    context.fillRect(w * 0.64, h - 70, 106, 10);
    context.fillStyle = "#e5a82f";
    context.fillRect(w * 0.64, h - 70, aWidth, 10);
    context.fillStyle = "#697873";
    context.font = "10px system-ui, sans-serif";
    context.textAlign = "left";
    context.fillText("acceleration", w * 0.64, h - 78);
  }

  function save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(trials)); } catch { /* Keep the current session usable. */ }
  }

  function renderTrials() {
    rows.replaceChildren();
    if (!trials.length) {
      const tr = document.createElement("tr");
      const td = document.createElement("td");
      td.colSpan = 6;
      td.textContent = "No saved trials yet. Change a condition and save a run.";
      td.className = "empty-state";
      tr.append(td);
      rows.append(tr);
    } else {
      trials.forEach((trial, index) => {
        const tr = document.createElement("tr");
        const values = [
          `T${String(index + 1).padStart(2, "0")}`,
          `${trial.force.toFixed(1)} N`,
          `${trial.mass.toFixed(1)} kg`,
          `${trial.acceleration.toFixed(2)} m/s²`,
        ];
        for (const value of values) {
          const td = document.createElement("td");
          const strong = document.createElement("strong");
          strong.textContent = value;
          td.append(strong);
          tr.append(td);
        }
        const status = document.createElement("td");
        const pill = document.createElement("span");
        const held = sameForce(trial);
        pill.className = `condition-pill${held ? "" : " shifted"}`;
        pill.textContent = held ? "Same force" : "Force changed";
        status.append(pill);
        tr.append(status);

        const action = document.createElement("td");
        const remove = document.createElement("button");
        remove.type = "button";
        remove.className = "delete-trial";
        remove.setAttribute("aria-label", `Remove trial ${index + 1}`);
        remove.title = "Remove trial";
        remove.textContent = "×";
        remove.addEventListener("click", () => {
          trials = trials.filter(item => item.id !== trial.id);
          save();
          renderTrials();
        });
        action.append(remove);
        tr.append(action);
        rows.append(tr);
      });
    }
    document.getElementById("trialCount").textContent = `${trials.length} saved ${trials.length === 1 ? "trial" : "trials"}`;
  }

  function update() {
    const state = readState();
    const baseA = BASELINE.force / BASELINE.mass;
    forceValue.value = state.force.toFixed(1);
    massValue.value = state.mass.toFixed(1);
    accelerationValue.value = state.acceleration.toFixed(2);
    baselineAcceleration.value = baseA.toFixed(2);
    forceInput.style.setProperty("--progress", `${((state.force - 1) / 29) * 100}%`);
    massInput.style.setProperty("--progress", `${((state.mass - 0.5) / 9.5) * 100}%`);

    const forceHeld = sameForce(state);
    conditionCheck.classList.toggle("changed", !forceHeld);
    conditionText.textContent = forceHeld
      ? `Force is still ${state.force.toFixed(1)} N. The claim's condition holds.`
      : `Force changed from ${BASELINE.force.toFixed(1)} N to ${state.force.toFixed(1)} N. This run does not isolate mass.`;

    const delta = state.acceleration - baseA;
    deltaIndicator.classList.toggle("down", delta < -0.005);
    deltaIndicator.classList.toggle("up", delta > 0.005);
    deltaIndicator.textContent = Math.abs(delta) < 0.005 ? "No change" : `${delta > 0 ? "+" : ""}${delta.toFixed(2)} m/s²`;
    draw();
  }

  function addTrial() {
    const state = readState();
    trials.push({ ...state, id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}` });
    save();
    renderTrials();
  }

  function exportCsv() {
    if (!trials.length) return;
    const lines = ["trial,force_N,mass_kg,acceleration_m_s2,same_force_as_baseline"];
    trials.forEach((trial, index) => lines.push([`T${String(index + 1).padStart(2, "0")}`, trial.force.toFixed(1), trial.mass.toFixed(1), trial.acceleration.toFixed(4), sameForce(trial)].join(",")));
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "condition-lab-trials.csv";
    link.click();
    URL.revokeObjectURL(link.href);
  }

  document.getElementById("addTrialButton").addEventListener("click", addTrial);
  document.getElementById("makeCounterexampleButton").addEventListener("click", () => {
    const mass = Number(massInput.value);
    const targetMass = Math.min(10, mass + 1);
    massInput.value = String(targetMass);
    forceInput.value = String(Math.min(30, Number(forceInput.value) * targetMass / mass));
    update();
  });
  document.getElementById("resetButton").addEventListener("click", () => {
    forceInput.value = String(BASELINE.force);
    massInput.value = String(BASELINE.mass);
    trials = [];
    save();
    renderTrials();
    update();
  });
  document.getElementById("exportButton").addEventListener("click", exportCsv);
  forceInput.addEventListener("input", update);
  massInput.addEventListener("input", update);
  window.addEventListener("resize", draw);
  renderTrials();
  update();
})();
