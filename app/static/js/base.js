const initContainerHub = (container) => {
  const textarea = container.querySelector("textarea");
  const releaseButton = container.querySelector("[data-release-button]");
  const afterScreen = container.querySelector("[data-after]");
  const inputWrap = container.querySelector(".container-input");

  if (!textarea || !releaseButton || !afterScreen) {
    return;
  }

  const fadeStart = Number(container.dataset.fadeStart || 3500);
  const fadeEnd = Number(container.dataset.fadeEnd || 12000);
  const deleteAfter = Number(container.dataset.deleteAfter || 12000);
  const deleteInterval = Number(container.dataset.deleteInterval || 2600);
  const releaseDuration = Number(container.dataset.releaseDuration || 1800);

  let lastInput = Date.now();
  let lastDelete = Date.now();
  let released = false;

  const handleInput = () => {
    if (released) {
      return;
    }
    lastInput = Date.now();
    textarea.style.opacity = "1";
  };

  const handleIdle = () => {
    if (released) {
      return;
    }
    lastInput = Date.now() - fadeStart - 1;
  };

  const tick = () => {
    if (released) {
      return;
    }
    const now = Date.now();
    const idleFor = now - lastInput;

    if (textarea.value.length > 0) {
      if (idleFor > fadeStart) {
        const fadeProgress = Math.min(
          1,
          (idleFor - fadeStart) / Math.max(1, fadeEnd - fadeStart),
        );
        const opacity = Math.max(0.18, 1 - fadeProgress);
        textarea.style.opacity = String(opacity);
      } else {
        textarea.style.opacity = "1";
      }

      if (idleFor > deleteAfter && now - lastDelete > deleteInterval) {
        const currentText = textarea.value;
        if (currentText.length > 0) {
          const removeCount = Math.max(1, Math.ceil(currentText.length * 0.08));
          textarea.value = currentText.slice(0, currentText.length - removeCount);
        }
        lastDelete = now;
      }
    } else {
      textarea.style.opacity = "1";
    }
  };

  textarea.addEventListener("input", handleInput);
  textarea.addEventListener("focus", handleInput);
  window.addEventListener("blur", handleIdle);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      handleIdle();
    } else {
      handleInput();
    }
  });

  const intervalId = window.setInterval(tick, 200);

  const buildTextDisintegration = () => {
    if (!inputWrap) {
      return null;
    }
    const text = textarea.value;
    if (!text) {
      return null;
    }

    const computed = window.getComputedStyle(textarea);
    const overlay = document.createElement("div");
    overlay.className = "text-disintegrate";
    overlay.style.padding = computed.padding;
    overlay.style.font = computed.font;
    overlay.style.lineHeight = computed.lineHeight;
    overlay.style.letterSpacing = computed.letterSpacing;
    overlay.style.textAlign = computed.textAlign;
    overlay.style.color = computed.color;

    const fragment = document.createDocumentFragment();
    for (const char of text) {
      if (char === "\n") {
        fragment.appendChild(document.createElement("br"));
        continue;
      }
      const span = document.createElement("span");
      span.textContent = char === " " ? "\u00a0" : char;
      const dx = (Math.random() - 0.5) * 140;
      const dy = 30 + Math.random() * 110;
      const rot = (Math.random() - 0.5) * 160;
      const delay = Math.random() * 140;
      const duration = 450 + Math.random() * 350;
      span.style.setProperty("--char-x", `${dx}px`);
      span.style.setProperty("--char-y", `${dy}px`);
      span.style.setProperty("--char-rot", `${rot}deg`);
      span.style.setProperty("--char-delay", `${delay}ms`);
      span.style.setProperty("--char-duration", `${duration}ms`);
      fragment.appendChild(span);
    }

    overlay.appendChild(fragment);
    inputWrap.appendChild(overlay);
    return overlay;
  };

  releaseButton.addEventListener("click", () => {
    if (released) {
      return;
    }
    released = true;
    const overlay = buildTextDisintegration();
    window.clearInterval(intervalId);
    container.classList.add("is-disintegrating");
    container.classList.add("is-releasing");
    textarea.setAttribute("disabled", "disabled");
    releaseButton.setAttribute("disabled", "disabled");

    window.setTimeout(() => {
      textarea.value = "";
      container.classList.add("is-after");
      afterScreen.hidden = false;
      if (overlay) {
        overlay.remove();
      }
    }, releaseDuration);
  });
};

document.querySelectorAll("[data-container]").forEach(initContainerHub);

const initShardsHub = (card) => {
  const field = card.querySelector("[data-shards-field]");
  const wordsLayer = card.querySelector("[data-shards-words]");
  const input = card.querySelector("[data-shards-input]");
  const afterScreen = card.querySelector("[data-after]");

  if (!field || !wordsLayer || !input || !afterScreen) {
    return;
  }

  const overloadThreshold = Number(card.dataset.overloadThreshold || 22);
  const maxWords = Number(card.dataset.maxWords || 70);
  const baseDuration = Number(card.dataset.wordDuration || 12);
  const releaseDuration = Number(card.dataset.releaseDuration || 600);

  let released = false;
  let pointerStartY = null;

  const removeWord = (wordEl) => {
    if (wordEl && wordEl.parentNode === wordsLayer) {
      wordsLayer.removeChild(wordEl);
    }
  };

  const adjustOverload = () => {
    const count = wordsLayer.children.length;
    if (count <= overloadThreshold) {
      return;
    }
    Array.from(wordsLayer.children).forEach((wordEl) => {
      const current = Number(wordEl.dataset.duration || baseDuration);
      const next = Math.max(4, current * 0.78);
      wordEl.dataset.duration = String(next);
      wordEl.style.setProperty("--word-duration", `${next}s`);
    });
  };

  const addWord = (word) => {
    if (!word || released) {
      return;
    }

    const rect = field.getBoundingClientRect();
    const padding = 12;
    const maxX = Math.max(20, rect.width - padding * 2);
    const maxY = Math.max(60, rect.height - padding * 2 - 40);

    const wordEl = document.createElement("span");
    wordEl.className = "word-fragment";
    wordEl.textContent = word;

    const overload = Math.max(0, wordsLayer.children.length - overloadThreshold);
    const scale = Math.max(0.6, 1 - overload * 0.03);
    const duration = Math.max(6, baseDuration - overload * 0.4);
    const dx = (Math.random() - 0.5) * 120;
    const dy = 40 + Math.random() * 120;
    const delay = Math.random() * 120;

    wordEl.style.left = `${padding + Math.random() * maxX}px`;
    wordEl.style.top = `${padding + Math.random() * maxY}px`;
    wordEl.style.setProperty("--word-scale", `${scale}`);
    wordEl.style.setProperty("--word-dx", `${dx}px`);
    wordEl.style.setProperty("--word-dy", `${dy}px`);
    wordEl.style.setProperty("--word-delay", `${delay}ms`);
    wordEl.style.setProperty("--word-duration", `${duration}s`);
    wordEl.dataset.duration = String(duration);

    wordEl.addEventListener("animationend", () => removeWord(wordEl), {
      once: true,
    });

    wordsLayer.appendChild(wordEl);

    if (wordsLayer.children.length > maxWords) {
      removeWord(wordsLayer.firstElementChild);
    }

    adjustOverload();
  };

  const flushInput = () => {
    const value = input.value.trim();
    if (value) {
      addWord(value);
    }
    input.value = "";
  };

  const consumeWhitespace = () => {
    const parts = input.value.split(/\s+/);
    if (parts.length <= 1) {
      return;
    }
    const last = parts.pop() || "";
    parts.forEach((part) => addWord(part.trim()));
    input.value = last;
  };

  const releaseAll = () => {
    if (released) {
      return;
    }
    released = true;
    input.setAttribute("disabled", "disabled");
    input.blur();
    input.value = "";
    card.classList.add("is-clearing");

    Array.from(wordsLayer.children).forEach((wordEl, index) => {
      wordEl.classList.add("is-released");
      wordEl.style.setProperty("--release-delay", `${index * 12}ms`);
      wordEl.style.setProperty("--release-duration", `${releaseDuration}ms`);
    });

    window.setTimeout(() => {
      wordsLayer.innerHTML = "";
      card.classList.add("is-after");
      afterScreen.hidden = false;
    }, releaseDuration + 80);
  };

  input.addEventListener("keydown", (event) => {
    if (event.key === " " || event.key === "Enter") {
      event.preventDefault();
      flushInput();
    }
  });

  input.addEventListener("input", consumeWhitespace);

  field.addEventListener("pointerdown", (event) => {
    if (released) {
      return;
    }
    pointerStartY = event.clientY;
  });

  field.addEventListener("pointerup", (event) => {
    if (released || pointerStartY === null) {
      pointerStartY = null;
      return;
    }
    const deltaY = event.clientY - pointerStartY;
    pointerStartY = null;
    if (deltaY > 90) {
      releaseAll();
    }
  });

  field.addEventListener("pointercancel", () => {
    pointerStartY = null;
  });
};

document.querySelectorAll("[data-shards]").forEach(initShardsHub);

const initRageHub = (card) => {
  const field = card.querySelector("[data-rage-field]");
  const overlay = card.querySelector("[data-rage-overlay]");
  const afterScreen = card.querySelector("[data-after]");
  const input = card.querySelector("[data-rage-input]");

  if (!field || !overlay || !afterScreen) {
    return;
  }

  const idleTimeout = Number(card.dataset.idleTimeout || 3600);
  const overloadThreshold = Number(card.dataset.overloadThreshold || 13);
  const minDuration = Number(card.dataset.symbolMinDuration || 480);
  const maxDuration = Number(card.dataset.symbolMaxDuration || 1400);
  const blastCount = Number(card.dataset.blastCount || 100);
  const blastDuration = Number(card.dataset.blastDuration || 520);
  const overloadText = card.dataset.overloadText || "Досить.";
  const exhaleText = card.dataset.exhaleText || "Видихай.";
  const exhaleDelay = Number(card.dataset.exhaleDelay || 320);

  let released = false;
  let idleTimer = null;
  let overloadTimer = null;
  let releaseTimer = null;
  let hasInput = false;
  let pressTimes = [];
  let overloadSeen = false;
  const symbolBuffer = [];
  const maxBuffer = Math.max(blastCount, 120);

  const normalizeSymbol = (key) => {
    if (key === "Enter") {
      return null;
    }
    if (key === " ") {
      return "·";
    }
    if (key === "Backspace") {
      return "⌫";
    }
    if (key === "Tab") {
      return "↹";
    }
    if (key.length === 1) {
      return key;
    }
    return null;
  };

  const setOverlay = (text, show) => {
    overlay.textContent = text;
    overlay.hidden = !show;
  };

  const clearIdle = () => {
    if (idleTimer) {
      window.clearTimeout(idleTimer);
      idleTimer = null;
    }
  };

  const clearRelease = () => {
    if (releaseTimer) {
      window.clearTimeout(releaseTimer);
      releaseTimer = null;
    }
  };

  const scheduleIdle = () => {
    clearIdle();
    idleTimer = window.setTimeout(() => {
      if (!released && hasInput) {
        if (overloadSeen) {
          if (overloadTimer) {
            window.clearTimeout(overloadTimer);
            overloadTimer = null;
          }
          card.classList.remove("is-overload");
          card.classList.add("is-exhale");
          setOverlay(exhaleText, true);
          releaseTimer = window.setTimeout(() => {
            releaseAll({ blast: true });
          }, exhaleDelay);
        } else {
          releaseAll({ blast: true });
        }
      }
    }, idleTimeout);
  };

  const updateOverload = () => {
    const now = Date.now();
    pressTimes = pressTimes.filter((time) => now - time < 1000);
    if (pressTimes.length >= overloadThreshold) {
      card.classList.add("is-overload");
      card.classList.remove("is-exhale");
      setOverlay(overloadText, true);
      overloadSeen = true;
      if (overloadTimer) {
        window.clearTimeout(overloadTimer);
      }
      overloadTimer = window.setTimeout(() => {
        card.classList.remove("is-overload");
        if (!card.classList.contains("is-exhale")) {
          overlay.hidden = true;
        }
      }, 800);
    }
  };

  const adjustExistingDurations = (factor, skipElement) => {
    const symbols = field.querySelectorAll(".rage-symbol");
    symbols.forEach((symbol) => {
      if (symbol === skipElement) {
        return;
      }
      const current = Number(symbol.dataset.duration || maxDuration);
      const next = Math.max(minDuration, current * factor);
      symbol.dataset.duration = String(next);
      symbol.style.setProperty("--symbol-duration", `${next}ms`);
    });
  };

  const addSymbol = (symbol) => {
    if (!symbol || released) {
      return;
    }

    const rect = field.getBoundingClientRect();
    const padding = 12;
    const maxX = Math.max(20, rect.width - padding * 2);
    const maxY = Math.max(40, rect.height - padding * 2);
    const count = field.children.length;
    const overload = Math.max(0, count - overloadThreshold);

    const duration = Math.max(
      minDuration,
      maxDuration - overload * 60 - Math.random() * 200,
    );
    const size = Math.max(14, 28 - overload * 0.8 + Math.random() * 10);
    const rotation = (Math.random() - 0.5) * 40;
    const dx = (Math.random() - 0.5) * 40;
    const dy = 10 + Math.random() * 30;

    const symbolEl = document.createElement("span");
    symbolEl.className = "rage-symbol";
    symbolEl.textContent = symbol;
    symbolEl.style.setProperty("--symbol-duration", `${duration}ms`);
    symbolEl.style.setProperty("--symbol-size", `${size}px`);
    symbolEl.style.setProperty("--symbol-rot", `${rotation}deg`);
    symbolEl.style.setProperty("--symbol-dx", `${dx}px`);
    symbolEl.style.setProperty("--symbol-dy", `${dy}px`);
    symbolEl.dataset.duration = String(duration);

    const leftPx = padding + Math.random() * maxX;
    const topPx = padding + Math.random() * maxY;
    symbolEl.style.left = `${leftPx}px`;
    symbolEl.style.top = `${topPx}px`;
    symbolBuffer.push({
      char: symbol,
      xRatio: leftPx / Math.max(1, rect.width),
      yRatio: topPx / Math.max(1, rect.height),
      rotation,
      size,
    });
    if (symbolBuffer.length > maxBuffer) {
      symbolBuffer.splice(0, symbolBuffer.length - maxBuffer);
    }

    symbolEl.addEventListener(
      "animationend",
      () => {
        if (symbolEl.parentNode === field) {
          field.removeChild(symbolEl);
        }
      },
      { once: true },
    );

    field.appendChild(symbolEl);

    if (field.children.length > overloadThreshold) {
      adjustExistingDurations(0.78, symbolEl);
    }
  };

  const blastSymbols = () => {
    const recent = symbolBuffer.slice(-blastCount);
    if (!recent.length) {
      return 0;
    }
    const rect = field.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const layer = document.createElement("div");
    layer.className = "rage-blast-layer";

    recent.forEach((item) => {
      const sx = (item.xRatio || 0.5) * rect.width;
      const sy = (item.yRatio || 0.5) * rect.height;
      const dxRaw = sx - centerX;
      const dyRaw = sy - centerY;
      const distance = Math.max(30, Math.hypot(dxRaw, dyRaw));
      const force = 120 + Math.random() * 140;
      const factor = force / distance;
      const dx = dxRaw * factor + (Math.random() - 0.5) * 40;
      const dy = dyRaw * factor + (Math.random() - 0.5) * 40;
      const rot = (Math.random() - 0.5) * 120;
      const blastEl = document.createElement("span");
      blastEl.className = "rage-blast";
      blastEl.textContent = item.char;
      blastEl.style.left = `${sx}px`;
      blastEl.style.top = `${sy}px`;
      blastEl.style.setProperty("--blast-x", `${dx}px`);
      blastEl.style.setProperty("--blast-y", `${dy}px`);
      blastEl.style.setProperty("--blast-rot", `${rot}deg`);
      blastEl.style.setProperty("--blast-duration", `${blastDuration}ms`);
      blastEl.style.setProperty("--symbol-size", `${item.size || 22}px`);
      blastEl.style.setProperty("--symbol-rot", `${item.rotation || 0}deg`);
      layer.appendChild(blastEl);
    });

    field.appendChild(layer);
    window.setTimeout(() => {
      layer.remove();
    }, blastDuration + 80);

    return blastDuration;
  };

  const releaseAll = ({ blast } = { blast: false }) => {
    if (released) {
      return;
    }
    released = true;
    clearIdle();
    clearRelease();
    card.classList.remove("is-overload");
    card.classList.remove("is-exhale");
    overlay.hidden = true;

    let delay = 0;
    if (blast) {
      delay = blastSymbols();
    } else {
      const symbols = field.querySelectorAll(".rage-symbol");
      symbols.forEach((symbol) => symbol.classList.add("is-released"));
      delay = 420;
    }

    window.setTimeout(() => {
      field.innerHTML = "";
      card.classList.add("is-after");
      afterScreen.hidden = false;
    }, Math.max(320, delay));
  };

  const handleKeydown = (event) => {
    if (released) {
      return;
    }
    const tag = event.target?.tagName?.toLowerCase();
    const isRageInput = input && event.target === input;
    if (!isRageInput && (tag === "input" || tag === "textarea" || event.target?.isContentEditable)) {
      return;
    }
    if (event.key === "Shift" || event.key === "Alt" || event.key === "Control" || event.key === "Meta") {
      return;
    }

    const symbol = normalizeSymbol(event.key);
    if (!symbol) {
      return;
    }

    event.preventDefault();
    clearRelease();
    if (overlay.textContent === exhaleText) {
      overlay.hidden = true;
      card.classList.remove("is-exhale");
    }
    hasInput = true;
    pressTimes.push(Date.now());
    updateOverload();
    addSymbol(symbol);
    scheduleIdle();
  };

  window.addEventListener("keydown", handleKeydown);

  if (input) {
    const handleBeforeInput = (event) => {
      if (released) {
        return;
      }
      if (event.inputType === "deleteContentBackward" || event.inputType === "deleteContentForward") {
        event.preventDefault();
        clearRelease();
        if (overlay.textContent === exhaleText) {
          overlay.hidden = true;
          card.classList.remove("is-exhale");
        }
        hasInput = true;
        pressTimes.push(Date.now());
        updateOverload();
        addSymbol("⌫");
        scheduleIdle();
      }
    };

    const handleInput = () => {
      if (released) {
        return;
      }
      const value = input.value;
      if (!value) {
        return;
      }
      const chars = Array.from(value);
      chars.forEach((char) => {
        const symbol = char === " " ? "·" : char;
        clearRelease();
        if (overlay.textContent === exhaleText) {
          overlay.hidden = true;
          card.classList.remove("is-exhale");
        }
        hasInput = true;
        pressTimes.push(Date.now());
        updateOverload();
        addSymbol(symbol);
      });
      input.value = "";
      scheduleIdle();
    };

    input.addEventListener("beforeinput", handleBeforeInput);
    input.addEventListener("input", handleInput);
  }

  field.addEventListener("pointerdown", () => {
    if (input) {
      input.focus({ preventScroll: true });
    } else {
      card.focus({ preventScroll: true });
    }
  });
};

document.querySelectorAll("[data-rage]").forEach(initRageHub);

const initArgumentHub = (card) => {
  const field = card.querySelector("[data-argument-field]");
  const input = card.querySelector("[data-argument-input]");
  const alert = card.querySelector("[data-argument-alert]");
  const afterScreen = card.querySelector("[data-after]");
  const responsesScript = card.querySelector("[data-argument-responses]");

  if (!field || !input || !alert || !afterScreen) {
    return;
  }

  let responses = [];
  if (responsesScript?.textContent) {
    try {
      responses = JSON.parse(responsesScript.textContent);
    } catch (error) {
      responses = [];
    }
  }

  const idleTimeout = Number(card.dataset.idleTimeout || 5200);
  const replyDelayMin = Number(card.dataset.replyDelayMin || 1000);
  const replyDelayMax = Number(card.dataset.replyDelayMax || 1900);
  const escalationWindow = Number(card.dataset.escalationWindow || 7000);
  const escalationThreshold = Number(card.dataset.escalationThreshold || 4);

  let idleTimer = null;
  let cleanupTimer = null;
  let recentTimes = [];
  let escalationShown = false;
  let released = false;
  let userMessageCount = 0;

  const clearIdle = () => {
    if (idleTimer) {
      window.clearTimeout(idleTimer);
      idleTimer = null;
    }
  };

  const scheduleIdle = () => {
    clearIdle();
    idleTimer = window.setTimeout(() => {
      if (released) {
        return;
      }
      if (userMessageCount < 3) {
        return;
      }
      if (input.value.trim()) {
        scheduleIdle();
        return;
      }
      released = true;
      card.classList.add("is-ending");
      window.setTimeout(() => {
        field.innerHTML = "";
        card.classList.add("is-after");
        afterScreen.hidden = false;
      }, 900);
    }, idleTimeout);
  };

  const showAlertOnce = () => {
    if (escalationShown) {
      return;
    }
    escalationShown = true;
    card.classList.add("is-escalated");
    alert.hidden = false;
    alert.classList.add("is-visible");
    window.setTimeout(() => {
      alert.classList.remove("is-visible");
      alert.hidden = true;
    }, 1400);
  };

  const registerEscalation = (length) => {
    const now = Date.now();
    recentTimes = recentTimes.filter((time) => now - time < escalationWindow);
    recentTimes.push(now);
    const intensity = recentTimes.length + (length > 60 ? 1 : 0);
    if (intensity >= escalationThreshold) {
      showAlertOnce();
    }
    const fontSize = Math.min(30, 18 + intensity * 2);
    const gap = Math.max(6, 14 - intensity);
    field.style.setProperty("--arg-gap", `${gap}px`);
    return fontSize;
  };

  const addMessage = (text, kind, fontSize) => {
    const message = document.createElement("div");
    message.className = `argument-message ${kind}`;
    message.textContent = text;
    if (fontSize) {
      message.style.setProperty("--msg-size", `${fontSize}px`);
    }
    if (kind === "user") {
      message.classList.add("is-hit");
    }
    field.appendChild(message);
    window.setTimeout(() => {
      message.classList.remove("is-hit");
    }, 200);
    window.setTimeout(() => {
      message.classList.add("is-fading");
    }, 4200);
    window.setTimeout(() => {
      if (message.parentNode === field) {
        field.removeChild(message);
      }
    }, 6200);
  };

  const reply = () => {
    if (!responses.length || released) {
      return;
    }
    const response = responses[Math.floor(Math.random() * responses.length)];
    addMessage(response, "reply");
  };

  const submit = () => {
    const value = input.value.trim();
    if (!value || released) {
      return;
    }
    const fontSize = registerEscalation(value.length);
    addMessage(value, "user", fontSize);
    input.value = "";
    userMessageCount += 1;
    scheduleIdle();

    const delay = replyDelayMin + Math.random() * (replyDelayMax - replyDelayMin);
    window.setTimeout(reply, delay);
  };

  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      submit();
    }
  });

  input.addEventListener("input", () => {
    if (released) {
      return;
    }
    scheduleIdle();
  });

  card.addEventListener("pointerdown", () => {
    input.focus({ preventScroll: true });
  });

  scheduleIdle();
};

document.querySelectorAll("[data-argument]").forEach(initArgumentHub);

const initDotHub = (card) => {
  const field = card.querySelector("[data-dot-field]");
  const dot = card.querySelector("[data-dot-point]");

  if (!field || !dot) {
    return;
  }

  let bounds = { width: 0, height: 0 };
  let pos = { x: 0.5, y: 0.5 };
  let vel = { x: 0, y: 0 };
  let target = { x: 0.5, y: 0.5 };
  let brightness = 0.6;
  let targetBrightness = 0.7;
  let pausedUntil = 0;
  let lastTick = 0;

  const updateBounds = () => {
    const rect = field.getBoundingClientRect();
    bounds = { width: rect.width, height: rect.height };
  };

  const pickTarget = () => {
    const margin = 0.2;
    target = {
      x: margin + Math.random() * (1 - margin * 2),
      y: margin + Math.random() * (1 - margin * 2),
    };
  };

  const pickBrightness = () => {
    targetBrightness = 0.45 + Math.random() * 0.5;
  };

  updateBounds();
  pickTarget();
  pickBrightness();

  let resizeObserver = null;
  if (typeof ResizeObserver !== "undefined") {
    resizeObserver = new ResizeObserver(updateBounds);
    resizeObserver.observe(field);
  } else {
    window.addEventListener("resize", updateBounds);
  }

  const targetTimer = window.setInterval(pickTarget, 5200);
  const brightnessTimer = window.setInterval(pickBrightness, 2400);

  const step = (timestamp) => {
    if (!lastTick) {
      lastTick = timestamp;
    }
    const delta = Math.min(32, timestamp - lastTick);
    lastTick = timestamp;
    const now = performance.now();

    if (now >= pausedUntil) {
      const steering = 0.0016 * delta;
      vel.x += (target.x - pos.x) * steering;
      vel.y += (target.y - pos.y) * steering;
      const damp = 0.985;
      vel.x *= damp;
      vel.y *= damp;
      pos.x += vel.x;
      pos.y += vel.y;
      pos.x = Math.min(0.85, Math.max(0.15, pos.x));
      pos.y = Math.min(0.85, Math.max(0.15, pos.y));
    }

    brightness += (targetBrightness - brightness) * 0.02;

    const x = pos.x * bounds.width;
    const y = pos.y * bounds.height;
    const glow = 6 + brightness * 10;
    dot.style.setProperty("--dot-x", `${x}px`);
    dot.style.setProperty("--dot-y", `${y}px`);
    dot.style.setProperty("--dot-opacity", brightness.toFixed(2));
    dot.style.setProperty("--dot-glow", `${glow.toFixed(1)}px`);

    window.requestAnimationFrame(step);
  };

  window.requestAnimationFrame(step);

  card.addEventListener("pointerdown", () => {
    pausedUntil = performance.now() + 900;
  });

  window.addEventListener(
    "pagehide",
    () => {
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      window.clearInterval(targetTimer);
      window.clearInterval(brightnessTimer);
    },
    { once: true },
  );
};

document.querySelectorAll("[data-dot]").forEach(initDotHub);

const initRhythmHub = (card) => {
  const shape = card.querySelector(".rhythm-shape");
  if (!shape) {
    return;
  }

  let pauseTimer = null;
  const pause = () => {
    card.classList.add("is-paused");
    if (pauseTimer) {
      window.clearTimeout(pauseTimer);
    }
    pauseTimer = window.setTimeout(() => {
      card.classList.remove("is-paused");
    }, 900);
  };

  card.addEventListener("pointerdown", pause);
  window.addEventListener(
    "pagehide",
    () => {
      if (pauseTimer) {
        window.clearTimeout(pauseTimer);
      }
    },
    { once: true },
  );
};

document.querySelectorAll("[data-rhythm]").forEach(initRhythmHub);

const initWarmHub = (card) => {
  let warmed = false;

  const warm = () => {
    if (warmed) {
      return;
    }
    warmed = true;
    card.classList.add("is-warm");
  };

  card.addEventListener("pointerdown", warm, { passive: true });
  card.addEventListener("keydown", warm);
  window.addEventListener("wheel", warm, { passive: true });
  window.addEventListener("touchmove", warm, { passive: true });
  window.addEventListener("scroll", warm, { passive: true });

  window.addEventListener(
    "pagehide",
    () => {
      window.removeEventListener("wheel", warm);
      window.removeEventListener("touchmove", warm);
      window.removeEventListener("scroll", warm);
    },
    { once: true },
  );
};

document.querySelectorAll("[data-warm]").forEach(initWarmHub);

const initCrowdHub = (card) => {
  const field = card.querySelector("[data-crowd-field]");
  if (!field) {
    return;
  }

  const randomPastel = () => {
    const hue = Math.floor(Math.random() * 360);
    const light = 74 + Math.random() * 12;
    const alpha = 0.85;
    const color = `hsla(${hue}, 55%, ${light}%, ${alpha})`;
    const shadow = `hsla(${hue}, 55%, ${light}%, 0.3)`;
    return { color, shadow };
  };

  const dots = [];
  const maxDots = 35;
  const startDelay = 2400;
  const spawnInterval = 900;
  let pointer = { active: false, x: 0.5, y: 0.5 };
  let bounds = { width: 0, height: 0, min: 0 };
  let rafId = 0;
  let spawnTimer = null;
  let spawnIntervalId = null;

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  const updateBounds = () => {
    const rect = field.getBoundingClientRect();
    bounds = { width: rect.width, height: rect.height, min: Math.min(rect.width, rect.height) };
  };

  const createDot = (x, y, options = {}) => {
    const el = document.createElement("span");
    el.className = "crowd-dot";
    const size = options.size || 12 + Math.random() * 8;
    const opacity = options.opacity || 0.7 + Math.random() * 0.2;
    el.style.setProperty("--dot-size", `${size.toFixed(1)}px`);
    el.style.setProperty("--dot-opacity", opacity.toFixed(2));
    if (options.color) {
      el.style.setProperty("--dot-color", options.color);
    }
    if (options.shadow) {
      el.style.setProperty("--dot-shadow", options.shadow);
    }
    if (options.isCore) {
      el.classList.add("is-core");
    }
    field.appendChild(el);
    window.requestAnimationFrame(() => {
      el.classList.add("is-visible");
    });
    return {
      el,
      x,
      y,
      size,
      isCore: Boolean(options.isCore),
      angle: Math.random() * Math.PI * 2,
      speed: 0.01 + Math.random() * 0.0008,
      radiusX: 0.08 + Math.random() * 0.2,
      radiusY: 0.08 + Math.random() * 0.18,
      wobble: 0.01 + Math.random() * 0.02,
      wobbleSpeed: 0.0006 + Math.random() * 0.0007,
      phase: Math.random() * Math.PI * 2,
    };
  };

  const addDot = (x, y, options = {}) => {
    const dot = createDot(x, y, options);
    dots.push(dot);
    if (dots.length >= 12) {
      card.classList.add("is-ready");
    }
  };

  updateBounds();
  addDot(0.5, 0.5, { isCore: true, size: 18, opacity: 0.95 });

  spawnTimer = window.setTimeout(() => {
    spawnIntervalId = window.setInterval(() => {
      if (dots.length >= maxDots) {
        window.clearInterval(spawnIntervalId);
        return;
      }
      const margin = 0.18;
      const tone = randomPastel();
      addDot(
        margin + Math.random() * (1 - margin * 2),
        margin + Math.random() * (1 - margin * 2),
        tone,
      );
    }, spawnInterval);
  }, startDelay);

  const step = (timestamp) => {
    if (!bounds.min) {
      updateBounds();
    }

    dots.forEach((dot) => {
      if (dot.isCore) {
        dot.x = 0.5;
        dot.y = 0.5;
      } else {
        dot.angle += dot.speed;
        dot.phase += dot.wobbleSpeed;
        const wobbleX = Math.sin(dot.phase) * dot.wobble;
        const wobbleY = Math.cos(dot.phase * 0.7) * dot.wobble;
        let x = 0.5 + Math.cos(dot.angle) * (dot.radiusX + wobbleX);
        let y = 0.5 + Math.sin(dot.angle) * (dot.radiusY + wobbleY);

        if (pointer.active) {
          const dx = x - pointer.x;
          const dy = y - pointer.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 0.22 && dist > 0.001) {
            const push = (0.22 - dist) * 0.12;
            x += (dx / dist) * push;
            y += (dy / dist) * push;
          }
        }

        dot.x = clamp(x, 0.12, 0.88);
        dot.y = clamp(y, 0.12, 0.88);
      }

      dot.el.style.setProperty("--dot-x", `${(dot.x * 100).toFixed(2)}%`);
      dot.el.style.setProperty("--dot-y", `${(dot.y * 100).toFixed(2)}%`);
    });

    rafId = window.requestAnimationFrame(step);
  };

  rafId = window.requestAnimationFrame(step);

  const updatePointer = (event) => {
    const rect = field.getBoundingClientRect();
    pointer = {
      active: true,
      x: (event.clientX - rect.left) / rect.width,
      y: (event.clientY - rect.top) / rect.height,
    };
  };

  const clearPointer = () => {
    pointer.active = false;
  };

  field.addEventListener("pointermove", updatePointer, { passive: true });
  field.addEventListener("pointerdown", updatePointer, { passive: true });
  field.addEventListener("pointerleave", clearPointer);

  let resizeObserver = null;
  if (typeof ResizeObserver !== "undefined") {
    resizeObserver = new ResizeObserver(updateBounds);
    resizeObserver.observe(field);
  } else {
    window.addEventListener("resize", updateBounds);
  }

  window.addEventListener(
    "pagehide",
    () => {
      window.cancelAnimationFrame(rafId);
      if (spawnTimer) {
        window.clearTimeout(spawnTimer);
      }
      if (spawnIntervalId) {
        window.clearInterval(spawnIntervalId);
      }
      if (resizeObserver) {
        resizeObserver.disconnect();
      } else {
        window.removeEventListener("resize", updateBounds);
      }
    },
    { once: true },
  );
};

document.querySelectorAll("[data-crowd]").forEach(initCrowdHub);

const initWeightHub = (card) => {
  const panel = card.querySelector(".weight-panel");
  if (!panel) {
    return;
  }

  let target = { x: 0, y: 0 };
  let offset = { x: 0, y: 0 };
  let lastInput = 0;
  let resistance = 1;
  let activity = 0;
  let rafId = 0;

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  const registerActivity = () => {
    lastInput = performance.now();
    activity = Math.min(1, activity + 0.12);
    resistance = 1 + activity * 3.4;
    card.classList.remove("is-relieved");
  };

  const nudge = (dx, dy) => {
    registerActivity();
    target.x = clamp(target.x + dx, -38, 38);
    target.y = clamp(target.y + dy, -28, 28);
  };

  const handlePointerMove = (event) => {
    if (event.pointerType === "touch" && !event.isPrimary) {
      return;
    }
    const dx = (event.movementX || 0) * 0.6;
    const dy = (event.movementY || 0) * 0.6;
    nudge(dx / resistance, dy / resistance);
  };

  const handleWheel = (event) => {
    const dx = (event.deltaX || 0) * 0.18;
    const dy = (event.deltaY || 0) * 0.18;
    nudge(dx / resistance, dy / resistance);
  };

  const handleTouchMove = (event) => {
    const touch = event.touches[0];
    if (!touch) {
      return;
    }
    const dx = (touch.clientX - (handleTouchMove.lastX || touch.clientX)) * 0.5;
    const dy = (touch.clientY - (handleTouchMove.lastY || touch.clientY)) * 0.5;
    handleTouchMove.lastX = touch.clientX;
    handleTouchMove.lastY = touch.clientY;
    nudge(dx / resistance, dy / resistance);
  };
  handleTouchMove.lastX = null;
  handleTouchMove.lastY = null;

  const step = () => {
    const now = performance.now();
    if (now - lastInput > 3400) {
      activity = Math.max(0, activity - 0.02);
      resistance = 1 + activity * 3.4;
      if (activity <= 0.1) {
        card.classList.add("is-relieved");
      }
    }

    target.x *= 0.92;
    target.y *= 0.92;

    const response = 0.06 / resistance;
    offset.x += (target.x - offset.x) * response;
    offset.y += (target.y - offset.y) * response;

    panel.style.setProperty("--weight-x", `${offset.x.toFixed(2)}px`);
    panel.style.setProperty("--weight-y", `${offset.y.toFixed(2)}px`);

    rafId = window.requestAnimationFrame(step);
  };

  rafId = window.requestAnimationFrame(step);

  card.addEventListener("pointermove", handlePointerMove, { passive: true });
  card.addEventListener("pointerdown", registerActivity, { passive: true });
  card.addEventListener("wheel", handleWheel, { passive: true });
  card.addEventListener("touchmove", handleTouchMove, { passive: true });
  card.addEventListener("touchend", () => {
    handleTouchMove.lastX = null;
    handleTouchMove.lastY = null;
  });

  window.addEventListener(
    "pagehide",
    () => {
      window.cancelAnimationFrame(rafId);
    },
    { once: true },
  );
};

document.querySelectorAll("[data-weight]").forEach(initWeightHub);

const initMeasureHub = (card) => {
  const fill = card.querySelector(".measure-fill");
  if (!fill) {
    return;
  }

  let value = 0;
  let lastInput = 0;
  let rafId = 0;
  let capped = false;

  const capValue = 0.78;

  const bump = (amount) => {
    const now = performance.now();
    lastInput = now;
    if (value < capValue) {
      value = Math.min(capValue, value + amount);
      if (value >= capValue) {
        capped = true;
        card.classList.add("is-capped");
      }
    }
  };

  const handlePointerMove = () => {
    bump(0.015);
  };

  const handleWheel = () => {
    bump(0.02);
  };

  const handleTouchMove = () => {
    bump(0.02);
  };

  const step = () => {
    const now = performance.now();
    if (now - lastInput > 3400) {
      if (value > 0.05) {
        value -= 0.002;
      }
    }
    const percent = Math.max(0, Math.min(1, value));
    fill.style.setProperty("--measure-fill", `${(percent * 100).toFixed(1)}%`);
    rafId = window.requestAnimationFrame(step);
  };

  rafId = window.requestAnimationFrame(step);

  card.addEventListener("pointermove", handlePointerMove, { passive: true });
  card.addEventListener("pointerdown", handlePointerMove, { passive: true });
  card.addEventListener("wheel", handleWheel, { passive: true });
  card.addEventListener("touchmove", handleTouchMove, { passive: true });

  window.addEventListener(
    "pagehide",
    () => {
      window.cancelAnimationFrame(rafId);
    },
    { once: true },
  );
};

document.querySelectorAll("[data-measure]").forEach(initMeasureHub);

const initCloudHub = (card) => {
  const shape = card.querySelector(".cloud-shape");
  if (!shape) {
    return;
  }

  let target = { x: 0, y: 0, scale: 1 };
  let current = { x: 0, y: 0, scale: 1 };
  let driftTimer = null;
  let rafId = 0;
  let pulseTimer = null;

  const pickTarget = () => {
    target = {
      x: (Math.random() - 0.5) * 30,
      y: (Math.random() - 0.5) * 24,
      scale: 0.95 + Math.random() * 0.1,
    };
  };

  pickTarget();
  driftTimer = window.setInterval(pickTarget, 5200);

  const step = (timestamp) => {
    current.x += (target.x - current.x) * 0.008;
    current.y += (target.y - current.y) * 0.008;
    current.scale += (target.scale - current.scale) * 0.008;
    const wobble =
      1 +
      Math.sin(timestamp / 3200) * 0.014 +
      Math.sin(timestamp / 5600) * 0.01;
    shape.style.setProperty("--cloud-x", `${current.x.toFixed(2)}px`);
    shape.style.setProperty("--cloud-y", `${current.y.toFixed(2)}px`);
    shape.style.setProperty("--cloud-scale", current.scale.toFixed(3));
    shape.style.setProperty("--cloud-wobble", wobble.toFixed(4));
    rafId = window.requestAnimationFrame(step);
  };

  rafId = window.requestAnimationFrame(step);

  const pulse = () => {
    target.scale = Math.min(1.08, target.scale + 0.06);
    current.scale = Math.min(1.08, current.scale + 0.03);
    target.x += (Math.random() - 0.5) * 6;
    target.y += (Math.random() - 0.5) * 6;
    shape.style.setProperty("--cloud-pulse", "1.08");
    if (pulseTimer) {
      window.clearTimeout(pulseTimer);
    }
    pulseTimer = window.setTimeout(() => {
      shape.style.setProperty("--cloud-pulse", "1");
    }, 1200);
  };

  card.addEventListener("pointerdown", pulse);
  card.addEventListener("click", pulse);
  card.addEventListener("touchstart", pulse, { passive: true });
  card.addEventListener("mousedown", pulse);

  window.addEventListener(
    "pagehide",
    () => {
      window.cancelAnimationFrame(rafId);
      if (driftTimer) {
        window.clearInterval(driftTimer);
      }
      if (pulseTimer) {
        window.clearTimeout(pulseTimer);
      }
    },
    { once: true },
  );
};

document.querySelectorAll("[data-cloud]").forEach(initCloudHub);

const initLightHub = (card) => {
  const input = card.querySelector("[data-light-input]");
  const display = card.querySelector("[data-light-display]");
  const affirmation = card.querySelector("[data-light-affirmation]");
  const afterScreen = card.querySelector("[data-after]");

  if (!input || !display || !afterScreen) {
    return;
  }

  const idleTimeout = Number(card.dataset.idleTimeout || 2400);
  const afterDelay = Number(card.dataset.afterDelay || 4200);
  const minChars = Number(card.dataset.minChars || 120);

  let idleTimer = null;
  let afterTimer = null;
  let settled = false;

  const setPalette = (progress, length) => {
    const jitter = Math.min(12, length / 8);
    const hue1 = 30 + progress * 95 + jitter;
    const hue2 = 120 + progress * 70 + jitter * 0.6;
    const hue3 = 190 + progress * 50 + jitter * 0.4;
    document.body.style.setProperty("--light-hue-1", hue1.toFixed(1));
    document.body.style.setProperty("--light-hue-2", hue2.toFixed(1));
    document.body.style.setProperty("--light-hue-3", hue3.toFixed(1));
  };

  const resetPalette = () => {
    document.body.style.removeProperty("--light-hue-1");
    document.body.style.removeProperty("--light-hue-2");
    document.body.style.removeProperty("--light-hue-3");
  };

  const clearIdle = () => {
    if (idleTimer) {
      window.clearTimeout(idleTimer);
      idleTimer = null;
    }
  };

  const clearAfter = () => {
    if (afterTimer) {
      window.clearTimeout(afterTimer);
      afterTimer = null;
    }
  };

  const updateDisplay = () => {
    display.textContent = input.value;
    const trimmed = input.value.trim();
    if (trimmed) {
      const progress = Math.min(1, trimmed.length / Math.max(1, minChars));
      const opacity = 0.15 + progress * 0.35;
      setPalette(progress, trimmed.length);
      card.classList.add("is-lit");
      document.body.classList.add("is-lightening");
      document.body.style.setProperty("--light-opacity", opacity.toFixed(3));
    } else if (!settled) {
      card.classList.remove("is-lit");
      document.body.classList.remove("is-lightening", "is-settled");
      document.body.style.setProperty("--light-opacity", "0");
      resetPalette();
    }
  };

  const settle = () => {
    const trimmed = input.value.trim();
    if (settled || !trimmed || trimmed.length < minChars) {
      return;
    }
    updateDisplay();
    settled = true;
    card.classList.add("is-settled");
    document.body.classList.add("is-lightening", "is-settled");
    document.body.style.setProperty("--light-opacity", "0.6");
    input.setAttribute("disabled", "disabled");
    if (affirmation) {
      affirmation.hidden = false;
    }
    clearIdle();
    clearAfter();
    afterTimer = window.setTimeout(() => {
      card.classList.add("is-after");
      afterScreen.hidden = false;
    }, afterDelay);
  };

  const scheduleIdle = () => {
    if (settled) {
      return;
    }
    clearIdle();
    idleTimer = window.setTimeout(settle, idleTimeout);
  };

  input.addEventListener("input", () => {
    if (settled) {
      return;
    }
    updateDisplay();
    scheduleIdle();
  });

  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      settle();
    }
  });

  card.addEventListener("pointerdown", () => {
    input.focus({ preventScroll: true });
  });

  updateDisplay();
  scheduleIdle();
};

document.querySelectorAll("[data-light]").forEach(initLightHub);

document.addEventListener("submit", (event) => {
  const form = event.target.closest("[data-release]");
  if (!form) {
    return;
  }

  event.preventDefault();

  const field = form.querySelector("textarea, input");
  if (field) {
    field.value = "";
  }

  const hint = form.querySelector("[data-release-hint]");
  if (hint) {
    hint.hidden = false;
    window.setTimeout(() => {
      hint.hidden = true;
    }, 2500);
  }
});
