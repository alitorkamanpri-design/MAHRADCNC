import {
  initSampleData, initNavigation, initTaskModal,
  getProfile, getTaskStats, getTasks, getTodayStr,
  formatGreeting, formatShortDate, toJalali, JALALI_MONTHS, JALALI_DAYS_FULL,
  badgeHTML, donutSVG, avatarGroupHTML, PRIORITY_COLOR, CAT_LABEL,
  animateCount
} from './app.js'

initSampleData()
initNavigation('home')

// ── Avatar / Greeting ──────────────────────────────────────────
const profile = getProfile()
const avatarIcon = document.getElementById('avatarIcon')
const avatarImg  = document.getElementById('avatarImg')
if (profile.avatar) {
  avatarImg.src = profile.avatar
  avatarImg.classList.remove('hidden')
  avatarIcon.classList.add('hidden')
}
document.getElementById('greetText').textContent = formatGreeting()
document.getElementById('greetName').textContent = (profile.name ? profile.name.split(' ')[0] : 'کاربر') + ' 👋'

// ── Persian Date ───────────────────────────────────────────────
const now = new Date()
const { jy, jm, jd } = toJalali(now)
const weekday = JALALI_DAYS_FULL[(now.getDay() + 1) % 7]
document.getElementById('todayDateText').textContent = `${weekday}، ${jd} ${JALALI_MONTHS[jm-1]} ${jy}`

// ── Stats ──────────────────────────────────────────────────────
const stats = getTaskStats()
animateCount(document.getElementById('statUpcoming'),  stats.upcoming,  700)
animateCount(document.getElementById('statToday'),     stats.todayTotal, 700)
animateCount(document.getElementById('statCompleted'), stats.completed, 700)

// ── Recent Tasks ───────────────────────────────────────────────
function renderRecentTasks() {
  const today = getTodayStr()
  const tasks = getTasks()
    .filter(t => t.date === today)
    .slice(0, 4)
  const list = document.getElementById('recentTasksList')

  if (tasks.length === 0) {
    list.innerHTML = `
      <div class="flex flex-col items-center justify-center py-2xl gap-md text-text-muted animate-fade-in-up">
        <div class="w-16 h-16 rounded-full bg-primary-soft flex items-center justify-center">
          <i class="fa-solid fa-clipboard text-3xl text-primary"></i>
        </div>
        <p class="text-sm font-medium">امروز تسکی ندارید</p>
        <p class="text-xs text-text-muted text-center">با دکمه + تسک جدید اضافه کنید</p>
      </div>`
    return
  }

  list.innerHTML = tasks.map((t, i) => {
    const color  = PRIORITY_COLOR[t.priority] || '#0d9488'
    const doneClass = t.completed ? 'opacity-60' : ''
    const daysLeft  = daysLeftBadge(t.date)
    return `
      <div class="task-card animate-fade-in-up ${doneClass}"
           style="animation-delay:${i*80}ms">
        <!-- Row 1: badge + progress -->
        <div class="flex items-center justify-between mb-sm">
          ${badgeHTML(t.priority)}
          <div class="flex items-center gap-2">
            <span class="text-sm font-semibold text-text-secondary">${t.progress||0}%</span>
            ${donutSVG(t.progress||0, color)}
          </div>
        </div>
        <!-- Title -->
        <h3 class="text-xl font-bold text-text-primary mb-0.5 ${t.completed?'line-through text-text-muted':''} clamp-1">
          ${t.title}
        </h3>
        <!-- Time -->
        <p class="text-sm text-text-muted mb-md">${formatTime(t.time)} · ${CAT_LABEL[t.category]||''}</p>
        <!-- Row 3: avatars + days left -->
        <div class="flex items-center justify-between">
          ${avatarGroupHTML(3)}
          ${t.completed
            ? '<span class="badge-done"><i class="fa-solid fa-check-circle"></i>تکمیل شد</span>'
            : daysLeft
          }
        </div>
      </div>`
  }).join('')
}

function formatTime(time) {
  if (!time) return '---'
  return time.replace(':', ':')
}

function daysLeftBadge(dateStr) {
  const diff = Math.ceil((new Date(dateStr) - new Date(getTodayStr())) / 86400000)
  if (diff < 0) return `<span class="badge-done">گذشته</span>`
  if (diff === 0) return `<span class="days-badge"><i class="fa-solid fa-clock text-xs"></i>امروز</span>`
  return `<span class="days-badge"><i class="fa-solid fa-calendar-days text-xs"></i>${diff} روز مانده</span>`
}

renderRecentTasks()
initTaskModal(renderRecentTasks)
