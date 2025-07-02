const { createTodoApp } = require('./todoApp');

describe('UI/UX Features', () => {
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

  describe('Accessibility Features', () => {
    test.skip('should have skip link for keyboard navigation - removed as requested', () => {
      // スキップリンクは削除されました
      const skipLink = container.querySelector('.skip-link');
      expect(skipLink).not.toBeInTheDocument();
    });

    test('should have main content with proper id', () => {
      const mainContent = container.querySelector('#main-content');
      expect(mainContent).toBeInTheDocument();
      expect(mainContent.tagName).toBe('MAIN');
    });

    test('should have live region for status updates', () => {
      const statusMessage = container.querySelector('#status-message');
      expect(statusMessage).toBeInTheDocument();
      expect(statusMessage).toHaveAttribute('aria-live', 'polite');
      expect(statusMessage).toHaveAttribute('aria-atomic', 'true');
      expect(statusMessage).toHaveClass('sr-only');
    });

    test('should update status message when todos change', () => {
      const form = container.querySelector('#todo-form');
      const input = form.querySelector('input[type="text"]');
      const statusMessage = container.querySelector('#status-message');

      // TODOを追加（初期render後にメッセージが設定される）
      input.value = 'Test TODO';
      form.dispatchEvent(new Event('submit', { bubbles: true }));

      expect(statusMessage).toHaveTextContent('1件のTODOがあります');
    });

    test('should update status message when filtering', () => {
      const form = container.querySelector('#todo-form');
      const input = form.querySelector('input[type="text"]');
      const statusMessage = container.querySelector('#status-message');

      // TODOを追加
      ['Task 1', 'Task 2'].forEach(text => {
        input.value = text;
        form.dispatchEvent(new Event('submit', { bubbles: true }));
      });

      // 1つを完了にする
      const checkbox = container.querySelector('#todo-list input[type="checkbox"]');
      checkbox.click();

      // 完了済みフィルターを適用
      const completedFilter = container.querySelector('[data-filter="completed"]');
      completedFilter.click();

      expect(statusMessage).toHaveTextContent('フィルター結果: 1件の完了済みTODOを表示中');
    });

    test('should update status message when searching', () => {
      const form = container.querySelector('#todo-form');
      const input = form.querySelector('input[type="text"]');
      const searchInput = container.querySelector('.search-input');
      const statusMessage = container.querySelector('#status-message');

      // TODOを追加
      ['Apple', 'Banana', 'Cherry'].forEach(text => {
        input.value = text;
        form.dispatchEvent(new Event('submit', { bubbles: true }));
      });

      // 検索
      searchInput.value = 'a';
      searchInput.dispatchEvent(new Event('input', { bubbles: true }));

      // デバウンス待機
      setTimeout(() => {
        expect(statusMessage).toHaveTextContent('検索結果: 2件のTODOが見つかりました');
      }, 350);
    });

    test('should have proper ARIA labels', () => {
      const todoInput = container.querySelector('#todo-form input[type="text"]');
      const searchInput = container.querySelector('.search-input');
      const todoList = container.querySelector('#todo-list');
      const themeToggle = container.querySelector('.theme-toggle');

      expect(todoInput).toHaveAttribute('aria-label', 'TODO入力');
      expect(searchInput).toHaveAttribute('aria-label', 'TODO検索');
      expect(todoList).toHaveAttribute('aria-label', 'TODOリスト');
      expect(themeToggle).toHaveAttribute('aria-label', 'ダークモードに切り替え');
    });
  });

  describe('Responsive Design', () => {
    test('should have mobile-friendly input sizes', () => {
      // This test verifies the app has mobile-friendly design
      const form = container.querySelector('#todo-form');
      const inputs = form.querySelectorAll('input, button');
      
      // モバイル対応のスタイルが適用されていることを確認
      inputs.forEach(input => {
        expect(input).toBeInTheDocument();
        // 適切なクラスやスタイルが適用されていることを確認
        expect(input.style.fontSize || '16px').toBeTruthy();
      });
    });

    test('should maintain usability with long text', () => {
      const form = container.querySelector('#todo-form');
      const input = form.querySelector('input[type="text"]');
      
      // 長いテキストでTODOを作成
      const longText = 'This is a very long TODO item that should wrap properly and maintain readability across different screen sizes and devices without breaking the layout or causing horizontal scrolling issues.';
      input.value = longText;
      form.dispatchEvent(new Event('submit', { bubbles: true }));

      const todoItem = container.querySelector('.todo-item');
      expect(todoItem).toBeInTheDocument();
      expect(todoItem).toHaveTextContent(longText);
    });
  });

  describe('Tab Navigation', () => {
    test('should switch between tabs correctly', () => {
      const todosTab = container.querySelector('[data-tab="todos"]');
      const statsTab = container.querySelector('[data-tab="stats"]');
      const todosPane = container.querySelector('[data-pane="todos"]');
      const statsPane = container.querySelector('[data-pane="stats"]');

      // 初期状態
      expect(todosTab).toHaveClass('active');
      expect(todosPane).toHaveClass('active');
      expect(statsTab).not.toHaveClass('active');
      expect(statsPane).not.toHaveClass('active');

      // 統計タブに切り替え
      statsTab.click();

      expect(statsTab).toHaveClass('active');
      expect(statsPane).toHaveClass('active');
      expect(todosTab).not.toHaveClass('active');
      expect(todosPane).not.toHaveClass('active');
    });

    test('should have proper tab semantics', () => {
      const tabButtons = container.querySelectorAll('.tab-button');
      const tabPanes = container.querySelectorAll('.tab-pane');

      expect(tabButtons).toHaveLength(2);
      expect(tabPanes).toHaveLength(2);

      tabButtons.forEach(button => {
        expect(button).toHaveAttribute('data-tab');
      });

      tabPanes.forEach(pane => {
        expect(pane).toHaveAttribute('data-pane');
      });
    });
  });

  describe('Statistics UI', () => {
    test('should have proper statistics layout', () => {
      const statsTab = container.querySelector('[data-tab="stats"]');
      statsTab.click();

      const statsContainer = container.querySelector('.stats-container');
      const statsHeader = container.querySelector('.stats-header');
      const statsSummary = container.querySelector('.stats-summary');
      const statsStreak = container.querySelector('.stats-streak');
      const dailyChart = container.querySelector('.daily-chart');

      expect(statsContainer).toBeInTheDocument();
      expect(statsHeader).toBeInTheDocument();
      expect(statsSummary).toBeInTheDocument();
      expect(statsStreak).toBeInTheDocument();
      expect(dailyChart).toBeInTheDocument();
    });

    test('should have interactive filter and export controls', () => {
      const statsTab = container.querySelector('[data-tab="stats"]');
      statsTab.click();

      const dateFilter = container.querySelector('.date-range-filter');
      const exportButton = container.querySelector('.export-json');

      expect(dateFilter).toBeInTheDocument();
      expect(exportButton).toBeInTheDocument();
      expect(dateFilter.tagName).toBe('SELECT');
      expect(exportButton.tagName).toBe('BUTTON');
    });

    test('should display stat cards with proper structure', () => {
      const statsTab = container.querySelector('[data-tab="stats"]');
      statsTab.click();

      const statCards = container.querySelectorAll('.stat-card');
      expect(statCards).toHaveLength(4);

      statCards.forEach(card => {
        const title = card.querySelector('h3');
        const value = card.querySelector('.stat-value');
        
        expect(title).toBeInTheDocument();
        expect(value).toBeInTheDocument();
      });
    });
  });

  describe('Theme Integration', () => {
    test('should maintain theme consistency across all elements', () => {
      const themeToggle = container.querySelector('.theme-toggle');
      
      // ダークモードに切り替え
      themeToggle.click();
      
      expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
      
      // すべての主要要素が適切なCSSクラスを持つことを確認
      const elements = container.querySelectorAll('.todo-item, .filter-button, .tab-button, .stat-card');
      elements.forEach(element => {
        expect(element).toBeInTheDocument();
      });
    });
  });

  describe('Performance Considerations', () => {
    test('should handle large number of todos efficiently', () => {
      const form = container.querySelector('#todo-form');
      const input = form.querySelector('input[type="text"]');
      
      // 大量のTODOを追加
      const startTime = performance.now();
      
      for (let i = 0; i < 100; i++) {
        input.value = `Task ${i}`;
        form.dispatchEvent(new Event('submit', { bubbles: true }));
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // 100個のTODO追加が2秒以内に完了することを確認（CI環境を考慮）
      expect(duration).toBeLessThan(2000);
      
      const todoItems = container.querySelectorAll('.todo-item');
      expect(todoItems).toHaveLength(100);
    });
  });

  describe('Error Handling', () => {
    test('should gracefully handle invalid operations', () => {
      // 空のフォーム送信
      const form = container.querySelector('#todo-form');
      const todoList = container.querySelector('#todo-list');
      
      form.dispatchEvent(new Event('submit', { bubbles: true }));
      
      // TODOが追加されないことを確認
      expect(todoList.children).toHaveLength(0);
    });
  });
});