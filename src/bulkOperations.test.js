const { createTodoApp } = require('./todoApp');

describe('TODO App Bulk Operations', () => {
  let container, app;

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

  describe('Selection Functionality', () => {
    beforeEach(() => {
      // テスト用のTODOを追加
      const form = container.querySelector('#todo-form');
      const input = form.querySelector('input[type="text"]');
      
      ['TODO 1', 'TODO 2', 'TODO 3'].forEach(text => {
        input.value = text;
        form.dispatchEvent(new Event('submit'));
      });
    });

    test('should show selection checkboxes when selection mode is active', () => {
      // 選択モードボタンがあることを確認
      const selectionModeButton = container.querySelector('.selection-mode-toggle');
      expect(selectionModeButton).toBeInTheDocument();
      
      // 初期状態では選択チェックボックスは表示されない
      let selectionCheckboxes = container.querySelectorAll('.todo-item .selection-checkbox');
      expect(selectionCheckboxes).toHaveLength(0);
      
      // 選択モードを有効にする
      selectionModeButton.click();
      
      // 選択チェックボックスが表示される
      selectionCheckboxes = container.querySelectorAll('.todo-item .selection-checkbox');
      expect(selectionCheckboxes).toHaveLength(3);
    });

    test('should show bulk actions toolbar when items are selected', () => {
      // 選択モードを有効にする
      const selectionModeButton = container.querySelector('.selection-mode-toggle');
      selectionModeButton.click();
      
      // 初期状態では一括操作ツールバーは表示されない
      let bulkActionsToolbar = container.querySelector('.bulk-actions-toolbar');
      expect(bulkActionsToolbar).not.toBeVisible();
      
      // 最初のTODOを選択
      const firstCheckbox = container.querySelector('.todo-item .selection-checkbox');
      firstCheckbox.click();
      
      // 一括操作ツールバーが表示される
      bulkActionsToolbar = container.querySelector('.bulk-actions-toolbar');
      expect(bulkActionsToolbar).toBeVisible();
    });

    test('should select/deselect individual items', () => {
      // 選択モードを有効にする
      const selectionModeButton = container.querySelector('.selection-mode-toggle');
      selectionModeButton.click();
      
      const firstCheckbox = container.querySelector('.todo-item .selection-checkbox');
      const firstTodoItem = firstCheckbox.closest('.todo-item');
      
      // 初期状態では選択されていない
      expect(firstCheckbox.checked).toBe(false);
      expect(firstTodoItem).not.toHaveClass('selected');
      
      // チェックボックスをクリックして選択
      firstCheckbox.click();
      
      // DOM更新後の状態をチェック
      const updatedFirstCheckbox = container.querySelector('.todo-item .selection-checkbox');
      const updatedFirstTodoItem = updatedFirstCheckbox.closest('.todo-item');
      
      // 選択状態になる
      expect(updatedFirstCheckbox.checked).toBe(true);
      expect(updatedFirstTodoItem).toHaveClass('selected');
      
      // もう一度クリックして選択解除
      updatedFirstCheckbox.click();
      
      // DOM更新後の状態をチェック
      const finalFirstCheckbox = container.querySelector('.todo-item .selection-checkbox');
      const finalFirstTodoItem = finalFirstCheckbox.closest('.todo-item');
      
      // 選択解除される
      expect(finalFirstCheckbox.checked).toBe(false);
      expect(finalFirstTodoItem).not.toHaveClass('selected');
    });

    test('should implement select all functionality', () => {
      // 選択モードを有効にする
      const selectionModeButton = container.querySelector('.selection-mode-toggle');
      selectionModeButton.click();
      
      let selectAllCheckbox = container.querySelector('.select-all-checkbox');
      
      // 全選択チェックボックスをクリック
      selectAllCheckbox.click();
      
      // DOM更新後の状態をチェック
      const individualCheckboxes = container.querySelectorAll('.todo-item .selection-checkbox');
      selectAllCheckbox = container.querySelector('.select-all-checkbox');
      
      // 全てのアイテムが選択される
      individualCheckboxes.forEach(checkbox => {
        expect(checkbox.checked).toBe(true);
      });
      expect(selectAllCheckbox.checked).toBe(true);
      
      // 全選択を解除
      selectAllCheckbox.click();
      
      // DOM更新後の状態をチェック
      const finalIndividualCheckboxes = container.querySelectorAll('.todo-item .selection-checkbox');
      const finalSelectAllCheckbox = container.querySelector('.select-all-checkbox');
      
      // 全てのアイテムの選択が解除される
      finalIndividualCheckboxes.forEach(checkbox => {
        expect(checkbox.checked).toBe(false);
      });
      expect(finalSelectAllCheckbox.checked).toBe(false);
    });

    test('should update select all checkbox state based on individual selections', () => {
      // 選択モードを有効にする
      const selectionModeButton = container.querySelector('.selection-mode-toggle');
      selectionModeButton.click();
      
      const selectAllCheckbox = container.querySelector('.select-all-checkbox');
      const individualCheckboxes = container.querySelectorAll('.todo-item .selection-checkbox');
      
      // 一部のアイテムを選択
      individualCheckboxes[0].click();
      individualCheckboxes[1].click();
      
      // 全選択チェックボックスは不確定状態（intermediate）
      expect(selectAllCheckbox.indeterminate).toBe(true);
      
      // 最後のアイテムも選択
      individualCheckboxes[2].click();
      
      // 全選択チェックボックスがチェック状態になる
      expect(selectAllCheckbox.checked).toBe(true);
      expect(selectAllCheckbox.indeterminate).toBe(false);
    });
  });

  describe('Bulk Operations', () => {
    beforeEach(() => {
      // テスト用のTODOを追加
      const form = container.querySelector('#todo-form');
      const input = form.querySelector('input[type="text"]');
      
      ['TODO 1', 'TODO 2', 'TODO 3'].forEach(text => {
        input.value = text;
        form.dispatchEvent(new Event('submit'));
      });
      
      // 選択モードを有効にする
      const selectionModeButton = container.querySelector('.selection-mode-toggle');
      selectionModeButton.click();
    });

    test('should bulk complete selected items', () => {
      // 最初の2つのアイテムを選択
      const checkboxes = container.querySelectorAll('.todo-item .selection-checkbox');
      checkboxes[0].click();
      checkboxes[1].click();
      
      // 一括完了ボタンをクリック
      const bulkCompleteButton = container.querySelector('.bulk-complete');
      bulkCompleteButton.click();
      
      // 選択されたアイテムが完了状態になる
      const todoItems = container.querySelectorAll('.todo-item');
      expect(todoItems[0]).toHaveClass('completed');
      expect(todoItems[1]).toHaveClass('completed');
      expect(todoItems[2]).not.toHaveClass('completed');
    });

    test('should bulk uncomplete selected items', () => {
      // まず一括完了を使って全てのTODOを完了状態にする
      const selectAllCheckbox = container.querySelector('.select-all-checkbox');
      selectAllCheckbox.click(); // 全選択
      
      const bulkCompleteButton = container.querySelector('.bulk-complete');
      bulkCompleteButton.click(); // 一括完了
      
      // 選択をクリア
      selectAllCheckbox.click(); // 全選択解除
      
      // 最初の2つのアイテムを選択
      let selectionCheckboxes = container.querySelectorAll('.todo-item .selection-checkbox');
      selectionCheckboxes[0].click();
      
      selectionCheckboxes = container.querySelectorAll('.todo-item .selection-checkbox');
      selectionCheckboxes[1].click();
      
      // 一括未完了ボタンをクリック
      const bulkUncompleteButton = container.querySelector('.bulk-uncomplete');
      bulkUncompleteButton.click();
      
      // DOM更新後の状態をチェック
      const todoItems = container.querySelectorAll('.todo-item');
      expect(todoItems[0]).not.toHaveClass('completed');
      expect(todoItems[1]).not.toHaveClass('completed');
      expect(todoItems[2]).toHaveClass('completed');
    });

    test('should bulk delete selected items with confirmation', () => {
      // 最初の2つのアイテムを選択
      const checkboxes = container.querySelectorAll('.todo-item .selection-checkbox');
      checkboxes[0].click();
      checkboxes[1].click();
      
      // window.confirmのモックを設定
      const originalConfirm = window.confirm;
      window.confirm = jest.fn(() => true);
      
      // 一括削除ボタンをクリック
      const bulkDeleteButton = container.querySelector('.bulk-delete');
      bulkDeleteButton.click();
      
      // 確認ダイアログが表示される
      expect(window.confirm).toHaveBeenCalledWith('選択された2個のTODOを削除しますか？');
      
      // 選択されたアイテムが削除される
      const remainingTodoItems = container.querySelectorAll('.todo-item');
      expect(remainingTodoItems).toHaveLength(1);
      
      // モックを元に戻す
      window.confirm = originalConfirm;
    });

    test('should not delete items if user cancels confirmation', () => {
      // 最初の2つのアイテムを選択
      const checkboxes = container.querySelectorAll('.todo-item .selection-checkbox');
      checkboxes[0].click();
      checkboxes[1].click();
      
      // window.confirmのモックを設定（キャンセル）
      const originalConfirm = window.confirm;
      window.confirm = jest.fn(() => false);
      
      // 一括削除ボタンをクリック
      const bulkDeleteButton = container.querySelector('.bulk-delete');
      bulkDeleteButton.click();
      
      // アイテムは削除されない
      const todoItems = container.querySelectorAll('.todo-item');
      expect(todoItems).toHaveLength(3);
      
      // モックを元に戻す
      window.confirm = originalConfirm;
    });
  });

  describe('Range Selection', () => {
    beforeEach(() => {
      // テスト用のTODOを追加
      const form = container.querySelector('#todo-form');
      const input = form.querySelector('input[type="text"]');
      
      ['TODO 1', 'TODO 2', 'TODO 3', 'TODO 4', 'TODO 5'].forEach(text => {
        input.value = text;
        form.dispatchEvent(new Event('submit'));
      });
      
      // 選択モードを有効にする
      const selectionModeButton = container.querySelector('.selection-mode-toggle');
      selectionModeButton.click();
    });

    test('should select range when shift+clicking', () => {
      let checkboxes = container.querySelectorAll('.todo-item .selection-checkbox');
      
      // 最初のアイテムを通常クリック
      checkboxes[0].click();
      
      // DOM更新後の要素を取得
      checkboxes = container.querySelectorAll('.todo-item .selection-checkbox');
      
      // 3つ目のアイテムをShift+クリック
      const shiftClickEvent = new MouseEvent('click', { shiftKey: true });
      checkboxes[2].dispatchEvent(shiftClickEvent);
      
      // DOM更新後の状態をチェック
      const finalCheckboxes = container.querySelectorAll('.todo-item .selection-checkbox');
      
      // 1つ目から3つ目まで選択される
      expect(finalCheckboxes[0].checked).toBe(true);
      expect(finalCheckboxes[1].checked).toBe(true);
      expect(finalCheckboxes[2].checked).toBe(true);
      expect(finalCheckboxes[3].checked).toBe(false);
      expect(finalCheckboxes[4].checked).toBe(false);
    });
  });

  describe('Keyboard Navigation', () => {
    beforeEach(() => {
      // テスト用のTODOを追加
      const form = container.querySelector('#todo-form');
      const input = form.querySelector('input[type="text"]');
      
      ['TODO 1', 'TODO 2', 'TODO 3'].forEach(text => {
        input.value = text;
        form.dispatchEvent(new Event('submit'));
      });
      
      // 選択モードを有効にする
      const selectionModeButton = container.querySelector('.selection-mode-toggle');
      selectionModeButton.click();
    });

    test('should support Ctrl/Cmd+A for select all', () => {
      // 最初に全選択チェックボックスをチェック状態にする
      const selectAllCheckbox = container.querySelector('.select-all-checkbox');
      selectAllCheckbox.checked = true;
      
      // Ctrl+A キーイベントを発火
      const selectAllEvent = new KeyboardEvent('keydown', {
        key: 'a',
        ctrlKey: true
      });
      document.dispatchEvent(selectAllEvent);
      
      // DOM更新後の状態をチェック
      const checkboxes = container.querySelectorAll('.todo-item .selection-checkbox');
      checkboxes.forEach(checkbox => {
        expect(checkbox.checked).toBe(true);
      });
    });

    test('should support Space key for toggle selection on focused item', () => {
      let firstTodoItem = container.querySelector('.todo-item');
      
      // フォーカスを設定
      firstTodoItem.focus();
      
      // Space キーを押す
      const spaceEvent = new KeyboardEvent('keydown', { key: ' ' });
      firstTodoItem.dispatchEvent(spaceEvent);
      
      // DOM更新後の状態をチェック
      firstTodoItem = container.querySelector('.todo-item');
      const firstCheckbox = firstTodoItem.querySelector('.selection-checkbox');
      
      // アイテムが選択される
      expect(firstCheckbox.checked).toBe(true);
      
      // もう一度Space キーを押す
      firstTodoItem.dispatchEvent(spaceEvent);
      
      // DOM更新後の状態をチェック
      const finalFirstTodoItem = container.querySelector('.todo-item');
      const finalFirstCheckbox = finalFirstTodoItem.querySelector('.selection-checkbox');
      
      // 選択が解除される
      expect(finalFirstCheckbox.checked).toBe(false);
    });
  });
});