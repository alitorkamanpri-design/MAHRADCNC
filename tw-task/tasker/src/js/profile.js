import {
  initSampleData, initNavigation, initTaskModal,
  getProfile, saveProfile, getTaskStats,
  showToast, animateCount
} from './app.js'

initSampleData()
initNavigation('profile')

// ── Load Profile ───────────────────────────────────────────────
function loadProfile() {
  const profile = getProfile()
  const stats   = getTaskStats()

  // Avatar
  const icon = document.getElementById('profileAvatarIcon')
  const img  = document.getElementById('profileAvatarImg')
  if (profile.avatar) {
    img.src = profile.avatar
    img.classList.remove('hidden')
    icon.classList.add('hidden')
  } else {
    img.classList.add('hidden')
    icon.classList.remove('hidden')
  }

  // Name & email display
  document.getElementById('profileNameDisplay').textContent  = profile.name  || 'کاربر'
  document.getElementById('profileEmailDisplay').textContent = profile.email || ''

  // Form fields
  document.getElementById('pName').value  = profile.name  || ''
  document.getElementById('pEmail').value = profile.email || ''
  document.getElementById('pBio').value   = profile.bio   || ''

  // Stats
  const rate = stats.total ? Math.round(stats.completed / stats.total * 100) : 0
  animateCount(document.getElementById('pStatTotal'), stats.total,     600)
  animateCount(document.getElementById('pStatDone'),  stats.completed, 600)
  document.getElementById('pStatRate').textContent = rate + '%'
}

// ── Save Profile ───────────────────────────────────────────────
document.getElementById('saveProfileBtn').addEventListener('click', () => {
  const name  = document.getElementById('pName').value.trim()
  const email = document.getElementById('pEmail').value.trim()
  const bio   = document.getElementById('pBio').value.trim()

  if (!name) {
    document.getElementById('pName').focus()
    showToast('نام نمی‌تواند خالی باشد', 'error')
    return
  }

  const profile = getProfile()
  saveProfile({ ...profile, name, email, bio })
  loadProfile()
  showToast('تغییرات با موفقیت ذخیره شد', 'success')
})

// ── Avatar Upload ──────────────────────────────────────────────
document.getElementById('changeAvatarBtn').addEventListener('click', () =>
  document.getElementById('avatarInput').click()
)

document.getElementById('avatarInput').addEventListener('change', e => {
  const file = e.target.files[0]
  if (!file) return
  if (file.size > 2 * 1024 * 1024) {
    showToast('حجم تصویر باید کمتر از ۲ مگابایت باشد', 'error')
    return
  }
  const reader = new FileReader()
  reader.onload = ev => {
    const avatar = ev.target.result
    const profile = getProfile()
    saveProfile({ ...profile, avatar })
    loadProfile()
    showToast('تصویر پروفایل با موفقیت تغییر کرد', 'success')
  }
  reader.readAsDataURL(file)
})

// ── Init ───────────────────────────────────────────────────────
loadProfile()
initTaskModal(() => {})
