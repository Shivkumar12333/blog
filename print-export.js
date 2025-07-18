// Print/PDF Export Feature
class PrintExportManager {
  constructor() {
    this.initializePrintFeature();
  }

  initializePrintFeature() {
    // Add print button to blog pages
    if (window.location.pathname.includes('blog.html')) {
      setTimeout(() => {
        this.addPrintButton();
      }, 1000);
    }
  }

  addPrintButton() {
    const actionsDiv = document.querySelector('.flex.gap-4.mt-6');
    if (actionsDiv && !actionsDiv.querySelector('.print-btn')) {
      const printBtn = document.createElement('button');
      printBtn.className = 'print-btn px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 flex items-center gap-2';
      printBtn.innerHTML = `
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clip-rule="evenodd"></path>
        </svg>
        Print/PDF
      `;
      
      printBtn.addEventListener('click', () => {
        this.showPrintOptions();
      });
      
      actionsDiv.appendChild(printBtn);
    }
  }

  showPrintOptions() {
    const modal = document.createElement('div');
    modal.className = 'print-modal';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="text-xl font-bold">Print Options</h3>
          <button class="close-btn" onclick="this.closest('.print-modal').remove()">×</button>
        </div>
        <div class="modal-body">
          <div class="print-options">
            <button class="print-option" onclick="window.printExportManager.printArticle()">
              <svg class="w-8 h-8 mb-2" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clip-rule="evenodd"></path>
              </svg>
              <span>Print Article</span>
              <small>Send to printer</small>
            </button>
            <button class="print-option" onclick="window.printExportManager.exportToPDF()">
              <svg class="w-8 h-8 mb-2" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd"></path>
              </svg>
              <span>Download PDF</span>
              <small>Save as PDF file</small>
            </button>
            <button class="print-option" onclick="window.printExportManager.shareArticle()">
              <svg class="w-8 h-8 mb-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z"></path>
              </svg>
              <span>Share Article</span>
              <small>Share via apps</small>
            </button>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close on outside click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });
  }

  printArticle() {
    const blogContent = document.querySelector('#blog');
    if (!blogContent) return;

    // Create print-friendly version
    const printWindow = window.open('', '_blank');
    const blogTitle = document.querySelector('h2')?.textContent || 'Blog Article';
    const blogContent_clean = blogContent.cloneNode(true);
    
    // Remove unwanted elements
    const elementsToRemove = blogContent_clean.querySelectorAll('button, .flex.gap-4.mt-6');
    elementsToRemove.forEach(el => el.remove());
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${blogTitle}</title>
        <style>
          body {
            font-family: 'Georgia', serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
          }
          h1, h2, h3 {
            color: #2c3e50;
            margin-bottom: 1rem;
          }
          h1 {
            font-size: 2.5rem;
            border-bottom: 3px solid #3498db;
            padding-bottom: 10px;
          }
          h2 {
            font-size: 2rem;
            margin-top: 2rem;
          }
          h3 {
            font-size: 1.5rem;
            margin-top: 1.5rem;
          }
          p {
            margin-bottom: 1rem;
            text-align: justify;
          }
          img {
            max-width: 100%;
            height: auto;
            margin: 1rem 0;
            border-radius: 8px;
          }
          blockquote {
            border-left: 4px solid #3498db;
            padding-left: 1rem;
            margin: 1rem 0;
            font-style: italic;
            color: #666;
          }
          code {
            background: #f4f4f4;
            padding: 2px 4px;
            border-radius: 3px;
            font-family: 'Courier New', monospace;
          }
          pre {
            background: #f4f4f4;
            padding: 1rem;
            border-radius: 6px;
            overflow-x: auto;
            margin: 1rem 0;
          }
          .print-header {
            text-align: center;
            border-bottom: 2px solid #eee;
            padding-bottom: 1rem;
            margin-bottom: 2rem;
          }
          .print-footer {
            text-align: center;
            border-top: 2px solid #eee;
            padding-top: 1rem;
            margin-top: 2rem;
            font-size: 0.9rem;
            color: #666;
          }
          @media print {
            body {
              font-size: 12pt;
            }
            h1 {
              font-size: 20pt;
            }
            h2 {
              font-size: 16pt;
            }
            h3 {
              font-size: 14pt;
            }
          }
        </style>
      </head>
      <body>
        <div class="print-header">
          <h1>${blogTitle}</h1>
          <p>Printed from DEEPsink Blog</p>
        </div>
        ${blogContent_clean.innerHTML}
        <div class="print-footer">
          <p>© ${new Date().getFullYear()} DEEPsink Blog - ${window.location.origin}</p>
          <p>Printed on ${new Date().toLocaleDateString()}</p>
        </div>
      </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    
    // Auto-print after load
    setTimeout(() => {
      printWindow.print();
    }, 1000);
    
    // Close print modal
    document.querySelector('.print-modal')?.remove();
  }

  async exportToPDF() {
    // Simple PDF export using browser's print to PDF
    const blogContent = document.querySelector('#blog');
    if (!blogContent) return;

    // Create a clean version for PDF
    const printContent = document.createElement('div');
    printContent.innerHTML = blogContent.innerHTML;
    
    // Remove interactive elements
    const elementsToRemove = printContent.querySelectorAll('button, .flex.gap-4.mt-6');
    elementsToRemove.forEach(el => el.remove());
    
    // Create PDF-friendly page
    const pdfWindow = window.open('', '_blank');
    const blogTitle = document.querySelector('h2')?.textContent || 'Blog Article';
    
    pdfWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${blogTitle}</title>
        <style>
          body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
          }
          h1, h2, h3 {
            color: #2c3e50;
            margin-bottom: 1rem;
          }
          h1 {
            font-size: 2.5rem;
            border-bottom: 3px solid #3498db;
            padding-bottom: 10px;
          }
          p {
            margin-bottom: 1rem;
            text-align: justify;
          }
          img {
            max-width: 100%;
            height: auto;
            margin: 1rem 0;
          }
          .pdf-header {
            text-align: center;
            border-bottom: 2px solid #eee;
            padding-bottom: 1rem;
            margin-bottom: 2rem;
          }
          .pdf-footer {
            text-align: center;
            border-top: 2px solid #eee;
            padding-top: 1rem;
            margin-top: 2rem;
            font-size: 0.9rem;
            color: #666;
          }
          @media print {
            @page {
              margin: 1in;
            }
            body {
              font-size: 12pt;
            }
          }
        </style>
      </head>
      <body>
        <div class="pdf-header">
          <h1>${blogTitle}</h1>
          <p>From DEEPsink Blog</p>
        </div>
        ${printContent.innerHTML}
        <div class="pdf-footer">
          <p>© ${new Date().getFullYear()} DEEPsink Blog - ${window.location.origin}</p>
          <p>Generated on ${new Date().toLocaleDateString()}</p>
        </div>
      </body>
      </html>
    `);
    
    pdfWindow.document.close();
    pdfWindow.focus();
    
    // Show PDF instructions
    setTimeout(() => {
      alert('To save as PDF:\n1. Press Ctrl+P (or Cmd+P on Mac)\n2. Select "Save as PDF" as destination\n3. Click Save');
      pdfWindow.print();
    }, 1000);
    
    // Close print modal
    document.querySelector('.print-modal')?.remove();
  }

  shareArticle() {
    const blogTitle = document.querySelector('h2')?.textContent || 'Blog Article';
    const blogUrl = window.location.href;
    
    if (navigator.share) {
      navigator.share({
        title: blogTitle,
        text: `Check out this article: ${blogTitle}`,
        url: blogUrl
      }).catch(err => console.log('Error sharing:', err));
    } else {
      // Fallback - copy to clipboard
      navigator.clipboard.writeText(blogUrl).then(() => {
        alert('Article link copied to clipboard!');
      }).catch(() => {
        // Fallback for clipboard API
        const textArea = document.createElement('textarea');
        textArea.value = blogUrl;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        alert('Article link copied to clipboard!');
      });
    }
    
    // Close print modal
    document.querySelector('.print-modal')?.remove();
  }
}

// Initialize print/export manager
document.addEventListener('DOMContentLoaded', () => {
  window.printExportManager = new PrintExportManager();
});
