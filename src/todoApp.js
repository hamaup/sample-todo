function createTodoApp(container) {
  container.innerHTML = `
    <header>
      <h1>TODOアプリ</h1>
      <button class="theme-toggle" aria-label="テーマを切り替え" title="ダークモード切り替え">
        <span class="theme-icon">🌙</span>
      </button>
    </header>
    <main>
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
          </nav>
          
          <ul id="todo-list" aria-label="TODOリスト"></ul>
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
              <button class="export-json">JSONエクスポート</button>
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
    document.documentElement.setAttribute('data-theme', theme);
    themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
    themeToggle.setAttribute('aria-label', 
      theme === 'dark' ? 'ライトモードに切り替え' : 'ダークモードに切り替え'
    );
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
        
        const deleteButton = document.createElement('button');
        deleteButton.className = 'delete-button';
        deleteButton.textContent = '削除';
        deleteButton.addEventListener('click', () => {
          todos = todos.filter(t => t.id !== todo.id);
          saveToLocalStorage();
          render();
        });
        
        li.appendChild(label);
        li.appendChild(deleteButton);
      }
      
      todoList.appendChild(li);
    });
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
  
  // キーボードショートカット（Ctrl/Cmd + F）
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
      e.preventDefault();
      searchInput.focus();
      searchInput.select();
    }
  });
  
  // テーマトグルボタンのイベント設定
  themeToggle.addEventListener('click', toggleTheme);
  
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
    let filteredTodos = todos;
    
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
      
      filteredTodos = todos.filter(todo => {
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
    const completedTodos = todos.filter(todo => todo.completed && todo.completedAt);
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
    const ctx = canvas.getContext('2d');
    
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
      
      const count = todos.filter(todo => {
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
  
  // JSONエクスポート機能
  const exportBtn = container.querySelector('.export-json');
  exportBtn.addEventListener('click', () => {
    const dateRange = container.querySelector('.date-range-filter').value;
    const stats = calculateStatistics(dateRange);
    
    const exportData = {
      exportDate: new Date().toISOString(),
      dateRange,
      statistics: stats,
      todos: todos
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `todo-stats-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
  });
  
  // 日付範囲フィルターの変更イベント
  const dateRangeFilter = container.querySelector('.date-range-filter');
  dateRangeFilter.addEventListener('change', updateStatistics);
  
  // テーマを初期化
  initializeTheme();
  
  // 初期データがある場合は表示
  if (todos.length > 0) {
    render();
  }
  
  return {
    container,
    form,
    todoList,
    render // テスト用に公開
  };
}

module.exports = { createTodoApp };