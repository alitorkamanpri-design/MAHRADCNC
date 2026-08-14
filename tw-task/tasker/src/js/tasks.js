import {
  initSampleData, initNavigation, initTaskModal, openTaskModal,
  getTasks, deleteTask, toggleTask,
  formatShortDate, badgeHTML, donutSVG, avatarGroupHTML,
  PRIORITY_COLOR, CAT_LABEL, CAT_COLOR,
  showToast
} from './app.js'

initSampleData()
initNavigation('tasks')

// ── State ──────────────────────────────────────────────────────
let currentFilter = 'all'
let searchQuery   = ''
let deletePendingId = null

// ── Filter Logic ───────────────────────────────────────────────
function getFilteredTasks() {
  let tasks = getTasks()
  if (searchQuery)          tasks = tasks.filter(t => t.title.includes(searchQuery) || (t.description||'').includes(searchQuery))
  if (currentFilter === 'active')    tasks = tasks.filter(t => !t.completed)
  if (currentFilter === 'completed') tasks = tasks.filter(t =>  t.completed)
  if (currentFilter === 'high')      tasks = tasks.filter(t =>  t.priority === 'high')
  return tasks
}

// ── Render ─────────────────────────────────────────────────────
function renderTasks() {
  const tasks = getFilteredTasks()
  const list  = document.getElementById('taskList')
  const badge = document.getElementById('taskCountBadge')
  badge.textContent = getTasks().length

  if (tasks.length === 0) {
    list.innerHTML = `
      <div class="flex flex-col items-center justify-center py-2xl gap-md text-text-muted animate-fade-in">
        <div class="w-16 h-16 rounded-full bg-primary-soft flex items-center justify-center">
          <i class="fa-solid fa-list-check text-3xl text-primary"></i>
        </div>
        <p class="text-sm font-medium">${searchQuery ? 'نتیجه‌ای یافت نشد' : 'هنوز تسکی ندارید'}</p>
        ${!searchQuery ? '<p class="text-xs text-text-muted">با دکمه + تسک جدید اضافه کنید</p>' : ''}
      </div>`
    return
  }

  list.innerHTML = tasks.map((t, i) => {
    const color   = PRIORITY_COLOR[t.priority]||'#0d9488'
    const catColor= CAT_COLOR[t.category]||'#0d9488'
    return `
      <div class="task-card animate-fade-in-up ${t.completed?'opacity-75':''}"
           style="animation-delay:${i*60}ms; border-right: 3px solid ${catColor}">
        <!-- Row 1: badge + donut -->
        <div class="flex items-center justify-between mb-sm">
          <div class="flex items-center gap-sm">
            <!-- Checkbox -->
            <button class="w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-200
              ${t.completed ? 'bg-primary border-primary' : 'border-border hover:border-primary'}"
              data-toggle="${t.id}">
              ${t.completed ? '<i class="fa-solid fa-check text-white text-xs"></i>' : ''}
            </button>
            ${badgeHTML(t.priority)}
          </div>
          <div class="flex items-center gap-1.5">
            <span class="text-sm font-semibold text-text-secondary">${t.progress||0}%</span>
            ${donutSVG(t.progress||0, color)}
          </div>
        </div>
        <!-- Title -->
        <h3 class="text-xl font-bold text-text-primary mb-0.5 ${t.completed?'line-through text-text-muted':''} clamp-1">${t.title}</h3>
        ${t.description ? `<p class="text-sm text-text-muted mb-sm clamp-1">${t.description}</p>` : '<div class="mb-sm"></div>'}
        <!-- Meta row -->
        <div class="flex items-center justify-between">
          <!-- Left: date + time -->
          <div class="flex items-center gap-md text-xs text-text-muted">
            ${t.date ? `<span><i class="fa-solid fa-calendar text-xs me-1"></i>${formatShortDate(t.date)}</span>` : ''}
            ${t.time ? `<span><i class="fa-solid fa-clock text-xs me-1"></i>${t.time}</span>` : ''}
          </div>
          <!-- Right: actions + avatars -->
          <div class="flex items-center gap-sm">
            ${avatarGroupHTML(2)}
            <button class="btn-icon hover:bg-primary/10 hover:text-primary" data-edit="${t.id}">
              <i class="fa-solid fa-pen-to-square text-sm"></i>
            </button>
            <button class="btn-icon hover:bg-danger-bg hover:text-danger" data-delete="${t.id}">
              <i class="fa-solid fa-trash-can text-sm"></i>
            </button>
          </div>
        </div>
      </div>`
  }).join('')

  // Wire task actions
  list.querySelectorAll('[data-toggle]').forEach(btn =>
    btn.addEventListener('click', () => { toggleTask(btn.dataset.toggle); renderTasks() })
  )
  list.querySelectorAll('[data-edit]').forEach(btn =>
    btn.addEventListener('click', () => {
      const task = getTasks().find(t => t.id === btn.dataset.edit)
      if (task) openTaskModal(task)
    })
  )
  list.querySelectorAll('[data-delete]').forEach(btn =>
    btn.addEventListener('click', () => openDeleteDialog(btn.dataset.delete))
  )
}

// ── Delete Dialog ──────────────────────────────────────────────
function openDeleteDialog(id) {
  deletePendingId = id
  document.getElementById('deleteDialog').classList.remove('hidden')
  document.body.style.overflow = 'hidden'
}

function closeDeleteDialog() {
  deletePendingId = null
  document.getElementById('deleteDialog').classList.add('hidden')
  document.body.style.overflow = ''
}

document.getElementById('delCancelBtn').addEventListener('click', closeDeleteDialog)
document.getElementById('delBackdrop').addEventListener('click', closeDeleteDialog)
document.getElementById('delConfirmBtn').addEventListener('click', () => {
  if (deletePendingId) {
    deleteTask(deletePendingId)
    closeDeleteDialog()
    renderTasks()
    showToast('تسک با موفقیت حذف شد', 'success')
  }
})

// ── Search ─────────────────────────────────────────────────────
document.getElementById('searchInput').addEventListener('input', e => {
  searchQuery = e.target.value.trim()
  renderTasks()
})

// ── Filter Tabs ────────────────────────────────────────────────
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'))
    btn.classList.add('active')
    currentFilter = btn.dataset.filter
    renderTasks()
  })
})

// ── Add Task header button ─────────────────────────────────────
document.getElementById('addTaskHeaderBtn').addEventListener('click', () => openTaskModal())

// ── Init ───────────────────────────────────────────────────────
renderTasks()
initTaskModal(renderTasks)
