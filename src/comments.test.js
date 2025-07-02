const { createTodoApp } = require('./todoApp.js');
require('@testing-library/jest-dom');

describe('コメント機能', () => {
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
  });

  describe('コメントUI', () => {
    it('TODOアイテムにコメントボタンが表示される', () => {
      const input = container.querySelector('input[type="text"]');
      const form = container.querySelector('#todo-form');
      
      input.value = 'テストTODO';
      form.dispatchEvent(new Event('submit', { bubbles: true }));
      
      const commentButton = container.querySelector('.comment-button');
      expect(commentButton).toBeInTheDocument();
      expect(commentButton).toHaveAttribute('aria-label', 'コメントを追加');
    });

    it('コメント数が表示される', () => {
      const input = container.querySelector('input[type="text"]');
      const form = container.querySelector('#todo-form');
      
      input.value = 'テストTODO';
      form.dispatchEvent(new Event('submit', { bubbles: true }));
      
      const commentCount = container.querySelector('.comment-count');
      expect(commentCount).toBeInTheDocument();
      expect(commentCount.textContent).toBe('0');
    });

    it('コメントボタンをクリックするとコメントパネルが開く', () => {
      const input = container.querySelector('input[type="text"]');
      const form = container.querySelector('#todo-form');
      
      input.value = 'テストTODO';
      form.dispatchEvent(new Event('submit', { bubbles: true }));
      
      const commentButton = container.querySelector('.comment-button');
      commentButton.click();
      
      const commentPanel = container.querySelector('.comment-panel');
      expect(commentPanel).toBeInTheDocument();
      expect(commentPanel).toHaveClass('active');
    });
  });

  describe('コメント追加', () => {
    it('コメントフォームが表示される', () => {
      const input = container.querySelector('input[type="text"]');
      const form = container.querySelector('#todo-form');
      
      input.value = 'テストTODO';
      form.dispatchEvent(new Event('submit', { bubbles: true }));
      
      const commentButton = container.querySelector('.comment-button');
      commentButton.click();
      
      const commentForm = container.querySelector('.comment-form');
      const commentInput = container.querySelector('.comment-input');
      const addCommentButton = container.querySelector('.add-comment-button');
      
      expect(commentForm).toBeInTheDocument();
      expect(commentInput).toBeInTheDocument();
      expect(commentInput).toHaveAttribute('placeholder', 'コメントを入力...');
      expect(addCommentButton).toBeInTheDocument();
      expect(addCommentButton.textContent).toBe('コメント');
    });

    it('コメントを追加できる', () => {
      const input = container.querySelector('input[type="text"]');
      const form = container.querySelector('#todo-form');
      
      input.value = 'テストTODO';
      form.dispatchEvent(new Event('submit', { bubbles: true }));
      
      const commentButton = container.querySelector('.comment-button');
      commentButton.click();
      
      const commentInput = container.querySelector('.comment-input');
      const commentForm = container.querySelector('.comment-form');
      
      commentInput.value = 'これはテストコメントです';
      commentForm.dispatchEvent(new Event('submit', { bubbles: true }));
      
      const commentItem = container.querySelector('.comment-item');
      expect(commentItem).toBeInTheDocument();
      expect(commentItem.textContent).toContain('これはテストコメントです');
      
      const commentCount = container.querySelector('.comment-count');
      expect(commentCount.textContent).toBe('1');
    });

    it('複数のコメントを追加できる', () => {
      const input = container.querySelector('input[type="text"]');
      const form = container.querySelector('#todo-form');
      
      input.value = 'テストTODO';
      form.dispatchEvent(new Event('submit', { bubbles: true }));
      
      const commentButton = container.querySelector('.comment-button');
      commentButton.click();
      
      const commentInput = container.querySelector('.comment-input');
      const commentForm = container.querySelector('.comment-form');
      
      // 1つ目のコメント
      commentInput.value = 'コメント1';
      commentForm.dispatchEvent(new Event('submit', { bubbles: true }));
      
      // 2つ目のコメント
      commentInput.value = 'コメント2';
      commentForm.dispatchEvent(new Event('submit', { bubbles: true }));
      
      const commentItems = container.querySelectorAll('.comment-item');
      expect(commentItems).toHaveLength(2);
      expect(commentItems[0].textContent).toContain('コメント1');
      expect(commentItems[1].textContent).toContain('コメント2');
      
      const commentCount = container.querySelector('.comment-count');
      expect(commentCount.textContent).toBe('2');
    });

    it('空のコメントは追加されない', () => {
      const input = container.querySelector('input[type="text"]');
      const form = container.querySelector('#todo-form');
      
      input.value = 'テストTODO';
      form.dispatchEvent(new Event('submit', { bubbles: true }));
      
      const commentButton = container.querySelector('.comment-button');
      commentButton.click();
      
      const commentInput = container.querySelector('.comment-input');
      const commentForm = container.querySelector('.comment-form');
      
      commentInput.value = '';
      commentForm.dispatchEvent(new Event('submit', { bubbles: true }));
      
      const commentItems = container.querySelectorAll('.comment-item');
      expect(commentItems).toHaveLength(0);
      
      const commentCount = container.querySelector('.comment-count');
      expect(commentCount.textContent).toBe('0');
    });
  });

  describe('コメント削除', () => {
    it('コメントを削除できる', () => {
      const input = container.querySelector('input[type="text"]');
      const form = container.querySelector('#todo-form');
      
      input.value = 'テストTODO';
      form.dispatchEvent(new Event('submit', { bubbles: true }));
      
      const commentButton = container.querySelector('.comment-button');
      commentButton.click();
      
      const commentInput = container.querySelector('.comment-input');
      const commentForm = container.querySelector('.comment-form');
      
      commentInput.value = '削除されるコメント';
      commentForm.dispatchEvent(new Event('submit', { bubbles: true }));
      
      const deleteButton = container.querySelector('.comment-delete-button');
      deleteButton.click();
      
      const commentItems = container.querySelectorAll('.comment-item');
      expect(commentItems).toHaveLength(0);
      
      const commentCount = container.querySelector('.comment-count');
      expect(commentCount.textContent).toBe('0');
    });
  });

  describe('コメント編集', () => {
    it('コメントを編集できる', () => {
      const input = container.querySelector('input[type="text"]');
      const form = container.querySelector('#todo-form');
      
      input.value = 'テストTODO';
      form.dispatchEvent(new Event('submit', { bubbles: true }));
      
      const commentButton = container.querySelector('.comment-button');
      commentButton.click();
      
      const commentInput = container.querySelector('.comment-input');
      const commentForm = container.querySelector('.comment-form');
      
      commentInput.value = '元のコメント';
      commentForm.dispatchEvent(new Event('submit', { bubbles: true }));
      
      const editButton = container.querySelector('.comment-edit-button');
      editButton.click();
      
      const editInput = container.querySelector('.comment-edit-input');
      expect(editInput).toBeInTheDocument();
      expect(editInput.value).toBe('元のコメント');
      
      editInput.value = '編集されたコメント';
      editInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
      
      const commentItem = container.querySelector('.comment-item');
      expect(commentItem.textContent).toContain('編集されたコメント');
    });
  });

  describe('コメントの永続化', () => {
    it('ページをリロードしてもコメントが保持される', () => {
      const input = container.querySelector('input[type="text"]');
      const form = container.querySelector('#todo-form');
      
      input.value = 'テストTODO';
      form.dispatchEvent(new Event('submit', { bubbles: true }));
      
      const commentButton = container.querySelector('.comment-button');
      commentButton.click();
      
      const commentInput = container.querySelector('.comment-input');
      const commentForm = container.querySelector('.comment-form');
      
      commentInput.value = '永続化されるコメント';
      commentForm.dispatchEvent(new Event('submit', { bubbles: true }));
      
      // 新しいインスタンスを作成（リロードをシミュレート）
      document.body.removeChild(container);
      container = document.createElement('div');
      document.body.appendChild(container);
      createTodoApp(container);
      
      const todoItem = container.querySelector('.todo-item');
      expect(todoItem).toBeInTheDocument();
      
      const newCommentButton = container.querySelector('.comment-button');
      newCommentButton.click();
      
      const commentItem = container.querySelector('.comment-item');
      expect(commentItem).toBeInTheDocument();
      expect(commentItem.textContent).toContain('永続化されるコメント');
    });
  });

  describe('タイムスタンプ', () => {
    it('コメントに作成日時が表示される', () => {
      const input = container.querySelector('input[type="text"]');
      const form = container.querySelector('#todo-form');
      
      input.value = 'テストTODO';
      form.dispatchEvent(new Event('submit', { bubbles: true }));
      
      const commentButton = container.querySelector('.comment-button');
      commentButton.click();
      
      const commentInput = container.querySelector('.comment-input');
      const commentForm = container.querySelector('.comment-form');
      
      commentInput.value = 'タイムスタンプ付きコメント';
      commentForm.dispatchEvent(new Event('submit', { bubbles: true }));
      
      const timestamp = container.querySelector('.comment-timestamp');
      expect(timestamp).toBeInTheDocument();
      expect(timestamp.textContent).toMatch(/\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}/);
    });
  });
});