const { createTodoApp } = require('./todoApp');

describe('TODO期限日時機能', () => {
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

  describe('期限日時の入力', () => {
    it('フォームに期限日時入力フィールドが存在する', () => {
      const dueDateTimeInput = app.form.querySelector('input[type="datetime-local"]');
      expect(dueDateTimeInput).toBeTruthy();
      expect(dueDateTimeInput.getAttribute('aria-label')).toBe('期限日時');
    });

    it('期限日時付きのTODOを追加できる', () => {
      const textInput = app.form.querySelector('input[type="text"]');
      const dueDateTimeInput = app.form.querySelector('input[type="datetime-local"]');
      const submitButton = app.form.querySelector('button[type="submit"]');
      
      textInput.value = '期限日時付きタスク';
      dueDateTimeInput.value = '2025-12-31T14:30';
      submitButton.click();

      const todoItems = app.todoList.querySelectorAll('.todo-item');
      expect(todoItems.length).toBe(1);
      
      const dueDateDisplay = todoItems[0].querySelector('.due-date');
      expect(dueDateDisplay).toBeTruthy();
      // 日時の表示を確認（時間も含む）
      expect(dueDateDisplay.textContent).toMatch(/2025.*12.*31.*14:30/);
    });

    it('期限日時なしのTODOも追加できる', () => {
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

  describe('期限日時の表示', () => {
    it('期限日時が設定されているTODOには日時が表示される', () => {
      // ISO 8601形式で保存
      app.todos = [{
        id: 1,
        text: 'テストタスク',
        completed: false,
        dueDate: '2025-12-31T05:30:00.000Z' // UTC時間（日本時間14:30）
      }];
      app.renderTodos();

      const todoItem = app.todoList.querySelector('.todo-item');
      const dueDateDisplay = todoItem.querySelector('.due-date');
      expect(dueDateDisplay).toBeTruthy();
      // 日時が表示されることを確認（タイムゾーンに依存しない）
      expect(dueDateDisplay.textContent).toMatch(/期限.*2025.*12.*31.*\d{1,2}:\d{2}/);
    });

    it('既存の日付のみデータも正しく表示される', () => {
      // 既存の日付のみ形式
      app.todos = [{
        id: 1,
        text: '既存タスク',
        completed: false,
        dueDate: '2025-12-31'
      }];
      app.renderTodos();

      const todoItem = app.todoList.querySelector('.todo-item');
      const dueDateDisplay = todoItem.querySelector('.due-date');
      expect(dueDateDisplay).toBeTruthy();
      // 時間なしで表示されることを確認
      expect(dueDateDisplay.textContent).toMatch(/期限.*2025.*12.*31/);
      expect(dueDateDisplay.textContent).not.toMatch(/\d{1,2}:\d{2}/); // 時刻が含まれないことを確認
    });

    it('期限切れのTODOは時刻も含めて強調表示される', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(15, 30, 0, 0);
      
      app.todos = [{
        id: 1,
        text: '期限切れタスク',
        completed: false,
        dueDate: yesterday.toISOString()
      }];
      app.renderTodos();

      const todoItem = app.todoList.querySelector('.todo-item');
      expect(todoItem.classList.contains('overdue')).toBeTruthy();
      
      const dueDateDisplay = todoItem.querySelector('.due-date');
      expect(dueDateDisplay.textContent).toMatch(/\d{1,2}:\d{2}/); // 時刻が表示される
    });
  });

  describe('期限日時のlocalStorage保存', () => {
    it('期限日時付きTODOがISO形式でlocalStorageに保存される', () => {
      const textInput = app.form.querySelector('input[type="text"]');
      const dueDateTimeInput = app.form.querySelector('input[type="datetime-local"]');
      const submitButton = app.form.querySelector('button[type="submit"]');
      
      textInput.value = '保存テストタスク';
      dueDateTimeInput.value = '2025-12-31T14:30';
      submitButton.click();

      const savedTodos = JSON.parse(window.localStorage.getItem('todos'));
      expect(savedTodos.length).toBe(1);
      // ISO 8601形式で保存されていることを確認
      expect(savedTodos[0].dueDate).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });

    it('期限日時付きTODOが復元される', () => {
      const todos = [{
        id: 1,
        text: '復元テストタスク',
        completed: false,
        dueDate: '2025-12-31T05:30:00.000Z'
      }];
      window.localStorage.setItem('todos', JSON.stringify(todos));

      // 新しいコンテナを作成
      const newContainer = document.createElement('div');
      document.body.appendChild(newContainer);
      const newApp = createTodoApp(newContainer);
      const todoItem = newApp.todoList.querySelector('.todo-item');
      const dueDateDisplay = todoItem.querySelector('.due-date');
      
      expect(dueDateDisplay).toBeTruthy();
      expect(dueDateDisplay.textContent).toMatch(/\d{1,2}:\d{2}/); // 時刻が表示される
      
      // クリーンアップ
      document.body.removeChild(newContainer);
    });
  });

  describe('期限日時の編集', () => {
    it('TODO編集時に期限日時も編集できる', () => {
      app.todos = [{
        id: 1,
        text: '編集テストタスク',
        completed: false,
        dueDate: '2025-12-31T05:30:00.000Z'
      }];
      app.renderTodos();

      const label = app.todoList.querySelector('label');
      label.dispatchEvent(new Event('dblclick'));

      const editDateTimeInput = app.todoList.querySelector('input[type="datetime-local"].edit-date-input');
      expect(editDateTimeInput).toBeTruthy();
      // datetime-localの値形式（YYYY-MM-DDTHH:mm）で設定されていることを確認
      // datetime-localの値はローカル時刻に依存
      expect(editDateTimeInput.value).toMatch(/2025-12-31T\d{2}:\d{2}/);

      editDateTimeInput.value = '2026-01-01T09:00';
      editDateTimeInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));

      // ISO形式で保存されていることを確認
      expect(app.todos[0].dueDate).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });

    it('既存の日付のみデータを編集する際、時間が00:00で初期化される', () => {
      app.todos = [{
        id: 1,
        text: '既存データ編集テスト',
        completed: false,
        dueDate: '2025-12-31' // 日付のみの既存データ
      }];
      app.renderTodos();

      const label = app.todoList.querySelector('label');
      label.dispatchEvent(new Event('dblclick'));

      const editDateTimeInput = app.todoList.querySelector('input[type="datetime-local"].edit-date-input');
      expect(editDateTimeInput).toBeTruthy();
      // 時間部分が00:00（または09:00 JST）で初期化されることを確認
      expect(editDateTimeInput.value).toMatch(/2025-12-31T\d{2}:00/);
    });
  });

  describe('日時フォーマット関数', () => {
    it('formatDueDateが日時を適切にフォーマットする', () => {
      // formatDueDateがグローバルに公開されている場合のテスト
      if (typeof app.formatDueDate === 'function') {
        const isoDate = '2025-12-31T05:30:00.000Z';
        const formatted = app.formatDueDate(isoDate);
        // 日時フォーマットが含まれることを確認（タイムゾーンに依存しない）
        expect(formatted).toMatch(/2025.*12.*31.*\d{1,2}:\d{2}/);
      }
    });

    it('formatDueDateが日付のみデータを適切にフォーマットする', () => {
      if (typeof app.formatDueDate === 'function') {
        const dateOnly = '2025-12-31';
        const formatted = app.formatDueDate(dateOnly);
        expect(formatted).toMatch(/2025.*12.*31/);
        expect(formatted).not.toMatch(/\d{1,2}:\d{2}/); // 時刻が含まれないことを確認
      }
    });
  });
});