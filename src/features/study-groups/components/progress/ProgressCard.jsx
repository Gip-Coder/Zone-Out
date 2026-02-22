import React from 'react';

export const ProgressCard = ({ update }) => {
    const time = update.createdAt?.toDate ? update.createdAt.toDate().toLocaleDateString() : '';

    return (
        <div className="sg-card" style={{ flexDirection: 'column', gap: '12px' }}>
            <div className="sg-meta" style={{ justifyContent: 'space-between', marginBottom: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div className="sg-avatar" style={{ background: 'var(--button-gradient)', width: '40px', height: '40px', border: 'none' }}>
                        {(update.authorName || 'U')[0].toUpperCase()}
                    </div>
                    <div>
                        <div style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>{update.authorName || 'User'}</div>
                        <div style={{ fontSize: '11px' }}>{time}</div>
                    </div>
                </div>
                {update.courseTag && (
                    <span className="sg-tag">{update.courseTag}</span>
                )}
            </div>

            <div className="sg-card-content" style={{ marginTop: '8px' }}>
                <p className="sg-card-body" style={{ whiteSpace: 'pre-wrap' }}>
                    {update.content}
                </p>
            </div>

            {update.mediaUrl && (
                <div style={{ width: '100%', background: 'var(--bg-tertiary)', aspectRatio: '16/9', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', overflow: 'hidden' }}>
                    <img src={update.mediaUrl} alt="Progress media" style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
                </div>
            )}

            <div className="sg-card-actions" style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '12px', marginTop: '4px' }}>
                <button className="sg-action-btn">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" width={20} height={20}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                    </svg>
                    <span>{update.likes?.length || 0}</span>
                </button>
            </div>
        </div>
    );
};
