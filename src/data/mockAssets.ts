// Sample high-fidelity SVG data URLs for KTP and Transfer proofs

export const SAMPLE_KTP_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 540 340" width="540" height="340">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#4a90e2"/>
      <stop offset="50%" stop-color="#357abd"/>
      <stop offset="100%" stop-color="#2a6496"/>
    </linearGradient>
    <pattern id="waves" width="40" height="20" patternUnits="userSpaceOnUse">
      <path d="M 0 10 Q 10 0 20 10 T 40 10" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="1.5"/>
    </pattern>
  </defs>
  <!-- Card Background -->
  <rect width="540" height="340" rx="16" fill="url(#bg)"/>
  <rect width="540" height="340" rx="16" fill="url(#waves)"/>
  
  <!-- Header -->
  <text x="270" y="32" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#ffffff" text-anchor="middle" letter-spacing="1.5">REPUBLIK INDONESIA</text>
  <text x="270" y="52" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#ffffff" text-anchor="middle" letter-spacing="2">PROVINSI BALI</text>
  <text x="270" y="68" font-family="Arial, sans-serif" font-size="11" font-weight="600" fill="#e0f2fe" text-anchor="middle">KABUPATEN BADUNG</text>
  
  <!-- NIK -->
  <text x="32" y="98" font-family="Arial, sans-serif" font-size="15" font-weight="bold" fill="#ffffff">NIK</text>
  <text x="140" y="98" font-family="Courier, monospace" font-size="17" font-weight="bold" fill="#fef08a" letter-spacing="2">5103011408920002</text>
  
  <!-- Details -->
  <g font-family="Arial, sans-serif" font-size="11" fill="#ffffff" font-weight="bold">
    <text x="32" y="125">Nama</text><text x="135" y="125">: ARYA YUDHISTIRA</text>
    <text x="32" y="148">Tempat/Tgl Lahir</text><text x="135" y="148">: DENPASAR, 14-08-1992</text>
    <text x="32" y="171">Jenis Kelamin</text><text x="135" y="171">: LAKI-LAKI        Gol. Darah: O</text>
    <text x="32" y="194">Alamat</text><text x="135" y="194">: JL. SUNSET ROAD NO. 88</text>
    <text x="50" y="214">RT/RW</text><text x="135" y="214">: 004 / 002</text>
    <text x="50" y="234">Kel/Desa</text><text x="135" y="234">: PECATU</text>
    <text x="50" y="254">Kecamatan</text><text x="135" y="254">: KUTA SELATAN</text>
    <text x="32" y="277">Agama</text><text x="135" y="277">: HINDU</text>
    <text x="32" y="300">Status Perkawinan</text><text x="135" y="300">: KAWIN</text>
    <text x="32" y="322">Kewarganegaraan</text><text x="135" y="322">: WNI</text>
  </g>
  
  <!-- Photo Box -->
  <rect x="400" y="105" width="115" height="150" rx="6" fill="#1e3a8a" stroke="#ffffff" stroke-width="2"/>
  <!-- Avatar Silhouette -->
  <circle cx="457" cy="155" r="32" fill="#93c5fd"/>
  <path d="M 425 240 Q 457 200 490 240 Z" fill="#93c5fd"/>
  
  <!-- Signature Box -->
  <rect x="405" y="265" width="105" height="38" fill="none" stroke="rgba(255,255,255,0.4)" stroke-dasharray="3,3"/>
  <path d="M 415 285 Q 435 270 455 288 T 495 280" fill="none" stroke="#ffffff" stroke-width="2"/>
  <text x="457" y="316" font-family="Arial, sans-serif" font-size="9" fill="#e0f2fe" text-anchor="middle">BERLAKU HINGGA: SEUMUR HIDUP</text>
</svg>
`)}`;

export const SAMPLE_PAYMENT_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 460 620" width="460" height="620">
  <defs>
    <filter id="shadow" x="-5%" y="-5%" width="110%" height="110%">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-opacity="0.15"/>
    </filter>
  </defs>
  <!-- Receipt Paper -->
  <rect width="460" height="620" rx="18" fill="#ffffff"/>
  
  <!-- Top Bank Header -->
  <rect width="460" height="100" rx="18" fill="#003d79"/>
  <rect y="82" width="460" height="18" fill="#003d79"/>
  <text x="230" y="48" font-family="Arial, sans-serif" font-size="22" font-weight="900" fill="#ffffff" text-anchor="middle" letter-spacing="3">BCA</text>
  <text x="230" y="74" font-family="Arial, sans-serif" font-size="12" font-weight="600" fill="#93c5fd" text-anchor="middle">BUKTI TRANSFER BERHASIL</text>

  <!-- Success Icon -->
  <circle cx="230" cy="145" r="32" fill="#ecfdf5"/>
  <circle cx="230" cy="145" r="24" fill="#10b981"/>
  <path d="M 220 145 L 227 152 L 242 137" fill="none" stroke="#ffffff" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>

  <!-- Amount -->
  <text x="230" y="210" font-family="Arial, sans-serif" font-size="13" fill="#64748b" text-anchor="middle">Total Ditransfer</text>
  <text x="230" y="244" font-family="Arial, sans-serif" font-size="26" font-weight="bold" fill="#0f172a" text-anchor="middle">Rp 15.600.000</text>
  
  <line x1="36" y1="270" x2="424" y2="270" stroke="#e2e8f0" stroke-width="1.5" stroke-dasharray="4,4"/>

  <!-- Details Table -->
  <g font-family="Arial, sans-serif" font-size="13" fill="#475569">
    <text x="36" y="305">Waktu Transaksi</text>
    <text x="424" y="305" font-weight="bold" fill="#0f172a" text-anchor="end">26 Sep 2026 10:42 WIB</text>

    <text x="36" y="340">Penerima</text>
    <text x="424" y="340" font-weight="bold" fill="#0f172a" text-anchor="end">PT SAGARA BEACH RESORT</text>

    <text x="36" y="375">Rekening Tujuan</text>
    <text x="424" y="375" font-weight="bold" fill="#0f172a" text-anchor="end">BCA 8820 1928 331</text>

    <text x="36" y="410">Nama Tamu</text>
    <text x="424" y="410" font-weight="bold" fill="#0f172a" text-anchor="end">Arya Yudhistira</text>

    <text x="36" y="445">Villa</text>
    <text x="424" y="445" font-weight="bold" fill="#0f172a" text-anchor="end">Sagara Cliffside Villa</text>

    <text x="36" y="480">Durasi</text>
    <text x="424" y="480" font-weight="bold" fill="#0f172a" text-anchor="end">2 Malam (Oceanfront)</text>

    <text x="36" y="515">No. Referensi Bank</text>
    <text x="424" y="515" font-family="Courier, monospace" font-size="12" font-weight="bold" fill="#0f172a" text-anchor="end">TRX-BCA-98218731</text>
  </g>

  <rect x="36" y="545" width="388" height="42" rx="8" fill="#f8fafc" stroke="#e2e8f0"/>
  <text x="230" y="571" font-family="Arial, sans-serif" font-size="11" font-weight="600" fill="#059669" text-anchor="middle">✓ Transaksi Dinyatakan Sah Oleh Sistem Perbankan</text>
</svg>
`)}`;
