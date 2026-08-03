// // import React from 'react';
// // import { useSelector } from 'react-redux';
// // import { RootState } from '../../../store';
// // import { motion } from 'framer-motion';
// // import { AdminAffiliateGuard, AdminAffiliateHeader } from '../../admin/adminAffiliateUi';

// // function isConverted(status: string) {
// //   return status === 'converted' || status === 'paid' || status === 'active';
// // }

// // export function AdminReferralsList() {
// //   const { allReferrals, affiliates } = useSelector((state: RootState) => state.affiliate);

// //   const affiliateName = (id: string) =>
// //     affiliates.find((a) => a.id === id)?.name ?? 'Unknown';

// //   return (
// //     <AdminAffiliateGuard>
// //       <div className="flex flex-col h-full overflow-y-auto pb-24 bg-background">
// //         <AdminAffiliateHeader title="Referrals" backTo="/admin/affiliate" />
// //         <div className="p-4 flex flex-col gap-3">
// //       {allReferrals.length === 0 ? (
// //         <div className="p-10 text-center text-sm text-text-muted">No referrals recorded</div>
// //       ) : (
// //         allReferrals.map((r, i) => (
// //           <motion.div
// //             key={r.id}
// //             initial={{ opacity: 0, y: 6 }}
// //             animate={{ opacity: 1, y: 0 }}
// //             transition={{ delay: i * 0.03 }}
// //             className="bg-surface border border-border rounded-2xl p-4">
// //             <div className="flex items-center gap-3 mb-3">
// //               <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
// //                 {r.name.charAt(0)}
// //               </div>
// //               <div className="flex-1 min-w-0">
// //                 <p className="text-sm font-bold text-text truncate">{r.name}</p>
// //                 <p className="text-xs text-text-muted">
// //                   via {affiliateName(r.affiliateId)} · {r.date}
// //                 </p>
// //               </div>
// //               <span
// //                 className={`text-[9px] uppercase tracking-wider font-bold px-2 py-1 rounded-full ${
// //                   isConverted(r.status)
// //                     ? 'bg-accent-sage/20 text-accent-sage'
// //                     : 'bg-yellow-500/15 text-yellow-700 dark:text-yellow-400'
// //                 }`}>
// //                 {isConverted(r.status) ? 'converted' : 'pending'}
// //               </span>
// //             </div>
// //             <div className="grid grid-cols-2 gap-2">
// //               <div className="bg-surface-2 rounded-xl p-2.5">
// //                 <p className="text-[9px] text-text-muted uppercase tracking-wider font-bold">Product</p>
// //                 <p className="text-xs font-bold text-text truncate">{r.joinedVia}</p>
// //               </div>
// //               <div className="bg-surface-2 rounded-xl p-2.5">
// //                 <p className="text-[9px] text-text-muted uppercase tracking-wider font-bold">Purchase</p>
// //                 <p className="text-sm font-bold text-text">${r.purchaseValue}</p>
// //               </div>
// //             </div>
// //           </motion.div>
// //         ))
// //       )}
// //         </div>
// //       </div>
// //     </AdminAffiliateGuard>
// //   );
// // }


// import React, { useState, useMemo } from 'react';
// import { useSelector } from 'react-redux';
// import { RootState } from '../../../store';
// import { motion } from 'framer-motion';
// import { AdminAffiliateGuard, AdminAffiliateHeader } from '../../admin/adminAffiliateUi';

// function isConverted(status: string) {
//   return status === 'converted' || status === 'paid' || status === 'active';
// }

// export function AdminReferralsList() {
//   const { allReferrals, affiliates } = useSelector((state: RootState) => state.affiliate);
  
//   // Filter states
//   const [dateFrom, setDateFrom] = useState('');
//   const [dateTo, setDateTo] = useState('');
//   const [selectedAffiliate, setSelectedAffiliate] = useState<string>('all');
//   const [selectedReferralPerson, setSelectedReferralPerson] = useState<string>('all');

//   const affiliateName = (id: string) =>
//     affiliates.find((a) => a.id === id)?.name ?? 'Unknown';

//   // Get unique referral persons for selected affiliate
//   const referralPersons = useMemo(() => {
//     if (selectedAffiliate === 'all') {
//       const allNames = allReferrals.map(r => r.name);
//       return ['all', ...new Set(allNames)];
//     }
//     const affiliateReferrals = allReferrals.filter(r => r.affiliateId === selectedAffiliate);
//     const names = affiliateReferrals.map(r => r.name);
//     return ['all', ...new Set(names)];
//   }, [selectedAffiliate, allReferrals]);

//   // Filter referrals based on all criteria
//   const filteredReferrals = useMemo(() => {
//     let filtered = [...allReferrals];

//     // Filter by affiliate
//     if (selectedAffiliate !== 'all') {
//       filtered = filtered.filter(r => r.affiliateId === selectedAffiliate);
//     }

//     // Filter by referral person
//     if (selectedReferralPerson !== 'all') {
//       filtered = filtered.filter(r => r.name === selectedReferralPerson);
//     }

//     // Filter by date range
//     if (dateFrom) {
//       filtered = filtered.filter(r => new Date(r.date) >= new Date(dateFrom));
//     }
//     if (dateTo) {
//       filtered = filtered.filter(r => new Date(r.date) <= new Date(dateTo));
//     }

//     // Sort by date (newest first)
//     return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
//   }, [allReferrals, selectedAffiliate, selectedReferralPerson, dateFrom, dateTo]);

//   // Clear all filters
//   const clearFilters = () => {
//     setDateFrom('');
//     setDateTo('');
//     setSelectedAffiliate('all');
//     setSelectedReferralPerson('all');
//   };

//   return (
//     <AdminAffiliateGuard>
//       <div className="flex flex-col h-full overflow-y-auto pb-24 bg-background">
//         <AdminAffiliateHeader title="Referrals" backTo="/admin/affiliate" />
        
//         {/* Filters Section */}
//         <div className="p-4 border-b border-border bg-surface/50">
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
//             {/* Date From */}
//             <div className="flex flex-col gap-1.5">
//               <label className="text-xs font-bold text-text-muted uppercase tracking-wider">From Date</label>
//               <input
//                 type="date"
//                 value={dateFrom}
//                 onChange={(e) => setDateFrom(e.target.value)}
//                 className="bg-background border border-border rounded-xl px-3 py-2 text-sm text-text focus:outline-none focus:border-primary transition-colors"
//               />
//             </div>

//             {/* Date To */}
//             <div className="flex flex-col gap-1.5">
//               <label className="text-xs font-bold text-text-muted uppercase tracking-wider">To Date</label>
//               <input
//                 type="date"
//                 value={dateTo}
//                 onChange={(e) => setDateTo(e.target.value)}
//                 className="bg-background border border-border rounded-xl px-3 py-2 text-sm text-text focus:outline-none focus:border-primary transition-colors"
//               />
//             </div>

//             {/* Affiliate Filter */}
//             <div className="flex flex-col gap-1.5">
//               <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Affiliate</label>
//               <select
//                 value={selectedAffiliate}
//                 onChange={(e) => {
//                   setSelectedAffiliate(e.target.value);
//                   setSelectedReferralPerson('all');
//                 }}
//                 className="bg-background border border-border rounded-xl px-3 py-2 text-sm text-text focus:outline-none focus:border-primary transition-colors cursor-pointer"
//               >
//                 <option value="all">All Affiliates</option>
//                 {affiliates.map((affiliate) => (
//                   <option key={affiliate.id} value={affiliate.id}>
//                     {affiliate.name}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             {/* Referral Person Filter */}
//             <div className="flex flex-col gap-1.5">
//               <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Referral Person</label>
//               <select
//                 value={selectedReferralPerson}
//                 onChange={(e) => setSelectedReferralPerson(e.target.value)}
//                 className="bg-background border border-border rounded-xl px-3 py-2 text-sm text-text focus:outline-none focus:border-primary transition-colors cursor-pointer"
//                 disabled={selectedAffiliate === 'all' && referralPersons.length === 1}
//               >
//                 {referralPersons.map((person) => (
//                   <option key={person} value={person}>
//                     {person === 'all' ? 'All Persons' : person}
//                   </option>
//                 ))}
//               </select>
//             </div>
//           </div>

//           {/* Clear Filters Button */}
//           {(dateFrom || dateTo || selectedAffiliate !== 'all' || selectedReferralPerson !== 'all') && (
//             <div className="mt-3 flex justify-end">
//               <button
//                 onClick={clearFilters}
//                 className="text-xs font-medium px-3 py-1.5 rounded-lg text-primary hover:bg-primary/10 transition-colors"
//               >
//                 Clear Filters
//               </button>
//             </div>
//           )}

//           {/* Results Count */}
//           <div className="mt-3 text-xs text-text-muted">
//             Showing {filteredReferrals.length} of {allReferrals.length} referrals
//           </div>
//         </div>

//         {/* Referrals List */}
//         <div className="p-4 flex flex-col gap-3">
//           {filteredReferrals.length === 0 ? (
//             <div className="p-10 text-center text-sm text-text-muted">
//               {allReferrals.length === 0 
//                 ? 'No referrals recorded' 
//                 : 'No referrals match the selected filters'}
//             </div>
//           ) : (
//             filteredReferrals.map((r, i) => (
//               <motion.div
//                 key={r.id}
//                 initial={{ opacity: 0, y: 6 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ delay: i * 0.03 }}
//                 className="bg-surface border border-border rounded-2xl p-4"
//               >
//                 <div className="flex items-center gap-3 mb-3">
//                   <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
//                     {r.name.charAt(0)}
//                   </div>
//                   <div className="flex-1 min-w-0">
//                     <p className="text-sm font-bold text-text truncate">{r.name}</p>
//                     <p className="text-xs text-text-muted">
//                       via {affiliateName(r.affiliateId)} · {r.date}
//                     </p>
//                   </div>
//                   <span
//                     className={`text-[9px] uppercase tracking-wider font-bold px-2 py-1 rounded-full ${
//                       isConverted(r.status)
//                         ? 'bg-accent-sage/20 text-accent-sage'
//                         : 'bg-yellow-500/15 text-yellow-700 dark:text-yellow-400'
//                     }`}
//                   >
//                     {isConverted(r.status) ? 'converted' : 'pending'}
//                   </span>
//                 </div>
//                 <div className="grid grid-cols-2 gap-2">
//                   <div className="bg-surface-2 rounded-xl p-2.5">
//                     <p className="text-[9px] text-text-muted uppercase tracking-wider font-bold">Product</p>
//                     <p className="text-xs font-bold text-text truncate">{r.joinedVia}</p>
//                   </div>
//                   <div className="bg-surface-2 rounded-xl p-2.5">
//                     <p className="text-[9px] text-text-muted uppercase tracking-wider font-bold">Purchase</p>
//                     <p className="text-sm font-bold text-text">${r.purchaseValue}</p>
//                   </div>
//                 </div>
//               </motion.div>
//             ))
//           )}
//         </div>
//       </div>
//     </AdminAffiliateGuard>
//   );
// }


import React, { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store';
import { motion } from 'framer-motion';
import { AdminAffiliateGuard, AdminAffiliateHeader } from '../../admin/adminAffiliateUi';

function isConverted(status: string) {
  return status === 'converted' || status === 'paid' || status === 'active';
}

export function AdminReferralsList() {
  const { allReferrals, affiliates } = useSelector((state: RootState) => state.affiliate);
  
  // Filter states
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedAffiliate, setSelectedAffiliate] = useState<string>('all');
  const [selectedReferralPerson, setSelectedReferralPerson] = useState<string>('all');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const affiliateName = (id: string) =>
    affiliates.find((a) => a.id === id)?.name ?? 'Unknown';

  // Get unique referral persons for selected affiliate
  const referralPersons = useMemo(() => {
    if (selectedAffiliate === 'all') {
      const allNames = allReferrals.map(r => r.name);
      return ['all', ...new Set(allNames)];
    }
    const affiliateReferrals = allReferrals.filter(r => r.affiliateId === selectedAffiliate);
    const names = affiliateReferrals.map(r => r.name);
    return ['all', ...new Set(names)];
  }, [selectedAffiliate, allReferrals]);

  // Filter referrals based on all criteria
  const filteredReferrals = useMemo(() => {
    let filtered = [...allReferrals];

    // Filter by affiliate
    if (selectedAffiliate !== 'all') {
      filtered = filtered.filter(r => r.affiliateId === selectedAffiliate);
    }

    // Filter by referral person
    if (selectedReferralPerson !== 'all') {
      filtered = filtered.filter(r => r.name === selectedReferralPerson);
    }

    // Filter by date range
    if (dateFrom) {
      filtered = filtered.filter(r => new Date(r.date) >= new Date(dateFrom));
    }
    if (dateTo) {
      filtered = filtered.filter(r => new Date(r.date) <= new Date(dateTo));
    }

    // Sort by date (newest first)
    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [allReferrals, selectedAffiliate, selectedReferralPerson, dateFrom, dateTo]);

  // Check if any filters are active
  const hasActiveFilters = dateFrom || dateTo || selectedAffiliate !== 'all' || selectedReferralPerson !== 'all';

  // Clear all filters
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
        
        {/* Mobile Filter Toggle Button */}
        <div className="lg:hidden p-4 pb-0">
          <button
            onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
            className="w-full bg-surface border border-border rounded-xl px-4 py-3 flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              <span className="text-sm font-medium text-text">Filters</span>
              {hasActiveFilters && (
                <span className="ml-1 px-2 py-0.5 text-xs bg-primary text-white rounded-full">
                  Active
                </span>
              )}
            </div>
            <svg 
              className={`w-5 h-5 text-text-muted transition-transform ${mobileFiltersOpen ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {/* Filters Section - Desktop always visible, Mobile toggleable */}
        <div className={`
          ${mobileFiltersOpen ? 'block' : 'hidden lg:block'}
          p-4 border-b border-border bg-surface/50
        `}>
          <div className="grid grid-cols-2 gap-3">
            {/* Date From */}
            <div className="flex flex-col gap-1.5 min-w-0">
              <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider flex items-start gap-1 min-h-[32px]">
                <svg className="w-3 h-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="leading-tight">From Date</span>
              </label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="bg-background border border-border rounded-xl px-3 py-2 text-sm text-text focus:outline-none focus:border-primary transition-colors w-full min-w-0"
              />
            </div>

            {/* Date To */}
            <div className="flex flex-col gap-1.5 min-w-0">
              <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider flex items-start gap-1 min-h-[32px]">
                <svg className="w-3 h-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="leading-tight">To Date</span>
              </label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="bg-background border border-border rounded-xl px-3 py-2 text-sm text-text focus:outline-none focus:border-primary transition-colors w-full min-w-0"
              />
            </div>

            {/* Affiliate Filter */}
            <div className="flex flex-col gap-1.5 min-w-0">
              <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider flex items-start gap-1 min-h-[32px]">
                <svg className="w-3 h-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="leading-tight">Affiliate</span>
              </label>
              <select
                value={selectedAffiliate}
                onChange={(e) => {
                  setSelectedAffiliate(e.target.value);
                  setSelectedReferralPerson('all');
                }}
                className="bg-background border border-border rounded-xl px-3 py-2 text-sm text-text focus:outline-none focus:border-primary transition-colors cursor-pointer w-full min-w-0"
              >
                <option value="all">All Affiliates</option>
                {affiliates.map((affiliate) => (
                  <option key={affiliate.id} value={affiliate.id}>
                    {affiliate.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Referral Person Filter */}
            <div className="flex flex-col gap-1.5 min-w-0">
              <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider flex items-start gap-1 min-h-[32px]">
                <svg className="w-3 h-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <span className="leading-tight">Referral Person</span>
              </label>
              <select
                value={selectedReferralPerson}
                onChange={(e) => setSelectedReferralPerson(e.target.value)}
                className="bg-background border border-border rounded-xl px-3 py-2 text-sm text-text focus:outline-none focus:border-primary transition-colors cursor-pointer w-full min-w-0"
                disabled={selectedAffiliate === 'all' && referralPersons.length === 1}
              >
                {referralPersons.map((person) => (
                  <option key={person} value={person}>
                    {person === 'all' ? 'All Persons' : person}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Filter Actions Row */}
          <div className="mt-4 flex flex-col sm:flex-row gap-2 sm:justify-between sm:items-center">
            {/* Results Count - Mobile Friendly */}
            <div className="text-xs text-text-muted text-center sm:text-left">
              Showing <span className="font-bold text-text">{filteredReferrals.length}</span> of{' '}
              <span className="font-bold text-text">{allReferrals.length}</span> referrals
            </div>

            {/* Clear Filters Button */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-xs font-medium px-3 py-1.5 rounded-lg text-primary hover:bg-primary/10 transition-colors w-full sm:w-auto"
              >
                Clear All Filters
              </button>
            )}
          </div>
        </div>

        {/* Referrals List */}
        <div className="p-4 flex flex-col gap-3">
          {filteredReferrals.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-10 text-center text-sm text-text-muted bg-surface rounded-2xl border border-border"
            >
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
                className="bg-surface border border-border rounded-2xl p-4 hover:border-primary/30 transition-colors"
              >
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
                    <span className="text-xs text-text-muted">{r.date}</span>
                    <span
                      className={`text-[9px] uppercase tracking-wider font-bold px-2 py-1 rounded-full whitespace-nowrap ${
                        isConverted(r.status)
                          ? 'bg-accent-sage/20 text-accent-sage'
                          : 'bg-yellow-500/15 text-yellow-700 dark:text-yellow-400'
                      }`}
                    >
                      {isConverted(r.status) ? 'converted' : 'pending'}
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="bg-surface-2 rounded-xl p-2.5">
                    <p className="text-[9px] text-text-muted uppercase tracking-wider font-bold">Product</p>
                    <p className="text-xs font-bold text-text truncate">{r.joinedVia}</p>
                  </div>
                  <div className="bg-surface-2 rounded-xl p-2.5">
                    <p className="text-[9px] text-text-muted uppercase tracking-wider font-bold">Purchase</p>
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