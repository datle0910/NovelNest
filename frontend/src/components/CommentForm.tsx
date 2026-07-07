import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { createComment } from '../api/commentApi';
import { useAuthStore } from '../store/authStore';
import { Link } from 'react-router-dom';

interface CommentFormProps {
  storyId: number;
  onCommentAdded: () => void;
}

const CommentForm: React.FC<CommentFormProps> = ({ storyId, onCommentAdded }) => {
  const { isAuthenticated } = useAuthStore();
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setSending(true);
    try {
      await createComment({ storyId, chapterId: null, content: content.trim() });
      setContent('');
      onCommentAdded();
    } catch (error) {
      console.error('Failed to post comment', error);
    } finally {
      setSending(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="bg-slate-50 rounded-xl p-4 text-center text-sm text-slate-500">
        <Link to="/login" className="font-bold text-brand-600 hover:text-brand-700">Đăng nhập</Link> để bình luận.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={content}
        onChange={e => setContent(e.target.value)}
        placeholder="Viết bình luận..."
        className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 outline-none focus:border-brand-300 focus:ring-2 focus:ring-brand-500/20 transition-all placeholder:text-slate-400"
      />
      <button
        type="submit"
        disabled={!content.trim() || sending}
        className="px-4 py-2.5 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white rounded-xl transition-all disabled:opacity-50 cursor-pointer shadow-sm"
      >
        <Send className="w-4 h-4" />
      </button>
    </form>
  );
};

export default CommentForm;
