-- CreateTable
CREATE TABLE "Store" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "owner" TEXT,
    "type" TEXT,
    "grade" TEXT,
    "phone" TEXT,
    "location" TEXT,
    "products" TEXT,
    "quantity" TEXT,
    "freq" TEXT,
    "supplier" TEXT,
    "payment" TEXT,
    "paymentScore" TEXT,
    "status" TEXT NOT NULL DEFAULT 'เปิดการขาย',
    "closeReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Store_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Visit" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "sales" TEXT NOT NULL,
    "storeRef" TEXT,
    "masterId" TEXT,
    "visitCat" TEXT,
    "visitType" TEXT NOT NULL,
    "dealStatus" TEXT NOT NULL DEFAULT 'เปิดการขาย',
    "closeReason" TEXT,
    "notes" JSONB,
    "order" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Visit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Plan" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "sales" TEXT NOT NULL,
    "storeRef" TEXT,
    "masterId" TEXT,
    "visitCat" TEXT,
    "notes" TEXT,
    "order" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Plan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Forecast" (
    "id" TEXT NOT NULL,
    "masterId" TEXT NOT NULL,
    "product" TEXT NOT NULL,
    "targetWeek" DOUBLE PRECISION NOT NULL,
    "targetMonth" DOUBLE PRECISION NOT NULL,
    "forecast" DOUBLE PRECISION,
    "actual" DOUBLE PRECISION,
    "notes" TEXT,
    "weekStart" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Forecast_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Store_code_key" ON "Store"("code");

-- CreateIndex
CREATE INDEX "Forecast_weekStart_idx" ON "Forecast"("weekStart");

-- CreateIndex
CREATE INDEX "Forecast_masterId_idx" ON "Forecast"("masterId");

-- AddForeignKey
ALTER TABLE "Visit" ADD CONSTRAINT "Visit_masterId_fkey" FOREIGN KEY ("masterId") REFERENCES "Store"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Plan" ADD CONSTRAINT "Plan_masterId_fkey" FOREIGN KEY ("masterId") REFERENCES "Store"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Forecast" ADD CONSTRAINT "Forecast_masterId_fkey" FOREIGN KEY ("masterId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;
