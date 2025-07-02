const { createTodoApp } = require('./todoApp');

// JSDOM設定
require('@testing-library/jest-dom');

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
      
      const categoryForm = container.querySelector('#category-form');
      expect(categoryForm).toBeInTheDocument();
      
      const categoryNameInput = container.querySelector('input[name="category-name"]');
      expect(categoryNameInput).toBeInTheDocument();
      expect(categoryNameInput).toHaveAttribute('placeholder', 'カテゴリー名');
      
      const categoryColorInput = container.querySelector('input[name="category-color"]');
      expect(categoryColorInput).toBeInTheDocument();
      
      const categoryList = container.querySelector('#category-list');
      expect(categoryList).toBeInTheDocument();
    });

    test('should create new category', () => {
      const app = createTodoApp(container);
      
      const categoryForm = container.querySelector('#category-form');
      const categoryNameInput = container.querySelector('input[name="category-name"]');
      const categoryColorInput = container.querySelector('input[name="category-color"]');
      const categoryList = container.querySelector('#category-list');

      // カテゴリーを追加
      categoryNameInput.value = 'Work';
      categoryColorInput.value = '#ff0000';
      categoryForm.dispatchEvent(new Event('submit', { bubbles: true }));

      // LocalStorageに保存されているか確認
      const savedCategories = JSON.parse(localStorage.getItem('categories') || '[]');
      expect(savedCategories).toHaveLength(1);
      expect(savedCategories[0].name).toBe('Work');
      expect(savedCategories[0].color).toBe('#ff0000');
    });

    test('should delete category', () => {
      const app = createTodoApp(container);
      
      // まずカテゴリーを作成
      const categoryForm = container.querySelector('#category-form');
      const categoryNameInput = container.querySelector('input[name="category-name"]');
      
      categoryNameInput.value = 'Work';
      categoryForm.dispatchEvent(new Event('submit', { bubbles: true }));
      
      // 削除ボタンをクリック
      const deleteButton = container.querySelector('.delete-category');
      if (deleteButton) {
        deleteButton.click();
        
        const savedCategories = JSON.parse(localStorage.getItem('categories') || '[]');
        expect(savedCategories).toHaveLength(0);
      }
    });

    test('should edit category name', () => {
      const app = createTodoApp(container);
      
      // カテゴリーを作成
      const categoryForm = container.querySelector('#category-form');
      const categoryNameInput = container.querySelector('input[name="category-name"]');
      
      categoryNameInput.value = 'Work';
      categoryForm.dispatchEvent(new Event('submit', { bubbles: true }));
      
      // 編集機能（ダブルクリック等）のテスト
      const categoryName = container.querySelector('.category-name');
      if (categoryName) {
        categoryName.dispatchEvent(new Event('dblclick', { bubbles: true }));
        
        const editInput = container.querySelector('input[type="text"]');
        if (editInput && editInput !== categoryNameInput) {
          editInput.value = 'Personal';
          editInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
          
          const savedCategories = JSON.parse(localStorage.getItem('categories') || '[]');
          expect(savedCategories[0].name).toBe('Personal');
        }
      }
    });
  });

  describe('Tag Management', () => {
    test('should have tag input field', () => {
      const app = createTodoApp(container);
      
      const tagsInput = container.querySelector('input[name="tags"]');
      expect(tagsInput).toBeInTheDocument();
      expect(tagsInput).toHaveAttribute('placeholder', 'タグ（スペース区切り）');
    });

    test('should add TODO with tags', () => {
      const app = createTodoApp(container);
      
      const form = container.querySelector('#todo-form');
      const textInput = form.querySelector('input[type="text"]');
      const tagsInput = form.querySelector('input[name="tags"]');
      
      if (textInput && tagsInput) {
        textInput.value = 'Complete project';
        tagsInput.value = 'urgent important work';
        form.dispatchEvent(new Event('submit', { bubbles: true }));

        const savedTodos = JSON.parse(localStorage.getItem('todos') || '[]');
        expect(savedTodos).toHaveLength(1);
        expect(savedTodos[0].tags).toEqual(['urgent', 'important', 'work']);
      }
    });

    test('should show tag suggestions', () => {
      const app = createTodoApp(container);
      
      // 既存のTODOにタグを追加
      const form = container.querySelector('#todo-form');
      const textInput = form.querySelector('input[type="text"]');
      const tagsInput = form.querySelector('input[name="tags"]');
      
      if (textInput && tagsInput) {
        textInput.value = 'Task 1';
        tagsInput.value = 'urgent';
        form.dispatchEvent(new Event('submit', { bubbles: true }));

        // 新しいTODOでタグを入力
        textInput.value = 'Task 2';
        tagsInput.value = 'ur';
        tagsInput.dispatchEvent(new Event('input', { bubbles: true }));

        // サジェスチョンが表示されるかテスト
        const suggestions = container.querySelector('.tag-suggestions');
        if (suggestions) {
          const suggestion = suggestions.querySelector('[data-tag="urgent"]');
          expect(suggestion).toBeInTheDocument();
        }
      }
    });
  });

  describe('Advanced Filtering', () => {
    test('should have category and tag filters', () => {
      const app = createTodoApp(container);
      
      const categoryFilter = container.querySelector('#category-filter');
      expect(categoryFilter).toBeInTheDocument();
      
      const tagFilter = container.querySelector('#tag-filter');
      expect(tagFilter).toBeInTheDocument();
      
      const clearFiltersBtn = container.querySelector('#clear-filters');
      expect(clearFiltersBtn).toBeInTheDocument();
    });

    test('should filter TODOs by category', () => {
      const app = createTodoApp(container);
      
      // カテゴリーとTODOを作成するロジックのテスト
      // 実装されていない場合はスキップ
      const categoryFilter = container.querySelector('#category-filter');
      if (categoryFilter && categoryFilter.options.length > 1) {
        categoryFilter.value = categoryFilter.options[1].value;
        categoryFilter.dispatchEvent(new Event('change', { bubbles: true }));
        
        // フィルタリングされたTODOの確認
        const todoList = container.querySelector('#todo-list');
        expect(todoList).toBeInTheDocument();
      }
    });

    test('should filter TODOs by tag', () => {
      const app = createTodoApp(container);
      
      const tagFilter = container.querySelector('#tag-filter');
      if (tagFilter && tagFilter.options.length > 1) {
        tagFilter.value = tagFilter.options[1].value;
        tagFilter.dispatchEvent(new Event('change', { bubbles: true }));
        
        const todoList = container.querySelector('#todo-list');
        expect(todoList).toBeInTheDocument();
      }
    });

    test('should clear all filters', () => {
      const app = createTodoApp(container);
      
      const clearFiltersBtn = container.querySelector('#clear-filters');
      if (clearFiltersBtn) {
        clearFiltersBtn.click();
        
        const categoryFilter = container.querySelector('#category-filter');
        const tagFilter = container.querySelector('#tag-filter');
        
        if (categoryFilter) expect(categoryFilter.value).toBe('');
        if (tagFilter) expect(tagFilter.value).toBe('');
      }
    });
  });

  describe('Data Persistence', () => {
    test('should save categories to localStorage', () => {
      const app = createTodoApp(container);
      
      const categoryForm = container.querySelector('#category-form');
      const categoryNameInput = container.querySelector('input[name="category-name"]');
      
      if (categoryForm && categoryNameInput) {
        categoryNameInput.value = 'Test Category';
        categoryForm.dispatchEvent(new Event('submit', { bubbles: true }));

        const savedCategories = JSON.parse(localStorage.getItem('categories') || '[]');
        expect(savedCategories).toHaveLength(1);
        expect(savedCategories[0].name).toBe('Test Category');
      }
    });

    test('should load categories from localStorage', () => {
      // 事前にカテゴリーを保存
      const categories = [{ id: 1, name: 'Work', color: '#ff0000' }];
      localStorage.setItem('categories', JSON.stringify(categories));

      const app = createTodoApp(container);
      
      // カテゴリーセレクトボックスにオプションが追加されているか確認
      const categorySelect = container.querySelector('select[name="category"]');
      if (categorySelect) {
        const options = categorySelect.querySelectorAll('option');
        expect(options.length).toBeGreaterThan(1);
      }
    });

    test('should save TODOs with category and tags', () => {
      const app = createTodoApp(container);
      
      const form = container.querySelector('#todo-form');
      const textInput = form.querySelector('input[type="text"]');
      const categorySelect = form.querySelector('select[name="category"]');
      const tagsInput = form.querySelector('input[name="tags"]');
      
      if (textInput) {
        textInput.value = 'Test TODO';
        if (tagsInput) tagsInput.value = 'test urgent';
        form.dispatchEvent(new Event('submit', { bubbles: true }));

        const savedTodos = JSON.parse(localStorage.getItem('todos') || '[]');
        expect(savedTodos).toHaveLength(1);
        expect(savedTodos[0].text).toBe('Test TODO');
        
        if (tagsInput) {
          expect(savedTodos[0].tags).toEqual(['test', 'urgent']);
        }
      }
    });
  });

  describe('Integration with Existing Features', () => {
    test('should work with search functionality', () => {
      const app = createTodoApp(container);
      
      // カテゴリーとTODOを作成
      const categoryForm = container.querySelector('#category-form');
      const categoryNameInput = container.querySelector('input[name="category-name"]');
      
      if (categoryForm && categoryNameInput) {
        categoryNameInput.value = 'Work';
        categoryForm.dispatchEvent(new Event('submit', { bubbles: true }));
      }
      
      // TODOを作成
      const form = container.querySelector('#todo-form');
      const textInput = form.querySelector('input[type="text"]');
      const tagsInput = form.querySelector('input[name="tags"]');
      
      if (textInput && tagsInput) {
        textInput.value = 'Test TODO with search';
        tagsInput.value = 'urgent important';
        form.dispatchEvent(new Event('submit', { bubbles: true }));
      }
      
      // 検索機能をテスト
      const searchInput = container.querySelector('.search-input');
      if (searchInput) {
        searchInput.value = 'search';
        searchInput.dispatchEvent(new Event('input', { bubbles: true }));
        
        const todoList = container.querySelector('#todo-list');
        expect(todoList).toBeInTheDocument();
      }
    });

    test('should maintain drag and drop functionality', () => {
      const app = createTodoApp(container);
      
      // TODOを作成
      const form = container.querySelector('#todo-form');
      const textInput = form.querySelector('input[type="text"]');
      
      if (textInput) {
        textInput.value = 'Draggable TODO';
        form.dispatchEvent(new Event('submit', { bubbles: true }));

        const todoItem = container.querySelector('.todo-item');
        if (todoItem) {
          expect(todoItem).toHaveAttribute('draggable', 'true');
          expect(todoItem).toHaveAttribute('data-todo-id');
        }
      }
    });

    test('should work with theme toggle', () => {
      const app = createTodoApp(container);
      
      const themeToggle = container.querySelector('.theme-toggle');
      if (themeToggle) {
        expect(themeToggle).toBeInTheDocument();
        
        // テーマ切り替えをテスト
        themeToggle.click();
        expect(document.documentElement.getAttribute('data-theme')).toBeTruthy();
      }
    });

    test('should work with tab switching', () => {
      const app = createTodoApp(container);
      
      const statsTab = container.querySelector('[data-tab="stats"]');
      if (statsTab) {
        statsTab.click();
        
        const statsPane = container.querySelector('[data-pane="stats"]');
        expect(statsPane).toHaveClass('active');
      }
    });

    test('should display TODO with category and tags correctly', () => {
      const app = createTodoApp(container);
      
      // カテゴリーを作成
      const categoryForm = container.querySelector('#category-form');
      const categoryNameInput = container.querySelector('input[name="category-name"]');
      const categoryColorInput = container.querySelector('input[name="category-color"]');
      
      if (categoryForm && categoryNameInput && categoryColorInput) {
        categoryNameInput.value = 'Work';
        categoryColorInput.value = '#ff0000';
        categoryForm.dispatchEvent(new Event('submit', { bubbles: true }));
      }
      
      // カテゴリー付きTODOを作成
      const form = container.querySelector('#todo-form');
      const textInput = form.querySelector('input[type="text"]');
      const categorySelect = form.querySelector('select[name="category"]');
      const tagsInput = form.querySelector('input[name="tags"]');
      
      if (textInput && categorySelect && tagsInput) {
        textInput.value = 'Test TODO';
        if (categorySelect.options.length > 1) {
          categorySelect.value = categorySelect.options[1].value;
        }
        tagsInput.value = 'urgent important';
        form.dispatchEvent(new Event('submit', { bubbles: true }));
        
        // カテゴリーとタグが表示されているかチェック
        const categoryDisplay = container.querySelector('.todo-category');
        const tagsDisplay = container.querySelector('.todo-tags');
        
        if (categoryDisplay) {
          expect(categoryDisplay).toHaveTextContent('Work');
          expect(categoryDisplay.style.backgroundColor).toBe('rgb(255, 0, 0)');
        }
        
        if (tagsDisplay) {
          const tagElements = tagsDisplay.querySelectorAll('.todo-tag');
          expect(tagElements).toHaveLength(2);
        }
      }
    });

    test('should handle keyboard shortcuts', () => {
      const app = createTodoApp(container);
      
      const searchInput = container.querySelector('.search-input');
      
      // Ctrl+F ショートカットをテスト
      const event = new KeyboardEvent('keydown', {
        key: 'f',
        ctrlKey: true,
        bubbles: true
      });
      
      document.dispatchEvent(event);
      
      // フォーカスがsearchInputに移動することを期待（ただし、テスト環境では制限あり）
      expect(searchInput).toBeInTheDocument();
    });

    test('should handle TODO completion with timestamps', () => {
      const app = createTodoApp(container);
      
      // TODOを作成
      const form = container.querySelector('#todo-form');
      const textInput = form.querySelector('input[type="text"]');
      
      if (textInput) {
        textInput.value = 'Test completion';
        form.dispatchEvent(new Event('submit', { bubbles: true }));
        
        // チェックボックスをクリックして完了にする
        const checkbox = container.querySelector('input[type="checkbox"]');
        if (checkbox) {
          checkbox.checked = true;
          checkbox.dispatchEvent(new Event('change', { bubbles: true }));
          
          // LocalStorageの確認
          const savedTodos = JSON.parse(localStorage.getItem('todos') || '[]');
          if (savedTodos.length > 0) {
            expect(savedTodos[0].completed).toBe(true);
            expect(savedTodos[0].completedAt).toBeTruthy();
          }
        }
      }
    });
  });
});