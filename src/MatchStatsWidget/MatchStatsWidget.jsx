/**
 * LaLiga / Maç istatistikleri widget'ı.
 * Mock veri: matchStatsMock.json – carousel + seçili maçın istatistikleri.
 */
import React, { useState, useRef, useEffect } from 'react';
import matchData from '../Data/matchStatsMock.json';
import './MatchStatsWidget.css';

function MatchStatsWidget() {
    const { leagueName, regionLabel, showMoreLabel, matches } = matchData;
    const [currentIndex, setCurrentIndex] = useState(0);
    const carouselRef = useRef(null);

    useEffect(() => {
        if (!carouselRef.current) return;
        const el = carouselRef.current;
        const card = el.querySelector(`[data-index="${currentIndex}"]`);
        if (card) card.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }, [currentIndex]);

    const go = (dir) => {
        setCurrentIndex((prev) => {
            const next = prev + dir;
            if (next < 0) return matches.length - 1;
            if (next >= matches.length) return 0;
            return next;
        });
    };

    return (
        <div className="match-stats-widget">
            <header className="match-widget-header">
                <div className="match-widget-title-row">
                    <span className="match-widget-league-icon">⚽</span>
                    <span className="match-widget-league-name">{leagueName}</span>
                    <span className="match-widget-chevron">▼</span>
                    <button type="button" className="match-widget-more" aria-label="Daha fazla">⋮</button>
                </div>
                <p className="match-widget-region">{regionLabel}</p>
            </header>

            <div className="match-widget-carousel-wrap">
                <button type="button" className="match-widget-arrow match-widget-arrow-left" onClick={() => go(-1)} aria-label="Önceki">‹</button>
                <div className="match-widget-carousel" ref={carouselRef}>
                    {matches.map((m, idx) => (
                        <div
                            key={m.id}
                            data-index={idx}
                            className={`match-widget-card ${idx === currentIndex ? 'active' : ''}`}
                            onClick={() => setCurrentIndex(idx)}
                        >
                            <div className="match-card-top">
                                <span className="match-card-status">
                                    {m.status === 'Final' ? `Final - ${m.date}` : `${m.time} - ${m.date}`}
                                </span>
                            </div>
                            <div className="match-card-teams">
                                <div className="match-team" style={{ '--team-bg': m.homeTeam.bgColor }}>
                                    {m.homeTeam.logoUrl ? (
                                        <img src={m.homeTeam.logoUrl} alt="" className="match-team-logo" />
                                    ) : (
                                        <span className="match-team-placeholder">?</span>
                                    )}
                                    <span className="match-team-name">{m.homeTeam.name}</span>
                                </div>
                                <div className="match-card-score">
                                    {m.status === 'Final' && m.score ? (
                                        <>
                                            <span className="match-score-home">{m.score.home}</span>
                                            <span className="match-score-sep">-</span>
                                            <span className="match-score-away">{m.score.away}</span>
                                        </>
                                    ) : (
                                        <span className="match-time">{m.time}</span>
                                    )}
                                </div>
                                <div className="match-team" style={{ '--team-bg': m.awayTeam.bgColor }}>
                                    <>
                                        {m.awayTeam.logoUrl ? (
                                            <img src={m.awayTeam.logoUrl} alt="" className="match-team-logo" />
                                        ) : (
                                            <span className="match-team-placeholder">?</span>
                                        )}
                                        <span className="match-team-name">{m.awayTeam.name}</span>
                                    </>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <button type="button" className="match-widget-arrow match-widget-arrow-right" onClick={() => go(1)} aria-label="Sonraki">›</button>
            </div>

            <div className="match-widget-dots">
                {matches.map((_, idx) => (
                    <button
                        key={idx}
                        type="button"
                        className={`match-widget-dot ${idx === currentIndex ? 'active' : ''}`}
                        onClick={() => setCurrentIndex(idx)}
                        aria-label={`Maç ${idx + 1}`}
                    />
                ))}
            </div>
            <a href="#more-laliga" className="match-widget-show-more">{showMoreLabel}</a>
        </div>
    );
}

export default MatchStatsWidget;
