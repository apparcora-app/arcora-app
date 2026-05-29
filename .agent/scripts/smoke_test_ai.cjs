const { pipeline } = require('@huggingface/transformers');

async function testClassification() {
    console.log('--- ModernBERT Smoke Test ---');
    console.log('Loading model (this might take a few moments)...');
    
    try {
        const classifier = await pipeline('zero-shot-classification', 'onnx-community/ModernBERT-base-nli-ONNX');
        
        const testText = "Faisalabad Electric Supply Company (FESCO). Consumer No: 1234567. Bill Month: April 2026. Total Amount Due: 15,400 PKR.";
        const labels = ["utility bill", "tax document", "identity document", "invoice"];
        
        console.log('Classifying sample text...');
        const result = await classifier(testText, labels);
        
        console.log('\n--- RESULTS ---');
        console.log('Top Label:', result.labels[0]);
        console.log('Confidence:', (result.scores[0] * 100).toFixed(2) + '%');
        
        if (result.labels[0] === 'utility bill') {
            console.log('\n✅ SUCCESS: The AI brain is working perfectly!');
        } else {
            console.log('\n❌ ERROR: Unexpected classification result.');
        }
    } catch (err) {
        console.error('\n❌ ERROR: Model failed to load or run:', err.message);
    }
}

testClassification();
