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
  let draggedTodo = null;
  
  // LocalStorage関連のヘルパー関数
  function loadFromLocalStorage() {
    try {
      const saved = localStorage.getItem('todos');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // 既存のTODOにorderプロパティがない場合は追加
          return parsed.map((todo, index) => ({
            ...todo,
            order: todo.order !== undefined ? todo.order : index
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

  // ドラッグ&ドロップのハンドラ関数
  function handleDragStart(e) {
    draggedTodo = todos.find(todo => todo.id === parseInt(e.target.dataset.todoId));
    e.target.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', e.target.dataset.todoId);
  }

  function handleDragEnd(e) {
    e.target.classList.remove('dragging');
    // 全ての drag-over クラスを削除
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
      // 既存の drag-over を削除
      container.querySelectorAll('.drag-over').forEach(item => {
        item.classList.remove('drag-over');
      });
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
    
    // orderプロパティに基づいて並び替え
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
    
    filteredTodos.forEach(todo => {
      const li = document.createElement('li');
      li.className = 'todo-item';
      li.draggable = true;
      li.dataset.todoId = todo.id;
      li.tabIndex = 0; // キーボードフォーカス可能
      
      if (todo.completed) {
        li.classList.add('completed');
      }
      
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
      order: todos.length
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