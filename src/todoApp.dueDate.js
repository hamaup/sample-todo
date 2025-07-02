// Due date functionality extension for todoApp.js

// 日付関連のヘルパー関数
function formatDueDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diff = date - now;
  const daysDiff = Math.ceil(diff / (1000 * 60 * 60 * 24));
  
  // 相対的な時間表示
  if (daysDiff < -1) {
    return `期限切れ（${Math.abs(daysDiff)}日前）`;
  } else if (daysDiff === -1) {
    return '期限切れ（昨日）';
  } else if (daysDiff === 0) {
    return '今日';
  } else if (daysDiff === 1) {
    return '明日';
  } else if (daysDiff <= 7) {
    return `${daysDiff}日後`;
  } else {
    // 日付フォーマット
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric'
    });
  }
}

function getDueDateClass(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diff = date - now;
  const hoursDiff = diff / (1000 * 60 * 60);
  const daysDiff = diff / (1000 * 60 * 60 * 24);
  
  if (diff < 0) {
    return 'overdue';
  } else if (hoursDiff <= 24) {
    return 'due-soon';
  } else if (daysDiff <= 7) {
    return 'due-week';
  }
  return '';
}

function isOverdue(dateString) {
  if (!dateString) return false;
  return new Date(dateString) < new Date();
}

function isDueToday(dateString) {
  if (!dateString) return false;
  const date = new Date(dateString);
  const today = new Date();
  return date.toDateString() === today.toDateString();
}

function isDueThisWeek(dateString) {
  if (!dateString) return false;
  const date = new Date(dateString);
  const now = new Date();
  const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  return date >= now && date <= weekFromNow;
}

// HTMLを追加する関数
function addDueDateHTML(container) {
  // フォームに期限入力を追加
  const form = container.querySelector('#todo-form');
  const submitButton = form.querySelector('button[type="submit"]');
  
  const dueDateInput = document.createElement('input');
  dueDateInput.type = 'datetime-local';
  dueDateInput.setAttribute('aria-label', '期限日時');
  dueDateInput.className = 'due-date-input';
  
  form.insertBefore(dueDateInput, submitButton);
  
  // フィルターボタンを追加
  const filterNav = container.querySelector('.filter-navigation');
  
  const dueDateFilters = [
    { filter: 'overdue', text: '期限切れ' },
    { filter: 'today', text: '今日' },
    { filter: 'week', text: '今週' },
    { filter: 'no-due', text: '期限なし' }
  ];
  
  dueDateFilters.forEach(({ filter, text }) => {
    const button = document.createElement('button');
    button.className = 'filter-button';
    button.setAttribute('data-filter', filter);
    button.textContent = text;
    filterNav.appendChild(button);
  });
  
  // ソートボタンを追加
  const sortContainer = document.createElement('div');
  sortContainer.className = 'sort-container';
  
  const sortButtons = [
    { sort: 'order', text: '追加順' },
    { sort: 'due-date', text: '期限順' }
  ];
  
  sortButtons.forEach(({ sort, text }) => {
    const button = document.createElement('button');
    button.className = 'sort-button';
    button.setAttribute('data-sort', sort);
    button.textContent = text;
    sortContainer.appendChild(button);
  });
  
  filterNav.after(sortContainer);
  
  return dueDateInput;
}

// 拡張された機能をエクスポート
module.exports = {
  formatDueDate,
  getDueDateClass,
  isOverdue,
  isDueToday,
  isDueThisWeek,
  addDueDateHTML
};