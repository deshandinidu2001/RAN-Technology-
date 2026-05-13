import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import type { RepairCategory } from '../../types';

type Device = 'desktop' | 'laptop' | 'mobile';
const DEVICES: Device[] = ['desktop', 'laptop', 'mobile'];

const RepairCategoryManager: React.FC = () => {
  const [device, setDevice] = useState<Device>('desktop');
  const [list, setList] = useState<RepairCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const load = async (d: Device) => {
    setLoading(true);
    try {
      const res = await api.get(`/repair-categories?deviceType=${d}`);
      setList(res.data?.categories ?? []);
    } catch {
      setError('Failed to load categories.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(device); }, [device]);

  const create = async () => {
    if (!name.trim()) return;
    setError(null);
    try {
      const res = await api.post('/repair-categories', { name: name.trim(), deviceType: device });
      setList(prev => [...prev, res.data.category]);
      setName('');
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Could not create category');
    }
  };

  const rename = async (cat: RepairCategory) => {
    const newName = window.prompt('Rename category', cat.name);
    if (!newName || newName === cat.name) return;
    try {
      const res = await api.patch(`/repair-categories/${cat.id}`, { name: newName });
      setList(prev => prev.map(c => c.id === cat.id ? res.data.category : c));
    } catch {/* silent */}
  };

  const remove = async (cat: RepairCategory) => {
    if (!window.confirm(`Delete category "${cat.name}"? Services already tagged keep their tag, but customers won't see this tab.`)) return;
    try {
      await api.delete(`/repair-categories/${cat.id}`);
      setList(prev => prev.filter(c => c.id !== cat.id));
    } catch {/* silent */}
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-white text-xl font-bold">Repair Categories</h2>
        <p className="text-white/50 text-sm mt-1">
          Group repair services into categories per device (e.g. Screen, Battery, Software).
          These appear as tabs on the customer's repair page.
        </p>
      </div>

      <div className="flex gap-2 mb-6">
        {DEVICES.map(d => (
          <button key={d}
            onClick={() => setDevice(d)}
            className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors ${
              device === d
                ? 'bg-primary text-dark'
                : 'border border-white/10 text-white/60 hover:text-white hover:border-white/30'
            }`}
          >{d}</button>
        ))}
      </div>

      <div className="flex gap-2 mb-6">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') create(); }}
          placeholder={`New ${device} category (e.g. Screen, Battery, Software)`}
          className="flex-1 px-4 py-3 bg-dark-200/50 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-primary/50"
        />
        <button
          onClick={create}
          className="px-5 py-3 bg-primary text-dark font-semibold hover:bg-primary/90"
        >Add</button>
      </div>

      {error && <p className="text-red-400 text-sm mb-3">{error}</p>}

      {loading ? (
        <p className="text-white/40">Loading…</p>
      ) : list.length === 0 ? (
        <p className="text-white/40 text-sm">No categories yet for {device}. Add a few above.</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {list.map(c => (
            <div key={c.id} className="border border-white/10 p-4 flex items-center justify-between">
              <div>
                <div className="text-white font-medium">{c.name}</div>
                <div className="text-white/40 text-[10px] uppercase tracking-wider mt-0.5">{c.slug}</div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => rename(c)}
                  className="px-3 py-1.5 text-xs border border-white/15 text-white/70 hover:text-white hover:border-white/40"
                >Edit</button>
                <button onClick={() => remove(c)}
                  className="px-3 py-1.5 text-xs border border-red-400/30 text-red-300/80 hover:text-red-200 hover:border-red-400/60"
                >Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RepairCategoryManager;
