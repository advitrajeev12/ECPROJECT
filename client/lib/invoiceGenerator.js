import jsPDF from 'jspdf';
import 'jspdf-autotable';

// ─────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────

const PAGE = { width: 210, height: 297, margin: 10, innerWidth: 190 };

const COLORS = {
    black: [20, 20, 20],
    darkGray: [40, 40, 50],
    midGray: [80, 80, 80],
    lightGray: [100, 100, 100],
    green: [26, 91, 58],
    gold: [150, 100, 0],
    signature: [180, 180, 200],
};

const FONTS = {
    normal: ['helvetica', 'normal'],
    bold: ['helvetica', 'bold'],
    italic: ['times', 'italic'],
};

const COMPANY = {
    name: 'Bal Jyoti Design Pvt. Ltd.',
    address: 'PLOT NO-321 C/O JYOTI DEVI ROAD NO-1 Bodh Gaya',
    phone: '9934932001',
    gstin: '10AAMCB7443B1Z5',
    email: 'baljyoti.design@gmail.com',
    state: '10-Bihar',
    bank: {
        name: 'BANK OF INDIA, BODH GAYA',
        accountNo: '447920110000276',
        ifsc: 'BKID0004479',
        accountHolder: 'BAL JYOTI DESIGN PRIVATE LIMITED',
    },
    signatory: 'Gauri Kumari',
};

const GST_RATE = 5;   // percent
const INR_SYMBOL = 'Rs.';

// ─────────────────────────────────────────────
// UTILITIES
// ─────────────────────────────────────────────

function numberToWords(amount) {
    if (!amount || amount === 0) return 'Zero Rupees Only';

    const ones = [
        '', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ',
        'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ',
        'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen ',
    ];
    const tens = [
        '', '', 'Twenty ', 'Thirty ', 'Forty ', 'Fifty ',
        'Sixty ', 'Seventy ', 'Eighty ', 'Ninety ',
    ];

    const num = String(Math.floor(amount));
    if (num.length > 9) return 'Overflow';

    const n = ('000000000' + num)
        .substr(-9)
        .match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);

    if (!n) return '';

    const word = (grp) => ones[Number(grp)] || tens[grp[0]] + ones[grp[1]];

    let str = '';
    if (n[1] != 0) str += word(n[1]) + 'Crore ';
    if (n[2] != 0) str += word(n[2]) + 'Lakh ';
    if (n[3] != 0) str += word(n[3]) + 'Thousand ';
    if (n[4] != 0) str += word(n[4]) + 'Hundred ';
    if (n[5] != 0) str += (str ? 'and ' : '') + word(n[5]);

    return str.trim() + ' Rupees Only';
}

function fmt(value) {
    return `${INR_SYMBOL} ${Number(value).toFixed(2)}`;
}

function shortOrderId(orderId) {
    return orderId
        ? orderId.substring(orderId.length - 6).toUpperCase()
        : 'UNKNOWN';
}

// ─────────────────────────────────────────────
// DOC HELPERS
// ─────────────────────────────────────────────

function setFont(doc, [family, style], size, color = COLORS.darkGray) {
    doc.setFont(family, style);
    doc.setFontSize(size);
    doc.setTextColor(...color);
}

function hLine(doc, x1, y, x2) {
    doc.line(x1, y, x2, y);
}

function vLine(doc, x, y1, y2) {
    doc.line(x, y1, x, y2);
}

function box(doc, x, y, w, h) {
    doc.rect(x, y, w, h);
}

// ─────────────────────────────────────────────
// SECTION RENDERERS
// ─────────────────────────────────────────────

function renderTitle(doc) {
    setFont(doc, FONTS.bold, 14, [50, 50, 50]);
    doc.text('Tax Invoice', 105, 12, { align: 'center' });
    doc.setDrawColor(...COLORS.lightGray);
    doc.setLineWidth(0.3);
}

/**
 * Renders the company header block.
 * @returns {number} Updated Y position after the block.
 */
function renderHeader(doc, y, logoBase64) {
    const H = 30;
    box(doc, PAGE.margin, y, PAGE.innerWidth, H);

    if (logoBase64) {
        doc.addImage(logoBase64, 'PNG', 12, y + 3, 24, 24);
    } else {
        // — Logo Fallback —
        setFont(doc, FONTS.bold, 32, COLORS.green);
        doc.text('JB', 20, y + 16, { angle: 10 });
        doc.text('B', 16, y + 22);

        setFont(doc, FONTS.bold, 9, COLORS.gold);
        doc.text('BAL JYOTI', 14, y + 26);

        doc.setDrawColor(...COLORS.green);
        vLine(doc, 38, y + 2, y + 28);
        doc.setDrawColor(...COLORS.lightGray);
    }

    // — Company name —
    setFont(doc, FONTS.bold, 16, [40, 40, 50]);
    doc.text(COMPANY.name, 42, y + 10);

    // — Address & contact details —
    setFont(doc, FONTS.normal, 8, COLORS.midGray);
    doc.text(COMPANY.address, 42, y + 16);

    const labelValue = (label, value, x, ly) => {
        setFont(doc, FONTS.bold, 8, COLORS.midGray);
        doc.text(`${label}: `, x, ly);
        setFont(doc, FONTS.normal, 8, COLORS.midGray);
        doc.text(value, x + doc.getTextWidth(`${label}: `), ly);
    };

    labelValue('Phone', COMPANY.phone, 42, y + 21);
    labelValue('GSTIN', COMPANY.gstin, 42, y + 26);
    labelValue('Email', COMPANY.email, 135, y + 21);
    labelValue('State', COMPANY.state, 135, y + 26);

    return y + H;
}

/**
 * Renders the Bill To / Invoice Details block.
 * @returns {number} Updated Y position after the block.
 */
function renderBillTo(doc, y, order, currentUser) {
    // — Customer info —
    const userName = order.user?.name || currentUser?.name || order.shippingAddress?.fullName || order.shippingAddress?.name || 'Customer';
    const address = order.shippingAddress || {};
    const street = address.street || address.address || '';
    const cityState = [address.city, address.state, address.zipCode || address.postalCode].filter(Boolean).join(', ');
    const contact = order.user?.mobile || currentUser?.mobile || address.mobile || address.phone || 'Not provided';

    const streetLines = doc.splitTextToSize(street, 85).slice(0, 2);
    const numStreetLines = Math.max(1, streetLines.length);
    const H = 25 + ((numStreetLines - 1) * 4);

    box(doc, PAGE.margin, y, PAGE.innerWidth, H);
    vLine(doc, 100, y, y + H);
    hLine(doc, PAGE.margin, y + 6, 200);

    // — Section headings —
    setFont(doc, FONTS.bold, 9, COLORS.black);
    doc.text('Bill To:', 12, y + 4.5);
    doc.text('Invoice Details:', 102, y + 4.5);

    setFont(doc, FONTS.bold, 9, COLORS.black);
    doc.text(userName, 12, y + 11);

    setFont(doc, FONTS.normal, 8, COLORS.midGray);
    doc.text(streetLines, 12, y + 15);

    const offset = (numStreetLines - 1) * 4;
    doc.text(cityState, 12, y + 19 + offset);
    doc.text(`Contact No: ${contact}`, 12, y + 23 + offset);

    // — Invoice meta —
    const orderId = shortOrderId(order._id);
    const invoiceDate = new Date(order.createdAt || Date.now())
        .toLocaleDateString('en-GB');

    const metaField = (label, value, lx, vx, ly) => {
        setFont(doc, FONTS.normal, 9, COLORS.midGray);
        doc.text(label, lx, ly);
        setFont(doc, FONTS.bold, 9, COLORS.black);
        doc.text(value, vx, ly);
    };

    metaField('No: ', orderId, 102, 108, y + 11);
    metaField('Date: ', invoiceDate, 102, 111, y + 16);

    return y + H;
}

/**
 * Builds item rows for the autoTable, computing GST per line.
 * @returns {{ rows: Array, totalBase: number, totalGst: number }}
 */
function buildItemRows(orderItems) {
    let totalBase = 0;
    let totalGst = 0;

    const rows = (orderItems || []).map((item, index) => {
        const qty = item.qty || 1;
        const totalAmt = Number(item.price) * qty;
        const baseAmt = totalAmt / (1 + GST_RATE / 100);
        const gstAmt = totalAmt - baseAmt;
        const unitBase = baseAmt / qty;

        totalBase += baseAmt;
        totalGst += gstAmt;

        return [
            (index + 1).toString(),
            item.name || 'Product Item',
            item.hsn || '',
            qty.toString(),
            'Pcs',
            fmt(unitBase),
            `${fmt(gstAmt)} (${GST_RATE}%)`,
            fmt(totalAmt),
        ];
    });

    // Totals row
    const totalQty = (orderItems || []).reduce((acc, i) => acc + (i.qty || 1), 0);
    rows.push([
        '',
        { content: 'Total', styles: { fontStyle: 'bold' } },
        '',
        { content: totalQty.toString(), styles: { fontStyle: 'bold' } },
        '',
        '',
        { content: fmt(totalGst), styles: { fontStyle: 'bold' } },
        { content: fmt(totalBase + totalGst), styles: { fontStyle: 'bold' } },
    ]);

    return { rows, totalBase, totalGst };
}

/**
 * Renders the items table.
 * @returns {number} Updated Y position after the table.
 */
function renderItemsTable(doc, y, order) {
    const { rows, totalBase, totalGst } = buildItemRows(order.orderItems);

    doc.autoTable({
        startY: y,
        margin: { left: PAGE.margin, right: PAGE.margin },
        tableWidth: PAGE.innerWidth,
        head: [[
            '#', 'Item name', 'HSN/ SAC', 'Quantity', 'Unit',
            `Price/ Unit(${INR_SYMBOL})`, `GST(${INR_SYMBOL})`, `Amount(${INR_SYMBOL})`,
        ]],
        body: rows,
        theme: 'plain',
        headStyles: {
            fillColor: [255, 255, 255],
            textColor: 40,
            fontStyle: 'bold',
            halign: 'center',
            lineWidth: 0.3,
            lineColor: COLORS.lightGray,
        },
        bodyStyles: {
            lineWidth: 0.3,
            lineColor: COLORS.lightGray,
            textColor: 40,
        },
        columnStyles: {
            0: { halign: 'center', cellWidth: 10 },
            1: { halign: 'left' },
            2: { halign: 'center', cellWidth: 20 },
            3: { halign: 'right', cellWidth: 15 },
            4: { halign: 'right', cellWidth: 15 },
            5: { halign: 'right', cellWidth: 25 },
            6: { halign: 'right', cellWidth: 30 },
            7: { halign: 'right', cellWidth: 25 },
        },
        styles: { font: 'helvetica', fontSize: 8.5, cellPadding: 3.5 },
    });

    return { y: doc.lastAutoTable.finalY, totalBase, totalGst };
}

/**
 * Renders the tax summary + totals block.
 * @returns {number} Updated Y position after the block.
 */
function renderTaxSummary(doc, y, totalBase, totalGst) {
    const netTotal = totalBase + totalGst;
    const words = numberToWords(netTotal);
    const splitWords = doc.splitTextToSize(words, 68);
    const H = Math.max(30, 24 + splitWords.length * 4);

    box(doc, PAGE.margin, y, PAGE.innerWidth, H);
    vLine(doc, 130, y, y + H);

    // ── Left: Tax Summary ──
    hLine(doc, PAGE.margin, y + 6, 130);
    setFont(doc, FONTS.bold, 8.5, COLORS.black);
    doc.text('Tax Summary:', 12, y + 4.5);

    // Column dividers
    [30, 65, 105].forEach((x) => vLine(doc, x, y + 6, y + H));
    hLine(doc, 65, y + 14, 105); // IGST inner sub-header

    // Sub-headers
    setFont(doc, FONTS.bold, 8.5, COLORS.black);
    doc.text('HSN/ SAC', 15, y + 11);
    doc.text('Taxable amount (Rs.)', 35, y + 11);
    doc.text('IGST', 82, y + 10.5);

    setFont(doc, FONTS.bold, 7.5, COLORS.black);
    doc.text('Rate (%)', 68, y + 18);
    doc.text('Amt (Rs.)', 90, y + 18);

    setFont(doc, FONTS.bold, 8.5, COLORS.black);
    doc.text('Total Tax (Rs.)', 107, y + 11);

    // Data row
    hLine(doc, PAGE.margin, y + 24, 130);
    setFont(doc, FONTS.normal, 8.5, COLORS.black);
    doc.text(totalBase.toFixed(2), 62, y + 22, { align: 'right' });
    doc.text(String(GST_RATE), 80, y + 22, { align: 'center' });
    doc.text(totalGst.toFixed(2), 102, y + 22, { align: 'right' });
    doc.text(totalGst.toFixed(2), 128, y + 22, { align: 'right' });

    // Totals row (shifted down slightly to fit the box cleanly)
    const totalRowY = y + 28 + Math.max(0, (H - 30));
    setFont(doc, FONTS.bold, 8.5, COLORS.black);
    doc.text('TOTAL', 28, totalRowY, { align: 'right' });
    doc.text(totalBase.toFixed(2), 62, totalRowY, { align: 'right' });
    doc.text(totalGst.toFixed(2), 102, totalRowY, { align: 'right' });
    doc.text(totalGst.toFixed(2), 128, totalRowY, { align: 'right' });

    // ── Right: Totals ──
    hLine(doc, 130, y + 6, 200);

    const rightRow = (label, value, ly, bold = false) => {
        setFont(doc, bold ? FONTS.bold : FONTS.normal, 8.5, COLORS.black);
        doc.text(label, 132, ly);
        doc.text(':', 155, ly);
        doc.text(value, 198, ly, { align: 'right' });
    };

    setFont(doc, FONTS.normal, 8.5, COLORS.black);
    doc.text('Sub Total', 132, y + 4.5);
    doc.text(':', 155, y + 4.5);
    doc.text(fmt(netTotal), 198, y + 4.5, { align: 'right' });

    hLine(doc, 130, y + 12, 200);
    setFont(doc, FONTS.bold, 8.5, COLORS.black);
    doc.text('Total', 132, y + 10);
    doc.text(':', 155, y + 10);
    doc.text(fmt(netTotal), 198, y + 10, { align: 'right' });

    hLine(doc, 130, y + 18, 200);
    setFont(doc, FONTS.bold, 8, COLORS.black);
    doc.text('Invoice Amount in Words:', 132, y + 16);

    setFont(doc, FONTS.normal, 8.5, COLORS.midGray);
    doc.text(splitWords, 132, y + 22);

    return { y: y + H, netTotal };
}

/**
 * Renders the payment mode block.
 * @returns {number} Updated Y position after the block.
 */
function renderPaymentMode(doc, y, order, netTotal) {
    const H = 12;
    box(doc, PAGE.margin, y, PAGE.innerWidth, H);
    hLine(doc, PAGE.margin, y + 6, 200);
    vLine(doc, 130, y, y + H);

    setFont(doc, FONTS.bold, 8.5, COLORS.black);
    doc.text('Payment Mode:', 12, y + 4.5);

    setFont(doc, FONTS.normal, 8.5, COLORS.midGray);
    doc.text(order.paymentMethod || 'Cash', 12, y + 10);

    const rightEntry = (label, value, ly) => {
        setFont(doc, FONTS.normal, 8.5, COLORS.midGray);
        doc.text(label, 132, ly);
        doc.text(':', 155, ly);
        doc.text(value, 198, ly, { align: 'right' });
    };

    rightEntry('Received', fmt(netTotal), y + 4.5);
    rightEntry('Balance', `${INR_SYMBOL} 0.00`, y + 10);

    return y + H + 3; // small visual gap
}

/**
 * Renders the Terms & Conditions block.
 * @returns {number} Updated Y position after the block.
 */
function renderTerms(doc, y) {
    const H = 10;
    box(doc, PAGE.margin, y, PAGE.innerWidth, H);
    hLine(doc, PAGE.margin, y + 5, 200);

    setFont(doc, FONTS.bold, 8.5, [50, 50, 50]);
    doc.text('Terms & Conditions:', 12, y + 4);

    setFont(doc, FONTS.normal, 8.5, COLORS.midGray);
    doc.text('Thanks for doing business with us!', 12, y + 8.5);

    return y + H;
}

/**
 * Renders the Bank Details + Signatory block.
 * @returns {number} Updated Y position after the block.
 */
function renderBankDetails(doc, y) {
    const H = 24;
    box(doc, PAGE.margin, y, PAGE.innerWidth, H);
    vLine(doc, 100, y, y + H);
    hLine(doc, PAGE.margin, y + 5, 200);

    // — Headings —
    setFont(doc, FONTS.bold, 8.5, [50, 50, 50]);
    doc.text('Bank Details:', 12, y + 4);
    doc.text('For Bal Jyoti Design Pvt. Ltd.:', 102, y + 4);

    // — Bank info rows —
    const bankRow = (label, value, ly) => {
        setFont(doc, FONTS.normal, 8, COLORS.midGray);
        doc.text(`${label} :`, 12, ly);
        setFont(doc, FONTS.bold, 8, COLORS.midGray);
        doc.text(value, 45, ly);
    };

    bankRow('Name', COMPANY.bank.name, y + 10);
    bankRow('Account No.', COMPANY.bank.accountNo, y + 14);
    bankRow('IFSC code', COMPANY.bank.ifsc, y + 18);
    bankRow("Account holder's name", COMPANY.bank.accountHolder, y + 22);

    // — Signatory —
    setFont(doc, FONTS.italic, 16, COLORS.signature);
    doc.text(COMPANY.signatory, 150, y + 16, { align: 'center' });

    setFont(doc, FONTS.normal, 8.5, [30, 30, 30]);
    doc.text('Authorized Signatory', 150, y + 21, { align: 'center' });

    return y + H;
}

// ─────────────────────────────────────────────
// MAIN EXPORT
// ─────────────────────────────────────────────

const loadLogo = () => {
    return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.src = '/images/logo.png';
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            resolve(canvas.toDataURL('image/png'));
        };
        img.onerror = () => resolve(null);
    });
};

export async function generateInvoice(order, currentUser = null) {
    const doc = new jsPDF('p', 'mm', 'a4');
    doc.setDrawColor(...COLORS.lightGray);
    doc.setLineWidth(0.3);

    const logoBase64 = await loadLogo();

    let y = 16;

    renderTitle(doc);
    y = renderHeader(doc, y, logoBase64);
    y = renderBillTo(doc, y, order, currentUser);

    const { y: afterTable, totalBase, totalGst } = renderItemsTable(doc, y, order);
    y = afterTable;

    // Page break guard
    if (y > 200) { doc.addPage(); y = 20; }

    const { y: afterTax, netTotal } = renderTaxSummary(doc, y, totalBase, totalGst);
    y = afterTax;

    y = renderPaymentMode(doc, y, order, netTotal);
    y = renderTerms(doc, y);
    renderBankDetails(doc, y);

    const orderId = shortOrderId(order._id);
    doc.save(`Tax_Invoice_BALJYOTI_${orderId}.pdf`);
}