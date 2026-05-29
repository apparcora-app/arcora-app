# Synthetic Pakistan-Style Test Samples

These files are synthetic documents designed for safe OCR and extraction testing.

Rules for this set:
- Every file is clearly marked `SAMPLE / TEST DOCUMENT`
- No real customer, bank, utility, or telecom data is used
- Layouts are inspired by common Pakistan document patterns, but are not valid documents

## Files

### Bills
- `bills/fesco-electricity-bill-sample.svg`
  - Tests: provider, bill month, issue date, due date, reference number, consumer ID, amount due, late surcharge, payable after due date
- `bills/sngpl-gas-bill-sample.svg`
  - Tests: gas bill detection, consumer number, meter number, billing period, amount within due date, amount after due date

### Subscriptions
- `subscriptions/ptcl-broadband-invoice-sample.svg`
  - Tests: recurring invoice/subscription detection, account ID, invoice number, due date, service package, amount due
- `subscriptions/ufone-postpaid-bill-sample.svg`
  - Tests: mobile postpaid billing, account ID, bill number, bill date, due date, amount payable

### Warranties
- `warranties/appliance-warranty-card-sample.svg`
  - Tests: warranty title extraction, product details, serial number, purchase date, warranty periods

### Documents
- `documents/account-maintenance-certificate-sample.svg`
  - Tests: title extraction, certificate classification, bank/account fields, issue date, reference number
- `documents/salary-slip-sample.svg`
  - Tests: salary slip classification, employee details, pay period, earnings, deductions, net pay

## Suggested usage

1. Open each file in a browser and export to PDF if you want PDF-style testing.
2. Upload the SVG directly if your current flow accepts image-like formats.
3. Take screenshots from the SVG if you want camera-photo style OCR testing.

## Next upgrade if you want

I can also create:
- a K-Electric style synthetic bill
- a bank statement sample
- a warranty booklet first page
- a NADRA-style family certificate sample
- camera-photo versions with perspective and noise for tougher OCR tests
