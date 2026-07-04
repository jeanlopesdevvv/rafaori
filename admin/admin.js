/**
 * admin.js — Painel CMS Rafael França Advocacia
 * Lógica completa do painel de controle do blog
 * v3.0.0
 */

'use strict';

(function () {

  /* ============================================
     1. ESTADO GLOBAL
  ============================================ */
  let currentView    = 'list';
  let editingId      = null;
  let searchQuery    = '';
  let isSplitPreview = false;
  let deleteTarget   = null;
  let savedRange     = null;
  let autoSaveTimer  = null;
  let hasUnsavedChanges = false;

  /* ============================================
     2. ELEMENTOS DOM
  ============================================ */
  const $ = id => document.getElementById(id);

  const els = {
    loginScreen:     $('login-screen'),
    loginForm:       $('login-form'),
    loginPassword:   $('login-password'),
    loginError:      $('login-error'),
    loginBtn:        $('login-btn'),
    loginBtnText:    $('login-btn-text'),
    loginEye:        $('login-eye'),
    loginAttempts:   $('login-attempts'),
    btnLogout:       $('btn-logout'),

    viewList:        $('view-list'),
    viewEditor:      $('view-editor'),
    btnList:         $('btn-list'),
    btnNew:          $('btn-new'),
    newPostBtn:      $('new-post-btn'),
    cancelBtn:       $('cancel-btn'),
    cancelBtn2:      $('cancel-btn-2'),
    postsList:       $('posts-list'),
    searchInput:     $('search-input'),
    statsBar:        $('stats-bar'),
    postsCount:      $('posts-count'),

    editorTitle:     $('editor-title'),
    postForm:        $('post-form'),
    postId:          $('post-id'),
    postTitle:       $('post-title'),
    postCategory:    $('post-category'),
    postExcerpt:     $('post-excerpt'),
    postDate:        $('post-date'),
    postSlug:        $('post-slug'),
    postCoverUrl:    $('post-cover-url'),
    postContent:     $('post-content-editor'),
    contentPreviewInline: $('content-preview-inline'),
    tabEditor:       $('tab-editor'),
    tabPreviewInline:$('tab-preview-inline'),
    titleCounter:    $('title-counter'),
    excerptCounter:  $('excerpt-counter'),
    excerptStatus:   $('excerpt-status'),
    wordCount:       $('word-count'),
    saveStatus:      $('save-status'),
    saveStatusText:  $('save-status-text'),
    saveStatusBottom:$('save-status-bottom'),
    saveStatusTextBottom: $('save-status-text-bottom'),
    saveBtnTop:      $('save-btn-top'),
    saveBtn:         $('save-btn'),
    previewToggle:   $('preview-toggle'),
    previewPanel:    $('preview-panel'),
    previewContent:  $('preview-content'),
    editorLayout:    $('editor-layout'),
    coverDropzone:   $('cover-dropzone'),
    coverFileInput:  $('cover-file-input'),
    coverPreview:    $('cover-preview'),
    dropzoneInner:   $('dropzone-inner'),
    btnClearCover:   $('btn-clear-cover'),
    metaToggle:      $('meta-toggle'),
    metaBody:        $('meta-body'),

    confirmModal:    $('confirm-modal'),
    confirmNo:       $('confirm-no'),
    confirmYes:      $('confirm-yes'),
    confirmText:     $('confirm-text'),

    linkDialog:      $('link-dialog'),
    linkUrlInput:    $('link-url-input'),
    linkTextInput:   $('link-text-input'),
    linkCancel:      $('link-cancel'),
    linkConfirm:     $('link-confirm'),

    btnExport:       $('btn-export'),
    btnImport:       $('btn-import'),
  };

  /* ============================================
     3. AUTH / LOGIN
  ============================================ */
  function initAuth() {
    console.log('[Auth] Iniciando verificação de autenticação...');
    const authOk = CMS_AUTH.isAuthenticated();
    console.log('[Auth] Status da sessão ativa:', authOk);
    if (authOk) {
      console.log('[Auth] Usuário já autenticado. Carregando painel principal.');
      els.loginScreen.style.display = 'none';
      initApp();
    } else {
      console.log('[Auth] Sem sessão ativa. Exibindo tela de login.');
      els.loginScreen.style.display = 'flex';
      els.loginPassword.focus();
      showLoginState();
    }
  }

  function showLoginState() {
    const locked = CMS_AUTH.isLocked();
    console.log('[Auth] Painel bloqueado?', locked);
    if (locked) {
      const remaining = CMS_AUTH.getLockRemaining();
      console.warn('[Auth] Tentativas esgotadas. Tempo restante:', remaining);
      els.loginError.textContent = `Painel bloqueado por tentativas excessivas. Aguarde ${remaining}.`;
      els.loginBtn.disabled = true;
      setTimeout(showLoginState, 30000);
    } else {
      const attempts = CMS_AUTH.getAttempts();
      console.log('[Auth] Tentativas falhas atuais:', attempts);
      if (attempts > 0) {
        els.loginAttempts.textContent = `${attempts} de ${CMS_AUTH.MAX_ATTEMPTS} tentativas usadas.`;
      }
    }
  }

  if (els.loginEye) {
    els.loginEye.addEventListener('click', function () {
      const isPass = els.loginPassword.type === 'password';
      els.loginPassword.type = isPass ? 'text' : 'password';
      els.loginEye.textContent = isPass ? 'Ocultar' : 'Ver';
    });
  }

  if (els.loginForm) {
    console.log('[Auth] Listener do formulário registrado com sucesso.');
    els.loginForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      console.log('[Auth] Formulário enviado (Submit detectado).');
      
      if (CMS_AUTH.isLocked()) {
        console.warn('[Auth] Ação cancelada: Painel bloqueado.');
        showLoginState();
        return;
      }

      const pw = els.loginPassword.value.trim();
      console.log('[Auth] Comprimento da senha inserida:', pw.length);
      if (!pw) {
        console.warn('[Auth] Tentativa de envio com senha vazia.');
        els.loginError.textContent = 'Digite sua senha.';
        return;
      }

      els.loginBtn.disabled = true;
      els.loginBtnText.textContent = 'Verificando…';

      try {
        console.log('[Auth] Iniciando cálculo de hash e verificação...');
        const ok = await CMS_AUTH.verify(pw);
        console.log('[Auth] Resultado da verificação (verify):', ok);

        if (ok) {
          console.log('[Auth] Autenticação bem sucedida. Redirecionando para a área logada.');
          CMS_AUTH.resetAttempts();
          CMS_AUTH.setSession();
          els.loginScreen.style.display = 'none';
          initApp();
        } else {
          console.warn('[Auth] Autenticação falhou. Senha incorreta.');
          const n = CMS_AUTH.incrementAttempts();
          els.loginBtn.disabled = false;
          els.loginBtnText.textContent = 'Entrar no Painel';
          if (CMS_AUTH.isLocked()) {
            console.error('[Auth] Painel foi bloqueado devido ao excesso de erros.');
            els.loginError.textContent = 'Painel bloqueado por 30 minutos após 5 tentativas incorretas.';
            els.loginBtn.disabled = true;
          } else {
            els.loginError.textContent = `Senha incorreta. ${CMS_AUTH.MAX_ATTEMPTS - n} tentativa(s) restante(s).`;
            els.loginPassword.value = '';
            els.loginPassword.focus();
          }
        }
      } catch (err) {
        els.loginBtn.disabled = false;
        els.loginBtnText.textContent = 'Entrar no Painel';
        els.loginError.textContent = 'Erro ao verificar senha. Tente novamente.';
        console.error('[Auth] Erro inesperado capturado durante a verificação:', err);
      }
    });
  }

  if (els.btnLogout) {
    els.btnLogout.addEventListener('click', function () {
      CMS_AUTH.logout();
    });
  }

  /* ============================================
     4. APP INIT
  ============================================ */
  function initApp() {
    renderList();
    bindEvents();
  }

  /* ============================================
     5. NAVEGAÇÃO VIEWS
  ============================================ */
  function showView(view) {
    currentView = view;
    els.viewList.classList.toggle('active', view === 'list');
    els.viewEditor.classList.toggle('active', view === 'editor');
    els.btnList.classList.toggle('active', view === 'list');
    els.btnNew.classList.toggle('active', view === 'editor');

    if (view === 'list') {
      renderList();
      editingId = null;
      hasUnsavedChanges = false;
    }
  }

  /* ============================================
     6. LISTA DE POSTS
  ============================================ */
  function renderList() {
    const allPosts = CMS.getPosts();
    const query = searchQuery.toLowerCase().trim();

    const posts = query
      ? allPosts.filter(p =>
          (p.title || '').toLowerCase().includes(query) ||
          (p.excerpt || '').toLowerCase().includes(query) ||
          (p.category || '').toLowerCase().includes(query)
        )
      : allPosts;

    if (els.postsCount) els.postsCount.textContent = allPosts.length;

    if (els.statsBar) {
      els.statsBar.innerHTML = query
        ? `<span>Mostrando ${posts.length} de ${allPosts.length} artigos para "${esc(query)}"</span>`
        : `<span>${allPosts.length} artigo${allPosts.length !== 1 ? 's' : ''} publicado${allPosts.length !== 1 ? 's' : ''}</span>`;
    }

    if (!els.postsList) return;

    if (posts.length === 0) {
      els.postsList.innerHTML = `
        <div class="empty-state">
          <div class="empty-state__icon">📝</div>
          <h3>${query ? 'Nenhum resultado encontrado' : 'Nenhum artigo ainda'}</h3>
          <p>${query ? 'Tente outro termo de busca.' : 'Crie seu primeiro artigo agora!'}</p>
          ${!query ? `<button class="btn-primary" onclick="document.getElementById('new-post-btn').click()">Criar Primeiro Artigo</button>` : ''}
        </div>`;
      return;
    }

    els.postsList.innerHTML = posts.map(function (post) {
      const thumb = post.coverUrl
        ? `<div class="post-item__thumb"><img src="${esc(post.coverUrl)}" alt="" loading="lazy" /></div>`
        : `<div class="post-item__thumb"><div class="post-item__thumb-placeholder">📰</div></div>`;

      const dateStr = post.date
        ? new Date(post.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
        : '';
      const catBadge = post.category
        ? `<span class="post-item__cat">${esc(post.category)}</span>`
        : '';

      return `<div class="post-item" role="listitem" data-id="${esc(post.id)}">
        ${thumb}
        <div class="post-item__body">
          <div class="post-item__title" title="${esc(post.title)}">${esc(post.title)}</div>
          <div class="post-item__meta">${catBadge}${dateStr}</div>
        </div>
        <div class="post-item__actions">
          <a href="../post.html?id=${encodeURIComponent(post.id)}" class="btn-icon" target="_blank" rel="noopener noreferrer" title="Ver artigo publicado" aria-label="Ver artigo">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
          </a>
          <button class="btn-icon" data-action="edit" data-id="${esc(post.id)}" title="Editar artigo" aria-label="Editar artigo">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button class="btn-icon btn-icon--danger" data-action="delete" data-id="${esc(post.id)}" data-title="${esc(post.title)}" title="Excluir artigo" aria-label="Excluir artigo">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
          </button>
        </div>
      </div>`;
    }).join('');
  }

  /* ============================================
     7. EDITOR
  ============================================ */
  function openEditor(id = null) {
    editingId = id;
    hasUnsavedChanges = false;

    els.editorTitle.textContent = id ? 'Editar Artigo' : 'Novo Artigo';
    els.postId.value = id || '';
    setSaveStatus(false);

    if (id) {
      const post = CMS.getPost(id);
      if (post) {
        els.postTitle.value    = post.title || '';
        els.postExcerpt.value  = post.excerpt || '';
        els.postDate.value     = post.date || todayISO();
        els.postSlug.value     = post.slug || '';
        els.postCoverUrl.value = post.coverUrl || '';
        if (els.postCategory) els.postCategory.value = post.category || '';

        els.postContent.innerHTML = post.content || '';
        updateCoverPreview(post.coverUrl);
        updateCounters();
        updateWordCount();
      }
    } else {
      els.postForm.reset();
      els.postContent.innerHTML = '';
      els.postDate.value = todayISO();
      updateCoverPreview('');
      updateCounters();
      updateWordCount();
    }

    setSplitPreview(false);
    showView('editor');
  }

  function todayISO() {
    return new Date().toISOString().split('T')[0];
  }

  /* ============================================
     8. SALVAR
  ============================================ */
  function savePost() {
    const title   = els.postTitle.value.trim();
    const excerpt = els.postExcerpt.value.trim();
    const content = els.postContent.innerHTML.trim();
    const date    = els.postDate.value || todayISO();
    const slug    = els.postSlug.value.trim() || CMS._slugify(title);
    const coverUrl = els.postCoverUrl.value.trim();
    const category = els.postCategory ? els.postCategory.value : '';

    if (!title) {
      showToast('Preencha o título do artigo.', 'error');
      els.postTitle.focus();
      return false;
    }
    if (!excerpt) {
      showToast('Preencha o resumo do artigo.', 'error');
      els.postExcerpt.focus();
      return false;
    }

    const data = { title, excerpt, content, date, slug, coverUrl, category };

    if (editingId) {
      CMS.updatePost(editingId, data);
      showToast('✓ Artigo atualizado com sucesso!', 'success');
    } else {
      const newPost = CMS.createPost(data);
      editingId = newPost.id;
      els.postId.value = newPost.id;
      showToast('✓ Artigo criado com sucesso!', 'success');
    }

    els.editorTitle.textContent = 'Editar Artigo';
    setSaveStatus(true);
    hasUnsavedChanges = false;

    // Atraso de 1 segundo para ler o toast e então redirecionar para a lista de artigos
    setTimeout(function () {
      showView('list');
    }, 1000);

    return true;
  }

  /* ============================================
     9. EVENTS
  ============================================ */
  function bindEvents() {
    // Sidebar navigation
    if (els.btnList) els.btnList.addEventListener('click', () => {
      if (hasUnsavedChanges && !confirm('Você tem alterações não salvas. Deseja sair sem salvar?')) return;
      showView('list');
    });
    if (els.btnNew) els.btnNew.addEventListener('click', () => openEditor(null));
    if (els.newPostBtn) els.newPostBtn.addEventListener('click', () => openEditor(null));
    if (els.cancelBtn) els.cancelBtn.addEventListener('click', () => {
      if (hasUnsavedChanges && !confirm('Você tem alterações não salvas. Deseja sair sem salvar?')) return;
      showView('list');
    });
    if (els.cancelBtn2) els.cancelBtn2.addEventListener('click', () => {
      if (hasUnsavedChanges && !confirm('Você tem alterações não salvas. Deseja sair sem salvar?')) return;
      showView('list');
    });

    // Search
    if (els.searchInput) {
      els.searchInput.addEventListener('input', function () {
        searchQuery = this.value;
        renderList();
      });
    }

    // Post list actions (delegation)
    if (els.postsList) {
      els.postsList.addEventListener('click', function (e) {
        const editBtn  = e.target.closest('[data-action="edit"]');
        const delBtn   = e.target.closest('[data-action="delete"]');

        if (editBtn) { openEditor(editBtn.dataset.id); return; }
        if (delBtn)  { confirmDelete(delBtn.dataset.id, delBtn.dataset.title); return; }
      });
    }

    // Form save
    if (els.postForm) {
      els.postForm.addEventListener('submit', function (e) { e.preventDefault(); savePost(); });
    }
    if (els.saveBtnTop) els.saveBtnTop.addEventListener('click', savePost);

    // Counters & unsaved tracking
    if (els.postTitle) {
      els.postTitle.addEventListener('input', function () {
        updateCounters();
        autoUpdateSlug();
        markUnsaved();
      });
    }
    if (els.postExcerpt) {
      els.postExcerpt.addEventListener('input', function () {
        updateCounters();
        markUnsaved();
      });
    }
    if (els.postContent) {
      els.postContent.addEventListener('input', function () {
        updateWordCount();
        updateSplitPreview();
        markUnsaved();
      });
    }
    if (els.postCoverUrl) {
      els.postCoverUrl.addEventListener('input', function () {
        updateCoverPreview(this.value.trim());
        markUnsaved();
      });
    }

    // Toolbar
    document.querySelectorAll('.toolbar-btn[data-cmd]').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        const cmd = this.dataset.cmd;
        applyFormat(cmd);
      });
    });

    // Inline preview tabs
    if (els.tabEditor) {
      els.tabEditor.addEventListener('click', function () {
        els.postContent.style.display = 'block';
        els.contentPreviewInline.style.display = 'none';
        this.classList.add('active');
        this.setAttribute('aria-selected', 'true');
        els.tabPreviewInline.classList.remove('active');
        els.tabPreviewInline.setAttribute('aria-selected', 'false');
      });
    }
    if (els.tabPreviewInline) {
      els.tabPreviewInline.addEventListener('click', function () {
        els.postContent.style.display = 'none';
        els.contentPreviewInline.style.display = 'block';
        els.contentPreviewInline.innerHTML = els.postContent.innerHTML || '<p><em>Sem conteúdo ainda.</em></p>';
        this.classList.add('active');
        this.setAttribute('aria-selected', 'true');
        els.tabEditor.classList.remove('active');
        els.tabEditor.setAttribute('aria-selected', 'false');
      });
    }

    // Split Preview toggle
    if (els.previewToggle) {
      els.previewToggle.addEventListener('click', function () {
        setSplitPreview(!isSplitPreview);
      });
    }

    // Meta accordion
    if (els.metaToggle) {
      els.metaToggle.addEventListener('click', function () {
        const isExpanded = this.getAttribute('aria-expanded') === 'true';
        this.setAttribute('aria-expanded', !isExpanded);
        els.metaBody.style.display = isExpanded ? 'none' : 'flex';
      });
    }

    // Cover
    if (els.coverDropzone) {
      els.coverDropzone.addEventListener('click', function () { els.coverFileInput.click(); });
      els.coverDropzone.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); els.coverFileInput.click(); }
      });
      els.coverDropzone.addEventListener('dragover', function (e) {
        e.preventDefault();
        this.classList.add('dragover');
      });
      els.coverDropzone.addEventListener('dragleave', function () { this.classList.remove('dragover'); });
      els.coverDropzone.addEventListener('drop', function (e) {
        e.preventDefault();
        this.classList.remove('dragover');
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) handleImageFile(file);
      });
    }
    if (els.coverFileInput) {
      els.coverFileInput.addEventListener('change', function () {
        if (this.files[0]) handleImageFile(this.files[0]);
      });
    }
    if (els.btnClearCover) {
      els.btnClearCover.addEventListener('click', function () {
        els.postCoverUrl.value = '';
        updateCoverPreview('');
      });
    }

    // Delete confirm
    if (els.confirmNo) els.confirmNo.addEventListener('click', closeConfirm);
    if (els.confirmYes) {
      els.confirmYes.addEventListener('click', function () {
        if (deleteTarget) {
          CMS.deletePost(deleteTarget);
          closeConfirm();
          renderList();
          showToast('Artigo excluído.', 'success');
          deleteTarget = null;
        }
      });
    }

    // Link dialog
    if (els.linkCancel) els.linkCancel.addEventListener('click', function () { els.linkDialog.style.display = 'none'; });
    if (els.linkConfirm) {
      els.linkConfirm.addEventListener('click', function () {
        const url = els.linkUrlInput.value.trim();
        if (!url) return;
        if (savedRange) restoreSelection(savedRange);
        document.execCommand('createLink', false, url);
        els.linkDialog.style.display = 'none';
      });
    }

    // Export / Import
    if (els.btnExport) els.btnExport.addEventListener('click', function () { CMS.exportJSON(); });
    if (els.btnImport) {
      els.btnImport.addEventListener('change', function () {
        const file = this.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function (e) {
          if (CMS.importJSON(e.target.result)) {
            renderList();
            showToast('✓ Backup importado com sucesso!', 'success');
          } else {
            showToast('Arquivo inválido ou corrompido.', 'error');
          }
        };
        reader.readAsText(file);
        this.value = '';
      });
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', function (e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 's' && currentView === 'editor') {
        e.preventDefault();
        savePost();
      }
    });
  }

  /* ============================================
     10. FORMATAÇÃO RICH TEXT
  ============================================ */
  function applyFormat(cmd) {
    els.postContent.focus();
    if (cmd === 'createLink') {
      savedRange = saveSelection();
      const sel = window.getSelection();
      els.linkTextInput.value = sel && sel.toString() ? sel.toString() : '';
      els.linkUrlInput.value = '';
      els.linkDialog.style.display = 'flex';
      els.linkUrlInput.focus();
      return;
    }
    if (cmd === 'h2' || cmd === 'h3' || cmd === 'p') {
      document.execCommand('formatBlock', false, cmd);
      return;
    }
    if (cmd === 'blockquote') {
      document.execCommand('formatBlock', false, 'blockquote');
      return;
    }
    if (cmd === 'hr') {
      document.execCommand('insertHorizontalRule', false, null);
      return;
    }
    document.execCommand(cmd, false, null);
  }

  function saveSelection() {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) return sel.getRangeAt(0).cloneRange();
    return null;
  }

  function restoreSelection(range) {
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  }

  /* ============================================
     11. SPLIT PREVIEW
  ============================================ */
  function setSplitPreview(on) {
    isSplitPreview = on;
    els.editorLayout.classList.toggle('split-mode', on);
    if (els.previewPanel) els.previewPanel.style.display = on ? 'flex' : 'none';
    if (els.previewToggle) els.previewToggle.setAttribute('aria-pressed', on);
    if (on) updateSplitPreview();
  }

  function updateSplitPreview() {
    if (!isSplitPreview || !els.previewContent) return;
    els.previewContent.innerHTML = els.postContent.innerHTML || '<p><em>Sem conteúdo ainda.</em></p>';
  }

  /* ============================================
     12. COUNTERS & STATUS
  ============================================ */
  function updateCounters() {
    if (els.postTitle && els.titleCounter) {
      const len = els.postTitle.value.length;
      els.titleCounter.textContent = len;
    }
    if (els.postExcerpt && els.excerptCounter) {
      const len = els.postExcerpt.value.length;
      els.excerptCounter.textContent = len;
      const good = len >= 80 && len <= 200;
      if (els.excerptStatus) {
        els.excerptStatus.textContent = len < 80 ? 'Muito curto' : (len > 200 ? 'Ideal seria até 200' : 'Bom comprimento!');
        els.excerptStatus.style.color = good ? 'var(--emerald)' : 'var(--text-subtle)';
      }
    }
  }

  function updateWordCount() {
    if (!els.postContent || !els.wordCount) return;
    const text = els.postContent.innerText || '';
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    els.wordCount.textContent = `${words} palavra${words !== 1 ? 's' : ''}`;
  }

  function setSaveStatus(saved) {
    const cls = saved ? 'saved' : '';
    const txt = saved ? 'Salvo ✓' : 'Não salvo';
    if (els.saveStatus) { els.saveStatus.className = 'save-status ' + cls; }
    if (els.saveStatusText) els.saveStatusText.textContent = txt;
    if (els.saveStatusBottom) { els.saveStatusBottom.className = 'save-status ' + cls; }
    if (els.saveStatusTextBottom) els.saveStatusTextBottom.textContent = txt;
  }

  function markUnsaved() {
    hasUnsavedChanges = true;
    setSaveStatus(false);
  }

  function autoUpdateSlug() {
    if (!editingId && els.postTitle && els.postSlug) {
      els.postSlug.value = CMS._slugify(els.postTitle.value);
    }
  }

  /* ============================================
     13. COVER IMAGE
  ============================================ */
  function handleImageFile(file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      const dataUrl = e.target.result;
      els.postCoverUrl.value = dataUrl;
      updateCoverPreview(dataUrl);
      markUnsaved();
    };
    reader.readAsDataURL(file);
  }

  function updateCoverPreview(url) {
    if (!els.coverPreview) return;
    if (!url) {
      els.coverPreview.innerHTML = '';
      return;
    }
    els.coverPreview.innerHTML = `<img src="${esc(url)}" alt="Preview da capa" onerror="this.parentNode.innerHTML='<span style=color:var(--text-subtle);font-size:0.8rem>Imagem inválida</span>'" />`;
  }

  /* ============================================
     14. DELETE CONFIRM
  ============================================ */
  function confirmDelete(id, title) {
    deleteTarget = id;
    if (els.confirmText) {
      els.confirmText.textContent = `Você está prestes a excluir "${title || 'este artigo'}". Esta ação não pode ser desfeita.`;
    }
    els.confirmModal.style.display = 'flex';
    els.confirmNo.focus();
  }

  function closeConfirm() {
    els.confirmModal.style.display = 'none';
    deleteTarget = null;
  }

  /* ============================================
     15. TOAST
  ============================================ */
  function showToast(msg, type = 'success') {
    const container = $('toast-container');
    if (!container) return;

    const icon = type === 'success'
      ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>'
      : '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>';

    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    toast.innerHTML = `${icon}<span>${esc(msg)}</span>`;
    container.appendChild(toast);

    setTimeout(function () {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(16px)';
      toast.style.transition = 'opacity 0.3s, transform 0.3s';
      setTimeout(function () { if (toast.parentNode) toast.parentNode.removeChild(toast); }, 300);
    }, 3500);
  }

  /* ============================================
     16. UTILITÁRIOS
  ============================================ */
  function esc(s) {
    return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  /* ============================================
     17. INICIALIZAR
  ============================================ */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAuth);
  } else {
    initAuth();
  }

})();
