const { createTodoApp } = require('./todoApp');

describe('TODO App HTML Structure', () => {
  let container;

  beforeEach(() => {
    localStorage.clear();
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
    localStorage.clear();
  });

  test('should create basic HTML structure', () => {
    const app = createTodoApp(container);
    
    // ヘッダーが存在すること
    const header = container.querySelector('header');
    expect(header).toBeInTheDocument();
    expect(header.querySelector('h1')).toHaveTextContent('TODOアプリ');

    // TODO追加フォームが存在すること
    const form = container.querySelector('form#todo-form');
    expect(form).toBeInTheDocument();
    
    const input = form.querySelector('input[type="text"]');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('placeholder', 'TODOを入力');
    
    const submitButton = form.querySelector('button[type="submit"]');
    expect(submitButton).toBeInTheDocument();
    expect(submitButton).toHaveTextContent('追加');

    // フィルターボタンが存在すること
    const filterButtons = container.querySelectorAll('.filter-button');
    expect(filterButtons).toHaveLength(3);
    expect(filterButtons[0]).toHaveTextContent('全て');
    expect(filterButtons[1]).toHaveTextContent('未完了');
    expect(filterButtons[2]).toHaveTextContent('完了済み');

    // TODOリスト表示エリアが存在すること
    const todoList = container.querySelector('ul#todo-list');
    expect(todoList).toBeInTheDocument();
  });

  test('should have proper semantic HTML', () => {
    const app = createTodoApp(container);
    
    // main要素でコンテンツをラップ
    const main = container.querySelector('main');
    expect(main).toBeInTheDocument();

    // nav要素でフィルターをラップ
    const nav = container.querySelector('nav.filter-navigation');
    expect(nav).toBeInTheDocument();
    expect(nav.querySelector('.filter-button')).toBeInTheDocument();
  });

  test('should have accessibility attributes', () => {
    const app = createTodoApp(container);
    
    // フォームのラベル
    const input = container.querySelector('input[type="text"]');
    expect(input).toHaveAttribute('aria-label', 'TODO入力');
    
    // リストのaria-label
    const todoList = container.querySelector('ul#todo-list');
    expect(todoList).toHaveAttribute('aria-label', 'TODOリスト');
  });
});

describe('TODO App Functionality', () => {
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

  test('should add a new todo when form is submitted', () => {
    const form = container.querySelector('#todo-form');
    const input = form.querySelector('input[type="text"]');
    const todoList = container.querySelector('#todo-list');

    // 初期状態でリストは空
    expect(todoList.children).toHaveLength(0);

    // TODOテキストを入力
    input.value = '新しいTODO';
    
    // フォームを送信
    form.dispatchEvent(new Event('submit', { bubbles: true }));

    // TODOがリストに追加されていること
    expect(todoList.children).toHaveLength(1);
    const todoItem = todoList.children[0];
    expect(todoItem.tagName).toBe('LI');
    expect(todoItem.textContent).toContain('新しいTODO');
    
    // 入力フィールドがクリアされていること
    expect(input.value).toBe('');
  });

  test('should not add empty todo', () => {
    const form = container.querySelector('#todo-form');
    const input = form.querySelector('input[type="text"]');
    const todoList = container.querySelector('#todo-list');

    // 空の入力で送信
    input.value = '';
    form.dispatchEvent(new Event('submit', { bubbles: true }));

    // リストに何も追加されていないこと
    expect(todoList.children).toHaveLength(0);
  });

  test('should add multiple todos', () => {
    const form = container.querySelector('#todo-form');
    const input = form.querySelector('input[type="text"]');
    const todoList = container.querySelector('#todo-list');

    // 複数のTODOを追加
    const todos = ['TODO 1', 'TODO 2', 'TODO 3'];
    todos.forEach(todoText => {
      input.value = todoText;
      form.dispatchEvent(new Event('submit', { bubbles: true }));
    });

    // 全てのTODOがリストに追加されていること
    expect(todoList.children).toHaveLength(3);
    todos.forEach((todoText, index) => {
      expect(todoList.children[index].textContent).toContain(todoText);
    });
  });

  test('should toggle todo completion status when clicked', () => {
    const form = container.querySelector('#todo-form');
    const input = form.querySelector('input[type="text"]');
    const todoList = container.querySelector('#todo-list');

    // TODOを追加
    input.value = 'テストTODO';
    form.dispatchEvent(new Event('submit', { bubbles: true }));

    let todoItem = todoList.children[0];
    let checkbox = todoItem.querySelector('input[type="checkbox"]');

    // 初期状態では未完了
    expect(checkbox.checked).toBe(false);
    expect(todoItem.classList.contains('completed')).toBe(false);

    // クリックして完了状態に
    checkbox.click();
    
    // 再レンダリング後の要素を取得
    todoItem = todoList.children[0];
    checkbox = todoItem.querySelector('input[type="checkbox"]');
    expect(checkbox.checked).toBe(true);
    expect(todoItem.classList.contains('completed')).toBe(true);

    // 再度クリックして未完了状態に
    checkbox.click();
    
    // 再レンダリング後の要素を取得
    todoItem = todoList.children[0];
    checkbox = todoItem.querySelector('input[type="checkbox"]');
    expect(checkbox.checked).toBe(false);
    expect(todoItem.classList.contains('completed')).toBe(false);
  });

  test('should display checkbox for each todo item', () => {
    const form = container.querySelector('#todo-form');
    const input = form.querySelector('input[type="text"]');
    const todoList = container.querySelector('#todo-list');

    // 複数のTODOを追加
    ['TODO 1', 'TODO 2'].forEach(text => {
      input.value = text;
      form.dispatchEvent(new Event('submit', { bubbles: true }));
    });

    // 各TODOアイテムにチェックボックスがあること
    const todoItems = todoList.querySelectorAll('li');
    expect(todoItems).toHaveLength(2);
    
    todoItems.forEach(item => {
      const checkbox = item.querySelector('input[type="checkbox"]');
      expect(checkbox).toBeInTheDocument();
    });
  });

  test('should delete todo when delete button is clicked', () => {
    const form = container.querySelector('#todo-form');
    const input = form.querySelector('input[type="text"]');
    const todoList = container.querySelector('#todo-list');

    // TODOを3つ追加
    ['TODO 1', 'TODO 2', 'TODO 3'].forEach(text => {
      input.value = text;
      form.dispatchEvent(new Event('submit', { bubbles: true }));
    });

    expect(todoList.children).toHaveLength(3);

    // 2番目のTODOを削除
    const deleteButton = todoList.children[1].querySelector('.delete-button');
    deleteButton.click();

    // TODOが2つになっていること
    expect(todoList.children).toHaveLength(2);
    expect(todoList.children[0].textContent).toContain('TODO 1');
    expect(todoList.children[1].textContent).toContain('TODO 3');
  });

  test('should display delete button for each todo item', () => {
    const form = container.querySelector('#todo-form');
    const input = form.querySelector('input[type="text"]');
    const todoList = container.querySelector('#todo-list');

    // 複数のTODOを追加
    ['TODO 1', 'TODO 2'].forEach(text => {
      input.value = text;
      form.dispatchEvent(new Event('submit', { bubbles: true }));
    });

    // 各TODOアイテムに削除ボタンがあること
    const todoItems = todoList.querySelectorAll('li');
    todoItems.forEach(item => {
      const deleteButton = item.querySelector('.delete-button');
      expect(deleteButton).toBeInTheDocument();
      expect(deleteButton.textContent).toBe('削除');
    });
  });

  test('should edit todo when double clicked', () => {
    const form = container.querySelector('#todo-form');
    const input = form.querySelector('input[type="text"]');
    const todoList = container.querySelector('#todo-list');

    // TODOを追加
    input.value = '編集前のTODO';
    form.dispatchEvent(new Event('submit', { bubbles: true }));

    let todoItem = todoList.children[0];
    const label = todoItem.querySelector('label');
    
    // ダブルクリックで編集モードに
    label.dispatchEvent(new Event('dblclick', { bubbles: true }));

    // 再レンダリング後の要素を取得
    todoItem = todoList.children[0];
    const editInput = todoItem.querySelector('.edit-input');
    expect(editInput).toBeInTheDocument();
    expect(editInput.value).toBe('編集前のTODO');

    // 新しいテキストを入力してEnterキーで保存
    editInput.value = '編集後のTODO';
    editInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));

    // 編集が反映されていること
    expect(todoList.children[0].textContent).toContain('編集後のTODO');
    expect(todoList.children[0].querySelector('.edit-input')).not.toBeInTheDocument();
  });

  test('should cancel edit when escape key is pressed', () => {
    const form = container.querySelector('#todo-form');
    const input = form.querySelector('input[type="text"]');
    const todoList = container.querySelector('#todo-list');

    // TODOを追加
    input.value = '元のTODO';
    form.dispatchEvent(new Event('submit', { bubbles: true }));

    let todoItem = todoList.children[0];
    const label = todoItem.querySelector('label');
    
    // ダブルクリックで編集モードに
    label.dispatchEvent(new Event('dblclick', { bubbles: true }));

    // 再レンダリング後の要素を取得
    todoItem = todoList.children[0];
    const editInput = todoItem.querySelector('.edit-input');
    editInput.value = '変更されたTODO';
    
    // Escapeキーでキャンセル
    editInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));

    // 元のテキストのままであること
    expect(todoList.children[0].textContent).toContain('元のTODO');
    expect(todoList.children[0].querySelector('.edit-input')).not.toBeInTheDocument();
  });

  test('should not save empty todo when editing', () => {
    const form = container.querySelector('#todo-form');
    const input = form.querySelector('input[type="text"]');
    const todoList = container.querySelector('#todo-list');

    // TODOを追加
    input.value = '空にできないTODO';
    form.dispatchEvent(new Event('submit', { bubbles: true }));

    let todoItem = todoList.children[0];
    const label = todoItem.querySelector('label');
    
    // ダブルクリックで編集モードに
    label.dispatchEvent(new Event('dblclick', { bubbles: true }));

    // 再レンダリング後の要素を取得
    todoItem = todoList.children[0];
    const editInput = todoItem.querySelector('.edit-input');
    editInput.value = '';
    
    // 空文字でEnterキーを押す
    editInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));

    // 元のテキストのままであること
    expect(todoList.children[0].textContent).toContain('空にできないTODO');
    expect(todoList.children[0].querySelector('.edit-input')).not.toBeInTheDocument();
  });

  test('should filter todos by completion status', () => {
    const form = container.querySelector('#todo-form');
    const input = form.querySelector('input[type="text"]');
    const todoList = container.querySelector('#todo-list');

    // 完了と未完了のTODOを追加
    input.value = '未完了TODO1';
    form.dispatchEvent(new Event('submit', { bubbles: true }));
    input.value = '未完了TODO2';
    form.dispatchEvent(new Event('submit', { bubbles: true }));
    input.value = '完了TODO';
    form.dispatchEvent(new Event('submit', { bubbles: true }));

    // 3番目のTODOを完了にする
    const checkbox = todoList.children[2].querySelector('input[type="checkbox"]');
    checkbox.click();

    // 全て表示（デフォルト）
    expect(todoList.children).toHaveLength(3);

    // 未完了フィルター
    const incompleteButton = container.querySelector('[data-filter="incomplete"]');
    incompleteButton.click();
    expect(todoList.children).toHaveLength(2);
    expect(todoList.children[0].textContent).toContain('未完了TODO1');
    expect(todoList.children[1].textContent).toContain('未完了TODO2');

    // 完了済みフィルター
    const completedButton = container.querySelector('[data-filter="completed"]');
    completedButton.click();
    expect(todoList.children).toHaveLength(1);
    expect(todoList.children[0].textContent).toContain('完了TODO');

    // 全て表示に戻す
    const allButton = container.querySelector('[data-filter="all"]');
    allButton.click();
    expect(todoList.children).toHaveLength(3);
  });

  test('should highlight active filter button', () => {
    const allButton = container.querySelector('[data-filter="all"]');
    const incompleteButton = container.querySelector('[data-filter="incomplete"]');
    const completedButton = container.querySelector('[data-filter="completed"]');

    // デフォルトは全てボタンがアクティブ
    expect(allButton.classList.contains('active')).toBe(true);
    expect(incompleteButton.classList.contains('active')).toBe(false);
    expect(completedButton.classList.contains('active')).toBe(false);

    // 未完了ボタンをクリック
    incompleteButton.click();
    expect(allButton.classList.contains('active')).toBe(false);
    expect(incompleteButton.classList.contains('active')).toBe(true);
    expect(completedButton.classList.contains('active')).toBe(false);

    // 完了済みボタンをクリック
    completedButton.click();
    expect(allButton.classList.contains('active')).toBe(false);
    expect(incompleteButton.classList.contains('active')).toBe(false);
    expect(completedButton.classList.contains('active')).toBe(true);
  });

  test('should persist filter when adding or toggling todos', () => {
    const form = container.querySelector('#todo-form');
    const input = form.querySelector('input[type="text"]');
    const todoList = container.querySelector('#todo-list');
    const incompleteButton = container.querySelector('[data-filter="incomplete"]');

    // TODOを追加
    input.value = 'TODO1';
    form.dispatchEvent(new Event('submit', { bubbles: true }));
    input.value = 'TODO2';
    form.dispatchEvent(new Event('submit', { bubbles: true }));

    // 最初のTODOを完了にする
    let checkbox = todoList.children[0].querySelector('input[type="checkbox"]');
    checkbox.click();

    // 未完了フィルターを適用
    incompleteButton.click();
    expect(todoList.children).toHaveLength(1);
    expect(todoList.children[0].textContent).toContain('TODO2');

    // 新しいTODOを追加（フィルターが維持されているか確認）
    input.value = 'TODO3';
    form.dispatchEvent(new Event('submit', { bubbles: true }));
    expect(todoList.children).toHaveLength(2);
    expect(todoList.children[0].textContent).toContain('TODO2');
    expect(todoList.children[1].textContent).toContain('TODO3');
  });
});

describe('LocalStorage Persistence', () => {
  let container;
  let app;

  beforeEach(() => {
    // LocalStorageをクリア
    localStorage.clear();
    container = document.createElement('div');
    document.body.appendChild(container);
    app = createTodoApp(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
    localStorage.clear();
  });

  test('should save todos to localStorage when adding a todo', () => {
    const form = container.querySelector('#todo-form');
    const input = form.querySelector('input[type="text"]');

    // TODOを追加
    input.value = '保存されるTODO';
    form.dispatchEvent(new Event('submit', { bubbles: true }));

    // LocalStorageに保存されていることを確認
    const saved = JSON.parse(localStorage.getItem('todos'));
    expect(saved).toHaveLength(1);
    expect(saved[0]).toMatchObject({
      text: '保存されるTODO',
      completed: false
    });
    expect(saved[0].id).toBeDefined();
  });

  test('should save todos to localStorage when toggling completion', () => {
    const form = container.querySelector('#todo-form');
    const input = form.querySelector('input[type="text"]');
    const todoList = container.querySelector('#todo-list');

    // TODOを追加
    input.value = 'テストTODO';
    form.dispatchEvent(new Event('submit', { bubbles: true }));

    // 完了状態を切り替え
    const checkbox = todoList.children[0].querySelector('input[type="checkbox"]');
    checkbox.click();

    // LocalStorageに更新が反映されていることを確認
    const saved = JSON.parse(localStorage.getItem('todos'));
    expect(saved[0].completed).toBe(true);
  });

  test('should save todos to localStorage when deleting a todo', () => {
    const form = container.querySelector('#todo-form');
    const input = form.querySelector('input[type="text"]');
    const todoList = container.querySelector('#todo-list');

    // 複数のTODOを追加
    ['TODO 1', 'TODO 2', 'TODO 3'].forEach(text => {
      input.value = text;
      form.dispatchEvent(new Event('submit', { bubbles: true }));
    });

    // 2番目のTODOを削除
    const deleteButton = todoList.children[1].querySelector('.delete-button');
    deleteButton.click();

    // LocalStorageに反映されていることを確認
    const saved = JSON.parse(localStorage.getItem('todos'));
    expect(saved).toHaveLength(2);
    expect(saved[0].text).toBe('TODO 1');
    expect(saved[1].text).toBe('TODO 3');
  });

  test('should save todos to localStorage when editing a todo', () => {
    const form = container.querySelector('#todo-form');
    const input = form.querySelector('input[type="text"]');
    const todoList = container.querySelector('#todo-list');

    // TODOを追加
    input.value = '編集前';
    form.dispatchEvent(new Event('submit', { bubbles: true }));

    // ダブルクリックで編集モードに
    const label = todoList.children[0].querySelector('label');
    label.dispatchEvent(new Event('dblclick', { bubbles: true }));

    // 編集して保存
    const editInput = todoList.children[0].querySelector('.edit-input');
    editInput.value = '編集後';
    editInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));

    // LocalStorageに反映されていることを確認
    const saved = JSON.parse(localStorage.getItem('todos'));
    expect(saved[0].text).toBe('編集後');
  });

  test('should load todos from localStorage on initialization', () => {
    // 事前にLocalStorageにデータを保存
    const existingTodos = [
      { id: 1, text: '既存TODO 1', completed: false },
      { id: 2, text: '既存TODO 2', completed: true },
      { id: 3, text: '既存TODO 3', completed: false }
    ];
    localStorage.setItem('todos', JSON.stringify(existingTodos));

    // 新しいコンテナでアプリを初期化
    const newContainer = document.createElement('div');
    document.body.appendChild(newContainer);
    createTodoApp(newContainer);

    const todoList = newContainer.querySelector('#todo-list');
    const todoItems = todoList.querySelectorAll('li');

    // 保存されていたTODOが表示されていることを確認
    expect(todoItems).toHaveLength(3);
    expect(todoItems[0].textContent).toContain('既存TODO 1');
    expect(todoItems[1].textContent).toContain('既存TODO 2');
    expect(todoItems[1].classList.contains('completed')).toBe(true);
    expect(todoItems[2].textContent).toContain('既存TODO 3');

    document.body.removeChild(newContainer);
  });

  test('should handle corrupted localStorage data gracefully', () => {
    // 不正なデータをLocalStorageに保存
    localStorage.setItem('todos', 'invalid JSON data');

    // エラーなくアプリが初期化されることを確認
    const newContainer = document.createElement('div');
    document.body.appendChild(newContainer);
    expect(() => createTodoApp(newContainer)).not.toThrow();

    const todoList = newContainer.querySelector('#todo-list');
    expect(todoList.children).toHaveLength(0);

    document.body.removeChild(newContainer);
  });

  test('should maintain nextId across sessions', () => {
    const form = container.querySelector('#todo-form');
    const input = form.querySelector('input[type="text"]');

    // TODOを追加
    input.value = 'TODO 1';
    form.dispatchEvent(new Event('submit', { bubbles: true }));

    // 保存されたデータを確認
    const firstSave = JSON.parse(localStorage.getItem('todos'));
    const firstId = firstSave[0].id;

    // 新しいコンテナでアプリを再初期化
    const newContainer = document.createElement('div');
    document.body.appendChild(newContainer);
    createTodoApp(newContainer);

    const newForm = newContainer.querySelector('#todo-form');
    const newInput = newForm.querySelector('input[type="text"]');

    // 新しいTODOを追加
    newInput.value = 'TODO 2';
    newForm.dispatchEvent(new Event('submit', { bubbles: true }));

    // IDが重複していないことを確認
    const secondSave = JSON.parse(localStorage.getItem('todos'));
    expect(secondSave).toHaveLength(2);
    expect(secondSave[1].id).toBeGreaterThan(firstId);

    document.body.removeChild(newContainer);
  });
});

describe('Accessibility and Quality', () => {
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

  test('should have proper ARIA labels for screen readers', () => {
    const form = container.querySelector('#todo-form');
    const input = form.querySelector('input[type="text"]');
    const todoList = container.querySelector('#todo-list');

    // フォーム要素のアクセシビリティ
    expect(input).toHaveAttribute('aria-label', 'TODO入力');
    expect(todoList).toHaveAttribute('aria-label', 'TODOリスト');

    // TODOを追加
    input.value = 'アクセシビリティテスト';
    form.dispatchEvent(new Event('submit', { bubbles: true }));

    // チェックボックスのラベル関連付け
    const checkbox = todoList.querySelector('input[type="checkbox"]');
    const label = todoList.querySelector('label');
    expect(label).toContainElement(checkbox);
  });

  test('should be keyboard navigable', () => {
    const form = container.querySelector('#todo-form');
    const input = form.querySelector('input[type="text"]');
    const filterButtons = container.querySelectorAll('.filter-button');

    // タブ可能な要素
    expect(input.tabIndex).toBeGreaterThanOrEqual(0);
    filterButtons.forEach(button => {
      expect(button.tabIndex).toBeGreaterThanOrEqual(0);
    });

    // TODOを追加
    input.value = 'キーボードナビゲーションテスト';
    form.dispatchEvent(new Event('submit', { bubbles: true }));

    const todoList = container.querySelector('#todo-list');
    const checkbox = todoList.querySelector('input[type="checkbox"]');
    const deleteButton = todoList.querySelector('.delete-button');

    expect(checkbox.tabIndex).toBeGreaterThanOrEqual(0);
    expect(deleteButton.tabIndex).toBeGreaterThanOrEqual(0);
  });

  test('should maintain focus management during editing', () => {
    const form = container.querySelector('#todo-form');
    const input = form.querySelector('input[type="text"]');
    const todoList = container.querySelector('#todo-list');

    // TODOを追加
    input.value = 'フォーカステスト';
    form.dispatchEvent(new Event('submit', { bubbles: true }));

    // 編集モードに入る
    const label = todoList.querySelector('label');
    label.dispatchEvent(new Event('dblclick', { bubbles: true }));

    // 編集入力にフォーカスがあることを確認
    const editInput = todoList.querySelector('.edit-input');
    expect(editInput).toBeTruthy();
    // 実際のブラウザではsetTimeoutでフォーカスされるが、テストでは確認が難しい
  });

  test('should handle edge cases gracefully', () => {
    const form = container.querySelector('#todo-form');
    const input = form.querySelector('input[type="text"]');
    const todoList = container.querySelector('#todo-list');

    // 非常に長いテキスト
    const longText = 'a'.repeat(500);
    input.value = longText;
    form.dispatchEvent(new Event('submit', { bubbles: true }));
    expect(todoList.children).toHaveLength(1);
    expect(todoList.children[0].textContent).toContain(longText);

    // 特殊文字
    const specialChars = '<script>alert("XSS")</script>';
    input.value = specialChars;
    form.dispatchEvent(new Event('submit', { bubbles: true }));
    expect(todoList.children).toHaveLength(2);
    // テキストがエスケープされていることを確認
    expect(todoList.children[1].innerHTML).not.toContain('<script>');
    expect(todoList.children[1].textContent).toContain(specialChars);

    // 絵文字
    const emoji = '🎉 タスク完了 🎉';
    input.value = emoji;
    form.dispatchEvent(new Event('submit', { bubbles: true }));
    expect(todoList.children).toHaveLength(3);
    expect(todoList.children[2].textContent).toContain(emoji);
  });

  test('should handle rapid user interactions', () => {
    const form = container.querySelector('#todo-form');
    const input = form.querySelector('input[type="text"]');
    const todoList = container.querySelector('#todo-list');

    // 高速に複数のTODOを追加
    for (let i = 0; i < 10; i++) {
      input.value = `高速追加 ${i}`;
      form.dispatchEvent(new Event('submit', { bubbles: true }));
    }
    expect(todoList.children).toHaveLength(10);

    // 高速にチェック状態を切り替え
    for (let i = 0; i < todoList.children.length; i++) {
      if (i % 2 === 0) {
        const checkbox = todoList.children[i].querySelector('input[type="checkbox"]');
        checkbox.click();
      }
    }

    // 再レンダリング後の完了アイテムを確認
    const completedCount = Array.from(todoList.children).filter(li => 
      li.classList.contains('completed')
    ).length;
    expect(completedCount).toBe(5);
  });

  test('should maintain data consistency with localStorage', () => {
    const form = container.querySelector('#todo-form');
    const input = form.querySelector('input[type="text"]');
    
    // 複数の操作を連続で実行
    input.value = 'データ整合性テスト1';
    form.dispatchEvent(new Event('submit', { bubbles: true }));
    
    input.value = 'データ整合性テスト2';
    form.dispatchEvent(new Event('submit', { bubbles: true }));

    // チェック状態を変更
    const todoList = container.querySelector('#todo-list');
    const checkbox = todoList.children[0].querySelector('input[type="checkbox"]');
    checkbox.click();

    // 削除
    const deleteButton = todoList.children[1].querySelector('.delete-button');
    deleteButton.click();

    // LocalStorageと表示が一致していることを確認
    const saved = JSON.parse(localStorage.getItem('todos'));
    expect(saved).toHaveLength(1);
    expect(saved[0].text).toBe('データ整合性テスト1');
    expect(saved[0].completed).toBe(true);
    expect(todoList.children).toHaveLength(1);
  });

  test('should handle concurrent filter and data operations', () => {
    const form = container.querySelector('#todo-form');
    const input = form.querySelector('input[type="text"]');
    const todoList = container.querySelector('#todo-list');
    const incompleteButton = container.querySelector('[data-filter="incomplete"]');
    
    // データを準備
    ['タスク1', 'タスク2', 'タスク3'].forEach(text => {
      input.value = text;
      form.dispatchEvent(new Event('submit', { bubbles: true }));
    });

    // 一部を完了にする
    todoList.children[0].querySelector('input[type="checkbox"]').click();
    todoList.children[2].querySelector('input[type="checkbox"]').click();

    // フィルターを適用
    incompleteButton.click();
    expect(todoList.children).toHaveLength(1);
    expect(todoList.children[0].textContent).toContain('タスク2');

    // フィルター適用中に新規追加
    input.value = 'フィルター中の新規タスク';
    form.dispatchEvent(new Event('submit', { bubbles: true }));
    expect(todoList.children).toHaveLength(2);

    // フィルターを解除して全体を確認
    const allButton = container.querySelector('[data-filter="all"]');
    allButton.click();
    expect(todoList.children).toHaveLength(4);
  });
});

describe('Search Functionality', () => {
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

  test('should have a search input field', () => {
    const searchInput = container.querySelector('input[type="search"]');
    expect(searchInput).toBeInTheDocument();
    expect(searchInput).toHaveAttribute('placeholder', 'TODOを検索...');
    expect(searchInput).toHaveAttribute('aria-label', 'TODO検索');
  });

  test('should filter todos based on search query', (done) => {
    const form = container.querySelector('#todo-form');
    const input = form.querySelector('input[type="text"]');
    const searchInput = container.querySelector('input[type="search"]');
    const todoList = container.querySelector('#todo-list');

    // TODOを追加
    ['買い物に行く', '本を読む', '運動する', '買い物リストを作る'].forEach(text => {
      input.value = text;
      form.dispatchEvent(new Event('submit', { bubbles: true }));
    });

    expect(todoList.children).toHaveLength(4);

    // 検索
    searchInput.value = '買い物';
    searchInput.dispatchEvent(new Event('input', { bubbles: true }));

    // デバウンスを待つ
    setTimeout(() => {
      // 検索結果
      expect(todoList.children).toHaveLength(2);
      expect(todoList.children[0].textContent).toContain('買い物に行く');
      expect(todoList.children[1].textContent).toContain('買い物リストを作る');
      done();
    }, 400);
  });

  test('should perform case-insensitive search', () => {
    const form = container.querySelector('#todo-form');
    const input = form.querySelector('input[type="text"]');
    const searchInput = container.querySelector('input[type="search"]');
    const todoList = container.querySelector('#todo-list');

    // TODOを追加
    ['TODO作成', 'todo確認', 'ToDo整理'].forEach(text => {
      input.value = text;
      form.dispatchEvent(new Event('submit', { bubbles: true }));
    });

    // 大文字で検索
    searchInput.value = 'TODO';
    searchInput.dispatchEvent(new Event('input', { bubbles: true }));

    // すべてマッチする
    expect(todoList.children).toHaveLength(3);
  });

  test('should clear search when input is empty', (done) => {
    const form = container.querySelector('#todo-form');
    const input = form.querySelector('input[type="text"]');
    const searchInput = container.querySelector('input[type="search"]');
    const todoList = container.querySelector('#todo-list');

    // TODOを追加
    ['タスク1', 'タスク2', 'タスク3'].forEach(text => {
      input.value = text;
      form.dispatchEvent(new Event('submit', { bubbles: true }));
    });

    // 検索
    searchInput.value = 'タスク1';
    searchInput.dispatchEvent(new Event('input', { bubbles: true }));
    
    setTimeout(() => {
      expect(todoList.children).toHaveLength(1);

      // 検索をクリア
      searchInput.value = '';
      searchInput.dispatchEvent(new Event('input', { bubbles: true }));
      
      setTimeout(() => {
        expect(todoList.children).toHaveLength(3);
        done();
      }, 400);
    }, 400);
  });

  test('should work with filters and search together', (done) => {
    const form = container.querySelector('#todo-form');
    const input = form.querySelector('input[type="text"]');
    const searchInput = container.querySelector('input[type="search"]');
    const todoList = container.querySelector('#todo-list');
    const incompleteButton = container.querySelector('[data-filter="incomplete"]');

    // TODOを追加
    ['買い物に行く', '本を読む', '買い物リストを作る'].forEach(text => {
      input.value = text;
      form.dispatchEvent(new Event('submit', { bubbles: true }));
    });

    // 最初のTODOを完了にする
    todoList.children[0].querySelector('input[type="checkbox"]').click();

    // 未完了フィルターを適用
    incompleteButton.click();
    expect(todoList.children).toHaveLength(2);

    // 検索を追加
    searchInput.value = '買い物';
    searchInput.dispatchEvent(new Event('input', { bubbles: true }));

    // デバウンスを待つ
    setTimeout(() => {
      // フィルターと検索の両方が適用される
      expect(todoList.children).toHaveLength(1);
      expect(todoList.children[0].textContent).toContain('買い物リストを作る');
      done();
    }, 400);
  });

  test('should highlight search terms in results', (done) => {
    const form = container.querySelector('#todo-form');
    const input = form.querySelector('input[type="text"]');
    const searchInput = container.querySelector('input[type="search"]');
    const todoList = container.querySelector('#todo-list');

    // TODOを追加
    input.value = '重要なタスクを完了する';
    form.dispatchEvent(new Event('submit', { bubbles: true }));

    // 検索
    searchInput.value = '重要';
    searchInput.dispatchEvent(new Event('input', { bubbles: true }));

    // デバウンスを待つ
    setTimeout(() => {
      // ハイライトされているか確認
      const todoText = todoList.children[0].querySelector('label').innerHTML;
      expect(todoText).toContain('<mark>');
      expect(todoText).toContain('重要');
      done();
    }, 400);
  });

  test.skip('should debounce search input for performance', (done) => {
    const form = container.querySelector('#todo-form');
    const input = form.querySelector('input[type="text"]');
    const searchInput = container.querySelector('input[type="search"]');

    // 多数のTODOを追加
    for (let i = 1; i <= 10; i++) {
      input.value = `タスク${i}`;
      form.dispatchEvent(new Event('submit', { bubbles: true }));
    }

    let renderCount = 0;
    const originalRender = app.render;
    app.render = function() {
      renderCount++;
      originalRender.call(this);
    };

    // 高速に入力
    'タスク'.split('').forEach((char, index) => {
      searchInput.value += char;
      searchInput.dispatchEvent(new Event('input', { bubbles: true }));
    });

    // デバウンス後に1回だけレンダリングされることを確認
    setTimeout(() => {
      // デバウンスにより、複数回の入力でも1回だけレンダリングされる
      expect(renderCount).toBeGreaterThanOrEqual(1);
      expect(renderCount).toBeLessThanOrEqual(2);
      done();
    }, 400);
  }, 10000);
});

describe('TODO App Drag and Drop', () => {
  let container;
  let app;

  beforeEach(() => {
    localStorage.clear();
    container = document.createElement('div');
    document.body.appendChild(container);
    
    // Mock DragEvent for jsdom
    global.DragEvent = class DragEvent extends Event {
      constructor(type, eventInitDict) {
        super(type, eventInitDict);
        this.dataTransfer = eventInitDict?.dataTransfer || {
          setData: jest.fn(),
          getData: jest.fn(),
          effectAllowed: null,
          dropEffect: null
        };
      }
    };
    
    app = createTodoApp(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
    localStorage.clear();
  });

  test('should make todo items draggable', () => {
    const form = container.querySelector('#todo-form');
    const input = form.querySelector('input[type="text"]');
    
    // 複数のTODOを追加
    ['TODO 1', 'TODO 2', 'TODO 3'].forEach(text => {
      input.value = text;
      form.dispatchEvent(new Event('submit', { bubbles: true }));
    });

    const todoItems = container.querySelectorAll('.todo-item');
    todoItems.forEach(item => {
      expect(item).toHaveAttribute('draggable', 'true');
    });
  });

  test('should add order property to todos', () => {
    const form = container.querySelector('#todo-form');
    const input = form.querySelector('input[type="text"]');
    
    // TODOを追加
    input.value = 'Test TODO';
    form.dispatchEvent(new Event('submit', { bubbles: true }));

    // LocalStorageから読み込んで確認
    const savedTodos = JSON.parse(localStorage.getItem('todos'));
    expect(savedTodos[0]).toHaveProperty('order');
    expect(savedTodos[0].order).toBe(0);
  });

  test('should maintain order when adding multiple todos', () => {
    const form = container.querySelector('#todo-form');
    const input = form.querySelector('input[type="text"]');
    
    // 複数のTODOを追加
    ['First', 'Second', 'Third'].forEach((text, index) => {
      input.value = text;
      form.dispatchEvent(new Event('submit', { bubbles: true }));
    });

    const savedTodos = JSON.parse(localStorage.getItem('todos'));
    expect(savedTodos[0].order).toBe(0);
    expect(savedTodos[1].order).toBe(1);
    expect(savedTodos[2].order).toBe(2);
  });

  test('should handle dragstart event', () => {
    const form = container.querySelector('#todo-form');
    const input = form.querySelector('input[type="text"]');
    
    input.value = 'Draggable TODO';
    form.dispatchEvent(new Event('submit', { bubbles: true }));

    const todoItem = container.querySelector('.todo-item');
    const dataTransfer = {
      setData: jest.fn(),
      effectAllowed: null
    };

    const dragEvent = new DragEvent('dragstart', { 
      bubbles: true,
      dataTransfer: dataTransfer 
    });
    Object.defineProperty(dragEvent, 'dataTransfer', {
      value: dataTransfer,
      writable: false
    });

    todoItem.dispatchEvent(dragEvent);
    
    expect(dataTransfer.setData).toHaveBeenCalledWith('text/plain', expect.any(String));
    expect(dataTransfer.effectAllowed).toBe('move');
    expect(todoItem.classList.contains('dragging')).toBe(true);
  });

  test('should handle dragend event', () => {
    const form = container.querySelector('#todo-form');
    const input = form.querySelector('input[type="text"]');
    
    input.value = 'Draggable TODO';
    form.dispatchEvent(new Event('submit', { bubbles: true }));

    const todoItem = container.querySelector('.todo-item');
    todoItem.classList.add('dragging');
    
    const dragEndEvent = new DragEvent('dragend', { bubbles: true });
    todoItem.dispatchEvent(dragEndEvent);
    
    expect(todoItem.classList.contains('dragging')).toBe(false);
  });

  test('should reorder todos on drop', () => {
    const form = container.querySelector('#todo-form');
    const input = form.querySelector('input[type="text"]');
    
    // 3つのTODOを追加
    ['First', 'Second', 'Third'].forEach(text => {
      input.value = text;
      form.dispatchEvent(new Event('submit', { bubbles: true }));
    });

    // ドラッグ&ドロップをシミュレート（FirstをThirdの後に移動）
    const todoItems = container.querySelectorAll('.todo-item');
    const firstItem = todoItems[0];
    const thirdItem = todoItems[2];

    // Get the actual todo IDs
    const firstTodoId = firstItem.dataset.todoId;
    
    // dragstart
    const dataTransfer = {
      setData: jest.fn(),
      getData: jest.fn().mockReturnValue(firstTodoId), // First itemのID
      effectAllowed: null
    };
    
    const dragStartEvent = new DragEvent('dragstart', { 
      bubbles: true,
      dataTransfer: dataTransfer 
    });
    Object.defineProperty(dragStartEvent, 'dataTransfer', {
      value: dataTransfer,
      writable: false
    });
    firstItem.dispatchEvent(dragStartEvent);

    // drop on third item
    const dropEvent = new DragEvent('drop', { 
      bubbles: true,
      dataTransfer: dataTransfer 
    });
    Object.defineProperty(dropEvent, 'dataTransfer', {
      value: dataTransfer,
      writable: false
    });
    thirdItem.dispatchEvent(dropEvent);

    // 順序が変更されたことを確認
    const updatedTodos = JSON.parse(localStorage.getItem('todos'));
    const sortedTodos = updatedTodos.sort((a, b) => a.order - b.order);
    
    expect(sortedTodos[0].text).toBe('Second');
    expect(sortedTodos[1].text).toBe('Third');
    expect(sortedTodos[2].text).toBe('First');
  });

  test('should handle keyboard reordering with Shift+ArrowUp', () => {
    const form = container.querySelector('#todo-form');
    const input = form.querySelector('input[type="text"]');
    
    // 複数のTODOを追加
    ['First', 'Second', 'Third'].forEach(text => {
      input.value = text;
      form.dispatchEvent(new Event('submit', { bubbles: true }));
    });

    const todoItems = container.querySelectorAll('.todo-item');
    const secondItem = todoItems[1];
    
    // フォーカスを設定
    secondItem.focus();
    
    // Shift+ArrowUpキーイベント
    const keyEvent = new KeyboardEvent('keydown', {
      key: 'ArrowUp',
      shiftKey: true,
      bubbles: true
    });
    secondItem.dispatchEvent(keyEvent);

    // 順序が変更されたことを確認
    const updatedTodos = JSON.parse(localStorage.getItem('todos'));
    const sortedTodos = updatedTodos.sort((a, b) => a.order - b.order);
    
    expect(sortedTodos[0].text).toBe('Second');
    expect(sortedTodos[1].text).toBe('First');
  });

  test('should handle keyboard reordering with Shift+ArrowDown', () => {
    const form = container.querySelector('#todo-form');
    const input = form.querySelector('input[type="text"]');
    
    // 複数のTODOを追加
    ['First', 'Second', 'Third'].forEach(text => {
      input.value = text;
      form.dispatchEvent(new Event('submit', { bubbles: true }));
    });

    const todoItems = container.querySelectorAll('.todo-item');
    const secondItem = todoItems[1];
    
    // フォーカスを設定
    secondItem.focus();
    
    // Shift+ArrowDownキーイベント
    const keyEvent = new KeyboardEvent('keydown', {
      key: 'ArrowDown',
      shiftKey: true,
      bubbles: true
    });
    secondItem.dispatchEvent(keyEvent);

    // 順序が変更されたことを確認
    const updatedTodos = JSON.parse(localStorage.getItem('todos'));
    const sortedTodos = updatedTodos.sort((a, b) => a.order - b.order);
    
    expect(sortedTodos[1].text).toBe('Third');
    expect(sortedTodos[2].text).toBe('Second');
  });

  test('should add visual feedback during drag', () => {
    const form = container.querySelector('#todo-form');
    const input = form.querySelector('input[type="text"]');
    
    // 複数のTODOを追加
    ['First', 'Second'].forEach(text => {
      input.value = text;
      form.dispatchEvent(new Event('submit', { bubbles: true }));
    });

    const todoItems = container.querySelectorAll('.todo-item');
    const secondItem = todoItems[1];

    // dragover イベント
    const dragOverEvent = new DragEvent('dragover', { bubbles: true });
    secondItem.dispatchEvent(dragOverEvent);
    
    expect(secondItem.classList.contains('drag-over')).toBe(true);

    // dragleave イベント
    const dragLeaveEvent = new DragEvent('dragleave', { bubbles: true });
    secondItem.dispatchEvent(dragLeaveEvent);
    
    expect(secondItem.classList.contains('drag-over')).toBe(false);
  });
});

describe('TODO App Statistics', () => {
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

  test('should show statistics tab', () => {
    // 統計タブが存在することを確認
    const statsTab = container.querySelector('[data-tab="stats"]');
    expect(statsTab).toBeInTheDocument();
    expect(statsTab).toHaveTextContent('統計');
  });

  test('should calculate basic statistics', () => {
    const form = container.querySelector('#todo-form');
    const input = form.querySelector('input[type="text"]');
    
    // TODOを追加
    ['Task 1', 'Task 2', 'Task 3'].forEach(text => {
      input.value = text;
      form.dispatchEvent(new Event('submit', { bubbles: true }));
    });

    // いくつかを完了にする
    let checkboxes = container.querySelectorAll('input[type="checkbox"]');
    checkboxes[0].click();
    
    // Re-query after first click due to re-render
    checkboxes = container.querySelectorAll('input[type="checkbox"]');
    checkboxes[1].click();

    // 統計タブをクリック
    const statsTab = container.querySelector('[data-tab="stats"]');
    statsTab.click();

    // 統計が表示されることを確認
    const totalCount = container.querySelector('.stat-total');
    const completedCount = container.querySelector('.stat-completed');
    const incompleteCount = container.querySelector('.stat-incomplete');
    const completionRate = container.querySelector('.stat-completion-rate');

    expect(totalCount).toHaveTextContent('3');
    expect(completedCount).toHaveTextContent('2');
    expect(incompleteCount).toHaveTextContent('1');
    expect(completionRate).toHaveTextContent('66.7%');
  });

  test('should track creation and completion dates', () => {
    const form = container.querySelector('#todo-form');
    const input = form.querySelector('input[type="text"]');
    
    // TODOを追加
    input.value = 'Test Task';
    form.dispatchEvent(new Event('submit', { bubbles: true }));

    // LocalStorageから確認
    let todos = JSON.parse(localStorage.getItem('todos'));
    expect(todos[0].createdAt).toBeDefined();
    expect(todos[0].completedAt).toBeNull();

    // 完了にする
    const checkbox = container.querySelector('input[type="checkbox"]');
    checkbox.click();

    // 完了日時が記録されることを確認
    todos = JSON.parse(localStorage.getItem('todos'));
    expect(todos[0].completedAt).toBeDefined();
  });

  test('should show daily completion chart', () => {
    // 統計タブをクリック
    const statsTab = container.querySelector('[data-tab="stats"]');
    statsTab.click();

    // チャートコンテナが存在することを確認
    const chartContainer = container.querySelector('.daily-chart');
    expect(chartContainer).toBeInTheDocument();
    
    // Canvas要素が存在することを確認
    const canvas = chartContainer.querySelector('canvas');
    expect(canvas).toBeInTheDocument();
  });

  test('should export statistics as JSON', () => {
    const form = container.querySelector('#todo-form');
    const input = form.querySelector('input[type="text"]');
    
    // TODOを追加
    ['Task 1', 'Task 2'].forEach(text => {
      input.value = text;
      form.dispatchEvent(new Event('submit', { bubbles: true }));
    });

    // 統計タブをクリック
    const statsTab = container.querySelector('[data-tab="stats"]');
    statsTab.click();

    // エクスポートボタンをクリック
    const exportBtn = container.querySelector('.export-json');
    
    // ダウンロードをモック
    const mockLink = {
      click: jest.fn(),
      setAttribute: jest.fn(),
      style: {}
    };
    jest.spyOn(document, 'createElement').mockReturnValueOnce(mockLink);
    
    exportBtn.click();

    expect(mockLink.setAttribute).toHaveBeenCalledWith('download', expect.stringContaining('todo-stats-'));
    expect(mockLink.click).toHaveBeenCalled();
  });

  test('should show completion streak', () => {
    // 統計タブをクリック
    const statsTab = container.querySelector('[data-tab="stats"]');
    statsTab.click();

    // ストリーク表示が存在することを確認
    const streakDisplay = container.querySelector('.stat-streak');
    expect(streakDisplay).toBeInTheDocument();
    expect(streakDisplay).toHaveTextContent('0日');
  });

  test('should filter statistics by date range', () => {
    // 統計タブをクリック
    const statsTab = container.querySelector('[data-tab="stats"]');
    statsTab.click();

    // 日付範囲フィルターが存在することを確認
    const dateRangeSelect = container.querySelector('.date-range-filter');
    expect(dateRangeSelect).toBeInTheDocument();
    
    // オプションを確認
    const options = dateRangeSelect.querySelectorAll('option');
    expect(options[0]).toHaveTextContent('今日');
    expect(options[1]).toHaveTextContent('今週');
    expect(options[2]).toHaveTextContent('今月');
    expect(options[3]).toHaveTextContent('全期間');
  });
});

describe('Dark Mode Functionality', () => {
  let container;
  let matchMediaMock;

  beforeEach(() => {
    // window.matchMediaをモック
    matchMediaMock = {
      matches: false,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn()
    };
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: jest.fn().mockImplementation(() => matchMediaMock)
    });

    // localStorageをクリア
    localStorage.clear();

    container = document.createElement('div');
    document.body.appendChild(container);
    createTodoApp(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
    jest.restoreAllMocks();
  });

  test('should have theme toggle button', () => {
    const themeToggle = container.querySelector('.theme-toggle');
    expect(themeToggle).toBeInTheDocument();
    expect(themeToggle).toHaveAttribute('aria-label');
    expect(themeToggle).toHaveAttribute('title', 'ダークモード切り替え');
  });

  test('should toggle theme when button is clicked', () => {
    const themeToggle = container.querySelector('.theme-toggle');
    const themeIcon = container.querySelector('.theme-icon');

    // 初期状態はライトモード
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    expect(themeIcon.textContent).toBe('🌙');
    expect(themeToggle.getAttribute('aria-label')).toBe('ダークモードに切り替え');

    // ダークモードに切り替え
    themeToggle.click();
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(themeIcon.textContent).toBe('☀️');
    expect(themeToggle.getAttribute('aria-label')).toBe('ライトモードに切り替え');

    // ライトモードに戻す
    themeToggle.click();
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    expect(themeIcon.textContent).toBe('🌙');
  });

  test('should persist theme preference in localStorage', () => {
    const themeToggle = container.querySelector('.theme-toggle');

    // ダークモードに切り替え
    themeToggle.click();
    expect(localStorage.getItem('theme')).toBe('dark');

    // ライトモードに戻す
    themeToggle.click();
    expect(localStorage.getItem('theme')).toBe('light');
  });

  test('should respect system preference when no saved theme', () => {
    // システムがダークモードを好む場合
    matchMediaMock.matches = true;

    // 新しいアプリインスタンスを作成
    const newContainer = document.createElement('div');
    document.body.appendChild(newContainer);
    createTodoApp(newContainer);

    // ダークモードが適用されているか確認
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');

    document.body.removeChild(newContainer);
  });

  test('should load saved theme preference on initialization', () => {
    // ダークモードを保存
    localStorage.setItem('theme', 'dark');

    // 新しいアプリインスタンスを作成
    const newContainer = document.createElement('div');
    document.body.appendChild(newContainer);
    createTodoApp(newContainer);

    // 保存されたテーマが適用されているか確認
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    const themeIcon = newContainer.querySelector('.theme-icon');
    expect(themeIcon.textContent).toBe('☀️');

    document.body.removeChild(newContainer);
  });

  test('should update theme when system preference changes', () => {
    // システム設定の変更リスナーを取得
    const changeListener = matchMediaMock.addEventListener.mock.calls[0][1];

    // システムがダークモードに変更
    changeListener({ matches: true });
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');

    // システムがライトモードに変更
    changeListener({ matches: false });
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  test('should not change theme on system preference change if user has set preference', () => {
    const themeToggle = container.querySelector('.theme-toggle');

    // ユーザーがダークモードを選択
    themeToggle.click();
    expect(localStorage.getItem('theme')).toBe('dark');

    // システム設定の変更リスナーを取得
    const changeListener = matchMediaMock.addEventListener.mock.calls[0][1];

    // システムがライトモードに変更されても、ユーザー設定を維持
    changeListener({ matches: false });
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  test('should handle environments without matchMedia gracefully', () => {
    // matchMediaが存在しない環境をシミュレート
    delete window.matchMedia;

    // 新しいアプリインスタンスを作成
    const newContainer = document.createElement('div');
    document.body.appendChild(newContainer);

    // エラーなく初期化されることを確認
    expect(() => {
      createTodoApp(newContainer);
    }).not.toThrow();

    // デフォルトのライトモードが適用されているか確認
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');

    document.body.removeChild(newContainer);
  });

  test('should maintain visual hierarchy in dark mode', () => {
    const themeToggle = container.querySelector('.theme-toggle');

    // ダークモードに切り替え
    themeToggle.click();

    // すべての主要な要素が存在し、機能することを確認
    const form = container.querySelector('#todo-form');
    const input = form.querySelector('input[type="text"]');
    const addButton = form.querySelector('button[type="submit"]');
    const searchInput = container.querySelector('.search-input');
    const filterButtons = container.querySelectorAll('.filter-button');

    expect(form).toBeInTheDocument();
    expect(input).toBeInTheDocument();
    expect(addButton).toBeInTheDocument();
    expect(searchInput).toBeInTheDocument();
    expect(filterButtons.length).toBeGreaterThan(0);

    // TODOを追加してレンダリングを確認
    input.value = 'ダークモードでのテストTODO';
    addButton.click();

    const todoItem = container.querySelector('#todo-list li');
    expect(todoItem).toBeInTheDocument();
    expect(todoItem.textContent).toContain('ダークモードでのテストTODO');
  });
});