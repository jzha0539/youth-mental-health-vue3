import Papa from 'papaparse'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'  

function stamp() {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}`
}

export function exportCSV(rows: any[], filename = 'data') {
  const csv = Papa.unparse(rows || [])
  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `${filename}_${stamp()}.csv`
  document.body.appendChild(a)
  a.click()
  URL.revokeObjectURL(a.href)
  a.remove()
}

export function exportPDF(
  rows: any[],
  columns: { header: string; dataKey: string }[],
  filename = 'data'
) {
  const doc = new jsPDF({ orientation: 'p', unit: 'pt', format: 'a4' })

  autoTable(doc, {
    columns,
    body: rows || [],
    margin: 24,
    styles: { fontSize: 10, cellPadding: 6 },
    headStyles: { fillColor: [37, 99, 235] }, 
  })

  doc.save(`${filename}_${stamp()}.pdf`)
}