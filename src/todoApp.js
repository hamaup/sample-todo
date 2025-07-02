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
  
  function render() {
    todoList.innerHTML = '';
    todos.forEach(todo => {
      const li = document.createElement('li');
      if (todo.completed) {
        li.classList.add('completed');
      }
      
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
      
      const deleteButton = document.createElement('button');
      deleteButton.className = 'delete-button';
      deleteButton.textContent = '削除';
      deleteButton.addEventListener('click', () => {
        todos = todos.filter(t => t.id !== todo.id);
        render();
      });
      
      li.appendChild(label);
      li.appendChild(deleteButton);
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
  
  return {
    container,
    form,
    todoList
  };
}

function addTodo(text) {
  // 後で実装
  return { text, completed: false };
}

module.exports = { createTodoApp, addTodo };