let currentSlide = 0;
const slides = document.querySelectorAll(".slide");
const dots = document.querySelectorAll(".dot");
const progress = document.getElementById("onboard-progress");

function showSlide(i) {
  slides.forEach((s) => s.classList.remove("active"));
  dots.forEach((d) => d.classList.remove("active"));

  slides[i].classList.add("active");
  dots[i].classList.add("active");

  progress.style.width = ((i + 1) / slides.length) * 100 + "%";
  currentSlide = i;
}

document.getElementById("btn-next").onclick = () => {
  if (currentSlide < slides.length - 1) showSlide(currentSlide + 1);
  else startApp();
};

document.getElementById("btn-skip").onclick = startApp;
dots.forEach((d) => (d.onclick = () => showSlide(parseInt(d.dataset.slide))));

function startApp() {
  document.getElementById("page-onboard").classList.remove("active");
  document.getElementById("page-home").classList.add("active");
}

const pages = document.querySelectorAll(".page");
document.querySelectorAll(".nav-item").forEach((btn) => {
  btn.onclick = () => {
    document
      .querySelectorAll(".nav-item")
      .forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    pages.forEach((p) => p.classList.remove("active"));
    document.getElementById("page-" + btn.dataset.page).classList.add("active");
  };
});

const modalRecord = document.getElementById("modal-record");
const modalJob = document.getElementById("modal-job");

document.getElementById("btn-add-record").onclick = () =>
  modalRecord.classList.add("open");
document.getElementById("btn-add-job").onclick = () =>
  modalJob.classList.add("open");

modalRecord.onclick = (e) => {
  if (e.target === modalRecord) modalRecord.classList.remove("open");
};
modalJob.onclick = (e) => {
  if (e.target === modalJob) modalJob.classList.remove("open");
};

let jobs = JSON.parse(localStorage.getItem("jobs") || "[]");
let records = JSON.parse(localStorage.getItem("records") || "[]");

function save() {
  localStorage.setItem("jobs", JSON.stringify(jobs));
  localStorage.setItem("records", JSON.stringify(records));
  renderJobs();
  renderRecords();
}

function showToast(t) {
  const toast = document.getElementById("toast");
  toast.textContent = t;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2000);
}

document.getElementById("save-job").onclick = () => {
  const name = document.getElementById("job-name").value;
  const rate = parseInt(document.getElementById("job-rate").value);

  if (!name || !rate) return;

  jobs.push({ id: Date.now(), name, rate });
  modalJob.classList.remove("open");
  document.getElementById("job-name").value = "";
  document.getElementById("job-rate").value = "";

  save();
  showToast("شغل ثبت شد");
};

function renderJobs() {
  const list = document.getElementById("job-list");
  const select = document.getElementById("record-job");

  list.innerHTML = "";
  select.innerHTML = "";

  jobs.forEach((j) => {
    const item = document.createElement("div");
    item.className = "job-item";
    item.innerHTML = `
<div class="job-item__info">
<div class="job-item__name">${j.name}</div>
<div class="job-item__rate">${j.rate.toLocaleString()} تومان</div>
</div>
<div class="job-item__actions">
<button class="btn--icon delete-job">
<svg viewBox="0 0 24 24" fill="none" stroke-width="2">
<polyline points="3 6 5 6 21 6"/>
<path d="M19 6l-2 14H7L5 6"/>
</svg>
</button>
</div>`;

    item.querySelector(".delete-job").onclick = () => {
      jobs = jobs.filter((x) => x.id !== j.id);
      save();
    };

    list.appendChild(item);

    const op = document.createElement("option");
    op.value = j.id;
    op.textContent = j.name;
    select.appendChild(op);
  });
}

document.getElementById("record-job").onchange = (e) => {
  const job = jobs.find((j) => j.id == e.target.value);
  if (job) document.getElementById("hourly-rate").value = job.rate;
};

document.getElementById("save-record").onclick = () => {
  const jobId = document.getElementById("record-job").value;
  const start = document.getElementById("start-time").value;
  const end = document.getElementById("end-time").value;
  const date = document.getElementById("record-date").value;
  const rate = parseInt(document.getElementById("hourly-rate").value);

  if (!jobId || !start || !end || !date) return;

  const hours =
    (new Date("1970-01-01T" + end) - new Date("1970-01-01T" + start)) / 3600000;
  const amount = hours * rate;

  records.push({
    id: Date.now(),
    jobId,
    start,
    end,
    date,
    hours,
    rate,
    amount,
  });

  modalRecord.classList.remove("open");
  save();
  showToast("ثبت انجام شد");
};

function renderRecords() {
  const list = document.getElementById("record-list");
  const empty = document.getElementById("empty-state");

  list.innerHTML = "";

  if (records.length === 0) {
    empty.style.display = "flex";
    return;
  } else empty.style.display = "none";

  let totalAmount = 0;
  let totalHours = 0;

  records.forEach((r) => {
    const job = jobs.find((j) => j.id == r.jobId);

    totalAmount += r.amount;
    totalHours += r.hours;

    const item = document.createElement("div");
    item.className = "record-item";

    item.innerHTML = `
<div class="record-item__dot"></div>
<div class="record-item__body">
<div class="record-item__title">${job ? job.name : "-"}</div>
<div class="record-item__meta">${r.date} | ${r.start} - ${r.end}</div>
</div>
<div class="record-item__amount">${Math.round(r.amount).toLocaleString()}</div>
<div class="record-item__actions">
<button class="btn--icon del">
<svg viewBox="0 0 24 24" fill="none" stroke-width="2">
<polyline points="3 6 5 6 21 6"/>
<path d="M19 6l-2 14H7L5 6"/>
</svg>
</button>
</div>
`;

    item.querySelector(".del").onclick = () => {
      records = records.filter((x) => x.id !== r.id);
      save();
    };

    list.appendChild(item);
  });

  document.getElementById("stat-total-amount").textContent =
    Math.round(totalAmount).toLocaleString();
  document.getElementById("stat-total-hours").textContent =
    totalHours.toFixed(1);
  document.getElementById("stat-days").textContent = records.length;
  document.getElementById("stat-avg").textContent = Math.round(
    totalAmount / records.length || 0,
  ).toLocaleString();

  renderReport();
}

function renderReport() {
  const box = document.getElementById("report-summary");
  box.innerHTML = "";

  const map = {};

  records.forEach((r) => {
    const job = jobs.find((j) => j.id == r.jobId);
    if (!job) return;
    if (!map[job.name]) map[job.name] = { hours: 0, amount: 0 };
    map[job.name].hours += r.hours;
    map[job.name].amount += r.amount;
  });

  Object.keys(map).forEach((name) => {
    const row = document.createElement("div");
    row.className = "report-row";
    row.innerHTML = `
<div class="report-row__label">${name}</div>
<div class="report-row__value">${map[name].hours.toFixed(1)} ساعت</div>
<div class="report-row__value report-row__value--accent">${Math.round(map[name].amount).toLocaleString()} تومان</div>
`;

    box.appendChild(row);
  });
}

renderJobs();
renderRecords();
