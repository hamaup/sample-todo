# GitHub × Linear 統合ガイド

このガイドでは、GitHub と Linear を連携させて、開発ワークフローを自動化する方法を説明します。

## 目次
- [概要](#概要)
- [メリット](#メリット)
- [セットアップ手順](#セットアップ手順)
- [ワークフロー](#ワークフロー)
- [ベストプラクティス](#ベストプラクティス)
- [トラブルシューティング](#トラブルシューティング)

## 概要

GitHub × Linear 統合により、以下が自動化されます：
- Pull Request と Linear Issue の自動リンク
- PR のマージ時に Issue のステータスを自動更新
- コミット・PR から Issue への自動参照

## メリット

1. **作業の可視化**: すべての開発作業が Linear で一元管理
2. **自動化**: 手動でのステータス更新が不要
3. **トレーサビリティ**: コードと課題の関連が明確
4. **チーム効率**: 進捗状況がリアルタイムで共有

## セットアップ手順

### 1. Linear で GitHub App をインストール

#### 方法A: Linear の設定画面から（推奨）

1. Linear の Settings → Integrations → GitHub を選択
2. "Install GitHub App" をクリック
3. 連携したいリポジトリを選択
4. 権限を承認

#### 方法B: GitHub Apps ページから直接インストール

1. https://github.com/apps/linear-app にアクセス
2. "Install" ボタンをクリック
3. インストール先を選択：
   - 個人アカウント or Organization を選択
   - "All repositories" または "Only select repositories" を選択
4. 必要なリポジトリを選択（複数選択可）
5. "Install" をクリックして権限を承認

インストール時に付与される権限：
- **Actions**: Read（ワークフロー実行状況の確認）
- **Checks**: Read（CI/CDステータスの確認）
- **Contents**: Read（コード内容の参照）
- **Issues**: Read & Write（Issue の作成・更新）
- **Metadata**: Read（リポジトリ情報の取得）
- **Pull requests**: Read & Write（PR の作成・更新・リンク）
- **Commit statuses**: Read（コミットステータスの確認）

#### インストール後の確認

1. GitHub の Settings → Integrations → Applications で Linear App が表示されることを確認
2. Linear の Settings → Integrations → GitHub で接続状態が "Connected" になっていることを確認
3. リポジトリ一覧に連携したいリポジトリが表示されることを確認

#### 方法C: Claude Code から直接インストール

Claude Code を使用している場合は、コマンドで直接インストールできます：

```bash
# Claude Code で以下のコマンドを実行
/install-github-app
```

このコマンドを実行すると：
1. Linear の GitHub App インストールページが自動的に開きます
2. ブラウザで権限を確認・承認します
3. インストール完了後、Linear と GitHub の連携が自動的に有効になります

**注意**: このコマンドは Claude Code 内でのみ使用可能です。通常のターミナルでは動作しません。

### 2. チーム設定で自動化を有効化

Linear の Team Settings で以下を設定：

```
Settings → Teams → [Your Team] → Git automation
- ✅ Automatically create branch names
- ✅ Move to "In Progress" when PR is opened
- ✅ Move to "Done" when PR is merged
- ✅ Move to "Cancelled" when PR is closed
```

### 3. プロジェクト設定（オプション）

特定のプロジェクトでカスタムワークフローを使用する場合：

```
Project Settings → Workflows
- カスタムステータスを定義
- 自動遷移ルールを設定
```

## ワークフロー

### 1. Issue 作成とブランチ名

Linear で Issue を作成すると、推奨ブランチ名が自動生成されます：

```bash
# Linear が生成するブランチ名の例
hamaup/fortune-20-todo削除機能を実装
```

### 2. 開発フロー

```bash
# 1. Linear の Issue からブランチ名をコピー
# 2. ブランチを作成
git checkout -b hamaup/fortune-20-todo削除機能を実装

# 3. 開発・コミット
git add .
git commit -m "feat: TODO削除機能を実装"

# 4. プッシュ
git push -u origin hamaup/fortune-20-todo削除機能を実装

# 5. PR 作成（タイトルに Issue ID を含める）
gh pr create --title "feat: TODO削除機能を実装 (FORTUNE-20)"
```

### 3. 自動ステータス更新

- PR 作成時: Issue が "In Progress" に移動
- PR マージ時: Issue が "Done" に移動
- PR クローズ時: Issue が "Cancelled" に移動

## ベストプラクティス

### 1. ブランチ命名規則

```
{username}/{issue-key}-{簡潔な説明}
```

例：
- `hamaup/fortune-21-edit-feature`
- `john/bug-42-fix-login`

### 2. PR タイトル

Issue ID を必ず含める：
```
feat: 機能説明 (ISSUE-ID)
fix: バグ修正内容 (#GitHub-Issue-Number)
```

### 3. コミットメッセージ

Linear の Issue ID を含めると自動リンクされます：
```
git commit -m "feat: 削除ボタンを追加 [FORTUNE-20]"
```

### 4. ラベルとプロジェクト

- Linear のラベルを活用して分類
- プロジェクトでマイルストーンを管理
- 優先度（Priority）を適切に設定

## トラブルシューティング

### Issue がリンクされない

1. ブランチ名に Issue ID が含まれているか確認
2. PR タイトル/説明に Issue ID を追加
3. Linear の Integration 設定を確認

### ステータスが更新されない

1. GitHub App の権限を確認
2. Team の Git automation 設定を確認
3. Linear の Webhook が有効か確認

### 権限エラー

1. GitHub App を再インストール
2. リポジトリへのアクセス権限を確認
3. Linear のワークスペース権限を確認

## 高度な設定

### カスタムワークフロー

```yaml
# .github/linear.yml
# Linear 固有の設定（存在する場合）
statuses:
  opened: "In Progress"
  merged: "Done"
  closed: "Cancelled"
```

### GitHub Actions との連携

```yaml
# .github/workflows/linear-update.yml
name: Update Linear Issue
on:
  pull_request:
    types: [opened, closed]

jobs:
  update:
    runs-on: ubuntu-latest
    steps:
      - name: Update Linear
        uses: linear-app/action@v1
        with:
          api-key: ${{ secrets.LINEAR_API_KEY }}
          issue-id: ${{ github.event.pull_request.head.ref }}
          status: ${{ github.event.action }}
```

## 参考リンク

- [Linear Docs - GitHub Integration](https://linear.app/docs/github)
- [Linear API Documentation](https://developers.linear.app)
- [GitHub Apps Documentation](https://docs.github.com/en/apps)

---

このガイドは汎用的な内容です。チーム固有の設定やワークフローに合わせてカスタマイズしてください。