import { useState } from 'react'
import { Bot, MapPinned, Trash2, AlertTriangle, X } from 'lucide-react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { defaultPanelRoute, isPanelRoute, panelItemsByRoute } from './panelConfig'
import MyFarmWorkspace from './MyFarmWorkspace'
import OverviewPanel from './modules/OverviewPanel'
import CropHealthPanel from './modules/CropHealthPanel'
import WeatherAlertsPanel from './modules/WeatherAlertsPanel'
import MarketInsightsPanel from './modules/MarketInsightsPanel'
import LoanEligibilityPanel from './modules/LoanEligibilityPanel'
import WhatIfSimulatorPanel from './modules/WhatIfSimulatorPanel'
import AiAssistantPanel from './modules/AiAssistantPanel'
import SettingsPanel from './modules/SettingsPanel'
import QuickGuidePanel from './modules/QuickGuidePanel'
import { useFields } from '../../context/FieldContext'
import { useSession } from '../../context/SessionContext'
import { useLanguage } from '../../context/LanguageContext'
import { useToast } from '../../context/ToastContext'
import type { FarmerFieldItem } from '../../types/api'

const PanelModulePage = () => {
  const { panelSlug } = useParams()
  const navigate = useNavigate()
  const { fields, selectedField, loading: fieldsLoading, selectField, deleteField } = useFields()
  const { fieldId } = useSession()
  const { panel } = useLanguage()
  const { pushToast } = useToast()
  const p = panel.panel

  const [fieldToDelete, setFieldToDelete] = useState<FarmerFieldItem | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  if (!panelSlug || !isPanelRoute(panelSlug)) {
    return <Navigate to={`/panel/${defaultPanelRoute}`} replace />
  }

  const activeItem = panelItemsByRoute[panelSlug]
  const jsonKey = activeItem.id === 'weatherAlerts' ? 'weather' : activeItem.id
  const moduleData = p[jsonKey as keyof typeof p] as any

  const renderPanelContent = () => {
    switch (activeItem.route) {
      case 'overview':
        return <OverviewPanel />
      case 'my-farm':
        return <MyFarmWorkspace item={activeItem} />
      case 'quick-guide':
        return <QuickGuidePanel />
      case 'crop-health':
        return <CropHealthPanel />
      case 'weather-alerts':
        return <WeatherAlertsPanel />
      case 'market-insights':
        return <MarketInsightsPanel />
      case 'loan-eligibility':
        return <LoanEligibilityPanel />
      case 'what-if-simulator':
        return <WhatIfSimulatorPanel />
      case 'ai-assistant':
        return <AiAssistantPanel />
      case 'settings':
        return <SettingsPanel />
      default:
        return null
    }
  }

  const handleAskAi = () => {
    navigate('/panel/ai-assistant')
  }

  const handleConfirmDelete = async () => {
    if (!fieldToDelete) return
    setIsDeleting(true)
    try {
      await deleteField(fieldToDelete.field_id)
      pushToast(`Field "${fieldToDelete.field_name}" deleted successfully.`, 'success')
      setFieldToDelete(null)
    } catch {
      pushToast('Failed to delete field. Please try again.', 'error')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <section className="panel-main">
      <header className="panel-main__topbar">
        <div className="panel-main__tabs">
          <span style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '1.1rem' }}>{p.farmIntelligence}</span>
        </div>

        <div className="panel-main__actions">
          <button type="button" className="panel-ask-btn" onClick={handleAskAi}>
            <Bot size={16} aria-hidden="true" />
            {p.askAI}
          </button>
        </div>
      </header>

      <div className="panel-main__body">
        <section className="panel-content">
          <p className="panel-content__kicker">{p.controlConsole}</p>
          <h1>{moduleData?.title || p.sidebar[activeItem.id as keyof typeof p.sidebar] || activeItem.label}</h1>
          <p className="panel-content__summary">{moduleData?.subtitle || activeItem.subtitle}</p>

          {renderPanelContent()}
        </section>

        <aside className="panel-right" aria-label="Secondary tools">
          {/* ── Field selector ──────────────────────────── */}
          <div className="panel-right__field-selector">
            <div className="panel-right__field-header">
              <MapPinned size={14} aria-hidden="true" />
              <p>{p.activeField}</p>
            </div>

            {fieldsLoading ? (
              <div className="panel-skeleton" style={{ height: 32 }} />
            ) : fields.length === 0 ? (
              <p className="panel-right__field-empty">
                {p.noFieldsRegistered}{' '}
                <button type="button" className="panel-inline-link" onClick={() => navigate('/panel/my-farm')}>
                  {p.registerAField}
                </button>
              </p>
            ) : (
              <>
                <div className="panel-right__field-select-wrap">
                  <select
                    className="panel-right__field-select"
                    value={fieldId}
                    onChange={(e) => selectField(e.target.value)}
                    aria-label={p.activeField}
                  >
                    {fields.map((f) => (
                      <option key={f.field_id} value={f.field_id}>
                        {f.field_name} — {f.city_name || 'Unknown'}
                      </option>
                    ))}
                  </select>
                  {selectedField && (
                    <button
                      type="button"
                      className="panel-field-delete-icon-btn"
                      title={`Delete ${selectedField.field_name}`}
                      aria-label={`Delete field ${selectedField.field_name}`}
                      onClick={() => setFieldToDelete(selectedField)}
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>

                {selectedField ? (
                  <div className="panel-right__field-info">
                    <div className="panel-right__field-row">
                      <span>Field</span>
                      <div className="panel-right__field-name-wrap">
                        <strong>{selectedField.field_name}</strong>
                      </div>
                    </div>
                    <div className="panel-right__field-row">
                      <span>{p.city}</span>
                      <strong>{selectedField.city_name || 'N/A'}</strong>
                    </div>
                    <div className="panel-right__field-row">
                      <span>{p.state}</span>
                      <strong>{selectedField.state_name || 'N/A'}</strong>
                    </div>
                    <div className="panel-right__field-row">
                      <span>{p.area}</span>
                      <strong>{selectedField.area_hectares ? `${selectedField.area_hectares} ha` : 'N/A'}</strong>
                    </div>
                    <button
                      type="button"
                      className="panel-field-delete-action-btn"
                      onClick={() => setFieldToDelete(selectedField)}
                    >
                      <Trash2 size={13} aria-hidden="true" />
                      <span>Delete this field</span>
                    </button>
                  </div>
                ) : null}
              </>
            )}
          </div>

          {/* ── On this page ────────────────────────────── */}
          <div className="panel-right__toc">
            <p>{p.onThisPage}</p>
            <ul>
              {activeItem.blocks.map((block) => (
                <li key={`toc-${block.id}`}>
                  <a href={`#${block.id}`}>{block.title}</a>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>

      {fieldToDelete && (
        <div className="panel-modal-backdrop" role="dialog" aria-modal="true">
          <div className="panel-modal-card">
            <div className="panel-modal-header">
              <div className="panel-modal-icon-danger">
                <AlertTriangle size={18} />
              </div>
              <div className="panel-modal-title-group">
                <h3>Delete Field</h3>
                <p>This action cannot be undone.</p>
              </div>
              <button
                type="button"
                className="panel-modal-close"
                disabled={isDeleting}
                onClick={() => setFieldToDelete(null)}
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>

            <div className="panel-modal-body">
              <p>
                Are you sure you want to delete <strong>{fieldToDelete.field_name}</strong>
                {fieldToDelete.city_name ? ` (${fieldToDelete.city_name})` : ''}?
              </p>
              <p className="panel-modal-note">
                All health metrics, satellite data, and chat memory associated with this land will be permanently removed.
              </p>
            </div>

            <div className="panel-modal-actions">
              <button
                type="button"
                className="panel-modal-btn panel-modal-btn--secondary"
                disabled={isDeleting}
                onClick={() => setFieldToDelete(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="panel-modal-btn panel-modal-btn--danger"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
              >
                {isDeleting ? 'Deleting...' : 'Delete Field'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

export default PanelModulePage
