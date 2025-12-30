import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { CallRecordingPlayer } from './CallRecordingPlayer';
import type { CallRecording } from '../types/schema';

interface CallRecordingsListProps {
    appointmentId?: string;
    inquiryId?: string;
    customerId?: string;
}

export const CallRecordingsList: React.FC<CallRecordingsListProps> = ({
    appointmentId,
    inquiryId,
    customerId
}) => {
    const [recordings, setRecordings] = useState<CallRecording[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRecordings();
    }, [appointmentId, inquiryId, customerId]);

    const fetchRecordings = async () => {
        setLoading(true);

        let query = supabase
            .from('call_recordings')
            .select('*')
            .order('created_at', { ascending: false });

        if (appointmentId) {
            query = query.eq('appointment_id', appointmentId);
        } else if (inquiryId) {
            query = query.eq('inquiry_id', inquiryId);
        } else if (customerId) {
            query = query.eq('user_id', customerId);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching recordings:', error);
        } else {
            setRecordings(data || []);
        }

        setLoading(false);
    };

    if (loading) {
        return (
            <div className="glass-panel rounded-xl border border-white/10 p-8 text-center">
                <p className="text-gray-400">Loading call recordings...</p>
            </div>
        );
    }

    if (recordings.length === 0) {
        return (
            <div className="glass-panel rounded-xl border border-white/10 p-8 text-center">
                <svg className="w-12 h-12 text-gray-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
                <p className="text-gray-400 font-medium">No call recordings yet</p>
                <p className="text-sm text-gray-500 mt-2">Recordings will appear here once calls are completed</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold text-white mb-4">Call Recordings ({recordings.length})</h2>
            {recordings.map((recording) => (
                <CallRecordingPlayer key={recording.id} recording={recording} />
            ))}
        </div>
    );
};
