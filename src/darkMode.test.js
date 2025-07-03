const { createTodoApp } = require('./todoApp');

describe('ダークモード機能', () => {
  let container;
  let app;

  beforeEach(() => {
    localStorage.clear();
    container = document.createElement('div');
    document.body.appendChild(container);
    // documentElement をモック
    document.documentElement.setAttribute = jest.fn();
    document.documentElement.getAttribute = jest.fn();
  });

  afterEach(() => {
    document.body.removeChild(container);
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe('テーマ切り替えボタン', () => {
    it('テーマ切り替えボタンが存在する', () => {
      app = createTodoApp(container);
      const themeToggle = container.querySelector('.theme-toggle');
      expect(themeToggle).toBeInTheDocument();
      expect(themeToggle).toHaveAttribute('aria-label');
      expect(themeToggle).toHaveAttribute('title', 'ダークモード切り替え');
    });

    it('初期状態でライトモードである', () => {
      app = createTodoApp(container);
      const themeIcon = container.querySelector('.theme-icon');
      expect(themeIcon).toBeInTheDocument();
      expect(themeIcon.textContent).toBe('🌙');
      expect(document.documentElement.setAttribute).toHaveBeenCalledWith('data-theme', 'light');
    });

    it('ボタンクリックでダークモードに切り替わる', () => {
      app = createTodoApp(container);
      const themeToggle = container.querySelector('.theme-toggle');
      const themeIcon = container.querySelector('.theme-icon');
      
      // クリックイベントを発火
      themeToggle.click();
      
      // ダークモードに切り替わることを確認
      expect(themeIcon.textContent).toBe('☀️');
      expect(document.documentElement.setAttribute).toHaveBeenCalledWith('data-theme', 'dark');
      expect(themeToggle).toHaveAttribute('aria-label', 'ライトモードに切り替え');
    });

    it('再度クリックでライトモードに戻る', () => {
      app = createTodoApp(container);
      const themeToggle = container.querySelector('.theme-toggle');
      const themeIcon = container.querySelector('.theme-icon');
      
      // ダークモードに切り替え
      themeToggle.click();
      
      // ライトモードに戻す
      themeToggle.click();
      
      expect(themeIcon.textContent).toBe('🌙');
      expect(document.documentElement.setAttribute).toHaveBeenLastCalledWith('data-theme', 'light');
      expect(themeToggle).toHaveAttribute('aria-label', 'ダークモードに切り替え');
    });
  });

  describe('テーマの永続化', () => {
    it('選択したテーマがLocalStorageに保存される', () => {
      app = createTodoApp(container);
      const themeToggle = container.querySelector('.theme-toggle');
      
      // ダークモードに切り替え
      themeToggle.click();
      
      expect(localStorage.getItem('theme')).toBe('dark');
    });

    it('保存されたテーマが次回起動時に適用される', () => {
      // ダークモードを事前に設定
      localStorage.setItem('theme', 'dark');
      
      app = createTodoApp(container);
      const themeIcon = container.querySelector('.theme-icon');
      
      expect(themeIcon.textContent).toBe('☀️');
      expect(document.documentElement.setAttribute).toHaveBeenCalledWith('data-theme', 'dark');
    });
  });

  describe('システムテーマとの連動', () => {
    it('システムがダークモードの場合、初期状態でダークモードになる', () => {
      // window.matchMediaをモック
      const mockMatchMedia = jest.fn().mockReturnValue({
        matches: true, // ダークモードを希望
        addEventListener: jest.fn()
      });
      window.matchMedia = mockMatchMedia;
      
      app = createTodoApp(container);
      
      expect(document.documentElement.setAttribute).toHaveBeenCalledWith('data-theme', 'dark');
    });

    it('ユーザー設定がシステム設定より優先される', () => {
      // システムはダークモードだが、ユーザーはライトモードを選択
      localStorage.setItem('theme', 'light');
      
      const mockMatchMedia = jest.fn().mockReturnValue({
        matches: true, // ダークモードを希望
        addEventListener: jest.fn()
      });
      window.matchMedia = mockMatchMedia;
      
      app = createTodoApp(container);
      
      expect(document.documentElement.setAttribute).toHaveBeenCalledWith('data-theme', 'light');
    });
  });
});