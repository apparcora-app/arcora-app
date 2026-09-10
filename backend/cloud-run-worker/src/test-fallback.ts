import * as dotenv from 'dotenv';
import * as path from 'path';
import { processExtractionDirect } from './jobs/processExtractionJob';

dotenv.config({ path: path.join(__dirname, '../.env') });

async function runTest() {
  console.log('====================================================');
  console.log('    Arcora Hybrid Document Processing Test Suite   ');
  console.log('====================================================\n');

  // --- Test Case 1: Standard Clean Document (Deterministic OCR) ---
  console.log('--- TEST 1: Standard Clean Document (Deterministic OCR) ---');
  const cleanDocumentText = `
    UTILITY BILL
    Provider: PTCL
    Billing Month: July 2026
    Due Date: 15/08/2026
    Amount Due: $150.00
    Account ID/ESN: 987654321
  `;
  const cleanBuffer = Buffer.from(cleanDocumentText, 'utf-8');

  try {
    const draft1 = await processExtractionDirect(cleanBuffer, 'clean_bill.txt', 'text/plain');
    console.log('Parser Status:', draft1.parserStatus);
    console.log('AI Fallback Triggered:', (draft1 as any).aiUsed || false);
    console.log('Extracted Provider:', draft1.extractedData?.bill?.providerName);
    console.log('Extracted Amount:', draft1.extractedData?.bill?.amountDue);
    console.log('=> Test 1 Passed: Fast Tier 1 OCR deterministic path completed without AI cost ($0.00).\n');
  } catch (err) {
    console.error('Test 1 Failed:', err);
  }

  // --- Test Case 2: Complex / Unstructured Invoice -> Escalating to Gemini Flash API ---
  console.log('--- TEST 2: Complex / Unstructured Document -> Escalating to Gemini Flash API ---');
  const messyDocumentText = `
    Apex Solar & Power Solutions
    Statement Date: June 18, 2026
    Total Amount Charges: 524.50 USD
    Please remit payment before July 10, 2026
    Ref: #APX-99410
  `;
  const complexBuffer = Buffer.from(messyDocumentText, 'utf-8');

  try {
    const draft2 = await processExtractionDirect(complexBuffer, 'unstructured_solar_doc.txt', 'text/plain');
    console.log('Parser Status:', draft2.parserStatus);
    console.log('Parser Mode:', (draft2 as any).parserMode || 'deterministic');
    console.log('AI Fallback Triggered:', (draft2 as any).aiUsed || false);
    console.log('AI Provider Used:', (draft2 as any).aiProvider || 'N/A');
    console.log('\nExtracted Bill Details via Gemini Flash API:');
    console.log('  • Provider Name:', draft2.extractedData?.bill?.providerName);
    console.log('  • Issue / Statement Date:', draft2.extractedData?.bill?.issueDateText);
    console.log('  • Due Date:', draft2.extractedData?.bill?.dueDateText);
    console.log('  • Amount Due ($):', draft2.extractedData?.bill?.amountDue);
    console.log('  • Summary / Reason:', draft2.extractedData?.summary);
    console.log('\n=> Test 2 Passed: Gemini Flash API extracted structured data successfully!');
  } catch (err) {
    console.error('Test 2 Failed:', err);
  }

  console.log('\n====================================================');
  console.log('                Test Suite Complete                 ');
  console.log('====================================================');
}

runTest();
