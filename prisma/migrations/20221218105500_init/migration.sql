-- CreateEnum
CREATE TYPE "TodoListItemState" AS ENUM ('ACTIVE', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "firstName" VARCHAR(50),
    "lastName" VARCHAR(50),
    "email" VARCHAR(70) NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "todo_lists" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "todo_lists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "todo_list_users" (
    "userId" INTEGER NOT NULL,
    "todoListId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "todo_list_users_pkey" PRIMARY KEY ("userId","todoListId")
);

-- CreateTable
CREATE TABLE "todo_list_items" (
    "id" SERIAL NOT NULL,
    "todoListId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "title" VARCHAR(100) NOT NULL,
    "description" TEXT NOT NULL,
    "deadline" TIMESTAMP(3) NOT NULL,
    "state" "TodoListItemState" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "todo_list_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- AddForeignKey
ALTER TABLE "todo_list_users" ADD CONSTRAINT "todo_list_users_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "todo_list_users" ADD CONSTRAINT "todo_list_users_todoListId_fkey" FOREIGN KEY ("todoListId") REFERENCES "todo_lists"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "todo_list_items" ADD CONSTRAINT "todo_list_items_todoListId_fkey" FOREIGN KEY ("todoListId") REFERENCES "todo_lists"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "todo_list_items" ADD CONSTRAINT "todo_list_items_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
