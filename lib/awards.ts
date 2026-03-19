// ============================================================
// OOTA Awards Engine
// All 28 award definitions + server-side evaluator
// ============================================================

import { supabase } from '@/lib/supabase'

export type AwardCategory = 'milestone' | 'band' | 'mode' | 'grid' | 'dxcc' | 'special' | 'satellite'

export interface AwardDef {
  slug: string
  name: string
  category: AwardCategory
  description: string
  threshold?: string
}

export interface EvaluatedAward {
  award: AwardDef
  earned: boolean
  progress: number
  current: number
  required: number
}

// ============================================================
// AWARD DEFINITIONS
// ============================================================

export const AWARD_DEFINITIONS: AwardDef[] = [
  // --- Activation Milestones (8) ---
  { slug: 'first_activation',  category: 'milestone', name: 'First Light',     threshold: '1 activation',       description: 'You left home. You made contact. You are OOTA.' },
  { slug: 'activations_5',     category: 'milestone', name: 'Field Operator',  threshold: '5 activations',      description: 'The field is starting to feel familiar.' },
  { slug: 'activations_25',    category: 'milestone', name: 'Road Warrior',    threshold: '25 activations',     description: 'You go out regardless of conditions.' },
  { slug: 'activations_50',    category: 'milestone', name: 'Wanderer',        threshold: '50 activations',     description: 'The road is the destination.' },
  { slug: 'activations_100',   category: 'milestone', name: 'Pathfinder',      threshold: '100 activations',    description: 'You have found places others never will.' },
  { slug: 'activations_250',   category: 'milestone', name: 'Phantom',         threshold: '250 activations',    description: 'You appear on the bands without warning.' },
  { slug: 'activations_500',   category: 'milestone', name: 'Nomad',           threshold: '500 activations',    description: 'Home is wherever the antenna goes up.' },
  { slug: 'activations_1000',  category: 'milestone', name: 'Legend',          threshold: '1,000 activations',  description: 'There is nothing left to prove. You do it anyway.' },

  // --- Band Endorsements (7) ---
  { slug: 'band_160m', category: 'band', name: '160m', description: 'Complete at least one activation on 160m.' },
  { slug: 'band_80m',  category: 'band', name: '80m',  description: 'Complete at least one activation on 80m.' },
  { slug: 'band_40m',  category: 'band', name: '40m',  description: 'Complete at least one activation on 40m.' },
  { slug: 'band_20m',  category: 'band', name: '20m',  description: 'Complete at least one activation on 20m.' },
  { slug: 'band_15m',  category: 'band', name: '15m',  description: 'Complete at least one activation on 15m.' },
  { slug: 'band_10m',  category: 'band', name: '10m',  description: 'Complete at least one activation on 10m.' },
  { slug: 'band_6m',   category: 'band', name: '6m',   description: 'Complete at least one activation on 6m.' },

  // --- Mode Endorsements (2) ---
  { slug: 'mode_voice', category: 'mode', name: 'Voice', description: 'Complete a full activation using only SSB, AM, or FM.' },
  { slug: 'mode_fist',  category: 'mode', name: 'Fist',  description: 'Complete a full activation using only CW. No phone contacts.' },

  // --- Grid Awards (4) ---
  { slug: 'grid_walker', category: 'grid', name: 'Grid Walker', threshold: '10 unique grids',  description: 'Activate from 10 unique Maidenhead grid squares.' },
  { slug: 'grid_chaser', category: 'grid', name: 'Grid Chaser', threshold: '25 unique grids',  description: 'Activate from 25 unique Maidenhead grid squares.' },
  { slug: 'grid_hunter', category: 'grid', name: 'Grid Hunter', threshold: '50 unique grids',  description: 'Activate from 50 unique Maidenhead grid squares.' },
  { slug: 'grid_master', category: 'grid', name: 'Grid Master', threshold: '100 unique grids', description: 'Activate from 100 unique Maidenhead grid squares.' },

  // --- DXCC Awards (3) ---
  { slug: 'dx_initiated',  category: 'dxcc', name: 'DX Initiated',  threshold: '5 DXCC entities',  description: 'Activate from or work stations in 5 unique DXCC entities.' },
  { slug: 'dx_operator',   category: 'dxcc', name: 'DX Operator',   threshold: '15 DXCC entities', description: 'Activate from or work stations in 15 unique DXCC entities.' },
  { slug: 'dx_pathfinder', category: 'dxcc', name: 'DX Pathfinder', threshold: '30 DXCC entities', description: 'Activate from or work stations in 30 unique DXCC entities.' },

  // --- Out of This World / Satellite (5) ---
  { slug: 'sat_first_contact', category: 'satellite', name: 'First Contact',  description: 'Complete your first QSO through an amateur satellite. Any bird counts.' },
  { slug: 'sat_bird_watcher',  category: 'satellite', name: 'Bird Watcher',   threshold: '5 unique satellites',  description: 'Work 5 unique amateur satellites. Learn the passes.' },
  { slug: 'sat_orbital',       category: 'satellite', name: 'Orbital',        threshold: '10 unique satellites', description: 'Work 10 unique amateur satellites. You know the sky.' },
  { slug: 'sat_star_catcher',  category: 'satellite', name: 'Star Catcher',   threshold: '25 unique satellites', description: 'Work 25 unique amateur satellites. The sky is not the limit.' },
  { slug: 'sat_exosphere',     category: 'satellite', name: 'Exosphere',      description: 'Complete a QSO via the ISS or any crewed spacecraft. The rarest of all.' },

  // --- Special & Seasonal (4) ---
  { slug: 'night_owl',       category: 'special', name: 'Night Owl',       description: 'Complete an activation between 0000–0400 UTC. The bands belong to the patient.' },
  { slug: 'iron_winter',     category: 'special', name: 'Iron Winter',     description: 'Activate in December, January, or February. Cold fingers, warm signal.' },
  { slug: 'first_of_year',   category: 'special', name: 'First of Year',   description: 'Log an activation on January 1st. Start the year the right way.' },
  { slug: 'midnight_herald', category: 'special', name: 'Midnight Herald', description: 'Activate between 2300 UTC Dec 31 and 0200 UTC Jan 1. Be on the air when the year turns.' },
]

// ============================================================
// AWARD EVALUATOR
// ============================================================

export async function evaluateAwards(userId: string): Promise<EvaluatedAward[]> {
  // Fetch all successful activations for this user
  const { data: activations, error: actError } = await supabase
    .from('activations')
    .select('id, activation_date, grid_square, dxcc_code, submitted_at')
    .eq('user_id', userId)
    .eq('is_successful', true)

  if (actError) throw actError

  const activationIds = activations?.map(a => a.id) ?? []

  // Fetch all QSOs for this user's activations
  const { data: qsos, error: qsoError } = activationIds.length > 0
    ? await supabase
        .from('qsos')
        .select('activation_id, band, mode, qso_datetime, is_a2a, satellite_name')
        .in('activation_id', activationIds)
    : { data: [], error: null }

  if (qsoError) throw qsoError

  const acts = activations ?? []
  const allQsos = qsos ?? []
  const activationCount = acts.length
  const bandsWorked = new Set(allQsos.map(q => q.band?.toLowerCase()))
  const uniqueGrids = new Set(acts.map(a => a.grid_square).filter(Boolean))
  const uniqueDxcc = new Set(acts.map(a => a.dxcc_code).filter(Boolean))

  const VOICE_MODES = new Set(['ssb', 'am', 'fm', 'usb', 'lsb', 'ph'])
  const CW_MODES = new Set(['cw'])

  const activationQsoMap = new Map<string, any[]>()
  for (const q of allQsos) {
    if (!activationQsoMap.has(q.activation_id)) activationQsoMap.set(q.activation_id, [])
    activationQsoMap.get(q.activation_id)!.push(q)
  }

  const hasVoiceActivation = acts.some(a => {
    const qs = activationQsoMap.get(a.id) ?? []
    return qs.length > 0 && qs.every(q => VOICE_MODES.has(q.mode?.toLowerCase()))
  })

  const hasFistActivation = acts.some(a => {
    const qs = activationQsoMap.get(a.id) ?? []
    return qs.length > 0 && qs.every(q => CW_MODES.has(q.mode?.toLowerCase()))
  })

  const hasNightOwl = acts.some(a => {
    const qs = activationQsoMap.get(a.id) ?? []
    return qs.some(q => {
      const hour = new Date(q.qso_datetime).getUTCHours()
      return hour >= 0 && hour < 4
    })
  })

  const hasIronWinter = acts.some(a => {
    const month = new Date(a.activation_date).getUTCMonth() + 1
    return month === 12 || month === 1 || month === 2
  })

  const hasFirstOfYear = acts.some(a => {
    const d = new Date(a.activation_date)
    return d.getUTCMonth() === 0 && d.getUTCDate() === 1
  })

  const hasMidnightHerald = acts.some(a => {
    const qs = activationQsoMap.get(a.id) ?? []
    return qs.some(q => {
      const dt = new Date(q.qso_datetime)
      const month = dt.getUTCMonth() + 1
      const day = dt.getUTCDate()
      const hour = dt.getUTCHours()
      return (month === 12 && day === 31 && hour >= 23) ||
             (month === 1  && day === 1  && hour < 2)
    })
  })

  // Satellite QSOs — any QSO with a satellite_name populated
  const satQsos = allQsos.filter(q => q.satellite_name && q.satellite_name.trim() !== '')
  const uniqueSatellites = new Set(satQsos.map(q => q.satellite_name?.trim().toUpperCase()))
  const satCount = uniqueSatellites.size
  const hasAnySat = satCount > 0

  // ISS/crewed spacecraft — satellite_name contains ISS, RS-44, etc.
  const ISS_NAMES = new Set(['iss', 'na1ss', 'rs0iss', 'or4iss', 'dpøiss'])
  const hasExosphere = satQsos.some(q => ISS_NAMES.has(q.satellite_name?.trim().toLowerCase()))

  function satelliteResult(slug: string, required: number | 'boolean', earnedOverride?: boolean): EvaluatedAward {
    const award = AWARD_DEFINITIONS.find(a => a.slug === slug)!
    if (required === 'boolean') {
      const earned = earnedOverride ?? false
      return { award, earned, current: earned ? 1 : 0, required: 1, progress: earned ? 100 : 0 }
    }
    return {
      award,
      earned: satCount >= required,
      current: satCount,
      required,
      progress: Math.min(100, Math.round((satCount / required) * 100)),
    }
  }

  function milestoneResult(slug: string, required: number): EvaluatedAward {
    const award = AWARD_DEFINITIONS.find(a => a.slug === slug)!
    return {
      award,
      earned: activationCount >= required,
      current: activationCount,
      required,
      progress: Math.min(100, Math.round((activationCount / required) * 100)),
    }
  }

  function bandResult(slug: string, band: string): EvaluatedAward {
    const award = AWARD_DEFINITIONS.find(a => a.slug === slug)!
    const earned = bandsWorked.has(band)
    return { award, earned, current: earned ? 1 : 0, required: 1, progress: earned ? 100 : 0 }
  }

  function modeResult(slug: string, earned: boolean): EvaluatedAward {
    const award = AWARD_DEFINITIONS.find(a => a.slug === slug)!
    return { award, earned, current: earned ? 1 : 0, required: 1, progress: earned ? 100 : 0 }
  }

  function gridResult(slug: string, required: number): EvaluatedAward {
    const award = AWARD_DEFINITIONS.find(a => a.slug === slug)!
    const current = uniqueGrids.size
    return {
      award,
      earned: current >= required,
      current,
      required,
      progress: Math.min(100, Math.round((current / required) * 100)),
    }
  }

  function dxccResult(slug: string, required: number): EvaluatedAward {
    const award = AWARD_DEFINITIONS.find(a => a.slug === slug)!
    const current = uniqueDxcc.size
    return {
      award,
      earned: current >= required,
      current,
      required,
      progress: Math.min(100, Math.round((current / required) * 100)),
    }
  }

  function specialResult(slug: string, earned: boolean): EvaluatedAward {
    const award = AWARD_DEFINITIONS.find(a => a.slug === slug)!
    return { award, earned, current: earned ? 1 : 0, required: 1, progress: earned ? 100 : 0 }
  }

  return [
    milestoneResult('first_activation', 1),
    milestoneResult('activations_5',    5),
    milestoneResult('activations_25',   25),
    milestoneResult('activations_50',   50),
    milestoneResult('activations_100',  100),
    milestoneResult('activations_250',  250),
    milestoneResult('activations_500',  500),
    milestoneResult('activations_1000', 1000),
    bandResult('band_160m', '160m'),
    bandResult('band_80m',  '80m'),
    bandResult('band_40m',  '40m'),
    bandResult('band_20m',  '20m'),
    bandResult('band_15m',  '15m'),
    bandResult('band_10m',  '10m'),
    bandResult('band_6m',   '6m'),
    modeResult('mode_voice', hasVoiceActivation),
    modeResult('mode_fist',  hasFistActivation),
    gridResult('grid_walker', 10),
    gridResult('grid_chaser', 25),
    gridResult('grid_hunter', 50),
    gridResult('grid_master', 100),
    dxccResult('dx_initiated',  5),
    dxccResult('dx_operator',   15),
    dxccResult('dx_pathfinder', 30),
    specialResult('night_owl',       hasNightOwl),
    specialResult('iron_winter',     hasIronWinter),
    specialResult('first_of_year',   hasFirstOfYear),
    specialResult('midnight_herald', hasMidnightHerald),
    satelliteResult('sat_first_contact', 'boolean', hasAnySat),
    satelliteResult('sat_bird_watcher',  5),
    satelliteResult('sat_orbital',       10),
    satelliteResult('sat_star_catcher',  25),
    satelliteResult('sat_exosphere',     'boolean', hasExosphere),
  ]
}
