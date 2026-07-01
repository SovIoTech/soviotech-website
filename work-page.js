    // ponytail: edit the `pdf` field per project to point to its exact case-study PDF.
    // If `pdf` is missing the link opens the repo root (README usually embeds the PDF).
    const PROJECTS = [
      { name: 'Active UHF RFID Tag, 866 MHz',          tagline: 'Battery-powered active RFID tag, 866 MHz European band.',           tags: ['RF','PCB','LF tag'],            cat: 'rf',       repo: 'Active-UHF-RFID-Tag-866-MHz' },
      { name: 'AWR2944, 77 GHz Radar Board',           tagline: 'Automotive-grade 4Tx/4Rx radar front-end on TI AWR2944.',           tags: ['77 GHz','Radar','TI'],          cat: 'rf',       repo: 'AWR2944-77-GHz-Radar-Board' },
      { name: 'GaN Power Amplifier, 5-6 GHz, 10 W',    tagline: 'C-band GaN HEMT PA: matching, bias and thermal design.',            tags: ['GaN','PA','C-band'],            cat: 'rf',       repo: 'GaN-Power-Amplifier-5-to-6-GHz-10-W' },
      { name: 'Gysel Power Divider / Combiner',         tagline: 'High-isolation Gysel divider for combined PA stages.',              tags: ['Microwave','Divider'],          cat: 'rf',       repo: 'Gysel-Power-Divider-Combiner' },
      { name: 'K-Band Radar Module, 24 GHz',           tagline: 'Compact 24 GHz CW / FMCW radar module for short-range sensing.',    tags: ['24 GHz','FMCW','Radar'],        cat: 'rf',       repo: 'K-Band-Radar-Module-24-GHz' },
      { name: 'RF Switch Board',                        tagline: 'Multi-port RF switch board for test automation and PA banks.',      tags: ['RF','Switch','Test'],           cat: 'rf',       repo: 'RF-Switch-Board' },
      { name: 'S-Band Power Amplifier, 2.7 GHz',       tagline: 'S-band PA targeting radar / sat-comm pulsed operation.',            tags: ['S-band','PA'],                  cat: 'rf',       repo: 'S-Band-Power-Amplifier-2.7-GHz' },
      { name: 'UWB Receiver Module',                    tagline: 'Ultra-wideband receiver front-end for ranging / positioning.',      tags: ['UWB','Receiver'],               cat: 'rf',       repo: 'UWB-Receiver-Module' },

      { name: 'Air-Cam Firmware',                       tagline: 'ESP32-S3 + SIM7670G LTE camera firmware, MQTT chunked transport.',  tags: ['ESP32-S3','LTE','MQTT'],        cat: 'embedded', repo: 'Air-Cam-Firmware-Portfolio' },
      { name: 'Pixhawk Flight Controller',              tagline: 'Custom flight-controller PCB based on Pixhawk reference.',          tags: ['Pixhawk','PCB','Flight'],       cat: 'embedded', repo: 'Pixhawk-Flight-Controller-Board' },
      { name: 'Secure Element Bring-Up',                tagline: 'Secure-element provisioning and crypto API bring-up.',              tags: ['Security','Crypto','HW'],       cat: 'embedded', repo: 'Secure-Element-Bring-Up' },
      { name: 'STM32G4 Bare-Metal DSP',                 tagline: 'Bare-metal real-time DSP pipeline on STM32G4.',                     tags: ['STM32','DSP','Bare-metal'],     cat: 'embedded', repo: 'STM32G4-Bare-Metal-DSP' },
      { name: 'STM32U5 OCTOSPI LCD Bring-Up',           tagline: 'OCTOSPI display bring-up and framebuffer on STM32U5.',              tags: ['STM32U5','OCTOSPI','Display'],  cat: 'embedded', repo: 'STM32U5-OCTOSPI-LCD-Bring-Up' },
      { name: 'Vending Firmware Suite',                 tagline: 'Vending-machine firmware: payments, inventory, telemetry.',         tags: ['Vending','Firmware'],           cat: 'embedded', repo: 'Vending-Firmware-Suite' },
      { name: 'Dual-Coil Vape Platform',                tagline: 'Dual-coil heating control with safety lockout firmware.',           tags: ['Power','Control'],              cat: 'embedded', repo: 'Dual-Coil-Vape-Platform' },
      { name: 'Sujood Counter',                         tagline: 'Low-power wearable that detects and counts sujood during prayer.',  tags: ['Wearable','IMU','BLE'],         cat: 'embedded', repo: 'Sujood-Counter' },

      { name: 'EnerCo, HVAC Efficiency',               tagline: 'Multi-tenant SaaS for chiller telemetry and live EER.',             tags: ['AWS IoT','SaaS','HVAC'],        cat: 'iot',      repo: 'EnerCo-HVAC-Efficiency-Platform' },
      { name: 'HVAC Performance Dashboard',             tagline: 'Operator dashboard for fleet-wide HVAC performance.',               tags: ['Dashboard','Live Data'],        cat: 'iot',      repo: 'HVAC-Performance-Dashboard' },
      { name: 'Marketplace Vending Platform',           tagline: 'Operator marketplace for smart vending fleets.',                    tags: ['IoT','Marketplace','Stripe'],   cat: 'iot',      repo: 'Marketplace-Vending-Platform' },
      { name: 'Delta PLC Modbus Supervisor',            tagline: 'Modbus supervisor for Delta PLC stacks with remote control.',       tags: ['Modbus','PLC','SCADA'],         cat: 'iot',      repo: 'Delta-PLC-Modbus-Supervisor' },
      { name: 'Autogrow Hydroponics Controller',        tagline: 'Hydroponics controller, pH, EC, dosing pumps, telemetry.',         tags: ['Hydroponics','Sensors'],        cat: 'iot',      repo: 'Autogrow-Hydroponics-Controller' },
      { name: 'Classroom CyberEdu Lab',                 tagline: 'Sealed-room cyber-security teaching lab for K-12 classrooms.',      tags: ['EdTech','Security','Lab'],      cat: 'iot',      repo: 'Classroom-CyberEdu-Lab' },

      { name: 'SkinAI Edge',                            tagline: 'On-device skin-condition classifier with cloud sync.',              tags: ['Edge AI','Vision','Health'],    cat: 'edge',     repo: 'SkinAI-Edge' },
      { name: 'OpenGlass AI Wearable',                  tagline: 'AI-assisted wearable glasses, edge inference + companion app.',     tags: ['Wearable','AI','BLE'],          cat: 'edge',     repo: 'OpenGlass-AI-Wearable' },
      { name: 'Smart Homework Glasses',                 tagline: 'Smart-glasses firmware for assisted homework and accessibility.',   tags: ['Wearable','Firmware','AI'],     cat: 'edge',     repo: 'Smart-Homework-Glasses-Firmware' },
      { name: 'VIO Wrist Capture Unit',                 tagline: 'Wrist-worn visual-inertial capture unit, BLE + on-board storage.',  tags: ['Wearable','VIO','BLE'],         cat: 'edge',     repo: 'VIO-Wrist-Capture-Unit' },
    ];

    const ORG = 'https://github.com/SovIoTech';

    const PDF_FILE = 'CASE_STUDY.pdf';
    // jsDelivr serves GitHub-hosted files inline. #toolbar=0 hides Chrome's PDF UI (no download).
    const PDF_VIEW_PARAMS = '#toolbar=0&navpanes=0&statusbar=0&view=FitH';
    const pdfUrl   = repo => `https://cdn.jsdelivr.net/gh/SovIoTech/${repo}@main/${PDF_FILE}${PDF_VIEW_PARAMS}`;
    const repoUrl  = repo => `${ORG}/${repo}`;

    function cardHTML(p) {
      const catLabel = ({ rf: 'RF / Radar', embedded: 'Embedded', iot: 'IoT & Cloud', edge: 'Edge AI' })[p.cat] || '';
      const tagsHTML = p.tags.map(t => `<span>${t}</span>`).join('');
      return `
        <article class="work-card" data-cat="${p.cat}" data-repo="${p.repo}" data-name="${p.name}">
          <div class="work-card__head">
            <span class="work-card__cat">${catLabel}</span>
            <a class="work-card__github" href="${repoUrl(p.repo)}" target="_blank" rel="noopener noreferrer" aria-label="View on GitHub">
              <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>
            </a>
          </div>
          <h3 class="work-card__title">${p.name}</h3>
          <p class="work-card__tagline">${p.tagline}</p>
          <div class="work-card__tags">${tagsHTML}</div>
          <div class="work-card__actions">
            <a class="work-card__btn work-card__btn--ghost" href="${repoUrl(p.repo)}" target="_blank" rel="noopener noreferrer">Repo &rarr;</a>
            <button class="work-card__btn work-card__btn--primary" data-pdf-open>Case study</button>
          </div>
        </article>`;
    }

    document.getElementById('workGrid').innerHTML = PROJECTS.map(cardHTML).join('');

    // -- Pagination, page size = exactly 2 rows, computed from current grid columns --
    let currentFilter = 'all';
    let currentPage = 0;

    const allCards = [...document.querySelectorAll('.work-card')];
    const gridEl   = document.getElementById('workGrid');
    const dotsEl   = document.getElementById('workDots');
    const prevBtn  = document.getElementById('workPrev');
    const nextBtn  = document.getElementById('workNext');
    const pagerEl  = document.getElementById('workPager');

    function pageSize() {
      const cols = getComputedStyle(gridEl).gridTemplateColumns.split(' ').filter(Boolean).length;
      return Math.max(1, cols) * 2;
    }

    function visibleCards() {
      return currentFilter === 'all'
        ? allCards
        : allCards.filter(c => c.dataset.cat === currentFilter);
    }

    function render() {
      const visible = visibleCards();
      const PAGE_SIZE = pageSize();
      const pageCount = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
      if (currentPage >= pageCount) currentPage = pageCount - 1;
      const start = currentPage * PAGE_SIZE;
      const end   = start + PAGE_SIZE;

      allCards.forEach(c => { c.style.display = 'none'; });
      visible.slice(start, end).forEach(c => { c.style.display = ''; });
      // Hide per-card category chip when a specific filter is applied — the filter chip
      // above already tells the user what they're looking at. Reduces redundancy.
      gridEl.classList.toggle('is-filtered', currentFilter !== 'all');

      // Lock the grid's height to the tallest page so partial last pages
      // don't shrink the layout and shove the pager upward under the user's pointer.
      if (gridEl.offsetHeight > (parseInt(gridEl.style.minHeight) || 0)) {
        gridEl.style.minHeight = gridEl.offsetHeight + 'px';
      }

      // Build dots
      dotsEl.innerHTML = '';
      for (let i = 0; i < pageCount; i++) {
        const dot = document.createElement('button');
        dot.className = 'work__pager-dot' + (i === currentPage ? ' is-active' : '');
        dot.setAttribute('aria-label', `Page ${i + 1}`);
        dot.addEventListener('click', () => { currentPage = i; render(); });
        dotsEl.appendChild(dot);
      }
      prevBtn.disabled = currentPage === 0;
      nextBtn.disabled = currentPage >= pageCount - 1;
      pagerEl.style.display = pageCount <= 1 ? 'none' : '';
    }

    function smoothRender() {
      gridEl.classList.add('is-switching');
      setTimeout(() => {
        render();
        // double rAF so the new layout is painted before fading back
        requestAnimationFrame(() => requestAnimationFrame(() => {
          gridEl.classList.remove('is-switching');
        }));
      }, 220);
    }

    prevBtn.addEventListener('click', () => { if (currentPage > 0) { currentPage--; smoothRender(); } });
    nextBtn.addEventListener('click', () => { currentPage++; smoothRender(); });

    document.querySelectorAll('.work__filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.work__filter-btn').forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        currentFilter = btn.dataset.filter;
        currentPage = 0;
        gridEl.style.minHeight = '';   // reset lock so new category retunes
        smoothRender();
      });
    });

    render();

    let resizeT;
    window.addEventListener('resize', () => {
      clearTimeout(resizeT);
      resizeT = setTimeout(() => {
        gridEl.style.minHeight = '';   // viewport changed, recompute height lock
        render();
      }, 120);
    });

    // -- PDF modal --
    const modal     = document.getElementById('pdfModal');
    const frame     = document.getElementById('pdfModalFrame');
    const titleEl   = document.getElementById('pdfModalTitle');
    const repoBtn   = document.getElementById('pdfModalRepo');

    const isMobileViewer = window.matchMedia('(max-width: 820px)').matches;
    function openPdf(repo, name) {
      // Mobile browsers can't reliably render PDFs in iframes, open in a new tab instead.
      if (isMobileViewer) {
        window.open(pdfUrl(repo), '_blank', 'noopener,noreferrer');
        return;
      }
      titleEl.textContent = name;
      frame.src = pdfUrl(repo);
      repoBtn.href = repoUrl(repo);
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      setTimeout(() => document.querySelector('.pdf-modal__close').focus(), 50);
    }
    function closePdf() {
      modal.setAttribute('aria-hidden', 'true');
      frame.src = 'about:blank';
      document.body.style.overflow = '';
    }
    document.addEventListener('click', e => {
      const openBtn = e.target.closest('[data-pdf-open]');
      if (openBtn) {
        const card = openBtn.closest('.work-card');
        openPdf(card.dataset.repo, card.dataset.name);
        return;
      }
      if (e.target.closest('[data-close]')) closePdf();
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && modal.getAttribute('aria-hidden') === 'false') closePdf();
    });
