import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, ArrowRight, Settings, X, GripHorizontal, Check } from 'lucide-react';
import { ThemeContext } from '../context/ThemeContext';
import { WIDGET_REGISTRY, DEFAULT_LAYOUT } from '../config/widgetRegistry';
import { api } from '../services/apiClient';
import { ToastContext } from '../context/ToastContext';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import './Dashboard.css';

// The individual sorting item
function SortableWidget({ widget, isEditMode, onRemove, theme }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: widget.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 2 : 1,
    opacity: isDragging ? 0.8 : 1,
  };

  const registryData = WIDGET_REGISTRY[widget.id];
  if (!registryData) return null;

  const IconComponent = registryData.icon;

  const currentContent = {
    desc: `Access your ${registryData.title} and manage your workflow.`,
    link: `Open ${registryData.title}`
  };

  // Provide theme-agnostic accent tokens mapped directly from CSS variables
  const getWidgetAccent = (id) => {
    const accents = {
      timeline: "var(--widget-timeline-accent)",
      vault: "var(--widget-vault-accent)",
      timer: "var(--widget-timer-accent)",
      music: "var(--widget-music-accent)",
      ai: "var(--widget-ai-accent)",
    };
    return accents[id] || "var(--accent-primary)";
  };

  const getWidgetRoute = (id) => {
    const routes = {
      timeline: "/timeline",
      vault: "/course-vault",
      timer: "/timer",
      music: "/music",
      ai: "/ai",
    };
    return routes[id] || "/";
  };

  const widgetContent = (
    <div
      className={`dashboard-card dashboard-card-${widget.id} ${isEditMode ? 'edit-mode' : ''} ${isDragging ? 'dragging' : ''}`}
      style={{ "--card-accent": getWidgetAccent(registryData.id) }}
    >
      <div className="dashboard-card-glow"></div>

      {isEditMode && (
        <div className="widget-controls">
          <button
            type="button"
            className="widget-remove-btn"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onRemove(widget.id); }}
          >
            <X size={16} color="#fff" />
          </button>
          <div
            className="widget-drag-handle"
            {...attributes}
            {...listeners}
          >
            <GripHorizontal size={20} />
          </div>
        </div>
      )}

      <div className="dashboard-card-content">
        <div className="dashboard-card-icon-wrapper">
          <IconComponent size={24} color="var(--card-accent)" strokeWidth={2.5} />
        </div>
        <h3 className="dashboard-card-title">{registryData.title}</h3>
        <p className="dashboard-card-desc">{registryData.desc || currentContent.desc}</p>

        {!isEditMode && (
          <span className="dashboard-card-link">
            {registryData.linkText || currentContent.link} <ArrowRight size={14} />
          </span>
        )}
      </div>
    </div>
  );

  // IDs that should trigger floating widgets/chatbox instead of page navigation
  const ACTION_WIDGET_IDS = ['timer', 'music', 'ai'];

  const handleCardClick = (id) => {
    if (id === 'timer') {
      window.dispatchEvent(new CustomEvent('open-timer-widget'));
    } else if (id === 'music') {
      window.dispatchEvent(new CustomEvent('open-music-widget'));
    } else if (id === 'ai') {
      window.dispatchEvent(new CustomEvent('open-ai-chat'));
    }
  };

  return (
    <div ref={setNodeRef} style={style}>
      {isEditMode ? (
        <div className="widget-edit-wrapper">
          {widgetContent}
        </div>
      ) : ACTION_WIDGET_IDS.includes(registryData.id) ? (
        <div onClick={() => handleCardClick(registryData.id)} style={{ cursor: 'pointer' }}>
          {widgetContent}
        </div>
      ) : (
        <Link to={registryData.route || getWidgetRoute(registryData.id)} style={{ textDecoration: 'none' }}>
          {widgetContent}
        </Link>
      )}
    </div>
  );
}

export default function Dashboard() {
  const { theme } = useContext(ThemeContext);
  const { error: toastError, success: toastSuccess } = useContext(ToastContext);

  const [dashboardLayout, setDashboardLayout] = useState([]);
  const [pendingLayout, setPendingLayout] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    // Determine layout on mount
    try {
      const u = localStorage.getItem("user");
      if (u) {
        const parsed = JSON.parse(u);
        if (parsed.dashboardLayout && Array.isArray(parsed.dashboardLayout) && parsed.dashboardLayout.length > 0) {
          // Sort by order
          const sorted = [...parsed.dashboardLayout].sort((a, b) => a.order - b.order);
          setDashboardLayout(sorted);
          return;
        }
      }
    } catch (e) { }

    // Fallback
    setDashboardLayout(DEFAULT_LAYOUT);
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      setPendingLayout((items) => {
        const oldIndex = items.findIndex(i => i.id === active.id);
        const newIndex = items.findIndex(i => i.id === over.id);
        const moved = arrayMove(items, oldIndex, newIndex);
        return moved.map((item, index) => ({ ...item, order: index }));
      });
    }
  };

  const startEditMode = () => {
    setPendingLayout([...dashboardLayout]);
    setIsEditMode(true);
  };

  const cancelEditMode = () => {
    setPendingLayout([]);
    setIsEditMode(false);
    setShowAddModal(false);
  };

  const saveLayout = async () => {
    setIsSaving(true);
    try {
      const response = await api.put("/auth/layout", { dashboardLayout: pendingLayout });
      setDashboardLayout(response.dashboardLayout);
      setIsEditMode(false);
      setShowAddModal(false);
      toastSuccess("Dashboard layout saved!");

      // Update local storage so App.jsx has access to availableWidgets for Brain
      try {
        const u = localStorage.getItem("user");
        if (u) {
          const parsed = JSON.parse(u);
          parsed.dashboardLayout = response.dashboardLayout;
          localStorage.setItem("user", JSON.stringify(parsed));
        }
      } catch (e) { }

    } catch (e) {
      // API failed — save to localStorage as fallback
      console.warn("API layout save failed, saving locally:", e.message);
      setDashboardLayout(pendingLayout);
      setIsEditMode(false);
      setShowAddModal(false);

      try {
        const u = localStorage.getItem("user");
        const parsed = u ? JSON.parse(u) : {};
        parsed.dashboardLayout = pendingLayout;
        localStorage.setItem("user", JSON.stringify(parsed));
        toastSuccess("Layout saved locally!");
      } catch (localErr) {
        toastError("Failed to save layout.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const removeWidget = (id) => {
    setPendingLayout(prev => prev.filter(w => w.id !== id));
  };

  const addWidget = (id) => {
    if (pendingLayout.some(w => w.id === id)) {
      toastError("Widget already on dashboard.");
      return;
    }
    const newWidget = { id, order: pendingLayout.length, size: WIDGET_REGISTRY[id]?.defaultSize || "medium" };
    setPendingLayout(prev => [...prev, newWidget]);
    setShowAddModal(false);
  };

  const renderLayout = isEditMode ? pendingLayout : dashboardLayout;
  const availableToAdd = Object.keys(WIDGET_REGISTRY).filter(id => !renderLayout.some(w => w.id === id));

  return (
    <div className="dashboard-container">
      <div className="dashboard-ambient-bg">
        <div className="dashboard-orb-primary"></div>
        <div className="dashboard-orb-secondary"></div>
      </div>

      <header className="dashboard-header dashboard-header-flex">
        <div>
          <h1 className="dashboard-title">Dashboard</h1>
          <p className="dashboard-subtitle">
            {theme === "light"
              ? "Your study hub. Jump to any feature below to start your focus session."
              : "Your centralized study hub. Jump back into your workflow below."}
          </p>
        </div>

        <div className="dashboard-header-actions">
          {!isEditMode ? (
            <button className="btn-secondary flex items-center justify-center gap-2 px-2 py-2 rounded-xl transition-all font-medium text-sm" onClick={startEditMode}>
              <Settings size={18} /> Customize
            </button>
          ) : (
            <div className="dashboard-edit-actions">
              <button className="btn-secondary flex items-center justify-center gap-2 px-2 py-2 rounded-xl transition-all font-medium text-sm" onClick={cancelEditMode} disabled={isSaving}>
                <X size={18} /> Cancel
              </button>
              <button className="btn-primary flex items-center justify-center gap-2 px-2 py-2 rounded-xl transition-all font-medium text-sm border-none shadow-md" onClick={saveLayout} disabled={isSaving}>
                {isSaving ? "Saving..." : <><Check size={18} /> Done</>}
              </button>
            </div>
          )}
        </div>
      </header>

      <div className="dashboard-grid">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={renderLayout.map(w => w.id)}
            strategy={rectSortingStrategy}
          >
            {renderLayout.map((widget) => (
              <SortableWidget
                key={widget.id}
                widget={widget}
                isEditMode={isEditMode}
                onRemove={removeWidget}
                theme={theme}
              />
            ))}
          </SortableContext>
        </DndContext>

        {isEditMode && availableToAdd.length > 0 && (
          <div className="dashboard-card dashboard-card-add" onClick={() => setShowAddModal(true)}>
            <div className="dashboard-card-content add-modal-content">
              {showAddModal ? (
                <div className="add-widget-dropdown">
                  <h4>Add Widget</h4>
                  <div className="add-widget-list">
                    {availableToAdd.map(id => (
                      <button key={id} className="add-widget-option" onClick={(e) => { e.stopPropagation(); addWidget(id); }}>
                        <Plus size={16} /> {WIDGET_REGISTRY[id]?.title}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  <div className="dashboard-card-content" style={{ alignItems: "center", justifyContent: "center" }}>
                    <Plus size={32} color="var(--text-secondary)" style={{ marginBottom: "16px" }} />
                    <h3 className="dashboard-card-title dashboard-card-add-title">
                      Add Widget
                    </h3>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
