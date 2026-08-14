import {
  initSampleData, initNavigation, initTaskModal,
  getTasks, getTasksByDate, getTodayStr,
  toJalali, toGregorian, jalaliMonthDays, JALALI_MONTHS, JALALI_DAYS_FULL,
  badgeHTML, avatarGroupHTML, PRIORITY_COLOR, CAT_LABEL, CAT_COLOR,
  openTaskModal
} from './app.js'

initSampleData()
initNavigation('calendar')

// ── State ──────────────────────────────────────────────────────
const todayGreg  = new Date()
const todayStr   = getTodayStr()
let { jy:CJY, jm:CJM, jd:CJD } = toJalali(todayGreg)
let selectedDate = todayStr

// ── Month Navigation ───────────────────────────────────────────
document.getElementById('prevMonthBtn').addEventListener('click', () => { CJM--; if(CJM<1){CJM=12;CJY--} renderAll() })
document.getElementById('nextMonthBtn').addEventListener('click', () => { CJM++; if(CJM>12){CJM=1;CJY++} renderAll() })

// ── Render ─────────────────────────────────────────────────────
function renderAll() {
  document.getElementById('calMonthTitle').textContent = `${JALALI_MONTHS[CJM-1]} ${CJY}`
  renderDateStrip()
  renderTimeline()
}

function renderDateStrip() {
  const strip   = document.getElementById('dateStrip')
  const days    = jalaliMonthDays(CJY, CJM)
  const allTasks = getTasks()

  // Build set of dates that have tasks
  const taskDates = new Set(allTasks.map(t => t.date))

  strip.innerHTML = Array.from({length: days}, (_, i) => {
    const jd  = i + 1
    const { gy, gm, gd } = toGregorian(CJY, CJM, jd)
    const dateStr = `${gy}-${String(gm).padStart(2,'0')}-${String(gd).padStart(2,'0')}`
    const d   = new Date(gy, gm-1, gd)
    const dow = JALALI_DAYS_FULL[(d.getDay()+1)%7].charAt(0)  // first char of weekday

    const isToday    = dateStr === todayStr
    const isSelected = dateStr === selectedDate
    const hasTasks   = taskDates.has(dateStr)

    const stateClass = (isToday || isSelected) ? 'is-today' : ''

    return `<button class="cal-day ${stateClass} shrink-0 flex flex-col items-center justify-center gap-0.5"
                    data-date="${dateStr}" data-jd="${jd}">
      <span class="cal-day-name text-xs ${(isToday||isSelected)?'text-white':'text-text-muted'}">${dow}</span>
      <span class="cal-day-num text-sm font-bold">${jd}</span>
      ${hasTasks ? `<span class="w-1 h-1 rounded-full ${(isToday||isSelected)?'bg-white/70':'bg-primary'}"></span>` : '<span class="w-1 h-1"></span>'}
    </button>`
  }).join('')

  strip.querySelectorAll('.cal-day').forEach(btn => {
    btn.addEventListener('click', () => {
      selectedDate = btn.dataset.date
      renderDateStrip()
      renderTimeline()
    })
  })

  // Scroll selected into view
  const sel = strip.querySelector(`[data-date="${selectedDate}"]`)
  if (sel) sel.scrollIntoView({ behavior:'smooth', inline:'center', block:'nearest' })
}

function renderTimeline() {
  const tasks  = getTasksByDate(selectedDate)
  const { jy, jm, jd } = toJalali(new Date(selectedDate))
  const d = new Date(selectedDate)
  const weekday = JALALI_DAYS_FULL[(d.getDay()+1)%7]

  document.getElementById('timelineTitle').textContent =
    selectedDate === todayStr ? 'تسک‌های امروز' : `تسک‌های ${weekday} ${jd} ${JALALI_MONTHS[jm-1]}`

  const countBadge = document.getElementById('timelineCount')
  if (tasks.length > 0) {
    countBadge.classList.remove('hidden')
    countBadge.textContent = tasks.length
  } else {
    countBadge.classList.add('hidden')
  }

  const list = document.getElementById('timelineList')
  if (tasks.length === 0) {
    list.innerHTML = `
      <div class="flex flex-col items-center justify-center py-2xl gap-md text-text-muted animate-fade-in">
        <div class="w-16 h-16 rounded-full bg-primary-soft flex items-center justify-center">
          <i class="fa-solid fa-calendar-xmark text-3xl text-primary"></i>
        </div>
        <p class="text-sm font-medium">این روز تسکی ندارید</p>
      </div>`
    return
  }

  list.innerHTML = tasks.map((t, i) => {
    const slotClass = t.completed ? 'cal-slot-done' : `cal-slot-${t.priority}`
    const color     = PRIORITY_COLOR[t.priority]||'#0d9488'
    return `
      <div class="flex gap-md items-start animate-fade-in-up" style="animation-delay:${i*70}ms">
        <!-- Time column -->
        <div class="flex flex-col items-center gap-1 shrink-0 w-14">
          <span class="text-sm font-semibold text-text-secondary">${t.time||'---'}</span>
          ${i < tasks.length-1 ? '<div class="w-px flex-1 bg-border min-h-[2rem]"></div>' : ''}
        </div>
        <!-- Slot card -->
        <div class="${slotClass} flex-1 cursor-pointer" onclick="document.dispatchEvent(new CustomEvent('editTask',{detail:'${t.id}'}))">
          <div class="flex items-start justify-between gap-2 mb-1">
            ${badgeHTML(t.priority)}
            ${avatarGroupHTML(2)}
          </div>
          <p class="text-base font-bold text-text-primary mt-1 ${t.completed?'line-through text-text-muted':''}">${t.title}</p>
          <p class="text-xs text-text-secondary mt-0.5">
            <i class="fa-solid fa-clock text-xs" style="color:${color}"></i>
            ${t.description ? t.description.slice(0,40) : CAT_LABEL[t.category]||''}
          </p>
          ${t.completed ? '<span class="badge-done mt-1 inline-flex"><i class="fa-solid fa-check-circle"></i>تکمیل</span>' : ''}
        </div>
      </div>`
  }).join('')
}

// Edit task from timeline
document.addEventListener('editTask', e => {
  const task = getTasks().find(t => t.id === e.detail)
  if (task) openTaskModal(task)
})

renderAll()
initTaskModal(renderTimeline)
