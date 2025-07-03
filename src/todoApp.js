function createTodoApp(container) {
  container.innerHTML = `
    <header>
      <h1>TODOアプリ</h1>
      <button class="theme-toggle" aria-label="テーマを切り替え" title="ダークモード切り替え">
        <span class="theme-icon">🌙</span>
      </button>
    </header>
    <main id="main-content">
      <nav class="tab-navigation">
        <button class="tab-button active" data-tab="todos">TODO</button>
        <button class="tab-button" data-tab="stats">統計</button>
      </nav>
      
      <div class="tab-content">
        <div class="tab-pane active" data-pane="todos">
          <form id="todo-form">
            <input 
              type="text" 
              placeholder="TODOを入力"
              aria-label="TODO入力"
            />
            <button type="submit">追加</button>
          </form>
          
          <div class="search-container">
            <input 
              type="search"
              placeholder="TODOを検索..."
              aria-label="TODO検索"
              class="search-input"
            />
          </div>
          
          <nav class="filter-navigation">
            <button class="filter-button" data-filter="all">全て</button>
            <button class="filter-button" data-filter="incomplete">未完了</button>
            <button class="filter-button" data-filter="completed">完了済み</button>
            <button class="selection-mode-toggle">複数選択モード</button>
          </nav>
          
          <div class="bulk-selection-header" style="display: none;">
            <label class="select-all-container">
              <input type="checkbox" class="select-all-checkbox" aria-label="全て選択">
              <span>全て選択</span>
            </label>
          </div>
          
          <div class="bulk-actions-toolbar" style="display: none;">
            <button class="bulk-complete">一括完了</button>
            <button class="bulk-uncomplete">一括未完了</button>
            <button class="bulk-delete">一括削除</button>
            <span class="selected-count">0個選択中</span>
          </div>
          
          <ul id="todo-list" aria-label="TODOリスト"></ul>
          <div id="status-message" class="sr-only" aria-live="polite" aria-atomic="true"></div>
        </div>
        
        <div class="tab-pane" data-pane="stats">
          <div class="stats-container">
            <div class="stats-header">
              <select class="date-range-filter" aria-label="期間フィルター">
                <option value="today">今日</option>
                <option value="week">今週</option>
                <option value="month">今月</option>
                <option value="all" selected>全期間</option>
              </select>
              <div class="export-buttons">
                <button class="export-json">JSONエクスポート</button>
                <button class="export-csv">CSVエクスポート</button>
              </div>
            </div>
            
            <div class="import-section">
              <h3>データインポート</h3>
              <div class="import-controls">
                <input type="file" class="import-file-input" accept=".json,.csv" aria-label="インポートファイル選択">
                <button class="import-button">インポート</button>
              </div>
              <p class="import-help">JSON形式またはCSV形式のファイルをインポートできます。</p>
            </div>
            
            <div class="stats-summary">
              <div class="stat-card">
                <h3>総タスク数</h3>
                <div class="stat-value stat-total">0</div>
              </div>
              <div class="stat-card">
                <h3>完了</h3>
                <div class="stat-value stat-completed">0</div>
              </div>
              <div class="stat-card">
                <h3>未完了</h3>
                <div class="stat-value stat-incomplete">0</div>
              </div>
              <div class="stat-card">
                <h3>完了率</h3>
                <div class="stat-value stat-completion-rate">0%</div>
              </div>
            </div>
            
            <div class="stats-streak">
              <h3>連続完了日数</h3>
              <div class="stat-value stat-streak">0日</div>
            </div>
            
            <div class="daily-chart">
              <h3>日別完了推移</h3>
              <canvas id="daily-chart" width="400" height="200"></canvas>
            </div>
          </div>
        </div>
      </div>
    </main>
  `;
  
  const form = container.querySelector('#todo-form');
  const input = form.querySelector('input[type="text"]');
  const todoList = container.querySelector('#todo-list');
  const searchInput = container.querySelector('input[type="search"]');
  const themeToggle = container.querySelector('.theme-toggle');
  const themeIcon = container.querySelector('.theme-icon');
  
  // LocalStorageからデータを読み込み
  let todos = loadFromLocalStorage();
  let nextId = calculateNextId(todos);
  let editingId = null;
  let currentFilter = 'all';
  let searchQuery = '';
  let draggedTodo = null;
  let currentTheme = 'light';
  
  // 一括操作関連の変数
  let isSelectionMode = false;
  let selectedTodos = new Set();
  let lastSelectedId = null;
  
  // コメント機能関連の変数
  let comments = loadCommentsFromLocalStorage();
  let nextCommentId = calculateNextCommentId(comments);
  
  // LocalStorage関連のヘルパー関数
  function loadFromLocalStorage() {
    try {
      const saved = localStorage.getItem('todos');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // 既存のTODOにorderプロパティがない場合は追加
          // createdAt, completedAtがない場合も追加
          return parsed.map((todo, index) => ({
            ...todo,
            order: todo.order !== undefined ? todo.order : index,
            createdAt: todo.createdAt || new Date().toISOString(),
            completedAt: todo.completedAt || null
          }));
        }
      }
    } catch (error) {
      console.error('Failed to load todos from localStorage:', error);
    }
    return [];
  }
  
  function saveToLocalStorage() {
    try {
      localStorage.setItem('todos', JSON.stringify(todos));
    } catch (error) {
      console.error('Failed to save todos to localStorage:', error);
    }
  }
  
  function calculateNextId(todoList) {
    if (todoList.length === 0) return 1;
    const maxId = Math.max(...todoList.map(todo => todo.id || 0));
    return maxId + 1;
  }
  
  // コメント関連のヘルパー関数
  function loadCommentsFromLocalStorage() {
    try {
      const saved = localStorage.getItem('comments');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (error) {
      console.error('Failed to load comments from localStorage:', error);
    }
    return [];
  }
  
  function saveCommentsToLocalStorage() {
    try {
      localStorage.setItem('comments', JSON.stringify(comments));
    } catch (error) {
      console.error('Failed to save comments to localStorage:', error);
    }
  }
  
  function calculateNextCommentId(commentList) {
    if (commentList.length === 0) return 1;
    const maxId = Math.max(...commentList.map(comment => {
      const idNum = parseInt(comment.id.replace('comment-', ''), 10);
      return isNaN(idNum) ? 0 : idNum;
    }));
    return maxId + 1;
  }
  
  function getCommentsForTodo(todoId) {
    return comments.filter(comment => comment.todoId === todoId);
  }
  
  function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
  
  // デバウンス関数
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // テーマ管理関数
  function initializeTheme() {
    // LocalStorageから保存されたテーマを取得
    const savedTheme = localStorage.getItem('theme');
    
    // window.matchMediaが利用可能かチェック（テスト環境対応）
    if (typeof window.matchMedia === 'function') {
      // システムのテーマ設定を検出
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      
      // テーマを決定（保存されたテーマ > システム設定 > デフォルト）
      if (savedTheme) {
        currentTheme = savedTheme;
      } else if (prefersDark) {
        currentTheme = 'dark';
      }
      
      // システムテーマの変更を監視
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
          currentTheme = e.matches ? 'dark' : 'light';
          applyTheme(currentTheme);
        }
      });
    } else {
      // テスト環境の場合
      if (savedTheme) {
        currentTheme = savedTheme;
      }
    }
    
    // テーマを適用
    applyTheme(currentTheme);
  }
  
  function applyTheme(theme) {
    // HTMLドキュメント要素にテーマ属性を設定
    document.documentElement.setAttribute('data-theme', theme);
    
    // ボディ要素にもクラスを追加（CSS互換性のため）
    document.body.className = document.body.className.replace(/\s*(light|dark)-theme/g, '');
    document.body.classList.add(`${theme}-theme`);
    
    const themeIcon = container.querySelector('.theme-icon');
    const themeToggle = container.querySelector('.theme-toggle');
    
    if (themeIcon) {
      themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
    }
    
    if (themeToggle) {
      themeToggle.setAttribute('aria-label', 
        theme === 'dark' ? 'ライトモードに切り替え' : 'ダークモードに切り替え'
      );
    }
  }
  
  function toggleTheme() {
    currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(currentTheme);
    localStorage.setItem('theme', currentTheme);
  }
  
  // ドラッグ&ドロップのハンドラ関数
  function handleDragStart(e) {
    draggedTodo = todos.find(todo => todo.id === parseInt(e.target.dataset.todoId));
    e.target.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', e.target.dataset.todoId);
  }
  
  function handleDragEnd(e) {
    e.target.classList.remove('dragging');
    // すべてのdrag-overクラスを削除
    container.querySelectorAll('.drag-over').forEach(item => {
      item.classList.remove('drag-over');
    });
  }
  
  function handleDragOver(e) {
    if (e.preventDefault) {
      e.preventDefault(); // ドロップを許可
    }
    e.dataTransfer.dropEffect = 'move';
    
    const todoItem = e.target.closest('.todo-item');
    if (todoItem && !todoItem.classList.contains('dragging')) {
      todoItem.classList.add('drag-over');
    }
    
    return false;
  }
  
  function handleDragLeave(e) {
    const todoItem = e.target.closest('.todo-item');
    if (todoItem) {
      todoItem.classList.remove('drag-over');
    }
  }
  
  function handleDrop(e) {
    if (e.stopPropagation) {
      e.stopPropagation();
    }
    e.preventDefault();
    
    const todoItem = e.target.closest('.todo-item');
    if (todoItem) {
      todoItem.classList.remove('drag-over');
      
      const droppedId = parseInt(todoItem.dataset.todoId);
      const draggedId = parseInt(e.dataTransfer.getData('text/plain'));
      
      if (draggedId !== droppedId) {
        // 並び替えを実行
        reorderTodos(draggedId, droppedId);
      }
    }
    
    return false;
  }
  
  // キーボードによる並び替え
  function handleKeyDown(e) {
    if (e.shiftKey && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
      e.preventDefault();
      const todoId = parseInt(e.target.dataset.todoId);
      const todo = todos.find(t => t.id === todoId);
      if (!todo) return;
      
      const sortedTodos = [...todos].sort((a, b) => a.order - b.order);
      const currentIndex = sortedTodos.findIndex(t => t.id === todoId);
      
      if (e.key === 'ArrowUp' && currentIndex > 0) {
        const targetTodo = sortedTodos[currentIndex - 1];
        reorderTodos(todoId, targetTodo.id, 'before');
      } else if (e.key === 'ArrowDown' && currentIndex < sortedTodos.length - 1) {
        const targetTodo = sortedTodos[currentIndex + 1];
        reorderTodos(todoId, targetTodo.id, 'after');
      }
      
      // フォーカスを維持
      setTimeout(() => {
        const newItem = container.querySelector(`[data-todo-id="${todoId}"]`);
        if (newItem) newItem.focus();
      }, 0);
    } else if (isSelectionMode && e.key === ' ') {
      e.preventDefault();
      const todoId = parseInt(e.target.dataset.todoId);
      if (todoId) {
        toggleTodoSelection(todoId);
      }
    }
  }
  
  // 一括操作関連の関数
  function toggleSelectionMode() {
    isSelectionMode = !isSelectionMode;
    selectedTodos.clear();
    lastSelectedId = null;
    
    const selectionModeButton = container.querySelector('.selection-mode-toggle');
    const bulkSelectionHeader = container.querySelector('.bulk-selection-header');
    const bulkActionsToolbar = container.querySelector('.bulk-actions-toolbar');
    
    if (isSelectionMode) {
      selectionModeButton.textContent = '選択を終了';
      selectionModeButton.classList.add('active');
      bulkSelectionHeader.style.display = 'block';
    } else {
      selectionModeButton.textContent = '複数選択モード';
      selectionModeButton.classList.remove('active');
      bulkSelectionHeader.style.display = 'none';
      bulkActionsToolbar.style.display = 'none';
    }
    
    render();
  }
  
  function toggleTodoSelection(todoId, isShiftClick = false) {
    if (isShiftClick && lastSelectedId) {
      // 範囲選択の実装
      selectRange(lastSelectedId, todoId);
    } else {
      // 単一選択/選択解除
      if (selectedTodos.has(todoId)) {
        selectedTodos.delete(todoId);
      } else {
        selectedTodos.add(todoId);
        lastSelectedId = todoId;
      }
    }
    
    updateBulkActionsVisibility();
    render();
  }
  
  function selectRange(startId, endId) {
    const sortedTodos = [...todos].sort((a, b) => a.order - b.order);
    const startIndex = sortedTodos.findIndex(t => t.id === startId);
    const endIndex = sortedTodos.findIndex(t => t.id === endId);
    
    if (startIndex === -1 || endIndex === -1) return;
    
    const start = Math.min(startIndex, endIndex);
    const end = Math.max(startIndex, endIndex);
    
    for (let i = start; i <= end; i++) {
      selectedTodos.add(sortedTodos[i].id);
    }
  }
  
  function selectAll() {
    const selectAllCheckbox = container.querySelector('.select-all-checkbox');
    
    if (selectAllCheckbox.checked) {
      // 全選択
      todos.forEach(todo => selectedTodos.add(todo.id));
    } else {
      // 全選択解除
      selectedTodos.clear();
    }
    
    updateBulkActionsVisibility();
    render();
  }
  
  function updateSelectAllState() {
    const selectAllCheckbox = container.querySelector('.select-all-checkbox');
    if (!selectAllCheckbox) return;
    
    const totalTodos = todos.length;
    const selectedCount = selectedTodos.size;
    
    if (selectedCount === 0) {
      selectAllCheckbox.checked = false;
      selectAllCheckbox.indeterminate = false;
    } else if (selectedCount === totalTodos) {
      selectAllCheckbox.checked = true;
      selectAllCheckbox.indeterminate = false;
    } else {
      selectAllCheckbox.checked = false;
      selectAllCheckbox.indeterminate = true;
    }
  }
  
  function updateBulkActionsVisibility() {
    const bulkActionsToolbar = container.querySelector('.bulk-actions-toolbar');
    const selectedCountSpan = container.querySelector('.selected-count');
    
    if (selectedTodos.size > 0) {
      bulkActionsToolbar.style.display = 'block';
      selectedCountSpan.textContent = `${selectedTodos.size}個選択中`;
    } else {
      bulkActionsToolbar.style.display = 'none';
    }
  }
  
  function bulkComplete() {
    selectedTodos.forEach(todoId => {
      const todo = todos.find(t => t.id === todoId);
      if (todo && !todo.completed) {
        todo.completed = true;
        todo.completedAt = new Date().toISOString();
      }
    });
    
    saveToLocalStorage();
    render();
  }
  
  function bulkUncomplete() {
    selectedTodos.forEach(todoId => {
      const todo = todos.find(t => t.id === todoId);
      if (todo && todo.completed) {
        todo.completed = false;
        todo.completedAt = null;
      }
    });
    
    saveToLocalStorage();
    render();
  }
  
  function bulkDelete() {
    const selectedCount = selectedTodos.size;
    if (selectedCount === 0) return;
    
    // テスト環境でwindow.confirmが使えない場合の対応
    const shouldDelete = typeof window.confirm === 'function'
      ? window.confirm(`選択された${selectedCount}個のTODOを削除しますか？`)
      : true;
    
    if (shouldDelete) {
      todos = todos.filter(todo => !selectedTodos.has(todo.id));
      selectedTodos.clear();
      
      saveToLocalStorage();
      updateBulkActionsVisibility();
      render();
    }
  }

  // TODOの並び替え関数
  function reorderTodos(draggedId, targetId, position = 'after') {
    const draggedTodo = todos.find(t => t.id === draggedId);
    const targetTodo = todos.find(t => t.id === targetId);
    
    if (!draggedTodo || !targetTodo) return;
    
    // 現在の順序でソート
    const sortedTodos = [...todos].sort((a, b) => a.order - b.order);
    
    // ドラッグされたアイテムを除外
    const filteredTodos = sortedTodos.filter(t => t.id !== draggedId);
    
    // ターゲットの位置を見つける
    const targetIndex = filteredTodos.findIndex(t => t.id === targetId);
    
    // 新しい位置に挿入
    const insertIndex = position === 'before' ? targetIndex : targetIndex + 1;
    filteredTodos.splice(insertIndex, 0, draggedTodo);
    
    // order値を更新
    filteredTodos.forEach((todo, index) => {
      todo.order = index;
    });
    
    saveToLocalStorage();
    render();
  }
  
  function render() {
    todoList.innerHTML = '';
    
    // orderプロパティでソート
    const sortedTodos = [...todos].sort((a, b) => a.order - b.order);
    
    // フィルターと検索条件に基づいてTODOを表示
    const filteredTodos = sortedTodos.filter(todo => {
      // フィルター条件
      let passesFilter = true;
      if (currentFilter === 'incomplete') passesFilter = !todo.completed;
      else if (currentFilter === 'completed') passesFilter = todo.completed;
      
      // 検索条件（大文字小文字を区別しない）
      let passesSearch = true;
      if (searchQuery) {
        passesSearch = todo.text.toLowerCase().includes(searchQuery.toLowerCase());
      }
      
      return passesFilter && passesSearch;
    });
    
    filteredTodos.forEach((todo, index) => {
      const li = document.createElement('li');
      li.className = 'todo-item';
      if (todo.completed) {
        li.classList.add('completed');
      }
      
      // ドラッグ&ドロップ機能の追加
      li.draggable = true;
      li.dataset.todoId = todo.id;
      li.tabIndex = 0; // キーボードフォーカス可能にする
      
      // ドラッグイベントハンドラ
      li.addEventListener('dragstart', handleDragStart);
      li.addEventListener('dragend', handleDragEnd);
      li.addEventListener('dragover', handleDragOver);
      li.addEventListener('drop', handleDrop);
      li.addEventListener('dragleave', handleDragLeave);
      
      // キーボードイベントハンドラ
      li.addEventListener('keydown', handleKeyDown);
      
      if (editingId === todo.id) {
        // 編集モード
        const editInput = document.createElement('input');
        editInput.type = 'text';
        editInput.className = 'edit-input';
        editInput.value = todo.text;
        
        let isFinished = false;
        
        const finishEditing = (save) => {
          if (isFinished) return;
          isFinished = true;
          
          if (save) {
            const newText = editInput.value.trim();
            if (newText !== '') {
              todo.text = newText;
              saveToLocalStorage();
            }
          }
          editingId = null;
          render();
        };
        
        editInput.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
            finishEditing(true);
          } else if (e.key === 'Escape') {
            finishEditing(false);
          }
        });
        
        editInput.addEventListener('blur', () => {
          finishEditing(true);
        });
        
        li.appendChild(editInput);
        setTimeout(() => editInput.focus(), 0);
      } else {
        // 通常モード
        
        // 選択モードの場合は選択チェックボックスを追加
        if (isSelectionMode) {
          const selectionCheckbox = document.createElement('input');
          selectionCheckbox.type = 'checkbox';
          selectionCheckbox.className = 'selection-checkbox';
          selectionCheckbox.checked = selectedTodos.has(todo.id);
          selectionCheckbox.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleTodoSelection(todo.id, e.shiftKey);
          });
          
          // 選択状態に応じてクラスを追加
          if (selectedTodos.has(todo.id)) {
            li.classList.add('selected');
          }
          
          li.appendChild(selectionCheckbox);
        }
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = todo.completed;
        checkbox.addEventListener('change', () => {
          todo.completed = checkbox.checked;
          if (todo.completed && !todo.completedAt) {
            todo.completedAt = new Date().toISOString();
          } else if (!todo.completed) {
            todo.completedAt = null;
          }
          saveToLocalStorage();
          render();
        });
        
        const label = document.createElement('label');
        label.appendChild(checkbox);
        
        // 検索ハイライト処理
        if (searchQuery) {
          const span = document.createElement('span');
          const regex = new RegExp(`(${escapeRegExp(searchQuery)})`, 'gi');
          span.innerHTML = ' ' + todo.text.replace(regex, '<mark>$1</mark>');
          label.appendChild(span);
        } else {
          label.appendChild(document.createTextNode(' ' + todo.text));
        }
        
        label.addEventListener('dblclick', () => {
          editingId = todo.id;
          render();
        });
        
        // コメントボタンの作成
        const commentButton = document.createElement('button');
        commentButton.className = 'comment-button';
        commentButton.textContent = '💬';
        commentButton.setAttribute('aria-label', 'コメントを追加');
        
        // コメント数バッジの表示
        const todoComments = getCommentsForTodo(todo.id);
        const commentCount = document.createElement('span');
        commentCount.className = 'comment-count';
        commentCount.textContent = todoComments.length;
        commentButton.appendChild(commentCount);
        
        commentButton.addEventListener('click', () => {
          toggleCommentSection(todo.id, li);
        });
        
        const deleteButton = document.createElement('button');
        deleteButton.className = 'delete-button';
        deleteButton.textContent = '削除';
        deleteButton.addEventListener('click', () => {
          todos = todos.filter(t => t.id !== todo.id);
          // TODO削除時にコメントも削除
          comments = comments.filter(c => c.todoId !== todo.id);
          saveToLocalStorage();
          saveCommentsToLocalStorage();
          render();
        });
        
        li.appendChild(label);
        li.appendChild(commentButton);
        li.appendChild(deleteButton);
      }
      
      todoList.appendChild(li);
    });
    
    // アクセシビリティ: ライブリージョンの更新
    updateStatusMessage(filteredTodos.length, todos.length);
    
    // 選択モードの場合は全選択状態を更新
    if (isSelectionMode) {
      updateSelectAllState();
    }
  }
  
  // ライブリージョンの更新関数
  function updateStatusMessage(displayedCount, totalCount) {
    const statusElement = container.querySelector('#status-message');
    if (statusElement) {
      let message = '';
      if (searchQuery) {
        message = `検索結果: ${displayedCount}件のTODOが見つかりました`;
      } else if (currentFilter !== 'all') {
        const filterName = currentFilter === 'completed' ? '完了済み' : '未完了';
        message = `フィルター結果: ${displayedCount}件の${filterName}TODOを表示中`;
      } else {
        message = `${totalCount}件のTODOがあります`;
      }
      statusElement.textContent = message;
    }
  }
  
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const text = input.value.trim();
    if (text === '') return;
    
    todos.push({
      id: nextId++,
      text: text,
      completed: false,
      order: todos.length,
      createdAt: new Date().toISOString(),
      completedAt: null
    });
    
    saveToLocalStorage();
    render();
    input.value = '';
  });
  
  // フィルターボタンのイベント設定
  const filterButtons = container.querySelectorAll('.filter-button');
  
  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      currentFilter = button.getAttribute('data-filter');
      
      // アクティブクラスを更新
      filterButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      
      render();
    });
  });
  
  // 初期状態で全てボタンをアクティブに
  container.querySelector('[data-filter="all"]').classList.add('active');
  
  // 検索入力のイベントハンドラ（デバウンス付き）
  const debouncedSearch = debounce(() => {
    render();
  }, 300);
  
  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    debouncedSearch();
  });
  
  // キーボードショートカットシステムの初期化
  // ブラウザ環境とNode.js環境の両方に対応
  let KeyboardShortcuts;
  if (typeof window !== 'undefined' && window.KeyboardShortcuts) {
    KeyboardShortcuts = window.KeyboardShortcuts;
  } else if (typeof require !== 'undefined') {
    ({ KeyboardShortcuts } = require('./keyboardShortcuts'));
  }
  let keyboardShortcuts;
  if (KeyboardShortcuts) {
    keyboardShortcuts = new KeyboardShortcuts({
      container,
      form,
      todoList,
      duplicateTodo
    });
  }
  
  // テーマトグルボタンのイベント設定
  if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
  }
  
  // タブ切り替え機能
  const tabButtons = container.querySelectorAll('.tab-button');
  const tabPanes = container.querySelectorAll('.tab-pane');
  
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const targetTab = button.getAttribute('data-tab');
      
      // タブボタンのアクティブ状態を更新
      tabButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      
      // タブペインの表示を切り替え
      tabPanes.forEach(pane => {
        if (pane.getAttribute('data-pane') === targetTab) {
          pane.classList.add('active');
        } else {
          pane.classList.remove('active');
        }
      });
      
      // 統計タブの場合は統計を更新
      if (targetTab === 'stats') {
        updateStatistics();
      }
    });
  });
  
  // 統計計算関数
  function calculateStatistics(dateRange = 'all') {
    const now = new Date();
    // LocalStorageから最新のデータを取得
    const currentTodos = loadFromLocalStorage();
    let filteredTodos = currentTodos;
    
    // 日付範囲でフィルタリング
    if (dateRange !== 'all') {
      const startDate = new Date();
      
      switch (dateRange) {
        case 'today':
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(now.getMonth() - 1);
          break;
      }
      
      filteredTodos = currentTodos.filter(todo => {
        const createdDate = new Date(todo.createdAt);
        return createdDate >= startDate;
      });
    }
    
    const total = filteredTodos.length;
    const completed = filteredTodos.filter(todo => todo.completed).length;
    const incomplete = total - completed;
    const completionRate = total > 0 ? (completed / total * 100).toFixed(1) : 0;
    
    return {
      total,
      completed,
      incomplete,
      completionRate
    };
  }
  
  // 統計表示更新関数
  function updateStatistics() {
    const dateRange = container.querySelector('.date-range-filter').value;
    const stats = calculateStatistics(dateRange);
    
    // 統計値を更新
    container.querySelector('.stat-total').textContent = stats.total;
    container.querySelector('.stat-completed').textContent = stats.completed;
    container.querySelector('.stat-incomplete').textContent = stats.incomplete;
    container.querySelector('.stat-completion-rate').textContent = stats.completionRate + '%';
    
    // ストリークを計算（簡易版）
    const streak = calculateStreak();
    container.querySelector('.stat-streak').textContent = streak + '日';
    
    // チャートを更新
    updateDailyChart();
  }
  
  // 連続完了日数を計算
  function calculateStreak() {
    const currentTodos = loadFromLocalStorage();
    const completedTodos = currentTodos.filter(todo => todo.completed && todo.completedAt);
    if (completedTodos.length === 0) return 0;
    
    // 日付でグループ化
    const completionsByDate = {};
    completedTodos.forEach(todo => {
      const date = new Date(todo.completedAt).toDateString();
      completionsByDate[date] = true;
    });
    
    // 今日から遡ってストリークを計算
    let streak = 0;
    const today = new Date();
    const checkDate = new Date(today);
    
    while (true) {
      const dateStr = checkDate.toDateString();
      if (completionsByDate[dateStr]) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
    
    return streak;
  }
  
  // 日別完了推移チャートを更新
  function updateDailyChart() {
    const canvas = container.querySelector('#daily-chart');
    if (!canvas) return;
    
    // Check if canvas supports getContext (for testing environments)
    if (typeof canvas.getContext !== 'function') return;
    
    let ctx;
    try {
      ctx = canvas.getContext('2d');
    } catch (e) {
      // Canvas API not available in test environment
      return;
    }
    if (!ctx) return;
    
    // 簡易的なチャート描画
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#667eea';
    ctx.strokeStyle = '#667eea';
    ctx.lineWidth = 2;
    
    // 過去7日間のデータを集計
    const dailyData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const dateStr = date.toDateString();
      
      const currentTodos = loadFromLocalStorage();
      const count = currentTodos.filter(todo => {
        if (!todo.completed || !todo.completedAt) return false;
        const completedDate = new Date(todo.completedAt);
        return completedDate.toDateString() === dateStr;
      }).length;
      
      dailyData.push(count);
    }
    
    // グラフを描画
    const maxValue = Math.max(...dailyData, 1);
    const barWidth = canvas.width / 7 - 20;
    const scale = (canvas.height - 40) / maxValue;
    
    dailyData.forEach((value, index) => {
      const x = index * (barWidth + 20) + 10;
      const height = value * scale;
      const y = canvas.height - height - 20;
      
      ctx.fillRect(x, y, barWidth, height);
    });
  }
  
  // エクスポート機能
  function exportAsJSON() {
    const dateRange = container.querySelector('.date-range-filter').value;
    const stats = calculateStatistics(dateRange);
    
    const exportData = {
      exportDate: new Date().toISOString(),
      dateRange,
      statistics: stats,
      todos: loadFromLocalStorage()
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    downloadFile(blob, `todo-stats-${new Date().toISOString().split('T')[0]}.json`);
  }
  
  function exportAsCSV() {
    const currentTodos = loadFromLocalStorage();
    
    // CSVヘッダー
    const headers = ['ID', 'テキスト', '完了', '作成日時', '完了日時', '順序'];
    
    // CSVデータの生成
    const csvRows = [headers.join(',')];
    
    currentTodos.forEach(todo => {
      const row = [
        todo.id,
        `"${todo.text.replace(/"/g, '""')}"`, // CSVのエスケープ処理
        todo.completed,
        todo.createdAt || '',
        todo.completedAt || '',
        todo.order || 0
      ];
      csvRows.push(row.join(','));
    });
    
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    downloadFile(blob, `todo-data-${new Date().toISOString().split('T')[0]}.csv`);
  }
  
  function downloadFile(blob, filename) {
    // Check if URL.createObjectURL exists (for testing environments)
    if (typeof URL !== 'undefined' && URL.createObjectURL) {
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
      
      URL.revokeObjectURL(url);
    } else {
      // Fallback for test environment
      const link = document.createElement('a');
      link.setAttribute('download', filename);
      link.click();
    }
  }
  
  // インポート機能
  function importData() {
    const fileInput = container.querySelector('.import-file-input');
    const file = fileInput.files[0];
    
    if (!file) {
      // ファイルが選択されていない場合は、ファイル選択ダイアログを開く
      fileInput.click();
      return;
    }
    
    if (typeof FileReader === 'undefined') {
      if (typeof window.alert === 'function') {
        window.alert('このブラウザはファイルのインポートに対応していません。');
      }
      return;
    }
    
    const reader = new FileReader();
    reader.addEventListener('load', (e) => {
      try {
        const content = e.target.result;
        let importedTodos;
        
        if (file && file.name && file.name.endsWith('.json')) {
          const data = JSON.parse(content);
          importedTodos = data.todos || data; // 統計データまたは直接のTODO配列
        } else if (file && file.name && file.name.endsWith('.csv')) {
          importedTodos = parseCSV(content);
        } else {
          throw new Error('サポートされていないファイル形式です。');
        }
        
        // データの検証
        if (!Array.isArray(importedTodos)) {
          throw new Error('無効なデータ形式です。');
        }
        
        // 既存のTODOがある場合の処理
        const currentTodos = loadFromLocalStorage();
        if (currentTodos.length > 0) {
          // テスト環境でwindow.confirmが使えない場合の対応
          const shouldReplace = typeof window.confirm === 'function'
            ? window.confirm(
                '既存のTODOがあります。\n' +
                'OK: 既存のデータを削除して置き換える\n' +
                'キャンセル: 既存のデータに追加する'
              )
            : true;
          
          if (shouldReplace) {
            todos = [];
            selectedTodos.clear();
          }
        }
        
        // インポートされたTODOを追加
        importedTodos.forEach(importedTodo => {
          // 必要なプロパティの確認と設定
          const newTodo = {
            id: nextId++,
            text: importedTodo.text || importedTodo.テキスト || 'インポートされたTODO',
            completed: importedTodo.completed === true || importedTodo.completed === 'true' || importedTodo.完了 === 'true',
            createdAt: importedTodo.createdAt || importedTodo.作成日時 || new Date().toISOString(),
            completedAt: importedTodo.completedAt || importedTodo.完了日時 || null,
            order: todos.length
          };
          
          todos.push(newTodo);
        });
        
        saveToLocalStorage();
        render();
        
        // TODOタブに切り替え
        const todosTab = container.querySelector('[data-tab="todos"]');
        todosTab.click();
        
        if (typeof window.alert === 'function') {
          window.alert(`${importedTodos.length}個のTODOをインポートしました。`);
        }
        
      } catch (error) {
        console.error('Import error:', error);
        if (file && file.name && file.name.endsWith('.csv')) {
          if (typeof window.alert === 'function') {
            window.alert('CSVファイルの形式が正しくありません。正しいヘッダーと形式で作成してください。');
          }
        } else {
          if (typeof window.alert === 'function') {
            window.alert('ファイルの形式が正しくありません。有効なJSONまたはCSVファイルを選択してください。');
          }
        }
      }
    });
    
    reader.readAsText(file);
  }
  
  function parseCSV(csvContent) {
    const lines = csvContent.split('\n').filter(line => line.trim());
    if (lines.length < 2) {
      throw new Error('CSVファイルが空またはヘッダーがありません。');
    }
    
    const headers = lines[0].split(',').map(h => h.trim());
    const todos = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);
      if (values.length === 0) continue;
      
      const todo = {};
      headers.forEach((header, index) => {
        if (values[index] !== undefined) {
          todo[header] = values[index];
        }
      });
      
      todos.push(todo);
    }
    
    return todos;
  }
  
  function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++; // 次の引用符をスキップ
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current.trim());
    return result;
  }
  
  // エクスポートボタンのイベントリスナー
  const exportJsonBtn = container.querySelector('.export-json');
  exportJsonBtn.addEventListener('click', exportAsJSON);
  
  const exportCsvBtn = container.querySelector('.export-csv');
  exportCsvBtn.addEventListener('click', exportAsCSV);
  
  // インポートボタンのイベントリスナー
  const importBtn = container.querySelector('.import-button');
  importBtn.addEventListener('click', importData);
  
  // ファイル選択時に自動でインポート
  const fileInput = container.querySelector('.import-file-input');
  fileInput.addEventListener('change', () => {
    if (fileInput.files[0]) {
      importData();
    }
  });
  
  // 日付範囲フィルターの変更イベント
  const dateRangeFilter = container.querySelector('.date-range-filter');
  dateRangeFilter.addEventListener('change', updateStatistics);
  
  // テーマを初期化
  initializeTheme();
  
  // 一括操作のイベントリスナー
  const selectionModeButton = container.querySelector('.selection-mode-toggle');
  selectionModeButton.addEventListener('click', toggleSelectionMode);
  
  const selectAllCheckbox = container.querySelector('.select-all-checkbox');
  selectAllCheckbox.addEventListener('change', selectAll);
  
  const bulkCompleteButton = container.querySelector('.bulk-complete');
  bulkCompleteButton.addEventListener('click', bulkComplete);
  
  const bulkUncompleteButton = container.querySelector('.bulk-uncomplete');
  bulkUncompleteButton.addEventListener('click', bulkUncomplete);
  
  const bulkDeleteButton = container.querySelector('.bulk-delete');
  bulkDeleteButton.addEventListener('click', bulkDelete);
  
  // キーボードショートカット
  document.addEventListener('keydown', (e) => {
    if (isSelectionMode && e.ctrlKey && e.key === 'a') {
      e.preventDefault();
      selectAll();
    }
  });
  
  // TODO複製機能
  function duplicateTodo(todoId) {
    const originalTodo = todos.find(t => t.id === todoId);
    if (!originalTodo) return;
    
    const duplicatedTodo = {
      id: nextId++,
      text: originalTodo.text + ' (コピー)',
      completed: false,
      order: todos.length,
      createdAt: new Date().toISOString(),
      completedAt: null
    };
    
    todos.push(duplicatedTodo);
    saveToLocalStorage();
    render();
  }

  // コメント機能
  function toggleCommentSection(todoId, todoElement) {
    // 既存のコメントパネルがあれば削除
    const existingPanel = todoElement.querySelector('.comment-panel');
    if (existingPanel) {
      existingPanel.remove();
      return;
    }
    
    // コメントパネルを作成
    const commentPanel = createCommentSection(todoId);
    commentPanel.classList.add('active');
    todoElement.appendChild(commentPanel);
  }
  
  function createCommentSection(todoId) {
    // LocalStorageから最新のコメントデータを再読み込み
    comments = loadCommentsFromLocalStorage();
    
    const section = document.createElement('div');
    section.className = 'comment-panel';
    
    // コメント入力部分
    const inputContainer = document.createElement('form');
    inputContainer.className = 'comment-form';
    
    const commentInput = document.createElement('input');
    commentInput.type = 'text';
    commentInput.className = 'comment-input';
    commentInput.placeholder = 'コメントを入力...';
    
    const addButton = document.createElement('button');
    addButton.type = 'submit';
    addButton.className = 'add-comment-button';
    addButton.textContent = 'コメント';
    
    // フォームのsubmitイベントでコメント追加
    inputContainer.addEventListener('submit', (e) => {
      e.preventDefault();
      if (addCommentAndUpdate(todoId, commentInput.value)) {
        commentInput.value = '';
        updateCommentSection(todoId, section);
      }
    });
    
    inputContainer.appendChild(commentInput);
    inputContainer.appendChild(addButton);
    section.appendChild(inputContainer);
    
    // 既存のコメントを表示
    updateCommentSection(todoId, section);
    
    return section;
  }
  
  function addComment(todoId, content) {
    if (!content || content.trim() === '') {
      return false;
    }
    
    const comment = {
      id: `comment-${nextCommentId++}`,
      todoId: todoId,
      content: content.trim(),
      author: '匿名ユーザー',
      createdAt: new Date().toISOString()
    };
    
    comments.push(comment);
    saveCommentsToLocalStorage();
    return true;
  }
  
  function addCommentAndUpdate(todoId, content) {
    const success = addComment(todoId, content);
    if (success) {
      // コメント数バッジを更新するため、該当するTODOアイテムのコメントボタンを更新
      updateCommentButtonBadge(todoId);
    }
    return success;
  }
  
  function updateCommentButtonBadge(todoId) {
    const todoElement = document.querySelector(`[data-todo-id="${todoId}"]`);
    if (!todoElement) return;
    
    const commentButton = todoElement.querySelector('.comment-button');
    if (!commentButton) return;
    
    // 既存のバッジを更新
    let commentCount = commentButton.querySelector('.comment-count');
    if (!commentCount) {
      commentCount = document.createElement('span');
      commentCount.className = 'comment-count';
      commentButton.appendChild(commentCount);
    }
    
    // 新しいコメント数を設定
    const todoComments = getCommentsForTodo(todoId);
    commentCount.textContent = todoComments.length;
  }
  
  function updateCommentSection(todoId, section) {
    // 既存のコメントリストを削除
    const existingList = section.querySelector('.comment-list');
    if (existingList) {
      existingList.remove();
    }
    
    const todoComments = getCommentsForTodo(todoId);
    if (todoComments.length === 0) {
      return;
    }
    
    // コメントリストを作成
    const commentList = document.createElement('div');
    commentList.className = 'comment-list';
    
    todoComments.forEach(comment => {
      const commentItem = createCommentItem(comment);
      commentList.appendChild(commentItem);
    });
    
    section.appendChild(commentList);
  }
  
  function createCommentItem(comment) {
    const item = document.createElement('div');
    item.className = 'comment-item';
    
    // コメント内容
    const content = document.createElement('div');
    content.className = 'comment-content';
    content.textContent = comment.content;
    
    // 作者と時刻
    const meta = document.createElement('div');
    meta.className = 'comment-meta';
    
    const author = document.createElement('span');
    author.className = 'comment-author';
    author.textContent = comment.author;
    
    const timestamp = document.createElement('span');
    timestamp.className = 'comment-timestamp';
    const date = new Date(comment.createdAt);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    timestamp.textContent = `${year}/${month}/${day} ${hours}:${minutes}`;
    
    meta.appendChild(author);
    meta.appendChild(document.createTextNode(' - '));
    meta.appendChild(timestamp);
    
    // 編集・削除ボタン
    const actions = document.createElement('div');
    actions.className = 'comment-actions';
    
    const editButton = document.createElement('button');
    editButton.className = 'comment-edit-button';
    editButton.textContent = '編集';
    
    editButton.addEventListener('click', () => {
      startEditingComment(comment, item);
    });
    
    const deleteButton = document.createElement('button');
    deleteButton.className = 'comment-delete-button';
    deleteButton.textContent = '削除';
    
    deleteButton.addEventListener('click', () => {
      // テスト環境でwindow.confirmが使えない場合の対応
      const shouldDelete = typeof window.confirm === 'function' 
        ? window.confirm('このコメントを削除しますか？')
        : true;
      
      if (shouldDelete) {
        deleteComment(comment.id);
      }
    });
    
    actions.appendChild(editButton);
    actions.appendChild(deleteButton);
    
    item.appendChild(content);
    item.appendChild(meta);
    item.appendChild(actions);
    
    return item;
  }
  
  function startEditingComment(comment, commentItem) {
    // 既存のコンテンツを隠す
    const contentDiv = commentItem.querySelector('.comment-content');
    contentDiv.style.display = 'none';
    
    // 編集用インプットを作成
    const editInput = document.createElement('input');
    editInput.type = 'text';
    editInput.className = 'comment-edit-input';
    editInput.value = comment.content;
    
    // キーボードイベント
    editInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        finishEditingComment(comment.id, editInput.value, commentItem);
      } else if (e.key === 'Escape') {
        cancelEditingComment(commentItem);
      }
    });
    
    // インプットを挿入
    contentDiv.parentNode.insertBefore(editInput, contentDiv.nextSibling);
    editInput.focus();
  }
  
  function finishEditingComment(commentId, newContent, commentItem) {
    if (!newContent || newContent.trim() === '') {
      cancelEditingComment(commentItem);
      return;
    }
    
    const comment = comments.find(c => c.id === commentId);
    if (!comment) return;
    
    comment.content = newContent.trim();
    saveCommentsToLocalStorage();
    
    // UIを更新
    const contentDiv = commentItem.querySelector('.comment-content');
    contentDiv.textContent = comment.content;
    contentDiv.style.display = 'block';
    
    const editInput = commentItem.querySelector('.comment-edit-input');
    if (editInput) editInput.remove();
  }
  
  function cancelEditingComment(commentItem) {
    const contentDiv = commentItem.querySelector('.comment-content');
    contentDiv.style.display = 'block';
    
    const editInput = commentItem.querySelector('.comment-edit-input');
    if (editInput) editInput.remove();
  }
  
  function deleteComment(commentId) {
    const comment = comments.find(c => c.id === commentId);
    if (!comment) return;
    
    const todoId = comment.todoId;
    comments = comments.filter(c => c.id !== commentId);
    saveCommentsToLocalStorage();
    
    // コメント数バッジを更新
    updateCommentButtonBadge(todoId);
    
    // 現在開いているコメントセクションがあれば更新
    const todoElement = document.querySelector(`[data-todo-id="${todoId}"]`);
    if (todoElement) {
      const commentPanel = todoElement.querySelector('.comment-panel');
      if (commentPanel) {
        updateCommentSection(todoId, commentPanel);
      }
    }
  }

  // 初期データがある場合は表示、なくても初期メッセージを設定
  render();
  
  return {
    container,
    form,
    todoList,
    render, // テスト用に公開
    duplicateTodo // ショートカット用に公開
  };
}

// ブラウザ環境での使用のためにグローバルスコープに公開
if (typeof window !== 'undefined') {
  window.createTodoApp = createTodoApp;
}

// Node.js環境でのテスト用にエクスポート
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { createTodoApp };
}