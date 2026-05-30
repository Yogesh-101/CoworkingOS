import React, { useState, useEffect } from 'react';
import { useStore } from '@/store';
import { 
  Download, Search, Filter, Plus, X, DollarSign, Calendar, Landmark, 
  CheckCircle2, AlertCircle, Clock, FileText, Printer, Check, 
  ArrowRight, Loader, ChevronDown, Bell, RefreshCw, Layers 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { Invoice, WorkspaceRenewal } from '@/types';
import { format } from 'date-fns';
import { jsPDF } from 'jspdf';
import { computeRenewalPredictions } from '@/lib/intelligence';

export function Billing() {
  const { 
    invoices, addInvoice, updateInvoiceStatus, leads, branches,
    renewals, renewContract, sendRenewalReminder
  } = useStore();
  
  const [activeSubTab, setActiveSubTab] = useState<'ledger' | 'renewals'>('ledger');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'pending' | 'overdue'>('all');
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);

  // New Invoice form state with suggestion highlights
  const [clientName, setClientName] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [status, setStatus] = useState<Invoice['status']>('pending');
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Download simulation states
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadStatus, setDownloadStatus] = useState('Initiating cryptographic signature...');

  // Print simulation states
  const [isPrinting, setIsPrinting] = useState(false);
  const [printStatus, setPrintStatus] = useState('');
  const [printProgress, setPrintProgress] = useState(0);

  // Match live suggestions from leads and active branch desk tenants
  const clientSuggestions = (() => {
    if (!clientName.trim()) return [];
    const query = clientName.toLowerCase();
    const suggestions: Array<{ name: string; type: string; val: number }> = [];

    leads.forEach(l => {
      if (l.name.toLowerCase().includes(query) || l.company.toLowerCase().includes(query)) {
        suggestions.push({
          name: `${l.name} (${l.company})`,
          type: 'Lead CRM',
          val: l.value
        });
      }
    });

    branches.forEach(b => {
      b.desks.forEach(d => {
        if (d.assigneeName && d.assigneeName.toLowerCase().includes(query)) {
          if (!suggestions.some(s => s.name === d.assigneeName)) {
            suggestions.push({
              name: d.assigneeName,
              type: `Occupant (${b.name})`,
              val: d.pricePerMonth
            });
          }
        }
      });
    });

    return suggestions.slice(0, 4);
  })();

  // Filter invoice list
  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = inv.clientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          inv.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const renewalPredictions = computeRenewalPredictions(renewals, invoices);
  const atRiskCount = renewalPredictions.filter((r) => r.risk !== 'low').length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !amount) return;

    addInvoice({
      clientName,
      amount: Number(amount) || 0,
      status,
      dueDate: format(new Date(dueDate), 'MMM dd, yyyy')
    });

    // Reset Form
    setClientName('');
    setAmount('');
    setStatus('pending');
    setDueDate(format(new Date(), 'yyyy-MM-dd'));
    setIsInvoiceOpen(false);
  };

  const cycleStatus = (id: string, current: Invoice['status']) => {
    const nextStatusMap: Record<Invoice['status'], Invoice['status']> = {
      pending: 'paid',
      overdue: 'paid',
      paid: 'pending'
    };
    updateInvoiceStatus(id, nextStatusMap[current]);
  };

  // Run receipt downloader download cycle
  const runDownloadSimulation = () => {
    if (isDownloading) return;
    setIsDownloading(true);
    setDownloadProgress(0);
    setDownloadStatus('Accessing ledger authority gateway...');

    const stages = [
      { prg: 20, txt: 'Drafting secure transaction payload...' },
      { prg: 45, txt: 'Calculating multi-branch tax matrices...' },
      { prg: 75, txt: 'Compiling offline PDF cryptographic token...' },
      { prg: 100, txt: 'Completed receipt assembly!' }
    ];

    let step = 0;
    const interval = setInterval(() => {
      if (step < stages.length) {
        setDownloadProgress(stages[step].prg);
        setDownloadStatus(stages[step].txt);
        step++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          // Trigger crisp vector PDF invoice file download securely
          const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
          });

          // Theme and branding colors
          const primaryColor = [24, 24, 27]; // #18181b (zinc-900)
          const accentColor = [139, 92, 246]; // Violet / Brand color
          const darkGray = [63, 63, 70]; // #3f3f46
          const lightGray = [244, 244, 245]; // #f4f4f5
          const successColor = [16, 185, 129]; // Paid green
          const pendingColor = [245, 158, 11]; // Pending Amber
          const overdueColor = [239, 68, 68]; // Overdue Red

          // Margins and utilities
          const marginX = 20;
          let currentY = 20;

          // Header Background block
          doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
          doc.rect(0, 0, 210, 48, 'F');

          // Header Text
          doc.setTextColor(255, 255, 255);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(22);
          doc.text("COWORKING OS", marginX, 20);

          doc.setFont('helvetica', 'normal');
          doc.setFontSize(9);
          doc.setTextColor(200, 200, 200);
          doc.text("100 DOWNTOWN HQ BOULEVARD, SITE 400 • COWORKING PLATFORM", marginX, 26);
          doc.text("E: BILLING@COWORKINGOS.IO • W: WWW.COWORKINGOS.IO", marginX, 31);

          // Receipt Pill inside header
          doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
          doc.rect(142, 14, 48, 10, 'F');
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(10);
          doc.setTextColor(255, 255, 255);
          doc.text("OFFICIAL RECEIPT", 145, 20.5);

          // Invoice Reference right-aligned
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(9);
          doc.setTextColor(220, 220, 220);
          doc.text(`Ref: ${selectedInvoice?.id}`, 190, 37, { align: 'right' });
          doc.text(`Generated: ${format(new Date(), 'yyyy/MM/dd HH:mm')}`, 190, 42, { align: 'right' });

          currentY = 58;

          // Two Column Section
          doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(10);
          doc.text("BILLED TENANT / CLIENT", marginX, currentY);
          doc.text("ACCOUNT LEDGER STATION", 190, currentY, { align: 'right' });

          currentY += 6;
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(11);
          doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
          doc.text(selectedInvoice?.clientName || "Leaseholder", marginX, currentY);
          doc.text("Downtown HQ Satellite", 190, currentY, { align: 'right' });

          currentY += 5;
          doc.setFontSize(9.5);
          doc.text(`Corporate Lease ID: L-${selectedInvoice?.id.split('-')[1] || '2093'}`, marginX, currentY);
          doc.text(`Billing Cycle Due: ${selectedInvoice?.dueDate}`, 190, currentY, { align: 'right' });

          currentY += 12;
          doc.setDrawColor(228, 228, 231);
          doc.setLineWidth(0.3);
          doc.line(marginX, currentY, 190, currentY);
          currentY += 8;

          // Payment Details Block
          const statusVal = selectedInvoice?.status.toUpperCase() || "PENDING";
          const statusColor = selectedInvoice?.status === 'paid' ? successColor : (selectedInvoice?.status === 'pending' ? pendingColor : overdueColor);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(10);
          doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
          doc.text("PAYMENT RECEIPT STATUS:", marginX, currentY);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(11);
          doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
          doc.text(statusVal, 75, currentY);

          currentY += 8;
          doc.setDrawColor(228, 228, 231);
          doc.line(marginX, currentY, 190, currentY);
          currentY += 10;

          // Itemized Table Headers
          doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
          doc.rect(marginX, currentY, 170, 8, 'F');
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(9.5);
          doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
          doc.text("ITEM DESCRIPTION & SERVICE TYPE", marginX + 4, currentY + 5.5);
          doc.text("AMOUNT (USD)", 186, currentY + 5.5, { align: 'right' });

          const amountVal = selectedInvoice?.amount || 0;
          const baseRate = amountVal * 0.85;
          const fiberRate = amountVal * 0.10;
          const opsRate = amountVal * 0.05;

          const items = [
            { label: "Flex Workstation Leases - Monthly Base Rate (85%)", value: baseRate },
            { label: "Multi-Gig Dedicated Fiber Core Access Addon (10%)", value: fiberRate },
            { label: "Operations Support & Workplace Cleanups (5%)", value: opsRate }
          ];

          currentY += 8;
          items.forEach((item) => {
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            doc.setTextColor(30, 30, 30);
            
            currentY += 8;
            doc.text(item.label, marginX + 4, currentY);
            doc.text(`$${item.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 186, currentY, { align: 'right' });
            
            currentY += 3;
            doc.setDrawColor(240, 240, 240);
            doc.line(marginX, currentY + 2, 190, currentY + 2);
            currentY += 3;
          });

          // Totals Column
          currentY += 8;
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(10);
          doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
          doc.text("Ledger Subtotal:", 125, currentY);
          doc.text(`$${amountVal.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, 186, currentY, { align: 'right' });

          currentY += 6;
          doc.text("Workspace Occupancy Levy (8.25%):", 125, currentY);
          doc.setFont('helvetica', 'italic');
          doc.setTextColor(110, 110, 110);
          doc.text("Included", 186, currentY, { align: 'right' });

          currentY += 8;
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(12);
          doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
          doc.text("TOTAL PAID:", 125, currentY);
          doc.text(`$${amountVal.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, 186, currentY, { align: 'right' });

          // Notes / Footer
          currentY = 245;
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8);
          doc.setTextColor(100, 100, 100);
          doc.setDrawColor(228, 228, 231);
          doc.line(marginX, currentY - 5, 190, currentY - 5);
          doc.text("Please contact billing@coworkingos.io for manual payment queries, ACH setup instructions, or corporate discount proposals.", marginX, currentY);
          doc.text("CoworkingOS software and database systems are compliant with standard corporate financial ledger safety procedures.", marginX, currentY + 4);
          doc.text("Payment processing services are rendered securely through approved Stripe payment integrations.", marginX, currentY + 8);

          // Bottom Accent Bar
          doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
          doc.rect(0, 287, 210, 10, 'F');

          // Save Invoice PDF
          doc.save(`${selectedInvoice?.id}_receipt.pdf`);

          setIsDownloading(false);
        }, 800);
      }
    }, 450);
  };

  const runPrintSimulation = (invoice: Invoice) => {
    if (isPrinting || isDownloading) return;
    setIsPrinting(true);
    setPrintProgress(0);
    setPrintStatus('Warming up thermal printers...');

    const printStages = [
      { prg: 25, txt: 'Constructing print-spooler asset...' },
      { prg: 50, txt: 'Formatting vector typography grids...' },
      { prg: 80, txt: 'Transmitting payload to network spooler...' },
      { prg: 100, txt: 'Launching system print workflow...' }
    ];

    let step = 0;
    const interval = setInterval(() => {
      if (step < printStages.length) {
        setPrintProgress(printStages[step].prg);
        setPrintStatus(printStages[step].txt);
        step++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          printReceipt(invoice);
          setIsPrinting(false);
          setPrintStatus('');
          setPrintProgress(0);
        }, 500);
      }
    }, 350);
  };

  const printReceipt = (invoice: Invoice) => {
    if (!invoice) return;
    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.width = '0px';
    iframe.style.height = '0px';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document || iframe.contentDocument;
    if (!doc) return;

    const baseRate = (invoice.amount * 0.85).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const fiberRate = (invoice.amount * 0.10).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const opsRate = (invoice.amount * 0.05).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const totalStr = invoice.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    doc.open();
    doc.write(`
      <html>
        <head>
          <title>Receipt - ${invoice.id}</title>
          <style>
            body {
              font-family: 'Courier New', Courier, monospace;
              padding: 40px;
              color: #111;
              line-height: 1.5;
              background: #fff;
            }
            .header {
              text-align: center;
              border-bottom: 2px dashed #333;
              padding-bottom: 20px;
              margin-bottom: 20px;
            }
            .title {
              font-size: 20px;
              font-weight: bold;
              letter-spacing: 1px;
              margin: 0;
            }
            .subtitle {
              font-size: 11px;
              color: #666;
              margin-top: 5px;
            }
            .invoice-info {
              display: flex;
              justify-content: space-between;
              font-size: 12px;
              margin-bottom: 20px;
            }
            .info-col {
              width: 48%;
            }
            .table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
            }
            .table th {
              border-bottom: 1px solid #111;
              text-align: left;
              font-size: 11px;
              padding: 8px 0;
              color: #444;
            }
            .table td {
              padding: 10px 0;
              font-size: 12px;
            }
            .row-total {
              border-top: 2px dashed #111;
              font-weight: bold;
            }
            .footer {
              text-align: center;
              font-size: 11px;
              color: #666;
              margin-top: 40px;
              border-top: 1px dashed #ccc;
              padding-top: 20px;
            }
            .status {
              display: inline-block;
              padding: 4px 8px;
              border: 1px solid #111;
              font-weight: bold;
              font-size: 11px;
              margin-top: 5px;
              text-transform: uppercase;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">COWORKINGOS BILLING SYSTEM</div>
            <div class="subtitle">100 DOWNTOWN HQ BOULEVARD, SITE 400</div>
            <div class="subtitle">TELEPHONE: +1 (555) 902-1049 &bull; LEDGER OFFICIAL RECEIPT</div>
          </div>
          
          <div class="invoice-info">
            <div class="info-col">
              <strong>BILLED TO:</strong><br />
              \${invoice.clientName}<br />
              Corporate Lease ID: L-\${invoice.id.split('-')[1] || '2093'}
            </div>
            <div class="info-col" style="text-align: right;">
              <strong>TRANSACTION REGISTER:</strong><br />
              Invoice Ref: \${invoice.id}<br />
              Due Date: \${invoice.dueDate}<br />
              <span class="status" style="border-color: \${invoice.status === 'paid' ? '#10B981' : (invoice.status === 'pending' ? '#F59E0B' : '#EF4444')}; color: \${invoice.status === 'paid' ? '#10B981' : (invoice.status === 'pending' ? '#F59E0B' : '#EF4444')};">\${invoice.status}</span>
            </div>
          </div>

          <table class="table">
            <thead>
              <tr>
                <th>SERVICE DESCRIPTION</th>
                <th style="text-align: right;">TOTAL VALUE</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Flex Workstation Leases (Base rate - 85%)</td>
                <td style="text-align: right;">$\${baseRate}</td>
              </tr>
              <tr>
                <td>Multi-Gig Fiber Core Access Addon (10%)</td>
                <td style="text-align: right;">$\${fiberRate}</td>
              </tr>
              <tr>
                <td>Operations Support & Cleanups (5%)</td>
                <td style="text-align: right;">$\${opsRate}</td>
              </tr>
              <tr class="row-total">
                <td style="padding-top: 15px;">TOTAL LEDGER BALANCE (Levy Included)</td>
                <td style="text-align: right; padding-top: 15px;">$\${totalStr}</td>
              </tr>
            </tbody>
          </table>

          <div class="footer">
            <p>Thank you for choosing CoworkingOS!</p>
            <p style="font-size: 10px; color: #888;">This is a dynamically verified transaction register item. Digitally encrypted and recorded securely in CoworkingOS ledger database.</p>
          </div>
          
          <script>
            window.onload = function() {
              window.focus();
              window.print();
              setTimeout(function() {
                window.parent.document.body.removeChild(window.frameElement);
              }, 1000);
            }
          </script>
        </body>
      </html>
    `);
    doc.close();
  };

  // Aggregates
  const totalInvoiced = filteredInvoices.reduce((sum, inv) => sum + inv.amount, 0);
  const paidInvoiced = filteredInvoices.filter(i => i.status === 'paid').reduce((sum, inv) => sum + inv.amount, 0);
  const pendingInvoiced = filteredInvoices.filter(i => i.status === 'pending' || i.status === 'overdue').reduce((sum, inv) => sum + inv.amount, 0);

  return (
    <div className="flex flex-col h-full space-y-6 relative font-sans">
      
      {/* Tab select & Main Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-display font-bold text-zinc-100 tracking-tight">Financials & Billing</h1>
          <p className="text-zinc-500 text-sm mt-1">Audit recurring tenant deposits, emit invoices, and manage contract renewals.</p>
        </div>

        {/* Tab row */}
        <div className="flex bg-zinc-950 p-1 border border-zinc-805 rounded-2xl select-none leading-none items-center gap-1 shrink-0 font-sans">
          {[
            { id: 'ledger', label: 'Invoices Ledger', icon: Landmark },
            { id: 'renewals', label: 'Lease Contract Renewals', icon: Layers }
          ].map((tab) => {
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as any)}
                className={cn(
                  "px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer leading-none flex items-center gap-2",
                  isActive 
                    ? "bg-zinc-850 text-white font-black shadow-inner" 
                    : "text-zinc-500 hover:text-zinc-450"
                )}
              >
                <tab.icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {activeSubTab === 'ledger' && (
        <>
          {/* Financial summary blocks */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { label: 'Total Volume', value: `$${totalInvoiced.toLocaleString()}`, color: 'text-zinc-100', bg: 'bg-zinc-900 border-zinc-850/50' },
              { label: 'Settled Core', value: `$${paidInvoiced.toLocaleString()}`, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
              { label: 'Outstanding Invoices', value: `$${pendingInvoiced.toLocaleString()}`, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
            ].map((stat, i) => (
              <div key={i} className={cn("rounded-2xl border p-4 shadow-sm flex flex-col justify-between", stat.bg)}>
                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{stat.label}</span>
                <p className={cn("text-xl font-bold font-mono mt-2 leading-none", stat.color)}>{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0 pt-2">
            <div>
              <h3 className="text-base font-extrabold text-zinc-200">AR accounts</h3>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  placeholder="Search invoices, clients..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-805 rounded-full py-2 pr-4 pl-10 text-xs font-semibold text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all shadow-sm"
                />
              </div>

              {/* Status Pills Choice */}
              <div className="flex bg-zinc-900 border border-zinc-805 px-1.5 py-1 rounded-full items-center gap-1 shrink-0 select-none">
                {(['all', 'paid', 'pending', 'overdue'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setStatusFilter(f)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-[10px] uppercase font-bold cursor-pointer leading-none",
                      statusFilter === f ? "bg-zinc-800 text-zinc-100 shadow-sm" : "text-zinc-500 hover:text-zinc-400"
                    )}
                  >
                    {f}
                  </button>
                ))}
              </div>

              <button 
                onClick={() => setIsInvoiceOpen(true)}
                className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 shadow-md hover:shadow-brand-500/20 text-white px-5 py-2.5 rounded-full font-bold text-xs leading-none shrink-0 transition-all active:scale-95 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Issue Invoice
              </button>
            </div>
          </div>

          {/* Invoices Logs Table grid */}
          <div className="bg-zinc-900 border border-zinc-805 rounded-3xl overflow-hidden flex-1 shadow-lg max-h-[500px] overflow-y-auto">
            {filteredInvoices.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center text-zinc-650">
                <FileText className="w-10 h-10 mb-3 opacity-30" />
                <span className="text-sm font-semibold text-zinc-400">Ledger Empty</span>
                <p className="text-xs max-w-xs mt-1">Zero billing records matching the selected status filter found on this central ledger coordinate.</p>
              </div>
            ) : (
              <table className="w-full text-left table-auto text-xs">
                <thead className="bg-zinc-950/45 text-[9px] font-bold text-zinc-450 uppercase tracking-widest border-b border-zinc-805">
                  <tr>
                    <th className="py-4 px-6">Invoice Token ID</th>
                    <th className="py-4 px-4">Billed Occupant Name</th>
                    <th className="py-4 px-4">Term Due Coordinate</th>
                    <th className="py-4 px-4">Billing Rate</th>
                    <th className="py-4 px-4 text-center">Receipts / Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-850/40">
                  {filteredInvoices.map((inv) => (
                    <tr 
                      key={inv.id}
                      onClick={() => setSelectedInvoice(inv)}
                      className="hover:bg-zinc-850/35 group cursor-pointer transition-colors"
                    >
                      <td className="py-3.5 px-6 font-mono font-bold text-zinc-400">{inv.id}</td>
                      <td className="py-3.5 px-4 font-bold text-zinc-200 capitalize group-hover:text-white transition-colors">
                        {inv.clientName}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-zinc-500">{inv.dueDate}</td>
                      <td className="py-3.5 px-4 font-mono font-black text-zinc-200">${inv.amount.toLocaleString()}</td>
                      <td className="py-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-2">
                          {/* Quick swap billing state */}
                          <button
                            onClick={() => cycleStatus(inv.id, inv.status)}
                            className={cn(
                              "px-3 py-1.5 text-[9px] font-black uppercase rounded-lg border leading-none transition-all cursor-pointer hover:scale-103",
                              inv.status === 'paid' && "bg-emerald-500/10 text-emerald-400 border-emerald-500/15",
                              inv.status === 'pending' && "bg-amber-500/10 text-amber-400 border-amber-500/15",
                              inv.status === 'overdue' && "bg-rose-500/10 text-rose-400 border-rose-500/15 animate-pulse"
                            )}
                          >
                            {inv.status}
                          </button>

                          <button
                            onClick={() => setSelectedInvoice(inv)}
                            className="p-1.5 bg-zinc-950/40 border border-transparent hover:border-zinc-805 text-zinc-550 hover:text-white rounded-lg transition-all"
                            title="Receipt details and printing"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {activeSubTab === 'renewals' && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
          
          {/* Renewals list (2 cols) */}
          <div className="xl:col-span-2 bg-zinc-900 border border-zinc-805 rounded-3xl p-6 shadow-lg space-y-4">
            <div>
              <h3 className="font-extrabold text-zinc-150 text-sm">Leases Contract Extensions</h3>
              <p className="text-[11px] text-zinc-500">Track upcoming monthly, quarterly, or yearly coworking workspace renewals</p>
            </div>

            <div className="space-y-3.5 overflow-y-auto max-h-[480px]">
              {renewals.map((r) => {
                const prediction = renewalPredictions.find((p) => p.renewalId === r.id);
                return (
                <div key={r.id} className="p-4 bg-zinc-950/45 border border-zinc-850 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs leading-none">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 shadow-inner flex-wrap">
                      <span className="text-[9px] font-mono font-bold text-zinc-550">LEASE ID: {r.id.toUpperCase()}</span>
                      <span className={cn(
                        "px-2 py-0.5 rounded text-[8px] font-extrabold uppercase border leading-none",
                        r.status === 'renewed' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                        r.status === 'pending-review' ? "bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse" :
                        "bg-zinc-800 text-zinc-550 border-zinc-705"
                      )}>
                        {r.status}
                      </span>
                      {prediction && r.status !== 'renewed' && (
                        <span
                          className={cn(
                            'px-2 py-0.5 rounded text-[8px] font-extrabold uppercase border leading-none',
                            prediction.risk === 'low' && 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
                            prediction.risk === 'medium' && 'bg-amber-500/10 text-amber-400 border-amber-500/20',
                            prediction.risk === 'high' && 'bg-brand-500/10 text-brand-400 border-brand-500/20'
                          )}
                          title={prediction.recommendation}
                        >
                          AI {prediction.probability}% · {prediction.risk} risk
                        </span>
                      )}
                    </div>

                    <h4 className="font-extrabold text-zinc-150 text-sm capitalize">{r.clientName}</h4>
                    <p className="text-[11px] text-zinc-455 font-medium">{r.companyName} • {r.deskName}</p>
                    {prediction && r.status !== 'renewed' && (
                      <p className="text-[10px] text-zinc-500 font-medium">{prediction.recommendation}</p>
                    )}
                  </div>

                  {/* Renew date spec info */}
                  <div className="grid grid-cols-2 bg-zinc-950 border border-zinc-900 rounded-xl p-3.5 text-left leading-normal min-w-[200px]">
                    <div>
                      <span className="text-[8px] text-zinc-500 font-extrabold block uppercase">CYCLE DUE</span>
                      <span className="text-[10px] font-bold text-zinc-300 font-mono flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-zinc-500" /> {r.renewalDate}
                      </span>
                    </div>
                    <div>
                      <span className="text-[8px] text-zinc-500 font-extrabold block uppercase">MONTH RATE</span>
                      <span className="text-[10px] font-bold text-zinc-300 font-mono">${r.monthlyFee.toLocaleString()}/mo</span>
                    </div>
                  </div>

                  {/* Renew actions triggers */}
                  {r.status !== 'renewed' ? (
                    <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
                      <button
                        onClick={() => sendRenewalReminder(r.id)}
                        className="p-1.5 px-3 bg-zinc-900 hover:bg-zinc-850 text-zinc-300 hover:text-white border border-zinc-800 rounded-lg text-[9px] font-black uppercase flex items-center gap-1 cursor-pointer transition-colors"
                        title="Send auto checkout/renewal alert"
                      >
                        <Bell className="w-3.5 h-3.5" /> Notify Remind
                      </button>
                      <button
                        onClick={() => renewContract(r.id)}
                        className="p-1.5 px-3 bg-brand-500 hover:bg-brand-600 text-white font-black text-[9px] uppercase rounded-lg shadow-sm cursor-pointer hover:scale-101 transition-transform"
                      >
                        Process Renew
                      </button>
                    </div>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 border border-zinc-850 text-zinc-500 font-extrabold text-[9px] uppercase rounded-lg">
                      <Check className="w-3.5 h-3.5 text-zinc-500" /> Contract Renewed
                    </span>
                  )}
                </div>
                );
              })}
            </div>
          </div>

          {/* Renewals metadata overview card */}
          <div className="bg-zinc-900 border border-zinc-805 rounded-3xl p-6 shadow-lg space-y-4">
            <h4 className="font-extrabold text-zinc-200 text-sm">AI Renewal Predictions</h4>
            <p className="text-xs text-zinc-400 leading-relaxed font-sans font-medium">
              {atRiskCount > 0
                ? `${atRiskCount} contract(s) flagged at medium or high churn risk based on payment history, renewal window, and review status.`
                : 'All active contracts show healthy renewal probability. Scores refresh when invoices or lease status change.'}
            </p>
            <div className="space-y-2">
              {renewalPredictions.slice(0, 4).map((p) => (
                <div key={p.renewalId} className="flex items-center justify-between text-[10px] bg-zinc-950/60 p-3 rounded-xl border border-zinc-850">
                  <span className="font-bold text-zinc-300 truncate">{p.clientName}</span>
                  <span className={cn(
                    'font-black uppercase shrink-0 ml-2',
                    p.risk === 'low' ? 'text-emerald-400' : p.risk === 'medium' ? 'text-amber-400' : 'text-brand-400'
                  )}>
                    {p.probability}%
                  </span>
                </div>
              ))}
            </div>

            <div className="bg-zinc-950/60 p-4 rounded-xl border border-zinc-850/70 space-y-3 text-[10px] font-mono leading-relaxed text-zinc-500 text-left">
              <span className="text-[8px] font-bold text-zinc-450 block uppercase">AUTOMATED WORKSPACE HANDLERS:</span>
              <div>1. Renew Clicked → Lease date extended 30d</div>
              <div>2. Invoice Generated → Marked Settled core</div>
              <div>3. API webhooks trigger → SendGrid mailer confirmation is dispatched</div>
            </div>
          </div>
        </div>
      )}

      {/* Traditional Invoice slide down modal */}
      <AnimatePresence>
        {isInvoiceOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsInvoiceOpen(false)}
              className="absolute inset-0 bg-[#000] z-45 rounded-3xl"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-3xl p-8 z-50 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-display font-bold text-white">Issue Lease Invoice</h3>
                  <p className="text-xs text-zinc-550 mt-1">Submit custom workspace or event space billing ledger values</p>
                </div>
                <button 
                  onClick={() => setIsInvoiceOpen(false)}
                  className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
                <div className="space-y-1.5 relative">
                  <label className="text-[10px] font-bold text-zinc-405 uppercase tracking-widest block">Billed Tenant Fullname</label>
                  <input 
                    type="text" required
                    placeholder="e.g. Richard Hendricks"
                    value={clientName}
                    onChange={(e) => {
                      setClientName(e.target.value);
                      setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    className="w-full bg-zinc-900 border border-zinc-805 rounded-xl py-2.5 px-3.5 text-xs text-zinc-200 font-semibold focus:outline-none"
                  />

                  {/* Suggestions Overlay */}
                  {showSuggestions && clientSuggestions.length > 0 && (
                    <div className="absolute left-0 right-0 z-50 mt-1 bg-zinc-950 border border-zinc-800 rounded-xl py-1 shadow-2xl">
                      {clientSuggestions.map((s, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setClientName(s.name);
                            setAmount(s.val.toString());
                            setShowSuggestions(false);
                          }}
                          className="w-full px-3 py-2 text-left hover:bg-zinc-900 flex justify-between items-center"
                        >
                          <span className="font-bold text-zinc-300">{s.name}</span>
                          <span className="text-[8px] bg-brand-500/10 text-brand-400 font-extrabold px-1.5 py-0.5 rounded uppercase border border-brand-500/20">{s.type}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-405 uppercase tracking-widest block">Billed rate ($) </label>
                    <input 
                      type="number" required
                      placeholder="399"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-805 rounded-xl py-2.5 px-3.5 text-xs text-zinc-200 font-bold focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-405 uppercase tracking-widest block">Cycle Due Coordinate</label>
                    <input 
                      type="date" required
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-805 rounded-xl py-2.5 px-3.5 text-xs text-zinc-300 cursor-pointer focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-405 uppercase tracking-widest block">Initial Payment Status</label>
                  <select 
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full bg-zinc-900 border border-zinc-805 rounded-xl py-2.5 px-3.5 text-xs text-zinc-300 font-semibold cursor-pointer focus:outline-none"
                  >
                    <option value="pending">Pending lease verification</option>
                    <option value="paid">Direct Paid / Settled</option>
                    <option value="overdue">Overdue accounts ledger</option>
                  </select>
                </div>

                <div className="flex pt-4 gap-3">
                  <button
                    type="button"
                    onClick={() => setIsInvoiceOpen(false)}
                    className="flex-1 py-3 text-xs font-bold bg-zinc-900 text-zinc-450 border border-zinc-805 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 text-xs font-bold text-white bg-brand-500 hover:bg-brand-600 rounded-xl shadow-md cursor-pointer"
                  >
                    Submit Ledger Entry
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}

        {/* Selected Receipt Detail Modal */}
        {selectedInvoice && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                if (!isDownloading) setSelectedInvoice(null);
              }}
              className="absolute inset-0 bg-[#000] z-45 rounded-3xl"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.94, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 30 }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-3xl p-8 z-50 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-brand-500/10 rounded-xl border border-brand-500/15">
                    <FileText className="w-5 h-5 text-brand-500" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white tracking-tight">Ledger Receipt Transaction</h3>
                    <p className="text-[10px] text-zinc-500 font-mono font-medium">{selectedInvoice.id} • Generated Live</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (!isDownloading && !isPrinting) setSelectedInvoice(null);
                  }}
                  disabled={isDownloading || isPrinting}
                  className="w-8 h-8 rounded-full bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors disabled:opacity-40"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {isDownloading || isPrinting ? (
                <div className="py-16 flex flex-col items-center justify-center space-y-4">
                  <Loader className="w-10 h-10 text-brand-500 animate-spin" />
                  <div className="w-48 bg-zinc-900 rounded-full h-1 overflow-hidden relative border border-zinc-800">
                    <motion.div 
                      className="bg-brand-505 h-full" 
                      style={{ width: `${isDownloading ? downloadProgress : printProgress}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">{isDownloading ? downloadStatus : printStatus}</span>
                </div>
              ) : (
                <div className="space-y-6 pt-5">
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div className="space-y-1">
                      <span className="text-[9px] font-bold text-zinc-550 uppercase tracking-widest block">Billed Tenant</span>
                      <p className="font-bold text-zinc-200">{selectedInvoice.clientName}</p>
                      <p className="text-[10px] text-zinc-500">Corporate Lease ID: L-{selectedInvoice.id.split('-')[1] || '2093'}</p>
                    </div>
                    <div className="space-y-1 text-right">
                      <span className="text-[9px] font-bold text-zinc-550 uppercase tracking-widest block">Account Station</span>
                      <p className="font-bold text-zinc-200">Downtown HQ</p>
                      <p className="text-[10px] text-zinc-500">Cycle Due: {selectedInvoice.dueDate}</p>
                    </div>
                  </div>

                  {/* Itemized list of billings */}
                  <div className="bg-zinc-900/40 rounded-2xl border border-zinc-900 p-4 space-y-3.5 text-xs">
                    <div className="flex justify-between items-center text-[10px] font-bold text-zinc-550 uppercase border-b border-zinc-900 pb-2">
                      <span>Service Description</span>
                      <span>Total Value</span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-zinc-450">Flex Workstation Leases (Base rate)</span>
                        <span className="font-mono text-zinc-200">${(selectedInvoice.amount * 0.85).toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-455">Multi-Gig Fiber Core Access Addon</span>
                        <span className="font-mono text-zinc-200">${(selectedInvoice.amount * 0.10).toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-455">Operations Support & Cleanups</span>
                        <span className="font-mono text-zinc-200">${(selectedInvoice.amount * 0.05).toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                      </div>
                    </div>

                    <div className="border-t border-zinc-900 pt-3 space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-zinc-500 font-sans">Subtotal amount</span>
                        <span className="font-mono text-zinc-400">${(selectedInvoice.amount).toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-550">Workspace Occupancy Levy (8.25%)</span>
                        <span className="font-mono text-zinc-500 font-medium">Included</span>
                      </div>
                      <div className="flex justify-between border-t border-zinc-900/60 pt-2 text-sm font-bold">
                        <span className="text-white">Total Ledger Volume</span>
                        <span className="text-brand-505 font-mono">${selectedInvoice.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions footer */}
                  <div className="flex items-center gap-3 border-t border-zinc-900 pt-5">
                    <button
                      id="receipt-print-action-btn"
                      onClick={() => selectedInvoice && runPrintSimulation(selectedInvoice)}
                      disabled={isPrinting || isDownloading}
                      className="flex-1 py-3 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed group"
                    >
                      <Printer className="w-4 h-4 text-zinc-450 group-hover:text-amber-400 transition-colors" />
                      <span>Print Register</span>
                    </button>
                    <button
                      id="receipt-pdf-download-action-btn"
                      onClick={runDownloadSimulation}
                      disabled={isPrinting || isDownloading}
                      className="flex-1 py-3 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-md hover:shadow-brand-500/20 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Download className="w-4 h-4" />
                      Download Receipt PDF
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
