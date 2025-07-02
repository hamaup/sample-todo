const { createTodoApp } = require('./todoApp');

describe('TODO App Category and Tag Features', () => {
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

  describe('Category Management', () => {
    test('should have category management UI elements', () => {
      const app = createTodoApp(container);
      
      // カテゴリー作成フォームが存在すること
      const categoryForm = container.querySelector('#category-form');
      expect(categoryForm).toBeInTheDocument();
      
      const categoryNameInput = categoryForm.querySelector('input[name="category-name"]');
      expect(categoryNameInput).toBeInTheDocument();
      expect(categoryNameInput).toHaveAttribute('placeholder', 'カテゴリー名');
      
      const categoryColorInput = categoryForm.querySelector('input[name="category-color"]');
      expect(categoryColorInput).toBeInTheDocument();
      expect(categoryColorInput).toHaveAttribute('type', 'color');
      
      const addCategoryButton = categoryForm.querySelector('button[type="submit"]');
      expect(addCategoryButton).toBeInTheDocument();
      expect(addCategoryButton).toHaveTextContent('カテゴリー追加');
      
      // カテゴリーリストが存在すること
      const categoryList = container.querySelector('#category-list');
      expect(categoryList).toBeInTheDocument();
    });

    test('should create new category', () => {
      const app = createTodoApp(container);
      const categoryForm = container.querySelector('#category-form');
      const nameInput = categoryForm.querySelector('input[name="category-name"]');
      const colorInput = categoryForm.querySelector('input[name="category-color"]');
      
      // カテゴリーを作成
      nameInput.value = '仕事';
      colorInput.value = '#ff0000';
      categoryForm.dispatchEvent(new Event('submit', { bubbles: true }));
      
      // カテゴリーリストに追加されていること
      const categoryItems = container.querySelectorAll('.category-item');
      expect(categoryItems).toHaveLength(1);
      expect(categoryItems[0]).toHaveTextContent('仕事');
      expect(categoryItems[0].querySelector('.category-color')).toHaveStyle('background-color: #ff0000');
    });

    test('should delete category', () => {
      const app = createTodoApp(container);
      const categoryForm = container.querySelector('#category-form');
      const nameInput = categoryForm.querySelector('input[name="category-name"]');
      
      // カテゴリーを作成
      nameInput.value = '仕事';
      categoryForm.dispatchEvent(new Event('submit', { bubbles: true }));
      
      // 削除ボタンをクリック
      const deleteButton = container.querySelector('.category-item .delete-category');
      deleteButton.click();
      
      // カテゴリーが削除されていること
      const categoryItems = container.querySelectorAll('.category-item');
      expect(categoryItems).toHaveLength(0);
    });

    test('should edit category name', () => {
      const app = createTodoApp(container);
      const categoryForm = container.querySelector('#category-form');
      const nameInput = categoryForm.querySelector('input[name="category-name"]');
      
      // カテゴリーを作成
      nameInput.value = '仕事';
      categoryForm.dispatchEvent(new Event('submit', { bubbles: true }));
      
      // カテゴリー名をダブルクリックして編集
      const categoryName = container.querySelector('.category-item .category-name');
      categoryName.dispatchEvent(new Event('dblclick', { bubbles: true }));
      
      // 編集入力フィールドが表示されること
      const editInput = container.querySelector('.category-item input[type="text"]');
      expect(editInput).toBeInTheDocument();
      expect(editInput.value).toBe('仕事');
      
      // 編集を完了
      editInput.value = 'プライベート';
      editInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      
      // カテゴリー名が更新されていること
      expect(container.querySelector('.category-item')).toHaveTextContent('プライベート');
    });
  });

  describe('TODO Category Assignment', () => {
    test('should have category selector in TODO form', () => {
      const app = createTodoApp(container);
      
      // TODO追加フォームにカテゴリー選択が存在すること
      const categorySelect = container.querySelector('#todo-form select[name="category"]');
      expect(categorySelect).toBeInTheDocument();
      expect(categorySelect.querySelector('option[value=""]')).toHaveTextContent('カテゴリーなし');
    });

    test('should assign category to new TODO', () => {
      const app = createTodoApp(container);
      const categoryForm = container.querySelector('#category-form');
      const categoryNameInput = categoryForm.querySelector('input[name="category-name"]');
      
      // カテゴリーを作成
      categoryNameInput.value = '仕事';
      categoryForm.dispatchEvent(new Event('submit', { bubbles: true }));
      
      // TODOを作成してカテゴリーを割り当て
      const todoForm = container.querySelector('#todo-form');
      const todoInput = todoForm.querySelector('input[type="text"]');
      const categorySelect = todoForm.querySelector('select[name="category"]');
      
      todoInput.value = 'テストタスク';
      categorySelect.value = '1'; // 最初のカテゴリーのID
      todoForm.dispatchEvent(new Event('submit', { bubbles: true }));
      
      // TODOアイテムにカテゴリーが表示されていること
      const todoItem = container.querySelector('.todo-item');
      expect(todoItem.querySelector('.todo-category')).toHaveTextContent('仕事');
    });

    test('should change TODO category', () => {
      const app = createTodoApp(container);
      
      // カテゴリーを2つ作成
      const categoryForm = container.querySelector('#category-form');
      const categoryNameInput = categoryForm.querySelector('input[name="category-name"]');
      
      ['仕事', 'プライベート'].forEach(name => {
        categoryNameInput.value = name;
        categoryForm.dispatchEvent(new Event('submit', { bubbles: true }));
      });
      
      // TODOを作成
      const todoForm = container.querySelector('#todo-form');
      const todoInput = todoForm.querySelector('input[type="text"]');
      todoInput.value = 'テストタスク';
      todoForm.dispatchEvent(new Event('submit', { bubbles: true }));
      
      // カテゴリーを変更
      const todoItem = container.querySelector('.todo-item');
      const categorySelector = todoItem.querySelector('.todo-category-selector');
      categorySelector.value = '2'; // 2番目のカテゴリー
      categorySelector.dispatchEvent(new Event('change', { bubbles: true }));
      
      // カテゴリーが更新されていること
      expect(todoItem.querySelector('.todo-category')).toHaveTextContent('プライベート');
    });
  });

  describe('Tag Management', () => {
    test('should have tag input in TODO form', () => {
      const app = createTodoApp(container);
      
      // タグ入力フィールドが存在すること
      const tagInput = container.querySelector('#todo-form input[name="tags"]');
      expect(tagInput).toBeInTheDocument();
      expect(tagInput).toHaveAttribute('placeholder', 'タグ（スペース区切り）');
    });

    test('should add tags to new TODO', () => {
      const app = createTodoApp(container);
      const todoForm = container.querySelector('#todo-form');
      const todoInput = todoForm.querySelector('input[type="text"]');
      const tagInput = todoForm.querySelector('input[name="tags"]');
      
      // タグ付きTODOを作成
      todoInput.value = 'タグ付きタスク';
      tagInput.value = '重要 緊急 レビュー';
      todoForm.dispatchEvent(new Event('submit', { bubbles: true }));
      
      // タグが表示されていること
      const todoItem = container.querySelector('.todo-item');
      const tags = todoItem.querySelectorAll('.todo-tag');
      expect(tags).toHaveLength(3);
      expect(tags[0]).toHaveTextContent('重要');
      expect(tags[1]).toHaveTextContent('緊急');
      expect(tags[2]).toHaveTextContent('レビュー');
    });

    test('should edit TODO tags', () => {
      const app = createTodoApp(container);
      const todoForm = container.querySelector('#todo-form');
      const todoInput = todoForm.querySelector('input[type="text"]');
      const tagInput = todoForm.querySelector('input[name="tags"]');
      
      // タグ付きTODOを作成
      todoInput.value = 'タグ編集テスト';
      tagInput.value = '重要';
      todoForm.dispatchEvent(new Event('submit', { bubbles: true }));
      
      // タグエリアをクリックして編集モード
      const todoItem = container.querySelector('.todo-item');
      const tagArea = todoItem.querySelector('.todo-tags');
      tagArea.dispatchEvent(new Event('click', { bubbles: true }));
      
      // タグ編集入力が表示されること
      const tagEditInput = todoItem.querySelector('.tag-edit-input');
      expect(tagEditInput).toBeInTheDocument();
      
      // タグを編集
      tagEditInput.value = '重要 完了 確認済み';
      tagEditInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      
      // タグが更新されていること
      const tags = todoItem.querySelectorAll('.todo-tag');
      expect(tags).toHaveLength(3);
      expect(tags[0]).toHaveTextContent('重要');
      expect(tags[1]).toHaveTextContent('完了');
      expect(tags[2]).toHaveTextContent('確認済み');
    });

    test('should remove tag by clicking X', () => {
      const app = createTodoApp(container);
      const todoForm = container.querySelector('#todo-form');
      const todoInput = todoForm.querySelector('input[type="text"]');
      const tagInput = todoForm.querySelector('input[name="tags"]');
      
      // タグ付きTODOを作成
      todoInput.value = 'タグ削除テスト';
      tagInput.value = '削除予定 残す';
      todoForm.dispatchEvent(new Event('submit', { bubbles: true }));
      
      // 最初のタグの削除ボタンをクリック
      const todoItem = container.querySelector('.todo-item');
      const firstTagRemove = todoItem.querySelector('.todo-tag .remove-tag');
      firstTagRemove.click();
      
      // タグが削除されていること
      const tags = todoItem.querySelectorAll('.todo-tag');
      expect(tags).toHaveLength(1);
      expect(tags[0]).toHaveTextContent('残す');
    });

    test('should show tag autocomplete suggestions', () => {
      const app = createTodoApp(container);
      const todoForm = container.querySelector('#todo-form');
      const todoInput = todoForm.querySelector('input[type="text"]');
      const tagInput = todoForm.querySelector('input[name="tags"]');
      
      // いくつかのタグ付きTODOを作成
      const tagsData = [
        { todo: 'タスク1', tags: '重要 緊急' },
        { todo: 'タスク2', tags: '重要 レビュー' },
        { todo: 'タスク3', tags: '確認 レビュー' }
      ];
      
      tagsData.forEach(({ todo, tags }) => {
        todoInput.value = todo;
        tagInput.value = tags;
        todoForm.dispatchEvent(new Event('submit', { bubbles: true }));
      });
      
      // タグ入力フィールドにフォーカスして入力
      tagInput.value = '';
      tagInput.focus();
      tagInput.value = '重';
      tagInput.dispatchEvent(new Event('input', { bubbles: true }));
      
      // オートコンプリートが表示されること
      const suggestions = container.querySelector('.tag-suggestions');
      expect(suggestions).toBeInTheDocument();
      expect(suggestions.querySelector('[data-tag="重要"]')).toBeInTheDocument();
    });
  });

  describe('Category and Tag Filtering', () => {
    beforeEach(() => {
      const app = createTodoApp(container);
      
      // カテゴリーを作成
      const categoryForm = container.querySelector('#category-form');
      const categoryNameInput = categoryForm.querySelector('input[name="category-name"]');
      
      ['仕事', 'プライベート'].forEach(name => {
        categoryNameInput.value = name;
        categoryForm.dispatchEvent(new Event('submit', { bubbles: true }));
      });
      
      // 異なるカテゴリーとタグを持つTODOを作成
      const todoForm = container.querySelector('#todo-form');
      const todoInput = todoForm.querySelector('input[type="text"]');
      const tagInput = todoForm.querySelector('input[name="tags"]');
      const categorySelect = todoForm.querySelector('select[name="category"]');
      
      const todos = [
        { text: '仕事タスク1', category: '1', tags: '重要 緊急' },
        { text: '仕事タスク2', category: '1', tags: '重要' },
        { text: 'プライベートタスク1', category: '2', tags: '買い物' },
        { text: 'プライベートタスク2', category: '2', tags: '家事 買い物' }
      ];
      
      todos.forEach(({ text, category, tags }) => {
        todoInput.value = text;
        categorySelect.value = category;
        tagInput.value = tags;
        todoForm.dispatchEvent(new Event('submit', { bubbles: true }));
      });
    });

    test('should filter by category', () => {
      // カテゴリーフィルターが存在すること
      const categoryFilter = container.querySelector('#category-filter');
      expect(categoryFilter).toBeInTheDocument();
      
      // 仕事カテゴリーでフィルター
      categoryFilter.value = '1';
      categoryFilter.dispatchEvent(new Event('change', { bubbles: true }));
      
      // 仕事カテゴリーのTODOのみ表示されること
      const visibleTodos = container.querySelectorAll('.todo-item:not([style*="display: none"])');
      expect(visibleTodos).toHaveLength(2);
      expect(visibleTodos[0]).toHaveTextContent('仕事タスク1');
      expect(visibleTodos[1]).toHaveTextContent('仕事タスク2');
    });

    test('should filter by tag', () => {
      // タグフィルターが存在すること
      const tagFilter = container.querySelector('#tag-filter');
      expect(tagFilter).toBeInTheDocument();
      
      // 「重要」タグでフィルター
      tagFilter.value = '重要';
      tagFilter.dispatchEvent(new Event('change', { bubbles: true }));
      
      // 「重要」タグを持つTODOのみ表示されること
      const visibleTodos = container.querySelectorAll('.todo-item:not([style*="display: none"])');
      expect(visibleTodos).toHaveLength(2);
      expect(visibleTodos[0]).toHaveTextContent('仕事タスク1');
      expect(visibleTodos[1]).toHaveTextContent('仕事タスク2');
    });

    test('should filter by category and tag combination', () => {
      const categoryFilter = container.querySelector('#category-filter');
      const tagFilter = container.querySelector('#tag-filter');
      
      // プライベートカテゴリーかつ買い物タグでフィルター
      categoryFilter.value = '2';
      tagFilter.value = '買い物';
      categoryFilter.dispatchEvent(new Event('change', { bubbles: true }));
      tagFilter.dispatchEvent(new Event('change', { bubbles: true }));
      
      // 条件に合うTODOのみ表示されること
      const visibleTodos = container.querySelectorAll('.todo-item:not([style*="display: none"])');
      expect(visibleTodos).toHaveLength(2);
      expect(visibleTodos[0]).toHaveTextContent('プライベートタスク1');
      expect(visibleTodos[1]).toHaveTextContent('プライベートタスク2');
    });

    test('should clear filters', () => {
      const categoryFilter = container.querySelector('#category-filter');
      const tagFilter = container.querySelector('#tag-filter');
      
      // フィルターを設定
      categoryFilter.value = '1';
      tagFilter.value = '重要';
      categoryFilter.dispatchEvent(new Event('change', { bubbles: true }));
      tagFilter.dispatchEvent(new Event('change', { bubbles: true }));
      
      // フィルターをクリア
      const clearButton = container.querySelector('#clear-filters');
      clearButton.click();
      
      // 全てのTODOが表示されること
      const visibleTodos = container.querySelectorAll('.todo-item:not([style*="display: none"])');
      expect(visibleTodos).toHaveLength(4);
      
      // フィルターがリセットされていること
      expect(categoryFilter.value).toBe('');
      expect(tagFilter.value).toBe('');
    });
  });

  describe('Category and Tag Persistence', () => {
    test('should persist categories in localStorage', () => {
      const app = createTodoApp(container);
      const categoryForm = container.querySelector('#category-form');
      const nameInput = categoryForm.querySelector('input[name="category-name"]');
      const colorInput = categoryForm.querySelector('input[name="category-color"]');
      
      // カテゴリーを作成
      nameInput.value = '永続化テスト';
      colorInput.value = '#123456';
      categoryForm.dispatchEvent(new Event('submit', { bubbles: true }));
      
      // LocalStorageに保存されていること
      const savedCategories = JSON.parse(localStorage.getItem('categories'));
      expect(savedCategories).toHaveLength(1);
      expect(savedCategories[0]).toMatchObject({
        name: '永続化テスト',
        color: '#123456'
      });
    });

    test('should restore categories from localStorage', () => {
      // LocalStorageにカテゴリーを保存
      const categories = [
        { id: 1, name: '復元テスト1', color: '#ff0000' },
        { id: 2, name: '復元テスト2', color: '#00ff00' }
      ];
      localStorage.setItem('categories', JSON.stringify(categories));
      
      // アプリを再作成
      const app = createTodoApp(container);
      
      // カテゴリーが復元されていること
      const categoryItems = container.querySelectorAll('.category-item');
      expect(categoryItems).toHaveLength(2);
      expect(categoryItems[0]).toHaveTextContent('復元テスト1');
      expect(categoryItems[1]).toHaveTextContent('復元テスト2');
    });

    test('should persist TODO category and tags', () => {
      const app = createTodoApp(container);
      
      // カテゴリーを作成
      const categoryForm = container.querySelector('#category-form');
      const categoryNameInput = categoryForm.querySelector('input[name="category-name"]');
      categoryNameInput.value = 'テストカテゴリー';
      categoryForm.dispatchEvent(new Event('submit', { bubbles: true }));
      
      // カテゴリーとタグ付きTODOを作成
      const todoForm = container.querySelector('#todo-form');
      const todoInput = todoForm.querySelector('input[type="text"]');
      const tagInput = todoForm.querySelector('input[name="tags"]');
      const categorySelect = todoForm.querySelector('select[name="category"]');
      
      todoInput.value = '永続化テストTODO';
      categorySelect.value = '1';
      tagInput.value = 'タグ1 タグ2';
      todoForm.dispatchEvent(new Event('submit', { bubbles: true }));
      
      // LocalStorageに保存されていること
      const savedTodos = JSON.parse(localStorage.getItem('todos'));
      expect(savedTodos[0]).toMatchObject({
        text: '永続化テストTODO',
        categoryId: 1,
        tags: ['タグ1', 'タグ2']
      });
    });

    test('should restore TODO with category and tags', () => {
      // LocalStorageにカテゴリーとTODOを保存
      const categories = [{ id: 1, name: '仕事', color: '#ff0000' }];
      const todos = [{
        id: 1,
        text: '復元テストTODO',
        completed: false,
        categoryId: 1,
        tags: ['重要', '緊急'],
        order: 0
      }];
      
      localStorage.setItem('categories', JSON.stringify(categories));
      localStorage.setItem('todos', JSON.stringify(todos));
      
      // アプリを再作成
      const app = createTodoApp(container);
      
      // TODOが正しく復元されていること
      const todoItem = container.querySelector('.todo-item');
      expect(todoItem).toHaveTextContent('復元テストTODO');
      expect(todoItem.querySelector('.todo-category')).toHaveTextContent('仕事');
      
      const tags = todoItem.querySelectorAll('.todo-tag');
      expect(tags).toHaveLength(2);
      expect(tags[0]).toHaveTextContent('重要');
      expect(tags[1]).toHaveTextContent('緊急');
    });
  });
});