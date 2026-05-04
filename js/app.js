const SHEETS = {
  intro: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSIVEEcmAXWKQz1FLZonSas8HGF7Cv97-O4_Jen8WxqwYWll8f5IxHUo5hrn1-t3DJDGP6Y5F5t2M0A/pub?output=csv',
  slots: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSIVEEcmAXWKQz1FLZonSas8HGF7Cv97-O4_Jen8WxqwYWll8f5IxHUo5hrn1-t3DJDGP6Y5F5t2M0A/pub?gid=1510938039&single=true&output=csv',
  process: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSIVEEcmAXWKQz1FLZonSas8HGF7Cv97-O4_Jen8WxqwYWll8f5IxHUo5hrn1-t3DJDGP6Y5F5t2M0A/pub?gid=1395938404&single=true&output=csv',
  showcase: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSIVEEcmAXWKQz1FLZonSas8HGF7Cv97-O4_Jen8WxqwYWll8f5IxHUo5hrn1-t3DJDGP6Y5F5t2M0A/pub?gid=2030353483&single=true&output=csv',
  rigEx: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSIVEEcmAXWKQz1FLZonSas8HGF7Cv97-O4_Jen8WxqwYWll8f5IxHUo5hrn1-t3DJDGP6Y5F5t2M0A/pub?gid=1920251815&single=true&output=csv',
  options: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSIVEEcmAXWKQz1FLZonSas8HGF7Cv97-O4_Jen8WxqwYWll8f5IxHUo5hrn1-t3DJDGP6Y5F5t2M0A/pub?gid=1361414476&single=true&output=csv',
  notice: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSIVEEcmAXWKQz1FLZonSas8HGF7Cv97-O4_Jen8WxqwYWll8f5IxHUo5hrn1-t3DJDGP6Y5F5t2M0A/pub?gid=966541552&single=true&output=csv',
  collab: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSIVEEcmAXWKQz1FLZonSas8HGF7Cv97-O4_Jen8WxqwYWll8f5IxHUo5hrn1-t3DJDGP6Y5F5t2M0A/pub?gid=530705517&single=true&output=csv',
};

document.addEventListener('DOMContentLoaded', () => {
  initIntroSection();
  initShowcaseSection();
  initProcessSection();
  initRigExSection();
  initOptionsSection();
  initNoticeSection();
  initCollabSection();
  initFormSection();
});

async function initIntroSection() {
  const [introData, slotData] = await Promise.all([
    loadSheet(SHEETS.intro),
    loadSheet(SHEETS.slots)
  ]);

  renderIntroProfile(introData[0]);
  renderIntroSlots(slotData);
}

async function loadSheet(url) {
  const res = await fetch(url);
  const text = await res.text();
  return csvToObjects(text);
}

function csvToObjects(csv) {
  const rows = parseCSV(csv);
  const headers = rows.shift().map((h) => h.trim());

  return rows
    .filter((row) => row.some((cell) => cell.trim() !== ''))
    .map((row) => {
      return headers.reduce((obj, key, index) => {
        obj[key] = (row[index] || '').trim();
        return obj;
      }, {});
    });
}

function parseCSV(csv) {
  const rows = [];
  let row = [];
  let cell = '';
  let inQuotes = false;

  for (let i = 0; i < csv.length; i++) {
    const char = csv[i];
    const next = csv[i + 1];

    if (char === '"' && inQuotes && next === '"') {
      cell += '"';
      i++;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      row.push(cell);
      cell = '';
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && next === '\n') i++;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = '';
    } else {
      cell += char;
    }
  }

  if (cell || row.length) {
    row.push(cell);
    rows.push(row);
  }

  return rows;
}

function renderIntroProfile(data) {
  const target = document.querySelector('#introProfile');
  if (!target || !data) return;

  target.innerHTML = `
    <div class="intro-img-wrap">
      <img class="intro-img" src="${toDriveImage(data.img_url)}" alt="${escapeHTML(data.name)} 프로필 이미지">
    </div>

    <div class="intro-text">
      <h1 class="intro-name">${escapeHTML(data.name)}</h1>
      <p class="intro-subtitle">${escapeHTML(data.subtitle)}</p>
      <p class="intro-desc">${escapeHTML(data.desc)}</p>
    </div>
  `;
}

function renderIntroSlots(items) {
  const target = document.querySelector('#introSlots');
  if (!target) return;

  target.innerHTML = `
    <div class="slot-head">
      <div>
        <h2 class="slot-title">작업 슬롯</h2>
        <p class="slot-desc">♡ 빈 슬롯 │ ♥︎ 마감 슬롯</p>
      </div>
    </div>

    <div class="slot-list">
      ${items.map(createSlotRow).join('')}
    </div>
  `;
}

function createSlotRow(item) {
  const slots = Object.keys(item)
    .filter((key) => key !== 'month')
    .map((key) => createSlotItem(item[key], key))
    .join('');

  return `
    <div class="slot-row">
      <div class="slot-month">${escapeHTML(item.month)}월</div>
      <div class="slot-items">
        ${slots}
      </div>
    </div>
  `;
}

function createSlotItem(status, label) {
  const isOpen = status.toLowerCase() === 'open';
  const mark = isOpen ? '♡' : '♥︎';
  const className = isOpen ? 'is-open' : 'is-closed';

  return `
    <span class="slot-item ${className}" title="${escapeHTML(label)}">
      ${mark}
    </span>
  `;
}

function toDriveImage(url) {
  if (!url) return '';

  if (url.includes('lh3.googleusercontent.com')) return url;

  const match = url.match(/\/d\/([^/]+)/);
  if (!match) return url;

  return `https://lh3.googleusercontent.com/d/${match[1]}`;
}

function escapeHTML(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

// =================================
//    showcase
// =================================
async function initShowcaseSection() {
  const showcaseData = await loadSheet(SHEETS.showcase);
  const sortedData = showcaseData.sort((a, b) => Number(a.order) - Number(b.order));

  renderShowcase(sortedData);
  initShowcaseSlider();
}

function renderShowcase(items) {
  const target = document.querySelector('#showcase');
  if (!target || !items.length) return;

  target.innerHTML = `
    <div class="section-head">
      <span class="section-kicker">Showcase</span>
      <h2 class="section-title">쇼케이스</h2>
      <p class="section-desc">Live2D 쇼케이스 영상을 확인해보세요.</p>
    </div>

    <div class="showcase-slider" data-showcase-slider>
      <button class="showcase-btn showcase-prev" type="button" aria-label="이전 영상"></button>

      <div class="showcase-viewport">
        <div class="showcase-track">
          ${items.map(createShowcaseSlide).join('')}
        </div>
      </div>

      <button class="showcase-btn showcase-next" type="button" aria-label="다음 영상"></button>

      <div class="showcase-dots">
        ${items.map((_, index) => `
          <button class="showcase-dot" type="button" data-index="${index}" aria-label="${index + 1}번째 영상 보기"></button>
        `).join('')}
      </div>
    </div>
  `;
}

function createShowcaseSlide(item) {
  const embedUrl = toYoutubeEmbed(item.link);

  return `
    <article class="showcase-slide">
      <div class="showcase-video">
        <iframe
          src="${embedUrl}"
          title="${escapeHTML(item.title)}"
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerpolicy="strict-origin-when-cross-origin"
          allowfullscreen>
        </iframe>
      </div>

      <div class="showcase-info">
        <h3 class="showcase-title">${escapeHTML(item.title)}</h3>
        ${item.desc ? `<p class="showcase-desc">${escapeHTML(item.desc)}</p>` : ''}
      </div>
    </article>
  `;
}

function initShowcaseSlider() {
  const slider = document.querySelector('[data-showcase-slider]');
  if (!slider) return;

  const track = slider.querySelector('.showcase-track');
  const slides = [...slider.querySelectorAll('.showcase-slide')];
  const prevBtn = slider.querySelector('.showcase-prev');
  const nextBtn = slider.querySelector('.showcase-next');
  const dots = [...slider.querySelectorAll('.showcase-dot')];

  let current = 0;

  function updateSlider() {
    track.style.transform = `translateX(-${current * 100}%)`;

    dots.forEach((dot, index) => {
      dot.classList.toggle('is-active', index === current);
    });

    prevBtn.disabled = current === 0;
    nextBtn.disabled = current === slides.length - 1;
  }

  prevBtn.addEventListener('click', () => {
    current = Math.max(current - 1, 0);
    updateSlider();
  });

  nextBtn.addEventListener('click', () => {
    current = Math.min(current + 1, slides.length - 1);
    updateSlider();
  });

  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      current = Number(dot.dataset.index);
      updateSlider();
    });
  });

  updateSlider();
}

function toYoutubeEmbed(url) {
  if (!url) return '';

  const patterns = [
    /youtu\.be\/([^?&]+)/,
    /youtube\.com\/watch\?v=([^?&]+)/,
    /youtube\.com\/embed\/([^?&]+)/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return `https://www.youtube.com/embed/${match[1]}?vq=hd1080`;
    }
  }

  return url;
}

// =================================
//    process
// =================================
async function initProcessSection() {
  const data = await loadSheet(SHEETS.process);
  const sorted = data.sort((a, b) => Number(a.order) - Number(b.order));
  renderProcess(sorted);
}

function renderProcess(items) {
  const target = document.querySelector('#process');
  if (!target) return;

  target.innerHTML = `
    <div class="section-head">
      <div class="section-head-inner">
        <span class="section-kicker">Process</span>
        <h2 class="section-title">작업 프로세스</h2>
      </div>
    </div>

    <div class="process-grid">
      ${items.map(createProcessCard).join('')}
    </div>
  `;
}

function createProcessCard(item) {
  const icon = (item.icon || '📌').trim();

  return `
    <div class="process-card">
      <div class="process-step">${String(item.order).padStart(2, '0')}</div>
      <div class="process-icon">${escapeHTML(icon)}</div>
      <div class="process-title">${escapeHTML(item.title)}</div>
    </div>
  `;
}

// =================================
//    rig_ex
// =================================
async function initRigExSection() {
  const data = await loadSheet(SHEETS.rigEx);

  const sorted = data.sort((a, b) => {
    const groupDiff = Number(a.group_order) - Number(b.group_order);
    if (groupDiff !== 0) return groupDiff;
    return Number(a.order) - Number(b.order);
  });

  renderRigEx(sorted);
}

function renderRigEx(items) {
  const target = document.querySelector('#rig_ex');
  if (!target) return;

  const groups = groupBy(items, 'group');

  target.innerHTML = `
    <div class="section-head">
      <div class="section-head-inner">
        <span class="section-kicker">Rigging Example</span>
        <h2 class="section-title">리깅 예시</h2>
        <p class="section-desc">얼굴, 몸, 표정 등 다양한 리깅 움직임을 확인해보세요.</p>
      </div>
    </div>

    <div class="rigex-wrap">
      ${Object.entries(groups).map(([groupName, groupItems]) => createRigExGroup(groupName, groupItems)).join('')}
    </div>
  `;
}

function createRigExGroup(groupName, items) {
  return `
    <article class="rigex-group">
      <h3 class="rigex-group-title">${escapeHTML(groupName)}</h3>

      <div class="rigex-grid">
        ${items.map(createRigExCard).join('')}
      </div>
    </article>
  `;
}

function createRigExCard(item) {
  const title = item.title?.trim();

  return `
    <figure class="rigex-card">
      <div class="rigex-img-wrap">
        <img
          class="rigex-img"
          src="${toDriveImage(item.image_url)}"
          alt="${escapeHTML(title || item.group)} 리깅 예시"
          loading="lazy"
        >
      </div>
      ${title ? `<figcaption class="rigex-caption">${escapeHTML(title)}</figcaption>` : ''}
    </figure>
  `;
}

function groupBy(items, key) {
  return items.reduce((groups, item) => {
    const groupName = item[key] || '기타';
    if (!groups[groupName]) groups[groupName] = [];
    groups[groupName].push(item);
    return groups;
  }, {});
}

// =================================
//    options
// =================================
async function initOptionsSection() {
  const data = await loadSheet(SHEETS.options);

  const sorted = data.sort((a, b) => {
    if (a.category === b.category) {
      return Number(a.order) - Number(b.order);
    }
    return 0;
  });

  renderOptions(sorted);
}

function renderOptions(items) {
  const target = document.querySelector('#options');
  if (!target) return;

  const baseOptions = items.filter((item) => item.category === '기본 옵션');
  const includedOptions = items.filter((item) => item.category === '포함 옵션');
  const extraOptions = items.filter((item) => item.category === '추가 옵션');

  target.innerHTML = `
    <div class="section-head">
      <div class="section-head-inner">
        <span class="section-kicker">Options</span>
        <h2 class="section-title">리깅 옵션</h2>
        <p class="section-desc">기본 리깅 구성과 추가 가능한 옵션을 확인해주세요.</p>
      </div>
    </div>

    <div class="option-wrap">
      <section class="option-panel option-base-panel">
        <div class="option-panel-head">
          <h3 class="option-panel-title">기본 옵션</h3>
          <p class="option-panel-desc">기본 리깅 타입을 선택해주세요.</p>
        </div>

        <div class="base-option-grid">
          ${baseOptions.map(createBaseOptionCard).join('')}
        </div>

        <div class="included-box">
          <div class="included-head">
            <h4 class="included-title">포함 옵션</h4>
            <p class="included-desc">기본 옵션에 공통으로 포함되는 구성입니다.</p>
          </div>

          <div class="included-list">
            ${includedOptions.map(createIncludedItem).join('')}
          </div>
        </div>
      </section>

      <section class="option-panel option-extra-panel">
        <div class="option-panel-head">
          <h3 class="option-panel-title">추가 옵션</h3>
          <p class="option-panel-desc">필요한 기능을 추가로 선택할 수 있습니다.</p>
        </div>

        <div class="extra-option-grid">
          ${extraOptions.map(createExtraOptionCard).join('')}
        </div>
      </section>
    </div>
  `;
}

function createBaseOptionCard(item) {
  return `
    <article class="base-option-card">
      <div>
        <h4 class="base-option-title">${escapeHTML(item.title)}</h4>
        ${item.desc ? `<p class="base-option-desc">${escapeHTML(item.desc)}</p>` : ''}
      </div>
      <p class="base-option-price">${formatPrice(item.price)}</p>
    </article>
  `;
}

function createIncludedItem(item) {
  return `
    <article class="included-item">
      <span class="included-check"></span>
      <div>
        <h5 class="included-item-title">${escapeHTML(item.title)}</h5>
        ${item.desc ? `<p class="included-item-desc">${escapeHTML(item.desc)}</p>` : ''}
      </div>
    </article>
  `;
}

function createExtraOptionCard(item) {
  const title = item.title || '';
  const unit = item.desc
    ? ` <span class="option-unit">(${escapeHTML(item.desc)})</span>`
    : '';

  return `
    <article class="extra-option-card">
      <div>
        <h4 class="extra-option-title">
          ${escapeHTML(title)}${unit}
        </h4>
      </div>
      <p class="extra-option-price">${formatOptionPrice(item)}</p>
    </article>
  `;
}

function formatOptionPrice(item) {
  const price = formatPrice(item.price);

  if (item.calc_type === 'unit') {
    return `${price}`;
  }

  return price;
}

function formatPrice(value) {
  const number = Number(value);
  if (!number) return '';

  return `${number.toLocaleString('ko-KR')}원`;
}

async function initNoticeSection() {
  const data = await loadSheet(SHEETS.notice);

  const sorted = data.sort((a, b) => {
    const categoryDiff = Number(a.category_order) - Number(b.category_order);
    if (categoryDiff !== 0) return categoryDiff;
    return Number(a.order) - Number(b.order);
  });

  renderNotice(sorted);
}

// =================================
//    notice
// =================================

function renderNotice(items) {
  const target = document.querySelector('#notice');
  if (!target) return;

  const groups = groupBy(items, 'category');

  target.innerHTML = `
    <div class="section-head">
      <div class="section-head-inner">
        <span class="section-kicker">Notice</span>
        <h2 class="section-title">공지사항</h2>
        <p class="section-desc">신청 전 확인이 필요한 안내사항을 정리했습니다.</p>
      </div>
    </div>

    <div class="notice-wrap">
      ${Object.entries(groups).map(([category, list]) => createNoticeGroup(category, list)).join('')}
    </div>
  `;
}

function createNoticeGroup(category, list) {
  return `
    <article class="notice-card">
      <h3 class="notice-title">${escapeHTML(category)}</h3>

      <ol class="notice-list">
        ${list.map(createNoticeItem).join('')}
      </ol>
    </article>
  `;
}

function createNoticeItem(item) {
  return `
    <li class="notice-item">
      <span class="notice-number">${String(item.order).padStart(2, '0')}</span>
      <p class="notice-content">${escapeHTML(item.content)}</p>
    </li>
  `;
}

// =================================
//    collab
// =================================
async function initCollabSection() {
  const data = await loadSheet(SHEETS.collab);
  const sorted = data.sort((a, b) => Number(a.order) - Number(b.order));
  renderCollab(sorted);
}

function renderCollab(items) {
  const target = document.querySelector('#collab');
  if (!target) return;

  target.innerHTML = `
    <div class="section-head">
      <div class="section-head-inner">
        <span class="section-kicker">Collaboration</span>
        <h2 class="section-title">협업 작가</h2>
        <p class="section-desc">함께 의뢰 시 할인 혜택을 받을 수 있는 작가님들입니다.</p>
      </div>
    </div>

    <div class="collab-grid">
      ${items.map(createCollabCard).join('')}
    </div>
  `;
}

function createCollabCard(item) {
  return `
    <a class="collab-card" href="${escapeHTML(item.link)}" target="_blank" rel="noopener noreferrer">
      <div class="collab-img-wrap">
        <img
          class="collab-img"
          src="${toDriveImage(item.image_url)}"
          alt="${escapeHTML(item.name)} 이미지"
          loading="lazy"
        >
      </div>

      <div class="collab-info">
        <h3 class="collab-name">${escapeHTML(item.name)}</h3>
        <p class="collab-desc">${escapeHTML(item.desc)}</p>
        <span class="collab-link">페이지 보기</span>
      </div>
    </a>
  `;
}

// =================================
//    form
// =================================
let optionItems = [];

async function initFormSection() {
  optionItems = await loadSheet(SHEETS.options);

  const baseOptions = optionItems
    .filter((item) => item.category === '기본 옵션')
    .sort((a, b) => Number(a.order) - Number(b.order));

  const extraOptions = optionItems
    .filter((item) => item.category === '추가 옵션')
    .sort((a, b) => Number(a.order) - Number(b.order));

  renderForm(baseOptions, extraOptions);
  bindFormEvents();
  updateEstimate();
}

function renderForm(baseOptions, extraOptions) {
  const target = document.querySelector('#form');
  if (!target) return;

  target.innerHTML = `
    <div class="section-head">
      <div class="section-head-inner">
        <span class="section-kicker">Order Form</span>
        <h2 class="section-title">신청 양식</h2>
        <p class="section-desc">아래 내용을 작성한 뒤 복사하여 문의 시 전달해주세요.</p>
      </div>
    </div>

    <div class="form-wrap">
      <form class="order-form" id="orderForm">
        <div class="form-row two">
          ${createTextField('nickname', '방송 닉네임')}
          ${createTextField('platform', '방송 플랫폼', '예) 치지직, 유튜브')}
        </div>

        <div class="form-field">
          <p class="form-label">리깅 옵션</p>
          <div class="form-choice-grid">
            ${baseOptions.map((item, index) => `
              <label class="form-choice">
                <input type="radio" name="rigging" value="${escapeHTML(item.title)}" data-price="${item.price}" ${index === 0 ? 'checked' : ''}>
                <span>
                  <strong>${escapeHTML(item.title)}</strong>
                  <em>${formatPrice(item.price)}</em>
                </span>
              </label>
            `).join('')}
          </div>
        </div>

        <div class="form-field">
          <p class="form-label">추가 옵션 선택</p>
          <div class="form-check-grid">
            ${extraOptions.map((item) => `
              <label class="form-check">
                <input type="checkbox" name="extra" value="${escapeHTML(item.title)}" data-price="${item.price}" data-desc="${escapeHTML(item.desc || '')}">
                <span>
                  <strong>${escapeHTML(item.title)}${item.desc ? ` <small>(${escapeHTML(item.desc)})</small>` : ''}</strong>
                  <em>${formatPrice(item.price)}</em>
                </span>
              </label>
            `).join('')}
          </div>
        </div>

        ${createTextField('expression', '표정 종류', '원하시는 표정을 기재해주세요')}
        ${createTextField('artist', '협업 작가 / 일러스트레이터 정보')}

        <div class="form-field">
          <p class="form-label">포트폴리오 공개 여부</p>
          <div class="form-choice-grid">
            <label class="form-choice">
              <input type="radio" name="portfolio" value="공개" checked>
              <span><strong>공개</strong></span>
            </label>
            <label class="form-choice">
              <input type="radio" name="portfolio" value="비공개">
              <span><strong>비공개</strong></span>
            </label>
          </div>
        </div>

        <div class="form-row two">
          ${createDateField('deadline', '희망 마감일')}
          ${createDateField('debutDate', '데뷔 예정일')}
        </div>

        <div class="form-field">
          <label class="form-label" for="request">추가 요청사항</label>
          <textarea id="request" name="request" rows="5" placeholder="추가로 전달하고 싶은 내용을 작성해주세요."></textarea>
        </div>

        <div class="estimate-box">
          <span>예상 견적</span>
          <strong id="estimatePrice">0원</strong>
        </div>

        <div class="form-actions">
          <button type="button" class="form-btn primary" id="copyFormBtn">양식 복사</button>
          <button type="button" class="form-btn" id="resetFormBtn">초기화</button>
        </div>
      </form>
    </div>
  `;
}

function createTextField(name, label, placeholder = '') {
  return `
    <div class="form-field">
      <label class="form-label" for="${name}">${label}</label>
      <input type="text" id="${name}" name="${name}" placeholder="${placeholder}">
    </div>
  `;
}

function createDateField(name, label) {
  return `
    <div class="form-field">
      <label class="form-label" for="${name}">${label}</label>
      <input type="date" id="${name}" name="${name}">
    </div>
  `;
}

function bindFormEvents() {
  const form = document.querySelector('#orderForm');
  if (!form) return;

  form.addEventListener('input', updateEstimate);
  form.addEventListener('change', updateEstimate);

  document.querySelector('#copyFormBtn')?.addEventListener('click', copyOrderForm);
  document.querySelector('#resetFormBtn')?.addEventListener('click', () => {
    form.reset();
    updateEstimate();
  });
}

function updateEstimate() {
  const form = document.querySelector('#orderForm');
  const target = document.querySelector('#estimatePrice');
  if (!form || !target) return;

  let total = 0;

  const rigging = form.querySelector('input[name="rigging"]:checked');
  if (rigging) total += Number(rigging.dataset.price || 0);

  const extras = [...form.querySelectorAll('input[name="extra"]:checked')];
  extras.forEach((item) => {
    total += Number(item.dataset.price || 0);
  });

  target.textContent = formatPrice(total);
}

async function copyOrderForm() {
  const form = document.querySelector('#orderForm');
  if (!form) return;

  const rigging = form.querySelector('input[name="rigging"]:checked')?.value || '';
  const extras = [...form.querySelectorAll('input[name="extra"]:checked')]
    .map((item) => {
      const desc = item.dataset.desc ? ` (${item.dataset.desc})` : '';
      return `- ${item.value}${desc}`;
    })
    .join('\n') || '없음';

  const portfolio = form.querySelector('input[name="portfolio"]:checked')?.value || '';
  const estimate = document.querySelector('#estimatePrice')?.textContent || '0원';

const text = `
[리깅 신청 양식]

방송 닉네임: ${form.nickname.value}
방송 플랫폼: ${form.platform.value}

리깅 옵션: ${rigging}

추가 옵션:
${extras}

표정 종류: ${form.expression.value}
협업 작가 / 일러스트레이터 정보: ${form.artist.value}

포트폴리오 공개 여부: ${portfolio}
희망 마감일: ${form.deadline.value}
데뷔 예정일: ${form.debutDate.value}

추가 요청사항:
${form.request.value}

예상 견적: ${estimate}
`.trim();

  await navigator.clipboard.writeText(text);
  alert('양식이 복사되었습니다.');
}