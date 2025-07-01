const { addTodo, toggleTodo, deleteTodo } = require('./todoOperations');

describe('TODO Operations', () => {
  describe('addTodo', () => {
    test('should add a new todo with unique id', () => {
      const todo1 = addTodo('買い物に行く');
      const todo2 = addTodo('勉強する');
      
      expect(todo1.text).toBe('買い物に行く');
      expect(todo1.completed).toBe(false);
      expect(todo1.id).toBeDefined();
      expect(todo2.id).not.toBe(todo1.id);
    });

    test('should have createdAt timestamp', () => {
      const before = Date.now();
      const todo = addTodo('テストTODO');
      const after = Date.now();
      
      expect(todo.createdAt).toBeGreaterThanOrEqual(before);
      expect(todo.createdAt).toBeLessThanOrEqual(after);
    });
  });

  describe('toggleTodo', () => {
    test('should toggle completion status', () => {
      const todo = { id: '123', text: 'テスト', completed: false };
      const toggled = toggleTodo(todo);
      
      expect(toggled.completed).toBe(true);
      expect(toggled.text).toBe('テスト');
    });
  });

  describe('deleteTodo', () => {
    test('should mark todo as deleted', () => {
      const todos = [
        { id: '1', text: 'TODO1', completed: false },
        { id: '2', text: 'TODO2', completed: false }
      ];
      
      const result = deleteTodo(todos, '1');
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('2');
    });
  });
});