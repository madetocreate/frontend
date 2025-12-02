import { createMemoryRecordFromWriteRequest, saveMemoryRecord, searchMemoryRecords } from "../src/domain/memory/repository";
import type { MemoryWriteRequest } from "../src/domain/memory/types";

describe("memory repository", () => {
  const tenantA = "tenant_A";
  const tenantB = "tenant_B";

  beforeEach(() => {
    // No direct reset available; ensure using unique tenant IDs for isolation
  });

  it("saves and retrieves a memory record by content query", async () => {
    const writeReq: MemoryWriteRequest = {
      tenantId: tenantA,
      type: "custom",
      content: "Hello World",
      metadata: { origin: "test" }
    };
    const createdAt = new Date();
    const record = createMemoryRecordFromWriteRequest(writeReq, writeReq.content, createdAt);
    saveMemoryRecord(record);
    const results = await searchMemoryRecords({ tenantId: tenantA, query: "Hello", limit: 10 });
    expect(results.length).toBeGreaterThan(0);
    const found = results.find(r => r.id === record.id);
    expect(found).toBeTruthy();
    expect(found?.content).toContain("Hello World");
    expect(found?.tenantId).toBe(tenantA);
  });

  it("does not return records of other tenants", async () => {
    const reqA: MemoryWriteRequest = { tenantId: tenantA, type: "email", content: "Tenant A secret" };
    const reqB: MemoryWriteRequest = { tenantId: tenantB, type: "email", content: "Tenant B secret" };
    const recA = createMemoryRecordFromWriteRequest(reqA, reqA.content, new Date());
    const recB = createMemoryRecordFromWriteRequest(reqB, reqB.content, new Date());
    saveMemoryRecord(recA);
    saveMemoryRecord(recB);
    const resultsA = await searchMemoryRecords({ tenantId: tenantA, query: "secret", limit: 10 });
    expect(resultsA.every(r => r.tenantId === tenantA)).toBe(true);
    expect(resultsA.find(r => r.id === recB.id)).toBeUndefined();
  });

  it("filters by record type if specified", async () => {
    const req1: MemoryWriteRequest = { tenantId: tenantA, type: "dm", content: "Direct message content" };
    const req2: MemoryWriteRequest = { tenantId: tenantA, type: "review", content: "Review content" };
    const rec1 = createMemoryRecordFromWriteRequest(req1, req1.content, new Date());
    const rec2 = createMemoryRecordFromWriteRequest(req2, req2.content, new Date());
    saveMemoryRecord(rec1);
    saveMemoryRecord(rec2);
    const dmResults = await searchMemoryRecords({ tenantId: tenantA, type: "dm", query: "" });
    expect(dmResults.some(r => r.id === rec1.id)).toBe(true);
    expect(dmResults.some(r => r.type !== "dm")).toBe(false);
  });

  it("excludes records marked deleted or suppressed", async () => {
    const req: MemoryWriteRequest = {
      tenantId: tenantA,
      type: "custom",
      content: "Should be deleted",
      metadata: { status: "deleted" }
    };
    const record = createMemoryRecordFromWriteRequest(req, req.content, new Date());
    saveMemoryRecord(record);
    const results = await searchMemoryRecords({ tenantId: tenantA, query: "Should be deleted", limit: 5 });
    expect(results.find(r => r.id === record.id)).toBeUndefined();
  });

  it("excludes expired records based on TTL", async () => {
    const pastDate = new Date(Date.now() - 60 * 1000);
    const req: MemoryWriteRequest = {
      tenantId: tenantA,
      type: "custom",
      content: "Expiring content",
      metadata: { ttlSeconds: 30 }
    };
    const record = createMemoryRecordFromWriteRequest(req, req.content, pastDate);
    saveMemoryRecord(record);
    const results = await searchMemoryRecords({ tenantId: tenantA, query: "Expiring content", limit: 5 });
    expect(results.find(r => r.id === record.id)).toBeUndefined();
  });
});
