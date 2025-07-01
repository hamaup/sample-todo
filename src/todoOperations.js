let todoIdCounter = 1;

function addTodo(text) {
  return {
    id: String(todoIdCounter++),
    text,
    completed: false,
    createdAt: Date.now()
  };
}

function toggleTodo(todo) {
  return {
    ...todo,
    completed: !todo.completed
  };
}

function deleteTodo(todos, todoId) {
  return todos.filter(todo => todo.id !== todoId);
}

module.exports = { addTodo, toggleTodo, deleteTodo };