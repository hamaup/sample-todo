const { createTodoApp } = require('./todoApp');

describe('TODO App HTML Structure', () => {
  let container;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
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
    container = document.createElement('div');
    document.body.appendChild(container);
    app = createTodoApp(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
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