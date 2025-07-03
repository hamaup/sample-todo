const { createTodoApp } = require('./todoApp');

describe('TODO App Export/Import Functionality', () => {
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

  describe('Export Functionality', () => {
    beforeEach(() => {
      // テスト用のTODOを追加
      const form = container.querySelector('#todo-form');
      const input = form.querySelector('input[type="text"]');
      
      ['TODO 1', 'TODO 2', 'TODO 3'].forEach(text => {
        input.value = text;
        form.dispatchEvent(new Event('submit'));
      });
      
      // 1つのTODOを完了にする
      const firstCheckbox = container.querySelector('.todo-item input[type="checkbox"]');
      firstCheckbox.click();
    });

    test('should have export buttons in UI', () => {
      // 統計タブに切り替え
      const statsTab = container.querySelector('[data-tab="stats"]');
      statsTab.click();
      
      // エクスポートボタンが存在することを確認
      const exportJsonButton = container.querySelector('.export-json');
      expect(exportJsonButton).toBeInTheDocument();
      expect(exportJsonButton).toHaveTextContent('JSONエクスポート');
      
      // 新しいエクスポートボタンの存在確認
      const exportCsvButton = container.querySelector('.export-csv');
      expect(exportCsvButton).toBeInTheDocument();
      expect(exportCsvButton).toHaveTextContent('CSVエクスポート');
    });

    test('should export data as JSON format', () => {
      // 統計タブに切り替え
      const statsTab = container.querySelector('[data-tab="stats"]');
      statsTab.click();
      
      // BlobとURL.createObjectURLのモック
      global.Blob = jest.fn(() => ({ type: 'application/json' }));
      global.URL = {
        createObjectURL: jest.fn(() => 'blob:mock-url'),
        revokeObjectURL: jest.fn()
      };
      
      // ダウンロードのモック
      const mockClick = jest.fn();
      jest.spyOn(document, 'createElement').mockImplementation((tagName) => {
        if (tagName === 'a') {
          return {
            href: '',
            download: '',
            click: mockClick,
            setAttribute: jest.fn()
          };
        }
        return document.createElement.wrappedMethod(tagName);
      });
      
      const exportJsonButton = container.querySelector('.export-json');
      exportJsonButton.click();
      
      // Blobが正しく作成されることを確認
      expect(global.Blob).toHaveBeenCalledWith(
        expect.arrayContaining([expect.stringContaining('"todos"')]),
        { type: 'application/json' }
      );
      
      // ダウンロードが実行されることを確認
      expect(mockClick).toHaveBeenCalled();
      
      // クリーンアップ
      document.createElement.mockRestore();
    });

    test('should export data as CSV format', () => {
      // 統計タブに切り替え
      const statsTab = container.querySelector('[data-tab="stats"]');
      statsTab.click();
      
      // BlobとURL.createObjectURLのモック
      global.Blob = jest.fn(() => ({ type: 'text/csv' }));
      global.URL = {
        createObjectURL: jest.fn(() => 'blob:mock-url'),
        revokeObjectURL: jest.fn()
      };
      
      // ダウンロードのモック
      const mockClick = jest.fn();
      jest.spyOn(document, 'createElement').mockImplementation((tagName) => {
        if (tagName === 'a') {
          return {
            href: '',
            download: '',
            click: mockClick,
            setAttribute: jest.fn()
          };
        }
        return document.createElement.wrappedMethod(tagName);
      });
      
      const exportCsvButton = container.querySelector('.export-csv');
      exportCsvButton.click();
      
      // Blobが正しく作成されることを確認
      expect(global.Blob).toHaveBeenCalledWith(
        expect.arrayContaining([expect.stringContaining('ID,テキスト,完了,作成日時,完了日時')]),
        { type: 'text/csv' }
      );
      
      // ダウンロードが実行されることを確認
      expect(mockClick).toHaveBeenCalled();
      
      // クリーンアップ
      document.createElement.mockRestore();
    });
  });

  describe('Import Functionality', () => {
    test('should have import section in UI', () => {
      // 統計タブに切り替え
      const statsTab = container.querySelector('[data-tab="stats"]');
      statsTab.click();
      
      // インポートセクションが存在することを確認
      const importSection = container.querySelector('.import-section');
      expect(importSection).toBeInTheDocument();
      
      const fileInput = container.querySelector('.import-file-input');
      expect(fileInput).toBeInTheDocument();
      expect(fileInput.type).toBe('file');
      
      const importButton = container.querySelector('.import-button');
      expect(importButton).toBeInTheDocument();
      expect(importButton).toHaveTextContent('インポート');
    });

    test('should import JSON data correctly', (done) => {
      // 統計タブに切り替え
      const statsTab = container.querySelector('[data-tab="stats"]');
      statsTab.click();
      
      const importData = {
        todos: [
          {
            id: 1,
            text: 'インポートされたTODO 1',
            completed: false,
            createdAt: '2025-01-01T00:00:00.000Z',
            completedAt: null,
            order: 0
          },
          {
            id: 2,
            text: 'インポートされたTODO 2',
            completed: true,
            createdAt: '2025-01-01T01:00:00.000Z',
            completedAt: '2025-01-01T02:00:00.000Z',
            order: 1
          }
        ]
      };
      
      // window.alertのモック
      global.alert = jest.fn();
      
      // FileReaderのモック
      const mockFileReader = {
        addEventListener: jest.fn(),
        readAsText: jest.fn()
      };
      
      global.FileReader = jest.fn(() => mockFileReader);
      
      const fileInput = container.querySelector('.import-file-input');
      const importButton = container.querySelector('.import-button');
      
      // ファイルを選択したことをシミュレート
      const mockFile = new Blob([JSON.stringify(importData)], { type: 'application/json' });
      Object.defineProperty(mockFile, 'name', {
        value: 'test.json',
        writable: false
      });
      Object.defineProperty(fileInput, 'files', {
        value: [mockFile],
        writable: false
      });
      
      // インポートボタンをクリック
      importButton.click();
      
      // FileReaderのロードイベントをシミュレート
      const loadEvent = mockFileReader.addEventListener.mock.calls.find(
        call => call[0] === 'load'
      );
      expect(loadEvent).toBeDefined();
      
      const loadHandler = loadEvent[1];
      mockFileReader.result = JSON.stringify(importData);
      loadHandler({ target: mockFileReader });
      
      // インポート完了メッセージが表示されることを確認
      expect(global.alert).toHaveBeenCalledWith('2個のTODOをインポートしました。');
      
      // 非同期処理の完了を待つ
      setTimeout(() => {
        // TODOタブに切り替えてデータが正しくインポートされたことを確認
        const todosTab = container.querySelector('[data-tab="todos"]');
        todosTab.click();
        
        const todoItems = container.querySelectorAll('.todo-item');
        expect(todoItems).toHaveLength(2);
        
        // TODOのテキストが正しいことを確認
        expect(todoItems[0]).toHaveTextContent('インポートされたTODO 1');
        expect(todoItems[1]).toHaveTextContent('インポートされたTODO 2');
        
        // 完了状態が正しいことを確認
        expect(todoItems[0]).not.toHaveClass('completed');
        expect(todoItems[1]).toHaveClass('completed');
        
        done();
      }, 10);
    });

    test('should import CSV data correctly', async () => {
      // 統計タブに切り替え
      const statsTab = container.querySelector('[data-tab="stats"]');
      statsTab.click();
      
      const csvData = `ID,テキスト,完了,作成日時,完了日時,順序
1,CSVインポートTODO 1,false,2025-01-01T00:00:00.000Z,,0
2,CSVインポートTODO 2,true,2025-01-01T01:00:00.000Z,2025-01-01T02:00:00.000Z,1`;
      
      // FileReaderのモック
      const mockFileReader = {
        addEventListener: jest.fn(),
        readAsText: jest.fn()
      };
      
      global.FileReader = jest.fn(() => mockFileReader);
      
      const fileInput = container.querySelector('.import-file-input');
      const importButton = container.querySelector('.import-button');
      
      // CSVファイルを選択したことをシミュレート
      const mockFile = new Blob([csvData], { type: 'text/csv' });
      Object.defineProperty(mockFile, 'name', {
        value: 'todos.csv',
        writable: false
      });
      Object.defineProperty(fileInput, 'files', {
        value: [mockFile],
        writable: false
      });
      
      // インポートボタンをクリック
      importButton.click();
      
      // FileReaderのロードイベントをシミュレート
      const loadEvent = mockFileReader.addEventListener.mock.calls.find(
        call => call[0] === 'load'
      );
      expect(loadEvent).toBeDefined();
      
      const loadHandler = loadEvent[1];
      mockFileReader.result = csvData;
      loadHandler({ target: mockFileReader });
      
      // TODOタブに戻ってデータが正しくインポートされたことを確認
      const todosTab = container.querySelector('[data-tab="todos"]');
      todosTab.click();
      
      const todoItems = container.querySelectorAll('.todo-item');
      expect(todoItems).toHaveLength(2);
      
      // TODOのテキストが正しいことを確認
      expect(todoItems[0]).toHaveTextContent('CSVインポートTODO 1');
      expect(todoItems[1]).toHaveTextContent('CSVインポートTODO 2');
      
      // 完了状態が正しいことを確認
      expect(todoItems[0]).not.toHaveClass('completed');
      expect(todoItems[1]).toHaveClass('completed');
    });

    test('should handle invalid JSON import gracefully', () => {
      // 統計タブに切り替え
      const statsTab = container.querySelector('[data-tab="stats"]');
      statsTab.click();
      
      // window.alertのモック
      global.alert = jest.fn();
      
      // FileReaderのモック
      const mockFileReader = {
        addEventListener: jest.fn(),
        readAsText: jest.fn()
      };
      
      global.FileReader = jest.fn(() => mockFileReader);
      
      const fileInput = container.querySelector('.import-file-input');
      const importButton = container.querySelector('.import-button');
      
      // 無効なJSONファイルをシミュレート
      const mockFile = new Blob(['invalid json content'], { type: 'application/json' });
      Object.defineProperty(fileInput, 'files', {
        value: [mockFile],
        writable: false
      });
      
      // インポートボタンをクリック
      importButton.click();
      
      // FileReaderのロードイベントをシミュレート
      const loadEvent = mockFileReader.addEventListener.mock.calls.find(
        call => call[0] === 'load'
      );
      const loadHandler = loadEvent[1];
      mockFileReader.result = 'invalid json content';
      loadHandler({ target: mockFileReader });
      
      // エラーアラートが表示されることを確認
      expect(global.alert).toHaveBeenCalledWith(expect.stringContaining('ファイルの形式が正しくありません'));
    });

    test('should handle invalid CSV import gracefully', () => {
      // 統計タブに切り替え
      const statsTab = container.querySelector('[data-tab="stats"]');
      statsTab.click();
      
      // window.alertのモック
      global.alert = jest.fn();
      
      // FileReaderのモック
      const mockFileReader = {
        addEventListener: jest.fn(),
        readAsText: jest.fn()
      };
      
      global.FileReader = jest.fn(() => mockFileReader);
      
      const fileInput = container.querySelector('.import-file-input');
      const importButton = container.querySelector('.import-button');
      
      // 無効なCSVファイルをシミュレート
      const invalidCsvData = 'invalid,csv,structure';
      const mockFile = new Blob([invalidCsvData], { type: 'text/csv' });
      Object.defineProperty(mockFile, 'name', {
        value: 'invalid.csv',
        writable: false
      });
      Object.defineProperty(fileInput, 'files', {
        value: [mockFile],
        writable: false
      });
      
      // インポートボタンをクリック
      importButton.click();
      
      // FileReaderのロードイベントをシミュレート
      const loadEvent = mockFileReader.addEventListener.mock.calls.find(
        call => call[0] === 'load'
      );
      const loadHandler = loadEvent[1];
      mockFileReader.result = invalidCsvData;
      loadHandler({ target: mockFileReader });
      
      // エラーアラートが表示されることを確認
      expect(global.alert).toHaveBeenCalledWith(expect.stringContaining('CSVファイルの形式が正しくありません'));
    });

    test('should trigger file input when no file is selected', () => {
      // 統計タブに切り替え
      const statsTab = container.querySelector('[data-tab="stats"]');
      statsTab.click();
      
      const fileInput = container.querySelector('.import-file-input');
      const importButton = container.querySelector('.import-button');
      
      // file inputのclickメソッドをモック
      fileInput.click = jest.fn();
      
      // ファイルを選択せずにインポートボタンをクリック
      importButton.click();
      
      // ファイル選択ダイアログが開かれることを確認
      expect(fileInput.click).toHaveBeenCalled();
    });
  });

  describe('Data Merge Functionality', () => {
    test('should offer merge or replace options when importing', (done) => {
      // 既存のTODOを追加
      const form = container.querySelector('#todo-form');
      const input = form.querySelector('input[type="text"]');
      input.value = '既存のTODO';
      form.dispatchEvent(new Event('submit'));
      
      // レンダリングを完了させる
      app.render();
      
      // 統計タブに切り替え
      const statsTab = container.querySelector('[data-tab="stats"]');
      statsTab.click();
      
      // window.confirmのモック
      global.confirm = jest.fn(() => true);
      
      const importData = {
        todos: [
          {
            id: 1,
            text: 'インポートされたTODO',
            completed: false,
            createdAt: '2025-01-01T00:00:00.000Z',
            completedAt: null,
            order: 0
          }
        ]
      };
      
      // FileReaderのモック
      const mockFileReader = {
        addEventListener: jest.fn(),
        readAsText: jest.fn()
      };
      
      global.FileReader = jest.fn(() => mockFileReader);
      
      const fileInput = container.querySelector('.import-file-input');
      const importButton = container.querySelector('.import-button');
      
      // ファイルを選択
      const mockFile = new Blob([JSON.stringify(importData)], { type: 'application/json' });
      Object.defineProperty(mockFile, 'name', {
        value: 'test.json',
        writable: false
      });
      Object.defineProperty(fileInput, 'files', {
        value: [mockFile],
        writable: false
      });
      
      // インポートボタンをクリック
      importButton.click();
      
      // FileReaderのロードイベントをシミュレート
      const loadEvent = mockFileReader.addEventListener.mock.calls.find(
        call => call[0] === 'load'
      );
      const loadHandler = loadEvent[1];
      mockFileReader.result = JSON.stringify(importData);
      loadHandler({ target: mockFileReader });
      
      // 非同期処理の完了を待つ
      setTimeout(() => {
        // マージオプションの確認ダイアログが表示されることを確認
        expect(global.confirm).toHaveBeenCalledWith(
          expect.stringContaining('既存のTODOがあります')
        );
        
        done();
      }, 10);
    });
  });
});