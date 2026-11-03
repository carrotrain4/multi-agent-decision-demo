(() => {
  "use strict";

  const SCENARIOS = {
    maintenance: {
      key: "maintenance",
      shortTitle: "主轴异响紧急排障",
      context: "设备故障诊断",
      query: "CNC-07 主轴出现周期性异响，振动值升至 4.6 mm/s。请结合维修手册、近 90 天故障工单和备件库存，给出排障步骤与停机建议。",
      intent: "设备故障诊断 / 维修决策",
      activeAgents: ["qa", "doc", "data"],
      toolCalls: 4,
      badge: "DEVICE DIAGNOSIS",
      tags: ["P1 紧急", "知识 × 数据", "维修决策"],
      title: "CNC-07 主轴异响 · 高置信排障建议",
      confidence: 94.2,
      summary: "多源证据指向<strong>主轴前端轴承润滑不足与预紧力漂移</strong>，并非刀具动平衡异常。建议立即降速停机，按维修手册完成油路检查、轴承预紧与试运行，预计修复时长约 2.4 h。",
      highlight: "首选动作：安全停机 → 油路压力检查 → 轴承预紧（18 N·m）→ 30 min 空载试运行。备件已齐套，可避免二次等待。",
      nodeDetails: {
        router: "意图识别 · 96%",
        qa: "命中 3 条证据",
        doc: "对齐 18 条工单",
        data: "回传 6 项指标",
        agg: "一致性 · 96%"
      },
      agentStart: {
        qa: "检索《设备维修手册》与同类故障案例，定位主轴异响检查项。",
        doc: "对齐近 90 天 CNC 系列故障工单，提取同型号故障履历。",
        data: "查询 CNC-07 振动、温度趋势与 6207-2RS 备件库存。"
      },
      agentDone: {
        qa: "知识 Agent 命中维修手册 §7.3 与 2 条相似案例，检索相关性 0.94。",
        doc: "文档 Agent 完成工单对齐：同型号 4 例异响中 3 例为轴承问题。",
        data: "数据 Agent 回传振动 RMS 4.6 mm/s、温升 +11.4°C，轴承库存 12 件。"
      },
      planEvent: "任务拆解完成：生成 3 路并行子任务 → 知识检索 / 工单对齐 / 运行数据查询。",
      aggregationEvent: "正在交叉验证知识、工单与实时数据，并按风险优先级生成处置方案。",
      aggregationDone: "结果汇聚完成：3 路证据一致指向主轴前端轴承异常，置信度 94.2%。",
      steps: [
        {
          title: "降速并执行安全停机",
          detail: "将主轴转速降至 20%，完成挂牌上锁；待主轴温度低于 40°C 后进入设备检查。"
        },
        {
          title: "检查润滑与预紧状态",
          detail: "复测油路压力，按 MAN-CNC-042 §7.3 将轴承预紧扭矩恢复至 18 N·m。"
        },
        {
          title: "更换前端轴承并试运行",
          detail: "领用 6207-2RS（当前库存 12 件），空载运行 30 分钟，复测振动与温升。"
        },
        {
          title: "设置验收与升级阈值",
          detail: "振动 RMS 需稳定 ≤ 2.8 mm/s；若仍超阈值，升级设备厂家远程诊断。"
        }
      ],
      metrics: {
        headers: ["指标", "实测", "阈值", "判断"],
        rows: [
          { cells: ["主轴振动 RMS", "4.6 mm/s", "≤ 2.8 mm/s", "超阈值"], status: "warn" },
          { cells: ["前端温升", "+11.4 °C", "≤ +8.0 °C", "超阈值"], status: "warn" },
          { cells: ["油路压力", "2.6 bar", "2.8–3.2 bar", "偏低"], status: "warn" },
          { cells: ["轴承库存", "12 件", "≥ 6 件", "充足"], status: "ok" }
        ]
      },
      citations: [
        {
          title: "主轴轴承预紧与润滑检查",
          source: "设备维修手册_v4.2.pdf",
          location: "P.87 · §7.3",
          score: 0.94,
          excerpt: "主轴前端异响应优先检查轴承润滑状态与预紧力。停机并等待主轴温度低于 40°C 后，复测油路压力应位于 2.8–3.2 bar。重新预紧时使用 18 N·m 扭矩，完成后空载运行 30 分钟并复测振动 RMS。"
        },
        {
          title: "CNC-07 近 90 天同类故障对比",
          source: "故障工单_2026Q3.xlsx",
          location: "WO-2026-0831 / 同型号 4 例",
          score: 0.89,
          excerpt: "同型号设备 4 例主轴异响中，3 例由轴承润滑不足或预紧力漂移导致，平均修复时长 2.4 h。振动 RMS 大于 4.2 mm/s 时应安排停机检查。"
        },
        {
          title: "主轴前端轴承库存与替代料",
          source: "ERP · 备件主数据",
          location: "SKU: BRG-6207-2RS",
          score: 0.82,
          excerpt: "6207-2RS 当前可用库存 12 件，安全库存 6 件；最近采购提前期为 3 天，可立即领用。"
        }
      ],
      footnote: "建议在 2 小时内安排停机检查。当前备件齐套，可在单班内完成修复并恢复生产。"
    },

    compliance: {
      key: "compliance",
      shortTitle: "装配扭矩合规核查",
      context: "装配质量核查",
      query: "A-12 工位扭矩抽检出现漂移，请对照最新装配工艺规范与近 7 日抽检数据，判断是否存在合规风险，并给出处置建议。",
      intent: "装配质量 / 合规核查",
      activeAgents: ["qa", "doc", "data"],
      toolCalls: 5,
      badge: "QUALITY COMPLIANCE",
      tags: ["质量风险", "规范核查", "追溯"],
      title: "A-12 扭矩漂移 · 合规风险已确认",
      confidence: 91.7,
      summary: "新版工艺规范要求关键紧固点最终扭矩为 <strong>22 ± 1.5 N·m</strong>。近 7 日 120 条抽检中 14 条低于下限 20.5 N·m，达标率仅 88.3%，当前工位存在明确放行风险。",
      highlight: "风险已确认：14 / 120 条采样低于新标准下限，建议立即隔离工位、复校扭矩枪，并对在制品执行全量复检。",
      nodeDetails: {
        router: "意图识别 · 94%",
        qa: "命中规范变更",
        doc: "解析变更通知",
        data: "分析 120 条抽检",
        agg: "风险等级 · 高"
      },
      agentStart: {
        qa: "检索装配工艺规范与最新变更通知，确认 A-12 扭矩标准。",
        doc: "解析变更通知 CN-2026-08 的生效范围与执行要求。",
        data: "聚合近 7 日 120 条扭矩抽检记录并按班次分组。"
      },
      agentDone: {
        qa: "知识 Agent 命中 SOP-A12 rev.3，扭矩标准更新为 22 ± 1.5 N·m。",
        doc: "文档 Agent 确认变更自 2026-08-12 生效，要求 24h 内完成枪体校准。",
        data: "数据 Agent 发现 14 条低于 20.5 N·m，低值集中在 10 月 22 日换班后。"
      },
      planEvent: "任务拆解完成：工艺规范检索、变更通知解析与抽检数据分析将并行执行。",
      aggregationEvent: "正在对齐规范生效日期、设备校准记录与抽检时间线，评估合规风险。",
      aggregationDone: "结果汇聚完成：规范变更后存在未校准窗口，合规风险等级为高，置信度 91.7%。",
      steps: [
        {
          title: "隔离 A-12 工位并停止放行",
          detail: "对当前工位执行质量隔离，冻结 10 月 22 日换班后的在制品批次。"
        },
        {
          title: "复核扭矩枪与工位配方",
          detail: "使用标准扭矩仪执行双点校准，并将工位配方更新为 22 ± 1.5 N·m。"
        },
        {
          title: "全检并追溯 120 件在制品",
          detail: "按 SOP-A12 rev.3 复紧并记录最终扭矩，标识低值样本对应的产品序列号。"
        },
        {
          title: "恢复生产前执行首件确认",
          detail: "连续抽检 10 件，达标率 100% 且过程能力 Cpk ≥ 1.33 后方可恢复放行。"
        }
      ],
      metrics: {
        headers: ["指标", "实测", "标准", "判断"],
        rows: [
          { cells: ["抽检样本", "120 条", "近 7 日", "有效"], status: "ok" },
          { cells: ["达标率", "88.3%", "≥ 99.5%", "未达标"], status: "warn" },
          { cells: ["低于下限", "14 条", "0 条", "异常"], status: "warn" },
          { cells: ["均值 / 标准差", "21.4 / 0.9", "22 ± 1.5", "中心偏低"], status: "warn" }
        ]
      },
      citations: [
        {
          title: "A-12 关键紧固点扭矩标准",
          source: "装配工艺规范_SOP-A12.pdf",
          location: "rev.3 · P.14",
          score: 0.96,
          excerpt: "M10 关键紧固点最终扭矩标准更新为 22 ± 1.5 N·m，首次拧紧与复紧分别记录；本变更自 2026-08-12 起执行，旧版 20 N·m 配方同时失效。"
        },
        {
          title: "工艺变更通知 CN-2026-08",
          source: "工艺变更通知.pdf",
          location: "2026-08-08 发布",
          score: 0.91,
          excerpt: "新版扭矩配方生效后，需在 24 小时内完成扭矩枪校准并更新工位配方；未完成校准的设备不得投入生产。"
        },
        {
          title: "A-12 近 7 日扭矩抽检记录",
          source: "QMS · 抽检数据",
          location: "120 条 · 2026-10-19~25",
          score: 0.88,
          excerpt: "120 条记录中 14 条低于 20.5 N·m，最低 19.2 N·m；低值主要集中在 10 月 22 日换班后，疑似校准状态未同步。"
        }
      ],
      footnote: "建议质量与工艺人员联合复核校准记录，并对已流出产品执行批次追溯。"
    },

    downtime: {
      key: "downtime",
      shortTitle: "停机损失窗口测算",
      context: "产线运营分析",
      query: "Line 2 近 7 天停机损失是多少？请结合维保计划与产能数据，给出停机原因复盘和最优检修窗口。",
      intent: "产线运营 / 数据分析",
      activeAgents: ["qa", "data"],
      toolCalls: 4,
      badge: "OPERATIONS ANALYTICS",
      tags: ["运营分析", "窗口测算", "数据决策"],
      title: "Line 2 停机复盘 · 周六凌晨检修最优",
      confidence: 96.1,
      summary: "Line 2 近 7 天累计停机 <strong>6.8 h</strong>，直接损失约 <strong>¥184,600</strong>。首要原因为换型超时，占比 42%。结合产能与维保计划，最优检修窗口为周六 02:00–05:00，预计影响产量最低。",
      highlight: "推荐窗口：周六 02:00–05:00。预计 3.2 h 完成计划检修，产量影响约 180 件，低于工作日检修的 3.4 倍。",
      nodeDetails: {
        router: "意图识别 · 97%",
        qa: "命中维保策略",
        doc: "场景跳过",
        data: "聚合 7 日数据",
        agg: "窗口收益 · 高"
      },
      agentStart: {
        qa: "检索设备维保计划与停机原因分类规则。",
        doc: "本场景无需工单对齐。",
        data: "聚合近 7 日停机、换型、产能与损失数据。"
      },
      agentDone: {
        qa: "知识 Agent 命中预防性维保策略，主轴单元建议每 500 h 点检。",
        doc: "文档 Agent 未调用。",
        data: "数据 Agent 聚合 7 日停机 6.8 h，换型超时占比 42%，损失 ¥184,600。"
      },
      planEvent: "任务拆解完成：动态裁撤文档 Agent，仅保留维保知识检索与结构化数据分析。",
      aggregationEvent: "正在结合产线负荷曲线、维保时长与停机损失，计算最优检修窗口。",
      aggregationDone: "结果汇聚完成：周六 02:00–05:00 的综合影响最低，窗口收益置信度 96.1%。",
      steps: [
        {
          title: "锁定损失瓶颈",
          detail: "换型超时贡献 42% 停机时长，优先优化换型流程与物料前置准备。"
        },
        {
          title: "执行周六凌晨检修",
          detail: "将主轴点检与换型优化合并至周六 02:00–05:00 低负荷窗口。"
        },
        {
          title: "提前完成备件与工装齐套",
          detail: "检修前 4 h 完成备件、工装与作业票确认，目标恢复时间 3.2 h。"
        },
        {
          title: "跟踪窗口收益",
          detail: "对比下一周停机时长与产量影响，验收目标为停机损失下降 ≥ 30%。"
        }
      ],
      metrics: {
        headers: ["指标", "近 7 日", "目标", "判断"],
        rows: [
          { cells: ["累计停机", "6.8 h", "≤ 4.5 h", "偏高"], status: "warn" },
          { cells: ["直接损失", "¥184,600", "—", "超预算"], status: "warn" },
          { cells: ["换型超时占比", "42%", "≤ 25%", "首要瓶颈"], status: "warn" },
          { cells: ["推荐窗口", "周六 02:00", "低负荷", "可执行"], status: "ok" }
        ]
      },
      citations: [
        {
          title: "Line 2 近 7 日停机事件汇总",
          source: "MES · 停机事件表",
          location: "2026-10-19~25 · 23 条",
          score: 0.93,
          excerpt: "近 7 日累计停机 6.8 h，其中换型超时 2.86 h、设备故障 2.12 h、物料等待 1.82 h；直接产能损失估算 ¥184,600。"
        },
        {
          title: "主轴单元预防性维保计划",
          source: "设备维保计划_Q4.xlsx",
          location: "PM-2026-Q4 · Line 2",
          score: 0.9,
          excerpt: "主轴单元建议每 500 h 执行一次点检，当前累计运行 487 h。计划检修标准工时 3.2 h，可在低负荷窗口合并执行。"
        },
        {
          title: "Line 2 分时产能与负荷曲线",
          source: "APS · 产能快照",
          location: "未来 14 天负荷预测",
          score: 0.86,
          excerpt: "周六 02:00–05:00 为未来 7 天最低负荷窗口，预计产量影响 180 件；工作日白班同等工作量影响约 612 件。"
        }
      ],
      footnote: "该结果已通过知识检索与结构化数据分析双路验证，可直接进入检修排程评审。"
    }
  };

  const INITIAL_NODE_COPY = {
    input: "现场指令",
    router: "等待任务",
    qa: "知识检索",
    doc: "工单对齐",
    data: "结构化查询",
    agg: "交叉验证"
  };

  const SOURCE_LABELS = {
    sys: "SYS",
    router: "ROUTER",
    qa: "QA",
    doc: "DOC",
    data: "DATA",
    agg: "AGG",
    warn: "WARN"
  };

  const state = {
    selected: "maintenance",
    running: false,
    breakerRunning: false,
    faultInjected: false,
    degraded: false,
    hasRun: false,
    timerInterval: null,
    timerStarted: 0,
    clockOrigin: 0,
    lastResult: null,
    lastScene: "maintenance",
    lastConfidence: 0,
    lastElapsed: 0,
    toastTimer: null,
    autoRunTimer: null,
    modalReturnFocus: null
  };

  const el = {
    queryInput: document.getElementById("queryInput"),
    runButton: document.getElementById("runButton"),
    runBtnLabel: document.getElementById("runBtnLabel"),
    faultToggle: document.getElementById("faultToggle"),
    contextChip: document.getElementById("contextChip"),
    scenarioCards: Array.from(document.querySelectorAll(".scenario-card")),
    runStatus: document.getElementById("runStatus"),
    runStatusText: document.getElementById("runStatusText"),
    runTimer: document.getElementById("runTimer"),
    eventLog: document.getElementById("eventLog"),
    resultPanel: document.getElementById("resultPanel"),
    resultContent: document.getElementById("resultContent"),
    resultState: document.getElementById("resultState"),
    cacheMetric: document.getElementById("cacheMetric"),
    breakerDemo: document.getElementById("breakerDemo"),
    circuitPanel: document.getElementById("circuitPanel"),
    circuitBadge: document.getElementById("circuitBadge"),
    failureMeter: document.getElementById("failureMeter"),
    circuitCopy: document.getElementById("circuitCopy"),
    toast: document.getElementById("toast"),
    evidenceModal: document.getElementById("evidenceModal"),
    modalClose: document.getElementById("modalClose"),
    evidenceTitle: document.getElementById("evidenceTitle"),
    evidenceMeta: document.getElementById("evidenceMeta"),
    evidenceExcerpt: document.getElementById("evidenceExcerpt"),
    evidenceScore: document.getElementById("evidenceScore"),
    evidenceScoreText: document.getElementById("evidenceScoreText"),
    metricLatency: document.getElementById("metricLatency"),
    metricSuccess: document.getElementById("metricSuccess")
  };

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  function escapeHTML(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function stripHTML(value) {
    const temp = document.createElement("div");
    temp.innerHTML = value;
    return temp.textContent || temp.innerText || "";
  }

  function formatElapsed(ms) {
    const safe = Math.max(0, ms);
    const minutes = Math.floor(safe / 60000);
    const seconds = Math.floor((safe % 60000) / 1000);
    const tenths = Math.floor((safe % 1000) / 100);
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}.${tenths}`;
  }

  function formatEventTime(ms) {
    const safe = Math.max(0, ms);
    const seconds = Math.floor(safe / 1000);
    const hundredths = Math.floor((safe % 1000) / 10);
    return `${String(seconds).padStart(2, "0")}.${String(hundredths).padStart(2, "0")}`;
  }

  function formatSeconds(ms) {
    return `${(Math.max(0, ms) / 1000).toFixed(1)}s`;
  }

  function getScenario(key) {
    return SCENARIOS[key] || SCENARIOS.maintenance;
  }

  function inferScenario(query, fallback) {
    const text = String(query || "").toLowerCase();
    if (/(扭矩|装配|sop|合规|a-12|工艺规范|扭矩枪|校准)/i.test(text)) {
      return "compliance";
    }
    if (/(主轴|异响|振动|cnc|轴承|润滑油|维修手册|设备故障)/i.test(text)) {
      return "maintenance";
    }
    if (/(停机损失|维修窗口|换型|产能|line\s*2|检修窗口|停机数据)/i.test(text)) {
      return "downtime";
    }
    return fallback;
  }

  function setRunStatus(mode, text) {
    el.runStatus.className = `run-status ${mode}`;
    el.runStatusText.textContent = text;
  }

  function setResultState(mode, text) {
    const labels = { waiting: "WAITING", running: "RUNNING", done: "DONE" };
    el.resultState.className = `result-state ${mode === "waiting" ? "" : mode}`.trim();
    el.resultState.innerHTML = `<i></i><span>${text || labels[mode] || "WAITING"}</span>`;
  }

  function updateActiveScenario(key) {
    el.scenarioCards.forEach((card) => {
      const active = card.dataset.scene === key;
      card.classList.toggle("active", active);
      card.setAttribute("aria-pressed", String(active));
    });
  }

  function updateContext(scenario) {
    el.contextChip.innerHTML = `<span class="context-dot"></span>${escapeHTML(scenario.context)}`;
  }

  function setNode(nodeKey, mode, detail, timeText) {
    const node = document.getElementById(`node-${nodeKey}`);
    if (!node) return;

    node.classList.remove("is-active", "is-done", "is-warning", "is-fallback", "is-dim");
    if (mode) {
      node.classList.add(`is-${mode}`);
    }

    const detailEl = node.querySelector(".node-copy em");
    const timeEl = node.querySelector(".node-time");
    if (detail && detailEl) detailEl.textContent = detail;
    if (timeText !== undefined && timeEl) timeEl.textContent = timeText;
  }

  function setEdge(edgeId, mode) {
    const edge = document.getElementById(edgeId);
    if (!edge) return;
    edge.classList.remove("active", "done", "warning");
    if (mode) edge.classList.add(mode);
  }

  function resetGraph() {
    Object.keys(INITIAL_NODE_COPY).forEach((key) => {
      setNode(key, "", INITIAL_NODE_COPY[key], "—");
    });
    ["input-router", "router-qa", "router-doc", "router-data", "qa-agg", "doc-agg", "data-agg"]
      .forEach((edge) => setEdge(`edge-${edge}`, ""));
    setRunStatus("idle", "待命");
    el.runTimer.textContent = "00:00.0";
  }

  function clearEventLog() {
    el.eventLog.innerHTML = "";
  }

  function appendEvent(source, html, options = {}) {
    const sourceKey = Object.prototype.hasOwnProperty.call(SOURCE_LABELS, source) ? source : "sys";
    if (!el.eventLog.querySelector(".event-row")) {
      el.eventLog.innerHTML = "";
    }
    const row = document.createElement("div");
    row.className = "event-row";
    const elapsed = state.clockOrigin ? performance.now() - state.clockOrigin : 0;
    row.innerHTML = `
      <span class="event-time">${formatEventTime(elapsed)}</span>
      <span class="event-source ${sourceKey}">${options.label || SOURCE_LABELS[sourceKey]}</span>
      <span class="event-text">${html}</span>
    `;
    el.eventLog.appendChild(row);
    el.eventLog.scrollTop = el.eventLog.scrollHeight;
  }

  function showPlaceholder(scenario) {
    el.resultContent.innerHTML = `
      <div class="result-placeholder">
        <span class="placeholder-orbit"><i></i><i></i><i></i></span>
        <strong>${escapeHTML(scenario.shortTitle)} · 等待运行</strong>
        <p>下发任务后，主路由 Agent 将拆解任务，知识、文档与数据 Agent 将并行取证并生成决策简报。</p>
      </div>
    `;
    setResultState("waiting", "WAITING");
    el.resultPanel.removeAttribute("aria-busy");
  }

  function showLoading(scenario) {
    const activeCount = scenario.activeAgents.length;
    el.resultContent.innerHTML = `
      <div class="result-loading">
        <div class="loading-banner">
          <span class="loading-spinner"></span>
          <span id="loadingText">正在并行执行 ${activeCount} 个子 Agent…</span>
        </div>
        <div class="skeleton skeleton-line sm"></div>
        <div class="skeleton skeleton-title"></div>
        <div class="skeleton skeleton-line lg"></div>
        <div class="skeleton skeleton-line md"></div>
        <div class="skeleton skeleton-block"></div>
        <div class="skeleton skeleton-block small"></div>
        <div class="skeleton skeleton-block small"></div>
      </div>
    `;
    setResultState("running", "RUNNING");
    el.resultPanel.setAttribute("aria-busy", "true");
  }

  function updateLoadingText(text) {
    const target = document.getElementById("loadingText");
    if (target) target.textContent = text;
  }

  function startTimer() {
    stopTimer();
    state.timerStarted = performance.now();
    el.runTimer.textContent = "00:00.0";
    state.timerInterval = window.setInterval(() => {
      el.runTimer.textContent = formatElapsed(performance.now() - state.timerStarted);
    }, 100);
  }

  function stopTimer() {
    if (state.timerInterval) {
      window.clearInterval(state.timerInterval);
      state.timerInterval = null;
    }
  }

  function setRunningUI(running) {
    el.runButton.disabled = running;
    el.runButton.classList.toggle("is-running", running);
    el.faultToggle.disabled = running;
    el.breakerDemo.disabled = running || state.breakerRunning;
    el.scenarioCards.forEach((card) => card.classList.toggle("is-locked", running));
    el.runBtnLabel.textContent = running ? "协同执行中" : (state.hasRun ? "重新运行协同决策" : "发起协同决策");
    el.resultPanel.toggleAttribute("aria-busy", running);
  }

  function resetFailureMeter() {
    el.failureMeter.classList.remove("open");
    Array.from(el.failureMeter.children).forEach((bar) => bar.classList.remove("failed"));
  }

  function setCircuit(mode, text) {
    el.circuitBadge.className = `circuit-badge ${mode}`;
    el.circuitBadge.innerHTML = `<i></i>${text}`;
  }

  function showToast(message) {
    if (state.toastTimer) window.clearTimeout(state.toastTimer);
    el.toast.textContent = message;
    el.toast.classList.add("show");
    state.toastTimer = window.setTimeout(() => {
      el.toast.classList.remove("show");
      state.toastTimer = null;
    }, 2500);
  }

  function selectScenario(key) {
    if (state.running || state.breakerRunning) {
      showToast("当前任务执行中，请稍后再切换场景");
      return;
    }
    const scenario = getScenario(key);
    state.selected = key;
    state.hasRun = false;
    state.lastResult = null;
    updateActiveScenario(key);
    updateContext(scenario);
    el.queryInput.value = scenario.query;
    resetGraph();
    showPlaceholder(scenario);
    clearEventLog();
    state.clockOrigin = performance.now();
    appendEvent("sys", `已加载场景「${escapeHTML(scenario.shortTitle)}」，等待任务下发。`);
    el.runBtnLabel.textContent = "发起协同决策";
    el.cacheMetric.textContent = "32% HIT";
  }

  async function runAgent(agentKey, duration, scenario, startedAt) {
    setNode(agentKey, "active", "执行中…", "0.0s");
    setEdge(`edge-router-${agentKey}`, "active");
    appendEvent(agentKey, escapeHTML(scenario.agentStart[agentKey]));

    await sleep(duration);

    if (agentKey === "data" && state.faultInjected) {
      setNode(agentKey, "warning", "调用超时 · 重试 1/3", formatSeconds(performance.now() - startedAt));
      appendEvent("warn", "数据 MCP 调用超时（1,200 ms），触发指数退避重试：600 ms。");
      await sleep(650);

      setNode(agentKey, "warning", "重试 2/3…", formatSeconds(performance.now() - startedAt));
      appendEvent("warn", "第 2 次调用仍超时，熔断计数 2 / 5；切换缓存快照与规则引擎兜底。");
      await sleep(650);

      setNode(agentKey, "fallback", "快照降级返回", formatSeconds(performance.now() - startedAt));
      appendEvent("warn", "降级成功：读取 Redis 15 分钟前快照，数据完整度 92%，本次结果已标注降级链路。");
      await sleep(420);

      const elapsed = performance.now() - startedAt;
      setNode(agentKey, "done", "降级返回 · 92%", formatSeconds(elapsed));
      setEdge(`edge-router-${agentKey}`, "warning");
      setEdge(`edge-${agentKey}-agg`, "warning");
      state.degraded = true;
      el.cacheMetric.textContent = "41% HIT";
      appendEvent(agentKey, "数据 Agent 已通过缓存快照返回 6 项指标，流程继续。", { label: "DATA" });
      return { degraded: true, elapsed };
    }

    const elapsed = performance.now() - startedAt;
    setNode(agentKey, "done", scenario.nodeDetails[agentKey], formatSeconds(elapsed));
    setEdge(`edge-router-${agentKey}`, "done");
    setEdge(`edge-${agentKey}-agg`, "active");
    appendEvent(agentKey, escapeHTML(scenario.agentDone[agentKey]));
    return { degraded: false, elapsed };
  }

  async function runWorkflow() {
    if (state.running) return;
    if (state.breakerRunning) {
      showToast("容错演练进行中，请等待状态恢复");
      return;
    }

    const inferred = inferScenario(el.queryInput.value, state.selected);
    state.selected = inferred;
    const scenario = getScenario(inferred);
    state.lastScene = inferred;
    state.faultInjected = el.faultToggle.checked;
    state.degraded = false;
    state.running = true;
    state.hasRun = true;
    state.lastResult = null;

    updateActiveScenario(inferred);
    updateContext(scenario);
    resetGraph();
    clearEventLog();
    showLoading(scenario);
    setRunningUI(true);
    setRunStatus("running", "编排中");

    state.clockOrigin = performance.now();
    state.timerStarted = state.clockOrigin;
    startTimer();

    appendEvent("sys", `任务已受理 · run_id=DEMO-${Date.now().toString().slice(-6)} · 编排引擎启动。`);
    setNode("input", "active", "解析指令…", "0.0s");
    await sleep(220);

    setNode("input", "done", "工单已解析", "0.2s");
    setEdge("edge-input-router", "active");
    appendEvent("sys", "工单解析完成：已提取设备对象、故障现象与任务约束。");

    setNode("router", "active", "意图识别…", "0.0s");
    appendEvent("router", "语义解析完成，识别对象「CNC / Line 2」与任务类型，进入意图路由。");
    await sleep(560);

    setEdge("edge-input-router", "done");
    setNode("router", "done", scenario.nodeDetails.router, "0.8s");
    setRunStatus("running", "并行执行");
    appendEvent("router", escapeHTML(scenario.planEvent));

    const parallelStart = performance.now();
    const activeAgents = new Set(scenario.activeAgents);

    Object.keys(INITIAL_NODE_COPY).forEach((key) => {
      if (["qa", "doc", "data"].includes(key) && !activeAgents.has(key)) {
        setNode(key, "dim", "本场景跳过", "—");
        appendEvent("sys", `动态路由：${key === "doc" ? "文档 Agent" : key === "qa" ? "问答 Agent" : "数据 Agent"} 未加入本次 DAG。`);
      }
    });

    if (state.faultInjected) {
      appendEvent("warn", "故障注入已启用：数据 Agent 将演示超时重试、指数退避与缓存降级。");
    }

    const durations = {
      qa: 720 + Math.round(Math.random() * 160),
      doc: 920 + Math.round(Math.random() * 180),
      data: 1080 + Math.round(Math.random() * 180)
    };

    const agentRuns = scenario.activeAgents.map((agentKey) => {
      setEdge(`edge-router-${agentKey}`, "active");
      return runAgent(agentKey, durations[agentKey], scenario, parallelStart);
    });

    await Promise.all(agentRuns);
    updateLoadingText("正在聚合证据并交叉验证…");

    scenario.activeAgents.forEach((agentKey) => {
      setEdge(`edge-${agentKey}-agg`, state.degraded && agentKey === "data" ? "warning" : "active");
    });

    setNode("agg", "active", "结果汇聚…", "0.0s");
    appendEvent("agg", escapeHTML(scenario.aggregationEvent));
    await sleep(820);

    const aggElapsed = scenario.activeAgents.reduce((max, key) => Math.max(max, durations[key]), 0) + 820;
    setNode("agg", "done", scenario.nodeDetails.agg, formatSeconds(aggElapsed));
    scenario.activeAgents.forEach((agentKey) => {
      setEdge(`edge-${agentKey}-agg`, state.degraded && agentKey === "data" ? "warning" : "done");
    });

    const confidence = state.degraded
      ? Math.max(72, scenario.confidence - 5.4)
      : scenario.confidence;
    state.lastResult = scenario;
    state.lastConfidence = confidence;
    state.lastElapsed = performance.now() - state.timerStarted;

    renderResult(scenario, confidence, state.degraded, state.lastElapsed);
    updateLoadingText("决策简报已生成");
    appendEvent("agg", escapeHTML(scenario.aggregationDone));
    appendEvent("sys", `本次协同完成 · 调用 ${scenario.activeAgents.length} 个子 Agent · ${scenario.toolCalls} 次 MCP 工具调用。`);

    stopTimer();
    el.runTimer.textContent = formatElapsed(state.lastElapsed);
    setRunStatus(state.degraded ? "warning" : "done", state.degraded ? "降级完成" : "已完成");
    state.running = false;
    setRunningUI(false);
    setResultState("done", state.degraded ? "DEGRADED" : "DONE");
    el.resultPanel.setAttribute("aria-busy", "false");

    if (state.degraded) {
      el.metricSuccess.textContent = "97.9";
      showToast("流程完成：数据工具异常，已自动降级并保留结果标注");
    } else {
      el.metricLatency.textContent = (1.7 + Math.random() * 0.3).toFixed(1);
      showToast("协同决策完成，可点击引用查看原始证据");
    }
  }

  function renderResult(scenario, confidence, degraded, elapsed) {
    const confidenceDeg = (confidence * 3.6).toFixed(1);
    const citationHTML = scenario.citations.map((citation, index) => `
      <button class="citation-btn" type="button" data-citation-index="${index}" aria-label="查看证据 ${index + 1}：${escapeHTML(citation.source)}">
        <span class="citation-index">${String(index + 1).padStart(2, "0")}</span>
        <span class="citation-copy">
          <strong>${escapeHTML(citation.title)}</strong>
          <small>${escapeHTML(citation.source)} · ${escapeHTML(citation.location)}</small>
        </span>
        <span class="citation-score">${citation.score.toFixed(2)}</span>
        <span class="citation-arrow">→</span>
      </button>
    `).join("");

    const stepHTML = scenario.steps.map((step) => `
      <li>
        <div>
          <strong>${escapeHTML(step.title)}</strong>
          <p>${escapeHTML(step.detail)}</p>
        </div>
      </li>
    `).join("");

    el.resultContent.innerHTML = `
      <div class="result-card" data-scene="${scenario.key}">
        <div class="result-badges">
          <span class="result-primary-badge">${escapeHTML(scenario.badge)}</span>
          ${scenario.tags.map((tag) => `<span class="badge ${tag.includes("P1") ? "danger" : "info"}">${escapeHTML(tag)}</span>`).join("")}
          ${degraded ? '<span class="badge warning">缓存降级链路</span>' : ""}
        </div>

        <div class="result-overview">
          <h3>${escapeHTML(scenario.title)}</h3>
          <div>
            <div class="confidence-ring" style="--score:${confidenceDeg}deg"><span>${confidence.toFixed(1)}%</span></div>
            <div class="confidence-label">综合置信度</div>
          </div>
        </div>

        <p class="result-summary">${scenario.summary}</p>

        <div class="result-highlight">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true">
            <path d="M12 3.5 20 8v8l-8 4.5L4 16V8l8-4.5Z"/><path d="M12 8v4.5M12 15.5h.01"/>
          </svg>
          <p>${scenario.highlight}</p>
        </div>

        <div class="result-section">
          <div class="result-section-head"><strong>处置建议</strong><span>${String(scenario.steps.length).padStart(2, "0")} STEPS</span></div>
          <ol class="action-steps">${stepHTML}</ol>
        </div>

        <div class="result-section">
          <div class="result-section-head"><strong>数据支撑</strong><span>STRUCTURED EVIDENCE</span></div>
          <div class="metric-table">
            <div class="metric-table-row head">${scenario.metrics.headers.map((header) => `<span>${escapeHTML(header)}</span>`).join("")}</div>
            ${scenario.metrics.rows.map((row) => `
              <div class="metric-table-row">
                <strong>${escapeHTML(row.cells[0])}</strong>
                <span>${escapeHTML(row.cells[1])}</span>
                <span>${escapeHTML(row.cells[2])}</span>
                <span class="${row.status === "warn" ? "status-warn" : "status-ok"}">${escapeHTML(row.cells[3])}</span>
              </div>
            `).join("")}
          </div>
        </div>

        <div class="result-section">
          <div class="result-section-head"><strong>引用证据</strong><span>${scenario.citations.length} SOURCES · CLICK TO OPEN</span></div>
          <div class="citation-list">${citationHTML}</div>
        </div>

        <div class="result-footnote">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><circle cx="12" cy="12" r="8.5"/><path d="M12 10.5v5M12 7.5h.01"/></svg>
          <span>${escapeHTML(scenario.footnote)}${degraded ? " 本次数据 Agent 使用 15 分钟前缓存快照，结果置信度已下调并标注。" : ""}</span>
        </div>

        <div class="result-actions">
          <button class="mini-btn primary" type="button" data-action="copy">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><rect x="8" y="8" width="11" height="11" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/></svg>
            复制简报
          </button>
          <button class="mini-btn" type="button" data-action="download">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M12 3v12m0 0 4-4m-4 4-4-4M5 19h14"/></svg>
            下载 Markdown
          </button>
          <span class="result-duration" style="margin-left:auto;color:#5f7c93;font-family:var(--mono);font-size:7px;align-self:center;">${formatElapsed(elapsed)} · ${Math.round(1500 + Math.random() * 800)}ms 聚合</span>
        </div>
      </div>
    `;
  }

  function openEvidence(index) {
    const scenario = state.lastResult;
    if (!scenario) return;
    const citation = scenario.citations[index];
    if (!citation) return;

    state.modalReturnFocus = document.activeElement;
    el.evidenceTitle.textContent = citation.title;
    el.evidenceMeta.innerHTML = `
      <span>${escapeHTML(citation.source)}</span>
      <span>${escapeHTML(citation.location)}</span>
      <span>RERANK SCORE ${citation.score.toFixed(2)}</span>
    `;
    el.evidenceExcerpt.textContent = citation.excerpt;
    el.evidenceScore.style.width = `${Math.round(citation.score * 100)}%`;
    el.evidenceScoreText.textContent = citation.score.toFixed(2);
    el.evidenceModal.classList.add("open");
    el.evidenceModal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    window.setTimeout(() => el.modalClose.focus(), 80);
  }

  function closeEvidence() {
    el.evidenceModal.classList.remove("open");
    el.evidenceModal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    if (state.modalReturnFocus && typeof state.modalReturnFocus.focus === "function") {
      state.modalReturnFocus.focus();
    }
    state.modalReturnFocus = null;
  }

  function buildReportMarkdown() {
    const scenario = state.lastResult;
    if (!scenario) return "";
    const confidence = state.lastConfidence.toFixed(1);
    const lines = [
      `# ${scenario.title}`,
      "",
      `- 场景：${scenario.context}`,
      `- 任务：${el.queryInput.value.trim()}`,
      `- 综合置信度：${confidence}%`,
      `- 协同耗时：${formatElapsed(state.lastElapsed)}`,
      `- 子 Agent：${scenario.activeAgents.length} 个 · MCP 工具调用：${scenario.toolCalls} 次`,
      state.degraded ? "- 运行状态：数据工具异常，已启用缓存快照降级" : "- 运行状态：正常",
      "",
      "## 结论",
      stripHTML(scenario.summary),
      "",
      "## 关键动作",
      stripHTML(scenario.highlight),
      "",
      "## 处置建议",
      ...scenario.steps.map((step, index) => `${index + 1}. **${step.title}** — ${step.detail}`),
      "",
      "## 数据支撑",
      `| ${scenario.metrics.headers.join(" | ")} |`,
      `| ${scenario.metrics.headers.map(() => "---").join(" | ")} |`,
      ...scenario.metrics.rows.map((row) => `| ${row.cells.join(" | ")} |`),
      "",
      "## 引用证据",
      ...scenario.citations.map((citation, index) => `${index + 1}. ${citation.title}（${citation.source} · ${citation.location}，相关性 ${citation.score.toFixed(2)}）`),
      "",
      `> ${scenario.footnote}`,
      "",
      "---",
      "由多智能体协同决策平台 Demo 生成 · 仅用于项目演示"
    ];
    return lines.join("\n");
  }

  async function copyReport() {
    const markdown = buildReportMarkdown();
    if (!markdown) return;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(markdown);
      } else {
        const area = document.createElement("textarea");
        area.value = markdown;
        area.style.position = "fixed";
        area.style.opacity = "0";
        document.body.appendChild(area);
        area.select();
        document.execCommand("copy");
        area.remove();
      }
      showToast("决策简报已复制到剪贴板");
    } catch (error) {
      showToast("复制失败，请使用下载功能");
    }
  }

  function downloadReport() {
    const markdown = buildReportMarkdown();
    if (!markdown) return;
    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `decision-brief-${state.lastScene}-${new Date().toISOString().slice(0, 10)}.md`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    showToast("决策简报已下载为 Markdown 文件");
  }

  async function runBreakerDemo() {
    if (state.running || state.breakerRunning) return;
    state.breakerRunning = true;
    state.clockOrigin = performance.now();
    clearEventLog();
    resetFailureMeter();
    setCircuit("closed", "CLOSED");
    el.circuitCopy.innerHTML = "开始注入连续故障 · 连续失败 <b>0 / 5</b>";
    el.breakerDemo.disabled = true;
    el.runButton.disabled = true;
    el.scenarioCards.forEach((card) => card.classList.add("is-locked"));
    appendEvent("sys", "容错演练启动：模拟数据 MCP 连续超时，验证熔断、降级与半开恢复。");

    for (let index = 1; index <= 5; index += 1) {
      await sleep(360);
      el.failureMeter.children[index - 1].classList.add("failed");
      el.circuitCopy.innerHTML = `连续失败 <b>${index} / 5</b> · ${index < 5 ? "自动指数退避重试" : "达到熔断阈值"}`;
      if (index < 5) {
        appendEvent("warn", `数据工具调用超时（${index} / 5），重试间隔按指数退避延长。`);
      } else {
        appendEvent("warn", "连续失败 5 次，熔断器切换为 OPEN；请求立即降级至 Redis 缓存快照。");
      }
    }

    el.failureMeter.classList.add("open");
    setCircuit("open", "OPEN");
    el.circuitCopy.innerHTML = "熔断开启 · 30s 冷却 · 已启用 <b>缓存快照兜底</b>";
    el.cacheMetric.textContent = "41% HIT";
    appendEvent("sys", "降级链路生效：规则引擎与 15 分钟前快照已接管请求，主流程仍可返回结果。");
    await sleep(1300);

    setCircuit("half", "HALF_OPEN");
    el.circuitCopy.innerHTML = "冷却结束 · 半开状态 <b>探测恢复</b>";
    appendEvent("warn", "熔断器进入 HALF_OPEN，放行 1 次探测请求验证下游工具状态。");
    await sleep(1200);

    setCircuit("closed", "CLOSED");
    resetFailureMeter();
    el.circuitCopy.innerHTML = "探测成功 · 熔断器恢复 <b>CLOSED</b> · 连续失败 0 / 5";
    appendEvent("agg", "半开探测成功，下游工具恢复；熔断计数清零，系统回到正常服务状态。");
    el.breakerDemo.disabled = false;
    el.runButton.disabled = false;
    el.scenarioCards.forEach((card) => card.classList.remove("is-locked"));
    state.breakerRunning = false;
    showToast("容错演练完成：OPEN → HALF_OPEN → CLOSED 全链路已恢复");
  }

  // Events
  el.scenarioCards.forEach((card) => {
    card.addEventListener("click", () => selectScenario(card.dataset.scene));
  });

  el.runButton.addEventListener("click", runWorkflow);
  el.breakerDemo.addEventListener("click", runBreakerDemo);

  el.queryInput.addEventListener("keydown", (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
      event.preventDefault();
      runWorkflow();
    }
  });

  el.resultContent.addEventListener("click", (event) => {
    const citationButton = event.target.closest("[data-citation-index]");
    if (citationButton) {
      openEvidence(Number(citationButton.dataset.citationIndex));
      return;
    }

    const actionButton = event.target.closest("[data-action]");
    if (!actionButton) return;
    if (actionButton.dataset.action === "copy") copyReport();
    if (actionButton.dataset.action === "download") downloadReport();
  });

  el.modalClose.addEventListener("click", closeEvidence);
  el.evidenceModal.addEventListener("click", (event) => {
    if (event.target === el.evidenceModal) closeEvidence();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && el.evidenceModal.classList.contains("open")) {
      closeEvidence();
    }
  });

  // Keep the landing view calm until the first interaction; auto-play once so
  // an interviewer opening the link immediately sees the complete workflow.
  state.clockOrigin = performance.now();
  appendEvent("sys", "平台就绪 · DEMO 沙箱已连接 · 3 个预设场景可用。");
  state.autoRunTimer = window.setTimeout(() => {
    if (document.visibilityState !== "hidden") {
      runWorkflow();
    }
  }, 900);
})();
