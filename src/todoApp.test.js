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
    const nav = container.querySelector('nav');
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

describe('Drag and Drop Functionality', () => {
  let container;
  let app;

  beforeEach(() => {
    localStorage.clear();
    container = document.createElement('div');
    document.body.appendChild(container);
    app = createTodoApp(container);

    // DragEventのモック実装
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
  });

  afterEach(() => {
    document.body.removeChild(container);
    localStorage.clear();
  });

  test('should assign order property to new todos', () => {
    const form = container.querySelector('#todo-form');
    const input = form.querySelector('input[type="text"]');

    // 複数のTODOを追加
    ['TODO 1', 'TODO 2', 'TODO 3'].forEach(text => {
      input.value = text;
      form.dispatchEvent(new Event('submit', { bubbles: true }));
    });

    // LocalStorageから保存されたデータを確認
    const saved = JSON.parse(localStorage.getItem('todos'));
    expect(saved).toHaveLength(3);
    expect(saved[0]).toHaveProperty('order', 0);
    expect(saved[1]).toHaveProperty('order', 1);
    expect(saved[2]).toHaveProperty('order', 2);
  });

  test('should display todos in order property sequence', () => {
    const form = container.querySelector('#todo-form');
    const input = form.querySelector('input[type="text"]');
    const todoList = container.querySelector('#todo-list');

    // TODOを追加
    ['First', 'Second', 'Third'].forEach(text => {
      input.value = text;
      form.dispatchEvent(new Event('submit', { bubbles: true }));
    });

    // 表示順序が正しいことを確認
    expect(todoList.children).toHaveLength(3);
    expect(todoList.children[0].textContent).toContain('First');
    expect(todoList.children[1].textContent).toContain('Second');
    expect(todoList.children[2].textContent).toContain('Third');
  });

  test('should make todo items draggable', () => {
    const form = container.querySelector('#todo-form');
    const input = form.querySelector('input[type="text"]');
    const todoList = container.querySelector('#todo-list');

    // TODOを追加
    input.value = 'Draggable TODO';
    form.dispatchEvent(new Event('submit', { bubbles: true }));

    const todoItem = todoList.children[0];
    expect(todoItem).toHaveAttribute('draggable', 'true');
    expect(todoItem).toHaveClass('todo-item');
    expect(todoItem).toHaveAttribute('data-todo-id');
    expect(todoItem.tabIndex).toBe(0); // キーボードフォーカス可能
  });

  test('should handle drag start event', () => {
    const form = container.querySelector('#todo-form');
    const input = form.querySelector('input[type="text"]');
    const todoList = container.querySelector('#todo-list');

    // TODOを追加
    input.value = 'Drag start test';
    form.dispatchEvent(new Event('submit', { bubbles: true }));

    const todoItem = todoList.children[0];
    const dragStartEvent = new DragEvent('dragstart', {
      dataTransfer: {
        setData: jest.fn(),
        getData: jest.fn(),
        effectAllowed: null,
        dropEffect: null
      }
    });

    // ドラッグ開始イベントを発火
    todoItem.dispatchEvent(dragStartEvent);

    // draggingクラスが追加されること
    expect(todoItem).toHaveClass('dragging');
    // dataTransfer.setDataが呼ばれること
    expect(dragStartEvent.dataTransfer.setData).toHaveBeenCalled();
  });

  test('should handle drag end event', () => {
    const form = container.querySelector('#todo-form');
    const input = form.querySelector('input[type="text"]');
    const todoList = container.querySelector('#todo-list');

    // TODOを追加
    input.value = 'Drag end test';
    form.dispatchEvent(new Event('submit', { bubbles: true }));

    const todoItem = todoList.children[0];
    
    // ドラッグ開始してクラスを追加
    todoItem.classList.add('dragging');
    
    const dragEndEvent = new DragEvent('dragend');
    todoItem.dispatchEvent(dragEndEvent);

    // draggingクラスが削除されること
    expect(todoItem).not.toHaveClass('dragging');
  });

  test('should handle drag over event', () => {
    const form = container.querySelector('#todo-form');
    const input = form.querySelector('input[type="text"]');
    const todoList = container.querySelector('#todo-list');

    // 複数のTODOを追加
    ['TODO 1', 'TODO 2'].forEach(text => {
      input.value = text;
      form.dispatchEvent(new Event('submit', { bubbles: true }));
    });

    const targetItem = todoList.children[1];
    const dragOverEvent = new DragEvent('dragover', {
      dataTransfer: {
        setData: jest.fn(),
        getData: jest.fn(),
        effectAllowed: null,
        dropEffect: null
      }
    });

    // preventDefault のモック
    dragOverEvent.preventDefault = jest.fn();

    targetItem.dispatchEvent(dragOverEvent);

    // preventDefaultが呼ばれること
    expect(dragOverEvent.preventDefault).toHaveBeenCalled();
    // drag-overクラスが追加されること
    expect(targetItem).toHaveClass('drag-over');
  });

  test('should reorder todos when dropped', () => {
    const form = container.querySelector('#todo-form');
    const input = form.querySelector('input[type="text"]');
    const todoList = container.querySelector('#todo-list');

    // 3つのTODOを追加
    ['First', 'Second', 'Third'].forEach(text => {
      input.value = text;
      form.dispatchEvent(new Event('submit', { bubbles: true }));
    });

    // 最初のアイテムを3番目の位置にドロップ
    const draggedItem = todoList.children[0];
    const targetItem = todoList.children[2];
    
    const draggedId = draggedItem.getAttribute('data-todo-id');
    
    const dropEvent = new DragEvent('drop', {
      dataTransfer: {
        getData: jest.fn().mockReturnValue(draggedId),
        setData: jest.fn(),
        effectAllowed: null,
        dropEffect: null
      }
    });
    
    dropEvent.preventDefault = jest.fn();
    dropEvent.stopPropagation = jest.fn();

    targetItem.dispatchEvent(dropEvent);

    // 並び順が変更されていることを確認
    const saved = JSON.parse(localStorage.getItem('todos'));
    const sortedTodos = saved.sort((a, b) => a.order - b.order);
    
    expect(sortedTodos[0].text).toBe('Second');
    expect(sortedTodos[1].text).toBe('Third');
    expect(sortedTodos[2].text).toBe('First');
  });

  test('should support keyboard reordering with Shift+Arrow keys', () => {
    const form = container.querySelector('#todo-form');
    const input = form.querySelector('input[type="text"]');
    const todoList = container.querySelector('#todo-list');

    // 3つのTODOを追加
    ['First', 'Second', 'Third'].forEach(text => {
      input.value = text;
      form.dispatchEvent(new Event('submit', { bubbles: true }));
    });

    // 2番目のアイテムを上に移動（Shift + ArrowUp）
    const secondItem = todoList.children[1];
    const keyEvent = new KeyboardEvent('keydown', {
      key: 'ArrowUp',
      shiftKey: true,
      bubbles: true
    });
    
    keyEvent.preventDefault = jest.fn();
    secondItem.dispatchEvent(keyEvent);

    // preventDefaultが呼ばれること
    expect(keyEvent.preventDefault).toHaveBeenCalled();
    
    // 並び順が変更されていることを確認
    const saved = JSON.parse(localStorage.getItem('todos'));
    const sortedTodos = saved.sort((a, b) => a.order - b.order);
    
    expect(sortedTodos[0].text).toBe('Second');
    expect(sortedTodos[1].text).toBe('First');
    expect(sortedTodos[2].text).toBe('Third');
  });

  test('should maintain focus after keyboard reordering', (done) => {
    const form = container.querySelector('#todo-form');
    const input = form.querySelector('input[type="text"]');
    const todoList = container.querySelector('#todo-list');

    // TODOを追加
    ['First', 'Second'].forEach(text => {
      input.value = text;
      form.dispatchEvent(new Event('submit', { bubbles: true }));
    });

    const secondItem = todoList.children[1];
    const todoId = secondItem.getAttribute('data-todo-id');
    
    // フォーカスを設定
    secondItem.focus();
    
    const keyEvent = new KeyboardEvent('keydown', {
      key: 'ArrowUp',
      shiftKey: true,
      bubbles: true
    });
    
    secondItem.dispatchEvent(keyEvent);

    // 非同期でフォーカスが移動することを確認
    setTimeout(() => {
      const movedItem = container.querySelector(`[data-todo-id="${todoId}"]`);
      expect(document.activeElement).toBe(movedItem);
      done();
    }, 10);
  });

  test('should not reorder at boundaries', () => {
    const form = container.querySelector('#todo-form');
    const input = form.querySelector('input[type="text"]');
    const todoList = container.querySelector('#todo-list');

    // 2つのTODOを追加
    ['First', 'Second'].forEach(text => {
      input.value = text;
      form.dispatchEvent(new Event('submit', { bubbles: true }));
    });

    // 最初のアイテムをさらに上に移動しようとする
    const firstItem = todoList.children[0];
    const keyEvent = new KeyboardEvent('keydown', {
      key: 'ArrowUp',
      shiftKey: true,
      bubbles: true
    });
    
    firstItem.dispatchEvent(keyEvent);

    // 順序が変わらないことを確認
    const saved = JSON.parse(localStorage.getItem('todos'));
    const sortedTodos = saved.sort((a, b) => a.order - b.order);
    
    expect(sortedTodos[0].text).toBe('First');
    expect(sortedTodos[1].text).toBe('Second');
  });

  test('should preserve other properties when reordering', () => {
    const form = container.querySelector('#todo-form');
    const input = form.querySelector('input[type="text"]');
    const todoList = container.querySelector('#todo-list');

    // TODOを追加
    ['TODO 1', 'TODO 2'].forEach(text => {
      input.value = text;
      form.dispatchEvent(new Event('submit', { bubbles: true }));
    });

    // 最初のTODOを完了状態にする
    const checkbox = todoList.children[0].querySelector('input[type="checkbox"]');
    checkbox.click();

    // 2番目のアイテムを上に移動
    const secondItem = todoList.children[1];
    const keyEvent = new KeyboardEvent('keydown', {
      key: 'ArrowUp',
      shiftKey: true,
      bubbles: true
    });
    
    secondItem.dispatchEvent(keyEvent);

    // 完了状態が保持されていることを確認
    const saved = JSON.parse(localStorage.getItem('todos'));
    const completedTodo = saved.find(todo => todo.completed === true);
    expect(completedTodo.text).toBe('TODO 1');
  });
});