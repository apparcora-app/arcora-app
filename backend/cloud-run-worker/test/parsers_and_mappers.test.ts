import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { runDeterministicParser } from '../src/parsers/deterministicParser';
import { mergeAiIntoDraft } from '../src/mappers/uploadDraftMapper';
import type { UploadDraft } from '../src/types';
import type { AiExtractionResult } from '../src/ai/openaiExtractor';

describe('Cloud Run Worker: Deterministic Parser', () => {
  it('handles empty extracted text safely with needs_review status', () => {
    const result = runDeterministicParser('', 'blank.pdf');
    assert.equal(result.parserStatus, 'partial');
    assert.equal(result.reviewStatus, 'needs_review');
    assert.ok(result.extractedData?.summary?.includes('Parser placeholder'));
  });

  it('normalizes known OCR errors and formatting anomalies', () => {
    const rawOcr = `
      Piston Taecommunicaton Bill
      ReceiptNo 987654
      AmountDue Rs. 4,500.00
      DueDate 15-Nov-2026
      BillingMonth October 2026
      Netlix subscription
    `;
    const result = runDeterministicParser(rawOcr, 'ptcl_bill.pdf');
    assert.ok(result.extractedText);
    assert.ok(result.extractedText.includes('Pakistan Telecommunication'));
    assert.ok(result.extractedText.includes('Receipt No'));
    assert.ok(result.extractedText.includes('Amount Due'));
    assert.ok(result.extractedText.includes('Due Date'));
    assert.ok(result.extractedText.includes('Billing Month'));
    assert.ok(result.extractedText.includes('Netflix'));
  });

  it('derives titles and extracts summaries properly', () => {
    const sampleText = 'Electric Utility Invoice 2026. Account number 12345. Total charge $120.50.';
    const result = runDeterministicParser(sampleText, 'electric_bill.pdf');
    assert.ok(result.title);
    assert.ok(result.extractedData?.summary);
  });
});

describe('Cloud Run Worker: Upload Draft AI Mapper', () => {
  const baseDraft: UploadDraft = {
    title: 'Utility Statement',
    type: 'bill',
    section: 'bills',
    classificationConfidence: 0.72,
    parserStatus: 'partial',
    reviewStatus: 'needs_review',
    extractedText: 'Initial OCR raw text',
    detectedDates: [],
    tags: ['utility'],
    extractedData: {
      summary: 'Initial deterministic summary',
      bill: {
        providerName: undefined,
        billingMonth: undefined,
        amountDue: undefined,
      },
      rawFields: {},
    },
  };

  it('merges missing AI fields into draft and records provenance', () => {
    const aiResult: AiExtractionResult = {
      providerName: 'National Electric Power',
      billingMonth: 'October 2026',
      issueDateText: '2026-10-01',
      dueDateText: '2026-10-25',
      amountDue: 245.5,
      lateAmount: 260.0,
      confidence: 0.95,
      reason: 'High-confidence invoice header and summary table match',
    };

    const merged = mergeAiIntoDraft(baseDraft, aiResult);

    assert.equal(merged.extractedData.bill?.providerName, 'National Electric Power');
    assert.equal(merged.extractedData.bill?.billingMonth, 'October 2026');
    assert.equal(merged.extractedData.bill?.amountDue, 245.5);
    assert.equal(merged.classificationConfidence, 0.95);
    assert.equal(merged.extractedData.rawFields?.['backend:aiUsed'], 'true');
    assert.equal(merged.extractedData.rawFields?.['backend:confidence'], '0.950');
    assert.equal(merged.extractedData.rawFields?.['backend:reason'], 'High-confidence invoice header and summary table match');
  });

  it('does not overwrite existing verified values in bill', () => {
    const draftWithExisting: UploadDraft = {
      ...baseDraft,
      extractedData: {
        ...baseDraft.extractedData,
        bill: {
          providerName: 'Existing Provider Corp',
          amountDue: 100,
        },
      },
    };

    const aiResult: AiExtractionResult = {
      providerName: 'AI Overwrite Candidate',
      amountDue: 999,
      confidence: 0.98,
      reason: 'AI rerun',
    };

    const merged = mergeAiIntoDraft(draftWithExisting, aiResult);
    assert.equal(merged.extractedData.bill?.providerName, 'Existing Provider Corp');
    assert.equal(merged.extractedData.bill?.amountDue, 100);
  });
});
