import './style.css';
import confetti from 'canvas-confetti';

// ==========================================
// 1. WEB AUDIO SYNTHESIZER (MICRO-FEEDBACK)
// ==========================================
class SoundFX {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  private getContext(): AudioContext | null {
    if (!this.enabled) return null;
    try {
      if (!this.ctx && typeof window !== 'undefined') {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        this.ctx = new AudioCtx();
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      return this.ctx;
    } catch {
      return null;
    }
  }

  playBubble(pitch = 440) {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(pitch, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(pitch * 1.5, ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } catch {
      // Audio error ignored
    }
  }

  playSwap() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'triangle';
      osc2.type = 'sine';

      osc1.frequency.setValueAtTime(320, ctx.currentTime);
      osc1.frequency.exponentialRampToValueAtTime(540, ctx.currentTime + 0.12);

      osc2.frequency.setValueAtTime(220, ctx.currentTime);
      osc2.frequency.exponentialRampToValueAtTime(380, ctx.currentTime + 0.15);

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.16);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start();
      osc2.start();
      osc1.stop(ctx.currentTime + 0.16);
      osc2.stop(ctx.currentTime + 0.16);
    } catch {
      // Audio error ignored
    }
  }

  playSuccess() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);

        gain.gain.setValueAtTime(0.12, ctx.currentTime + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.08 + 0.25);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + idx * 0.08);
        osc.stop(ctx.currentTime + idx * 0.08 + 0.25);
      });
    } catch {
      // Audio error ignored
    }
  }

  playWarning() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(260, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(180, ctx.currentTime + 0.15);

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.16);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.16);
    } catch {
      // Audio error ignored
    }
  }
}

const soundFX = new SoundFX();

// ==========================================
// 2. GLOBAL STATE & NAVIGATION
// ==========================================
let currentScreen = 1;
const visitedScreens = new Set<number>([1]);

function navigateTo(screenId: number) {
  if (screenId < 1 || screenId > 6) return;

  currentScreen = screenId;
  visitedScreens.add(screenId);

  // Update DOM screens
  document.querySelectorAll<HTMLElement>('.screen-view').forEach((section) => {
    section.classList.remove('active');
  });

  const targetSection = document.getElementById(`screen-${screenId}`);
  if (targetSection) {
    targetSection.classList.add('active');
  }

  // Update Navbar indicators
  document.querySelectorAll<HTMLButtonElement>('.nav-screen-btn').forEach((btn) => {
    const target = Number(btn.getAttribute('data-nav-target'));
    const indicator = btn.querySelector('.nav-active-indicator');
    if (target === screenId) {
      btn.classList.remove('text-slate-300');
      btn.classList.add('text-sky-400', 'font-semibold');
      indicator?.classList.remove('hidden');
    } else {
      btn.classList.remove('text-sky-400', 'font-semibold');
      btn.classList.add('text-slate-300');
      indicator?.classList.add('hidden');
    }
  });

  // Update Menu badges
  updateMenuBadges();

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updateMenuBadges() {
  const completedCount = [3, 4, 5, 6].filter((id) => visitedScreens.has(id)).length;
  const progressPercent = Math.round((completedCount / 4) * 100);

  // Top bar
  const topProgressBar = document.getElementById('top-progress-bar');
  const topProgressText = document.getElementById('top-progress-text');
  if (topProgressBar) topProgressBar.style.width = `${progressPercent}%`;
  if (topProgressText) topProgressText.textContent = `${progressPercent}%`;

  // Menu summary
  const menuLabel = document.getElementById('menu-completed-label');
  const menuCircle = document.getElementById('menu-completed-circle');
  if (menuLabel) menuLabel.textContent = `${completedCount} dari 4 Topik Selesai`;
  if (menuCircle) menuCircle.textContent = `${progressPercent}%`;

  // Badges on cards
  [3, 4, 5, 6].forEach((id) => {
    const badge = document.getElementById(`badge-screen-${id}`);
    if (!badge) return;
    if (visitedScreens.has(id)) {
      badge.className = 'menu-status-badge text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-800/70 text-emerald-400';
      badge.innerHTML = '<span class="inline-flex items-center gap-1">✔ Sudah Dikunjungi</span>';
    } else {
      badge.className = 'menu-status-badge text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800/50 border border-slate-700/40 text-slate-500';
      badge.textContent = 'Belum Dimulai';
    }
  });
}

// Reset entire module
function resetAll() {
  currentScreen = 1;
  visitedScreens.clear();
  visitedScreens.add(1);
  navigateTo(1);
  resetSimulation();
  resetPass1Demo();
  resetQuizState();
  soundFX.playBubble(350);
}

// ==========================================
// 3. LAYAR 1: HERO ANIMATED BAR PREVIEW
// ==========================================
let heroArray = [42, 18, 75, 29, 63, 10];
let heroCompare: [number, number] | null = null;
let heroTimer: NodeJS.Timeout | null = null;

function renderHeroBars() {
  const container = document.getElementById('hero-bars-container');
  if (!container) return;

  container.innerHTML = heroArray
    .map((val, idx) => {
      const isComparing = heroCompare && (heroCompare[0] === idx || heroCompare[1] === idx);
      const heightPercent = Math.max(18, (val / 80) * 100);

      return `
      <div class="flex-1 max-w-[54px] flex flex-col items-center gap-2 group">
        <span class="text-xs font-mono font-semibold transition-colors duration-200 ${
          isComparing ? 'text-amber-400 scale-110 font-bold' : 'text-slate-300'
        }">${val}</span>
        <div style="height: ${heightPercent}%" class="w-full rounded-t-lg transition-all duration-300 flex items-start justify-center pt-1.5 ${
          isComparing
            ? 'bg-gradient-to-t from-amber-600 to-amber-400 shadow-lg shadow-amber-500/30 scale-105 ring-2 ring-amber-300'
            : 'bg-gradient-to-t from-blue-700 to-sky-500'
        }">
          <span class="w-1.5 h-1.5 rounded-full bg-white/50"></span>
        </div>
      </div>
    `;
    })
    .join('');
}

function startHeroDemo() {
  if (heroTimer) clearTimeout(heroTimer);
  heroArray = [42, 18, 75, 29, 63, 10];
  heroCompare = null;
  renderHeroBars();

  let i = 0;
  let j = 0;

  function step() {
    const n = heroArray.length;
    if (i < n - 1) {
      if (j < n - i - 1) {
        heroCompare = [j, j + 1];
        const status = document.getElementById('hero-status-text');
        if (status) status.textContent = `Membandingkan [${j}] & [${j + 1}] (${heroArray[j]} vs ${heroArray[j + 1]})`;

        if (heroArray[j] > heroArray[j + 1]) {
          const temp = heroArray[j];
          heroArray[j] = heroArray[j + 1];
          heroArray[j + 1] = temp;
        }
        renderHeroBars();
        j++;
      } else {
        j = 0;
        i++;
      }
      heroTimer = setTimeout(step, 900);
    } else {
      const status = document.getElementById('hero-status-text');
      if (status) status.textContent = 'Semua elemen telah terurut! Mengulang otomatis...';
      heroCompare = null;
      renderHeroBars();
      heroTimer = setTimeout(startHeroDemo, 2500);
    }
  }

  heroTimer = setTimeout(step, 1000);
}

// ==========================================
// 4. LAYAR 4: KONSEP & PASS 1 ANIMATOR
// ==========================================
interface DemoStep {
  array: number[];
  comparing: [number, number] | null;
  action: 'compare' | 'swap' | 'keep' | 'pass_done';
  description: string;
  codeSnippet: string;
  sortedIndices: number[];
}

const pass1Steps: DemoStep[] = [
  {
    array: [5, 2, 8, 1, 9],
    comparing: null,
    action: 'compare',
    description: 'Kondisi Awal Larik: Data belum terurut [5, 2, 8, 1, 9]. Putaran 1 (Pass 1) siap dimulai dari indeks 0.',
    codeSnippet: '// Mulai Pass 1: for (int j = 0; j < n - 1; j++)',
    sortedIndices: [],
  },
  {
    array: [5, 2, 8, 1, 9],
    comparing: [0, 1],
    action: 'compare',
    description: 'Langkah 1: Bandingkan indeks 0 (5) dan indeks 1 (2). Apakah 5 > 2? Ya! Syarat penukaran terpenuhi.',
    codeSnippet: 'if (A[0] > A[1]) { /* 5 > 2 -> TRUE */ }',
    sortedIndices: [],
  },
  {
    array: [2, 5, 8, 1, 9],
    comparing: [0, 1],
    action: 'swap',
    description: 'Pertukaran (Swap): Posisi 5 dan 2 ditukar. Larik sekarang menjadi [2, 5, 8, 1, 9].',
    codeSnippet: 'swap(A[0], A[1]); // Nilai 5 berpindah ke kanan',
    sortedIndices: [],
  },
  {
    array: [2, 5, 8, 1, 9],
    comparing: [1, 2],
    action: 'compare',
    description: 'Langkah 2: Bandingkan indeks 1 (5) dan indeks 2 (8). Apakah 5 > 8? Tidak. Tidak ada pertukaran.',
    codeSnippet: 'if (A[1] > A[2]) { /* 5 > 8 -> FALSE */ }',
    sortedIndices: [],
  },
  {
    array: [2, 5, 8, 1, 9],
    comparing: [1, 2],
    action: 'keep',
    description: 'Tetap: 5 <= 8 sehingga posisi keduanya tetap terjaga dalam urutan menaik.',
    codeSnippet: '// Tidak ada swap. Lanjut ke indeks berikutnya.',
    sortedIndices: [],
  },
  {
    array: [2, 5, 8, 1, 9],
    comparing: [2, 3],
    action: 'compare',
    description: 'Langkah 3: Bandingkan indeks 2 (8) dan indeks 3 (1). Apakah 8 > 1? Ya! Lakukan penukaran.',
    codeSnippet: 'if (A[2] > A[3]) { /* 8 > 1 -> TRUE */ }',
    sortedIndices: [],
  },
  {
    array: [2, 5, 1, 8, 9],
    comparing: [2, 3],
    action: 'swap',
    description: 'Pertukaran (Swap): Nilai 8 dan 1 ditukar. Larik kini menjadi [2, 5, 1, 8, 9].',
    codeSnippet: 'swap(A[2], A[3]); // Nilai 8 terus mengapung ke kanan',
    sortedIndices: [],
  },
  {
    array: [2, 5, 1, 8, 9],
    comparing: [3, 4],
    action: 'compare',
    description: 'Langkah 4: Bandingkan indeks 3 (8) dan indeks 4 (9). Apakah 8 > 9? Tidak. Nilai 9 sudah paling besar.',
    codeSnippet: 'if (A[3] > A[4]) { /* 8 > 9 -> FALSE */ }',
    sortedIndices: [],
  },
  {
    array: [2, 5, 1, 8, 9],
    comparing: null,
    action: 'pass_done',
    description: 'Putaran 1 Selesai! Elemen terbesar (9) telah "mengapung" ke posisi paling akhir (indeks 4). Elemen ini sekarang terkunci.',
    codeSnippet: '// Elemen A[4] = 9 resmi menempati posisi akhirnya!',
    sortedIndices: [4],
  },
];

let demoStepIdx = 0;
let demoIsPlaying = false;
let demoSpeed = 1200; // ms
let demoTimer: NodeJS.Timeout | null = null;

function renderDemoBars() {
  const container = document.getElementById('demo-bars-container');
  if (!container) return;

  const step = pass1Steps[demoStepIdx];

  container.innerHTML = step.array
    .map((val, idx) => {
      const isComparing = step.comparing && (step.comparing[0] === idx || step.comparing[1] === idx);
      const isSwapped = isComparing && step.action === 'swap';
      const isSorted = step.sortedIndices.includes(idx);
      const heightPercent = Math.max(22, (val / 10) * 100);

      let barClass = 'bg-gradient-to-t from-blue-700 via-sky-600 to-sky-400 opacity-90';
      if (isSwapped) {
        barClass = 'bg-gradient-to-t from-rose-700 to-rose-400 shadow-xl shadow-rose-500/30 ring-2 ring-rose-300 animate-pulse';
      } else if (isComparing) {
        barClass = 'bg-gradient-to-t from-amber-600 to-amber-400 shadow-xl shadow-amber-500/30 ring-2 ring-amber-300';
      } else if (isSorted) {
        barClass = 'bg-gradient-to-t from-emerald-600 to-emerald-400 shadow-lg shadow-emerald-500/20 ring-1 ring-emerald-300';
      }

      return `
      <div class="flex-1 max-w-[70px] flex flex-col items-center gap-2 z-10">
        <span class="text-sm sm:text-base font-mono font-bold transition-all duration-300 ${
          isComparing ? 'text-amber-300 scale-125' : isSorted ? 'text-emerald-400' : 'text-slate-200'
        }">${val}</span>
        <div style="height: ${heightPercent}%" class="w-full rounded-t-xl transition-all duration-300 flex items-start justify-center pt-2 relative ${barClass}">
          ${isSorted ? '<svg class="w-4 h-4 text-emerald-100" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>' : ''}
        </div>
        <div class="flex flex-col items-center">
          <span class="text-xs font-mono text-slate-400">[${idx}]</span>
          ${isComparing ? '<span class="text-[10px] text-amber-400 font-bold">aktif</span>' : ''}
          ${isSorted ? '<span class="text-[10px] text-emerald-400 font-bold">kunci</span>' : ''}
        </div>
      </div>
    `;
    })
    .join('');

  // Update texts
  const counter = document.getElementById('demo-step-counter');
  if (counter) counter.textContent = `Langkah ${demoStepIdx} dari ${pass1Steps.length - 1}`;

  const badge = document.getElementById('demo-action-badge');
  if (badge) {
    if (step.action === 'swap') {
      badge.className = 'text-xs font-mono px-3 py-1 rounded-full border border-rose-800 bg-rose-950/60 text-rose-400';
      badge.textContent = '● PERTUKARAN (SWAP)';
    } else if (step.action === 'keep') {
      badge.className = 'text-xs font-mono px-3 py-1 rounded-full border border-emerald-800 bg-emerald-950/60 text-emerald-400';
      badge.textContent = '✔ URUTAN TEPAT';
    } else if (step.action === 'compare') {
      badge.className = 'text-xs font-mono px-3 py-1 rounded-full border border-amber-800 bg-amber-950/60 text-amber-400';
      badge.textContent = '▲ MEMBANDINGKAN';
    } else if (step.action === 'pass_done') {
      badge.className = 'text-xs font-mono px-3 py-1 rounded-full border border-sky-800 bg-sky-950/60 text-sky-300';
      badge.textContent = '★ PASS 1 SELESAI';
    }
  }

  const exp = document.getElementById('demo-explanation-text');
  if (exp) exp.textContent = step.description;

  const code = document.getElementById('demo-code-text');
  if (code) code.textContent = step.codeSnippet;

  renderDemoDots();
}

function renderDemoDots() {
  const container = document.getElementById('demo-dots-container');
  if (!container) return;

  container.innerHTML = pass1Steps
    .map(
      (_, idx) => `
    <button data-dot-idx="${idx}" class="demo-dot w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${
        idx === demoStepIdx
          ? 'bg-sky-400 scale-125 ring-2 ring-sky-400/30'
          : idx < demoStepIdx
          ? 'bg-sky-800'
          : 'bg-slate-800'
      }" title="Lompat ke langkah ${idx}"></button>
  `
    )
    .join('');

  container.querySelectorAll<HTMLButtonElement>('.demo-dot').forEach((btn) => {
    btn.onclick = () => {
      pausePass1Demo();
      demoStepIdx = Number(btn.getAttribute('data-dot-idx'));
      renderDemoBars();
    };
  });
}

function playPass1Demo() {
  demoIsPlaying = true;
  updateDemoPlayButton();

  function loop() {
    if (demoStepIdx < pass1Steps.length - 1) {
      demoTimer = setTimeout(() => {
        demoStepIdx++;
        const current = pass1Steps[demoStepIdx];
        if (current.action === 'swap') soundFX.playSwap();
        else if (current.action === 'pass_done') soundFX.playSuccess();
        else soundFX.playBubble(420);

        renderDemoBars();
        if (demoIsPlaying) loop();
      }, demoSpeed);
    } else {
      pausePass1Demo();
    }
  }

  loop();
}

function pausePass1Demo() {
  demoIsPlaying = false;
  if (demoTimer) clearTimeout(demoTimer);
  updateDemoPlayButton();
}

function updateDemoPlayButton() {
  const label = document.getElementById('demo-play-label');
  const icon = document.getElementById('demo-play-icon');
  const btn = document.getElementById('demo-play-btn');

  if (demoIsPlaying) {
    if (label) label.textContent = 'Jeda';
    if (icon) icon.innerHTML = '<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>';
    if (btn) {
      btn.classList.remove('bg-sky-500', 'hover:bg-sky-400', 'text-white');
      btn.classList.add('bg-amber-500', 'hover:bg-amber-400', 'text-slate-950');
    }
  } else {
    if (label) label.textContent = 'Putar Animasi';
    if (icon) icon.innerHTML = '<path d="M8 5v14l11-7z"/>';
    if (btn) {
      btn.classList.remove('bg-amber-500', 'hover:bg-amber-400', 'text-slate-950');
      btn.classList.add('bg-sky-500', 'hover:bg-sky-400', 'text-white');
    }
  }
}

function resetPass1Demo() {
  pausePass1Demo();
  demoStepIdx = 0;
  renderDemoBars();
  soundFX.playBubble(360);
}

// ==========================================
// 5. LAYAR 5: SIMULASI INTERAKTIF (STUDENT)
// ==========================================
let simArray = [5, 2, 8, 1, 9];
let simSelectedIdx: number | null = null;
let simLastCompared: [number, number] | null = null;
let simStepCount = 0;
let simSwapCount = 0;
let simHintPair: [number, number] | null = null;

function checkIsSorted(arr: number[]): boolean {
  for (let i = 0; i < arr.length - 1; i++) {
    if (arr[i] > arr[i + 1]) return false;
  }
  return true;
}

function renderSimBars() {
  const container = document.getElementById('sim-bars-container');
  if (!container) return;

  const isSorted = checkIsSorted(simArray);
  const maxVal = Math.max(...simArray, 10);

  container.innerHTML = simArray
    .map((val, idx) => {
      const isSelected = simSelectedIdx === idx;
      const isHint = simHintPair && (simHintPair[0] === idx || simHintPair[1] === idx);
      const isLast = simLastCompared && (simLastCompared[0] === idx || simLastCompared[1] === idx);
      const heightPercent = Math.max(25, (val / maxVal) * 100);

      let barClass = 'bg-gradient-to-t from-slate-700 via-blue-800 to-sky-600 group-hover:from-blue-600 group-hover:to-sky-400 group-hover:-translate-y-1';
      if (isSorted) {
        barClass = 'bg-gradient-to-t from-emerald-700 via-emerald-600 to-emerald-400 shadow-lg shadow-emerald-500/25 ring-2 ring-emerald-300';
      } else if (isSelected) {
        barClass = 'bg-gradient-to-t from-sky-600 to-cyan-400 shadow-xl shadow-cyan-500/40 ring-4 ring-cyan-300 -translate-y-2';
      } else if (isHint) {
        barClass = 'bg-gradient-to-t from-amber-600 to-amber-400 shadow-lg shadow-amber-500/30 ring-2 ring-amber-300 animate-pulse';
      } else if (isLast) {
        barClass = 'bg-gradient-to-t from-indigo-700 to-blue-500 ring-1 ring-blue-400/50';
      }

      return `
      <div data-sim-idx="${idx}" class="sim-bar-item flex-1 max-w-[90px] flex flex-col items-center gap-2.5 z-10 cursor-pointer select-none group">
        <span class="text-base sm:text-lg font-mono font-bold transition-transform duration-200 ${
          isSelected
            ? 'text-sky-300 scale-125'
            : isHint
            ? 'text-amber-300 scale-110'
            : isSorted
            ? 'text-emerald-400'
            : 'text-white group-hover:text-sky-300'
        }">${val}</span>

        <div style="height: ${heightPercent}%" class="w-full rounded-t-xl transition-all duration-300 flex items-start justify-center pt-2 relative ${barClass}">
          ${isSorted ? '<svg class="w-5 h-5 text-emerald-100" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>' : '<span class="w-2 h-2 rounded-full bg-white/40"></span>'}
        </div>

        <div class="text-center">
          <span class="text-xs font-mono text-slate-400 block">[${idx}]</span>
          ${isSelected ? '<span class="text-[10px] text-cyan-300 font-bold block">Dipilih</span>' : ''}
          ${isHint && !isSelected ? '<span class="text-[10px] text-amber-400 font-bold block">Bantuan</span>' : ''}
        </div>
      </div>
    `;
    })
    .join('');

  // Attach click handlers to bars
  container.querySelectorAll<HTMLElement>('.sim-bar-item').forEach((item) => {
    item.onclick = () => {
      const idx = Number(item.getAttribute('data-sim-idx'));
      handleSimBarClick(idx);
    };
  });

  // Update counters and displays
  const arrayDisplay = document.getElementById('sim-array-display');
  if (arrayDisplay) arrayDisplay.textContent = `[${simArray.join(', ')}]`;

  const stepCounter = document.getElementById('sim-step-counter');
  if (stepCounter) stepCounter.textContent = `${simStepCount}`;

  const swapCounter = document.getElementById('sim-swap-counter');
  if (swapCounter) swapCounter.textContent = `${simSwapCount}`;

  const statusLabel = document.getElementById('sim-status-label');
  const statusIcon = document.getElementById('sim-status-icon');
  const proceedBtn = document.getElementById('sim-proceed-quiz-btn') as HTMLButtonElement | null;
  const proceedHint = document.getElementById('sim-proceed-hint');

  if (isSorted) {
    if (statusLabel) {
      statusLabel.textContent = '✔ Terurut Sempurna';
      statusLabel.className = 'text-xs font-bold text-emerald-400';
    }
    if (statusIcon) {
      statusIcon.innerHTML = '<svg class="w-6 h-6 text-emerald-400 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138z"/></svg>';
    }
    if (proceedBtn) {
      proceedBtn.disabled = false;
      proceedBtn.className = 'w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 text-sm font-semibold rounded-xl bg-gradient-to-r from-emerald-500 via-sky-500 to-blue-600 hover:from-emerald-400 hover:to-blue-500 text-white shadow-xl shadow-emerald-500/25 ring-2 ring-emerald-300 cursor-pointer animate-pulse transition-all duration-300';
    }
    if (proceedHint) {
      proceedHint.textContent = '✔ Larik terurut! Anda berhak melanjutkan ke evaluasi kuis.';
      proceedHint.className = 'text-[11px] text-emerald-400 font-medium';
    }
  } else {
    if (statusLabel) {
      statusLabel.textContent = '▲ Belum Terurut';
      statusLabel.className = 'text-xs font-bold text-amber-400';
    }
    if (statusIcon) {
      statusIcon.innerHTML = '<svg class="w-5 h-5 text-amber-400/70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>';
    }
    if (proceedBtn) {
      proceedBtn.disabled = true;
      proceedBtn.className = 'w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 text-sm font-semibold rounded-xl bg-slate-800/80 text-slate-500 border border-slate-700/60 cursor-not-allowed opacity-60 transition-all duration-300';
    }
    if (proceedHint) {
      proceedHint.textContent = '* Tombol kuis aktif setelah seluruh deretan angka terurut menaik (ascending).';
      proceedHint.className = 'text-[11px] text-amber-400/90 font-medium';
    }
  }
}

function setSimFeedback(type: 'info' | 'success' | 'warning' | 'celebrate', message: string) {
  const box = document.getElementById('sim-feedback-box');
  const icon = document.getElementById('sim-feedback-icon');
  const text = document.getElementById('sim-feedback-text');

  if (!box || !icon || !text) return;

  text.textContent = message;

  if (type === 'celebrate') {
    box.className = 'mt-6 p-4 rounded-xl border border-emerald-700 bg-emerald-950/70 text-emerald-100 flex items-start gap-3 transition-colors';
    icon.innerHTML = '<svg class="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/></svg>';
  } else if (type === 'warning') {
    box.className = 'mt-6 p-4 rounded-xl border border-amber-800 bg-amber-950/60 text-amber-200 flex items-start gap-3 transition-colors';
    icon.innerHTML = '<svg class="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>';
  } else if (type === 'success') {
    box.className = 'mt-6 p-4 rounded-xl border border-sky-800 bg-sky-950/60 text-sky-200 flex items-start gap-3 transition-colors';
    icon.innerHTML = '<svg class="w-5 h-5 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>';
  } else {
    box.className = 'mt-6 p-4 rounded-xl border border-slate-800 bg-slate-950/80 text-slate-300 flex items-start gap-3 transition-colors';
    icon.innerHTML = '<svg class="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>';
  }
}

function handleSimBarClick(idx: number) {
  soundFX.playBubble(440 + idx * 30);
  simHintPair = null;

  if (simSelectedIdx === null) {
    simSelectedIdx = idx;
    setSimFeedback(
      'info',
      `Elemen [${idx}] bernilai ${simArray[idx]} terpilih. Sekarang klik elemen bersebelahan (indeks ${idx > 0 ? idx - 1 : ''} ${idx > 0 && idx < simArray.length - 1 ? 'atau' : ''} ${idx < simArray.length - 1 ? idx + 1 : ''}) untuk membandingkan.`
    );
    renderSimBars();
    return;
  }

  if (simSelectedIdx === idx) {
    simSelectedIdx = null;
    setSimFeedback('info', 'Pemilihan dibatalkan. Klik satu balok angka untuk memulai perbandingan.');
    renderSimBars();
    return;
  }

  const diff = Math.abs(simSelectedIdx - idx);
  if (diff !== 1) {
    soundFX.playWarning();
    setSimFeedback(
      'warning',
      `Aturan Bubble Sort: Anda hanya boleh membandingkan DUA ELEMEN BERSEBELAHAN! Indeks [${simSelectedIdx}] dan [${idx}] terpisah ${diff} posisi. Coba lagi dengan pasangan bersebelahan.`
    );
    simSelectedIdx = idx;
    renderSimBars();
    return;
  }

  // Adjacent pair verified!
  const leftIdx = Math.min(simSelectedIdx, idx);
  const rightIdx = Math.max(simSelectedIdx, idx);
  const leftVal = simArray[leftIdx];
  const rightVal = simArray[rightIdx];

  simLastCompared = [leftIdx, rightIdx];
  simStepCount++;

  if (leftVal > rightVal) {
    soundFX.playSwap();
    simArray[leftIdx] = rightVal;
    simArray[rightIdx] = leftVal;
    simSwapCount++;

    const isNowSorted = checkIsSorted(simArray);
    if (isNowSorted) {
      soundFX.playSuccess();
      try {
        confetti({ particleCount: 90, spread: 75, origin: { y: 0.6 } });
      } catch {
        // confetti fallback
      }
      setSimFeedback(
        'celebrate',
        `Luar biasa! ${leftVal} > ${rightVal} berhasil ditukar. SELURUH ARRAY KINI TERURUT SEMPURNA [${simArray.join(', ')}]! 🎉 Tombol Lanjut ke Kuis sekarang aktif.`
      );
    } else {
      setSimFeedback(
        'success',
        `Tepat! Karena ${leftVal} > ${rightVal}, kedua elemen berhasil ditukar posisinya (${leftVal} berpindah ke kanan). Lanjut periksa pasangan berikutnya!`
      );
    }
  } else {
    soundFX.playBubble(520);
    setSimFeedback(
      'info',
      `Benar! Nilai ${leftVal} <= ${rightVal}, urutannya sudah menaik (ascending) sehingga tidak perlu ditukar. Teruskan ke pasangan lain!`
    );
  }

  simSelectedIdx = null;
  renderSimBars();
}

function resetSimulation() {
  soundFX.playBubble(360);
  simArray = [5, 2, 8, 1, 9];
  simSelectedIdx = null;
  simLastCompared = null;
  simStepCount = 0;
  simSwapCount = 0;
  simHintPair = null;
  setSimFeedback('info', 'Larik direset ke contoh awal: [5, 2, 8, 1, 9]. Silakan mulai menukar elemen bersebelahan.');
  renderSimBars();
}

function randomizeSimArray() {
  soundFX.playBubble(420);
  const newArr: number[] = [];
  while (newArr.length < 5) {
    const num = Math.floor(Math.random() * 20) + 1;
    if (!newArr.includes(num)) newArr.push(num);
  }
  simArray = newArr;
  simSelectedIdx = null;
  simLastCompared = null;
  simStepCount = 0;
  simSwapCount = 0;
  simHintPair = null;
  setSimFeedback('info', `Data baru berhasil diacak: [${newArr.join(', ')}]. Urutkan larik ini secara ascending!`);
  renderSimBars();
}

function provideSimHint() {
  soundFX.playBubble(480);
  if (checkIsSorted(simArray)) {
    setSimFeedback('celebrate', 'Larik sudah terurut sempurna! Tidak ada lagi elemen yang perlu ditukar. Anda siap lanjut ke Kuis.');
    return;
  }

  for (let i = 0; i < simArray.length - 1; i++) {
    if (simArray[i] > simArray[i + 1]) {
      simHintPair = [i, i + 1];
      setSimFeedback(
        'warning',
        `💡 Bantuan: Perhatikan indeks [${i}] bernilai ${simArray[i]} dan [${i + 1}] bernilai ${simArray[i + 1]}. Karena ${simArray[i]} > ${simArray[i + 1]}, klik kedua balok ini secara berurutan untuk menukarnya!`
      );
      renderSimBars();
      return;
    }
  }
}

// ==========================================
// 6. LAYAR 6: KUIS, UMPAN BALIK, & ASSESSMENT
// ==========================================
interface QuizQuestion {
  id: number;
  topic: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const quizQuestions: QuizQuestion[] = [
  {
    id: 1,
    topic: 'Langkah Dasar Algoritma',
    question:
      'Kondisi manakah yang mengharuskan algoritma Bubble Sort melakukan penukaran (swap) antara dua elemen bersebelahan A[j] dan A[j+1] pada pengurutan menaik (ascending)?',
    options: [
      'A. Ketika A[j] < A[j+1]',
      'B. Ketika A[j] > A[j+1]',
      'C. Ketika A[j] == A[j+1]',
      'D. Ketika A[j] bernilai ganjil',
    ],
    correctIndex: 1,
    explanation:
      'Benar! Pada pengurutan ascending (menaik), elemen yang lebih besar di sebelah kiri harus digeser ke kanan. Oleh karena itu, jika A[j] > A[j+1], dilakukan operasi penukaran (swap).',
  },
  {
    id: 2,
    topic: 'Hasil Akhir Putaran Pertama (Pass 1)',
    question:
      'Diberikan larik awal [5, 2, 8, 1, 9]. Bagaimanakah susunan larik setelah seluruh perbandingan pada Putaran Pertama (Pass 1) selesai dieksekusi?',
    options: [
      'A. [1, 2, 5, 8, 9]',
      'B. [2, 5, 1, 8, 9]',
      'C. [2, 1, 5, 8, 9]',
      'D. [5, 2, 1, 8, 9]',
    ],
    correctIndex: 1,
    explanation:
      'Benar! Langkah Pass 1: (5,2) ditukar jadi [2,5,8,1,9] → (5,8) tetap → (8,1) ditukar jadi [2,5,1,8,9] → (8,9) tetap. Elemen terbesar (9) telah mencapai posisi akhirnya di indeks ke-4.',
  },
  {
    id: 3,
    topic: 'Kompleksitas Waktu Terburuk',
    question:
      'Berapakah kompleksitas waktu terburuk (Worst Case) dari algoritma Bubble Sort dan dalam kondisi data bagaimanakah hal tersebut terjadi?',
    options: [
      'A. O(n) saat data sudah terurut rapi',
      'B. O(n log n) saat data berukuran ganjil',
      'C. O(n²) saat data tersusun terbalik (descending)',
      'D. O(1) saat data berada di memori cache',
    ],
    correctIndex: 2,
    explanation:
      'Benar! Kompleksitas terburuk Bubble Sort adalah kuadratik O(n²), yang terjadi ketika data tersusun dalam urutan terbalik, sehingga memerlukan n*(n-1)/2 perbandingan dan pertukaran penuh.',
  },
  {
    id: 4,
    topic: 'Optimasi & Kasus Terbaik (Best Case)',
    question:
      'Jika algoritma Bubble Sort dimodifikasi dengan flag/indikator boolean (berhenti jika tidak ada penukaran pada suatu putaran), berapakah kompleksitas waktu terbaiknya (Best Case)?',
    options: [
      'A. O(1)',
      'B. O(n)',
      'C. O(n²)',
      'D. O(log n)',
    ],
    correctIndex: 1,
    explanation:
      'Benar! Dengan flag pengecekan, jika larik sudah terurut sejak awal, algoritma hanya melakukan n-1 perbandingan pada pass pertama tanpa ada pertukaran, lalu langsung berhenti. Kompleksitasnya menjadi linear O(n).',
  },
  {
    id: 5,
    topic: 'Konsep & Filosofi Nama',
    question:
      'Mengapa algoritma pengurutan ini diberi nama "Bubble" (Gelembung) Sort?',
    options: [
      'A. Karena memori dialokasikan dalam gelembung sirkular dinamis',
      'B. Karena elemen bernilai besar secara bertahap "mengapung" ke posisi akhir larik seperti gelembung udara dalam cairan',
      'C. Karena data dipecah menjadi subtree berbentuk lingkaran',
      'D. Karena algoritma ini memiliki sifat non-deterministik',
    ],
    correctIndex: 1,
    explanation:
      'Benar! Dianalogikan seperti gelembung udara yang perlahan naik ke permukaan air: elemen dengan nilai bobot terbesar bergeser selangkah demi selangkah ke posisi indeks akhir pada setiap akhir putaran (pass).',
  },
];

let quizCurrentIdx = 0;
let quizSelectedOpt: number | null = null;
let quizHasChecked = false;
let quizUserAnswers: (number | null)[] = new Array(quizQuestions.length).fill(null);

function renderCurrentQuestion() {
  const q = quizQuestions[quizCurrentIdx];
  const activeNum = document.getElementById('quiz-active-num');
  if (activeNum) activeNum.textContent = `${quizCurrentIdx + 1} / ${quizQuestions.length}`;

  const progressPercent = Math.round(((quizCurrentIdx + 1) / quizQuestions.length) * 100);
  const pBar = document.getElementById('quiz-progress-bar');
  const pText = document.getElementById('quiz-progress-text');
  if (pBar) pBar.style.width = `${progressPercent}%`;
  if (pText) pText.textContent = `${progressPercent}% Selesai`;

  const topicBadge = document.getElementById('quiz-topic-badge');
  if (topicBadge) topicBadge.textContent = `Topik: ${q.topic}`;

  const title = document.getElementById('quiz-question-title');
  if (title) title.textContent = q.question;

  const optContainer = document.getElementById('quiz-options-container');
  if (!optContainer) return;

  optContainer.innerHTML = q.options
    .map((opt, optIdx) => {
      const isSelected = quizSelectedOpt === optIdx;
      const isCorrect = q.correctIndex === optIdx;

      let styles = 'bg-slate-950/70 border-slate-800 hover:border-slate-700 text-slate-200';
      if (quizHasChecked) {
        if (isCorrect) {
          styles = 'bg-emerald-950/70 border-emerald-600 text-emerald-200 font-semibold ring-1 ring-emerald-400/50';
        } else if (isSelected && !isCorrect) {
          styles = 'bg-rose-950/70 border-rose-600 text-rose-200 font-medium ring-1 ring-rose-400/50';
        } else {
          styles = 'bg-slate-950/40 border-slate-800/60 text-slate-500 opacity-60';
        }
      } else if (isSelected) {
        styles = 'bg-sky-950/70 border-sky-500 text-white font-semibold ring-2 ring-sky-400/40';
      }

      return `
      <button data-opt-idx="${optIdx}" ${quizHasChecked ? 'disabled' : ''} class="quiz-opt-btn w-full text-left p-4 rounded-xl border transition-all flex items-start justify-between gap-3 text-sm leading-relaxed cursor-pointer ${styles}">
        <span>${opt}</span>
        ${quizHasChecked && isCorrect ? '<span class="text-emerald-400 font-bold">✔</span>' : ''}
        ${quizHasChecked && isSelected && !isCorrect ? '<span class="text-rose-400 font-bold">✖</span>' : ''}
      </button>
    `;
    })
    .join('');

  optContainer.querySelectorAll<HTMLButtonElement>('.quiz-opt-btn').forEach((btn) => {
    btn.onclick = () => {
      if (quizHasChecked) return;
      soundFX.playBubble(460);
      quizSelectedOpt = Number(btn.getAttribute('data-opt-idx'));
      const checkBtn = document.getElementById('quiz-check-btn') as HTMLButtonElement | null;
      if (checkBtn) checkBtn.disabled = false;
      renderCurrentQuestion();
    };
  });

  const feedbackBox = document.getElementById('quiz-feedback-box');
  const feedbackIcon = document.getElementById('quiz-feedback-icon');
  const feedbackHead = document.getElementById('quiz-feedback-heading');
  const feedbackExp = document.getElementById('quiz-feedback-explanation');
  const checkBtn = document.getElementById('quiz-check-btn') as HTMLButtonElement | null;
  const nextBtn = document.getElementById('quiz-next-btn');
  const nextLabel = document.getElementById('quiz-next-label');
  const instruction = document.getElementById('quiz-instruction-text');

  if (quizHasChecked) {
    if (feedbackBox && feedbackIcon && feedbackHead && feedbackExp) {
      feedbackBox.classList.remove('hidden');
      const isCorrect = quizSelectedOpt === q.correctIndex;
      if (isCorrect) {
        feedbackBox.className = 'p-4 rounded-xl border border-emerald-700 bg-emerald-950/60 text-emerald-100 flex items-start gap-3 text-sm leading-relaxed';
        feedbackIcon.innerHTML = '<span class="text-emerald-400 font-bold text-lg">✔</span>';
        feedbackHead.textContent = 'Tepat Sekali!';
      } else {
        feedbackBox.className = 'p-4 rounded-xl border border-rose-700 bg-rose-950/60 text-rose-100 flex items-start gap-3 text-sm leading-relaxed';
        feedbackIcon.innerHTML = '<span class="text-rose-400 font-bold text-lg">✖</span>';
        feedbackHead.textContent = 'Belum Tepat, Ingat Kembali Konsepnya:';
      }
      feedbackExp.textContent = q.explanation;
    }

    if (checkBtn) checkBtn.classList.add('hidden');
    if (nextBtn) nextBtn.classList.remove('hidden');
    if (nextLabel) {
      nextLabel.textContent = quizCurrentIdx < quizQuestions.length - 1 ? 'Soal Berikutnya' : 'Lihat Hasil Akhir';
    }
    if (instruction) instruction.textContent = 'Periksa umpan balik di atas, lalu lanjutkan ke soal berikutnya.';
  } else {
    if (feedbackBox) feedbackBox.classList.add('hidden');
    if (checkBtn) {
      checkBtn.classList.remove('hidden');
      checkBtn.disabled = quizSelectedOpt === null;
    }
    if (nextBtn) nextBtn.classList.add('hidden');
    if (instruction) {
      instruction.textContent = quizSelectedOpt === null ? 'Pilih satu jawaban di atas, lalu tekan Cek Jawaban.' : 'Jawaban telah dipilih. Tekan tombol Cek Jawaban.';
    }
  }
}

function handleCheckQuizAnswer() {
  if (quizSelectedOpt === null) return;
  quizHasChecked = true;

  const isCorrect = quizSelectedOpt === quizQuestions[quizCurrentIdx].correctIndex;
  if (isCorrect) soundFX.playSuccess();
  else soundFX.playWarning();

  quizUserAnswers[quizCurrentIdx] = quizSelectedOpt;
  renderCurrentQuestion();
}

function handleNextQuizQuestion() {
  if (quizCurrentIdx < quizQuestions.length - 1) {
    quizCurrentIdx++;
    quizSelectedOpt = null;
    quizHasChecked = false;
    soundFX.playBubble(440);
    renderCurrentQuestion();
  } else {
    // Show Final Result
    showQuizResult();
  }
}

function showQuizResult() {
  const activeView = document.getElementById('quiz-active-view');
  const resultView = document.getElementById('quiz-result-view');
  const counterBox = document.getElementById('quiz-question-counter-box');

  if (activeView) activeView.classList.add('hidden');
  if (resultView) resultView.classList.remove('hidden');
  if (counterBox) counterBox.classList.add('hidden');

  const correctCount = quizUserAnswers.reduce<number>((acc, ans, idx) => {
    return ans === quizQuestions[idx].correctIndex ? acc + 1 : acc;
  }, 0);

  const percentage = Math.round((correctCount / quizQuestions.length) * 100);
  const isPassed = percentage >= 80;

  const pText = document.getElementById('result-percentage-text');
  const correctLabel = document.getElementById('result-correct-label');
  const scoreRing = document.getElementById('result-score-ring');
  const glow = document.getElementById('result-glow');
  const badgeContainer = document.getElementById('result-badge-container');
  const title = document.getElementById('result-title');
  const msg = document.getElementById('result-message');
  const actions = document.getElementById('result-actions-container');
  const modalScore = document.getElementById('modal-score-label');

  if (pText) pText.textContent = `${percentage}%`;
  if (correctLabel) correctLabel.textContent = `${correctCount} / ${quizQuestions.length} Benar`;
  if (modalScore) modalScore.textContent = `${percentage}% (${correctCount}/5 Benar)`;

  if (isPassed) {
    soundFX.playSuccess();
    try {
      confetti({ particleCount: 120, spread: 90, origin: { y: 0.5 } });
    } catch {
      // ignore
    }

    if (scoreRing) {
      scoreRing.className = 'w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 flex flex-col items-center justify-center p-2 mb-4 border-emerald-500 bg-emerald-950/40 text-emerald-400 shadow-xl shadow-emerald-500/20 ring-4 ring-emerald-500/20';
    }
    if (glow) glow.className = 'absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full blur-3xl pointer-events-none opacity-20 bg-emerald-500';

    if (badgeContainer) {
      badgeContainer.innerHTML = `
        <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-700 text-emerald-300 text-xs font-semibold">
          <span>🏆 Lencana Penguasaan Bubble Sort (Semester II PTIK)</span>
        </div>
      `;
    }

    if (title) title.textContent = 'Kerja Bagus! Penguasaan Sangat Baik';
    if (msg) {
      msg.textContent =
        'Anda telah menunjukkan pemahaman yang matang mengenai algoritma Bubble Sort, mulai dari mekanisme perbandingan bersebelahan, pergeseran nilai terbesar pada tiap pass, hingga analisis kompleksitas waktu kuadratik.';
    }

    if (actions) {
      actions.innerHTML = `
        <button id="btn-result-finish" class="inline-flex items-center gap-2 px-8 py-3.5 text-sm font-semibold rounded-xl bg-gradient-to-r from-emerald-500 to-sky-500 hover:from-emerald-400 hover:to-sky-400 text-white shadow-xl shadow-emerald-500/25 transition-all cursor-pointer">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138z"/></svg>
          <span>Selesai & Ringkasan Modul</span>
        </button>
        <button id="btn-result-retake" class="inline-flex items-center gap-2 px-5 py-3.5 text-sm font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors cursor-pointer">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
          <span>Uji Kuis Lagi</span>
        </button>
      `;

      document.getElementById('btn-result-finish')!.onclick = () => {
        soundFX.playSuccess();
        const modal = document.getElementById('modal-completion');
        if (modal) modal.classList.remove('hidden');
      };
      document.getElementById('btn-result-retake')!.onclick = () => {
        resetQuizState();
      };
    }
  } else {
    // Score < 80%
    soundFX.playWarning();
    if (scoreRing) {
      scoreRing.className = 'w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 flex flex-col items-center justify-center p-2 mb-4 border-amber-500 bg-amber-950/40 text-amber-400 shadow-xl shadow-amber-500/20';
    }
    if (glow) glow.className = 'absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full blur-3xl pointer-events-none opacity-20 bg-amber-500';

    if (badgeContainer) {
      badgeContainer.innerHTML = `
        <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-950/80 border border-amber-700 text-amber-300 text-xs font-semibold">
          <span>▲ Ambang Kelulusan: Minimal 80% (Perlu Pengulangan)</span>
        </div>
      `;
    }

    if (title) title.textContent = 'Tetap Semangat! Jangan Berkecil Hati';
    if (msg) {
      msg.textContent =
        'Pemahaman algoritma pengurutan memerlukan visualisasi yang berulang. Silakan buka kembali materi konsep untuk memperkuat pemahaman langkah perbandingan dan pertukaran.';
    }

    if (actions) {
      actions.innerHTML = `
        <button id="btn-result-repeat-theory" class="inline-flex items-center gap-2 px-8 py-3.5 text-sm font-semibold rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold shadow-xl shadow-amber-500/25 transition-all cursor-pointer">
          <svg class="w-5 h-5 text-slate-950" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
          <span>Ulangi Materi (Kembali ke Konsep Layar 4)</span>
        </button>
        <button id="btn-result-retake" class="inline-flex items-center gap-2 px-5 py-3.5 text-sm font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors cursor-pointer">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
          <span>Coba Kuis Lagi</span>
        </button>
      `;

      // Returns to Screen 4 (Konsep & Cara Kerja) as explicitly required by prompt
      document.getElementById('btn-result-repeat-theory')!.onclick = () => {
        soundFX.playBubble(420);
        navigateTo(4);
      };
      document.getElementById('btn-result-retake')!.onclick = () => {
        resetQuizState();
      };
    }
  }
}

function resetQuizState() {
  quizCurrentIdx = 0;
  quizSelectedOpt = null;
  quizHasChecked = false;
  quizUserAnswers = new Array(quizQuestions.length).fill(null);

  const activeView = document.getElementById('quiz-active-view');
  const resultView = document.getElementById('quiz-result-view');
  const counterBox = document.getElementById('quiz-question-counter-box');

  if (activeView) activeView.classList.remove('hidden');
  if (resultView) resultView.classList.add('hidden');
  if (counterBox) counterBox.classList.remove('hidden');

  renderCurrentQuestion();
}

// ==========================================
// 7. INITIALIZATION & EVENT LISTENERS
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  // Navigation buttons with data-nav-target
  document.querySelectorAll<HTMLElement>('[data-nav-target]').forEach((el) => {
    el.addEventListener('click', () => {
      const target = Number(el.getAttribute('data-nav-target'));
      soundFX.playBubble(440);
      navigateTo(target);
    });
  });

  // Nav brand button
  const brandBtn = document.getElementById('nav-brand-btn');
  if (brandBtn) {
    brandBtn.onclick = () => {
      soundFX.playBubble(500);
      navigateTo(1);
    };
  }

  // Hero Start button
  const startBtn = document.getElementById('hero-start-btn');
  if (startBtn) {
    startBtn.onclick = () => {
      soundFX.playSuccess();
      navigateTo(2);
    };
  }

  // Hero replay button
  const heroReplay = document.getElementById('hero-replay-btn');
  if (heroReplay) {
    heroReplay.onclick = () => {
      soundFX.playBubble(400);
      startHeroDemo();
    };
  }

  // Audio Toggle Button
  const toggleSoundBtn = document.getElementById('toggle-sound-btn');
  if (toggleSoundBtn) {
    toggleSoundBtn.onclick = () => {
      soundFX.enabled = !soundFX.enabled;
      const iconOn = document.getElementById('icon-sound-on');
      const iconOff = document.getElementById('icon-sound-off');
      if (soundFX.enabled) {
        iconOn?.classList.remove('hidden');
        iconOff?.classList.add('hidden');
        soundFX.playBubble(440);
      } else {
        iconOn?.classList.add('hidden');
        iconOff?.classList.remove('hidden');
      }
    };
  }

  // Reset Module Button
  const resetModuleBtn = document.getElementById('reset-module-btn');
  if (resetModuleBtn) {
    resetModuleBtn.onclick = () => {
      if (window.confirm('Reset seluruh progres dan mulai ulang modul pembelajaran Bubble Sort?')) {
        resetAll();
      }
    };
  }

  // Pass 1 Demo controls
  const demoPlayBtn = document.getElementById('demo-play-btn');
  if (demoPlayBtn) {
    demoPlayBtn.onclick = () => {
      if (demoIsPlaying) pausePass1Demo();
      else playPass1Demo();
    };
  }

  const demoStepBtn = document.getElementById('demo-step-btn');
  if (demoStepBtn) {
    demoStepBtn.onclick = () => {
      pausePass1Demo();
      if (demoStepIdx < pass1Steps.length - 1) {
        demoStepIdx++;
        const current = pass1Steps[demoStepIdx];
        if (current.action === 'swap') soundFX.playSwap();
        else if (current.action === 'pass_done') soundFX.playSuccess();
        else soundFX.playBubble(440);
        renderDemoBars();
      }
    };
  }

  const demoResetBtn = document.getElementById('demo-reset-btn');
  if (demoResetBtn) {
    demoResetBtn.onclick = () => {
      resetPass1Demo();
    };
  }

  // Speed buttons
  const speedSlow = document.getElementById('speed-slow');
  const speedNormal = document.getElementById('speed-normal');
  const speedFast = document.getElementById('speed-fast');

  const updateSpeedActive = (activeBtn: HTMLElement, speed: number) => {
    demoSpeed = speed;
    [speedSlow, speedNormal, speedFast].forEach((btn) => {
      if (btn === activeBtn) {
        btn?.classList.remove('text-slate-400');
        btn?.classList.add('bg-sky-500', 'text-white', 'font-semibold');
      } else {
        btn?.classList.remove('bg-sky-500', 'text-white', 'font-semibold');
        btn?.classList.add('text-slate-400');
      }
    });
  };

  if (speedSlow) speedSlow.onclick = () => updateSpeedActive(speedSlow, 1800);
  if (speedNormal) speedNormal.onclick = () => updateSpeedActive(speedNormal, 1200);
  if (speedFast) speedFast.onclick = () => updateSpeedActive(speedFast, 600);

  // Simulation controls
  const simRandomBtn = document.getElementById('sim-random-btn');
  if (simRandomBtn) simRandomBtn.onclick = () => randomizeSimArray();

  const simResetExampleBtn = document.getElementById('sim-reset-example-btn');
  if (simResetExampleBtn) simResetExampleBtn.onclick = () => resetSimulation();

  const simHintBtn = document.getElementById('sim-hint-btn');
  if (simHintBtn) simHintBtn.onclick = () => provideSimHint();

  const simProceedQuizBtn = document.getElementById('sim-proceed-quiz-btn');
  if (simProceedQuizBtn) {
    simProceedQuizBtn.onclick = () => {
      if (checkIsSorted(simArray)) {
        soundFX.playSuccess();
        navigateTo(6);
      }
    };
  }

  // Quiz buttons
  const quizCheckBtn = document.getElementById('quiz-check-btn');
  if (quizCheckBtn) quizCheckBtn.onclick = () => handleCheckQuizAnswer();

  const quizNextBtn = document.getElementById('quiz-next-btn');
  if (quizNextBtn) quizNextBtn.onclick = () => handleNextQuizQuestion();

  // Reflection Form
  const reflectionForm = document.getElementById('reflection-form');
  if (reflectionForm) {
    reflectionForm.onsubmit = (e) => {
      e.preventDefault();
      const input = document.getElementById('reflection-input') as HTMLTextAreaElement | null;
      if (!input || !input.value.trim()) return;

      soundFX.playSuccess();
      const successBox = document.getElementById('reflection-success-box');
      const quote = document.getElementById('reflection-saved-quote');
      if (quote) quote.textContent = `"${input.value.trim()}"`;
      if (successBox) successBox.classList.remove('hidden');
      reflectionForm.classList.add('hidden');
    };
  }

  // Reflection prompt chips
  document.querySelectorAll<HTMLButtonElement>('.reflection-chip').forEach((chip) => {
    chip.onclick = () => {
      const text = chip.getAttribute('data-text');
      const input = document.getElementById('reflection-input') as HTMLTextAreaElement | null;
      if (input && text) {
        input.value = text;
        input.focus();
      }
    };
  });

  // Modal dialog close buttons
  const modalCloseMenu = document.getElementById('modal-close-menu-btn');
  if (modalCloseMenu) {
    modalCloseMenu.onclick = () => {
      const modal = document.getElementById('modal-completion');
      if (modal) modal.classList.add('hidden');
      navigateTo(2);
    };
  }

  const modalCloseHome = document.getElementById('modal-close-home-btn');
  if (modalCloseHome) {
    modalCloseHome.onclick = () => {
      const modal = document.getElementById('modal-completion');
      if (modal) modal.classList.add('hidden');
      navigateTo(1);
    };
  }

  // Initialize Hero, Demo, Simulation, and Quiz
  startHeroDemo();
  renderDemoBars();
  renderSimBars();
  renderCurrentQuestion();
  updateMenuBadges();
});
