// =====================================================================
// Seed — akun contoh (Langkah 2, docs/CLAUDE.md §10:
// "Empat akun dan contoh dapat masuk")
//
// Membuat LIMA akun: satu per peran organisasi (kasubdit, kanit, panit,
// anggota) DITAMBAH satu Akun Pemeliharaan (BR-17: sistem selalu punya
// tepat satu). Akun Pemeliharaan bukan bagian dari "empat akun contoh"
// pada kriteria Langkah 2, tetapi tanpanya EC-6.1-09 (Kasubdit lupa
// kata sandi) tidak punya jalan pemulihan sama sekali — jadi dibuat
// sekarang juga, bukan ditunda.
//
// TIDAK DAPAT dijalankan sebagai migrasi SQL biasa: pembuatan akun
// pada sistem autentikasi Supabase wajib lewat Admin API (createUser),
// karena penyandian kata sandi ditangani GoTrue, bukan basis data.
//
// CARA MENJALANKAN
//   1. Salin .env.example.local menjadi .env.local, isi
//      NEXT_PUBLIC_SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY dari
//      Project Settings -> API pada dashboard Supabase.
//   2. node --env-file=.env.local supabase/seed/002_akun_contoh.mjs
//
// JANGAN PERNAH menaruh SUPABASE_SERVICE_ROLE_KEY di sisi klien atau
// mengunggahnya ke git (sudah dikecualikan lewat .env* pada .gitignore).
// Skrip ini hanya untuk dijalankan manual dari komputer pengembang,
// bukan bagian dari aplikasi yang berjalan.
// =====================================================================

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(
    'Kosong: NEXT_PUBLIC_SUPABASE_URL dan/atau SUPABASE_SERVICE_ROLE_KEY.\n' +
    'Isi dulu .env.local, lalu jalankan lagi dengan --env-file=.env.local'
  )
  process.exit(1)
}

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

// Kata sandi sementara bersama untuk seluruh akun contoh. Nyata-nyata
// "sementara": wajib_ganti_sandi diisi benar di bawah, sesuai BR-18.
const KATA_SANDI_SEMENTARA = 'GantiSaya123'

// CATATAN: docs/10-modul-6.1-auth.md §5.1 menulis unit_id "Bernilai
// kosong HANYA untuk peran pemeliharaan" — artinya Kasubdit tetap
// wajib memiliki unit_id meski lingkup datanya mencakup seluruh unit.
// Dibaca sebagai "unit pos administratifnya", bukan pembatas akses:
// seluruh kebijakan akses baris memeriksa peran='kasubdit' lebih
// dulu, sebelum menyentuh unit_id sama sekali. Ditemukan lewat
// constraint chk_users_unit_hanya_pemeliharaan_kosong saat menguji
// migrasi 0002 secara lokal — dicatat di sini supaya tidak
// ditebak ulang di kemudian hari.
const AKUN_CONTOH = [
  { nrp: '00000001', nama: 'Contoh Kasubdit',  pangkat: 'AKBP', peran: 'kasubdit',    unit: 'Unit I' },
  { nrp: '00000002', nama: 'Contoh Kanit',     pangkat: 'AKP',  peran: 'kanit',       unit: 'Unit I' },
  { nrp: '00000003', nama: 'Contoh Panit',     pangkat: 'IPTU', peran: 'panit',       unit: 'Unit I' },
  { nrp: '00000004', nama: 'Contoh Anggota',   pangkat: 'BRIPKA', peran: 'anggota',   unit: 'Unit I' },
  { nrp: '00000005', nama: 'Akun Pemeliharaan', pangkat: null,  peran: 'pemeliharaan', unit: null },
]

async function unitIdByName(nama) {
  if (!nama) return null
  const { data, error } = await admin.from('unit').select('id').eq('nama', nama).single()
  if (error) throw new Error(`Unit "${nama}" tidak ditemukan — jalankan seed 001_unit.sql dulu. (${error.message})`)
  return data.id
}

async function buatSatuAkun(akun) {
  const email_sistem = `${akun.nrp}@sipantau.internal`
  const unit_id = await unitIdByName(akun.unit)

  const { data: dibuat, error: errBuat } = await admin.auth.admin.createUser({
    email: email_sistem,
    password: KATA_SANDI_SEMENTARA,
    email_confirm: true, // tidak ada surel sungguhan yang dikirimi, jadi langsung dianggap terkonfirmasi
  })

  if (errBuat) {
    if (errBuat.message?.toLowerCase().includes('already registered')) {
      console.log(`- Lewati ${akun.nrp} (${akun.peran}): sudah pernah dibuat.`)
      return
    }
    throw errBuat
  }

  const { error: errProfil } = await admin.from('users').insert({
    id: dibuat.user.id,
    nama: akun.nama,
    nrp: akun.nrp,
    email_sistem,
    pangkat: akun.pangkat,
    peran: akun.peran,
    unit_id,
    aktif: true,
    wajib_ganti_sandi: true,
  })

  if (errProfil) {
    // Jangan tinggalkan akun autentikasi yatim tanpa baris profilnya.
    await admin.auth.admin.deleteUser(dibuat.user.id)
    throw errProfil
  }

  console.log(`- Dibuat ${akun.nrp} (${akun.peran}): kata sandi sementara "${KATA_SANDI_SEMENTARA}"`)
}

for (const akun of AKUN_CONTOH) {
  await buatSatuAkun(akun)
}

console.log('\nSelesai. Seluruh akun contoh memakai kata sandi sementara yang sama dan')
console.log('wajib_ganti_sandi = true, sehingga dipaksa mengganti kata sandi pada masuk pertama.')
