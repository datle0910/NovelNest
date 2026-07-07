import React, { useEffect, useState } from 'react';
import { MessageSquare, User } from 'lucide-react';
import { getStoryComments } from '../api/commentApi';
import { CommentResponse } from '../types/comment';
import CommentForm from './CommentForm';

interface CommentListProps {
  storyId: number;
}

const formatDate = (dateString: string) => {
  const d = new Date(dateString);
  return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
};

const CommentList: React.FC<CommentListProps> = ({ storyId }) => {
  const [comments, setComments] = useState<CommentResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchComments = () => {
    getStoryComments(storyId).then(res => {
      setComments(res.data.content);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => { fetchComments(); }, [storyId]);

  return (
    <div>
      <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-slate-100">
        <MessageSquare className="w-5 h-5 text-brand-500" />
        <h3 className="font-display font-bold text-slate-800 text-base">Bình Luận</h3>
        <span className="text-xs text-slate-400 font-medium">({comments.length})</span>
      </div>

      <CommentForm storyId={storyId} onCommentAdded={fetchComments} />

      <div className="mt-6 space-y-4 max-h-96 overflow-y-auto">
        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => (
              <div key={i} className="flex gap-3">
                <div className="w-8 h-8 rounded-full skeleton shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-24 skeleton rounded-lg" />
                  <div className="h-8 w-full skeleton rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        ) : comments.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-6">Chưa có bình luận nào.</p>
        ) : (
          comments.map(comment => (
            <div key={comment.id} className="flex gap-3 p-3 bg-slate-50 rounded-xl">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white shrink-0 text-xs font-bold">
                {comment.username?.[0]?.toUpperCase() || <User className="w-4 h-4" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-bold text-slate-700">{comment.username}</span>
                  <span className="text-xs text-slate-400">{formatDate(comment.createdAt)}</span>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">{comment.content}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CommentList;
