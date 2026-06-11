-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Post" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "excerpt" TEXT NOT NULL DEFAULT '',
    "body" TEXT NOT NULL DEFAULT '',
    "coverEmoji" TEXT NOT NULL DEFAULT '🌿',
    "gradient" TEXT NOT NULL DEFAULT 'gradient-purple',
    "author" TEXT NOT NULL DEFAULT 'Eco Global Foods',
    "type" TEXT NOT NULL DEFAULT 'blog',
    "category" TEXT NOT NULL DEFAULT 'Wellness',
    "status" TEXT NOT NULL DEFAULT 'published',
    "readMinutes" INTEGER NOT NULL DEFAULT 4,
    "seoTitle" TEXT NOT NULL DEFAULT '',
    "seoDescription" TEXT NOT NULL DEFAULT '',
    "seoKeywords" TEXT NOT NULL DEFAULT '',
    "publishedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Post" ("author", "body", "category", "coverEmoji", "createdAt", "excerpt", "gradient", "id", "publishedAt", "readMinutes", "seoDescription", "seoKeywords", "seoTitle", "slug", "status", "title", "updatedAt") SELECT "author", "body", "category", "coverEmoji", "createdAt", "excerpt", "gradient", "id", "publishedAt", "readMinutes", "seoDescription", "seoKeywords", "seoTitle", "slug", "status", "title", "updatedAt" FROM "Post";
DROP TABLE "Post";
ALTER TABLE "new_Post" RENAME TO "Post";
CREATE UNIQUE INDEX "Post_slug_key" ON "Post"("slug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
