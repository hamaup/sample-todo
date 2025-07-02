function createTodoApp(container) {
  container.innerHTML = `
    <header>
      <h1>TODOアプリ</h1>
    </header>
    <main>
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
      
      <nav>
        <button class="filter-button" data-filter="all">全て</button>
        <button class="filter-button" data-filter="incomplete">未完了</button>
        <button class="filter-button" data-filter="completed">完了済み</button>
      </nav>
      
      <ul id="todo-list" aria-label="TODOリスト"></ul>
    </main>
  `;
  
  const form = container.querySelector('#todo-form');
  const input = form.querySelector('input[type="text"]');
  const todoList = container.querySelector('#todo-list');
  const searchInput = container.querySelector('input[type="search"]');
  
  // LocalStorageからデータを読み込み
  let todos = loadFromLocalStorage();
  let nextId = calculateNextId(todos);
  let editingId = null;
  let currentFilter = 'all';
  let searchQuery = '';
  
  // LocalStorage関連のヘルパー関数
  function loadFromLocalStorage() {
    try {
      const saved = localStorage.getItem('todos');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
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
  
  function render() {
    todoList.innerHTML = '';
    
    // フィルターと検索条件に基づいてTODOを表示
    const filteredTodos = todos.filter(todo => {
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
    
    filteredTodos.forEach(todo => {
      const li = document.createElement('li');
      if (todo.completed) {
        li.classList.add('completed');
      }
      
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
      completed: false
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