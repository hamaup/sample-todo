# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- テスト自動修正機能 - 失敗したテストを自動的に修正
- 自動マージ機能 - 全てのチェックが合格したPRを自動マージ
- PRマージ後の自動処理ワークフロー
- タブシステムのCSS実装
- インポート機能のUX改善

### Changed
- インポートボタンの動作を改善（ファイル未選択時に自動でダイアログ表示）
- ボタンデザインの統一

### Fixed
- タブ切り替え機能の修正
- エクスポート/インポート機能の動作修正
- ダークモード切り替えの問題修正
- CI/CDのテストエラー修正

## [1.0.0] - 2025-01-01

### Added
- 基本的なTODO管理機能
- ダークモード対応
- キーボードショートカット
- 一括操作機能
- コメント機能
- 統計機能
- エクスポート/インポート機能（JSON, CSV）
- ドラッグ&ドロップによる並び替え
- LocalStorageによるデータ永続化

[Unreleased]: https://github.com/hamaup/sample-todo/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/hamaup/sample-todo/releases/tag/v1.0.0