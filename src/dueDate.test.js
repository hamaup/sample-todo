const { createTodoApp } = require('./todoApp');

describe('TODO期限日機能', () => {
  let container;
  let app;

  beforeEach(() => {
    localStorage.clear();
    container = document.createElement('div');
    document.body.appendChild(container);
    app = createTodoApp(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
    localStorage.clear();
  });

  describe('期限日の入力', () => {
    it('フォームに期限日入力フィールドが存在する', () => {
      const dueDateInput = app.form.querySelector('input[type="date"]');
      expect(dueDateInput).toBeTruthy();
      expect(dueDateInput.getAttribute('aria-label')).toBe('期限日');
    });

    it('期限日付きのTODOを追加できる', () => {
      const textInput = app.form.querySelector('input[type="text"]');
      const dueDateInput = app.form.querySelector('input[type="date"]');
      const submitButton = app.form.querySelector('button[type="submit"]');
      
      textInput.value = '期限付きタスク';
      dueDateInput.value = '2025-12-31';
      submitButton.click();

      const todoItems = app.todoList.querySelectorAll('.todo-item');
      expect(todoItems.length).toBe(1);
      
      const dueDateDisplay = todoItems[0].querySelector('.due-date');
      expect(dueDateDisplay).toBeTruthy();
      expect(dueDateDisplay.textContent).toContain('2025/12/31');
    });

    it('期限日なしのTODOも追加できる', () => {
      const textInput = app.form.querySelector('input[type="text"]');
      const submitButton = app.form.querySelector('button[type="submit"]');
      
      textInput.value = '期限なしタスク';
      submitButton.click();

      const todoItems = app.todoList.querySelectorAll('.todo-item');
      expect(todoItems.length).toBe(1);
      
      const dueDateDisplay = todoItems[0].querySelector('.due-date');
      expect(dueDateDisplay).toBeFalsy();
    });
  });

  describe('期限日の表示', () => {
    it('期限日が設定されているTODOには期限日が表示される', () => {
      app.todos = [{
        id: 1,
        text: 'テストタスク',
        completed: false,
        dueDate: '2025-12-31'
      }];
      app.renderTodos();

      const todoItem = app.todoList.querySelector('.todo-item');
      const dueDateDisplay = todoItem.querySelector('.due-date');
      expect(dueDateDisplay).toBeTruthy();
      expect(dueDateDisplay.textContent).toContain('期限: 2025/12/31');
    });

    it('期限日が過ぎたTODOは強調表示される', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      app.todos = [{
        id: 1,
        text: '期限切れタスク',
        completed: false,
        dueDate: yesterdayStr
      }];
      app.renderTodos();

      const todoItem = app.todoList.querySelector('.todo-item');
      expect(todoItem.classList.contains('overdue')).toBeTruthy();
    });

    it('本日が期限のTODOは警告表示される', () => {
      const today = new Date().toISOString().split('T')[0];

      app.todos = [{
        id: 1,
        text: '本日期限タスク',
        completed: false,
        dueDate: today
      }];
      app.renderTodos();

      const todoItem = app.todoList.querySelector('.todo-item');
      expect(todoItem.classList.contains('due-today')).toBeTruthy();
    });
  });

  describe('期限日のlocalStorage保存', () => {
    it('期限日付きTODOがlocalStorageに保存される', () => {
      const textInput = app.form.querySelector('input[type="text"]');
      const dueDateInput = app.form.querySelector('input[type="date"]');
      const submitButton = app.form.querySelector('button[type="submit"]');
      
      textInput.value = '保存テストタスク';
      dueDateInput.value = '2025-12-31';
      submitButton.click();

      const savedTodos = JSON.parse(window.localStorage.getItem('todos'));
      expect(savedTodos.length).toBe(1);
      expect(savedTodos[0].dueDate).toBe('2025-12-31');
    });

    it('期限日付きTODOが復元される', () => {
      const todos = [{
        id: 1,
        text: '復元テストタスク',
        completed: false,
        dueDate: '2025-12-31'
      }];
      window.localStorage.setItem('todos', JSON.stringify(todos));

      // 新しいコンテナを作成
      const newContainer = document.createElement('div');
      document.body.appendChild(newContainer);
      const newApp = createTodoApp(newContainer);
      const todoItem = newApp.todoList.querySelector('.todo-item');
      const dueDateDisplay = todoItem.querySelector('.due-date');
      
      expect(dueDateDisplay).toBeTruthy();
      expect(dueDateDisplay.textContent).toContain('2025/12/31');
      
      // クリーンアップ
      document.body.removeChild(newContainer);
    });
  });

  describe('期限日の編集', () => {
    it('TODO編集時に期限日も編集できる', () => {
      app.todos = [{
        id: 1,
        text: '編集テストタスク',
        completed: false,
        dueDate: '2025-12-31'
      }];
      app.renderTodos();

      const label = app.todoList.querySelector('label');
      label.dispatchEvent(new Event('dblclick'));

      const editDateInput = app.todoList.querySelector('input[type="date"].edit-date-input');
      expect(editDateInput).toBeTruthy();
      expect(editDateInput.value).toBe('2025-12-31');

      editDateInput.value = '2026-01-01';
      editDateInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));

      expect(app.todos[0].dueDate).toBe('2026-01-01');
    });
  });
});