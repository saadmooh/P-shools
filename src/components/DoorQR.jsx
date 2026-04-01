import { QRCodeSVG } from 'qrcode.react'
import { motion } from 'framer-motion'
import useUserStore from '../store/userStore'

export default function DoorQR() {
  const { store } = useUserStore()

  const getClaimUrl = () => {
    const baseUrl = window.location.origin
    return `${baseUrl}/rewards/claim/${store?.slug}`
  }

  if (!store) {
    return (
      <div className="p-4 bg-[#1e1e1e] rounded-2xl border border-[#2a2a2a]">
        <p className="text-[#888888] text-sm">Store not loaded</p>
      </div>
    )
  }

  return (
    <div className="p-4 bg-[#1e1e1e] rounded-2xl border border-[#2a2a2a]">
      <h3 className="text-[#f0f0f0] font-bold text-sm mb-3 text-center">Door QR Code</h3>
      <p className="text-[#888888] text-xs mb-4 text-center">
        Place this QR code on your store door. Customers scan it to claim points when they make a purchase.
      </p>
      
      <div className="flex flex-col items-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white p-4 rounded-2xl mb-4"
        >
          <QRCodeSVG
            value={getClaimUrl()}
            size={200}
            level="H"
            includeMargin={false}
          />
        </motion.div>
        
        <p className="text-[#f0f0f0] font-bold text-lg mb-1">{store.name}</p>
        <p className="text-[#888888] text-xs">Scan to earn points</p>
      </div>

      <div className="mt-4 pt-4 border-t border-[#2a2a2a]">
        <p className="text-[#888888] text-xs">
          <span className="text-[#D4AF37] font-bold">How it works:</span> Customer scans → enters waiting queue → you assign points to first in line
        </p>
      </div>
    </div>
  )
}
