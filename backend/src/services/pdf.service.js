import PDFDocument from 'pdfkit';
import { logger } from '../utils/logger.js';

/**
 * Generate Daily Report PDF using PDFKit
 */
export const pdfService = {
  generateDailyReportPDF: async (reportData) => {
    try {
      logger.info('Generating daily report PDF');

      return new Promise((resolve, reject) => {
        try {
          const doc = new PDFDocument({
            size: 'A4',
            margin: 40,
          });

          // Collect PDF data
          const chunks = [];
          
          doc.on('data', (chunk) => {
            chunks.push(chunk);
          });

          doc.on('end', () => {
            const pdfBuffer = Buffer.concat(chunks);
            logger.info(`PDF generated successfully, size: ${pdfBuffer.length} bytes`);
            resolve(pdfBuffer);
          });

          doc.on('error', (err) => {
            logger.error('PDF generation error:', err);
            reject(err);
          });

          // Title
          doc.fontSize(24).font('Helvetica-Bold').text('DAILY COMPLAINT REPORT', { align: 'center' });
          doc.moveDown(0.5);

          // Header Information
          doc.fontSize(10).font('Helvetica');
          doc.text(`Report Date: ${reportData.reportDate || 'N/A'}`);
          doc.text(`Department: ${reportData.department || 'Concerned Department'}`);
          doc.text(`Prepared By: ${reportData.preparedBy || 'System Generated'}`);
          doc.text(`Generated: ${new Date().toLocaleString()}`);
          doc.moveDown(1);

          // Executive Summary
          doc.fontSize(12).font('Helvetica-Bold').text('1. EXECUTIVE SUMMARY');
          doc.fontSize(10).font('Helvetica');
          doc.text(`Total Complaints Received: ${reportData.totalComplaintsReceived || 0}`);
          doc.moveDown(0.5);

          // Complaints by Status
          doc.fontSize(12).font('Helvetica-Bold').text('2. COMPLAINTS BY STATUS');
          doc.fontSize(10).font('Helvetica');
          const statusBreakdown = reportData.statusBreakdown || {};
          Object.entries(statusBreakdown).forEach(([status, count]) => {
            doc.text(`  • ${status.replace(/_/g, ' ').toUpperCase()}: ${count}`);
          });
          doc.moveDown(0.5);

          // Complaints by Severity
          doc.fontSize(12).font('Helvetica-Bold').text('3. COMPLAINTS BY SEVERITY');
          doc.fontSize(10).font('Helvetica');
          const severityBreakdown = reportData.severityBreakdown || {};
          Object.entries(severityBreakdown).forEach(([severity, count]) => {
            doc.text(`  • ${severity.toUpperCase()}: ${count}`);
          });
          doc.moveDown(0.5);

          // Key Performance Indicators
          doc.fontSize(12).font('Helvetica-Bold').text('4. KEY PERFORMANCE INDICATORS (KPIs)');
          doc.fontSize(10).font('Helvetica');
          const kpis = reportData.kpis || {};
          doc.text(`  • Average Resolution Time: ${kpis.averageResolutionTime || 0} days`);
          doc.text(`  • Total Resolved: ${kpis.totalResolved || 0}`);
          doc.text(`  • SLA Compliance Rate: ${kpis.slaComplianceRate || 0}%`);
          doc.moveDown(0.5);

          // Escalated Issues
          const escalatedComplaints = reportData.escalatedComplaints || [];
          if (escalatedComplaints.length > 0) {
            doc.fontSize(12).font('Helvetica-Bold').text('5. HIGH-PRIORITY / ESCALATED ISSUES');
            doc.fontSize(9).font('Helvetica');
            escalatedComplaints.slice(0, 10).forEach((complaint, idx) => {
              const complaintId = (complaint.id || 'N/A').substring(0, 8);
              const title = (complaint.title || 'N/A').substring(0, 40);
              const priority = (complaint.priority || 'unknown').toUpperCase();
              const status = (complaint.status || 'unknown').replace(/_/g, ' ').toUpperCase();
              doc.text(`  ${idx + 1}. [${complaintId}] ${title} | Priority: ${priority} | Status: ${status}`);
            });
            doc.moveDown(0.5);
          }

          // Detailed Complaint Log
          const detailedComplaints = reportData.detailedComplaints || [];
          if (detailedComplaints.length > 0) {
            doc.addPage();
            doc.fontSize(12).font('Helvetica-Bold').text('6. DETAILED COMPLAINT LOG');
            doc.fontSize(8).font('Helvetica');
            doc.text(`Total Complaints: ${detailedComplaints.length}`, { align: 'right' });
            doc.moveDown(0.3);

            // Table header
            const headers = ['ID', 'Title', 'Category', 'Status', 'Priority', 'Assigned To'];
            const colWidths = [60, 100, 70, 50, 50, 80];
            const tableTop = doc.y;
            let x = 40;
            
            doc.font('Helvetica-Bold').fontSize(7);
            headers.forEach((header, i) => {
              doc.text(header, x, tableTop, { width: colWidths[i] });
              x += colWidths[i];
            });

            doc.stroke().moveTo(40, tableTop + 15).lineTo(540, tableTop + 15).stroke();

            // Table rows
            doc.font('Helvetica').fontSize(7);
            let y = tableTop + 20;
            
            detailedComplaints.slice(0, 20).forEach((complaint, idx) => {
              if (y > 700) {
                doc.addPage();
                y = 40;
              }

              const id = (complaint.id || 'N/A').substring(0, 8);
              const title = (complaint.title || 'N/A').substring(0, 25);
              const category = (complaint.category || 'N/A').substring(0, 15);
              const status = (complaint.status || 'N/A').substring(0, 8);
              const priority = (complaint.priority || 'N/A').substring(0, 8);
              const assignedTo = (complaint.assignedTo || 'Unassigned').substring(0, 15);

              x = 40;
              doc.text(id, x, y, { width: colWidths[0] });
              x += colWidths[0];
              doc.text(title, x, y, { width: colWidths[1] });
              x += colWidths[1];
              doc.text(category, x, y, { width: colWidths[2] });
              x += colWidths[2];
              doc.text(status, x, y, { width: colWidths[3] });
              x += colWidths[3];
              doc.text(priority, x, y, { width: colWidths[4] });
              x += colWidths[4];
              doc.text(assignedTo, x, y, { width: colWidths[5] });

              y += 12;
            });
          }

          // Footer
          doc.fontSize(8).fillColor('#666666');
          doc.text(`Report generated on ${new Date().toLocaleString()} | NyaySathi Legal Tech Platform`, 40, 750, { align: 'center' });

          // Finalize PDF
          doc.end();
        } catch (err) {
          logger.error('Error in PDF generation process:', err);
          reject(err);
        }
      });
    } catch (error) {
      logger.error('generateDailyReportPDF error:', error);
      throw error;
    }
  },
};
