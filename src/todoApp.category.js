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
          <!-- カテゴリー管理セクション -->
          <div class="category-management">
            <h2>カテゴリー管理</h2>
            <form id="category-form">
              <input 
                type="text"
                name="category-name"
                placeholder="カテゴリー名"
                aria-label="カテゴリー名"
              />
              <input 
                type="color"
                name="category-color"
                value="#667eea"
                aria-label="カテゴリーの色"
              />
              <button type="submit">カテゴリー追加</button>
            </form>
            <ul id="category-list" aria-label="カテゴリーリスト"></ul>
          </div>

          <!-- TODO追加フォーム -->
          <form id="todo-form">
            <input 
              type="text" 
              placeholder="TODOを入力"
              aria-label="TODO入力"
            />
            <select name="category" aria-label="カテゴリー選択">
              <option value="">カテゴリーなし</option>
            </select>
            <input 
              type="text"
              name="tags"
              placeholder="タグ（スペース区切り）"
              aria-label="タグ入力"
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
          
          <!-- フィルターセクション -->
          <div class="filter-section">
            <nav class="filter-navigation">
              <button class="filter-button" data-filter="all">全て</button>
              <button class="filter-button" data-filter="incomplete">未完了</button>
              <button class="filter-button" data-filter="completed">完了済み</button>
            </nav>
            
            <div class="advanced-filters">
              <select id="category-filter" aria-label="カテゴリーフィルター">
                <option value="">全てのカテゴリー</option>
              </select>
              <select id="tag-filter" aria-label="タグフィルター">
                <option value="">全てのタグ</option>
              </select>
              <button id="clear-filters">フィルターをクリア</button>
            </div>
          </div>
          
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
  
  // 要素の取得
  const form = container.querySelector('#todo-form');
  const input = form.querySelector('input[type="text"]');
  const categorySelect = form.querySelector('select[name="category"]');
  const tagInput = form.querySelector('input[name="tags"]');
  const todoList = container.querySelector('#todo-list');
  const searchInput = container.querySelector('input[type="search"]');
  const themeToggle = container.querySelector('.theme-toggle');
  const themeIcon = container.querySelector('.theme-icon');
  
  // カテゴリー関連の要素
  const categoryForm = container.querySelector('#category-form');
  const categoryNameInput = categoryForm.querySelector('input[name="category-name"]');
  const categoryColorInput = categoryForm.querySelector('input[name="category-color"]');
  const categoryList = container.querySelector('#category-list');
  const categoryFilter = container.querySelector('#category-filter');
  const tagFilter = container.querySelector('#tag-filter');
  const clearFiltersButton = container.querySelector('#clear-filters');
  
  // 状態管理
  let todos = loadFromLocalStorage('todos') || [];
  let categories = loadFromLocalStorage('categories') || [];
  let nextTodoId = calculateNextId(todos);
  let nextCategoryId = calculateNextId(categories);
  let editingId = null;
  let editingCategoryId = null;
  let editingTodoTags = null;
  let currentFilter = 'all';
  let searchQuery = '';
  let selectedCategory = '';
  let selectedTag = '';
  let draggedTodo = null;
  let currentTheme = 'light';
  let allTags = [];
  let tagSuggestions = null;
  
  // LocalStorage関連のヘルパー関数
  function loadFromLocalStorage(key) {
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          if (key === 'todos') {
            // 既存のTODOにorderプロパティがない場合は追加
            return parsed.map((todo, index) => ({
              ...todo,
              order: todo.order !== undefined ? todo.order : index,
              createdAt: todo.createdAt || new Date().toISOString(),
              completedAt: todo.completedAt || null,
              categoryId: todo.categoryId || null,
              tags: todo.tags || []
            }));
          }
          return parsed;
        }
      }
    } catch (error) {
      console.error(`Failed to load ${key} from localStorage:`, error);
    }
    return null;
  }
  
  function saveToLocalStorage(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(`Failed to save ${key} to localStorage:`, error);
    }
  }
  
  function calculateNextId(list) {
    if (!list || list.length === 0) return 1;
    const maxId = Math.max(...list.map(item => item.id || 0));
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

  // カテゴリー管理関数
  function renderCategories() {
    categoryList.innerHTML = '';
    categorySelect.innerHTML = '<option value="">カテゴリーなし</option>';
    categoryFilter.innerHTML = '<option value="">全てのカテゴリー</option>';
    
    categories.forEach(category => {
      // カテゴリーリストの表示
      const li = document.createElement('li');
      li.className = 'category-item';
      
      if (editingCategoryId === category.id) {
        // 編集モード
        const editInput = document.createElement('input');
        editInput.type = 'text';
        editInput.value = category.name;
        
        const finishEdit = (save) => {
          if (save && editInput.value.trim()) {
            category.name = editInput.value.trim();
            saveToLocalStorage('categories', categories);
          }
          editingCategoryId = null;
          renderCategories();
          render();
        };
        
        editInput.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') finishEdit(true);
          else if (e.key === 'Escape') finishEdit(false);
        });
        
        editInput.addEventListener('blur', () => finishEdit(true));
        
        li.appendChild(editInput);
        setTimeout(() => editInput.focus(), 0);
      } else {
        // 通常モード
        const colorDiv = document.createElement('div');
        colorDiv.className = 'category-color';
        colorDiv.style.backgroundColor = category.color;
        
        const nameSpan = document.createElement('span');
        nameSpan.className = 'category-name';
        nameSpan.textContent = category.name;
        nameSpan.addEventListener('dblclick', () => {
          editingCategoryId = category.id;
          renderCategories();
        });
        
        const deleteButton = document.createElement('button');
        deleteButton.className = 'delete-category';
        deleteButton.textContent = '削除';
        deleteButton.addEventListener('click', () => {
          // カテゴリーを削除し、関連するTODOのカテゴリーをクリア
          categories = categories.filter(c => c.id !== category.id);
          todos.forEach(todo => {
            if (todo.categoryId === category.id) {
              todo.categoryId = null;
            }
          });
          saveToLocalStorage('categories', categories);
          saveToLocalStorage('todos', todos);
          renderCategories();
          render();
        });
        
        li.appendChild(colorDiv);
        li.appendChild(nameSpan);
        li.appendChild(deleteButton);
      }
      
      categoryList.appendChild(li);
      
      // セレクトボックスのオプション追加
      const option = document.createElement('option');
      option.value = category.id;
      option.textContent = category.name;
      categorySelect.appendChild(option);
      
      const filterOption = option.cloneNode(true);
      categoryFilter.appendChild(filterOption);
    });
  }
  
  // タグのオートコンプリート
  function updateAllTags() {
    const tagSet = new Set();
    todos.forEach(todo => {
      if (todo.tags && Array.isArray(todo.tags)) {
        todo.tags.forEach(tag => tagSet.add(tag));
      }
    });
    allTags = Array.from(tagSet).sort();
    
    // タグフィルターを更新
    tagFilter.innerHTML = '<option value="">全てのタグ</option>';
    allTags.forEach(tag => {
      const option = document.createElement('option');
      option.value = tag;
      option.textContent = tag;
      tagFilter.appendChild(option);
    });
  }
  
  function showTagSuggestions(input, value) {
    hideTagSuggestions();
    
    if (!value) return;
    
    const matches = allTags.filter(tag => 
      tag.toLowerCase().startsWith(value.toLowerCase())
    );
    
    if (matches.length === 0) return;
    
    tagSuggestions = document.createElement('div');
    tagSuggestions.className = 'tag-suggestions';
    
    matches.forEach(tag => {
      const div = document.createElement('div');
      div.className = 'tag-suggestion';
      div.textContent = tag;
      div.setAttribute('data-tag', tag);
      div.addEventListener('click', () => {
        const currentTags = input.value.trim().split(/\s+/);
        currentTags[currentTags.length - 1] = tag;
        input.value = currentTags.join(' ') + ' ';
        input.focus();
        hideTagSuggestions();
      });
      tagSuggestions.appendChild(div);
    });
    
    input.parentElement.appendChild(tagSuggestions);
  }
  
  function hideTagSuggestions() {
    if (tagSuggestions) {
      tagSuggestions.remove();
      tagSuggestions = null;
    }
  }

  // テーマ管理関数
  function initializeTheme() {
    const savedTheme = localStorage.getItem('theme');
    
    if (typeof window.matchMedia === 'function') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      
      if (savedTheme) {
        currentTheme = savedTheme;
      } else if (prefersDark) {
        currentTheme = 'dark';
      }
      
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
          currentTheme = e.matches ? 'dark' : 'light';
          applyTheme(currentTheme);
        }
      });
    } else {
      if (savedTheme) {
        currentTheme = savedTheme;
      }
    }
    
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
      e.preventDefault();
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
    
    const sortedTodos = [...todos].sort((a, b) => a.order - b.order);
    const filteredTodos = sortedTodos.filter(t => t.id !== draggedId);
    const targetIndex = filteredTodos.findIndex(t => t.id === targetId);
    const insertIndex = position === 'before' ? targetIndex : targetIndex + 1;
    filteredTodos.splice(insertIndex, 0, draggedTodo);
    
    filteredTodos.forEach((todo, index) => {
      todo.order = index;
    });
    
    saveToLocalStorage('todos', todos);
    render();
  }
  
  function render() {
    todoList.innerHTML = '';
    
    const sortedTodos = [...todos].sort((a, b) => a.order - b.order);
    
    const filteredTodos = sortedTodos.filter(todo => {
      // フィルター条件
      let passesFilter = true;
      if (currentFilter === 'incomplete') passesFilter = !todo.completed;
      else if (currentFilter === 'completed') passesFilter = todo.completed;
      
      // カテゴリーフィルター
      let passesCategory = true;
      if (selectedCategory) {
        passesCategory = todo.categoryId == selectedCategory;
      }
      
      // タグフィルター
      let passesTag = true;
      if (selectedTag) {
        passesTag = todo.tags && todo.tags.includes(selectedTag);
      }
      
      // 検索条件
      let passesSearch = true;
      if (searchQuery) {
        passesSearch = todo.text.toLowerCase().includes(searchQuery.toLowerCase());
      }
      
      return passesFilter && passesCategory && passesTag && passesSearch;
    });
    
    filteredTodos.forEach((todo, index) => {
      const li = document.createElement('li');
      li.className = 'todo-item';
      if (todo.completed) {
        li.classList.add('completed');
      }
      
      // ドラッグ&ドロップ機能
      li.draggable = true;
      li.dataset.todoId = todo.id;
      li.tabIndex = 0;
      
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
              saveToLocalStorage('todos', todos);
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
      } else if (editingTodoTags === todo.id) {
        // タグ編集モード
        const tagEditInput = document.createElement('input');
        tagEditInput.type = 'text';
        tagEditInput.className = 'tag-edit-input';
        tagEditInput.value = todo.tags ? todo.tags.join(' ') : '';
        
        const finishTagEdit = (save) => {
          if (save) {
            const newTags = tagEditInput.value.trim().split(/\s+/).filter(tag => tag);
            todo.tags = newTags;
            saveToLocalStorage('todos', todos);
            updateAllTags();
          }
          editingTodoTags = null;
          render();
        };
        
        tagEditInput.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
            finishTagEdit(true);
          } else if (e.key === 'Escape') {
            finishTagEdit(false);
          }
        });
        
        tagEditInput.addEventListener('blur', () => {
          finishTagEdit(true);
        });
        
        li.appendChild(tagEditInput);
        setTimeout(() => tagEditInput.focus(), 0);
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
          saveToLocalStorage('todos', todos);
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
        
        // カテゴリー表示
        if (todo.categoryId) {
          const category = categories.find(c => c.id === todo.categoryId);
          if (category) {
            const categorySpan = document.createElement('span');
            categorySpan.className = 'todo-category';
            categorySpan.textContent = category.name;
            categorySpan.style.backgroundColor = category.color;
            li.appendChild(categorySpan);
          }
        }
        
        // カテゴリーセレクター
        const categorySelector = document.createElement('select');
        categorySelector.className = 'todo-category-selector';
        categorySelector.innerHTML = '<option value="">なし</option>';
        categories.forEach(cat => {
          const option = document.createElement('option');
          option.value = cat.id;
          option.textContent = cat.name;
          if (todo.categoryId === cat.id) {
            option.selected = true;
          }
          categorySelector.appendChild(option);
        });
        categorySelector.addEventListener('change', (e) => {
          todo.categoryId = e.target.value ? parseInt(e.target.value) : null;
          saveToLocalStorage('todos', todos);
          render();
        });
        
        // タグ表示
        const tagsDiv = document.createElement('div');
        tagsDiv.className = 'todo-tags';
        if (todo.tags && todo.tags.length > 0) {
          todo.tags.forEach(tag => {
            const tagSpan = document.createElement('span');
            tagSpan.className = 'todo-tag';
            tagSpan.textContent = tag;
            
            const removeButton = document.createElement('button');
            removeButton.className = 'remove-tag';
            removeButton.textContent = '×';
            removeButton.addEventListener('click', (e) => {
              e.stopPropagation();
              todo.tags = todo.tags.filter(t => t !== tag);
              saveToLocalStorage('todos', todos);
              updateAllTags();
              render();
            });
            
            tagSpan.appendChild(removeButton);
            tagsDiv.appendChild(tagSpan);
          });
        }
        
        tagsDiv.addEventListener('click', () => {
          editingTodoTags = todo.id;
          render();
        });
        
        const deleteButton = document.createElement('button');
        deleteButton.className = 'delete-button';
        deleteButton.textContent = '削除';
        deleteButton.addEventListener('click', () => {
          todos = todos.filter(t => t.id !== todo.id);
          saveToLocalStorage('todos', todos);
          updateAllTags();
          render();
        });
        
        li.appendChild(label);
        li.appendChild(categorySelector);
        li.appendChild(tagsDiv);
        li.appendChild(deleteButton);
      }
      
      todoList.appendChild(li);
    });
  }
  
  // カテゴリー追加
  categoryForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const name = categoryNameInput.value.trim();
    const color = categoryColorInput.value;
    
    if (name === '') return;
    
    categories.push({
      id: nextCategoryId++,
      name: name,
      color: color
    });
    
    saveToLocalStorage('categories', categories);
    categoryNameInput.value = '';
    categoryColorInput.value = '#667eea';
    renderCategories();
  });
  
  // TODO追加
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const text = input.value.trim();
    if (text === '') return;
    
    const categoryId = categorySelect.value ? parseInt(categorySelect.value) : null;
    const tags = tagInput.value.trim().split(/\s+/).filter(tag => tag);
    
    todos.push({
      id: nextTodoId++,
      text: text,
      completed: false,
      order: todos.length,
      createdAt: new Date().toISOString(),
      completedAt: null,
      categoryId: categoryId,
      tags: tags
    });
    
    saveToLocalStorage('todos', todos);
    updateAllTags();
    render();
    input.value = '';
    categorySelect.value = '';
    tagInput.value = '';
  });
  
  // タグ入力のオートコンプリート
  tagInput.addEventListener('input', (e) => {
    const value = e.target.value;
    const lastWord = value.split(/\s+/).pop();
    if (lastWord) {
      showTagSuggestions(e.target, lastWord);
    } else {
      hideTagSuggestions();
    }
  });
  
  tagInput.addEventListener('blur', () => {
    setTimeout(hideTagSuggestions, 200);
  });
  
  // フィルターボタンのイベント設定
  const filterButtons = container.querySelectorAll('.filter-button');
  
  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      currentFilter = button.getAttribute('data-filter');
      
      filterButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      
      render();
    });
  });
  
  // 初期状態で全てボタンをアクティブに
  container.querySelector('[data-filter="all"]').classList.add('active');
  
  // カテゴリーフィルター
  categoryFilter.addEventListener('change', (e) => {
    selectedCategory = e.target.value;
    render();
  });
  
  // タグフィルター
  tagFilter.addEventListener('change', (e) => {
    selectedTag = e.target.value;
    render();
  });
  
  // フィルタークリア
  clearFiltersButton.addEventListener('click', () => {
    selectedCategory = '';
    selectedTag = '';
    searchQuery = '';
    currentFilter = 'all';
    
    categoryFilter.value = '';
    tagFilter.value = '';
    searchInput.value = '';
    
    filterButtons.forEach(btn => btn.classList.remove('active'));
    container.querySelector('[data-filter="all"]').classList.add('active');
    
    render();
  });
  
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
      
      tabButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      
      tabPanes.forEach(pane => {
        if (pane.getAttribute('data-pane') === targetTab) {
          pane.classList.add('active');
        } else {
          pane.classList.remove('active');
        }
      });
      
      if (targetTab === 'stats') {
        updateStatistics();
      }
    });
  });
  
  // 統計計算関数
  function calculateStatistics(dateRange = 'all') {
    const now = new Date();
    let filteredTodos = todos;
    
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
    
    container.querySelector('.stat-total').textContent = stats.total;
    container.querySelector('.stat-completed').textContent = stats.completed;
    container.querySelector('.stat-incomplete').textContent = stats.incomplete;
    container.querySelector('.stat-completion-rate').textContent = stats.completionRate + '%';
    
    const streak = calculateStreak();
    container.querySelector('.stat-streak').textContent = streak + '日';
    
    updateDailyChart();
  }
  
  // 連続完了日数を計算
  function calculateStreak() {
    const completedTodos = todos.filter(todo => todo.completed && todo.completedAt);
    if (completedTodos.length === 0) return 0;
    
    const completionsByDate = {};
    completedTodos.forEach(todo => {
      const date = new Date(todo.completedAt).toDateString();
      completionsByDate[date] = true;
    });
    
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
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#667eea';
    ctx.strokeStyle = '#667eea';
    ctx.lineWidth = 2;
    
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
      todos: todos,
      categories: categories
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    
    if (typeof URL !== 'undefined' && URL.createObjectURL) {
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `todo-stats-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      
      URL.revokeObjectURL(url);
    } else {
      const link = document.createElement('a');
      link.setAttribute('download', `todo-stats-${new Date().toISOString().split('T')[0]}.json`);
      link.click();
    }
  });
  
  // 日付範囲フィルターの変更イベント
  const dateRangeFilter = container.querySelector('.date-range-filter');
  dateRangeFilter.addEventListener('change', updateStatistics);
  
  // 初期化
  initializeTheme();
  renderCategories();
  updateAllTags();
  
  if (todos.length > 0) {
    render();
  }
  
  return {
    container,
    form,
    todoList,
    render
  };
}

module.exports = { createTodoApp };