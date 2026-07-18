import { useState } from 'react';
import { Button, useToast } from './ui';

export default function CreatePost({ onPosted }) {
    const { showToast } = useToast();
    const [content, setContent] = useState('');
    const [file, setFile] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!content && !file) {
            showToast('Write something or attach media', 'error');
            return;
        }

        setSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('type', file ? (file.type.startsWith('video') ? 'video' : 'image') : 'text');
            formData.append('content', content);
            if (file) formData.append('media', file);

            const token = localStorage.getItem('token');
            const response = await fetch('/api/posts', {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
            });

            if (!response.ok) throw new Error('Failed to post');

            const newPost = await response.json();
            showToast('Post published', 'success');
            setContent('');
            setFile(null);
            onPosted?.(newPost);
        } catch (error) {
            showToast('Could not publish post', 'error');
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