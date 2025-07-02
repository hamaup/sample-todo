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
  
  let todos = [];
  let nextId = 1;
  let editingId = null;
  let currentFilter = 'all';
  
  function render() {
    todoList.innerHTML = '';
    
    // フィルター条件に基づいてTODOを表示
    const filteredTodos = todos.filter(todo => {
      if (currentFilter === 'all') return true;
      if (currentFilter === 'incomplete') return !todo.completed;
      if (currentFilter === 'completed') return todo.completed;
      return true;
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
          render();
        });
        
        const label = document.createElement('label');
        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(' ' + todo.text));
        label.addEventListener('dblclick', () => {
          editingId = todo.id;
          render();
        });
        
        const deleteButton = document.createElement('button');
        deleteButton.className = 'delete-button';
        deleteButton.textContent = '削除';
        deleteButton.addEventListener('click', () => {
          todos = todos.filter(t => t.id !== todo.id);
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
  
  return {
    container,
    form,
    todoList
  };
}

module.exports = { createTodoApp };