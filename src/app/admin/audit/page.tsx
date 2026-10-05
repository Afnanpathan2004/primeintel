import { prisma } from '@/lib/db';
import { History } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AuditLogsPage() {
  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 200,
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20 font-sans">
      {/* Header */}
      <div className="border-b border-border pb-4">
        <div className="text-[10px] font-mono text-ink-muted uppercase tracking-wider mb-0.5">
          Compliance & Traceability
        </div>
        <h2 className="text-xl font-bold text-ink tracking-tight">
          System Audit Governance Trail
        </h2>
        <p className="text-xs text-ink-muted mt-0.5">
          Append-only compliance log recording estimate mutations, pricing modifications, discount overrides, and auth events.
        </p>
      </div>

      {/* Audit Table */}
      <div className="bg-surface rounded border border-border overflow-hidden">
        {logs.length === 0 ? (
          <div className="py-16 text-center text-xs text-ink-muted">
            <History className="w-8 h-8 text-ink-faint mx-auto mb-2" />
            <div className="font-semibold text-ink">No audit entries recorded</div>
            <p className="text-[11px] text-ink-muted max-w-xs mx-auto mt-1">
              Mutations and administrative adjustments will be permanently logged here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-subtle text-ink-muted border-b border-border font-semibold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-2.5 px-4">Timestamp</th>
                  <th className="py-2.5 px-4">Actor</th>
                  <th className="py-2.5 px-4">Action</th>
                  <th className="py-2.5 px-4">Entity</th>
                  <th className="py-2.5 px-4">Reason / Summary</th>
                  <th className="py-2.5 px-4 font-mono">Payload Snapshot</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-ink">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-subtle transition-colors">
                    <td className="py-3 px-4 text-ink-muted font-mono text-[11px] whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString('en-IN', {
                        year: 'numeric',
                        month: 'short',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </td>
                    <td className="py-3 px-4 font-medium text-ink">
                      {log.actor}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-ink text-[11px] font-mono">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-subtle border border-border text-ink-muted font-mono">
                        {log.entity}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-ink-muted max-w-xs truncate text-[11px]">
                      {log.reason || 'Operational update'}
                    </td>
                    <td className="py-3 px-4 font-mono text-[10px] text-ink-muted max-w-sm truncate">
                      {log.newValue || log.metadata || '—'}
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
