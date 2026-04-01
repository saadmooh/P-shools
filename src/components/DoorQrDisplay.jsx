import { QRCodeSVG } from 'qrcode.react'
import { Printer } from 'lucide-react'

export default function DoorQrDisplay({ storeSlug, storeName }) {
  const baseUrl = window.location.origin
  const claimUrl = `${baseUrl}/rewards/claim/${storeSlug}`

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="flex flex-col items-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white p-4 rounded-2xl mb-4"
      >
        <QRCodeSVG
          value={claimUrl}
          size={180}
          level="H"
          includeMargin={false}
        />
      </motion.div>
      
      {storeName && (
        <p className="text-[#f0f0f0] font-bold text-lg mb-1">{storeName}</p>
      )}
      <p className="text-[#888888] text-xs mb-4">Scan to earn points</p>

      <button
        onClick={handlePrint}
        className="flex items-center gap-2 px-4 py-2 bg-[#2a2a2a] text-[#f0f0f0] rounded-lg text-sm font-medium hover:bg-[#3a3a3a] transition-colors"
      >
        <Printer size={16} />
        Print QR
      </button>

      <div className="mt-4 pt-4 border-t border-[#2a2a2a] w-full">
        <p className="text-[#888888] text-xs text-center">
          <span className="text-[#D4AF37] font-bold">How it works:</span> Customer scans → enters waiting queue → you assign points to first in line
        </p>
      </div>
    </div>
  )
}
