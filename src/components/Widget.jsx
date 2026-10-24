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
            dragHandleClassName="widget-rnd-drag"
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
                    background: actualIsTransparent ? 'transparent' : (actualHideHeader ? 'var(--overlay-bg)' : 'var(--bg-secondary)'),
                    border: actualIsTransparent ? 'none' : '1px solid var(--glass)',
                    borderRadius: 'var(--radius-lg, 16px)',
                    boxShadow: (actualIsTransparent || actualHideHeader) ? 'none' : '0 16px 48px rgba(0,0,0,0.4)',
                    display: 'flex',
                    flexDirection: 'column',
                    backdropFilter: actualIsTransparent ? 'none' : (actualHideHeader ? 'blur(8px)' : 'blur(12px)'),
                    overflow: 'visible', // Must be visible for Rnd hover controls
                    pointerEvents: 'auto'
                }}
            >
                {/* Widget Header */}
                {!actualHideHeader && !actualIsTransparent && (
                    <div
                        className="widget-rnd-drag widget-header"
                        onPointerDown={(e) => e.currentTarget.style.cursor = 'grabbing'}
                        onPointerUp={(e) => e.currentTarget.style.cursor = 'grab'}
                    >
                        <h3 className="widget-title">{title}</h3>
                        <button
                            className="widget-close"
                            aria-label="Close widget"
                            onClick={(e) => {
                                e.stopPropagation();
                                onClose();
                            }}
                            onPointerDown={(e) => e.stopPropagation()}
                        >
                            <X size={16} />
                        </button>
                    </div>
                )}

                {/* Headless Hover Controls */}
                {(actualHideHeader || actualIsTransparent) && (
                    <div className="widget-rnd-drag" style={headlessControlsStyle(isHovered)}>
                        {onBack && (
                            <button
                                onClick={(e) => { e.stopPropagation(); onBack(); }}
                                onPointerDown={(e) => e.stopPropagation()}
                                style={headlessCloseBtn}
                            >
                                <ArrowLeft size={16} />
                            </button>
                        )}
                        <GripHorizontal size={16} style={{ color: 'var(--text-secondary)', cursor: 'grab' }} />
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
                {(() => {
                    const headerHeight = (!actualHideHeader && !actualIsTransparent) ? 55 : 0;
                    const contentHeight = baseHeight ? baseHeight - headerHeight : undefined;
                    return (
                        <div
                            style={{
                                flex: 1,
                                overflow: 'auto',
                                display: 'flex',
                                pointerEvents: 'auto'
                            }}
                            onPointerDown={(e) => {
                                if (actualHideHeader || actualIsTransparent) e.stopPropagation();
                            }}
                        >
                            <div style={{
                                pointerEvents: 'auto',
                                width: baseWidth ? `${baseWidth}px` : '100%',
                                height: contentHeight ? `${contentHeight}px` : (baseWidth ? `calc(100% / ${(typeof state.width === 'string' ? parseFloat(state.width) : state.width) / baseWidth})` : '100%'),
                                transform: baseWidth ? `scale(${(typeof state.width === 'string' ? parseFloat(state.width) : state.width) / baseWidth})` : 'none',
                                transformOrigin: 'top left',
                                transition: 'none'
                            }}>
                                {children}
                            </div>
                        </div>
                    );
                })()}
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
    background: 'var(--overlay-bg)',
    padding: '6px 10px',
    borderRadius: '20px',
    backdropFilter: 'blur(8px)',
    border: '1px solid var(--glass)',
    opacity: isHovered ? 1 : 0,
    pointerEvents: isHovered ? 'auto' : 'none',
    transition: 'opacity 0.2s ease-in-out',
});

const headlessCloseBtn = {
    background: 'none',
    border: 'none',
    color: 'var(--text-primary)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0
};
