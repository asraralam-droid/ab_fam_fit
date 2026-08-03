import React, { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { User, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { RootState } from '../../../store';
import { AdminAffiliateGuard, AdminAffiliateHeader } from '../../admin/adminAffiliateUi';

function isConverted(status: string) {
  return status === 'converted' || status === 'paid' || status === 'active';
}

function parseReferralDate(dateStr: string): Date | null {
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return new Date(`${dateStr}T12:00:00`);
  }
  const parsed = Date.parse(dateStr);
  return Number.isNaN(parsed) ? null : new Date(parsed);
}

function formatReferralDate(dateStr: string) {
  const date = parseReferralDate(dateStr);
  if (!date) return dateStr;
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

export function AdminReferralsList() {
  const { allReferrals, affiliates } = useSelector(
    (state: RootState) => state.affiliate
  );

  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedAffiliate, setSelectedAffiliate] = useState('all');
  const [selectedReferralPerson, setSelectedReferralPerson] = useState('all');

  const affiliateName = (id: string) =>
    affiliates.find((a) => a.id === id)?.name ?? 'Unknown';

  const referralPersons = useMemo(() => {
    const pool =
      selectedAffiliate === 'all'
        ? allReferrals
        : allReferrals.filter((r) => r.affiliateId === selectedAffiliate);
    const names = [...new Set(pool.map((r) => r.name))].sort();
    return names;
  }, [allReferrals, selectedAffiliate]);

  const filteredReferrals = useMemo(() => {
    let filtered = [...allReferrals];

    if (selectedAffiliate !== 'all') {
      filtered = filtered.filter((r) => r.affiliateId === selectedAffiliate);
    }

    if (selectedReferralPerson !== 'all') {
      filtered = filtered.filter((r) => r.name === selectedReferralPerson);
    }

    if (dateFrom) {
      const from = new Date(`${dateFrom}T00:00:00`);
      filtered = filtered.filter((r) => {
        const date = parseReferralDate(r.date);
        return date !== null && date >= from;
      });
    }

    if (dateTo) {
      const to = new Date(`${dateTo}T23:59:59`);
      filtered = filtered.filter((r) => {
        const date = parseReferralDate(r.date);
        return date !== null && date <= to;
      });
    }

    return filtered.sort((a, b) => {
      const aTime = parseReferralDate(a.date)?.getTime() ?? 0;
      const bTime = parseReferralDate(b.date)?.getTime() ?? 0;
      return bTime - aTime;
    });
  }, [
    allReferrals,
    selectedAffiliate,
    selectedReferralPerson,
    dateFrom,
    dateTo
  ]);

  const hasActiveFilters = Boolean(
    dateFrom ||
      dateTo ||
      selectedAffiliate !== 'all' ||
      selectedReferralPerson !== 'all'
  );

  const clearFilters = () => {
    setDateFrom('');
    setDateTo('');
    setSelectedAffiliate('all');
    setSelectedReferralPerson('all');
  };

  return (
    <AdminAffiliateGuard>
      <div className="flex flex-col h-full overflow-y-auto pb-24 bg-background">
        <AdminAffiliateHeader title="Referrals" backTo="/admin/affiliate" />

        <div className="p-4 border-b border-border bg-surface/50">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-text-muted uppercase tracking-wider">
                From
              </label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="bg-background border border-border rounded-xl px-3 py-2 text-sm text-text focus:outline-none focus:border-primary transition-colors w-full"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-text-muted uppercase tracking-wider">
                To
              </label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="bg-background border border-border rounded-xl px-3 py-2 text-sm text-text focus:outline-none focus:border-primary transition-colors w-full"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-text-muted uppercase tracking-wider flex items-center gap-1">
                <User className="w-3 h-3" strokeWidth={2} />
                Affiliate
              </label>
              <select
                value={selectedAffiliate}
                onChange={(e) => {
                  setSelectedAffiliate(e.target.value);
                  setSelectedReferralPerson('all');
                }}
                className="bg-background border border-border rounded-xl px-3 py-2 text-sm text-text focus:outline-none focus:border-primary transition-colors cursor-pointer w-full">
                <option value="all">All Affiliates</option>
                {affiliates.map((affiliate) => (
                  <option key={affiliate.id} value={affiliate.id}>
                    {affiliate.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-text-muted uppercase tracking-wider flex items-center gap-1">
                <Users className="w-3 h-3" strokeWidth={2} />
                Referral Person
              </label>
              <select
                value={selectedReferralPerson}
                onChange={(e) => setSelectedReferralPerson(e.target.value)}
                className="bg-background border border-border rounded-xl px-3 py-2 text-sm text-text focus:outline-none focus:border-primary transition-colors cursor-pointer w-full">
                <option value="all">All Persons</option>
                {referralPersons.map((person) => (
                  <option key={person} value={person}>
                    {person}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4 flex flex-col sm:flex-row gap-2 sm:justify-between sm:items-center">
            <div className="text-xs text-text-muted">
              Showing{' '}
              <span className="font-bold text-text">{filteredReferrals.length}</span>{' '}
              of{' '}
              <span className="font-bold text-text">{allReferrals.length}</span>{' '}
              referrals
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-xs font-medium px-3 py-1.5 rounded-lg text-primary hover:bg-primary/10 transition-colors w-full sm:w-auto">
                Clear filters
              </button>
            )}
          </div>
        </div>

        <div className="p-4 flex flex-col gap-3">
          {filteredReferrals.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-10 text-center text-sm text-text-muted bg-surface rounded-2xl border border-border">
              {allReferrals.length === 0
                ? 'No referrals recorded'
                : 'No referrals match the selected filters'}
            </motion.div>
          ) : (
            filteredReferrals.map((r, i) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="bg-surface border border-border rounded-2xl p-4 hover:border-primary/30 transition-colors">
                <div className="flex items-start sm:items-center gap-3 mb-3 flex-col sm:flex-row">
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm flex-shrink-0">
                      {r.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0 sm:flex-none">
                      <p className="text-sm font-bold text-text truncate">{r.name}</p>
                      <p className="text-xs text-text-muted truncate">
                        via {affiliateName(r.affiliateId)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-2">
                    <span className="text-xs text-text-muted">
                      {formatReferralDate(r.date)}
                    </span>
                    <span
                      className={`text-[9px] uppercase tracking-wider font-bold px-2 py-1 rounded-full whitespace-nowrap ${
                        isConverted(r.status)
                          ? 'bg-accent-sage/20 text-accent-sage'
                          : 'bg-yellow-500/15 text-yellow-700 dark:text-yellow-400'
                      }`}>
                      {isConverted(r.status) ? 'converted' : 'pending'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="bg-surface-2 rounded-xl p-2.5">
                    <p className="text-[9px] text-text-muted uppercase tracking-wider font-bold">
                      Product
                    </p>
                    <p className="text-xs font-bold text-text truncate">{r.joinedVia}</p>
                  </div>
                  <div className="bg-surface-2 rounded-xl p-2.5">
                    <p className="text-[9px] text-text-muted uppercase tracking-wider font-bold">
                      Purchase
                    </p>
                    <p className="text-sm font-bold text-text">${r.purchaseValue}</p>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </AdminAffiliateGuard>
  );
}
