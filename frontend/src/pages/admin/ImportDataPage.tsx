import React, { useState, useEffect, useRef } from 'react';
import { adminImportApi, CrawlRequest } from '../../api/adminImportApi';
import { Play, AlertTriangle, Database, ArrowRight, ShieldCheck, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

const ImportDataPage: React.FC = () => {
    const [request, setRequest] = useState<CrawlRequest>({
        source: 'AUTO',
        mode: 'FULL_CONTENT_IF_ALLOWED',
        storyUrl: '',
        maxChaptersPerStory: 5,
        dryRun: false
    });

    const [loading, setLoading] = useState(false);
    const [importResult, setImportResult] = useState<any | null>(null);
    const [logs, setLogs] = useState<any[]>([]);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    
    const [progress, setProgress] = useState<{ percentage: number; message: string; current: number; total: number } | null>(null);
    const pollingRef = useRef<number | null>(null);

    useEffect(() => {
        fetchLogs();
        return () => {
            if (pollingRef.current) clearInterval(pollingRef.current);
        };
    }, []);

    const fetchLogs = async () => {
        try {
            const res = await adminImportApi.getLogs();
            if (res && res.data) {
                setLogs(res.data.content);
            }
        } catch (error) {
            console.error('Failed to fetch logs', error);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setRequest(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }));
    };

    const startPolling = (logId: number) => {
        if (pollingRef.current) clearInterval(pollingRef.current);
        
        const interval = setInterval(async () => {
            try {
                const res = await adminImportApi.getImportProgress(logId);
                if (res && res.data) {
                    const data = res.data;
                    const percentage = data.totalChapters > 0 ? Math.round((data.currentChapter / data.totalChapters) * 100) : 0;
                    setProgress({
                        percentage,
                        message: data.message || 'Đang xử lý...',
                        current: data.currentChapter,
                        total: data.totalChapters
                    });

                    if (data.status === 'COMPLETED' || data.status === 'FAILED') {
                        if (pollingRef.current) clearInterval(pollingRef.current);
                        setLoading(false);
                        fetchLogs();
                        if (data.status === 'COMPLETED') {
                            setMessage({ type: 'success', text: 'Đã hoàn thành crawl bộ truyện thành công.' });
                        } else {
                            setMessage({ type: 'error', text: data.message || 'Crawl bộ truyện thất bại.' });
                        }
                    }
                }
            } catch (error) {
                console.error("Lỗi khi fetch progress", error);
            }
        }, 1500);
        pollingRef.current = interval as any;
    };

    const handleImport = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!request.storyUrl || request.storyUrl.trim() === '') {
            setMessage({ type: 'error', text: 'Vui lòng nhập Story URL cần crawl!' });
            return;
        }

        setLoading(true);
        setImportResult(null);
        setMessage(null);
        setProgress({ percentage: 0, message: "Khởi tạo tiến trình...", current: 0, total: 0 });
        
        try {
            const res = await adminImportApi.importStoryUrl(request);
            if (res && res.data && res.data.logId > 0) {
                startPolling(res.data.logId);
                fetchLogs(); // refresh to show IN_PROGRESS log
            } else {
                setLoading(false);
                setMessage({ type: 'error', text: 'Không nhận được Log ID từ server.' });
            }
        } catch (error: any) {
            setLoading(false);
            setMessage({ type: 'error', text: error.response?.data?.message || error.message || 'Crawl bộ truyện thất bại.' });
        }
    };

    return (
        <div className="space-y-6 text-left max-w-5xl mx-auto py-2 animate-fade-in">
            <div className="flex items-center gap-3 border-b border-white/5 pb-5">
                <div className="p-2 bg-brand-500/10 rounded-xl border border-brand-500/20">
                    <Database className="w-6 h-6 text-brand-400" />
                </div>
                <div>
                    <h1 className="text-xl font-display font-extrabold text-white tracking-tight">Crawl & Nhập Truyện Mới</h1>
                    <p className="text-xs text-text-muted font-semibold mt-1">Nhập chính xác URL của bộ truyện trên website công khai để crawl tự động.</p>
                </div>
            </div>

            {message && (
                <div className={`p-4 rounded-xl border ${
                    message.type === 'success'
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                        : 'bg-red-500/10 border-red-500/20 text-red-400'
                } transition-all`}>
                    <div className="flex justify-between items-center">
                        <p className="text-xs font-bold leading-relaxed">{message.text}</p>
                        <button onClick={() => setMessage(null)} className="text-xs font-bold opacity-60 hover:opacity-100 cursor-pointer">✕</button>
                    </div>
                </div>
            )}

            <div className="bg-amber-500/5 border border-amber-500/15 p-4 rounded-xl flex gap-3 text-left">
                <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                    <h4 className="text-xs font-extrabold text-amber-400 uppercase tracking-wider">Quy định và Chính sách Crawl</h4>
                    <ul className="list-disc ml-4 mt-2 text-xs text-text-secondary space-y-1 font-medium">
                        <li>Hệ thống chỉ chấp nhận crawl đơn lẻ 1 bộ truyện theo yêu cầu của Admin để kiểm soát băng thông.</li>
                        <li>Đảm bảo URL nguồn nhập vào là chính xác (Ví dụ: <span className="font-mono text-text-primary bg-white/5 px-1 py-0.5 rounded">https://truyencom.com/story-slug</span>).</li>
                        <li>Một số nguồn có chính sách bảo mật nội dung nên chỉ hỗ trợ crawl <span className="underline decoration-dotted text-text-primary">Chỉ Metadata</span>.</li>
                    </ul>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 glass-card p-5">
                    <h2 className="text-xs font-bold text-white border-b border-white/5 pb-3 mb-4 uppercase tracking-widest">Thông tin Crawl</h2>
                    
                    <form onSubmit={handleImport} className="space-y-4">
                        <div className="mb-4">
                            <label className="block text-xs font-bold text-text-muted mb-2 uppercase tracking-widest">Chế độ Nhập</label>
                            <select 
                                name="mode" 
                                value={request.mode} 
                                onChange={handleChange} 
                                className="w-full bg-surface-base/50 border border-white/10 rounded-xl px-3 py-2.5 text-xs font-bold text-text-secondary focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500/50"
                            >
                                <option value="METADATA_ONLY">Chỉ Metadata</option>
                                <option value="METADATA_AND_SAMPLE_CHAPTERS">Metadata + Chương mẫu</option>
                                <option value="FULL_CONTENT_IF_ALLOWED">Toàn bộ nội dung</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-text-muted mb-2 uppercase tracking-widest">Story URL</label>
                            <input 
                                type="text" 
                                name="storyUrl" 
                                value={request.storyUrl} 
                                onChange={handleChange} 
                                required
                                placeholder="Nhập đường dẫn URL truyện cụ thể..." 
                                className="w-full bg-surface-base/50 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-text-primary font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500/50 placeholder:text-text-muted/50" 
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                            <div>
                                <label className="block text-xs font-bold text-text-muted mb-2 uppercase tracking-widest">Số chương tối đa (0 = Tất cả)</label>
                                <input 
                                    type="number" 
                                    name="maxChaptersPerStory" 
                                    value={request.maxChaptersPerStory} 
                                    onChange={handleChange} 
                                    min="0" max="5000"
                                    className="w-full bg-surface-base/50 border border-white/10 rounded-xl px-3 py-2.5 text-xs font-bold text-text-secondary focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500/50" 
                                />
                            </div>
                            
                            <div className="pt-5">
                                <label className="flex items-center gap-2 p-2 bg-surface-base/50 border border-white/10 rounded-xl cursor-pointer hover:bg-surface-base transition-colors">
                                    <input 
                                        name="dryRun" 
                                        type="checkbox" 
                                        checked={request.dryRun} 
                                        onChange={handleChange} 
                                        className="w-4 h-4 rounded accent-brand-500 border-white/10 cursor-pointer" 
                                    />
                                    <span className="text-xs font-bold text-text-secondary select-none">Chạy thử (Dry Run)</span>
                                </label>
                            </div>
                        </div>
                        
                        <div className="pt-3 border-t border-white/5">
                            <button 
                                type="submit" 
                                disabled={loading} 
                                className="w-full flex items-center justify-center bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white px-5 py-3 rounded-xl font-bold text-sm transition-all shadow-lg shadow-brand-500/25 gap-2 cursor-pointer disabled:opacity-50 tracking-wider"
                            >
                                {loading ? (
                                    <>
                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                        Đang chạy crawler ngầm...
                                    </>
                                ) : (
                                    <>
                                        <Play className="w-4 h-4 fill-white text-transparent" />
                                        Khởi chạy Import truyện
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                <div className="glass-card p-5 flex flex-col">
                    <h2 className="text-xs font-bold text-white border-b border-white/5 pb-3 mb-4 uppercase tracking-widest">Trạng thái kết quả</h2>
                    
                    <div className="flex-1 overflow-y-auto space-y-4">
                        {loading && (
                            <div className="flex flex-col items-center justify-center py-10 gap-4">
                                <RefreshCw className="w-8 h-8 text-brand-400 animate-spin" />
                                <div className="w-full max-w-md px-2">
                                    <div className="flex justify-between text-xs font-bold text-text-muted mb-2">
                                        <span>{progress?.message || 'Đang trích xuất dữ liệu...'}</span>
                                        <span className="text-brand-400">{progress?.percentage || 0}%</span>
                                    </div>
                                    <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden border border-white/10">
                                        <div 
                                            className="bg-brand-500 h-2 rounded-full transition-all duration-300 ease-out" 
                                            style={{ width: `${progress?.percentage || 0}%` }}
                                        ></div>
                                    </div>
                                    {progress && progress.total > 0 && (
                                        <p className="text-center text-[10px] text-text-muted/60 mt-2 font-bold uppercase tracking-wider">
                                            {progress.current} / {progress.total} chương
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}
                        
                        {importResult && !loading && (
                            <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl space-y-3">
                                <div className="flex items-center gap-2 text-emerald-400">
                                    <ShieldCheck className="w-5 h-5" />
                                    <h3 className="font-extrabold text-xs uppercase tracking-wider">Import thành công</h3>
                                </div>
                                <ul className="text-xs text-text-secondary space-y-1 font-medium leading-relaxed">
                                    <li>• Nguồn gốc: <span className="text-text-primary font-extrabold">{importResult.source}</span></li>
                                    <li>• Đã lưu: <span className="text-text-primary font-extrabold">{importResult.totalImported} truyện</span></li>
                                    <li>• Bỏ qua: <span className="text-text-primary font-extrabold">{importResult.totalSkipped} truyện</span></li>
                                    <li>• Lỗi: <span className="text-text-primary font-extrabold">{importResult.totalFailed} truyện</span></li>
                                </ul>
                                <div className="pt-1.5 border-t border-emerald-500/20">
                                    <Link to="/admin/stories" className="inline-flex items-center gap-1 text-xs text-brand-400 font-bold hover:underline uppercase tracking-wider">
                                        Xem danh sách truyện <ArrowRight className="w-3.5 h-3.5" />
                                    </Link>
                                </div>
                            </div>
                        )}

                        {!loading && !importResult && (
                            <div className="text-center py-20 text-text-muted font-bold text-xs leading-relaxed">
                                Nhập URL truyện và nhấn Khởi chạy để hiển thị kết quả.
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="glass-card p-5">
                <h2 className="text-xs font-bold text-white border-b border-white/5 pb-3 mb-4 uppercase tracking-widest">Nhật ký lịch sử Crawl</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-text-secondary border-collapse">
                        <thead className="bg-white/[0.02] border-b border-white/5 text-text-muted font-bold uppercase tracking-wider">
                            <tr>
                                <th className="px-5 py-3 text-[10px]">ID</th>
                                <th className="px-5 py-3 text-[10px]">Nguồn</th>
                                <th className="px-5 py-3 text-[10px]">Kiểu</th>
                                <th className="px-5 py-3 text-[10px]">Trạng thái</th>
                                <th className="px-5 py-3 text-[10px]">Kết quả</th>
                                <th className="px-5 py-3 text-[10px]">Thời gian</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {logs.map((log) => (
                                <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                                    <td className="px-5 py-3 font-bold text-text-primary">#{log.id}</td>
                                    <td className="px-5 py-3 font-bold text-text-secondary">{log.sourceName}</td>
                                    <td className="px-5 py-3 font-bold text-text-muted text-[10px] uppercase">{log.importType}</td>
                                    <td className="px-5 py-3">
                                        <span className={`inline-flex px-2.5 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-wider border ${
                                            log.status === 'COMPLETED' 
                                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                                                : log.status === 'FAILED'
                                                ? 'bg-red-500/10 text-red-400 border-red-500/20'
                                                : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                        }`}>
                                            {log.status === 'COMPLETED' ? 'Thành công' : log.status === 'FAILED' ? 'Lỗi' : log.status}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3 font-bold text-text-primary">
                                        {log.totalImported}/{log.totalSkipped}/{log.totalFailed}
                                    </td>
                                    <td className="px-5 py-3 font-semibold text-text-muted">
                                        {new Date(log.startedAt).toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                            {logs.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="text-center py-6 font-bold text-text-muted">Chưa ghi nhận lượt chạy crawl nào.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ImportDataPage;
