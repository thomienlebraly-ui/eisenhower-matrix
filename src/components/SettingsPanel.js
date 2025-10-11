import React from 'react';
import { Settings, Save } from 'lucide-react';

const SettingsPanel = ({ defaultExportName, setDefaultExportName, onSaveToFile }) => {
  return (
    <div className="mt-8 bg-white rounded-xl shadow-lg border p-6">
      <div className="flex items-center gap-3 mb-4">
        <Settings className="text-gray-600" />
        <h2 className="text-2xl font-bold text-gray-800">Settings & Export</h2>
      </div>
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          Your tasks are automatically saved in your browser. To create a manual backup, you can save your data to a file.
        </p>
        <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
          <label htmlFor="exportName" className="text-sm font-medium text-gray-700">Default Export Filename:</label>
          <input 
            id="exportName"
            type="text" 
            value={defaultExportName}
            onChange={(e) => setDefaultExportName(e.target.value)}
            className="flex-grow px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button onClick={onSaveToFile} className="flex items-center gap-2 text-sm bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">
            <Save size={16} /> Save to File
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;