"""PDF Generation Service for Daily Complaint Reports"""

from reportlab.lib.pagesizes import letter, A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, PageBreak, Image
from reportlab.lib.units import inch
from datetime import datetime
import io


def generate_daily_report_pdf(report_data: dict) -> bytes:
    """
    Generate daily complaint report as PDF
    
    Args:
        report_data: Dictionary containing report information with structure:
        {
            'reportDate': str,
            'totalComplaintsReceived': int,
            'statusBreakdown': dict,
            'severityBreakdown': dict,
            'kpis': dict,
            'escalatedComplaints': list,
            'detailedComplaints': list,
            'staffAssignments': dict,
            'preparedBy': str,
            'department': str
        }
        
    Returns:
        bytes: PDF file content
    """
    
    # Create PDF buffer
    buffer = io.BytesIO()
    
    # Create PDF document with landscape orientation for tables
    doc = SimpleDocTemplate(buffer, pagesize=A4, topMargin=0.5*inch, bottomMargin=0.5*inch, leftMargin=0.5*inch, rightMargin=0.5*inch)
    
    # Container for PDF elements
    elements = []
    
    # Define styles
    styles = getSampleStyleSheet()
    
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=18,
        textColor=colors.HexColor('#1a1a1a'),
        spaceAfter=6,
        alignment=1,
        fontName='Helvetica-Bold'
    )
    
    subtitle_style = ParagraphStyle(
        'CustomSubtitle',
        parent=styles['Heading2'],
        fontSize=12,
        textColor=colors.HexColor('#333333'),
        spaceAfter=12,
        alignment=1,
        fontName='Helvetica'
    )
    
    section_heading_style = ParagraphStyle(
        'SectionHeading',
        parent=styles['Heading2'],
        fontSize=12,
        textColor=colors.HexColor('#ffffff'),
        spaceAfter=6,
        spaceBefore=6,
        fontName='Helvetica-Bold',
        backColor=colors.HexColor('#2c5282')
    )
    
    heading_style = ParagraphStyle(
        'CustomHeading',
        parent=styles['Heading3'],
        fontSize=10,
        textColor=colors.HexColor('#1a1a1a'),
        spaceAfter=6,
        spaceBefore=6,
        fontName='Helvetica-Bold'
    )
    
    normal_style = ParagraphStyle(
        'CustomBody',
        parent=styles['BodyText'],
        fontSize=9,
        textColor=colors.HexColor('#000000'),
        spaceAfter=4,
        fontName='Helvetica'
    )
    
    small_style = ParagraphStyle(
        'Small',
        parent=styles['BodyText'],
        fontSize=8,
        textColor=colors.HexColor('#666666'),
        spaceAfter=2,
        fontName='Helvetica'
    )
    
    # Extract data with defaults
    report_date = report_data.get('reportDate', 'Not Provided')
    total_complaints = report_data.get('totalComplaintsReceived', 0)
    status_breakdown = report_data.get('statusBreakdown', {})
    severity_breakdown = report_data.get('severityBreakdown', {})
    kpis = report_data.get('kpis', {})
    escalated_complaints = report_data.get('escalatedComplaints', [])
    detailed_complaints = report_data.get('detailedComplaints', [])
    staff_assignments = report_data.get('staffAssignments', {})
    prepared_by = report_data.get('preparedBy', 'System Generated')
    department = report_data.get('department', 'Concerned Department')
    
    # ===== HEADER SECTION =====
    elements.append(Paragraph("DAILY COMPLAINT REPORT", title_style))
    elements.append(Spacer(1, 0.1*inch))
    
    # Header details table
    header_data = [
        [
            Paragraph(f"<b>Report Date:</b> {report_date}", normal_style),
            Paragraph(f"<b>Department:</b> {department}", normal_style)
        ],
        [
            Paragraph(f"<b>Prepared By:</b> {prepared_by}", normal_style),
            Paragraph(f"<b>Generated:</b> {datetime.now().strftime('%d-%m-%Y %H:%M:%S')}", normal_style)
        ]
    ]
    
    header_table = Table(header_data, colWidths=[3.25*inch, 3.25*inch])
    header_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('LEFTPADDING', (0, 0), (-1, -1), 4),
        ('RIGHTPADDING', (0, 0), (-1, -1), 4),
        ('TOPPADDING', (0, 0), (-1, -1), 2),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey)
    ]))
    elements.append(header_table)
    elements.append(Spacer(1, 0.2*inch))
    
    # ===== EXECUTIVE SUMMARY SECTION =====
    elements.append(Paragraph("1. EXECUTIVE SUMMARY", section_heading_style))
    elements.append(Spacer(1, 0.1*inch))
    
    summary_data = [
        [Paragraph("<b>Total Complaints Received:</b>", normal_style), Paragraph(f"<b>{total_complaints}</b>", normal_style)],
    ]
    
    summary_table = Table(summary_data, colWidths=[4*inch, 2.5*inch])
    summary_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('LEFTPADDING', (0, 0), (-1, -1), 4),
        ('RIGHTPADDING', (0, 0), (-1, -1), 4),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ('BACKGROUND', (1, 0), (1, 0), colors.HexColor('#e8f4f8')),
        ('BORDER', (0, 0), (-1, -1), 0.5, colors.HexColor('#cccccc'))
    ]))
    elements.append(summary_table)
    elements.append(Spacer(1, 0.15*inch))
    
    # ===== COMPLAINTS BY STATUS =====
    elements.append(Paragraph("2. COMPLAINTS BY STATUS", section_heading_style))
    elements.append(Spacer(1, 0.1*inch))
    
    status_data = [['Status', 'Count']]
    for status, count in status_breakdown.items():
        status_data.append([status.replace('_', ' ').title(), str(count)])
    
    status_table = Table(status_data, colWidths=[3*inch, 2*inch])
    status_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#2c5282')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 5),
        ('TOPPADDING', (0, 0), (-1, 0), 5),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f0f0f0')])
    ]))
    elements.append(status_table)
    elements.append(Spacer(1, 0.15*inch))
    
    # ===== COMPLAINTS BY SEVERITY =====
    elements.append(Paragraph("3. COMPLAINTS BY SEVERITY", section_heading_style))
    elements.append(Spacer(1, 0.1*inch))
    
    severity_data = [['Severity', 'Count']]
    for severity, count in severity_breakdown.items():
        severity_data.append([severity.title(), str(count)])
    
    severity_table = Table(severity_data, colWidths=[3*inch, 2*inch])
    severity_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#2c5282')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 5),
        ('TOPPADDING', (0, 0), (-1, 0), 5),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f0f0f0')])
    ]))
    elements.append(severity_table)
    elements.append(Spacer(1, 0.15*inch))
    
    # ===== KEY PERFORMANCE INDICATORS =====
    elements.append(Paragraph("4. KEY PERFORMANCE INDICATORS (KPIs)", section_heading_style))
    elements.append(Spacer(1, 0.1*inch))
    
    kpi_data = [
        ['KPI', 'Value'],
        ['Average Resolution Time', f"{kpis.get('averageResolutionTime', 0)} days"],
        ['Total Resolved', str(kpis.get('totalResolved', 0))],
        ['SLA Compliance Rate', f"{kpis.get('slaComplianceRate', 0)}%"],
    ]
    
    kpi_table = Table(kpi_data, colWidths=[3*inch, 2*inch])
    kpi_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#2c5282')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 5),
        ('TOPPADDING', (0, 0), (-1, 0), 5),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f0f0f0')])
    ]))
    elements.append(kpi_table)
    elements.append(Spacer(1, 0.15*inch))
    
    # ===== ESCALATED/HIGH PRIORITY ISSUES =====
    if escalated_complaints:
        elements.append(PageBreak())
        elements.append(Paragraph("5. HIGH-PRIORITY / ESCALATED ISSUES", section_heading_style))
        elements.append(Spacer(1, 0.1*inch))
        
        escalated_data = [['Complaint ID', 'Title', 'Priority', 'Status']]
        
        for complaint in escalated_complaints[:10]:  # Limit to 10
            complaint_id = complaint.get('id', 'N/A')[:8]  # Shorten UUID
            title = complaint.get('title', 'N/A')[:30]
            priority = complaint.get('priority', 'N/A').title()
            status = complaint.get('status', 'N/A').replace('_', ' ').title()
            
            escalated_data.append([
                Paragraph(complaint_id, small_style),
                Paragraph(title, small_style),
                Paragraph(priority, small_style),
                Paragraph(status, small_style)
            ])
        
        escalated_table = Table(escalated_data, colWidths=[1.5*inch, 2.5*inch, 0.9*inch, 1.1*inch])
        escalated_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#c41e3a')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 8),
            ('LEFTPADDING', (0, 0), (-1, -1), 3),
            ('RIGHTPADDING', (0, 0), (-1, -1), 3),
            ('TOPPADDING', (0, 0), (-1, -1), 3),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f0f0f0')])
        ]))
        elements.append(escalated_table)
        elements.append(Spacer(1, 0.15*inch))
    
    # ===== DETAILED COMPLAINT LOG =====
    if detailed_complaints:
        elements.append(PageBreak())
        elements.append(Paragraph("6. DETAILED COMPLAINT LOG", section_heading_style))
        elements.append(Spacer(1, 0.1*inch))
        
        # Create detailed complaints table
        complaint_data = [
            ['ID', 'Title', 'Category', 'Status', 'Priority', 'Assigned To']
        ]
        
        for complaint in detailed_complaints[:20]:  # Limit to first 20 for readability
            complaint_id = complaint.get('id', 'N/A')[:8]
            title = complaint.get('title', 'N/A')[:20]
            category = complaint.get('category', 'N/A').replace('_', ' ').title()[:15]
            status = complaint.get('status', 'N/A').replace('_', ' ').title()
            priority = complaint.get('priority', 'N/A').title()
            assigned_to = complaint.get('assignedTo', 'Unassigned')[:20]
            
            complaint_data.append([
                Paragraph(complaint_id, small_style),
                Paragraph(title, small_style),
                Paragraph(category, small_style),
                Paragraph(status, small_style),
                Paragraph(priority, small_style),
                Paragraph(assigned_to, small_style)
            ])
        
        complaint_table = Table(complaint_data, colWidths=[0.9*inch, 1.4*inch, 1.2*inch, 0.9*inch, 0.8*inch, 1.2*inch])
        complaint_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#2c5282')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 7),
            ('LEFTPADDING', (0, 0), (-1, -1), 2),
            ('RIGHTPADDING', (0, 0), (-1, -1), 2),
            ('TOPPADDING', (0, 0), (-1, -1), 2),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 2),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f0f0f0')])
        ]))
        elements.append(complaint_table)
        elements.append(Spacer(1, 0.1*inch))
        
        elements.append(Paragraph(f"<i>Showing {min(20, len(detailed_complaints))} of {len(detailed_complaints)} complaints</i>", small_style))
    
    # ===== FOOTER =====
    elements.append(Spacer(1, 0.2*inch))
    elements.append(Paragraph("_______________________________________________________________________________", small_style))
    footer_text = f"Report generated on {datetime.now().strftime('%d-%m-%Y at %H:%M:%S')} | This is a system-generated report"
    elements.append(Paragraph(footer_text, small_style))
    
    # Build PDF
    doc.build(elements)
    
    # Get PDF content
    pdf_content = buffer.getvalue()
    buffer.close()
    
    return pdf_content
