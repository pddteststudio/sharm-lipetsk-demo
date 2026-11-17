/* «Шарм» — independent demonstration project.
   No server, no tracking. Forms only prepare local messages for the user. */
(() => {
  'use strict';
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const tones = {
    'Песочный': '#C3A78F',
    'Шалфей': '#9AA794',
    'Розовый кварц': '#C5A4A5',
    'Графит': '#6D6974',
    'Слоновая кость': '#E8DDC9'
  };
  const s = { room: 'Гостиная', curtain: 'Портьеры и тюль', tone: 'Песочный', fabric: 'Льняная фактура', photo: null, file: '', lastFocused: null };
  let toastTimer;
  const toast = msg => {
    const box = $('#toast');
    box.textContent = msg;
    box.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => box.classList.remove('show'), 3500);
  };
  async function copyText(text) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const el = document.createElement('textarea');
        el.value = text;
        el.style.cssText = 'position:fixed;opacity:0;left:-9999px;top:0';
        document.body.appendChild(el);
        el.focus(); el.select();
        const ok = document.execCommand('copy');
        el.remove();
        if (!ok) throw new Error('copy unavailable');
      }
      toast('Текст скопирован. Теперь можно отправить его студии.');
    } catch (e) { toast('Копирование недоступно. Попробуйте открыть страницу через HTTPS или localhost.'); }
  }

  // Navigation: on phones, only real links and a working close action.
  const menuToggle = $('#mobile-menu-toggle');
  const menu = $('#mobile-nav');
  menuToggle.addEventListener('click', () => {
    menu.hidden = !menu.hidden;
    const open = !menu.hidden;
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
    menuToggle.querySelector('use').setAttribute('href', open ? '#i-close' : '#i-menu');
  });
  $$('#mobile-nav a').forEach(link => link.addEventListener('click', () => {
    menu.hidden = true;
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Открыть меню');
    menuToggle.querySelector('use').setAttribute('href', '#i-menu');
  }));

  // Filtered editorial gallery of original concept illustrations.
  const filterButtons = $$('[data-filter]');
  const cards = $$('[data-project]');
  filterButtons.forEach(btn => btn.addEventListener('click', () => {
    filterButtons.forEach(b => b.setAttribute('aria-pressed', String(b === btn)));
    const category = btn.dataset.filter;
    cards.forEach(card => { card.hidden = category !== 'all' && category !== card.dataset.category; });
  }));

  const projects = {
    living: { title: 'Мягкий свет гостиной', description: 'Идея оформления гостиной с тактильными портьерами и полупрозрачным слоем ткани. Мягкие натуральные оттенки хорошо сочетаются с деревом и тёплой обивкой. Это авторский эскиз, не подтверждённый выполненный заказ.', image: 'portfolio-living.svg', room: 'Гостиная' },
    bedroom: { title: 'Спальня в тёплых тонах', description: 'Концепция плотных портьер для спальни с акцентом на спокойствие, приватность и утренний свет. Выбранная ткань и степень затемнения согласуются с дизайнером.', image: 'portfolio-bedroom.svg', room: 'Спальня' },
    attic: { title: 'Шторы для мансарды', description: 'Авторская иллюстрация по мотивам темы опубликованной работы студии от 13 ноября 2026 года. В описании настоящего проекта упоминаются портьеры со скосом на ручной складке, профильные карнизы, тюль и шенилл-блэкаут. Изображение не является фотографией заказа.', image: 'portfolio-attic.svg', room: 'Спальня' },
    kitchen: { title: 'Лёгкость на кухне', description: 'Идея спокойного оконного оформления для кухни: лёгкие ткани, нейтральные оттенки, лаконичный рисунок складок. Это концепция, не работа студии.', image: 'portfolio-kitchen.svg', room: 'Кухня' },
    nursery: { title: 'Тихое утро в детской', description: 'Авторский интерьерный эскиз мягких фактур и спокойных цветов для детской комнаты. Для детских пространств особенно важно учитывать функциональность выбранных материалов.', image: 'portfolio-nursery.svg', room: 'Детская' },
    detail: { title: 'Искусство складки', description: 'Детали драпировки и декоративные акценты помогают завершить образ окна. Иллюстрация не изображает реальный заказ студии.', image: 'portfolio-detail.svg', room: 'Гостиная' }
  };
  const modal = $('#gallery-modal');
  function closeModal() {
    if (modal.hidden) return;
    modal.hidden = true;
    document.body.classList.remove('modal-open');
    s.lastFocused?.focus?.();
  }
  function openProject(key, sender) {
    const item = projects[key];
    if (!item) return;
    s.lastFocused = sender;
    $('#modal-title').textContent = item.title;
    $('#modal-description').textContent = item.description;
    const image = $('#modal-image');
    image.src = `./assets/${item.image}`;
    image.alt = `Авторская интерьерная иллюстрация: ${item.title}`;
    $('#modal-to-builder').dataset.room = item.room;
    modal.hidden = false;
    document.body.classList.add('modal-open');
    $('#modal-close').focus();
  }
  cards.forEach(card => card.addEventListener('click', () => openProject(card.dataset.project, card)));
  $('#modal-close').addEventListener('click', closeModal);
  $('[data-dismiss]', modal).addEventListener('click', closeModal);
  $('#modal-to-builder').addEventListener('click', event => {
    const room = event.currentTarget.dataset.room;
    if (room) updateSelect('room', room, 'data-room');
    closeModal();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') { closeModal(); if (!menu.hidden) menuToggle.click(); }
    if (!modal.hidden && event.key === 'Tab') {
      const focusables = $$('button:not([disabled]),a[href]', $('.modal-content'));
      if (!focusables.length) return;
      const first = focusables[0], last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) { last.focus(); event.preventDefault(); }
      else if (!event.shiftKey && document.activeElement === last) { first.focus(); event.preventDefault(); }
    }
  });

  // Constructor preview. Uses authored SVG geometry, not a generated photo.
  function updateSelect(key, value, dataProp) {
    s[key] = value;
    $$(`${dataProp === 'data-room' ? '#room-options ' : ''}[${dataProp}]`).forEach(button => button.setAttribute('aria-pressed', String(button.getAttribute(dataProp) === value)));
    renderPreview();
  }
  $$('#room-options [data-room]').forEach(button => button.addEventListener('click', () => updateSelect('room', button.dataset.room, 'data-room')));
  $$('[data-curtain]').forEach(button => button.addEventListener('click', () => updateSelect('curtain', button.dataset.curtain, 'data-curtain')));
  $$('[data-tone]').forEach(button => button.addEventListener('click', () => {
    updateSelect('tone', button.dataset.tone, 'data-tone');
    $$('[data-tone]').forEach(b => b.classList.toggle('active', b === button));
  }));
  const roomSvg = { 'Гостиная': '#preview-room-living', 'Спальня': '#preview-room-bedroom', 'Кухня': '#preview-room-kitchen', 'Детская': '#preview-room-nursery' };
  function renderPreview() {
    $$('[id^="preview-room-"]', $('#window-svg')).forEach(el => el.setAttribute('display', el.matches(roomSvg[s.room]) ? 'inline' : 'none'));
    const roman = s.curtain === 'Римские шторы', light = s.curtain === 'Лёгкие занавеси';
    $('#preview-panels').setAttribute('display', roman ? 'none' : 'inline');
    $('#preview-roman').setAttribute('display', roman ? 'inline' : 'none');
    $('#preview-sheer').setAttribute('display', roman ? 'none' : 'inline');
    $$('[class^="drape-left"], [class^="drape-right"]', $('#window-svg')).forEach(el => {
      if (el.classList.contains('drape-left') || el.classList.contains('drape-right')) el.setAttribute('fill', tones[s.tone]);
    });
    $('#preview-roman rect').setAttribute('fill', tones[s.tone]);
    $('#preview-panels').setAttribute('opacity', light ? '.46' : '1');
    $('#preview-roman').setAttribute('opacity', light ? '.5' : '1');
    $('#preview-sun').setAttribute('opacity', $('#blackout').checked ? '.18' : '.72');
    $('#preview-roof').setAttribute('display', $('#window-type').value.includes('Мансардное') ? 'inline' : 'none');
    $('#tone-value').textContent = s.tone;
    $('#preview-title').textContent = `${s.room} · ${s.curtain}`;
  }
  $('#blackout').addEventListener('change', renderPreview);
  $('#window-type').addEventListener('change', renderPreview);
  renderPreview();

  // Category samples reflect conceptual choices, not inventory.
  const fabrics = { linen: 'Льняная фактура', chenille: 'Шенилл', blackout: 'Блэкаут', voile: 'Тюль' };
  $$('[data-fabric]').forEach(button => button.addEventListener('click', () => {
    s.fabric = fabrics[button.dataset.fabric];
    $$('[data-fabric]').forEach(b => b.classList.toggle('selected', b === button));
    toast(`${s.fabric}: тип ткани добавлен в запрос.`);
  }));

  // Rod section: intentionally simplified visualization, with responsive description.
  const rods = {
    profile: { title: 'Профильный карниз', description: 'Лаконичное решение для ровных складок и нестандартной геометрии окон.' },
    roman: { title: 'Римский механизм', description: 'Подъёмная система для аккуратно складывающегося тканевого полотна.' },
    electric: { title: 'Электрокарниз', description: 'Вариант с управляемым движением штор. Совместимость и параметры нужно уточнять.' },
    decor: { title: 'Декоративный карниз', description: 'Выразительный элемент оформления, который может стать частью интерьерного акцента.' }
  };
  $$('[data-rod]').forEach(button => button.addEventListener('click', () => {
    const id = button.dataset.rod;
    $$('[data-rod]').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
    $('#rod-name').textContent = rods[id].title;
    $('#rod-description').textContent = rods[id].description;
    $('#rod-mechanism').setAttribute('display', id === 'roman' ? 'inline' : 'none');
    $('#rod-fabric').setAttribute('display', id === 'roman' ? 'none' : 'inline');
    $('#rod-motor').setAttribute('display', id === 'electric' ? 'inline' : 'none');
    $('#rod-decor').setAttribute('display', id === 'decor' ? 'inline' : 'none');
    $('#rod-track').setAttribute('stroke', id === 'decor' ? '#94755B' : '#615C54');
  }));

  // Client photo: local preview only, no upload or transmission.
  const photoInput = $('#room-photo');
  function deletePhoto() {
    if (s.photo) URL.revokeObjectURL(s.photo);
    s.photo = null; s.file = '';
    photoInput.value = '';
    $('#photo-name').textContent = 'Выбрать фотографию';
    $('#photo-preview').hidden = true;
    $('#photo-image').removeAttribute('src');
  }
  photoInput.addEventListener('change', () => {
    const file = photoInput.files?.[0];
    if (!file) { deletePhoto(); return; }
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) { deletePhoto(); toast('Поддерживаются JPG, PNG и WebP.'); return; }
    if (file.size > 8 * 1024 * 1024) { deletePhoto(); toast('Для предпросмотра выберите фотографию до 8 МБ.'); return; }
    if (s.photo) URL.revokeObjectURL(s.photo);
    s.photo = URL.createObjectURL(file); s.file = file.name;
    $('#photo-image').src = s.photo;
    $('#photo-preview').hidden = false;
    $('#photo-name').textContent = file.name;
  });
  $('#photo-delete').addEventListener('click', deletePhoto);
  window.addEventListener('pagehide', () => { if (s.photo) URL.revokeObjectURL(s.photo); });

  // Generate a complete message without inventing a price or sending customer data anywhere.
  $('#copy-request').addEventListener('click', () => {
    const width = Number($('#window-width').value), height = Number($('#window-height').value);
    const err = $('#builder-error');
    let message = '';
    if (!Number.isFinite(width) || width < 30 || width > 1200) message = 'Укажите ширину окна от 30 до 1200 см.';
    else if (!Number.isFinite(height) || height < 30 || height > 600) message = 'Укажите высоту окна от 30 до 600 см.';
    err.hidden = !message; err.textContent = message;
    if (message) { $('#window-width').focus(); return; }
    const text = [
      'Здравствуйте! Хочу обсудить оформление окна со студией «Шарм».',
      '', `Комната: ${s.room}`, `Оформление: ${s.curtain}`, `Предпочтительный оттенок: ${s.tone}`,
      `Тип ткани (ориентир): ${s.fabric}`, `Тип окна: ${$('#window-type').value}`,
      `Примерные размеры: ${width} × ${height} см`,
      `Нужно затемнение: ${$('#blackout').checked ? 'да' : 'необязательно'}`,
      `Бюджет: ${$('#budget').value}`,
      $('#comments').value.trim() ? `Пожелания: ${$('#comments').value.trim()}` : '',
      s.file ? 'Есть фотография интерьера, могу прикрепить отдельно.' : '',
      '', 'Подскажите, пожалуйста, варианты тканей, стоимость проекта и условия консультации дизайнера.'
    ].filter((line, i, all) => line !== '' || (i > 0 && all[i-1] !== '')).join('\n');
    copyText(text);
  });

  // Efficient one-time reveal animations; content visible with reduced motion or no observer.
  const reveals = $$('.rise');
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const io = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('visible');
      io.unobserve(entry.target);
    }), { threshold: .055, rootMargin: '0px 0px 55px 0px' });
    reveals.forEach(el => io.observe(el));
  } else reveals.forEach(el => el.classList.add('visible'));
})();
