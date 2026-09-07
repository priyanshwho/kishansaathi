import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { apiClient } from '../services/apiClient'
import { useSession } from './SessionContext'
import type { FarmerFieldItem } from '../types/api'

type FieldContextValue = {
  fields: FarmerFieldItem[]
  selectedField: FarmerFieldItem | null
  loading: boolean
  selectField: (fieldId: string) => void
  refreshFields: () => Promise<void>
  deleteField: (fieldId: string) => Promise<boolean>
}

const FieldContext = createContext<FieldContextValue | undefined>(undefined)

export const FieldProvider = ({ children }: { children: ReactNode }) => {
  const { farmerId, fieldId, setFieldId } = useSession()
  const [fields, setFields] = useState<FarmerFieldItem[]>([])
  const [loading, setLoading] = useState(false)

  const loadFields = useCallback(async () => {
    if (!farmerId) {
      setFields([])
      return
    }
    setLoading(true)
    try {
      const payload = await apiClient.getFarmerFields(farmerId)
      const fetched = payload.fields ?? []
      setFields(fetched)
      // Auto-select first field if currently selected field is invalid or empty
      if (fetched.length > 0) {
        const exists = fetched.some((f) => f.field_id === fieldId)
        if (!exists) {
          setFieldId(fetched[0].field_id)
        }
      } else {
        setFieldId('')
      }
    } catch {
      setFields([])
    } finally {
      setLoading(false)
    }
  }, [farmerId, setFieldId])

  useEffect(() => {
    loadFields()
  }, [loadFields])

  const selectedField = useMemo(
    () => fields.find((f) => f.field_id === fieldId) ?? null,
    [fields, fieldId],
  )

  const selectField = useCallback(
    (id: string) => {
      setFieldId(id)
    },
    [setFieldId],
  )

  const deleteField = useCallback(
    async (idToDelete: string): Promise<boolean> => {
      try {
        await apiClient.deleteField(idToDelete, farmerId)
        const remaining = fields.filter((f) => f.field_id !== idToDelete)
        setFields(remaining)

        if (fieldId === idToDelete) {
          const nextFieldId = remaining.length > 0 ? remaining[0].field_id : ''
          setFieldId(nextFieldId)
        }
        return true
      } catch (err) {
        console.error('Failed to delete field:', err)
        throw err
      }
    },
    [farmerId, fieldId, fields, setFieldId],
  )

  const value = useMemo(
    () => ({
      fields,
      selectedField,
      loading,
      selectField,
      refreshFields: loadFields,
      deleteField,
    }),
    [fields, selectedField, loading, selectField, loadFields, deleteField],
  )

  return <FieldContext.Provider value={value}>{children}</FieldContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export const useFields = () => {
  const context = useContext(FieldContext)
  if (!context) {
    throw new Error('useFields must be used within a FieldProvider')
  }
  return context
}
