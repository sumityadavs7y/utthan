(function () {
  const modal = document.querySelector('[data-cms-modal]');
  if (!modal) return;

  const form = modal.querySelector('[data-cms-form]');
  const fieldsEl = modal.querySelector('[data-cms-fields]');
  const titleEl = modal.querySelector('[data-cms-title]');
  const errorEl = modal.querySelector('[data-cms-error]');
  const csrf = document.querySelector('meta[name="csrf-token"]');
  const csrfToken = csrf ? csrf.getAttribute('content') : (form.querySelector('[name="_csrf"]') || {}).value;

  let currentType = null;
  let currentId = null;
  let currentMode = 'single';
  let listRowIndex = 0;
  let timelineRowIndex = 0;

  function closeModal() {
    modal.hidden = true;
    document.body.classList.remove('cms-open');
    currentMode = 'single';
  }

  function showError(message) {
    errorEl.hidden = !message;
    errorEl.textContent = message || '';
  }

  function photoTile(item, keepName) {
    const tile = document.createElement('div');
    tile.className = 'cms-photo-tile';
    const img = document.createElement('img');
    img.src = item.url || '';
    img.alt = '';
    const keep = document.createElement('input');
    keep.type = 'hidden';
    keep.name = keepName;
    keep.value = String(item.id);
    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'cms-photo-tile__remove';
    removeBtn.setAttribute('aria-label', 'Remove photo');
    removeBtn.textContent = 'Remove';
    removeBtn.addEventListener('click', function (event) {
      event.preventDefault();
      tile.remove();
    });
    tile.appendChild(img);
    tile.appendChild(keep);
    tile.appendChild(removeBtn);
    return tile;
  }

  function photoManager(config) {
    const box = document.createElement('div');
    box.className = 'cms-photos';
    const heading = document.createElement('span');
    heading.textContent = config.label || 'Photos';
    box.appendChild(heading);

    if (config.managedName) {
      const managed = document.createElement('input');
      managed.type = 'hidden';
      managed.name = config.managedName;
      managed.value = '1';
      box.appendChild(managed);
    }

    const row = document.createElement('div');
    row.className = 'cms-preview-row';
    (config.items || []).forEach(function (item) {
      if (!item || !item.id) return;
      row.appendChild(photoTile(item, config.keepName));
    });
    box.appendChild(row);

    const hint = document.createElement('span');
    hint.className = 'cms-hint';
    hint.textContent = 'Add more photos, or remove any existing one.';
    box.appendChild(hint);

    const input = document.createElement('input');
    input.type = 'file';
    input.name = config.fileName;
    input.accept = 'image/jpeg,image/png,image/webp,image/gif,image/svg+xml';
    input.multiple = true;
    box.appendChild(input);
    return box;
  }

  function addTimelineRow(item) {
    const index = timelineRowIndex;
    timelineRowIndex += 1;
    const row = document.createElement('article');
    row.className = 'cms-list-row';
    row.dataset.rowIndex = String(index);

    const heading = document.createElement('header');
    heading.className = 'cms-list-row__head';
    const titleEl = document.createElement('strong');
    const initialTitle = (item && (item.title || item.date)) || 'New timeline item';
    titleEl.textContent = initialTitle;
    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'cms-btn cms-btn--danger';
    removeBtn.textContent = 'Delete';
    heading.appendChild(titleEl);
    heading.appendChild(removeBtn);

    const removeInput = document.createElement('input');
    removeInput.type = 'hidden';
    removeInput.name = 'timeline_' + index + '_remove';
    removeInput.value = '0';

    const dateLabel = document.createElement('label');
    dateLabel.appendChild(document.createTextNode('Date'));
    const dateInput = document.createElement('input');
    dateInput.type = 'date';
    dateInput.name = 'timeline_' + index + '_date';
    dateInput.value = item && item.date ? String(item.date).slice(0, 10) : '';
    dateLabel.appendChild(dateInput);

    const titleLabel = document.createElement('label');
    titleLabel.appendChild(document.createTextNode('Title'));
    const titleInput = document.createElement('input');
    titleInput.type = 'text';
    titleInput.name = 'timeline_' + index + '_title';
    titleInput.value = item && item.title ? item.title : '';
    titleLabel.appendChild(titleInput);

    function refreshHeading() {
      titleEl.textContent = titleInput.value.trim() || dateInput.value || 'New timeline item';
    }
    titleInput.addEventListener('input', refreshHeading);
    dateInput.addEventListener('input', refreshHeading);

    const detailLabel = document.createElement('label');
    detailLabel.appendChild(document.createTextNode('Description'));
    const detailInput = document.createElement('textarea');
    detailInput.name = 'timeline_' + index + '_detail';
    detailInput.rows = 3;
    detailInput.value = item && item.detail ? item.detail : '';
    detailLabel.appendChild(detailInput);

    const photos = photoManager({
      label: 'Photos',
      items: (item && item.photosItems) || [],
      keepName: 'timeline_' + index + '_photoKeep',
      fileName: 'timeline_' + index + '_photos'
    });

    removeBtn.addEventListener('click', function (event) {
      event.preventDefault();
      event.stopPropagation();
      if (!item || (!item.date && !item.title && !item.detail && !(item.photosItems || []).length)) {
        row.remove();
        return;
      }
      removeInput.value = '1';
      row.classList.add('is-removed');
      row.hidden = true;
    });

    row.appendChild(heading);
    row.appendChild(removeInput);
    row.appendChild(dateLabel);
    row.appendChild(titleLabel);
    row.appendChild(detailLabel);
    row.appendChild(photos);
    return row;
  }

  function timelineEditor(items) {
    timelineRowIndex = 0;
    const box = document.createElement('div');
    box.className = 'cms-timeline';

    const heading = document.createElement('span');
    heading.textContent = 'Timeline';
    box.appendChild(heading);

    const hint = document.createElement('span');
    hint.className = 'cms-hint';
    hint.textContent = 'Add a timeline item for each date. Photos appear under that day’s description.';
    box.appendChild(hint);

    const list = document.createElement('div');
    list.className = 'cms-list';
    list.setAttribute('data-cms-timeline', '');
    (items || []).forEach(function (item) {
      list.appendChild(addTimelineRow(item));
    });
    box.appendChild(list);

    const addBtn = document.createElement('button');
    addBtn.type = 'button';
    addBtn.className = 'btn btn--secondary';
    addBtn.textContent = 'Add item';
    addBtn.addEventListener('click', function () {
      list.appendChild(addTimelineRow({}));
    });
    box.appendChild(addBtn);
    return box;
  }

  function inputFor(field, values) {
    const wrap = document.createElement('label');
    wrap.className = field.type === 'checkbox' ? 'cms-check' : '';
    const value = values[field.name];
    const previewKey = field.name + 'Preview';

    if (field.type === 'textarea') {
      wrap.appendChild(document.createTextNode(field.label));
      const area = document.createElement('textarea');
      area.name = field.name;
      area.rows = field.name === 'body' || field.name === 'content' ? 8 : 5;
      area.value = value == null ? '' : String(value);
      if (field.required) area.required = true;
      wrap.appendChild(area);
      return wrap;
    }

    if (field.type === 'select') {
      wrap.appendChild(document.createTextNode(field.label));
      const select = document.createElement('select');
      select.name = field.name;
      (field.options || []).forEach(function (opt) {
        const option = document.createElement('option');
        option.value = opt.value;
        option.textContent = opt.label;
        if (String(value) === String(opt.value)) option.selected = true;
        select.appendChild(option);
      });
      wrap.appendChild(select);
      return wrap;
    }

    if (field.type === 'checkbox') {
      const input = document.createElement('input');
      input.type = 'checkbox';
      input.name = field.name;
      input.value = '1';
      input.checked = value === true || value === '1' || value === 'true' || (field.name === 'showName' && value == null);
      wrap.appendChild(input);
      wrap.appendChild(document.createTextNode(' ' + field.label));
      return wrap;
    }

    if (field.type === 'timeline') {
      return timelineEditor(values.timelineItems || []);
    }

    if (field.type === 'files') {
      return photoManager({
        label: field.label,
        items: values.photosItems || [],
        keepName: 'photosKeep',
        fileName: field.name,
        managedName: 'photosManaged'
      });
    }

    if (field.type === 'file') {
      wrap.appendChild(document.createTextNode(field.label));
      if (values[previewKey]) {
        const img = document.createElement('img');
        img.className = 'cms-preview';
        img.src = values[previewKey];
        img.alt = '';
        wrap.appendChild(img);
      }
      const input = document.createElement('input');
      input.type = 'file';
      input.name = field.name;
      input.accept = 'image/jpeg,image/png,image/webp,image/gif,image/svg+xml';
      wrap.appendChild(input);
      return wrap;
    }

    wrap.appendChild(document.createTextNode(field.label));
    const input = document.createElement('input');
    input.type = field.type || 'text';
    input.name = field.name;
    input.value = value == null ? '' : String(value);
    if (field.required) input.required = true;
    wrap.appendChild(input);
    return wrap;
  }

  function openEditor(payload) {
    currentMode = 'single';
    currentType = payload.type;
    currentId = payload.id;
    titleEl.textContent = (payload.id ? 'Edit ' : 'Add ') + (payload.label || 'content');
    fieldsEl.innerHTML = '';
    showError('');
    (payload.fields || []).forEach(function (field) {
      fieldsEl.appendChild(inputFor(field, payload.values || {}));
    });
    if (!payload.id && payload.values && Object.keys(payload.values).length) {
      const hidden = document.createElement('input');
      hidden.type = 'hidden';
      hidden.name = 'extra';
      hidden.value = JSON.stringify(payload.values);
      fieldsEl.appendChild(hidden);
    }
    modal.hidden = false;
    document.body.classList.add('cms-open');
  }

  function addPartnerRow(item) {
    const index = listRowIndex;
    listRowIndex += 1;
    const row = document.createElement('article');
    row.className = 'cms-list-row';
    row.dataset.rowIndex = String(index);

    const heading = document.createElement('header');
    heading.className = 'cms-list-row__head';
    const title = document.createElement('strong');
    title.textContent = item && item.id ? (item.name || 'Partner') : 'New partner';
    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'cms-btn cms-btn--danger';
    removeBtn.textContent = 'Delete';
    heading.appendChild(title);
    heading.appendChild(removeBtn);

    const idInput = document.createElement('input');
    idInput.type = 'hidden';
    idInput.name = 'row_' + index + '_id';
    idInput.value = item && item.id ? item.id : '';

    const removeInput = document.createElement('input');
    removeInput.type = 'hidden';
    removeInput.name = 'row_' + index + '_remove';
    removeInput.value = '0';

    const nameLabel = document.createElement('label');
    nameLabel.appendChild(document.createTextNode('Name *'));
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.name = 'row_' + index + '_name';
    nameInput.required = true;
    nameInput.value = item && item.name ? item.name : '';
    nameInput.addEventListener('input', function () {
      title.textContent = nameInput.value.trim() || (item && item.id ? 'Partner' : 'New partner');
    });
    nameLabel.appendChild(nameInput);

    const showLabel = document.createElement('label');
    showLabel.className = 'cms-check';
    const showInput = document.createElement('input');
    showInput.type = 'checkbox';
    showInput.name = 'row_' + index + '_showName';
    showInput.value = '1';
    showInput.checked = !item || item.showName !== false;
    showLabel.appendChild(showInput);
    showLabel.appendChild(document.createTextNode(' Show name'));

    const logoLabel = document.createElement('label');
    logoLabel.appendChild(document.createTextNode('Logo'));
    if (item && item.logoPreview) {
      const img = document.createElement('img');
      img.className = 'cms-preview';
      img.src = item.logoPreview;
      img.alt = '';
      logoLabel.appendChild(img);
    }
    const logoInput = document.createElement('input');
    logoInput.type = 'file';
    logoInput.name = 'row_' + index + '_logo';
    logoInput.accept = 'image/jpeg,image/png,image/webp,image/gif,image/svg+xml';
    logoLabel.appendChild(logoInput);

    removeBtn.addEventListener('click', function (event) {
      event.preventDefault();
      event.stopPropagation();
      nameInput.required = false;
      nameInput.disabled = true;
      if (!idInput.value) {
        row.remove();
        return;
      }
      removeInput.value = '1';
      row.classList.add('is-removed');
      row.hidden = true;
    });

    row.appendChild(heading);
    row.appendChild(idInput);
    row.appendChild(removeInput);
    row.appendChild(nameLabel);
    row.appendChild(showLabel);
    row.appendChild(logoLabel);
    return row;
  }

  function openListEditor(payload) {
    currentMode = 'list';
    currentType = payload.type;
    currentId = null;
    listRowIndex = 0;
    titleEl.textContent = 'Edit ' + (payload.label || 'list');
    fieldsEl.innerHTML = '';
    showError('');

    const headingBox = document.createElement('div');
    headingBox.className = 'cms-list-heading';
    const titleLabel = document.createElement('label');
    titleLabel.appendChild(document.createTextNode('Section title'));
    const titleInput = document.createElement('input');
    titleInput.type = 'text';
    titleInput.name = 'headingTitle';
    titleInput.value = payload.heading && payload.heading.title ? payload.heading.title : '';
    titleLabel.appendChild(titleInput);
    const ledeLabel = document.createElement('label');
    ledeLabel.appendChild(document.createTextNode('Section text'));
    const ledeInput = document.createElement('textarea');
    ledeInput.name = 'headingLede';
    ledeInput.rows = 3;
    ledeInput.value = payload.heading && payload.heading.lede ? payload.heading.lede : '';
    ledeLabel.appendChild(ledeInput);
    headingBox.appendChild(titleLabel);
    headingBox.appendChild(ledeLabel);
    fieldsEl.appendChild(headingBox);

    const list = document.createElement('div');
    list.className = 'cms-list';
    list.setAttribute('data-cms-list-rows', '');
    (payload.items || []).forEach(function (item) {
      list.appendChild(addPartnerRow(item));
    });
    fieldsEl.appendChild(list);

    const addBtn = document.createElement('button');
    addBtn.type = 'button';
    addBtn.className = 'btn btn--secondary';
    addBtn.textContent = 'Add partner';
    addBtn.addEventListener('click', function () {
      list.appendChild(addPartnerRow({ showName: true }));
    });
    fieldsEl.appendChild(addBtn);

    modal.hidden = false;
    document.body.classList.add('cms-open');
  }

  async function loadEditor(type, id, extra) {
    const url = id
      ? '/cms/' + encodeURIComponent(type) + '/' + encodeURIComponent(id)
      : '/cms/' + encodeURIComponent(type) + (extra ? ('?extra=' + encodeURIComponent(extra)) : '');
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    const data = await res.json();
    if (!data.ok) throw new Error(data.error || 'Could not load editor.');
    openEditor(data);
  }

  async function loadList(type) {
    const res = await fetch('/cms/list/' + encodeURIComponent(type), {
      headers: { Accept: 'application/json' }
    });
    const data = await res.json();
    if (!data.ok) throw new Error(data.error || 'Could not load list.');
    openListEditor(data);
  }

  document.addEventListener('click', function (event) {
    const listBtn = event.target.closest('[data-cms-list]');
    if (listBtn) {
      event.preventDefault();
      loadList(listBtn.getAttribute('data-cms-list')).catch(function (err) {
        alert(err.message);
      });
      return;
    }

    const editBtn = event.target.closest('[data-cms-edit]');
    if (editBtn) {
      event.preventDefault();
      loadEditor(editBtn.getAttribute('data-cms-edit'), editBtn.getAttribute('data-id')).catch(function (err) {
        alert(err.message);
      });
      return;
    }

    const addBtn = event.target.closest('[data-cms-add]');
    if (addBtn) {
      event.preventDefault();
      loadEditor(addBtn.getAttribute('data-cms-add'), null, addBtn.getAttribute('data-cms-extra')).catch(function (err) {
        alert(err.message);
      });
      return;
    }

    const delBtn = event.target.closest('[data-cms-delete]');
    if (delBtn) {
      event.preventDefault();
      if (!confirm('Delete this item?')) return;
      const type = delBtn.getAttribute('data-cms-delete');
      const id = delBtn.getAttribute('data-id');
      const body = new URLSearchParams();
      body.set('_csrf', csrfToken || '');
      fetch('/cms/' + encodeURIComponent(type) + '/' + encodeURIComponent(id) + '/delete', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded',
          'X-CSRF-Token': csrfToken || ''
        },
        body: body.toString()
      })
        .then(function (res) { return res.json(); })
        .then(function (data) {
          if (!data.ok) throw new Error(data.error || 'Could not delete.');
          window.location.reload();
        })
        .catch(function (err) {
          alert(err.message);
        });
    }

    if (event.target.closest('[data-cms-close]')) {
      closeModal();
    }
  });

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    showError('');
    const data = new FormData(form);
    if (csrfToken) data.set('_csrf', csrfToken);

    let url;
    if (form.querySelector('[data-cms-timeline]')) {
      data.set('timelineCount', String(timelineRowIndex));
    }

    if (currentMode === 'list') {
      data.set('rowCount', String(listRowIndex));
      url = '/cms/list/' + encodeURIComponent(currentType);
    } else {
      url = currentId
        ? '/cms/' + encodeURIComponent(currentType) + '/' + encodeURIComponent(currentId)
        : '/cms/' + encodeURIComponent(currentType);
    }

    fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'X-CSRF-Token': csrfToken || '',
        'X-Requested-With': 'XMLHttpRequest'
      },
      body: data
    })
      .then(function (res) { return res.json().then(function (json) { return { ok: res.ok, json: json }; }); })
      .then(function (result) {
        if (!result.json.ok) throw new Error(result.json.error || 'Could not save.');
        window.location.reload();
      })
      .catch(function (err) {
        showError(err.message);
      });
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && !modal.hidden) closeModal();
  });
})();
