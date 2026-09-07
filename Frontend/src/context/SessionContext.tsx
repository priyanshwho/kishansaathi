import { apiClient } from '../services/apiClient'
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { FarmerProfileResponse, FarmerFieldItem } from '../types/api'

export type FarmerProfile = FarmerProfileResponse

type SessionContextValue = {
  farmerId: string
  fieldId: string
  farmerProfile: FarmerProfile | null
  fields: FarmerFieldItem[]
  profileLoading: boolean
  setFarmerId: (value: string) => void
  setFieldId: (value: string) => void
}

const SessionContext = createContext<SessionContextValue | undefined>(undefined)

// Only farmer_id and active_field_id are persisted in localStorage
const FARMER_ID_KEY = 'ks_farmer_id'
const LEGACY_FARMER_ID_KEY = 'ks_last_farmer_id'
const FIELD_ID_KEY = 'ks_active_field_id'

const getStoredFarmerId = () => {
  if (typeof window === 'undefined') return ''
  return window.localStorage.getItem(FARMER_ID_KEY) ?? ''
}

const getStoredFieldId = () => {
  if (typeof window === 'undefined') return ''
  return window.localStorage.getItem(FIELD_ID_KEY) ?? ''
}

export const SessionProvider = ({ children }: { children: ReactNode }) => {
  const [farmerId, setFarmerIdState] = useState(getStoredFarmerId)
  const [fieldId, setFieldIdState] = useState(getStoredFieldId)
  const [farmerProfile, setFarmerProfile] = useState<FarmerProfile | null>(null)
  const [fields, setFields] = useState<FarmerFieldItem[]>([])
  const [profileLoading, setProfileLoading] = useState(false)

  // ── Boot: hydrate profile + active field from DB whenever farmerId is set ──
  useEffect(() => {
    if (!farmerId) return

    let cancelled = false
    const boot = async () => {
      setProfileLoading(true)
      try {
        // 1. Fetch full profile from DB (name, phone, email, picture, state, district)
        const profile = await apiClient.getFarmerProfile(farmerId)
        if (!cancelled) setFarmerProfile(profile)

        // 2. Fetch fields from DB, maintain selected field or default to first
        const fieldsResp = await apiClient.getFarmerFields(farmerId)
        if (!cancelled) {
          const fetched = fieldsResp.fields ?? []
          setFields(fetched)
          if (fetched.length > 0) {
            const stored = getStoredFieldId()
            const match = fetched.find((f) => f.field_id === stored)
            const targetId = match ? match.field_id : fetched[0].field_id
            setFieldIdState(targetId)
            if (typeof window !== 'undefined') {
              window.localStorage.setItem(FIELD_ID_KEY, targetId)
            }
          } else {
            setFieldIdState('')
            if (typeof window !== 'undefined') {
              window.localStorage.removeItem(FIELD_ID_KEY)
            }
          }
        }
      } catch {
        // Graceful degradation — app still functions, just with empty profile
      } finally {
        if (!cancelled) setProfileLoading(false)
      }
    }

    boot()
    return () => { cancelled = true }
  }, [farmerId])

  const setFarmerId = useCallback((value: string) => {
    const normalized = value.trim()
    setFarmerIdState(normalized)
    if (typeof window !== 'undefined') {
      if (normalized) {
        window.localStorage.setItem(FARMER_ID_KEY, normalized)
        window.localStorage.setItem(LEGACY_FARMER_ID_KEY, normalized)
      } else {
        window.localStorage.removeItem(FARMER_ID_KEY)
        window.localStorage.removeItem(LEGACY_FARMER_ID_KEY)
        window.localStorage.removeItem(FIELD_ID_KEY)
        setFieldIdState('')
      }
    }
  }, [])

  const setFieldId = useCallback((value: string) => {
    const normalized = value.trim()
    setFieldIdState(normalized)
    if (typeof window !== 'undefined') {
      if (normalized) {
        window.localStorage.setItem(FIELD_ID_KEY, normalized)
      } else {
        window.localStorage.removeItem(FIELD_ID_KEY)
      }
    }
  }, [])

  const value = useMemo(
    () => ({ farmerId, fieldId, farmerProfile, fields, profileLoading, setFarmerId, setFieldId }),
    [farmerId, fieldId, farmerProfile, fields, profileLoading, setFarmerId, setFieldId],
  )

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export const useSession = () => {
  const context = useContext(SessionContext)
  if (!context) throw new Error('useSession must be used within a SessionProvider')
  return context
}
