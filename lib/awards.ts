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
  { slug: 'band_160m', category: 'band', name: '160m',  description: 'Complete at least one activation on 160m.' },
  { slug: 'band_80m',  category: 'band', name: '80m',   description: 'Complete at least one activation on 80m.' },
  { slug: 'band_40m',  category: 'band', name: '40m',   description: 'Complete at least one activation on 40m.' },
  { slug: 'band_20m',  category: 'band', name: '20m',   description: 'Complete at least one activation on 20m.' },
  { slug: 'band_15m',  category: 'band', name: '15m',   description: 'Complete at least one activation on 15m.' },
  { slug: 'band_10m',  category: 'band', name: '10m',   description: 'Complete at least one activation on 10m.' },
  { slug: 'band_6m',   category: 'band', name: '6m',    description: 'Complete at least one activation on 6m.' },
  { slug: 'band_2m',   category: 'band', name: '2m',    description: 'Complete an activation on 2m — simplex or satellite.' },
  { slug: 'band_70cm', category: 'band', name: '70cm',  description: 'Complete an activation on 70cm — simplex or satellite.' },

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
  { slug: 'globetrotter',  cate
