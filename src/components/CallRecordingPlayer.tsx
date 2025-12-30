import React, { useRef, useState, useEffect } from 'react';
import type { CallRecording } from '../types/schema';
import { supabase } from '../lib/supabase';

interface CallRecordingPlayerProps {
    recording: CallRecording;
}

export const CallRecordingPlayer: React.FC<CallRecordingPlayerProps> = ({ recording }) => {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [playbackRate, setPlaybackRate] = useState(1);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [showTranscript, setShowTranscript] = useState(false);
    const [loadingError, setLoadingError] = useState<string | null>(null);

    // Get signed URL for audio file
    useEffect(() => {
        const getAudioUrl = async () => {
            console.log('Recording audio_url:', recording.audio_url);

            // Check if audio_url exists
            if (!recording.audio_url) {
                console.error('No audio_url found in recording');
                setLoadingError('No audio URL provided');
                return;
            }

            if (recording.audio_url.startsWith('http')) {
                setAudioUrl(recording.audio_url);
                return;
            }

            // If it's a storage path, get signed URL
            const { data, error } = await supabase.storage
                .from('call-recordings')
                .createSignedUrl(recording.audio_url, 3600); // 1 hour expiry

            if (error) {
                console.error('Error creating signed URL:', error);
                console.error('Path attempted:', recording.audio_url);
                setLoadingError(`Error: ${error.message || 'Failed to create signed URL'}`);
                return;
            }

            if (data?.signedUrl) {
                console.log('Signed URL created:', data.signedUrl);
                setAudioUrl(data.signedUrl);
            } else {
                console.error('No signed URL returned');
                setLoadingError('No signed URL returned from Supabase');
            }
        };

        getAudioUrl();
    }, [recording.audio_url]);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const updateTime = () => {
            setCurrentTime(audio.currentTime);
        };

        const updateDuration = () => {
            if (audio.duration && !isNaN(audio.duration)) {
                console.log('Duration loaded:', audio.duration);
                setDuration(audio.duration);
            }
        };

        const handleEnded = () => setIsPlaying(false);

        const handleCanPlay = () => {
            if (audio.duration && !isNaN(audio.duration)) {
                setDuration(audio.duration);
            }
        };

        // Try to get duration immediately if already loaded
        if (audio.duration && !isNaN(audio.duration)) {
            setDuration(audio.duration);
        }

        audio.addEventListener('timeupdate', updateTime);
        audio.addEventListener('loadedmetadata', updateDuration);
        audio.addEventListener('canplay', handleCanPlay);
        audio.addEventListener('durationchange', updateDuration);
        audio.addEventListener('ended', handleEnded);

        return () => {
            audio.removeEventListener('timeupdate', updateTime);
            audio.removeEventListener('loadedmetadata', updateDuration);
            audio.removeEventListener('canplay', handleCanPlay);
            audio.removeEventListener('durationchange', updateDuration);
            audio.removeEventListener('ended', handleEnded);
        };
    }, [audioUrl]);

    const togglePlay = () => {
        const audio = audioRef.current;
        if (!audio) return;

        if (isPlaying) {
            audio.pause();
        } else {
            audio.play();
        }
        setIsPlaying(!isPlaying);
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const audio = audioRef.current;
        if (!audio) return;

        const time = parseFloat(e.target.value);
        audio.currentTime = time;
        setCurrentTime(time);
    };

    const changePlaybackRate = (rate: number) => {
        const audio = audioRef.current;
        if (!audio) return;

        audio.playbackRate = rate;
        setPlaybackRate(rate);
    };

    const formatTime = (seconds: number) => {
        if (isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const downloadRecording = () => {
        if (audioUrl) {
            const a = document.createElement('a');
            a.href = audioUrl;
            a.download = `call-recording-${recording.id}.${recording.audio_format || 'mp3'}`;
            a.click();
        }
    };

    if (!audioUrl) {
        return (
            <div className="glass-panel rounded-xl border border-white/10 p-4">
                {loadingError ? (
                    <div>
                        <p className="text-red-400 text-sm font-semibold">❌ Error loading audio</p>
                        <p className="text-red-300 text-xs mt-1">{loadingError}</p>
                        <p className="text-gray-500 text-xs mt-2">Path: {recording.audio_url || 'null'}</p>
                    </div>
                ) : !recording.audio_url ? (
                    <p className="text-red-400 text-sm">❌ No audio file available for this recording</p>
                ) : (
                    <p className="text-gray-400 text-sm">Loading audio...</p>
                )}
            </div>
        );
    }

    return (
        <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden hover:border-purple-500/30 transition-all duration-300 group">
            {/* Header */}
            <div className="p-6 pb-4 border-b border-white/5 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex items-start justify-between relative z-10">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-blue-500/20 transition-all duration-300">
                            <svg className="w-7 h-7 text-blue-400 group-hover:text-purple-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                {recording.customer_name || 'Unknown Caller'}
                            </h3>
                            {recording.call_started_at && (
                                <p className="text-xs text-gray-400 mt-1 font-mono">
                                    {new Date(recording.call_started_at).toLocaleString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </p>
                            )}
                            {recording.customer_phone && (
                                <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1.5">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                    {recording.customer_phone}
                                </p>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={downloadRecording}
                        className="p-2.5 rounded-lg bg-gradient-to-r from-emerald-600/20 to-green-600/20 hover:from-emerald-600/40 hover:to-green-600/40 border border-emerald-500/30 hover:border-emerald-500/50 transition-all hover:scale-105 hover:shadow-lg hover:shadow-emerald-500/20 group/download"
                        title="Download recording"
                    >
                        <svg className="w-5 h-5 text-emerald-400 group-hover/download:text-emerald-300 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Audio element */}
            <audio ref={audioRef} src={audioUrl} preload="metadata" />

            {/* Player controls */}
            <div className="p-6 pt-4 space-y-4">
                {/* Progress bar */}
                <div className="space-y-2">
                    <div className="relative w-full h-2 bg-white/10 rounded-full overflow-hidden group/progress">
                        <div
                            className="absolute h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full transition-all shadow-lg shadow-blue-500/30"
                            style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
                        />
                        <input
                            type="range"
                            min="0"
                            max={duration || 0}
                            step="0.1"
                            value={currentTime}
                            onChange={handleSeek}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <div
                            className="absolute h-4 w-4 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full shadow-lg shadow-purple-500/50 top-1/2 -translate-y-1/2 transition-all opacity-0 group-hover/progress:opacity-100"
                            style={{ left: `calc(${(currentTime / (duration || 1)) * 100}% - 8px)` }}
                        />
                    </div>
                    <div className="flex justify-between text-xs text-gray-400 font-mono">
                        <span className="text-blue-400">{formatTime(currentTime)}</span>
                        <span className="text-purple-400">{formatTime(duration)}</span>
                    </div>
                </div>

                {/* Control buttons */}
                <div className="flex items-center gap-4">
                    {/* Play/Pause */}
                    <button
                        onClick={togglePlay}
                        className="w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-500 hover:via-purple-500 hover:to-pink-500 shadow-lg shadow-purple-500/40 hover:shadow-purple-500/60 transition-all hover:scale-110 group/play"
                    >
                        {isPlaying ? (
                            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                            </svg>
                        ) : (
                            <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                            </svg>
                        )}
                    </button>

                    {/* Playback speed */}
                    <div className="flex gap-1.5">
                        {[0.5, 1, 1.5, 2].map((rate) => (
                            <button
                                key={rate}
                                onClick={() => changePlaybackRate(rate)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${playbackRate === rate
                                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md shadow-purple-500/30 scale-105'
                                        : 'bg-white/5 text-gray-400 hover:bg-gradient-to-r hover:from-purple-600/20 hover:to-pink-600/20 hover:text-gray-300 border border-white/10 hover:border-purple-500/30'
                                    }`}
                            >
                                {rate}x
                            </button>
                        ))}
                    </div>

                    {/* Duration badge */}
                    {recording.call_duration_seconds && (
                        <div className="ml-auto px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600/20 to-blue-600/20 border border-cyan-500/30 text-xs font-mono text-cyan-400">
                            {Math.floor(recording.call_duration_seconds / 60)}:{(recording.call_duration_seconds % 60).toString().padStart(2, '0')}
                        </div>
                    )}
                </div>
            </div>

            {/* Transcript section */}
            {recording.transcript && (
                <div className="px-6 pb-6">
                    <button
                        onClick={() => setShowTranscript(!showTranscript)}
                        className="flex items-center gap-2 text-sm font-medium text-gray-300 hover:text-white transition-colors group"
                    >
                        <svg
                            className={`w-4 h-4 transition-transform ${showTranscript ? 'rotate-90' : ''} group-hover:text-blue-400`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                        <span className="group-hover:text-blue-400 transition-colors">Transcript</span>
                    </button>
                    {showTranscript && (
                        <div className="mt-3 p-4 rounded-lg bg-black/20 border border-white/5 text-sm text-gray-300 max-h-64 overflow-y-auto">
                            {recording.transcript_summary && (
                                <div className="mb-3 pb-3 border-b border-white/10">
                                    <p className="text-xs font-semibold text-blue-400 uppercase tracking-wide mb-2">Summary</p>
                                    <p className="text-gray-200 leading-relaxed">{recording.transcript_summary}</p>
                                </div>
                            )}
                            <p className="whitespace-pre-wrap leading-relaxed">{recording.transcript}</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
