/* ═══════════════════════════════════════════════════════════════
   TASKER — Shared App Logic
   Storage · Data Model · Jalali · Modal · Utils
   ═══════════════════════════════════════════════════════════════ */

// ── Storage Keys ──────────────────────────────────────────────
const KEYS = { TASKS: 'tasker_tasks', PROFILE: 'tasker_profile' }

// ── Task CRUD ─────────────────────────────────────────────────
export const getTasks   = () => JSON.parse(localStorage.getItem(KEYS.TASKS)   || '[]')
export const getProfile = () => JSON.parse(localStorage.getItem(KEYS.PROFILE) || '{}')
export const saveTasks  = tasks   => localStorage.setItem(KEYS.TASKS,   JSON.stringify(tasks))
export const saveProfile= profile => localStorage.setItem(KEYS.PROFILE, JSON.stringify(profile))

export function getTask(id)         { return getTasks().find(t => t.id === id) }
export function getTasksByDate(d)   { return getTasks().filter(t => t.date === d).sort((a,b) => (a.time||'').localeCompare(b.time||'')) }

export function addTask(task) {
  const tasks = getTasks()
  tasks.unshift({ ...task, id: generateId(), createdAt: Date.now(), completed: false })
  saveTasks(tasks)
}

export function updateTask(id, updates) {
  const tasks = getTasks()
  const i = tasks.findIndex(t => t.id === id)
  if (i !== -1) { tasks[i] = { ...tasks[i], ...updates }; saveTasks(tasks) }
}

export function deleteTask(id) { saveTasks(getTasks().filter(t => t.id !== id)) }

export function toggleTask(id) {
  const t = getTask(id)
  if (t) updateTask(id, { completed: !t.completed, progress: !t.completed ? 100 : t.progress })
}

// ── Stats ──────────────────────────────────────────────────────
export function getTaskStats() {
  const tasks = getTasks()
  const today = getTodayStr()
  const todayTasks = tasks.filter(t => t.date === today)
  const upcoming   = tasks.filter(t => t.date >= today && !t.completed)
  return {
    total:          tasks.length,
    completed:      tasks.filter(t => t.completed).length,
    upcoming:       upcoming.length,
    todayTotal:     todayTasks.length,
    todayCompleted: todayTasks.filter(t => t.completed).length,
  }
}

// ── Utils ──────────────────────────────────────────────────────
export const generateId  = () => Date.now().toString(36) + Math.random().toString(36).slice(2)
export const getTodayStr = () => new Date().toISOString().slice(0,10)

export function formatGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'صبح بخیر،'
  if (h < 17) return 'ظهر بخیر،'
  if (h < 21) return 'عصر بخیر،'
  return 'شب بخیر،'
}

// ── Jalali Calendar ────────────────────────────────────────────
export const JALALI_MONTHS = ['فروردین','اردیبهشت','خرداد','تیر','مرداد','شهریور','مهر','آبان','آذر','دی','بهمن','اسفند']
export const JALALI_DAYS   = ['ش','ی','د','س','چ','پ','ج']
export const JALALI_DAYS_FULL = ['شنبه','یک‌شنبه','دوشنبه','سه‌شنبه','چهارشنبه','پنج‌شنبه','جمعه']

export function toJalali(dateInput) {
  const d = dateInput instanceof Date ? dateInput : new Date(dateInput)
  let gy = d.getFullYear(), gm = d.getMonth()+1, gd = d.getDate()
  const gDM = [31,28,31,30,31,30,31,31,30,31,30,31]
  const jDM = [31,31,31,31,31,31,30,30,30,30,30,29]
  let gy2 = gy-1600, gm2 = gm-1, gd2 = gd-1
  let gDN = 365*gy2 + Math.floor((gy2+3)/4) - Math.floor((gy2+99)/100) + Math.floor((gy2+399)/400)
  for (let i=0; i<gm2; i++) gDN += gDM[i]
  if (gm2>1 && ((gy2%4===0&&gy2%100!==0)||gy2%400===0)) gDN++
  gDN += gd2
  let jDN = gDN - 79
  let jnp = Math.floor(jDN/12053); jDN %= 12053
  let jy = 979 + 33*jnp + 4*Math.floor(jDN/1461); jDN %= 1461
  if (jDN>=366) { jy += Math.floor((jDN-1)/365); jDN = (jDN-1)%365 }
  let i=0
  for (; i<11 && jDN>=jDM[i]; i++) jDN -= jDM[i]
  return { jy, jm: i+1, jd: jDN+1 }
}

export function toGregorian(jy, jm, jd) {
  const jDM = [31,31,31,31,31,31,30,30,30,30,30,29]
  let jy1=jy-979, jm1=jm-1, jd1=jd-1
  let jDN = 365*jy1 + Math.floor(jy1/33)*8 + Math.floor((jy1%33+3)/4)
  for (let i=0; i<jm1; i++) jDN += jDM[i]
  jDN += jd1
  let gDN = jDN + 79
  let gy = 1600 + 400*Math.floor(gDN/146097); gDN %= 146097
  let leap = true
  if (gDN>=36525) { gDN--; gy += 100*Math.floor(gDN/36524); gDN %= 36524; gDN >= 365 ? gDN++ : (leap = false) }
  gy += 4*Math.floor(gDN/1461); gDN %= 1461
  if (gDN>=366) { leap=false; gDN--; gy+=Math.floor(gDN/365); gDN %= 365 }
  const gDM = [31,leap?29:28,31,30,31,30,31,31,30,31,30,31]
  let gm=0
  while (gm<12 && gDN>=gDM[gm]) { gDN -= gDM[gm]; gm++ }
  return { gy, gm: gm+1, gd: gDN+1 }
}

export function jalaliMonthDays(jy, jm) {
  if (jm <= 6) return 31
  if (jm <= 11) return 30
  return isJalaliLeap(jy) ? 30 : 29
}

export function isJalaliLeap(jy) {
  const rem = ((jy - (jy > 474 ? 474 : 473)) % 2820 + 474 + 38) * 682 % 2816
  return rem < 682
}

export function formatPersianDate(dateStr) {
  if (!dateStr) return ''
  const { jy, jm, jd } = toJalali(new Date(dateStr))
  return `${jd} ${JALALI_MONTHS[jm-1]} ${jy}`
}

export function formatShortDate(dateStr) {
  if (!dateStr) return ''
  const { jm, jd } = toJalali(new Date(dateStr))
  return `${jd} ${JALALI_MONTHS[jm-1]}`
}

// Map JS getDay() (0=Sun) to Jalali column (0=Sat)
export function jsToJalaliWeekday(jsDay) {
  return (jsDay + 1) % 7  // Sat=0, Sun=1, Mon=2, ..., Fri=6
}

// ── Navigation ─────────────────────────────────────────────────
export function initNavigation(currentPage) {
  document.querySelectorAll('.nav-item').forEach(item => {
    if (item.dataset.page === currentPage) {
      item.classList.add('active')
    }
  })
}

// ── Priority & Category Maps ────────────────────────────────────
export const PRIORITY_LABEL = { high: 'بالا', medium: 'میانه', low: 'پایین' }
export const PRIORITY_COLOR = { high: '#7c3aed', medium: '#0d9488', low: '#0284c7' }
export const CAT_LABEL      = { work: 'کار', personal: 'شخصی', health: 'سلامت', study: 'مطالعه' }
export const CAT_ICON       = { work: 'fa-briefcase', personal: 'fa-heart', health: 'fa-dumbbell', study: 'fa-book' }
export const CAT_COLOR      = { work: '#0d9488', personal: '#ec4899', health: '#10b981', study: '#f59e0b' }
const AVATAR_COLORS = ['#0d9488','#7c3aed','#ec4899','#f59e0b','#0284c7','#10b981']
const AVATAR_INITIALS = ['م','ا','ر','ن','ه','س']

// ── Render Helpers ─────────────────────────────────────────────
export function badgeHTML(priority) {
  return `<span class="badge-${priority}">${PRIORITY_LABEL[priority]||priority}</span>`
}

export function donutSVG(progress, color) {
  const r=13, cx=18, cy=18, c=2*Math.PI*r
  const off = c*(1-(progress||0)/100)
  return `<svg width="36" height="36" viewBox="0 0 36 36" class="shrink-0">
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#e2e8f0" stroke-width="3"/>
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${color}" stroke-width="3"
      stroke-dasharray="${c.toFixed(2)}" stroke-dashoffset="${off.toFixed(2)}"
      stroke-linecap="round" transform="rotate(-90 ${cx} ${cy})"/>
  </svg>`
}

export function avatarGroupHTML(count=3) {
  return `<div class="flex items-center">${
    Array.from({length:Math.min(count,3)},(_,i)=>
      `<div class="avatar-circle" style="background:${AVATAR_COLORS[i]};${i>0?'margin-inline-start:-6px;':''}">${AVATAR_INITIALS[i]}</div>`
    ).join('')
  }</div>`
}

// ── Toast ──────────────────────────────────────────────────────
export function showToast(msg, type='success') {
  const t = document.createElement('div')
  const bg = type === 'success' ? '#10b981' : '#ef4444'
  t.className = 'toast-msg animate-fade-in-up'
  t.style.background = bg
  t.innerHTML = `<i class="fa-solid fa-${type==='success'?'circle-check':'circle-xmark'}"></i><span>${msg}</span>`
  document.body.appendChild(t)
  setTimeout(()=>{ t.style.transition='opacity 0.3s'; t.style.opacity='0'; setTimeout(()=>t.remove(),300) },2200)
}

// ── Shared Task Modal ──────────────────────────────────────────
let _modalEditId  = null
let _modalOnSave  = null

export function initTaskModal(onSave) {
  _modalOnSave = onSave
  if (document.getElementById('taskModalWrap')) return
  const wrap = document.createElement('div')
  wrap.id = 'taskModalWrap'
  wrap.className = 'modal-wrap hidden'
  wrap.innerHTML = `
    <div class="modal-backdrop" id="modalBackdrop"></div>
    <div class="modal-sheet animate-slide-in" id="modalSheet">
      <div class="flex justify-center pt-3 pb-1">
        <div class="w-10 h-1 bg-border rounded-full"></div>
      </div>
      <div class="flex items-center justify-between px-lg py-md border-b border-border-light">
        <h3 class="text-lg font-bold text-text-primary" id="modalHeading">افزودن تسک</h3>
        <button class="btn-icon" id="modalCloseBtn"><i class="fa-solid fa-xmark text-lg"></i></button>
      </div>
      <div class="px-lg py-xl flex flex-col gap-lg">
        <!-- Title -->
        <div>
          <label class="block text-sm font-medium text-text-secondary mb-1">عنوان <span class="text-danger">*</span></label>
          <input type="text" id="mTitle" class="input-field" placeholder="عنوان تسک را وارد کنید">
          <p class="text-xs text-danger mt-1 hidden" id="mTitleErr">عنوان نمی‌تواند خالی باشد</p>
        </div>
        <!-- Description -->
        <div>
          <label class="block text-sm font-medium text-text-secondary mb-1">توضیحات</label>
          <textarea id="mDesc" class="input-field resize-none" rows="2" placeholder="توضیحات اختیاری..."></textarea>
        </div>
        <!-- Date + Time -->
        <div class="grid grid-cols-2 gap-md">
          <div>
            <label class="block text-sm font-medium text-text-secondary mb-1">تاریخ</label>
            <input type="date" id="mDate" class="input-field text-sm">
          </div>
          <div>
            <label class="block text-sm font-medium text-text-secondary mb-1">ساعت</label>
            <input type="time" id="mTime" class="input-field text-sm">
          </div>
        </div>
        <!-- Priority -->
        <div>
          <label class="block text-sm font-medium text-text-secondary mb-2">اولویت</label>
          <div class="flex gap-sm" id="mPriority">
            <button class="priority-btn" data-p="high">بالا</button>
            <button class="priority-btn" data-p="medium">میانه</button>
            <button class="priority-btn" data-p="low">پایین</button>
          </div>
        </div>
        <!-- Category -->
        <div>
          <label class="block text-sm font-medium text-text-secondary mb-2">دسته‌بندی</label>
          <div class="grid grid-cols-2 gap-sm" id="mCategory">
            <button class="cat-btn" data-c="work"><i class="fa-solid fa-briefcase text-cat-work text-sm"></i>کار</button>
            <button class="cat-btn" data-c="personal"><i class="fa-solid fa-heart text-cat-personal text-sm"></i>شخصی</button>
            <button class="cat-btn" data-c="health"><i class="fa-solid fa-dumbbell text-cat-health text-sm"></i>سلامت</button>
            <button class="cat-btn" data-c="study"><i class="fa-solid fa-book text-cat-study text-sm"></i>مطالعه</button>
          </div>
        </div>
        <!-- Actions -->
        <div class="flex flex-col gap-sm pt-sm pb-4 safe-bottom">
          <button class="btn-primary w-full" id="mSaveBtn">ذخیره تسک</button>
          <button class="btn-secondary w-full" id="mCancelBtn">لغو</button>
        </div>
      </div>
    </div>`
  document.body.appendChild(wrap)

  // Event wiring
  document.getElementById('modalBackdrop').addEventListener('click', closeTaskModal)
  document.getElementById('modalCloseBtn').addEventListener('click', closeTaskModal)
  document.getElementById('mCancelBtn').addEventListener('click', closeTaskModal)
  document.getElementById('mSaveBtn').addEventListener('click', _saveTask)

  document.querySelectorAll('#mPriority .priority-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#mPriority .priority-btn').forEach(b => { b.className = 'priority-btn' })
      btn.classList.add(`active-${btn.dataset.p}`)
    })
  })

  document.querySelectorAll('#mCategory .cat-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#mCategory .cat-btn').forEach(b => b.classList.remove('active'))
      btn.classList.add('active')
    })
  })

  // FAB wiring
  const fab = document.getElementById('fabBtn')
  if (fab) fab.addEventListener('click', () => openTaskModal())
}

export function openTaskModal(task=null) {
  const wrap = document.getElementById('taskModalWrap')
  if (!wrap) return
  _modalEditId = task ? task.id : null
  document.getElementById('modalHeading').textContent = task ? 'ویرایش تسک' : 'افزودن تسک'
  document.getElementById('mTitle').value       = task?.title       || ''
  document.getElementById('mDesc').value        = task?.description || ''
  document.getElementById('mDate').value        = task?.date        || getTodayStr()
  document.getElementById('mTime').value        = task?.time        || ''
  document.getElementById('mTitleErr').classList.add('hidden')
  // Reset priority
  document.querySelectorAll('#mPriority .priority-btn').forEach(b => {
    b.className = 'priority-btn'
    if (b.dataset.p === (task?.priority||'medium')) b.classList.add(`active-${b.dataset.p}`)
  })
  // Reset category
  document.querySelectorAll('#mCategory .cat-btn').forEach(b => {
    b.classList.remove('active')
    if (b.dataset.c === (task?.category||'work')) b.classList.add('active')
  })
  wrap.classList.remove('hidden')
  document.body.style.overflow = 'hidden'
}

export function closeTaskModal() {
  const wrap = document.getElementById('taskModalWrap')
  if (wrap) wrap.classList.add('hidden')
  document.body.style.overflow = ''
  _modalEditId = null
}

function _saveTask() {
  const title = document.getElementById('mTitle').value.trim()
  if (!title) {
    document.getElementById('mTitleErr').classList.remove('hidden')
    document.getElementById('mTitle').focus()
    return
  }
  const priority = document.querySelector('#mPriority .priority-btn[class*="active"]')?.dataset.p || 'medium'
  const category = document.querySelector('#mCategory .cat-btn.active')?.dataset.c || 'work'
  const task = {
    title,
    description: document.getElementById('mDesc').value.trim(),
    date:        document.getElementById('mDate').value || getTodayStr(),
    time:        document.getElementById('mTime').value,
    priority,
    category,
    progress:    _modalEditId ? getTask(_modalEditId)?.progress||0 : 0,
  }
  if (_modalEditId) {
    updateTask(_modalEditId, task)
  } else {
    addTask(task)
  }
  closeTaskModal()
  if (_modalOnSave) _modalOnSave()
}

// ── Count-up Animation ─────────────────────────────────────────
export function animateCount(el, target, duration=600) {
  let start=0, step=target/Math.ceil(duration/16)
  const run=()=>{ start=Math.min(start+step,target); el.textContent=Math.round(start); if(start<target) requestAnimationFrame(run) }
  requestAnimationFrame(run)
}

// ── Sample Data ────────────────────────────────────────────────
export function initSampleData() {
  if (getTasks().length > 0) return
  const T = getTodayStr()
  const d = (n) => new Date(Date.now()+n*86400000).toISOString().slice(0,10)
  const samples = [
    { title:'جلسه با مشتری',     description:'بررسی نیازمندی‌های پروژه جدید', date:T,    time:'09:30', priority:'medium', category:'work',     progress:54 },
    { title:'طراحی لوگو برند',   description:'ایجاد ایده‌های اولیه و موکاپ',   date:T,    time:'13:10', priority:'high',   category:'work',     progress:32 },
    { title:'مرور اپ موبایل',    description:'بازبینی و فیدبک به تیم توسعه',   date:T,    time:'10:00', priority:'low',    category:'work',     progress:100, completed:true },
    { title:'ورزش صبحگاهی',      description:'دویدن ۳۰ دقیقه‌ای در پارک',      date:T,    time:'07:00', priority:'medium', category:'health',   progress:100, completed:true },
    { title:'ریکاپ کیک‌آف',      description:'جمع‌بندی نتایج جلسه اول',         date:d(1), time:'10:00', priority:'medium', category:'work',     progress:0 },
    { title:'مطالعه Tailwind v4', description:'خواندن مستندات و Best Practices', date:d(1), time:'19:00', priority:'low',    category:'study',    progress:20 },
    { title:'فیچر پروفایل',      description:'پیاده‌سازی آپلود آواتار',          date:d(5), time:'11:00', priority:'high',   category:'work',     progress:0 },
    { title:'دندانپزشکی',         description:'ویزیت دوره‌ای',                   date:d(9), time:'16:00', priority:'medium', category:'health',   progress:0 },
  ]
  saveTasks(samples.map(s => ({ ...s, id:generateId(), createdAt:Date.now(), completed:s.completed||false })))
  if (!getProfile().name) saveProfile({ name:'ماریا احمدی', email:'maria@example.com', bio:'طراح محصول | توسعه‌دهنده رابط کاربری', avatar:'' })
}
