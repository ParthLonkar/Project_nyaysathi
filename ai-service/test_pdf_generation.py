#!/usr/bin/env python3
"""Test RTI and Complaint PDF generation"""

from app.services.pdf_generator import generate_rti_pdf, generate_complaint_draft_pdf
import os

# Sample complaint data
complaint_data = {
    "complaint_id": "MC-2024-001",
    "title": "Noise Pollution in Residential Area",
    "description": "I am writing to lodge a formal complaint regarding excessive noise pollution in my residential area. For the past three months, there has been continuous construction work happening during restricted hours (6 PM to 6 AM), causing severe disturbance to residents. The construction machinery operates without proper noise barriers or soundproofing measures. This has caused health issues including sleep deprivation and stress-related ailments for my family. Despite multiple complaints to the local authorities, no action has been taken. I request immediate intervention and imposition of hefty fines on the construction company for violation of environmental regulations.",
    "customer_name": "John Doe",
    "email": "john.doe@example.com",
    "phone": "+91-9999999999",
    "location": "Delhi, India",
    "address": "123 Main Street, Delhi - 110001",
    "aadhaar": "XXXX-XXXX-XXXX-1234",
    "department": "Municipal Grievance Cell"
}

complaint_draft = """Subject: Complaint regarding civic issue in my residential area

To: Municipal Grievance Cell

Complaint Details:
I am writing to lodge a formal complaint regarding excessive noise pollution in my residential area. For the past three months, there has been continuous construction work happening during restricted hours causing severe disturbance to residents. The construction machinery operates without proper noise barriers. This has caused health issues including sleep deprivation and stress-related ailments for my family. Despite multiple complaints to the local authorities, no action has been taken. I request immediate intervention.

Requested Action:
Please investigate this issue, take corrective action at the earliest, and provide a written status update.

Yours faithfully,
John Doe"""

print("=" * 80)
print("Testing PDF Generation")
print("=" * 80)

try:
    # Generate RTI PDF
    print("\n📄 Generating RTI PDF...")
    rti_pdf = generate_rti_pdf(complaint_data)
    print(f"✅ RTI PDF generated: {len(rti_pdf)} bytes")
    
    # Save RTI PDF
    rti_filename = f"RTI_Application_{complaint_data['complaint_id']}.pdf"
    with open(rti_filename, 'wb') as f:
        f.write(rti_pdf)
    print(f"💾 Saved to: {os.path.abspath(rti_filename)}")
    
    # Generate Complaint PDF
    print("\n📄 Generating Complaint Draft PDF...")
    complaint_pdf = generate_complaint_draft_pdf(complaint_data, complaint_draft)
    print(f"✅ Complaint PDF generated: {len(complaint_pdf)} bytes")
    
    # Save Complaint PDF
    complaint_filename = f"Complaint_Draft_{complaint_data['complaint_id']}.pdf"
    with open(complaint_filename, 'wb') as f:
        f.write(complaint_pdf)
    print(f"💾 Saved to: {os.path.abspath(complaint_filename)}")
    
    print("\n✅ PDF Generation Test Completed Successfully!")
    print("\nGenerated Files:")
    print(f"  1. {rti_filename}")
    print(f"  2. {complaint_filename}")
    
except Exception as e:
    print(f"❌ Error generating PDFs: {e}")
    import traceback
    traceback.print_exc()
