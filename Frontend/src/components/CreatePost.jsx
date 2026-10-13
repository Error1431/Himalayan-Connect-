import { useState } from 'react';
import { Button } from './ui';
import { useToast } from './ToastContainer';
import api from '../utils/api';

export default function CreatePost({ onPosted }) {
    const { addToast } = useToast();
    const [content, setContent] = useState('');
    const [file, setFile] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!content && !file) {
            addToast('Write something or attach media', 'error');
            return;
        }

        setSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('type', file ? (file.type.startsWith('video') ? 'video' : 'image') : 'text');
            formData.append('content', content);
            if (file) formData.append('media', file);

            const { data: newPost } = await api.post('/posts', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            addToast('Post published', 'success');
            setContent('');
            setFile(null);
            onPosted?.(newPost);
        } catch (error) {
            addToast(error.response?.data?.message || 'Could not publish post', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-surface rounded-2xl border border-outline p-5 space-y-4">
            <textarea
                rows="3"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Share an update from your farm or homestay..."
                className="w-full px-4 py-3 bg-surface-alt border border-outline text-ink-soft rounded-xl focus:outline-none focus:border-green-500"
            />
            <div className="flex items-center justify-between gap-3 flex-wrap">
                <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="text-sm text-ink-soft-soft"
                />
                <Button type="submit" disabled={submitting}>
                    {submitting ? 'Posting...' : 'Post'}
                </Button>
            </div>
        </form>
    );
}
