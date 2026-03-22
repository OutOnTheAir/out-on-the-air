// ============================================================
// OOTA Awards Engine
// Full award definitions + server-side evaluator
// Activator + Chaser + QRP + Weather tracks
// ============================================================

import { supabase } from '@/lib/supabase'

export type AwardCategory = 'milestone' | 'band' | 'mode' | 'grid' | 'dxcc' | 'special' | 'satellite' | 'chaser' | 'qrp' | 'weather'

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

  // --- Activation Milestones (9) ---
  { slug: 'first_activation', category: 'milestone', name: 'First Light',     threshold: '1 activation',       description: 'You left home. You made contact. You are OOTA.' },
  { slug: 'activations_5',    category: 'milestone', name: 'Field Operator',  threshold: '5 activations',      description: 'The field is starting to feel familiar.' },
  { slug: 'activations_10',   category: 'milestone', name: 'Trailblazer',     threshold: '10 activations',     description: 'You have found your rhythm. Keep moving.' },
  { slug: 'activations_25',   category: 'milestone', name: 'Road Warrior',    threshold: '25 activations',     description: 'You go out regardless of conditions.' },
  { slug: 'activations_50',   category: 'milestone', name: 'Wanderer',        threshold: '50 activations',     description: 'The road is the destination.' },
  { slug: 'activations_100',  category: 'milestone', name: 'Pathfinder',      threshold: '100 activations',    description: 'You have found places others never will.' },
  { slug: 'activations_250',  category: 'milestone', name: 'Phantom',         threshold: '250 activations',    description: 'You appear on the bands without warning.' },
  { slug: 'activations_500',  category: 'milestone', name: 'Nomad',           threshold: '500 activations',    description: 'Home is wherever the antenna goes up.' },
  { slug: 'activations_1000', category: 'milestone', name: 'Legend',          threshold: '1,000 activations',  description: 'There is nothing left to prove. You do it anyway.' },

  // --- Band Endorsements (11) ---
  { slug: 'band_160m', category: 'band', name: '160m', description: 'Complete at least one activation on 160m.' },
  { slug: 'band_80m',  category: 'band', name: '80m',  description: 'Complete at least one activation on 80m.' },
  { slug: 'band_40m',  category: 'band', name: '40m',  description: 'Complete at least one activation on 40m.' },
  { slug: 'band_20m',  category: 'band', name: '20m',  description: 'Complete at least one activation on 20m.' },
  { slug: 'band_15m',  category: 'band', name: '15m',  description: 'Complete at least one activation on 15m.' },
  { slug: 'band_10m',  category: 'band', name: '10m',  description: 'Complete at least one activation on 10m.' },
  { slug: 'band_6m',   category: 'band', name: '6m',   description: 'Complete at least one activation on 6m.' },
  { slug: 'band_2m',   category: 'band', name: '2m',   description: 'Complete an activation on 2m — simplex or satellite.' },
  { slug: 'band_70cm', category: 'band', name: '70cm', description: 'Complete an activation on 70cm — simplex or satellite.' },

  // --- Band Collection Awards (2) ---
  { slug: 'prism',        category: 'band', name: 'Prism',        threshold: '40m, 20m, 15m, 10m, 6m',           description: 'Activate on 40m, 20m, 15m, 10m, and 6m. The five colors of the common spectrum.' },
  { slug: 'full_spectrum', category: 'band', name: 'Full Spectrum', threshold: '160m, 80m, 40m, 20m, 15m, 10m, 6m', description: 'Activate on every major HF band from 160m through 6m. The full arc. Nothing skipped.' },

  // --- Legendary Band Awards (2) ---
  { slug: 'low_rider',     category: 'special', name: 'Low Rider',     threshold: '630m',  description: 'Complete an activation on 630m. 5 watts and a wire the length of a football field. Your neighbors have questions.' },
  { slug: 'seismic_event', category: 'special', name: 'Seismic Event', threshold: '2200m — CW only', description: 'Complete a CW activation on 2200m. The lowest amateur band. 1 watt into an antenna measured in hundreds of feet. The earth carries your signal.' },
  
  // --- Mode Endorsements (4) ---
  { slug: 'mode_voice', category: 'mode', name: 'Voice',      description: 'Complete a full activation using only SSB, AM, or FM.' },
  { slug: 'mode_fist',  category: 'mode', name: 'Fist',       description: 'Complete a full activation using only CW. No phone contacts.' },
  { slug: 'the_fist',   category: 'mode', name: 'The Fist',   threshold: '10 CW activations', description: 'Complete 10 CW-only activations. The code is not dead.' },
  { slug: 'magic_band', category: 'mode', name: 'Magic Band', description: 'Complete an activation on 6m during a genuine band opening. The magic band delivers.' },

  // --- Grid Awards (4) ---
  { slug: 'grid_walker', category: 'grid', name: 'Grid Walker', threshold: '10 unique grids',  description: 'Activate from 10 unique Maidenhead grid squares.' },
  { slug: 'grid_chaser', category: 'grid', name: 'Grid Chaser', threshold: '25 unique grids',  description: 'Activate from 25 unique Maidenhead grid squares.' },
  { slug: 'grid_hunter', category: 'grid', name: 'Grid Hunter', threshold: '50 unique grids',  description: 'Activate from 50 unique Maidenhead grid squares.' },
  { slug: 'grid_master', category: 'grid', name: 'Grid Master', threshold: '100 unique grids', description: 'Activate from 100 unique Maidenhead grid squares.' },

  // --- DXCC Awards (4) ---
  { slug: 'dx_initiated',  category: 'dxcc', name: 'DX Initiated',  threshold: '5 DXCC entities',  description: 'Activate from or work stations in 5 unique DXCC entities.' },
  { slug: 'dx_operator',   category: 'dxcc', name: 'DX Operator',   threshold: '15 DXCC entities', description: 'Activate from or work stations in 15 unique DXCC entities.' },
  { slug: 'dx_pathfinder', category: 'dxcc', name: 'DX Pathfinder', threshold: '30 DXCC entities', description: 'Activate from or work stations in 30 unique DXCC entities.' },
  { slug: 'globetrotter',  category: 'dxcc', name: 'Globetrotter',  threshold: '5 DXCC entities activated', description: 'Activate from 5 different DXCC entities. The world is your antenna farm.' },

  // --- Geography Awards (5) ---
  { slug: 'the_50',            category: 'dxcc', name: 'The 50',            threshold: 'All 50 US states',        description: 'Make contact with stations in all 50 US states during OOTA activations. Coast to coast and everything between.' },
  { slug: 'world_tour',        category: 'dxcc', name: 'World Tour',        threshold: '6 continents',            description: 'Make contact with stations on 6 continents during OOTA activations. Every corner of the globe.' },
  { slug: 'final_frontier',    category: 'dxcc', name: 'The Final Frontier', threshold: 'All 7 continents',       description: 'Make contact with stations on all 7 continents including Antarctica. The rarest geographic achievement in OOTA.' },
  { slug: 'double_dipper',     category: 'dxcc', name: 'Double Dipper',     threshold: 'All 50 states — Voice + CW', description: 'Complete The 50 in both Voice and CW. Two modes. Fifty states. No shortcuts.' },
  { slug: 'double_dipper_dx',  category: 'dxcc', name: 'Double Dipper DX',  threshold: '6 continents — Voice + CW',  description: 'Complete World Tour in both Voice and CW. Every continent, twice over.' },

  // --- Special Activator Awards (7) ---
  { slug: 'a2a',             category: 'special', name: 'Air to Air',      description: 'Complete a QSO with another OOTA activator while both of you are out on the air at once.' },
  { slug: 'topband',         category: 'special', name: 'Topband',         threshold: '5 activations on 160m', description: 'Complete 5 activations on 160m. The top band rewards the persistent.' },
  { slug: 'night_owl',       category: 'special', name: 'Night Owl',       description: 'Complete an activation between 0000–0400 UTC. The bands belong to the patient.' },
  { slug: 'iron_winter',     category: 'special', name: 'Iron Winter',     description: 'Activate in December, January, or February. Cold fingers, warm signal.' },
  { slug: 'first_of_year',   category: 'special', name: 'First of Year',   description: 'Log an activation on January 1st. Start the year the right way.' },
  { slug: 'midnight_herald', category: 'special', name: 'Midnight Herald', description: 'Activate between 2300 UTC Dec 31 and 0200 UTC Jan 1. Be on the air when the year turns.' },
  { slug: 'simplex_rover',   category: 'special', name: 'Simplex Rover',   description: 'Complete your first VHF/UHF simplex activation. No repeaters. Just you, the band, and line of sight.' },

  // --- Satellite / Out of This World (5) ---
  { slug: 'sat_first_contact', category: 'satellite', name: 'First Contact', description: 'Complete your first QSO through an amateur satellite. Any bird counts.' },
  { slug: 'sat_bird_watcher',  category: 'satellite', name: 'Bird Watcher',  threshold: '5 unique satellites',  description: 'Work 5 unique amateur satellites. Learn the passes.' },
  { slug: 'sat_orbital',       category: 'satellite', name: 'Orbital',       threshold: '10 unique satellites', description: 'Work 10 unique amateur satellites. You know the sky.' },
  { slug: 'sat_star_catcher',  category: 'satellite', name: 'Star Catcher',  threshold: '25 unique satellites', description: 'Work 25 unique amateur satellites. The sky is not the limit.' },
  { slug: 'sat_exosphere',     category: 'satellite', name: 'Exosphere',     description: 'Complete a QSO via the ISS or any crewed spacecraft. The rarest of all.' },

  // --- QRP Awards (4) ---
  { slug: 'qrp_five_alive', category: 'qrp', name: 'Five and Alive',                  threshold: '5 QRP activations',  description: 'Complete 5 activations running QRP power (5 watts or less). Less is more.' },
  { slug: 'qrp_or_nothing', category: 'qrp', name: 'QRP or Nothing',                  threshold: '25 QRP activations', description: 'Complete 25 activations running QRP power (5 watts or less). Commitment to the craft.' },
  { slug: 'qrp_whisper_dx', category: 'qrp', name: 'Whisper DX',                      description: 'Work a station in a different DXCC entity running 5 watts or less. Distance on a whisper.' },
  { slug: 'qrp_watt_heard', category: 'qrp', name: 'The Watt Heard Around the World', description: 'Complete a QSO with a station in a different DXCC entity running 1 watt or less. The pinnacle of QRP operating.' },

  // --- Chaser Awards (7) ---
  { slug: 'first_chase',     category: 'chaser', name: 'First Chase',      description: 'Log your first confirmed QSO with an OOTA activator. The hunt begins.' },
  { slug: 'chases_10',       category: 'chaser', name: 'Signal Seeker',    threshold: '10 chases',  description: 'Chase 10 OOTA activators. You know where to find them.' },
  { slug: 'chases_25',       category: 'chaser', name: 'Chaser',           threshold: '25 chases',  description: 'Chase 25 OOTA activators. This is who you are now.' },
  { slug: 'chases_50',       category: 'chaser', name: 'Dedicated Chaser', threshold: '50 chases',  description: 'Chase 50 OOTA activators. The spots page is your homepage.' },
  { slug: 'chases_100',      category: 'chaser', name: 'Century Chaser',   threshold: '100 chases', description: 'Chase 100 OOTA activators. You never miss a spot.' },
  { slug: 'cw_chaser',       category: 'chaser', name: 'CW Chaser',        description: 'Chase an OOTA activator on CW. Copy the call, log the contact, tip your hat.' },
  { slug: 'all_band_chaser', category: 'chaser', name: 'All-Band Chaser',  threshold: '5 bands',    description: 'Chase activators on 5 or more different bands. Spin the dial.' },

  // --- Weather Awards (4) ---
  { slug: 'blizzard',    category: 'weather', name: 'Blizzard',    threshold: '≤32°F (0°C)',   description: 'Activated in temperatures of 32°F (0°C) or below. Dedication over comfort.' },
  { slug: 'penguin',     category: 'weather', name: 'Penguin',     threshold: '≤0°F (-18°C)',  description: 'Activated in temperatures of 0°F (-18°C) or below. You are not normal. We respect that.' },
  { slug: 'solar-flare', category: 'weather', name: 'Solar Flare', threshold: '≥110°F (43°C)', description: 'Activated in temperatures of 110°F (43°C) or above. The sun is not your friend.' },
  { slug: 'heatstroke',  category: 'weather', name: 'Heatstroke',  threshold: '≥120°F (49°C)', description: 'Activated in temperatures of 120°F (49°C) or above. Death Valley tier. Seek help.' },
]

// ============================================================
// AWARD EVALUATOR
// ============================================================

export async function evaluateAwards(userId: string): Promise<EvaluatedAward[]> {

  // ── Activator data ──────────────────────────────────────────
  const { data: activations, error: actError } = await supabase
    .from('activations')
    .select('id, activation_date, grid_square, dxcc_code, power_watts, submitted_at, temp_fahrenheit, band, is_simplex, contacted_states, contacted_continents')
    .eq('user_id', userId)
    .eq('is_successful', true)

  if (actError) throw actError

  const activationIds = activations?.map(a => a.id) ?? []

  const { data: qsos, error: qsoError } = activationIds.length > 0
    ? await supabase
        .from('qsos')
        .select('activation_id, band, mode, qso_datetime, is_a2a, satellite_name')
        .in('activation_id', activationIds)
    : { data: [], error: null }

  if (qsoError) throw qsoError

  // ── Chaser data ─────────────────────────────────────────────
  const { data: chaserLogs, error: chaserError } = await supabase
    .from('chaser_logs')
    .select('id, band, mode, is_confirmed, activator_call')
    .eq('user_id', userId)

  if (chaserError) throw chaserError

  const acts            = activations ?? []
  const allQsos         = qsos ?? []
  const allChases       = chaserLogs ?? []
  const confirmedChases = allChases.filter(c => c.is_confirmed)

  const activationCount = acts.length

  // Satellite QSOs only
  const satQsos        = allQsos.filter(q => q.satellite_name && q.satellite_name.trim() !== '')
  const satBandsWorked = new Set(satQsos.map(q => q.band?.toLowerCase()))

  // Simplex activations on VHF/UHF
  const VHF_UHF_BANDS  = new Set(['2m', '1.25m', '70cm', '33cm', '23cm'])
  const simplexActs    = acts.filter(a => a.is_simplex && VHF_UHF_BANDS.has(a.band?.toLowerCase()))
  const simplexBands   = new Set(simplexActs.map(a => a.band?.toLowerCase()))

  // HF+6m bands from QSOs (exclude VHF/UHF unless satellite)
  const hfQsos      = allQsos.filter(q => !['2m', '70cm'].includes(q.band?.toLowerCase()))
  const bandsWorked = new Set([
    ...hfQsos.map(q => q.band?.toLowerCase()),
    ...satBandsWorked,
    ...simplexBands,
  ])

  // Activation-level band tracking (for Prism / Full Spectrum / Low Rider / Seismic Event)
  const activationBands = new Set(acts.map(a => a.band?.toLowerCase()).filter(Boolean))

  const PRISM_BANDS         = new Set(['40m', '20m', '15m', '10m', '6m'])
  const FULL_SPECTRUM_BANDS = new Set(['160m', '80m', '40m', '20m', '15m', '10m', '6m'])
  const hasPrism            = [...PRISM_BANDS].every(b => activationBands.has(b))
  const hasFullSpectrum     = [...FULL_SPECTRUM_BANDS].every(b => activationBands.has(b))
  const hasLowRider         = activationBands.has('630m')

  // Seismic Event — 2200m activation with at least one CW QSO
  const CW_MODES    = new Set(['cw'])
  const VOICE_MODES = new Set(['ssb', 'am', 'fm', 'usb', 'lsb', 'ph'])

  const activationQsoMap = new Map<string, any[]>()
  for (const q of allQsos) {
    if (!activationQsoMap.has(q.activation_id)) activationQsoMap.set(q.activation_id, [])
    activationQsoMap.get(q.activation_id)!.push(q)
  }

  const hasSeismicEvent = acts.some(a => {
    if (a.band?.toLowerCase() !== '2200m') return false
    const qs = activationQsoMap.get(a.id) ?? []
    return qs.some((q: any) => CW_MODES.has(q.mode?.toLowerCase()))
  })

  // Geography — aggregate contacted_states and contacted_continents across all activations
  const allContactedStates     = new Set<string>()
  const allContactedContinents = new Set<string>()
  for (const a of acts) {
    if (a.contacted_states) {
      a.contacted_states.split(',').map((s: string) => s.trim().toUpperCase()).filter(Boolean).forEach((s: string) => allContactedStates.add(s))
    }
    if (a.contacted_continents) {
      a.contacted_continents.split(',').map((c: string) => c.trim().toUpperCase()).filter(Boolean).forEach((c: string) => allContactedContinents.add(c))
    }
  }

  const ALL_50_STATES = new Set([
    'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA',
    'HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
    'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
    'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
    'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY',
  ])
  const SIX_CONTINENTS   = new Set(['NA', 'SA', 'EU', 'AF', 'AS', 'OC'])
  const SEVEN_CONTINENTS = new Set(['NA', 'SA', 'EU', 'AF', 'AS', 'OC', 'AN'])

  const statesCount      = [...ALL_50_STATES].filter(s => allContactedStates.has(s)).length
  const hasThe50         = statesCount >= 50
  const continentsCount  = [...SIX_CONTINENTS].filter(c => allContactedContinents.has(c)).length
  const hasWorldTour     = continentsCount >= 6
  const hasFinalFrontier = [...SEVEN_CONTINENTS].every(c => allContactedContinents.has(c))

  function getStatesForModeFilter(modeSet: Set<string>): Set<string> {
    const states = new Set<string>()
    for (const a of acts) {
      if (!a.contacted_states) continue
      const qs = activationQsoMap.get(a.id) ?? []
      const modeMatch = qs.length > 0 && qs.every((q: any) => modeSet.has(q.mode?.toLowerCase()))
      if (modeMatch) {
        a.contacted_states.split(',').map((s: string) => s.trim().toUpperCase()).filter(Boolean).forEach((s: string) => states.add(s))
      }
    }
    return states
  }

  function getContinentsForModeFilter(modeSet: Set<string>): Set<string> {
    const continents = new Set<string>()
    for (const a of acts) {
      if (!a.contacted_continents) continue
      const qs = activationQsoMap.get(a.id) ?? []
      const modeMatch = qs.length > 0 && qs.every((q: any) => modeSet.has(q.mode?.toLowerCase()))
      if (modeMatch) {
        a.contacted_continents.split(',').map((c: string) => c.trim().toUpperCase()).filter(Boolean).forEach((c: string) => continents.add(c))
      }
    }
    return continents
  }

  const voiceStates       = getStatesForModeFilter(VOICE_MODES)
  const cwStates          = getStatesForModeFilter(CW_MODES)
  const hasDoubleDipper   = [...ALL_50_STATES].every(s => voiceStates.has(s)) &&
                            [...ALL_50_STATES].every(s => cwStates.has(s))

  const voiceContinents    = getContinentsForModeFilter(VOICE_MODES)
  const cwContinents       = getContinentsForModeFilter(CW_MODES)
  const hasDoubleDipperDx  = [...SIX_CONTINENTS].every(c => voiceContinents.has(c)) &&
                             [...SIX_CONTINENTS].every(c => cwContinents.has(c))

  const uniqueGrids = new Set(acts.map(a => a.grid_square).filter(Boolean))
  const uniqueDxcc  = new Set(acts.map(a => a.dxcc_code).filter(Boolean))

  const hasVoiceActivation = acts.some(a => {
    const qs = activationQsoMap.get(a.id) ?? []
    return qs.length > 0 && qs.every((q: any) => VOICE_MODES.has(q.mode?.toLowerCase()))
  })

  const hasFistActivation = acts.some(a => {
    const qs = activationQsoMap.get(a.id) ?? []
    return qs.length > 0 && qs.every((q: any) => CW_MODES.has(q.mode?.toLowerCase()))
  })

  const cwActivationCount = acts.filter(a => {
    const qs = activationQsoMap.get(a.id) ?? []
    return qs.length > 0 && qs.every((q: any) => CW_MODES.has(q.mode?.toLowerCase()))
  }).length

  const topbandActivationCount = acts.filter(a => {
    const qs = activationQsoMap.get(a.id) ?? []
    return qs.some((q: any) => q.band?.toLowerCase() === '160m')
  }).length

  const hasMagicBand = allQsos.some(q => q.band?.toLowerCase() === '6m')
  const hasA2A       = allQsos.some(q => q.is_a2a === true)

  const hasNightOwl = acts.some(a => {
    const qs = activationQsoMap.get(a.id) ?? []
    return qs.some((q: any) => {
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
    return qs.some((q: any) => {
      const dt    = new Date(q.qso_datetime)
      const month = dt.getUTCMonth() + 1
      const day   = dt.getUTCDate()
      const hour  = dt.getUTCHours()
      return (month === 12 && day === 31 && hour >= 23) ||
             (month === 1  && day === 1  && hour < 2)
    })
  })

  const hasSimplexRover  = simplexActs.length > 0

  const uniqueSatellites = new Set(satQsos.map(q => q.satellite_name?.trim().toUpperCase()))
  const satCount         = uniqueSatellites.size
  const hasAnySat        = satCount > 0
  const ISS_NAMES        = new Set(['iss', 'na1ss', 'rs0iss', 'or4iss', 'dpøiss'])
  const hasExosphere     = satQsos.some(q => ISS_NAMES.has(q.satellite_name?.trim().toLowerCase()))
  const hasGlobetrotter  = uniqueDxcc.size >= 5

  // ── QRP stats ───────────────────────────────────────────────
  const qrpActivations     = acts.filter(a => a.power_watts != null && a.power_watts <= 5)
  const qrpActivationCount = qrpActivations.length
  const mwActivations      = acts.filter(a => a.power_watts != null && a.power_watts <= 1)

  const qrpDxccEntities = new Set(qrpActivations.map(a => a.dxcc_code).filter(Boolean))
  const hasQrpWhisperDx = qrpDxccEntities.size >= 1

  const mwDxccEntities = new Set(mwActivations.map(a => a.dxcc_code).filter(Boolean))
  const hasWattHeard   = mwDxccEntities.size >= 1

  // ── Chaser stats ─────────────────────────────────────────────
  const chaseCount       = confirmedChases.length
  const chaserBands      = new Set(confirmedChases.map(c => c.band?.toLowerCase()).filter(Boolean))
  const hasCwChase       = confirmedChases.some(c => CW_MODES.has(c.mode?.toLowerCase()))
  const hasAllBandChaser = chaserBands.size >= 5

  // ── Weather stats ────────────────────────────────────────────
  const hasBlizzard   = acts.some(a => a.temp_fahrenheit != null && a.temp_fahrenheit <= 32)
  const hasPenguin    = acts.some(a => a.temp_fahrenheit != null && a.temp_fahrenheit <= 0)
  const hasSolarFlare = acts.some(a => a.temp_fahrenheit != null && a.temp_fahrenheit >= 110)
  const hasHeatstroke = acts.some(a => a.temp_fahrenheit != null && a.temp_fahrenheit >= 120)

  // ── Helpers ─────────────────────────────────────────────────

  function milestoneResult(slug: string, required: number): EvaluatedAward {
    const award = AWARD_DEFINITIONS.find(a => a.slug === slug)!
    return {
      award,
      earned:   activationCount >= required,
      current:  activationCount,
      required,
      progress: Math.min(100, Math.round((activationCount / required) * 100)),
    }
  }

  function bandResult(slug: string, band: string): EvaluatedAward {
    const award  = AWARD_DEFINITIONS.find(a => a.slug === slug)!
    const earned = bandsWorked.has(band)
    return { award, earned, current: earned ? 1 : 0, required: 1, progress: earned ? 100 : 0 }
  }

  function boolResult(slug: string, earned: boolean): EvaluatedAward {
    const award = AWARD_DEFINITIONS.find(a => a.slug === slug)!
    return { award, earned, current: earned ? 1 : 0, required: 1, progress: earned ? 100 : 0 }
  }

  function countResult(slug: string, current: number, required: number): EvaluatedAward {
    const award = AWARD_DEFINITIONS.find(a => a.slug === slug)!
    return {
      award,
      earned:   current >= required,
      current,
      required,
      progress: Math.min(100, Math.round((current / required) * 100)),
    }
  }

  // ── Return ──────────────────────────────────────────────────

  return [
    // Milestones
    milestoneResult('first_activation', 1),
    milestoneResult('activations_5',    5),
    milestoneResult('activations_10',   10),
    milestoneResult('activations_25',   25),
    milestoneResult('activations_50',   50),
    milestoneResult('activations_100',  100),
    milestoneResult('activations_250',  250),
    milestoneResult('activations_500',  500),
    milestoneResult('activations_1000', 1000),

    // Band endorsements
    bandResult('band_160m', '160m'),
    bandResult('band_80m',  '80m'),
    bandResult('band_40m',  '40m'),
    bandResult('band_20m',  '20m'),
    bandResult('band_15m',  '15m'),
    bandResult('band_10m',  '10m'),
    bandResult('band_6m',   '6m'),
    bandResult('band_2m',   '2m'),
    bandResult('band_70cm', '70cm'),

    // Band collection
    boolResult('prism',        hasPrism),
    boolResult('full_spectrum', hasFullSpectrum),

    // Legendary bands
    boolResult('low_rider',     hasLowRider),
    boolResult('seismic_event', hasSeismicEvent),

    // Modes
    boolResult('mode_voice', hasVoiceActivation),
    boolResult('mode_fist',  hasFistActivation),
    countResult('the_fist',  cwActivationCount, 10),
    boolResult('magic_band', hasMagicBand),

    // Grids
    countResult('grid_walker', uniqueGrids.size, 10),
    countResult('grid_chaser', uniqueGrids.size, 25),
    countResult('grid_hunter', uniqueGrids.size, 50),
    countResult('grid_master', uniqueGrids.size, 100),

    // DXCC
    countResult('dx_initiated',  uniqueDxcc.size, 5),
    countResult('dx_operator',   uniqueDxcc.size, 15),
    countResult('dx_pathfinder', uniqueDxcc.size, 30),
    boolResult('globetrotter',   hasGlobetrotter),

    // Geography
    countResult('the_50',           statesCount,     50),
    countResult('world_tour',       continentsCount, 6),
    boolResult('final_frontier',    hasFinalFrontier),
    boolResult('double_dipper',     hasDoubleDipper),
    boolResult('double_dipper_dx',  hasDoubleDipperDx),

    // Special
    boolResult('a2a',             hasA2A),
    countResult('topband',        topbandActivationCount, 5),
    boolResult('night_owl',       hasNightOwl),
    boolResult('iron_winter',     hasIronWinter),
    boolResult('first_of_year',   hasFirstOfYear),
    boolResult('midnight_herald', hasMidnightHerald),
    boolResult('simplex_rover',   hasSimplexRover),

    // Satellite
    boolResult('sat_first_contact', hasAnySat),
    countResult('sat_bird_watcher', satCount, 5),
    countResult('sat_orbital',      satCount, 10),
    countResult('sat_star_catcher', satCount, 25),
    boolResult('sat_exosphere',     hasExosphere),

    // QRP
    countResult('qrp_five_alive', qrpActivationCount, 5),
    countResult('qrp_or_nothing', qrpActivationCount, 25),
    boolResult('qrp_whisper_dx',  hasQrpWhisperDx),
    boolResult('qrp_watt_heard',  hasWattHeard),

    // Chaser
    countResult('first_chase',    chaseCount, 1),
    countResult('chases_10',      chaseCount, 10),
    countResult('chases_25',      chaseCount, 25),
    countResult('chases_50',      chaseCount, 50),
    countResult('chases_100',     chaseCount, 100),
    boolResult('cw_chaser',       hasCwChase),
    boolResult('all_band_chaser', hasAllBandChaser),

    // Weather
    boolResult('blizzard',    hasBlizzard),
    boolResult('penguin',     hasPenguin),
    boolResult('solar-flare', hasSolarFlare),
    boolResult('heatstroke',  hasHeatstroke),
  ]
}
