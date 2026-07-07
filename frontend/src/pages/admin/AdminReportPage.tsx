import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getReports, updateReportStatus } from '../../api/adminStoryApi';
import { PageResponse } from '../../types/api';
import { AlertCircle, CheckCircle, Clock } from 'lucide-react';
import Pagination from '../../components/Pagination';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import ErrorMessage from '../../components/ErrorMessage';

const AdminReportPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const pageParam = parseInt(searchParams.get('page') || '0', 10);
  const statusParam = searchParams.get('status') || '';

  const [pageData, setPageData] = useState<PageResponse<any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await getReports(pageParam, 10, statusParam);
      setPageData(res.data);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Lỗi tải danh sách báo cáo');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [pageParam, statusParam]);

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      await updateReportStatus(id, newStatus);
      fetchReports();
    } catch (err: any) {
      alert(err.message || 'Lỗi cập nhật trạng thái báo cáo');
    }
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case 'PENDING': return <span className="inline-flex px-2 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded text-xs font-bold gap-1 items-center"><Clock className="w-3 h-3" /> Chờ xử lý</span>;
      case 'RESOLVED': return <span className="inline-flex px-2 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded text-xs font-bold gap-1 items-center"><CheckCircle className="w-3 h-3" /> Đã xử lý</span>;
      default: return <span className="inline-flex px-2 py-1 bg-slate-500/10 text-slate-400 border border-slate-500/20 rounded text-xs font-bold">{status}</span>;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-left">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 border-b border-white/5 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-500/10 rounded-xl border border-red-500/20">
            <AlertCircle className="w-6 h-6 text-red-400" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-extrabold text-white tracking-tight">Quản Lý Báo Cáo</h1>
            <p className="text-xs text-text-muted font-semibold mt-1">Quản lý các báo cáo lỗi chương từ người dùng.</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setSearchParams({ page: '0', status: '' })}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${!statusParam ? 'bg-brand-500 text-white' : 'bg-surface-elevated text-text-muted hover:text-white'}`}
          >
            Tất cả
          </button>
          <button 
            onClick={() => setSearchParams({ page: '0', status: 'PENDING' })}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${statusParam === 'PENDING' ? 'bg-amber-500 text-white' : 'bg-surface-elevated text-text-muted hover:text-white'}`}
          >
            Chờ xử lý
          </button>
        </div>
      </div>

      {error && <ErrorMessage message={error} />}

      {loading ? (
        <div className="glass-card p-6">
          <LoadingSkeleton type="table" count={5} />
        </div>
      ) : !pageData || pageData.content.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <CheckCircle className="w-12 h-12 text-emerald-500/50 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">Tuyệt vời!</h3>
          <p className="text-text-muted">Không có báo cáo lỗi nào.</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-text-secondary border-collapse">
                <thead className="text-xs uppercase bg-surface-base/50 border-b border-white/5 text-text-muted font-bold">
                  <tr>
                    <th className="px-6 py-4">ID</th>
                    <th className="px-6 py-4">Chương / Truyện</th>
                    <th className="px-6 py-4">Lý do</th>
                    <th className="px-6 py-4">Chi tiết</th>
                    <th className="px-6 py-4">Trạng thái</th>
                    <th className="px-6 py-4">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {pageData.content.map((report: any) => (
                    <tr key={report.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4 font-bold text-white">#{report.id}</td>
                      <td className="px-6 py-4">
                        <a href={`/stories/${report.storySlug}/chapters/${report.chapterNumber}`} target="_blank" rel="noreferrer" className="font-semibold text-brand-400 hover:underline block mb-1">
                          Chương {report.chapterNumber}: {report.chapterTitle}
                        </a>
                        <span className="text-xs text-text-muted">{report.storyTitle}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {report.reasons.map((r: string) => (
                            <span key={r} className="inline-block px-2 py-0.5 bg-white/5 border border-white/10 rounded text-xs">{r}</span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 max-w-[200px] truncate" title={report.details}>
                        {report.details || '-'}
                      </td>
                      <td className="px-6 py-4">
                        {statusBadge(report.status)}
                      </td>
                      <td className="px-6 py-4">
                        {report.status === 'PENDING' ? (
                          <button 
                            onClick={() => handleStatusChange(report.id, 'RESOLVED')}
                            className="px-3 py-1.5 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white rounded text-xs font-bold transition-colors cursor-pointer"
                          >
                            Đánh dấu đã sửa
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleStatusChange(report.id, 'PENDING')}
                            className="px-3 py-1.5 bg-white/5 text-text-muted hover:bg-white/10 rounded text-xs font-bold transition-colors cursor-pointer"
                          >
                            Bỏ đánh dấu
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-center pt-2">
            <Pagination 
              currentPage={pageData.page} 
              totalPages={pageData.totalPages} 
              onPageChange={(page) => setSearchParams({ page: page.toString(), status: statusParam })}
              variant="dark"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReportPage;
