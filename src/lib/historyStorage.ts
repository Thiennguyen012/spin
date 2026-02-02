// Save spin history to localStorage and support exporting to file

interface SpinRecord {
  number: number;
  timestamp: string;
  date: Date;
}

interface SpinHistory {
  records: SpinRecord[];
  minRange: number;
  maxRange: number;
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = 'lucky_spin_history';

/**
 * Save spin number to history (localStorage)
 */
export const saveSpinToHistory = (
  number: number,
  minRange: number,
  maxRange: number
): void => {
  try {
    const existing = localStorage.getItem(STORAGE_KEY);
    let history: SpinHistory;

    if (existing) {
      history = JSON.parse(existing);
    } else {
      history = {
        records: [],
        minRange,
        maxRange,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }

    // Add new record
    const newRecord: SpinRecord = {
      number,
      timestamp: new Date().toISOString(),
      date: new Date(),
    };

    history.records.push(newRecord);
    history.minRange = minRange;
    history.maxRange = maxRange;
    history.updatedAt = new Date().toISOString();

    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch (error) {
    console.error('Error saving spin to history:', error);
  }
};

/**
 * Get spin history from localStorage
 */
export const getSpinHistory = (): SpinHistory | null => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error retrieving spin history:', error);
    return null;
  }
};

/**
 * Clear all spin history
 */
export const clearSpinHistory = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing spin history:', error);
  }
};

/**
 * Export history as JSON file
 */
export const exportHistoryAsJSON = (): void => {
  try {
    const history = getSpinHistory();
    if (!history || history.records.length === 0) {
      alert('No spin history to export!');
      return;
    }

    // Prepare export data
    const exportData = {
      ...history,
      records: history.records.map((record) => ({
        ...record,
        date: record.timestamp,
      })),
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);

    // Create download link
    const link = document.createElement('a');
    link.href = url;
    link.download = `lucky_spin_history_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting history:', error);
    alert('Error exporting history!');
  }
};

/**
 * Export history as CSV file
 */
export const exportHistoryAsCSV = (): void => {
  try {
    const history = getSpinHistory();
    if (!history || history.records.length === 0) {
      alert('No spin history to export!');
      return;
    }

    // Create CSV content
    const headers = ['Order', 'Number', 'Time'];
    const rows = history.records.map((record, index) => [
      index + 1,
      record.number,
      new Date(record.timestamp).toLocaleString('en-US'),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.join(',')),
    ].join('\n');

    const dataBlob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(dataBlob);

    // Create download link
    const link = document.createElement('a');
    link.href = url;
    link.download = `lucky_spin_history_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting history as CSV:', error);
    alert('Error exporting history!');
  }
};

/**
 * Get total spin count
 */
export const getSpinCount = (): number => {
  const history = getSpinHistory();
  return history?.records.length ?? 0;
};
