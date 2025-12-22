import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export function useCollection<T>(table: string, options?: { orderBy?: string }) {
    const [data, setData] = useState<T[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const orderBy = options?.orderBy || 'created_at';

    useEffect(() => {
        const fetchData = async () => {
            try {
                const { data, error } = await supabase
                    .from(table)
                    .select('*')
                    .order(orderBy, { ascending: false });

                if (error) throw error;
                setData(data as T[]);
            } catch (err: any) {
                setError(err.message);
                console.error(`Error fetching ${table}:`, err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();

        // Realtime subscription
        const channel = supabase
            .channel('public:' + table)
            .on('postgres_changes', { event: '*', schema: 'public', table: table }, (payload) => {
                console.log('Realtime update received:', table, payload);
                fetchData();
            })
            .subscribe((status) => {
                console.log(`Subscription status for ${table}:`, status);
            });

        return () => {
            supabase.removeChannel(channel);
        };
    }, [table]);

    return { data, loading, error };
}
