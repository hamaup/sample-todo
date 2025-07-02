const { createTodoApp } = require('./todoApp');
const { KeyboardShortcuts } = require('./keyboardShortcuts');

// DOM環境のセットアップ
require('@testing-library/jest-dom');

describe('Keyboard Shortcuts', () => {
  let container;
  let app;
  let shortcuts;

  beforeEach(() => {
    localStorage.clear();
    container = document.createElement('div');
    document.body.appendChild(container);
    app = createTodoApp(container);
    
    // ショートカットシステムを初期化
    shortcuts = new KeyboardShortcuts(app);
  });

  afterEach(() => {
    document.body.removeChild(container);
    localStorage.clear();
  });

  describe('Basic Shortcuts', () => {
    test('Ctrl+N should focus new todo input', () => {
      const input = container.querySelector('#todo-form input[type="text"]');
      const focusSpy = jest.spyOn(input, 'focus');

      // Ctrl+N を送信
      const event = new KeyboardEvent('keydown', {
        key: 'n',
        ctrlKey: true,
        bubbles: true
      });
      document.dispatchEvent(event);

      expect(focusSpy).toHaveBeenCalled();
    });

    test('Ctrl+F should focus search input', () => {
      const searchInput = container.querySelector('.search-input');
      const focusSpy = jest.spyOn(searchInput, 'focus');

      // Ctrl+F を送信
      const event = new KeyboardEvent('keydown', {
        key: 'f',
        ctrlKey: true,
        bubbles: true
      });
      document.dispatchEvent(event);

      expect(focusSpy).toHaveBeenCalled();
    });

    test('Escape should clear search and blur focus', () => {
      const searchInput = container.querySelector('.search-input');
      searchInput.value = 'test search';
      searchInput.focus();

      // Escape を送信
      const event = new KeyboardEvent('keydown', {
        key: 'Escape',
        bubbles: true
      });
      document.dispatchEvent(event);

      expect(searchInput.value).toBe('');
    });

    test('Ctrl+Enter should submit todo when input is focused', () => {
      const form = container.querySelector('#todo-form');
      const input = form.querySelector('input[type="text"]');
      
      input.value = 'Test TODO';
      input.focus();

      // Ctrl+Enter を送信
      const event = new KeyboardEvent('keydown', {
        key: 'Enter',
        ctrlKey: true,
        bubbles: true
      });
      document.dispatchEvent(event);

      // TODOが追加されたことを確認
      const todoItems = container.querySelectorAll('.todo-item');
      expect(todoItems).toHaveLength(1);
      expect(todoItems[0]).toHaveTextContent('Test TODO');
    });
  });

  describe('TODO Operations', () => {
    beforeEach(() => {
      // テスト用のTODOを追加
      const form = container.querySelector('#todo-form');
      const input = form.querySelector('input[type="text"]');
      
      ['Task 1', 'Task 2', 'Task 3'].forEach(text => {
        input.value = text;
        form.dispatchEvent(new Event('submit', { bubbles: true }));
      });
    });

    test('Ctrl+D should duplicate selected todo', () => {
      // 最初のTODOを選択
      shortcuts.currentFocusIndex = 0;
      shortcuts.updateFocusableItems();

      const originalCount = container.querySelectorAll('.todo-item').length;

      // Ctrl+D を送信
      const event = new KeyboardEvent('keydown', {
        key: 'd',
        ctrlKey: true,
        bubbles: true
      });
      document.dispatchEvent(event);

      // TODOが複製されたことを確認
      const todoItems = container.querySelectorAll('.todo-item');
      expect(todoItems).toHaveLength(originalCount + 1);
      expect(todoItems[todoItems.length - 1]).toHaveTextContent('Task 1 (コピー)');
    });

    test('Space should toggle todo completion', () => {
      // 最初のTODOを選択
      shortcuts.currentFocusIndex = 0;
      shortcuts.updateFocusableItems();

      const firstTodo = container.querySelector('.todo-item');
      const checkbox = firstTodo.querySelector('input[type="checkbox"]');
      
      expect(checkbox.checked).toBe(false);

      // Space を送信
      const event = new KeyboardEvent('keydown', {
        key: ' ',
        bubbles: true
      });
      document.dispatchEvent(event);

      expect(checkbox.checked).toBe(true);
    });

    test('Delete should remove selected todo', () => {
      // 最初のTODOを選択
      shortcuts.currentFocusIndex = 0;
      shortcuts.updateFocusableItems();

      const originalCount = container.querySelectorAll('.todo-item').length;

      // Delete を送信
      const event = new KeyboardEvent('keydown', {
        key: 'Delete',
        bubbles: true
      });
      document.dispatchEvent(event);

      // TODOが削除されたことを確認
      const todoItems = container.querySelectorAll('.todo-item');
      expect(todoItems).toHaveLength(originalCount - 1);
    });

    test('Enter should start editing selected todo', () => {
      // 最初のTODOを選択
      shortcuts.currentFocusIndex = 0;
      shortcuts.updateFocusableItems();

      // Enter を送信
      const event = new KeyboardEvent('keydown', {
        key: 'Enter',
        bubbles: true
      });
      document.dispatchEvent(event);

      // 編集モードになったことを確認
      const editInput = container.querySelector('.edit-input');
      expect(editInput).toBeInTheDocument();
    });
  });

  describe('Navigation Shortcuts', () => {
    beforeEach(() => {
      // テスト用のTODOを追加
      const form = container.querySelector('#todo-form');
      const input = form.querySelector('input[type="text"]');
      
      ['Task 1', 'Task 2', 'Task 3'].forEach(text => {
        input.value = text;
        form.dispatchEvent(new Event('submit', { bubbles: true }));
      });
    });

    test('ArrowDown should navigate to next todo', () => {
      shortcuts.currentFocusIndex = -1;

      // ArrowDown を送信
      const event = new KeyboardEvent('keydown', {
        key: 'ArrowDown',
        bubbles: true
      });
      document.dispatchEvent(event);

      expect(shortcuts.currentFocusIndex).toBe(0);
    });

    test('ArrowUp should navigate to previous todo', () => {
      shortcuts.currentFocusIndex = 1;

      // ArrowUp を送信
      const event = new KeyboardEvent('keydown', {
        key: 'ArrowUp',
        bubbles: true
      });
      document.dispatchEvent(event);

      expect(shortcuts.currentFocusIndex).toBe(0);
    });

    test('1, 2, 3 should switch filters', () => {
      const allFilter = container.querySelector('[data-filter="all"]');
      const incompleteFilter = container.querySelector('[data-filter="incomplete"]');
      const completedFilter = container.querySelector('[data-filter="completed"]');

      // 初期状態で「全て」がアクティブ
      expect(allFilter).toHaveClass('active');

      // 2 を送信（未完了フィルター）
      const event2 = new KeyboardEvent('keydown', {
        key: '2',
        code: 'Digit2',
        bubbles: true
      });
      document.dispatchEvent(event2);

      expect(incompleteFilter).toHaveClass('active');
      expect(allFilter).not.toHaveClass('active');

      // 3 を送信（完了済みフィルター）
      const event3 = new KeyboardEvent('keydown', {
        key: '3',
        code: 'Digit3',
        bubbles: true
      });
      document.dispatchEvent(event3);

      expect(completedFilter).toHaveClass('active');
      expect(incompleteFilter).not.toHaveClass('active');
    });

    test('Ctrl+1, Ctrl+2 should switch tabs', () => {
      const todosTab = container.querySelector('[data-tab="todos"]');
      const statsTab = container.querySelector('[data-tab="stats"]');

      // 初期状態でTODOタブがアクティブ
      expect(todosTab).toHaveClass('active');

      // Ctrl+2 を送信（統計タブ）
      const event = new KeyboardEvent('keydown', {
        key: '2',
        code: 'Digit2',
        ctrlKey: true,
        bubbles: true
      });
      document.dispatchEvent(event);

      expect(statsTab).toHaveClass('active');
      expect(todosTab).not.toHaveClass('active');
    });
  });

  describe('Help System', () => {
    test('? should toggle help dialog', () => {
      // ヘルプダイアログが存在することを確認
      const helpDialog = document.querySelector('.shortcut-help-dialog');
      expect(helpDialog).toBeInTheDocument();
      expect(helpDialog.style.display).toBe('none');

      // Shift+/ (?) を送信
      const event = new KeyboardEvent('keydown', {
        key: '/',
        shiftKey: true,
        bubbles: true
      });
      document.dispatchEvent(event);

      expect(helpDialog.style.display).toBe('block');

      // もう一度送信で閉じる
      const closeEvent = new KeyboardEvent('keydown', {
        key: '/',
        shiftKey: true,
        bubbles: true
      });
      document.dispatchEvent(closeEvent);
      expect(helpDialog.style.display).toBe('none');
    });

    test('help dialog should contain shortcut information', () => {
      // ヘルプを表示
      const event = new KeyboardEvent('keydown', {
        key: '/',
        shiftKey: true,
        bubbles: true
      });
      document.dispatchEvent(event);

      const helpDialog = document.querySelector('.shortcut-help-dialog');
      expect(helpDialog).toHaveTextContent('キーボードショートカット');
      expect(helpDialog).toHaveTextContent('基本操作');
      expect(helpDialog).toHaveTextContent('TODO操作');
      expect(helpDialog).toHaveTextContent('ナビゲーション');
    });
  });

  describe('Key String Generation', () => {
    test('should generate correct key strings for different modifiers', () => {
      // Ctrl+N
      expect(shortcuts.getKeyString({
        key: 'n',
        ctrlKey: true,
        metaKey: false,
        shiftKey: false,
        altKey: false
      })).toBe('Ctrl+n');

      // Meta+F (Cmd+F on Mac)
      expect(shortcuts.getKeyString({
        key: 'f',
        ctrlKey: false,
        metaKey: true,
        shiftKey: false,
        altKey: false
      })).toBe('Meta+f');

      // Ctrl+Shift+C
      expect(shortcuts.getKeyString({
        key: 'c',
        ctrlKey: true,
        metaKey: false,
        shiftKey: true,
        altKey: false
      })).toBe('Ctrl+Shift+c');

      // Space
      expect(shortcuts.getKeyString({
        key: ' ',
        ctrlKey: false,
        metaKey: false,
        shiftKey: false,
        altKey: false
      })).toBe('Space');
    });
  });

  describe('Input Handling', () => {
    test('should not interfere with typing in input fields', () => {
      const input = container.querySelector('#todo-form input[type="text"]');
      input.focus();
      input.value = 'test';

      // 通常の文字入力はショートカットとして処理されない
      const event = new KeyboardEvent('keydown', {
        key: 'd',
        bubbles: true
      });
      
      // input内での'd'キーはduplicateショートカットとして処理されないことを確認
      const originalCount = container.querySelectorAll('.todo-item').length;
      document.dispatchEvent(event);
      
      const newCount = container.querySelectorAll('.todo-item').length;
      expect(newCount).toBe(originalCount); // 複製されていない
    });

    test('should allow Ctrl+Enter in input fields', () => {
      const form = container.querySelector('#todo-form');
      const input = form.querySelector('input[type="text"]');
      
      input.value = 'New TODO';
      input.focus();

      // Ctrl+Enter は入力中でも有効
      const event = new KeyboardEvent('keydown', {
        key: 'Enter',
        ctrlKey: true,
        bubbles: true
      });
      document.dispatchEvent(event);

      const todoItems = container.querySelectorAll('.todo-item');
      expect(todoItems).toHaveLength(1);
      expect(todoItems[0]).toHaveTextContent('New TODO');
    });
  });
});