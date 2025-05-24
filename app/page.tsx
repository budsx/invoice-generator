"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Plus, Trash2, FileText, Download, Printer } from "lucide-react";

interface InvoiceItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  total: number
}

interface InvoiceData {
  companyName: string
  companyAddress: string
  companyPhone: string
  companyEmail: string
  clientName: string
  clientAddress: string
  clientPhone: string
  clientEmail: string
  invoiceNumber: string
  date: string
  dueDate: string
  items: InvoiceItem[]
  discount: number
  discountType: "percentage" | "fixed"
  tax: number
  taxType: "percentage" | "fixed"
  notes: string
  paymentDetails: {
    bankName: string
    accountNumber: string
    accountName: string
    paymentMethod: string
  }
}

export default function InvoiceGenerator() {
  const printRef = useRef<HTMLDivElement>(null)

  const [invoiceData, setInvoiceData] = useState<InvoiceData>({
    companyName: "",
    companyAddress: "",
    companyPhone: "",
    companyEmail: "",
    clientName: "",
    clientAddress: "",
    clientPhone: "",
    clientEmail: "",
    invoiceNumber: "",
    date: new Date().toISOString().split("T")[0],
    dueDate: "",
    items: [{ id: "1", description: "", quantity: 1, unitPrice: 0, total: 0 }],
    discount: 0,
    discountType: "percentage",
    tax: 0,
    taxType: "percentage",
    notes: "",
    paymentDetails: {
      bankName: "",
      accountNumber: "",
      accountName: "",
      paymentMethod: "",
    },
  })

  const updateInvoiceData = (field: keyof InvoiceData, value: any) => {
    setInvoiceData((prev) => ({ ...prev, [field]: value }))
  }

  const updatePaymentDetails = (field: keyof InvoiceData["paymentDetails"], value: string) => {
    setInvoiceData((prev) => ({
      ...prev,
      paymentDetails: { ...prev.paymentDetails, [field]: value },
    }))
  }

  const addItem = () => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      description: "",
      quantity: 1,
      unitPrice: 0,
      total: 0,
    }
    setInvoiceData((prev) => ({
      ...prev,
      items: [...prev.items, newItem],
    }))
  }

  const removeItem = (id: string) => {
    setInvoiceData((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.id !== id),
    }))
  }

  const updateItem = (id: string, field: keyof InvoiceItem, value: any) => {
    setInvoiceData((prev) => ({
      ...prev,
      items: prev.items.map((item) => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value }
          if (field === "quantity" || field === "unitPrice") {
            updatedItem.total = updatedItem.quantity * updatedItem.unitPrice
          }
          return updatedItem
        }
        return item
      }),
    }))
  }

  const calculateGrandTotal = () => {
    const subtotal = invoiceData.items.reduce((sum, item) => sum + item.total, 0)

    let discountAmount = 0
    if (invoiceData.discountType === "percentage") {
      discountAmount = (subtotal * invoiceData.discount) / 100
    } else {
      discountAmount = invoiceData.discount
    }

    const afterDiscount = subtotal - discountAmount

    let taxAmount = 0
    if (invoiceData.taxType === "percentage") {
      taxAmount = (afterDiscount * invoiceData.tax) / 100
    } else {
      taxAmount = invoiceData.tax
    }

    return {
      subtotal,
      discountAmount,
      afterDiscount,
      taxAmount,
      grandTotal: afterDiscount + taxAmount,
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(amount)
  }

  const handlePrint = () => {
    window.print()
  }

  const handleDownloadPDF = async () => {
    const element = printRef.current;
    if (!element) return;

    try {
      const html2pdf = (await import('html2pdf.js')).default;
      
      const opt = {
        margin: 1,
        filename: `Invoice-${invoiceData.invoiceNumber || 'draft'}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
      };

      html2pdf().set(opt).from(element).save();
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Generator Invoice</h1>
          <p className="text-gray-600">Buat invoice profesional dengan mudah</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Input */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Informasi Perusahaan
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="companyName">Nama Perusahaan</Label>
                  <Input
                    id="companyName"
                    value={invoiceData.companyName}
                    onChange={(e) => updateInvoiceData("companyName", e.target.value)}
                    placeholder="PT. Contoh Perusahaan"
                  />
                </div>
                <div>
                  <Label htmlFor="companyAddress">Alamat Perusahaan</Label>
                  <Textarea
                    id="companyAddress"
                    value={invoiceData.companyAddress}
                    onChange={(e) => updateInvoiceData("companyAddress", e.target.value)}
                    placeholder="Jl. Contoh No. 123, Jakarta"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="companyPhone">Nomor Telepon</Label>
                    <Input
                      id="companyPhone"
                      value={invoiceData.companyPhone}
                      onChange={(e) => updateInvoiceData("companyPhone", e.target.value)}
                      placeholder="+62 812-3456-7890"
                    />
                  </div>
                  <div>
                    <Label htmlFor="companyEmail">Email</Label>
                    <Input
                      id="companyEmail"
                      type="email"
                      value={invoiceData.companyEmail}
                      onChange={(e) => updateInvoiceData("companyEmail", e.target.value)}
                      placeholder="info@perusahaan.com"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Informasi Klien</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="clientName">Nama Klien</Label>
                  <Input
                    id="clientName"
                    value={invoiceData.clientName}
                    onChange={(e) => updateInvoiceData("clientName", e.target.value)}
                    placeholder="Nama Klien"
                  />
                </div>
                <div>
                  <Label htmlFor="clientAddress">Alamat Klien</Label>
                  <Textarea
                    id="clientAddress"
                    value={invoiceData.clientAddress}
                    onChange={(e) => updateInvoiceData("clientAddress", e.target.value)}
                    placeholder="Alamat lengkap klien"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="clientPhone">Nomor Telepon</Label>
                    <Input
                      id="clientPhone"
                      value={invoiceData.clientPhone}
                      onChange={(e) => updateInvoiceData("clientPhone", e.target.value)}
                      placeholder="+62 812-3456-7890"
                    />
                  </div>
                  <div>
                    <Label htmlFor="clientEmail">Email</Label>
                    <Input
                      id="clientEmail"
                      type="email"
                      value={invoiceData.clientEmail}
                      onChange={(e) => updateInvoiceData("clientEmail", e.target.value)}
                      placeholder="klien@email.com"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Detail Invoice</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="invoiceNumber">Nomor Invoice</Label>
                    <Input
                      id="invoiceNumber"
                      value={invoiceData.invoiceNumber}
                      onChange={(e) => updateInvoiceData("invoiceNumber", e.target.value)}
                      placeholder="INV-001"
                    />
                  </div>
                  <div>
                    <Label htmlFor="date">Tanggal</Label>
                    <Input
                      id="date"
                      type="date"
                      value={invoiceData.date}
                      onChange={(e) => updateInvoiceData("date", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="dueDate">Tanggal Jatuh Tempo</Label>
                    <Input
                      id="dueDate"
                      type="date"
                      value={invoiceData.dueDate}
                      onChange={(e) => updateInvoiceData("dueDate", e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Produk / Jasa
                  <Button onClick={addItem} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Tambah Item
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {invoiceData.items.map((item, index) => (
                    <div key={item.id} className="grid grid-cols-12 gap-2 items-end">
                      <div className="col-span-5">
                        {index === 0 && <Label className="text-xs">Deskripsi</Label>}
                        <Input
                          value={item.description}
                          onChange={(e) => updateItem(item.id, "description", e.target.value)}
                          placeholder="Deskripsi produk/jasa"
                        />
                      </div>
                      <div className="col-span-2">
                        {index === 0 && <Label className="text-xs">Kuantitas</Label>}
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateItem(item.id, "quantity", Number.parseInt(e.target.value) || 0)}
                          min="1"
                        />
                      </div>
                      <div className="col-span-2">
                        {index === 0 && <Label className="text-xs">Harga Satuan</Label>}
                        <Input
                          type="number"
                          value={item.unitPrice}
                          onChange={(e) => updateItem(item.id, "unitPrice", Number.parseFloat(e.target.value) || 0)}
                          min="0"
                        />
                      </div>
                      <div className="col-span-2">
                        {index === 0 && <Label className="text-xs">Total</Label>}
                        <Input value={formatCurrency(item.total)} readOnly className="bg-gray-50" />
                      </div>
                      <div className="col-span-1">
                        {invoiceData.items.length > 1 && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeItem(item.id)}
                            className="h-10 w-10 p-0"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Diskon & Pajak</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="discount">Diskon</Label>
                    <div className="flex gap-2">
                      <Input
                        id="discount"
                        type="number"
                        value={invoiceData.discount}
                        onChange={(e) => updateInvoiceData("discount", Number.parseFloat(e.target.value) || 0)}
                        min="0"
                        placeholder="0"
                      />
                      <select
                        value={invoiceData.discountType}
                        onChange={(e) => updateInvoiceData("discountType", e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                      >
                        <option value="percentage">%</option>
                        <option value="fixed">IDR</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="tax">Pajak</Label>
                    <div className="flex gap-2">
                      <Input
                        id="tax"
                        type="number"
                        value={invoiceData.tax}
                        onChange={(e) => updateInvoiceData("tax", Number.parseFloat(e.target.value) || 0)}
                        min="0"
                        placeholder="0"
                      />
                      <select
                        value={invoiceData.taxType}
                        onChange={(e) => updateInvoiceData("taxType", e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                      >
                        <option value="percentage">%</option>
                        <option value="fixed">IDR</option>
                      </select>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Detail Pembayaran</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="bankName">Nama Bank</Label>
                    <Input
                      id="bankName"
                      value={invoiceData.paymentDetails.bankName}
                      onChange={(e) => updatePaymentDetails("bankName", e.target.value)}
                      placeholder="Bank Central Asia"
                    />
                  </div>
                  <div>
                    <Label htmlFor="accountNumber">Nomor Rekening</Label>
                    <Input
                      id="accountNumber"
                      value={invoiceData.paymentDetails.accountNumber}
                      onChange={(e) => updatePaymentDetails("accountNumber", e.target.value)}
                      placeholder="1234567890"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="accountName">Nama Pemilik Rekening</Label>
                    <Input
                      id="accountName"
                      value={invoiceData.paymentDetails.accountName}
                      onChange={(e) => updatePaymentDetails("accountName", e.target.value)}
                      placeholder="PT. Contoh Perusahaan"
                    />
                  </div>
                  <div>
                    <Label htmlFor="paymentMethod">Metode Pembayaran</Label>
                    <Input
                      id="paymentMethod"
                      value={invoiceData.paymentDetails.paymentMethod}
                      onChange={(e) => updatePaymentDetails("paymentMethod", e.target.value)}
                      placeholder="Transfer Bank, Cash, dll"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Catatan Tambahan</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={invoiceData.notes}
                  onChange={(e) => updateInvoiceData("notes", e.target.value)}
                  placeholder="Catatan atau instruksi pembayaran (opsional)"
                  rows={3}
                />
              </CardContent>
            </Card>

            <div className="flex gap-4">
              <Button onClick={handlePrint} className="flex-1">
                <Printer className="h-4 w-4 mr-2" />
                Cetak Invoice
              </Button>
              <Button onClick={handleDownloadPDF} variant="outline" className="flex-1">
                <Download className="h-4 w-4 mr-2" />
                Unduh PDF
              </Button>
            </div>
          </div>

          {/* Preview Invoice */}
          <div className="lg:sticky lg:top-4">
            <Card>
              <CardHeader>
                <CardTitle>Preview Invoice</CardTitle>
              </CardHeader>
              <CardContent>
                <div ref={printRef} className="bg-white p-8 border rounded-lg print:border-0 print:shadow-none">
                  <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">INVOICE</h1>
                    <div className="grid grid-cols-2 gap-8">
                      <div>
                        <h3 className="font-semibold text-gray-700 mb-2">Dari:</h3>
                        <div className="text-sm">
                          <p className="font-medium">{invoiceData.companyName || "Nama Perusahaan"}</p>
                          <p className="text-gray-600 whitespace-pre-line">
                            {invoiceData.companyAddress || "Alamat Perusahaan"}
                          </p>
                          {invoiceData.companyPhone && <p className="text-gray-600">Tel: {invoiceData.companyPhone}</p>}
                          {invoiceData.companyEmail && (
                            <p className="text-gray-600">Email: {invoiceData.companyEmail}</p>
                          )}
                        </div>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-700 mb-2">Kepada:</h3>
                        <div className="text-sm">
                          <p className="font-medium">{invoiceData.clientName || "Nama Klien"}</p>
                          <p className="text-gray-600 whitespace-pre-line">
                            {invoiceData.clientAddress || "Alamat Klien"}
                          </p>
                          {invoiceData.clientPhone && <p className="text-gray-600">Tel: {invoiceData.clientPhone}</p>}
                          {invoiceData.clientEmail && <p className="text-gray-600">Email: {invoiceData.clientEmail}</p>}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-8">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Nomor Invoice</p>
                      <p className="text-lg font-semibold">{invoiceData.invoiceNumber || "INV-001"}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Tanggal</p>
                      <p className="text-lg">
                        {invoiceData.date ? new Date(invoiceData.date).toLocaleDateString("id-ID") : "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Jatuh Tempo</p>
                      <p className="text-lg">
                        {invoiceData.dueDate ? new Date(invoiceData.dueDate).toLocaleDateString("id-ID") : "-"}
                      </p>
                    </div>
                  </div>

                  <div className="mb-8">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b-2 border-gray-200">
                          <th className="text-left py-2 font-semibold text-gray-700">Deskripsi</th>
                          <th className="text-center py-2 font-semibold text-gray-700">Qty</th>
                          <th className="text-right py-2 font-semibold text-gray-700">Harga Satuan</th>
                          <th className="text-right py-2 font-semibold text-gray-700">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {invoiceData.items.map((item) => (
                          <tr key={item.id} className="border-b border-gray-100">
                            <td className="py-3">{item.description || "Deskripsi item"}</td>
                            <td className="py-3 text-center">{item.quantity}</td>
                            <td className="py-3 text-right">{formatCurrency(item.unitPrice)}</td>
                            <td className="py-3 text-right font-medium">{formatCurrency(item.total)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex justify-end mb-8">
                    <div className="w-80">
                      {(() => {
                        const totals = calculateGrandTotal()
                        return (
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span>Subtotal:</span>
                              <span>{formatCurrency(totals.subtotal)}</span>
                            </div>
                            {invoiceData.discount > 0 && (
                              <div className="flex justify-between text-red-600">
                                <span>
                                  Diskon ({invoiceData.discount}
                                  {invoiceData.discountType === "percentage" ? "%" : " IDR"}):
                                </span>
                                <span>-{formatCurrency(totals.discountAmount)}</span>
                              </div>
                            )}
                            {invoiceData.tax > 0 && (
                              <div className="flex justify-between">
                                <span>
                                  Pajak ({invoiceData.tax}
                                  {invoiceData.taxType === "percentage" ? "%" : " IDR"}):
                                </span>
                                <span>{formatCurrency(totals.taxAmount)}</span>
                              </div>
                            )}
                            <Separator className="my-2" />
                            <div className="flex justify-between items-center text-lg font-bold">
                              <span>Total:</span>
                              <span>{formatCurrency(totals.grandTotal)}</span>
                            </div>
                          </div>
                        )
                      })()}
                    </div>
                  </div>

                  {(invoiceData.paymentDetails.bankName || invoiceData.paymentDetails.accountNumber) && (
                    <div className="mb-6 border-t pt-4">
                      <h4 className="font-semibold text-gray-700 mb-3">Detail Pembayaran:</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        {invoiceData.paymentDetails.bankName && (
                          <div>
                            <span className="font-medium">Bank: </span>
                            <span>{invoiceData.paymentDetails.bankName}</span>
                          </div>
                        )}
                        {invoiceData.paymentDetails.accountNumber && (
                          <div>
                            <span className="font-medium">No. Rekening: </span>
                            <span>{invoiceData.paymentDetails.accountNumber}</span>
                          </div>
                        )}
                        {invoiceData.paymentDetails.accountName && (
                          <div>
                            <span className="font-medium">Atas Nama: </span>
                            <span>{invoiceData.paymentDetails.accountName}</span>
                          </div>
                        )}
                        {invoiceData.paymentDetails.paymentMethod && (
                          <div>
                            <span className="font-medium">Metode: </span>
                            <span>{invoiceData.paymentDetails.paymentMethod}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {invoiceData.notes && (
                    <div className="border-t pt-4">
                      <h4 className="font-semibold text-gray-700 mb-2">Catatan:</h4>
                      <p className="text-sm text-gray-600 whitespace-pre-line">{invoiceData.notes}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:border-0,
          .print\\:border-0 * {
            visibility: visible;
          }
          .print\\:border-0 {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
    </div>
  )
}
