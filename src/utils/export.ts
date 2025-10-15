import Papa from 'papaparse'
import jsPDF from 'jspdf'
import 'jspdf-autotable'

export function exportCSV(rows: any[], filename='data.csv') {
  const csv = Papa.unparse(rows)
  const blob = new Blob([csv], { type:'text/csv;charset=utf-8;' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob); a.download = filename; a.click()
}

export function exportPDF(
  rows: any[],
  columns: { header:string; dataKey:string }[],
  filename='data.pdf'
) {
  const doc = new jsPDF()
  // @ts-ignore
  doc.autoTable({ columns, body: rows })
  doc.save(filename)
}