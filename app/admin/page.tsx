'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'

type Profile = {
  id: string
  callsign: string
  created_at: string
  is_active: boolean
}

type Stats = {
  users: number
  activations: number
  qsos: number
}

export default function AdminPage() {
  const router = useRouter()
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [stats, setStats] = useState<Stats>({ users: 0, activations: 0, qsos: 0 })
  const [emailSubject, setEmailSubject] = useState('')
  const [emailBody, setEmailBody] = useState('')
  const [emailStatus, setEmailStatus] = useState('')
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'users' | 'email' | 'activations'>('users')
  const [soloTarget, setSoloTarget] = useState<Profile | null>(null)
  const [soloSubject, setSoloSubject] = useState('')
  const [soloBody, setSoloBody] = useState('')
  const [soloStatus, setSoloStatus] = useState('')
  const composeRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
