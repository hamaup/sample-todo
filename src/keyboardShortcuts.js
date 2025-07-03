/**
 * キーボードショートカットシステム
 * TODOアプリの操作性を向上させるための包括的なショートカット機能
 */

class KeyboardShortcuts {
  constructor(app) {
    this.app = app;
    this.shortcuts = new Map();
    this.currentFocusIndex = -1;
    this.todoItems = [];
    this.isHelpVisible = false;
    
    this.init();
  }
  
  init() {
    this.registerShortcuts();
    this.attachEventListeners();
    this.createHelpDialog();
  }
  
  registerShortcuts() {
    // 基本ショートカット
    this.register('Ctrl+n,Meta+n', () => this.focusNewTodoInput(), '新規TODO作成');
    this.register('Ctrl+Enter,Meta+Enter', () => this.submitTodo(), 'TODO追加（入力中）');
    this.register('Ctrl+f,Meta+f', () => this.focusSearch(), '検索フィールドにフォーカス');
    this.register('Escape', () => this.handleEscape(), '検索クリア・編集キャンセル');
    this.register('Ctrl+d,Meta+d', () => this.duplicateSelectedTodo(), '選択中TODOの複製');
    
    // TODO操作ショートカット
    this.register('Space', () => this.toggleSelectedTodo(), '完了/未完了切り替え');
    this.register('Delete,Backspace', () => this.deleteSelectedTodo(), '選択中TODOの削除');
    this.register('Enter', () => this.editSelectedTodo(), '選択中TODOの編集開始');
    this.register('Ctrl+ArrowUp,Meta+ArrowUp', () => this.moveSelectedTodo('up'), 'TODO並び替え（上）');
    this.register('Ctrl+ArrowDown,Meta+ArrowDown', () => this.moveSelectedTodo('down'), 'TODO並び替え（下）');
    
    // フィルター・ナビゲーション
    this.register('Digit1', () => this.setFilter('all'), 'フィルター: 全て');
    this.register('Digit2', () => this.setFilter('incomplete'), 'フィルター: 未完了');
    this.register('Digit3', () => this.setFilter('completed'), 'フィルター: 完了済み');
    this.register('Ctrl+Digit1,Meta+Digit1', () => this.switchTab('todos'), 'TODOタブ');
    this.register('Ctrl+Digit2,Meta+Digit2', () => this.switchTab('stats'), '統計タブ');
    this.register('ArrowUp', () => this.navigateTodos('up'), 'TODO間移動（上）');
    this.register('ArrowDown', () => this.navigateTodos('down'), 'TODO間移動（下）');
    
    // 高度な操作
    this.register('Ctrl+a,Meta+a', () => this.selectAllTodos(), '全TODO選択');
    this.register('Ctrl+Shift+c,Meta+Shift+c', () => this.bulkComplete(), '選択中TODOの一括完了');
    this.register('Ctrl+Shift+d,Meta+Shift+d', () => this.bulkDelete(), '選択中TODOの一括削除');
    
    // ヘルプ
    this.register('Shift+Slash,Ctrl+Slash,Meta+Slash', () => this.toggleHelp(), 'ヘルプ表示/非表示');
  }
  
  register(keyString, handler, description) {
    const keys = keyString.split(',');
    keys.forEach(key => {
      this.shortcuts.set(key.trim(), { handler, description });
    });
  }
  
  attachEventListeners() {
    document.addEventListener('keydown', (e) => this.handleKeydown(e));
    
    // TODO項目の更新を監視
    this.updateTodoItems();
    const observer = new MutationObserver(() => this.updateTodoItems());
    observer.observe(this.app.todoList, { childList: true, subtree: true });
  }
  
  handleKeydown(event) {
    // 入力中やコンテンツ編集可能な要素では一部のショートカットを無効化
    const isInputActive = event.target.tagName === 'INPUT' || 
                         event.target.tagName === 'TEXTAREA' || 
                         event.target.contentEditable === 'true';
    
    // TODOアイテムがフォーカスされている場合の判定
    const isTodoItemFocused = event.target.classList && event.target.classList.contains('todo-item');
    
    const key = this.getKeyString(event);
    const shortcut = this.shortcuts.get(key);
    
    if (shortcut) {
      // 入力中でも有効なショートカット
      const allowedInInput = [
        'Ctrl+Enter', 'Meta+Enter', 
        'Escape', 
        'Ctrl+f', 'Meta+f',
        'Ctrl+Slash', 'Meta+Slash', 'Shift+Slash'
      ];
      
      // TODOアイテムで無効にするショートカット（ドラッグ&ドロップとの競合を避ける）
      const disabledInTodoItem = ['ArrowUp', 'ArrowDown'];
      
      if ((!isInputActive || allowedInInput.includes(key)) && 
          (!isTodoItemFocused || !disabledInTodoItem.includes(key))) {
        event.preventDefault();
        event.stopPropagation();
        shortcut.handler(event);
      }
    }
  }
  
  getKeyString(event) {
    const parts = [];
    
    if (event.ctrlKey) parts.push('Ctrl');
    if (event.metaKey) parts.push('Meta');
    if (event.shiftKey && event.key !== 'Shift') parts.push('Shift');
    if (event.altKey) parts.push('Alt');
    
    // 特殊キーの処理
    let key = event.key;
    if (event.code && event.code.startsWith('Digit')) {
      key = event.code;
    } else if (key === ' ') {
      key = 'Space';
    } else if (key === '/') {
      key = 'Slash'; // "/" キーを "Slash" として処理
    } else if (key.length === 1) {
      key = key.toLowerCase();
    }
    
    parts.push(key);
    return parts.join('+');
  }
  
  updateTodoItems() {
    this.todoItems = Array.from(this.app.todoList.querySelectorAll('.todo-item'));
    this.updateFocusableItems();
  }
  
  updateFocusableItems() {
    this.todoItems.forEach((item, index) => {
      item.tabIndex = index === this.currentFocusIndex ? 0 : -1;
    });
  }
  
  // ========== ショートカット実装 ==========
  
  focusNewTodoInput() {
    const input = this.app.form.querySelector('input[type="text"]');
    if (input) {
      input.focus();
      input.select();
    }
  }
  
  submitTodo() {
    const input = this.app.form.querySelector('input[type="text"]');
    if (input && input === document.activeElement && input.value.trim()) {
      this.app.form.dispatchEvent(new Event('submit', { bubbles: true }));
    }
  }
  
  focusSearch() {
    const searchInput = this.app.container.querySelector('.search-input');
    if (searchInput) {
      searchInput.focus();
      searchInput.select();
    }
  }
  
  handleEscape() {
    const activeElement = document.activeElement;
    
    // 検索フィールドの場合はクリア
    if (activeElement && activeElement.classList.contains('search-input')) {
      activeElement.value = '';
      activeElement.dispatchEvent(new Event('input', { bubbles: true }));
      activeElement.blur();
      return;
    }
    
    // 編集中の場合はキャンセル
    const editInput = this.app.container.querySelector('.edit-input');
    if (editInput) {
      editInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      return;
    }
    
    // ヘルプが表示されている場合は閉じる
    if (this.isHelpVisible) {
      this.toggleHelp();
      return;
    }
    
    // フォーカスをクリア
    if (activeElement) {
      activeElement.blur();
    }
    this.currentFocusIndex = -1;
    this.updateFocusableItems();
  }
  
  duplicateSelectedTodo() {
    if (this.currentFocusIndex >= 0 && this.todoItems[this.currentFocusIndex]) {
      const todoId = parseInt(this.todoItems[this.currentFocusIndex].dataset.todoId);
      this.app.duplicateTodo(todoId);
    }
  }
  
  toggleSelectedTodo() {
    if (this.currentFocusIndex >= 0 && this.todoItems[this.currentFocusIndex]) {
      const checkbox = this.todoItems[this.currentFocusIndex].querySelector('input[type="checkbox"]');
      if (checkbox) {
        checkbox.click();
      }
    }
  }
  
  deleteSelectedTodo() {
    if (this.currentFocusIndex >= 0 && this.todoItems[this.currentFocusIndex]) {
      const deleteButton = this.todoItems[this.currentFocusIndex].querySelector('.delete-button');
      if (deleteButton) {
        deleteButton.click();
      }
    }
  }
  
  editSelectedTodo() {
    if (this.currentFocusIndex >= 0 && this.todoItems[this.currentFocusIndex]) {
      const label = this.todoItems[this.currentFocusIndex].querySelector('label');
      if (label) {
        label.dispatchEvent(new Event('dblclick', { bubbles: true }));
      }
    }
  }
  
  moveSelectedTodo(direction) {
    if (this.currentFocusIndex >= 0 && this.todoItems[this.currentFocusIndex]) {
      const event = new KeyboardEvent('keydown', {
        key: direction === 'up' ? 'ArrowUp' : 'ArrowDown',
        shiftKey: true,
        bubbles: true
      });
      this.todoItems[this.currentFocusIndex].dispatchEvent(event);
    }
  }
  
  setFilter(filter) {
    const filterButton = this.app.container.querySelector(`[data-filter="${filter}"]`);
    if (filterButton) {
      filterButton.click();
    }
  }
  
  switchTab(tab) {
    const tabButton = this.app.container.querySelector(`[data-tab="${tab}"]`);
    if (tabButton) {
      tabButton.click();
    }
  }
  
  navigateTodos(direction) {
    if (this.todoItems.length === 0) return;
    
    if (direction === 'down') {
      this.currentFocusIndex = Math.min(this.currentFocusIndex + 1, this.todoItems.length - 1);
    } else {
      this.currentFocusIndex = Math.max(this.currentFocusIndex - 1, 0);
    }
    
    this.updateFocusableItems();
    if (this.todoItems[this.currentFocusIndex]) {
      this.todoItems[this.currentFocusIndex].focus();
      // Check if scrollIntoView exists (for test environment compatibility)
      if (typeof this.todoItems[this.currentFocusIndex].scrollIntoView === 'function') {
        this.todoItems[this.currentFocusIndex].scrollIntoView({ 
          behavior: 'smooth', 
          block: 'nearest' 
        });
      }
    }
  }
  
  selectAllTodos() {
    // 将来の一括選択機能のプレースホルダー
  }
  
  bulkComplete() {
    // 将来の一括完了機能のプレースホルダー
  }
  
  bulkDelete() {
    // 将来の一括削除機能のプレースホルダー
  }
  
  // ========== ヘルプシステム ==========
  
  createHelpDialog() {
    const helpDialog = document.createElement('div');
    helpDialog.className = 'shortcut-help-dialog';
    helpDialog.style.display = 'none'; // 初期状態で非表示
    helpDialog.innerHTML = `
      <div class="help-overlay"></div>
      <div class="help-content">
        <div class="help-header">
          <h3>キーボードショートカット</h3>
          <button class="help-close" aria-label="ヘルプを閉じる">×</button>
        </div>
        <div class="help-body">
          ${this.generateHelpContent()}
        </div>
      </div>
    `;
    
    // イベントリスナー
    helpDialog.querySelector('.help-close').addEventListener('click', () => this.toggleHelp());
    helpDialog.querySelector('.help-overlay').addEventListener('click', () => this.toggleHelp());
    
    document.body.appendChild(helpDialog);
    this.helpDialog = helpDialog;
  }
  
  generateHelpContent() {
    const categories = {
      '基本操作': [
        'Ctrl/Cmd + N', 'Ctrl/Cmd + Enter', 'Ctrl/Cmd + F', 'Escape', 'Ctrl/Cmd + D'
      ],
      'TODO操作': [
        'Space', 'Delete', 'Enter', 'Ctrl/Cmd + ↑/↓'
      ],
      'ナビゲーション': [
        '1/2/3', 'Ctrl/Cmd + 1/2', '↑/↓'
      ],
      '高度な操作': [
        'Ctrl/Cmd + A', 'Ctrl/Cmd + Shift + C', 'Ctrl/Cmd + Shift + D'
      ]
    };
    
    let html = '';
    for (const [category, shortcuts] of Object.entries(categories)) {
      html += `<div class="help-category">
        <h4>${category}</h4>
        <div class="help-shortcuts">`;
      
      shortcuts.forEach(shortcutKey => {
        // ショートカットの説明を取得
        const description = this.getShortcutDescription(shortcutKey);
        html += `
          <div class="help-shortcut">
            <kbd>${shortcutKey}</kbd>
            <span>${description}</span>
          </div>`;
      });
      
      html += `</div></div>`;
    }
    
    return html;
  }
  
  getShortcutDescription(shortcutKey) {
    // キーからマッピングを逆引き
    const keyMappings = {
      'Ctrl/Cmd + N': '新規TODO作成',
      'Ctrl/Cmd + Enter': 'TODO追加（入力中）',
      'Ctrl/Cmd + F': '検索フィールドにフォーカス',
      'Escape': '検索クリア・編集キャンセル',
      'Ctrl/Cmd + D': '選択中TODOの複製',
      'Space': '完了/未完了切り替え',
      'Delete': '選択中TODOの削除',
      'Enter': '選択中TODOの編集開始',
      'Ctrl/Cmd + ↑/↓': 'TODO並び替え',
      '1/2/3': 'フィルター切り替え',
      'Ctrl/Cmd + 1/2': 'タブ切り替え',
      '↑/↓': 'TODO間移動',
      'Ctrl/Cmd + A': '全TODO選択',
      'Ctrl/Cmd + Shift + C': '一括完了',
      'Ctrl/Cmd + Shift + D': '一括削除'
    };
    
    return keyMappings[shortcutKey] || '';
  }
  
  toggleHelp() {
    this.isHelpVisible = !this.isHelpVisible;
    this.helpDialog.style.display = this.isHelpVisible ? 'block' : 'none';
    
    if (this.isHelpVisible) {
      // フォーカストラップ
      const focusableElements = this.helpDialog.querySelectorAll('button, [tabindex="0"]');
      if (focusableElements.length > 0) {
        focusableElements[0].focus();
      }
    }
  }
}

// ブラウザ環境での使用のためにグローバルスコープに公開
if (typeof window !== 'undefined') {
  window.KeyboardShortcuts = KeyboardShortcuts;
}

// Node.js環境でのテスト用にエクスポート
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { KeyboardShortcuts };
}