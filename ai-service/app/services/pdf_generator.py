"""PDF Generation Service for RTI Forms"""

from reportlab.lib.pagesizes import letter, A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, PageBreak
from reportlab.lib.units import inch
from datetime import datetime
import io


def generate_rti_pdf(complaint_data: dict) -> bytes:
    """
    Generate RTI application form as PDF based on RTI Act - 2005
    
    Args:
        complaint_data: Dictionary containing complaint information
        
    Returns:
        bytes: PDF file content
    """
    
    # Create PDF buffer
    buffer = io.BytesIO()
    
    # Create PDF document
    doc = SimpleDocTemplate(buffer, pagesize=A4, topMargin=0.5*inch, bottomMargin=0.5*inch)
    
    # Container for PDF elements
    elements = []
    
    # Define styles
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=14,
        textColor=colors.HexColor('#1a1a1a'),
        spaceAfter=12,
        alignment=1,
        fontName='Helvetica-Bold'
    )
    
    heading_style = ParagraphStyle(
        'CustomHeading',
        parent=styles['Heading2'],
        fontSize=11,
        textColor=colors.HexColor('#1a1a1a'),
        spaceAfter=6,
        spaceBefore=6,
        alignment=2,
        fontName='Helvetica-Bold'
    )
    
    normal_style = ParagraphStyle(
        'CustomBody',
        parent=styles['BodyText'],
        fontSize=10,
        textColor=colors.HexColor('#000000'),
        spaceAfter=4,
        fontName='Helvetica'
    )
    
    # Extract data with defaults
    applicant_name = complaint_data.get('customer_name', 'Not Provided')
    applicant_address = complaint_data.get('address', 'Not Provided')
    applicant_email = complaint_data.get('email', 'Not Provided')
    applicant_phone = complaint_data.get('phone', 'Not Provided')
    applicant_aadhaar = complaint_data.get('aadhaar', 'Not Provided')
    
    department = complaint_data.get('department', 'Concerned Department')
    location = complaint_data.get('location', 'Not Provided')
    complaint_title = complaint_data.get('title', 'Citizen Complaint')
    complaint_description = complaint_data.get('description', 'Not Provided')
    complaint_id = complaint_data.get('complaint_id', 'Not Assigned')
    
    # Title
    elements.append(Paragraph("RTI application", title_style))
    elements.append(Spacer(1, 0.15*inch))
    
    # Date and complaint ID on right
    date_text = f"<b>Date:</b> {datetime.now().strftime('%d-%m-%Y')}<br/><b>Complaint ID:</b> #{complaint_id}"
    elements.append(Paragraph(date_text, normal_style))
    elements.append(Spacer(1, 0.2*inch))
    
    # FROM SECTION
    elements.append(Paragraph("<b>From</b>", heading_style))
    from_data = [
        ['Applicant\'s name', applicant_name],
        ['Address', applicant_address],
        ['Email, Mobile', f'{applicant_email}, {applicant_phone}'],
        ['Aadhaar no', applicant_aadhaar]
    ]
    
    from_table = Table(from_data, colWidths=[1.5*inch, 4*inch])
    from_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    elements.append(from_table)
    elements.append(Spacer(1, 0.2*inch))
    
    # TO SECTION
    elements.append(Paragraph("<b>To</b>", heading_style))
    to_data = [
        ['The Public Information Officer'],
        [department],
        [location]
    ]
    
    to_table = Table(to_data, colWidths=[5.5*inch])
    to_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    elements.append(to_table)
    elements.append(Spacer(1, 0.2*inch))
    
    # SUBJECT
    subject_text = f"<b>Sub: Requesting to furnish information about {complaint_title} u/s 6(1) of RTI act.</b>"
    elements.append(Paragraph(subject_text, normal_style))
    elements.append(Spacer(1, 0.15*inch))
    
    # REQUEST DETAILS
    request_text = "Kindly supply the certified copies in the format convenient to you from the date of complaint filed:"
    elements.append(Paragraph(request_text, normal_style))
    elements.append(Spacer(1, 0.1*inch))
    
    # QUESTIONS
    questions = [
        f"1. Action Taken Report (ATR) on the complaint described in complaint ID {complaint_id}",
        "2. Name and designation of the officer(s) responsible for handling this complaint",
        "3. Expected timeline for resolution and final status",
        "4. Details of all communications sent/received regarding this complaint",
        "5. Reason(s) for any delay in addressing this complaint, if applicable",
        "6. Cost estimate for obtaining the certified copies"
    ]
    
    questions_text = "<br/>".join(q for q in questions)
    elements.append(Paragraph(questions_text, normal_style))
    elements.append(Spacer(1, 0.15*inch))
    
    # COMPLAINT CONTEXT
    elements.append(Paragraph("<b>Complaint Context:</b>", heading_style))
    context_text = f"{complaint_description[:500]}..." if len(complaint_description) > 500 else complaint_description
    elements.append(Paragraph(context_text, normal_style))
    elements.append(Spacer(1, 0.15*inch))
    
    # FORWARDING CLAUSE
    forward_text = "If the above asked information is not available in your office, kindly forward my application to the concerned public authority, as per 6(3) of RTI act -2005"
    elements.append(Paragraph(forward_text, normal_style))
    elements.append(Spacer(1, 0.3*inch))
    
    # SIGNATURE
    elements.append(Paragraph(f"<b>Applicant's Name:</b> {applicant_name}", normal_style))
    elements.append(Spacer(1, 0.08*inch))
    elements.append(Paragraph("<b>Signature:</b> _______________________", normal_style))
    elements.append(Spacer(1, 0.1*inch))
    elements.append(Paragraph("Date: _______________________", normal_style))
    
    # FOOTER
    elements.append(Spacer(1, 0.2*inch))
    footer_text = "<i>This RTI form is auto-generated by NyaySathi and may be printed and submitted to the Public Information Officer. Please retain a copy for your records.</i>"
    footer_style = ParagraphStyle(
        'Footer',
        parent=styles['BodyText'],
        fontSize=8,
        textColor=colors.HexColor('#666666'),
        alignment=1
    )
    elements.append(Paragraph(footer_text, footer_style))
    
    # Build PDF
    doc.build(elements)
    
    # Get PDF bytes
    buffer.seek(0)
    return buffer.getvalue()


def generate_complaint_draft_pdf(complaint_data: dict, complaint_draft: str) -> bytes:
    """
    Generate Complaint Draft as PDF
    
    Args:
        complaint_data: Dictionary containing complaint information
        complaint_draft: The complaint draft text
        
    Returns:
        bytes: PDF file content
    """
    
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, topMargin=0.5*inch, bottomMargin=0.5*inch)
    
    elements = []
    
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=14,
        textColor=colors.HexColor('#1a1a1a'),
        spaceAfter=12,
        alignment=0,
        fontName='Helvetica-Bold'
    )
    
    normal_style = ParagraphStyle(
        'CustomBody',
        parent=styles['BodyText'],
        fontSize=10,
        textColor=colors.HexColor('#000000'),
        spaceAfter=6,
        fontName='Helvetica'
    )
    
    # Header
    elements.append(Paragraph("FORMAL COMPLAINT DRAFT", title_style))
    elements.append(Paragraph(f"Complaint ID: #{complaint_data.get('complaint_id', 'Not Assigned')}", normal_style))
    elements.append(Paragraph(f"Date Generated: {datetime.now().strftime('%d-%m-%Y %H:%M')}", normal_style))
    elements.append(Spacer(1, 0.2*inch))
    
    # Applicant Details
    elements.append(Paragraph("<b>Applicant Details:</b>", normal_style))
    applicant_text = f"""
    Name: {complaint_data.get('customer_name', 'Not Provided')}<br/>
    Email: {complaint_data.get('email', 'Not Provided')}<br/>
    Phone: {complaint_data.get('phone', 'Not Provided')}<br/>
    Location: {complaint_data.get('location', 'Not Provided')}
    """
    elements.append(Paragraph(applicant_text, normal_style))
    elements.append(Spacer(1, 0.15*inch))
    
    # Complaint Draft
    elements.append(Paragraph("<b>Formal Complaint:</b>", normal_style))
    elements.append(Spacer(1, 0.1*inch))
    elements.append(Paragraph(complaint_draft, normal_style))
    
    # Footer
    elements.append(Spacer(1, 0.3*inch))
    footer_text = "<i>This document is auto-generated by NyaySathi. Please review and make any necessary edits before submission.</i>"
    footer_style = ParagraphStyle(
        'Footer',
        parent=styles['BodyText'],
        fontSize=8,
        textColor=colors.HexColor('#666666'),
        alignment=1
    )
    elements.append(Paragraph(footer_text, footer_style))
    
    doc.build(elements)
    
    buffer.seek(0)
    return buffer.getvalue()
