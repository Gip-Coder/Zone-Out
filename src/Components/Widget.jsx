import React, { useState } from 'react';
import { Rnd } from 'react-rnd';
import { X, GripHorizontal, ArrowLeft } from 'lucide-react';

export default function Widget({
    title,
    children,
    onClose,
    defaultPosition,
    minWidth = 300,
    minHeight = 200,
    baseWidth,
    baseHeight,
    lockAspectRatio = false,
    hideHeader = false,
    isTransparent = false,
    strictHeadless = false,
    onBack
}) {
    const [isHovered, setIsHovered] = useState(false);

    // Auto-apply headless properties
    const actualHideHeader = hideHeader || strictHeadless;
    const actualIsTransparent = isTransparent || strictHeadless;

    // Position and size state for Rnd
    const [state, setState] = useState({
        x: defaultPosition?.x || 20,
        y: defaultPosition?.y || 20,
        width: baseWidth || minWidth,
        height: baseHeight || (baseWidth ? baseWidth * (minHeight / minWidth) : minHeight),
    });

    return (
        <Rnd
            size={{ width: state.width, height: state.height }}
            position={{ x: state.x, y: state.y }}
            onDragStop={(e, d) => {
                setState(prev => ({ ...prev, x: d.x, y: d.y }));
            }}
            onResizeStop={(e, direction, ref, delta, position) => {
                setState({
                    width: ref.style.width,
                    height: ref.style.height,
                    ...position,
                });
            }}
            minWidth={minWidth}
            minHeight={minHeight}
            lockAspectRatio={lockAspectRatio}
            dragHandleClassName="widget-drag-handle"
            bounds="window"
            disableDragging={false}
            style={{
                zIndex: 5000,
                position: 'fixed'
            }}
        >
            <div
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                style={{
                    width: '100%',
                    height: '100%',
                    background: actualIsTransparent ? 'transparent' : (actualHideHeader ? 'rgba(20,20,30,0.5)' : 'var(--bg-secondary)'),
                    border: actualIsTransparent ? 'none' : (actualHideHeader ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(255,255,255,0.1)'),
                    borderRadius: 'var(--radius-lg, 16px)',
                    boxShadow: (actualIsTransparent || actualHideHeader) ? 'none' : '0 16px 48px rgba(0,0,0,0.4)',
                    display: 'flex',
                    flexDirection: 'column',
                    backdropFilter: actualIsTransparent ? 'none' : (actualHideHeader ? 'blur(8px)' : 'blur(12px)'),
                    overflow: 'visible', // Must be visible for Rnd hover controls
                    pointerEvents: 'auto'
                }}
            >
                {/* Optional Header */}
                {!actualHideHeader && !actualIsTransparent && (
                    <div
                        className="widget-drag-handle"
                        style={{
                            padding: '12px 16px',
                            borderBottom: '1px solid rgba(255,255,255,0.08)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            cursor: 'grab',
                            background: 'rgba(255,255,255,0.03)',
                        }}
                        onPointerDown={(e) => e.currentTarget.style.cursor = 'grabbing'}
                        onPointerUp={(e) => e.currentTarget.style.cursor = 'grab'}
                    >
                        <div style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '14px' }}>
                            {title}
                        </div>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onClose();
                            }}
                            onPointerDown={(e) => e.stopPropagation()} // Prevent drag when clicking close
                            style={{
                                background: 'none',
                                border: 'none',
                                color: 'var(--text-secondary)',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '4px',
                            }}
                        >
                            <X size={16} />
                        </button>
                    </div>
                )}

                {/* Headless Hover Controls */}
                {(actualHideHeader || actualIsTransparent) && (
                    <div className="widget-drag-handle" style={headlessControlsStyle(isHovered)}>
                        {onBack && (
                            <button
                                onClick={(e) => { e.stopPropagation(); onBack(); }}
                                onPointerDown={(e) => e.stopPropagation()}
                                style={headlessCloseBtn}
                            >
                                <ArrowLeft size={16} />
                            </button>
                        )}
                        <GripHorizontal size={16} style={{ color: 'rgba(255,255,255,0.4)', cursor: 'grab' }} />
                        <button
                            onClick={(e) => { e.stopPropagation(); onClose(); }}
                            onPointerDown={(e) => e.stopPropagation()} // prevent drag when closing
                            style={headlessCloseBtn}
                        >
                            <X size={16} />
                        </button>
                    </div>
                )}

                {/* Content Area */}
                <div
                    style={{
                        flex: 1,
                        overflow: 'hidden',
                        display: 'flex',
                        pointerEvents: 'auto' // ALWAYS allow clicks through to content, even if transparent
                    }}
                    onPointerDown={(e) => {
                        // Prevent dragging when interacting with actual content
                        if (actualHideHeader || actualIsTransparent) e.stopPropagation();
                    }}
                >
                    <div style={{
                        pointerEvents: 'auto',
                        width: baseWidth ? `${baseWidth}px` : '100%',
                        height: baseHeight ? `${baseHeight}px` : (baseWidth ? `calc(100% / ${(typeof state.width === 'string' ? parseFloat(state.width) : state.width) / baseWidth})` : '100%'),
                        transform: baseWidth ? `scale(${(typeof state.width === 'string' ? parseFloat(state.width) : state.width) / baseWidth})` : 'none',
                        transformOrigin: 'top left',
                        transition: 'none' // Prevent CSS lag during resizing
                    }}>
                        {children}
                    </div>
                </div>
            </div>
        </Rnd>
    );
}

const headlessControlsStyle = (isHovered) => ({
    position: 'absolute',
    top: '12px',
    right: '12px',
    zIndex: 10,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: 'rgba(0,0,0,0.6)',
    padding: '6px 10px',
    borderRadius: '20px',
    backdropFilter: 'blur(8px)',
    border: '1px solid rgba(255,255,255,0.1)',
    opacity: isHovered ? 1 : 0,
    pointerEvents: isHovered ? 'auto' : 'none',
    transition: 'opacity 0.2s ease-in-out',
});

const headlessCloseBtn = {
    background: 'none',
    border: 'none',
    color: 'white',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0
};
