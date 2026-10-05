import { prisma } from '@/lib/db';
import { History, Shield, Clock, User, ArrowRight } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AuditLogsPage() {
  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      <div className="border-b border-slate-200 pb-5">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
          System Audit Logs & Governance Trail
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Immutable tracking of pricing revisions, discount overrides, status modifications, and estimate creations.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {logs.length === 0 ? (
          <div className="py-20 text-center text-slate-500 text-xs">
            No audit log entries recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase font-semibold">
                <tr>
                  <th className="py-3 px-6">Timestamp</th>
                  <th className="py-3 px-6">Action & Entity</th>
                  <th className="py-3 px-6">Performed By</th>
                  <th className="py-3 px-6">Reason / Summary</th>
                  <th className="py-3 px-6">Details (New Value)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70">
                    <td className="py-4 px-6 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString('en-IN')}
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-semibold text-slate-900">{log.action}</div>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-mono mt-0.5 inline-block">
                        {log.entityType}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-600 font-medium">
                      {log.performedBy}
                    </td>
                    <td className="py-4 px-6 text-slate-700 font-medium max-w-xs">
                      {log.reason || 'Standard operational update'}
                    </td>
                    <td className="py-4 px-6 font-mono text-[10px] text-slate-500 max-w-sm truncate">
                      {log.newValue || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
