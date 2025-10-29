import { useEffect, useMemo, useState } from 'react';
import http from '../services/http';

// Parse value like "hoc_ky_1-2025" into { hoc_ky, year, nam_hoc }
function parseSemesterValue(value) {
  if (!value || !/^hoc_ky_[12]-\d{4}$/.test(value)) return null;
  const [hoc_ky, y] = value.split('-');
  const year = parseInt(y, 10);
  const nam_hoc = hoc_ky === 'hoc_ky_1' ? `${year}-${year + 1}` : `${year - 1}-${year}`;
  return { hoc_ky, year, nam_hoc };
}

// Determine if writable given state object from backend
function computeWritable(stateObj, value) {
  if (!stateObj) return true; // if unknown, do not block FE (BE will still enforce)
  const globalActive = stateObj?.semester && (`${stateObj.semester.semester}-${stateObj.semester.year}` === value);
  if (globalActive) return true;
  const st = stateObj?.state?.state;
  if (!st) return true;
  if (st === 'ACTIVE' || st === 'CLOSING') return true;
  if (st === 'LOCKED_SOFT' || st === 'LOCKED_HARD' || st === 'ARCHIVED') return false;
  return true;
}

export default function useSemesterGuard(semesterValue) {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const parsed = useMemo(() => parseSemesterValue(semesterValue), [semesterValue]);

  useEffect(() => {
    let mounted = true;
    async function load() {
      if (!parsed) { setStatus(null); return; }
      try {
        setLoading(true);
        setError('');
        const res = await http.get('/semesters/status', { params: { semester: semesterValue } });
        const data = res?.data?.data || null;
        if (mounted) setStatus(data);
      } catch (e) {
        if (mounted) {
          setError(e?.response?.data?.message || 'Không tải được trạng thái học kỳ');
          setStatus(null);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [semesterValue, parsed?.hoc_ky, parsed?.nam_hoc]);

  const isWritable = useMemo(() => computeWritable(status, semesterValue), [status, semesterValue]);

  return { status, isWritable, loading, error };
}


