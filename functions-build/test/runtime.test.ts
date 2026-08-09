import { describe, expect, it } from 'vitest';

describe('Functions runtime entrypoint', () => {
  it('loads every callable export with production dependencies installed', async () => {
    const runtime = await import('../src/index.js');
    expect(runtime.submitBuildRequest).toBeDefined();
    expect(runtime.verifyBuildAdmin).toBeDefined();
    expect(runtime.listBuildRequests).toBeDefined();
    expect(runtime.getBuildRequest).toBeDefined();
    expect(runtime.updateBuildRequest).toBeDefined();
    expect(runtime.deleteBuildRequest).toBeDefined();
    expect(runtime.sendAdminEmail).toBeDefined();
    expect(runtime.sendAdminSms).toBeDefined();
    expect(runtime.verifyRequesterCode).toBeDefined();
    expect(runtime.getRequesterRequest).toBeDefined();
    expect(runtime.updateRequesterPreferences).toBeDefined();
    expect(runtime.submitRequesterMessage).toBeDefined();
    expect(runtime.listRequestActivity).toBeDefined();
    expect(runtime.listRequestMessages).toBeDefined();
    expect(runtime.githubBuildWebhook).toBeDefined();
    expect(runtime.submitTestimonial).toBeDefined();
    expect(runtime.analyzeTestimonialSentiment).toBeDefined();
    expect(runtime.reanalyzeTestimonial).toBeDefined();
  }, 60_000);
});
