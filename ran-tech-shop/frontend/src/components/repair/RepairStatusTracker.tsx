import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../utils/api';

interface RepairRecord {
  ticketId: string;
  customerName: string;
  customerPhone: string;
  deviceType: string;
  deviceModel: string;
  issueDescription: string;
  currentStage: number; // 0-4 (index of stages)
  estimatedCompletion: string;
  technicianName: string;
  notes?: string;
}

// Backend stores `status` text; the tracker UI thinks in stage indices.
const statusToStage = (status?: string): number => {
  switch (status) {
    case 'confirmed': return 1;
    case 'in-progress': return 3;
    case 'completed':
    case 'cancelled': return 4;
    case 'pending':
    default: return 0;
  }
};

const toRepairRecord = (b: any): RepairRecord => ({
  ticketId: b.id,
  customerName: b.customerName || 'Customer',
  customerPhone: b.customerPhone || '',
  deviceType: b.deviceType || 'Device',
  deviceModel: b.deviceType || 'General Repair',
  issueDescription: b.issueDescription || '',
  currentStage: statusToStage(b.status),
  estimatedCompletion:
    b.completedAt?.split('T')[0] || b.date || b.createdAt?.split('T')[0] || '',
  technicianName: 'RAN Service Team',
  notes: b.notes || undefined,
});

// ============================================
// REPAIR STAGES CONFIGURATION
// ============================================
const REPAIR_STAGES = [
  {
    id: 0,
    label: 'Received',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
      </svg>
    ),
    description: 'Device received at service center',
  },
  {
    id: 1,
    label: 'Diagnosing',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
    description: 'Technician analyzing the issue',
  },
  {
    id: 2,
    label: 'Waiting for Parts',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    description: 'Awaiting replacement parts',
  },
  {
    id: 3,
    label: 'Repairing',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    description: 'Repair work in progress',
  },
  {
    id: 4,
    label: 'Ready for Pickup',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    description: 'Device repaired and ready',
  },
];

// ============================================
// MAIN COMPONENT
// ============================================
const RepairStatusTracker: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'ticket' | 'phone'>('ticket');
  const [searchResult, setSearchResult] = useState<RepairRecord | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setError('Please enter a Job Sheet Number or Mobile Number');
      return;
    }

    setIsSearching(true);
    setError(null);
    setSearchResult(null);

    let result: RepairRecord | null = null;
    try {
      if (searchType === 'ticket') {
        const id = searchQuery.trim().replace(/^#/, '');
        const res = await api.get(`/repairs/booking/${encodeURIComponent(id)}`);
        if (res.data?.booking) result = toRepairRecord(res.data.booking);
      } else {
        const phone = searchQuery.trim();
        const res = await api.get(`/repairs/my-bookings`, { params: { phone } });
        const list = res.data?.bookings || [];
        if (list.length > 0) result = toRepairRecord(list[0]);
      }
    } catch (err: any) {
      // 404 is the expected "not found" response — handle below.
      if (err?.response?.status !== 404) {
        console.error('Repair lookup failed', err);
      }
    }

    setHasSearched(true);
    setIsSearching(false);

    if (result) {
      setSearchResult(result);
    } else {
      setError(
        searchType === 'ticket'
          ? `No repair record found for Job Sheet #${searchQuery}. Please check the number and try again.`
          : `No repair record found for mobile number ${searchQuery}. Please check the number and try again.`
      );
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const resetSearch = () => {
    setSearchQuery('');
    setSearchResult(null);
    setError(null);
    setHasSearched(false);
  };

  return (
    <div className="bg-dark-200/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6 md:p-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
          Repair Status Tracker
        </h2>
        <p className="text-white/60">
          Track your device repair progress in real-time
        </p>
      </div>

      {/* Search Form */}
      <div className="max-w-xl mx-auto mb-8">
        {/* Search Type Toggle */}
        <div className="flex bg-dark-100/50 rounded-lg p-1 mb-4">
          <button
            onClick={() => setSearchType('ticket')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
              searchType === 'ticket'
                ? 'bg-primary text-dark'
                : 'text-white/60 hover:text-white'
            }`}
          >
            Job Sheet Number
          </button>
          <button
            onClick={() => setSearchType('phone')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
              searchType === 'phone'
                ? 'bg-primary text-dark'
                : 'text-white/60 hover:text-white'
            }`}
          >
            Mobile Number
          </button>
        </div>

        {/* Search Input */}
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              {searchType === 'ticket' ? (
                <svg className="w-5 h-5 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              )}
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={searchType === 'ticket' ? 'Enter Job Sheet # (e.g., 101)' : 'Enter Mobile Number'}
              className="w-full pl-12 pr-4 py-4 bg-dark-100/50 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSearch}
            disabled={isSearching}
            className="px-6 py-4 bg-primary text-dark font-semibold rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSearching ? (
              <>
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span className="hidden sm:inline">Searching...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span className="hidden sm:inline">Track Status</span>
              </>
            )}
          </motion.button>
        </div>

        {/* Demo hint */}
        <p className="text-white/40 text-xs mt-3 text-center">
          💡 Demo: Try Job Sheet #101, #102, #103, #104, or #105
        </p>
      </div>

      {/* Results Section */}
      <AnimatePresence mode="wait">
        {/* Error State */}
        {error && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-xl mx-auto"
          >
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Record Not Found</h3>
              <p className="text-white/60 mb-4">{error}</p>
              <button
                onClick={resetSearch}
                className="text-primary hover:text-primary/80 font-medium transition-colors"
              >
                Try Another Search
              </button>
            </div>
          </motion.div>
        )}

        {/* Success State - Repair Status */}
        {searchResult && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {/* Device Info Card */}
            <div className="bg-dark-100/50 border border-white/10 rounded-xl p-6 mb-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-white/60 text-sm">Job Sheet</span>
                    <span className="bg-primary/20 text-primary text-sm font-mono px-2 py-0.5 rounded">
                      #{searchResult.ticketId}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white">
                    {searchResult.deviceType} - {searchResult.deviceModel}
                  </h3>
                </div>
                <button
                  onClick={resetSearch}
                  className="text-white/60 hover:text-white text-sm flex items-center gap-1 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  New Search
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <span className="text-white/40 text-xs uppercase tracking-wider">Customer</span>
                  <p className="text-white font-medium">{searchResult.customerName}</p>
                </div>
                <div>
                  <span className="text-white/40 text-xs uppercase tracking-wider">Issue</span>
                  <p className="text-white font-medium">{searchResult.issueDescription}</p>
                </div>
                <div>
                  <span className="text-white/40 text-xs uppercase tracking-wider">Technician</span>
                  <p className="text-white font-medium">{searchResult.technicianName}</p>
                </div>
                <div>
                  <span className="text-white/40 text-xs uppercase tracking-wider">Est. Completion</span>
                  <p className="text-white font-medium">
                    {new Date(searchResult.estimatedCompletion).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Progress Stepper */}
            <div className="mb-8">
              <h4 className="text-lg font-semibold text-white mb-6 text-center">Repair Progress</h4>
              
              {/* Desktop Horizontal Stepper */}
              <div className="hidden md:block">
                <div className="relative">
                  {/* Progress Line Background */}
                  <div className="absolute top-6 left-0 right-0 h-1 bg-dark-100/50 rounded-full" />
                  
                  {/* Progress Line Fill */}
                  <motion.div
                    className="absolute top-6 left-0 h-1 bg-gradient-to-r from-green-500 to-green-400 rounded-full"
                    initial={{ width: '0%' }}
                    animate={{ width: `${(searchResult.currentStage / (REPAIR_STAGES.length - 1)) * 100}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                  />

                  {/* Steps */}
                  <div className="relative flex justify-between">
                    {REPAIR_STAGES.map((stage, index) => {
                      const isCompleted = index < searchResult.currentStage;
                      const isCurrent = index === searchResult.currentStage;

                      return (
                        <motion.div
                          key={stage.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex flex-col items-center"
                          style={{ width: '20%' }}
                        >
                          {/* Step Circle */}
                          <motion.div
                            className={`w-12 h-12 rounded-full flex items-center justify-center z-10 transition-all ${
                              isCompleted
                                ? 'bg-green-500 text-white'
                                : isCurrent
                                ? 'bg-primary text-dark ring-4 ring-primary/30'
                                : 'bg-dark-100/80 text-white/40 border border-white/10'
                            }`}
                            animate={isCurrent ? { scale: [1, 1.1, 1] } : {}}
                            transition={{ repeat: Infinity, duration: 2 }}
                          >
                            {isCompleted ? (
                              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            ) : (
                              stage.icon
                            )}
                          </motion.div>

                          {/* Step Label */}
                          <span
                            className={`mt-3 text-sm font-medium text-center ${
                              isCurrent ? 'text-primary' : isCompleted ? 'text-green-400' : 'text-white/40'
                            }`}
                          >
                            {stage.label}
                          </span>

                          {/* Current Stage Indicator */}
                          {isCurrent && (
                            <motion.span
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="mt-1 text-xs text-primary/80"
                            >
                              Current Stage
                            </motion.span>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Mobile Vertical Stepper */}
              <div className="md:hidden">
                <div className="relative pl-8">
                  {/* Vertical Line */}
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-dark-100/50" />
                  
                  {/* Progress Fill */}
                  <motion.div
                    className="absolute left-4 top-0 w-0.5 bg-gradient-to-b from-green-500 to-green-400"
                    initial={{ height: '0%' }}
                    animate={{ 
                      height: `${(searchResult.currentStage / (REPAIR_STAGES.length - 1)) * 100}%` 
                    }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                  />

                  <div className="space-y-6">
                    {REPAIR_STAGES.map((stage, index) => {
                      const isCompleted = index < searchResult.currentStage;
                      const isCurrent = index === searchResult.currentStage;

                      return (
                        <motion.div
                          key={stage.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="relative flex items-start gap-4"
                        >
                          {/* Step Circle */}
                          <motion.div
                            className={`absolute -left-8 w-8 h-8 rounded-full flex items-center justify-center z-10 ${
                              isCompleted
                                ? 'bg-green-500 text-white'
                                : isCurrent
                                ? 'bg-primary text-dark ring-4 ring-primary/30'
                                : 'bg-dark-100/80 text-white/40 border border-white/10'
                            }`}
                            animate={isCurrent ? { scale: [1, 1.1, 1] } : {}}
                            transition={{ repeat: Infinity, duration: 2 }}
                          >
                            {isCompleted ? (
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            ) : (
                              <div className="scale-75">{stage.icon}</div>
                            )}
                          </motion.div>

                          {/* Content */}
                          <div className={`pb-2 ${isCurrent ? 'opacity-100' : 'opacity-60'}`}>
                            <span
                              className={`font-medium ${
                                isCurrent ? 'text-primary' : isCompleted ? 'text-green-400' : 'text-white'
                              }`}
                            >
                              {stage.label}
                            </span>
                            {isCurrent && (
                              <span className="ml-2 text-xs bg-primary/20 text-primary px-2 py-0.5 rounded">
                                Current
                              </span>
                            )}
                            <p className="text-white/50 text-sm mt-1">{stage.description}</p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Notes Section */}
            {searchResult.notes && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="bg-primary/5 border border-primary/20 rounded-xl p-4"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <span className="text-primary font-medium text-sm">Technician Notes</span>
                    <p className="text-white/70 text-sm mt-1">{searchResult.notes}</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Ready for Pickup Banner */}
            {searchResult.currentStage === 4 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-6 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl p-6 text-center"
              >
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-green-400 mb-2">Your Device is Ready!</h3>
                <p className="text-white/70 mb-4">
                  Please visit our service center to collect your device. Don't forget to bring your Job Sheet receipt.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <a
                    href="tel:+94112345678"
                    className="flex items-center gap-2 text-white hover:text-primary transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span>Call Us</span>
                  </a>
                  <span className="text-white/20 hidden sm:inline">|</span>
                  <a
                    href="https://maps.google.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-white hover:text-primary transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>Get Directions</span>
                  </a>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Initial State - No search yet */}
        {!hasSearched && !error && !searchResult && (
          <motion.div
            key="initial"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8"
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl mx-auto">
              <div className="bg-dark-100/30 rounded-xl p-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <h4 className="text-white font-medium mb-1">Real-Time Updates</h4>
                <p className="text-white/50 text-sm">Track every step of your repair</p>
              </div>
              <div className="bg-dark-100/30 rounded-xl p-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h4 className="text-white font-medium mb-1">Estimated Time</h4>
                <p className="text-white/50 text-sm">Know when to expect pickup</p>
              </div>
              <div className="bg-dark-100/30 rounded-xl p-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h4 className="text-white font-medium mb-1">Instant Alerts</h4>
                <p className="text-white/50 text-sm">Get notified when ready</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RepairStatusTracker;
