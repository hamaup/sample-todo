const { createTodoApp } = require('./todoApp');

describe('Due Date Functionality', () => {
  let container;
  let app;

  beforeEach(() => {
    // matchMediaのモック
    window.matchMedia = jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));
    
    localStorage.clear();
    container = document.createElement('div');
    document.body.appendChild(container);
    app = createTodoApp(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
    localStorage.clear();
  });

  describe('Data Structure', () => {
    test('should include dueDate and reminderDate fields in todo items', () => {
      const form = container.querySelector('#todo-form');
      const input = form.querySelector('input[type="text"]');
      const dateInput = form.querySelector('input[type="datetime-local"]');
      
      // TODO追加
      input.value = 'タスクの期限付き';
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      dateInput.value = tomorrow.toISOString().slice(0, 16);
      
      form.dispatchEvent(new Event('submit', { bubbles: true }));
      
      // LocalStorageから確認
      const todos = JSON.parse(localStorage.getItem('todos'));
      expect(todos[0]).toHaveProperty('dueDate');
      expect(todos[0]).toHaveProperty('reminderDate');
    });
  });

  describe('UI Components', () => {
    test('should have date picker input in todo form', () => {
      const form = container.querySelector('#todo-form');
      const dateInput = form.querySelector('input[type="datetime-local"]');
      
      expect(dateInput).toBeInTheDocument();
      expect(dateInput).toHaveAttribute('aria-label', '期限日時');
    });

    test('should display due date in todo items', () => {
      // 期限付きTODOを追加
      const form = container.querySelector('#todo-form');
      const input = form.querySelector('input[type="text"]');
      const dateInput = form.querySelector('input[type="datetime-local"]');
      
      input.value = '期限付きタスク';
      const dueDate = new Date('2025-12-31T23:59');
      dateInput.value = dueDate.toISOString().slice(0, 16);
      
      form.dispatchEvent(new Event('submit', { bubbles: true }));
      
      const todoItem = container.querySelector('.todo-item');
      const dueDateDisplay = todoItem.querySelector('.due-date');
      
      expect(dueDateDisplay).toBeInTheDocument();
      expect(dueDateDisplay).toHaveTextContent('2025年12月31日');
    });

    test('should allow editing due date', () => {
      // TODO追加
      const form = container.querySelector('#todo-form');
      const input = form.querySelector('input[type="text"]');
      input.value = 'テストタスク';
      form.dispatchEvent(new Event('submit', { bubbles: true }));
      
      // 期限編集ボタンをクリック
      const todoItem = container.querySelector('.todo-item');
      const editDueDateBtn = todoItem.querySelector('.edit-due-date');
      editDueDateBtn.click();
      
      const dueDateInput = todoItem.querySelector('input[type="datetime-local"]');
      expect(dueDateInput).toBeInTheDocument();
    });
  });

  describe('Visual Indicators', () => {
    test('should add overdue class for past due dates', () => {
      // 過去の日付でTODO作成
      const todos = [{
        id: 1,
        text: '期限切れタスク',
        completed: false,
        order: 0,
        dueDate: new Date(Date.now() - 86400000).toISOString() // 1日前
      }];
      
      localStorage.setItem('todos', JSON.stringify(todos));
      app = createTodoApp(container);
      
      const todoItem = container.querySelector('.todo-item');
      expect(todoItem).toHaveClass('overdue');
    });

    test('should add due-soon class for items due within 24 hours', () => {
      // 12時間後の日付でTODO作成
      const todos = [{
        id: 1,
        text: '期限間近タスク',
        completed: false,
        order: 0,
        dueDate: new Date(Date.now() + 43200000).toISOString() // 12時間後
      }];
      
      localStorage.setItem('todos', JSON.stringify(todos));
      app = createTodoApp(container);
      
      const todoItem = container.querySelector('.todo-item');
      expect(todoItem).toHaveClass('due-soon');
    });

    test('should add due-week class for items due within a week', () => {
      // 3日後の日付でTODO作成
      const todos = [{
        id: 1,
        text: '今週期限タスク',
        completed: false,
        order: 0,
        dueDate: new Date(Date.now() + 259200000).toISOString() // 3日後
      }];
      
      localStorage.setItem('todos', JSON.stringify(todos));
      app = createTodoApp(container);
      
      const todoItem = container.querySelector('.todo-item');
      expect(todoItem).toHaveClass('due-week');
    });
  });

  describe('Filtering', () => {
    beforeEach(() => {
      // テスト用のTODOを作成
      const now = new Date();
      const todos = [
        {
          id: 1,
          text: '期限切れ',
          completed: false,
          order: 0,
          dueDate: new Date(now.getTime() - 86400000).toISOString()
        },
        {
          id: 2,
          text: '今日期限',
          completed: false,
          order: 1,
          dueDate: now.toISOString()
        },
        {
          id: 3,
          text: '今週期限',
          completed: false,
          order: 2,
          dueDate: new Date(now.getTime() + 259200000).toISOString()
        },
        {
          id: 4,
          text: '期限なし',
          completed: false,
          order: 3,
          dueDate: null
        }
      ];
      
      localStorage.setItem('todos', JSON.stringify(todos));
      app = createTodoApp(container);
    });

    test('should filter overdue todos', () => {
      const overdueFilter = container.querySelector('[data-filter="overdue"]');
      overdueFilter.click();
      
      const visibleTodos = container.querySelectorAll('.todo-item:not([style*="display: none"])');
      expect(visibleTodos).toHaveLength(1);
      expect(visibleTodos[0]).toHaveTextContent('期限切れ');
    });

    test('should filter todos due today', () => {
      const todayFilter = container.querySelector('[data-filter="today"]');
      todayFilter.click();
      
      const visibleTodos = container.querySelectorAll('.todo-item:not([style*="display: none"])');
      expect(visibleTodos).toHaveLength(1);
      expect(visibleTodos[0]).toHaveTextContent('今日期限');
    });

    test('should filter todos due this week', () => {
      const weekFilter = container.querySelector('[data-filter="week"]');
      weekFilter.click();
      
      const visibleTodos = container.querySelectorAll('.todo-item:not([style*="display: none"])');
      expect(visibleTodos).toHaveLength(2); // 今日と今週
    });

    test('should filter todos without due date', () => {
      const noDueFilter = container.querySelector('[data-filter="no-due"]');
      noDueFilter.click();
      
      const visibleTodos = container.querySelectorAll('.todo-item:not([style*="display: none"])');
      expect(visibleTodos).toHaveLength(1);
      expect(visibleTodos[0]).toHaveTextContent('期限なし');
    });
  });

  describe('Sorting', () => {
    test('should sort todos by due date', () => {
      const now = new Date();
      const todos = [
        {
          id: 1,
          text: '3日後',
          completed: false,
          order: 0,
          dueDate: new Date(now.getTime() + 259200000).toISOString()
        },
        {
          id: 2,
          text: '期限なし',
          completed: false,
          order: 1,
          dueDate: null
        },
        {
          id: 3,
          text: '明日',
          completed: false,
          order: 2,
          dueDate: new Date(now.getTime() + 86400000).toISOString()
        },
        {
          id: 4,
          text: '昨日',
          completed: false,
          order: 3,
          dueDate: new Date(now.getTime() - 86400000).toISOString()
        }
      ];
      
      localStorage.setItem('todos', JSON.stringify(todos));
      app = createTodoApp(container);
      
      // 期限順ソートボタンをクリック
      const sortButton = container.querySelector('[data-sort="due-date"]');
      sortButton.click();
      
      const todoItems = container.querySelectorAll('.todo-item');
      expect(todoItems[0]).toHaveTextContent('昨日'); // 過去の期限が最初
      expect(todoItems[1]).toHaveTextContent('明日');
      expect(todoItems[2]).toHaveTextContent('3日後');
      expect(todoItems[3]).toHaveTextContent('期限なし'); // 期限なしは最後
    });
  });

  describe('Date Formatting', () => {
    test('should display relative time for near dates', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const todos = [{
        id: 1,
        text: 'テストタスク',
        completed: false,
        order: 0,
        dueDate: tomorrow.toISOString()
      }];
      
      localStorage.setItem('todos', JSON.stringify(todos));
      app = createTodoApp(container);
      
      const dueDateDisplay = container.querySelector('.due-date');
      expect(dueDateDisplay.textContent).toMatch(/明日|1日後/);
    });

    test('should display overdue time', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      const todos = [{
        id: 1,
        text: 'テストタスク',
        completed: false,
        order: 0,
        dueDate: yesterday.toISOString()
      }];
      
      localStorage.setItem('todos', JSON.stringify(todos));
      app = createTodoApp(container);
      
      const dueDateDisplay = container.querySelector('.due-date');
      expect(dueDateDisplay.textContent).toMatch(/期限切れ|1日前/);
    });
  });

  describe('Persistence', () => {
    test('should save and load due dates from localStorage', () => {
      const form = container.querySelector('#todo-form');
      const input = form.querySelector('input[type="text"]');
      const dateInput = form.querySelector('input[type="datetime-local"]');
      
      input.value = '保存テスト';
      const dueDate = new Date('2025-12-31T15:30');
      dateInput.value = dueDate.toISOString().slice(0, 16);
      
      form.dispatchEvent(new Event('submit', { bubbles: true }));
      
      // 新しいアプリインスタンスを作成
      const newContainer = document.createElement('div');
      document.body.appendChild(newContainer);
      const newApp = createTodoApp(newContainer);
      
      const loadedTodo = newContainer.querySelector('.todo-item');
      const dueDateDisplay = loadedTodo.querySelector('.due-date');
      
      expect(dueDateDisplay).toHaveTextContent('2025年12月31日');
      
      document.body.removeChild(newContainer);
    });
  });
});